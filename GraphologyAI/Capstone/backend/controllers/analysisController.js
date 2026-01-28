const analysisService = require("../services/analysisService");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// @route   POST /api/analysis/upload
// @desc    Upload dan analyze image
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    // Get userId from authenticated user (from auth middleware)
    const userId = req.user._id;
    console.log("[Upload Debug] req.file:", req.file);
    // console.log("[Upload Debug] req.body.imageData type:", typeof req.body.imageData); 

    // Prioritize Base64 from body if available
    let imageData;
    if (req.body.imageData && typeof req.body.imageData === 'string' && req.body.imageData.startsWith('data:image')) {
      imageData = req.body.imageData;
      console.log("[Upload Debug] Using Base64 from req.body");
    } else {
      imageData = req.file ? req.file.path : req.body.imageData;
      console.log("[Upload Debug] Using file path or raw body");
    }

    if (!imageData) {
      return res.status(400).json({ message: "Image data required" });
    }

    const analysis = await analysisService.analyzeHandwriting(
      userId,
      imageData,
      "image"
    );

    res.status(201).json({
      message: "Analysis completed successfully",
      analysis,
    });
  } catch (error) {
    console.error("[Upload Error]", error);
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/analysis/:analysisId/pdf
// @desc    Download Analysis PDF
// @access  Private
exports.generatePDF = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysis = await analysisService.getAnalysis(analysisId);

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `Analysis_Result_${analysisId}.pdf`;

    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    doc.pipe(res);

    // --- LOGOS ---
    const logoLeft = path.join(__dirname, "../assets/images/grapholyze_logo.png");
    const logoRight = path.join(__dirname, "../assets/images/trisakti_logo.png");

    if (fs.existsSync(logoLeft)) {
      doc.image(logoLeft, 50, 40, { width: 150 });
    }
    if (fs.existsSync(logoRight)) {
      doc.image(logoRight, 470, 35, { width: 80, align: 'right' });
    }

    // --- CENTERED HEADER ---
    doc.moveDown(5);
    doc.font("Helvetica").fontSize(10).text("A Research Collaboration Project", { align: "center" });

    // Line below "Project"
    const lineY = doc.y + 5;
    doc.moveTo(100, lineY).lineTo(495, lineY).lineWidth(0.5).stroke();

    // --- TITLE "LAPORAN HASIL ANALYSIS" ---
    doc.moveDown(3);
    doc.font("Helvetica-Bold").fontSize(12).text("LAPORAN HASIL ANALYSIS", { align: "left" });

    doc.moveDown(2);

    // --- DATA UTAMA (TIPE & SCORE) ---
    // Tipe Kepribadian
    doc.font("Helvetica-Bold").fontSize(10).text("Tipe Kepribadian:");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(11).text(`${analysis.enneagramType || '-'} (${analysis.personalityType || '-'})`);

    doc.moveDown(2);

    // AI Confidence Score
    doc.font("Helvetica-Bold").fontSize(10).text("AI Confidence Score:");
    doc.moveDown(0.3);
    const confPercent = analysis.aiConfidence > 1 ? analysis.aiConfidence : (analysis.aiConfidence * 100).toFixed(0);
    doc.font("Helvetica").fontSize(11).text(`${confPercent}%`);

    doc.moveDown(3);

    // --- TABLE: Analisis Fitur Grafologi ---
    // Centered Title
    doc.font("Helvetica-Bold").fontSize(10).text("Analisis Fitur Grafologi", { align: "center" });
    doc.moveDown(1);

    // Table Config
    const tableTop = doc.y;
    const tableWidth = 450;
    const tableLeft = (595 - tableWidth) / 2; // Centered table

    // New Column Structure: Responbilitas | Analisis | Kepribadian
    const colWidths = [120, 100, 230]; // Total 450
    const col1 = tableLeft;
    const col2 = col1 + colWidths[0];
    const col3 = col2 + colWidths[1];

    // Header Row
    const headerHeight = 25;
    doc.lineWidth(1);

    // Outer border top
    doc.moveTo(tableLeft, tableTop).lineTo(tableLeft + tableWidth, tableTop).stroke();

    // Vertical lines for Header
    doc.moveTo(col1, tableTop).lineTo(col1, tableTop + headerHeight).stroke();
    doc.moveTo(col2, tableTop).lineTo(col2, tableTop + headerHeight).stroke();
    doc.moveTo(col3, tableTop).lineTo(col3, tableTop + headerHeight).stroke();
    doc.moveTo(col3 + colWidths[2], tableTop).lineTo(col3 + colWidths[2], tableTop + headerHeight).stroke();

    // Header Text
    doc.fontSize(9).font("Helvetica-Bold");
    const textY = tableTop + 8;
    doc.text("Responbilitas", col1 + 5, textY);
    doc.text("Analisis", col2 + 5, textY);
    doc.text("Kepribadian", col3 + 5, textY);

    // Header Bottom Line
    doc.moveTo(tableLeft, tableTop + headerHeight).lineTo(tableLeft + tableWidth, tableTop + headerHeight).stroke();

    // Rows
    let currentY = tableTop + headerHeight;
    const traits = analysis.traits || {};
    const traitKeys = Object.keys(traits);

    // Label Map
    const labelMap = {
      slant: "Slant",
      size: "Size",
      pressure: "Pressure",
      baseline: "Baseline"
    };

    const drawRow = (c1, c2, c3) => {
      const rowHeight = 35; // Increased height for wrapping text in Kepribadian

      // Vertical lines
      doc.moveTo(col1, currentY).lineTo(col1, currentY + rowHeight).stroke();
      doc.moveTo(col2, currentY).lineTo(col2, currentY + rowHeight).stroke();
      doc.moveTo(col3, currentY).lineTo(col3, currentY + rowHeight).stroke();
      doc.moveTo(col3 + colWidths[2], currentY).lineTo(col3 + colWidths[2], currentY + rowHeight).stroke();

      // Content
      doc.font("Helvetica").fontSize(9);
      doc.text(c1, col1 + 5, currentY + 10, { width: colWidths[0] - 10, ellipsis: true });
      doc.text(c2, col2 + 5, currentY + 10, { width: colWidths[1] - 10, ellipsis: true });
      // c3 is Meaning now
      doc.text(c3, col3 + 5, currentY + 5, { width: colWidths[2] - 10, height: rowHeight - 10, ellipsis: true });

      // Bottom line
      doc.moveTo(tableLeft, currentY + rowHeight).lineTo(tableLeft + tableWidth, currentY + rowHeight).stroke();

      currentY += rowHeight;
    };

    if (traitKeys.length > 0) {
      traitKeys.forEach(key => {
        if (key === '$init' || typeof traits[key] !== 'object') return;
        const t = traits[key];
        const label = labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);

        // Map meaning to 3rd column
        drawRow(label, t.val || "-", t.meaning || "-");
      });
    } else {
      // Empty rows if no data
      drawRow("-", "-", "-");
      drawRow("-", "-", "-");
      drawRow("-", "-", "-");
      drawRow("-", "-", "-");
    }

    doc.moveDown(3);

    // --- REKOMENDASI ---
    // Make sure we are below table
    doc.y = currentY + 40;

    doc.font("Helvetica-Bold").fontSize(12).text("Rekomendasi Pengembangan Diri:");
    doc.moveDown(1);
    doc.font("Helvetica").fontSize(10);

    // Check recommendations array
    const recs = analysis.recommendations || [];
    if (recs.length > 0) {
      recs.forEach((r, i) => {
        doc.text(`${i + 1}. ${r}`);
        doc.moveDown(0.5);
      });
    } else {
      doc.text(analysis.description || "No specific recommendations.");
    }

    // --- FOOTER ---
    const footerY = 780;
    doc.fontSize(8).font("Helvetica").text("Generated by Grapholyze Capstone AI Engine | 2026", 50, footerY, { align: "center", width: 500 });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat PDF" });
  }
};

