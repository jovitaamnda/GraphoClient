const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Analysis = require("../models/Analysis");

/**
 * --- KAMUS DATA ILMIAH (KNOWLEDGE BASE) ---
 * UPDATE: Menambahkan field 'recommendations' untuk setiap tipe.
 */
const ENNEAGRAM_KNOWLEDGE_BASE = {
  'Tipe 1': {
    name: "The Perfectionist (Perfeksionis)",
    desc: "Berdasarkan pola tekanan, keteraturan, dan konsistensi tulisan tangan, analisis menunjukkan kecenderungan pribadi yang disiplin, terstruktur, serta memiliki standar tinggi terhadap diri sendiri maupun lingkungan sekitar.\n\nStabilitas Emosional: Anda cenderung mampu mengendalikan emosi dan mengambil keputusan secara rasional. Dalam situasi sulit, Anda lebih memilih mencari solusi dibanding bereaksi secara impulsif.\n\nOrientasi pada Detail: Bentuk tulisan yang rapi dan konsisten mencerminkan perhatian tinggi terhadap detail, kualitas pekerjaan, serta keinginan untuk menghasilkan sesuatu secara sempurna.\n\nIntegritas & Tanggung Jawab: Anda memiliki komitmen yang kuat terhadap aturan, nilai, dan tanggung jawab sehingga sering dipercaya untuk menyelesaikan tugas penting.",
    features: {
      slant: { val: "Vertical (Tegak)", meaning: "Stabilitas Emosional: Anda cenderung mampu mengendalikan emosi dan mengambil keputusan secara rasional." },
      size: { val: "Small (Kecil)", meaning: "Orientasi pada Detail: Bentuk tulisan yang rapi dan konsisten mencerminkan perhatian tinggi terhadap detail." },
      pressure: { val: "Medium/Light", meaning: "Integritas & Tanggung Jawab: Anda memiliki komitmen kuat terhadap aturan dan nilai." },
      baseline: { val: "Straight (Lurus)", meaning: "Konsistensi dalam tindakan dan kemampuan menyelesaikan tugas penting." }
    },
    recommendations: [
      "Pertahankan standar tinggi Anda, tapi beri ruang untuk fleksibilitas.",
      "Berlatih menerima ketidaksempurnaan sebagai bagian dari proses.",
      "Gunakan disiplin Anda untuk membuat kemajuan tanpa merasa terlalu keras pada diri sendiri."
    ]
  },
  'Tipe 2': {
    name: "The Helper (Penolong)",
    desc: "Berdasarkan karakteristik tulisan tangan, Anda menunjukkan kecenderungan sebagai pribadi yang hangat, mudah berempati, dan senang membangun hubungan yang bermakna dengan orang lain.\n\nKepedulian Sosial: Anda memiliki kemampuan memahami kebutuhan orang lain dan sering memberikan dukungan tanpa diminta.\n\nHubungan Interpersonal: Tulisan yang terbuka dan mengalir menggambarkan pribadi yang mudah beradaptasi serta nyaman bekerja dalam lingkungan sosial.\n\nKeinginan Memberi Manfaat: Anda merasa puas ketika dapat membantu atau memberikan dampak positif bagi orang di sekitar.",
    features: {
      slant: { val: "Rightward (Miring Kanan)", meaning: "Kepedulian Sosial: Anda memahami kebutuhan orang lain dan sering memberikan dukungan tanpa diminta." },
      size: { val: "Medium/Rounded", meaning: "Hubungan Interpersonal: Tulisan terbuka menunjukkan kenyamanan dalam lingkungan sosial." },
      pressure: { val: "Medium", meaning: "Keinginan Memberi Manfaat: Anda aktif mencari cara untuk membantu orang di sekitar." },
      baseline: { val: "Upward/Flexible", meaning: "Sifat suportif dan adaptif dalam interaksi sosial." }
    },
    recommendations: [
      "Tetapkan batasan sehat agar energi Anda tetap stabil.",
      "Berikan waktu untuk memenuhi kebutuhan diri Anda sendiri.",
      "Ingat bahwa membantu orang lain tidak harus mengorbankan kesejahteraan Anda."
    ]
  },
  'Tipe 3': {
    name: "The Achiever (Pencapai)",
    desc: "Analisis menunjukkan kecenderungan pribadi yang berorientasi pada tujuan, produktif, dan memiliki motivasi tinggi untuk mencapai keberhasilan.\n\nMotivasi Berprestasi: Anda senang menetapkan target dan berusaha mencapainya dengan strategi yang terukur.\n\nAdaptabilitas Tinggi: Anda mampu menyesuaikan diri dengan berbagai situasi dan tetap menjaga performa dalam tekanan.\n\nFokus pada Hasil: Anda lebih memilih tindakan yang efektif dan efisien untuk mencapai tujuan yang telah ditetapkan.",
    features: {
      slant: { val: "Vertical/Right", meaning: "Motivasi Berprestasi: Anda senang menetapkan target dan bekerja dengan strategi terukur." },
      size: { val: "Large (Besar)", meaning: "Fokus pada Hasil: Tulisan yang jelas menunjukkan keinginan kuat untuk mencapai tujuan." },
      pressure: { val: "Heavy (Tebal)", meaning: "Daya Kerja Tinggi: Energi Anda mendukung tindakan yang efektif dan produktif." },
      baseline: { val: "Ascending (Naik)", meaning: "Adaptabilitas Tinggi: Anda mampu menyesuaikan diri dengan tekanan sambil tetap menjaga performa." }
    },
    recommendations: [
      "Berikan waktu istirahat untuk memperbarui energi Anda.",
      "Tetap jujur pada diri sendiri tentang motivasi yang mendorong Anda.",
      "Fokus pada kualitas hasil, bukan hanya kuantitas pencapaian."
    ]
  },
  'Tipe 4': {
    name: "The Individualist (Individualis)",
    desc: "Karakter tulisan menunjukkan kecenderungan pribadi yang kreatif, reflektif, dan memiliki cara pandang yang unik terhadap kehidupan.\n\nEkspresi Diri: Anda nyaman mengekspresikan ide, perasaan, dan identitas pribadi melalui berbagai bentuk kreativitas.\n\nKedalaman Emosi: Anda mampu memahami emosi secara mendalam dan sering melakukan refleksi terhadap pengalaman hidup.\n\nOrisinalitas: Anda menghargai keunikan dan lebih suka menciptakan sesuatu yang berbeda daripada mengikuti kebiasaan umum.",
    features: {
      slant: { val: "Left/Variable", meaning: "Ekspresi Diri: Anda nyaman menyalurkan perasaan lewat kreativitas." },
      size: { val: "Variable", meaning: "Orisinalitas: Bentuk tulisan yang unik menunjukkan penghargaan pada keunikan." },
      pressure: { val: "Light (Tipis)", meaning: "Kedalaman Emosi: Anda sering merasakan perasaan secara intens dan reflektif." },
      baseline: { val: "Wavy (Bergelombang)", meaning: "Kreativitas yang mengalir dan sensitif terhadap suasana hati." }
    },
    recommendations: [
      "Ekspresikan ide Anda tanpa takut berbeda.",
      "Jaga keseimbangan antara refleksi dan tindakan nyata.",
      "Gunakan kreativitas untuk menciptakan makna, bukan hanya untuk melarikan diri." 
    ]
  },
  'Tipe 5': {
    name: "The Investigator (Pengamat)",
    desc: "Berdasarkan pola tekanan, tarikan garis, dan kemiringan tulisan tangan, analisis menunjukkan kecenderungan intelektual yang kuat, pemikiran yang mendalam, serta kebutuhan akan ruang pribadi dan kemandirian emosional.\n\nStabilitas Emosional: Tekanan pena yang konsisten menunjukkan pengendalian emosi yang baik. Anda cenderung tenang dalam situasi krisis.\n\nKetajaman Fokus: Ukuran huruf yang kecil dan rapat mencerminkan kemampuan konsentrasi yang mendalam pada detail teknis maupun teoritis.\n\nKemandirian Tinggi: Kemiringan tulisan yang tegak mengindikasikan bahwa Anda lebih nyaman mengambil keputusan secara mandiri dan tidak mudah dipengaruhi opini luar.",
    features: {
      slant: { val: "Vertical/Left", meaning: "Stabilitas Emosional: Tekanan pena yang konsisten menunjukkan kontrol diri yang kuat." },
      size: { val: "Small/Micro", meaning: "Ketajaman Fokus: Ukuran tulisan kecil mencerminkan konsentrasi mendalam." },
      pressure: { val: "Light", meaning: "Kemandirian Tinggi: Anda cenderung mengambil keputusan secara mandiri." },
      baseline: { val: "Straight", meaning: "Kedalaman pemikiran dan kecenderungan analitis yang kuat." }
    },
    recommendations: [
      "Luangkan waktu untuk berinteraksi sosial meski Anda lebih nyaman menyendiri.",
      "Jangan biarkan analisis berlebihan menghalangi tindakan.",
      "Gunakan keingintahuan Anda untuk mengembangkan hubungan yang bermakna." 
    ]
  },
  'Tipe 6': {
    name: "The Loyalist (Pecinta Setia)",
    desc: "Analisis menunjukkan kecenderungan pribadi yang bertanggung jawab, berhati-hati, serta memiliki komitmen tinggi terhadap keamanan dan kepercayaan.\n\nPerencanaan Matang: Anda cenderung mempertimbangkan berbagai kemungkinan sebelum mengambil keputusan penting.\n\nLoyalitas Tinggi: Anda menghargai hubungan yang dibangun atas dasar kepercayaan dan konsistensi.\n\nKesiapan Menghadapi Risiko: Anda terbiasa membuat antisipasi sehingga mampu menghadapi perubahan dengan persiapan yang lebih baik.",
    features: {
      slant: { val: "Left/Vertical", meaning: "Perencanaan Matang: Anda mempertimbangkan banyak kemungkinan sebelum bertindak." },
      size: { val: "Small/Compressed", meaning: "Loyalitas Tinggi: Tulisan kompak mencerminkan rasa tanggung jawab dan konsistensi." },
      pressure: { val: "Medium/Varied", meaning: "Kesiapan Menghadapi Risiko: Anda cenderung mempersiapkan diri dengan seksama." },
      baseline: { val: "Straight", meaning: "Kebutuhan struktur dan keamanan dalam pengambilan keputusan." }
    },
    recommendations: [
      "Percayai diri Anda sendiri dan kurangi kecemasan berlebihan.",
      "Gunakan kewaspadaan sebagai alat, bukan sebagai beban.",
      "Fokus pada solusi yang dapat memperkuat rasa aman Anda."
    ]
  },
  'Tipe 7': {
    name: "The Enthusiast (Antusias)",
    desc: "Karakter tulisan mencerminkan pribadi yang optimis, energik, dan memiliki rasa ingin tahu yang tinggi terhadap berbagai pengalaman baru.\n\nSemangat Eksplorasi: Anda menikmati tantangan baru dan mudah tertarik pada berbagai ide maupun aktivitas yang menarik.\n\nFleksibilitas Berpikir: Anda mampu melihat berbagai kemungkinan solusi dan cepat beradaptasi dengan perubahan.\n\nEnergi Positif: Anda membawa antusiasme yang dapat memotivasi orang lain dalam lingkungan sekitar.",
    features: {
      slant: { val: "Rightward (Miring Kanan)", meaning: "Semangat Eksplorasi: Anda menikmati tantangan dan pengalaman baru." },
      size: { val: "Large", meaning: "Fleksibilitas Berpikir: Tulisan luas menunjukkan kemampuan melihat berbagai kemungkinan." },
      pressure: { val: "Heavy/Fast", meaning: "Energi Positif: Anda membawa antusiasme yang menular." },
      baseline: { val: "Ascending", meaning: "Respons spontan dan optimisme terhadap perubahan." }
    },
    recommendations: [
      "Salurkan energi Anda ke dalam satu proyek sebelum beralih hal lain.",
      "Ambil jeda untuk menyegarkan pikiran dan menjaga fokus.",
      "Ingat bahwa ketenangan dapat membuat ide Anda lebih tahan lama." 
    ]
  },
  'Tipe 8': {
    name: "The Challenger (Penantang)",
    desc: "Analisis menunjukkan kecenderungan pribadi yang percaya diri, tegas, dan memiliki dorongan kuat untuk memimpin serta melindungi orang lain.\n\nKepercayaan Diri: Tulisan yang tegas menggambarkan keyakinan tinggi terhadap kemampuan diri dalam mengambil keputusan.\n\nKetegasan Sikap: Anda mampu menyampaikan pendapat secara langsung dan tidak ragu menghadapi tantangan.\n\nJiwa Kepemimpinan: Anda nyaman mengambil tanggung jawab dan berinisiatif mengarahkan suatu tim menuju tujuan bersama.",
    features: {
      slant: { val: "Right/Vertical", meaning: "Kepercayaan Diri: Tulisan tegas mencerminkan keyakinan kuat terhadap kemampuan diri." },
      size: { val: "Large", meaning: "Jiwa Kepemimpinan: Anda nyaman memimpin dan mengambil tanggung jawab." },
      pressure: { val: "Heavy (Tebal)", meaning: "Ketegasan Sikap: Tulisan kuat menunjukkan keberanian dan otoritas." },
      baseline: { val: "Ascending/Firm", meaning: "Dorongan untuk bertindak cepat dan tegas dalam menghadapi tantangan." }
    },
    recommendations: [
      "Gunakan pengaruh Anda untuk melindungi dan memberdayakan orang lain.",
      "Tunjukkan sisi rentan Anda agar hubungan menjadi lebih erat.",
      "Dengarkan sudut pandang lain sebelum menentukan arah."
    ]
  },
  'Tipe 9': {
    name: "The Peacemaker (Pendamai)",
    desc: "Berdasarkan pola tulisan tangan, Anda menunjukkan kecenderungan pribadi yang tenang, mudah beradaptasi, dan mengutamakan keharmonisan dalam hubungan sosial.\n\nKetenangan Emosional: Anda cenderung menjaga keseimbangan emosi dan menghindari konflik yang tidak diperlukan.\n\nKemampuan Menyatukan: Anda mampu melihat berbagai sudut pandang sehingga sering menjadi penengah dalam suatu kelompok.\n\nSikap Fleksibel: Anda mudah menyesuaikan diri dengan lingkungan dan menghargai kerja sama demi mencapai tujuan bersama.",
    features: {
      slant: { val: "Vertical/Round", meaning: "Ketenangan Emosional: Anda menjaga keseimbangan dan menghindari konflik yang tidak perlu." },
      size: { val: "Medium/Rounded", meaning: "Kemampuan Menyatukan: Tulisan Anda mencerminkan fleksibilitas dan toleransi." },
      pressure: { val: "Light/Medium", meaning: "Sikap Fleksibel: Anda lebih memilih harmoni ketimbang konfrontasi." },
      baseline: { val: "Straight/Wavy", meaning: "Kesesuaian dengan keadaan dan kemampuan untuk beradaptasi." }
    },
    recommendations: [
      "Beranilah menyuarakan pikiran Anda dengan cara yang tenang.",
      "Jangan tunda keputusan penting demi rasa nyaman sementara.",
      "Gunakan kemampuanmu untuk menciptakan kedamaian yang sehat."
    ]
  }
};

