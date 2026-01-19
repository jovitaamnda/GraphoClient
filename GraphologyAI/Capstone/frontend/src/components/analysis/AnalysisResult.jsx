"use client";

import { motion } from "framer-motion";
import { Download, Share2, FileText } from "lucide-react";
import { useState } from "react";

export default function AnalysisResult({ analysis }) {
  const { personalityType, traits, description } = analysis;
  const [exportFormat, setExportFormat] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const traitsList = Object.entries(traits || {}).map(([key, value]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        `Graphology Analysis Result\n\nPersonality Type: ${personalityType}\n\n${description}\n\nTraits:\n${traitsList.map((t) => `${t.label}: ${t.value}%`).join("\n")}`,
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = "analysis-result.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      const { jsPDF } = await import("jspdf");
      
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFontSize(24);
      doc.setTextColor(88, 28, 135); // Purple color
      doc.text("Graphology Analysis Result", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 15;

      // Personality Type
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`Personality Type: ${personalityType}`, 20, yPosition);
      yPosition += 10;

      // Description
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      const descriptionLines = doc.splitTextToSize(description, pageWidth - 40);
      doc.text(descriptionLines, 20, yPosition);
      yPosition += descriptionLines.length * 5 + 10;

      // Traits Section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Your Traits", 20, yPosition);
      yPosition += 8;

      // Traits List
      doc.setFontSize(11);
      traitsList.forEach((trait) => {
        const barWidth = (trait.value / 100) * 100; // 100mm width for bar
        
        // Trait name and value
        doc.setTextColor(0, 0, 0);
        doc.text(`${trait.label}:`, 20, yPosition);
        doc.text(`${trait.value}%`, pageWidth - 30, yPosition, { align: "right" });

        // Progress bar background
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(220, 220, 220);
        doc.rect(20, yPosition + 2, 100, 3, "F");

        // Progress bar fill (gradient effect using colors)
        doc.setFillColor(168, 85, 247); // Purple
        doc.rect(20, yPosition + 2, barWidth, 3, "F");

        yPosition += 8;
      });

      yPosition += 10;

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      doc.save("analysis-result.pdf");
      setIsExporting(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Personality Type Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {personalityType}
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed">{description}</p>
      </div>

      {/* Traits Display */}
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Traits</h3>
        <div className="space-y-4">
          {traitsList.map((trait, index) => (
            <motion.div
              key={trait.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">
                  {trait.label}
                </span>
                <span className="text-purple-600 font-bold">{trait.value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${trait.value}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadPdf}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText size={20} />
          {isExporting ? "Generating..." : "PDF"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadTxt}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 font-semibold rounded-2xl transition"
        >
          <Download size={20} />
          TXT
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-100 hover:bg-purple-200 text-purple-600 font-semibold rounded-2xl transition"
        >
          <Share2 size={20} />
          Share
        </motion.button>
      </div>
    </motion.div>
  );
}