// @route   POST /api/analysis/canvas
// @desc    Analyze canvas drawing
// @access  Private
exports.analyzeCanvas = async (req, res) => {
  try {
    // Get userId from authenticated user
    const userId = req.user._id;
    const { canvasData } = req.body;

    if (!canvasData) {
      return res.status(400).json({ message: "Canvas data required" });
    }

    const analysis = await analysisService.analyzeHandwriting(
      userId,
      canvasData,
      "canvas"
    );

    res.status(201).json({
      message: "Analysis completed successfully",
      analysis,
    });
  } catch (error) {
    console.error("[Canvas Error]", error);
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/analysis/:analysisId
// @desc    Get single analysis result
// @access  Private
exports.getAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.params;

    const analysis = await analysisService.getAnalysis(analysisId);

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    res.status(200).json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/analysis/history/:userId
// @desc    Get user's analysis history
// @access  Private
exports.getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const history = await analysisService.getUserAnalysisHistory(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/analysis/:analysisId
// @desc    Delete analysis
// @access  Private
exports.deleteAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.params;

    await analysisService.deleteAnalysis(analysisId);

    res.status(200).json({ message: "Analysis deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/admin/analyses
// @desc    Get all analyses (admin only)
// @access  Private/Admin
exports.getAllAnalyses = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const analyses = await analysisService.getAllAnalyses(
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json(analyses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/admin/analysis-stats
// @desc    Get analysis statistics (admin only)
// @access  Private/Admin
exports.getStatistics = async (req, res) => {
  try {
    const stats = await analysisService.getStatistics();

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