class AnalysisService {

  // ... (Bagian atas sama seperti aslinya)

  static async analyzeHandwriting(userId, imageData, analysisType) {
    const analysis = new Analysis({
      userId,
      analysisType,
      imageUrl: analysisType === "image" ? imageData : null,
      status: "pending",
    });

    await analysis.save();

    try {
      // 2. Panggil AI Flask Server
      const aiResult = await this.callFlaskAI(imageData, analysisType);

      // 3. Ambil Detail dari Knowledge Base
      const knowledge = ENNEAGRAM_KNOWLEDGE_BASE[aiResult.enneagramType];

      if (!knowledge) {
        throw new Error(`Tipe tidak dikenali: ${aiResult.enneagramType}`);
      }

      // 4. Update Analysis Record
      analysis.personalityType = knowledge.name;
      analysis.enneagramType = aiResult.enneagramType;
      analysis.description = knowledge.desc;

      // ✅ Simpan Traits
      analysis.traits = knowledge.features;

      // ✅ UPDATE BARU: Simpan Rekomendasi sesuai Tipe
      analysis.recommendations = knowledge.recommendations;

      analysis.confidence = aiResult.confidence;

      analysis.status = "completed";
      await analysis.save();

      console.log(`[Service] Analisis Sukses User ${userId}: ${aiResult.enneagramType}`);
      return analysis;

    } catch (aiError) {
      console.error(`[Service Error] AI Gagal: ${aiError.message}`);

      // --- NO MOCK DATA FALLBACK ---
      // Update status to failed and save error message
      analysis.status = "failed";
      analysis.errorMessage = `AI Error: ${aiError.message}`;

      await analysis.save();

      // Throw error back to controller to send error response
      throw new Error(`AI Service Failed: ${aiError.message}`);
    }
  }

  // ... (Sisa kode ke bawah sama persis dengan aslinya: callFlaskAI, getMockAnalysisResult, CRUD Helpers)
  // Pastikan metode statis lain (callFlaskAI, dll) tetap ada di sini sesuai kode aslimu.

  static async callFlaskAI(imageData, analysisType) {
    // (Gunakan kode asli Anda disini)
    const aiUrl = process.env.FLASK_AI_URL;
    if (!aiUrl) throw new Error("FLASK_AI_URL belum disetting di .env");

    try {
      const form = new FormData();
      const isBase64 = typeof imageData === 'string' && imageData.startsWith('data:image');

      if (isBase64) {
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        form.append('file', buffer, { filename: 'canvas.png' });
      } else {
        if (!fs.existsSync(imageData)) throw new Error("File gambar tidak ditemukan");
        form.append('file', fs.createReadStream(imageData));
      }

      const response = await axios.post(aiUrl, form, {
        headers: { ...form.getHeaders() },
        timeout: 45000
      });

      const aiData = response.data;
      const rawPrediction = aiData.prediction || "Tipe 1";
      const cleanType = rawPrediction.split('(')[0].trim();

      let rawConf = aiData.confidence || 0;
      if (typeof rawConf === 'string') {
        rawConf = parseFloat(rawConf.replace('%', ''));
      }

      return {
        enneagramType: cleanType,
        confidence: rawConf
      };

    } catch (error) {
      throw new Error(error.message);
    }
  }



  // ... CRUD Lainnya tetap sama
  static async getUserAnalysisHistory(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const analyses = await Analysis.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Analysis.countDocuments({ userId });
    return { analyses, total, page, pages: Math.ceil(total / limit) };
  }

  static async getAnalysis(analysisId) {
    return await Analysis.findById(analysisId).populate("userId", "name email");
  }

  static async deleteAnalysis(analysisId) {
    return await Analysis.findByIdAndDelete(analysisId);
  }

  static async saveValidationResult(analysisId, userId, validationData) {
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) return null;
    if (!analysis.userId.equals(userId)) return null;

    analysis.validationResults = {
      answers: validationData.answers || [],
      triadScores: validationData.triadScores || { Gut: 0, Heart: 0, Head: 0 },
      completedAt: new Date()
    };

    await analysis.save();
    return analysis;
  }

  static async updateAnalysis(analysisId, updatedData) {
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) return null;

    if (updatedData.enneagramType && updatedData.enneagramType !== analysis.enneagramType) {
      const knowledge = ENNEAGRAM_KNOWLEDGE_BASE[updatedData.enneagramType];
      if (knowledge) {
        analysis.enneagramType = updatedData.enneagramType;
        analysis.personalityType = knowledge.name;
        analysis.description = knowledge.desc;
        analysis.traits = knowledge.features;
        analysis.recommendations = knowledge.recommendations;
      }
    }

    if (updatedData.confidence !== undefined) {
      analysis.confidence = parseFloat(updatedData.confidence);
    }

    if (updatedData.personalityType !== undefined) {
      analysis.personalityType = updatedData.personalityType;
    }

    await analysis.save();
    return analysis;
  }

  static async getAllAnalyses(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const analyses = await Analysis.find().populate("userId", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Analysis.countDocuments();
    return { analyses, total, page, pages: Math.ceil(total / limit) };
  }

  static async getStatistics() {
    const total = await Analysis.countDocuments();
    const success = await Analysis.countDocuments({ status: "completed" });
    const failed = await Analysis.countDocuments({ status: "failed" });
    const distribution = await Analysis.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: "$enneagramType", count: { $sum: 1 } } }
    ]);
    return { total, success, failed, distribution };
  }
}

module.exports = AnalysisService;