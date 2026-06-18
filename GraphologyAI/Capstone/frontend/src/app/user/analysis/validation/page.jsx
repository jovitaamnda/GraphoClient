"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { analysisApi } from "@/api/analysis";
import { enneagramDetails } from "@/constants/enneagramDetails";
import { CheckCircle, Activity, Brain, MessageSquare, Menu, FileText, Target, User, Search, Smile, Compass, Navigation, Fingerprint, BadgeCheck, ArrowUpFromLine, ArrowRightLeft, PersonStanding, Accessibility } from "lucide-react";

const questions = [
  // GUT TRIAD
  { id: 1, triad: "Gut", type: "Tipe 8", text: "Saya merasa perlu mengambil kendali dalam situasi yang tidak pasti agar sesuatu berjalan sesuai keinginan saya." },
  { id: 2, triad: "Gut", type: "Tipe 8", text: "Saya tidak segan menghadapi konflik secara langsung ketika saya merasa hak atau posisi saya terancam." },
  { id: 3, triad: "Gut", type: "Tipe 8", text: "Bagi saya, menunjukkan kelemahan kepada orang lain adalah sesuatu yang harus dihindari sebisa mungkin." },
  { id: 4, triad: "Gut", type: "Tipe 8", text: "Saya cenderung mendominasi percakapan atau situasi kelompok karena saya yakin pendapat saya paling tepat." },
  { id: 5, triad: "Gut", type: "Tipe 9", text: "Saya lebih memilih untuk mengalah atau diam daripada memulai perdebatan yang bisa merusak hubungan." },
  { id: 6, triad: "Gut", type: "Tipe 9", text: "Saya kesulitan menetapkan prioritas karena semua hal terasa sama pentingnya bagi saya." },
  { id: 7, triad: "Gut", type: "Tipe 9", text: "Saya mudah terbawa oleh agenda atau kebutuhan orang lain sehingga sering melupakan kebutuhan saya sendiri." },
  { id: 8, triad: "Gut", type: "Tipe 9", text: "Kehadiran saya dalam kelompok terasa menenangkan bagi orang lain, dan saya senang menjadi penengah." },
  { id: 9, triad: "Gut", type: "Tipe 1", text: "Saya memiliki standar yang sangat tinggi dan merasa frustrasi ketika orang lain tidak memenuhi standar tersebut." },
  { id: 10, triad: "Gut", type: "Tipe 1", text: "Ada suara kritis di dalam kepala saya yang selalu mengingatkan ketika saya atau orang lain melakukan kesalahan." },
  { id: 11, triad: "Gut", type: "Tipe 1", text: "Saya kesulitan bersantai karena selalu ada hal yang merasa belum selesai atau belum sempurna." },
  { id: 12, triad: "Gut", type: "Tipe 1", text: "Saya merasa bertanggung jawab untuk memperbaiki kesalahan yang saya lihat, bahkan jika itu bukan urusan saya." },

  // HEART TRIAD
  { id: 13, triad: "Heart", type: "Tipe 2", text: "Saya secara intuitif merasakan kebutuhan orang lain dan merasa terdorong untuk membantu bahkan sebelum diminta." },
  { id: 14, triad: "Heart", type: "Tipe 2", text: "Saya sering mendahulukan kebutuhan orang lain di atas kebutuhan saya sendiri, bahkan ketika saya kelelahan." },
  { id: 15, triad: "Heart", type: "Tipe 2", text: "Saya merasa sulit untuk meminta bantuan karena takut dianggap lemah atau menjadi beban orang lain." },
  { id: 16, triad: "Heart", type: "Tipe 2", text: "Saya mengubah cara saya berperilaku tergantung pada siapa yang sedang saya hadapi agar mereka menyukai saya." },
  { id: 17, triad: "Heart", type: "Tipe 3", text: "Saya sangat termotivasi untuk mencapai tujuan dan merasa tidak nyaman jika tidak produktif atau berprestasi." },
  { id: 18, triad: "Heart", type: "Tipe 3", text: "Saya sangat memperhatikan bagaimana saya terlihat di mata orang lain and berusaha menampilkan citra yang sukses." },
  { id: 19, triad: "Heart", type: "Tipe 3", text: "Saya mudah menyesuaikan diri dengan ekspektasi lingkungan untuk meningkatkan peluang sukses saya." },
  { id: 20, triad: "Heart", type: "Tipe 3", text: "Saya terkadang merasa tidak tahu siapa diri saya sebenarnya karena terbiasa menjadi apa yang diharapkan orang lain." },
  { id: 21, triad: "Heart", type: "Tipe 4", text: "Saya sering merasa bahwa ada sesuatu yang unik dan berbeda dalam diri saya yang tidak dimiliki orang lain." },
  { id: 22, triad: "Heart", type: "Tipe 4", text: "Saya mudah terlarut dalam perasaan yang mendalam dan sering merenungi pengalaman emosional saya." },
  { id: 23, triad: "Heart", type: "Tipe 4", text: "Saya merasa lebih nyaman mengekspresikan diri melalui seni, tulisan, atau cara kreatif lainnya." },
  { id: 24, triad: "Heart", type: "Tipe 4", text: "Saya sering merindukan sesuatu yang terasa hilang dalam hidup saya, meskipun saya tidak selalu tahu apa itu." },

  // HEAD TRIAD
  { id: 25, triad: "Head", type: "Tipe 5", text: "Saya lebih memilih mengamati dan menganalisis situasi sebelum mengambil tindakan atau mengekspresikan pendapat." },
  { id: 26, triad: "Head", type: "Tipe 5", text: "Saya sangat menghargai privasi dan waktu sendiri karena interaksi sosial yang berkepanjangan menguras energi saya." },
  { id: 27, triad: "Head", type: "Tipe 5", text: "Saya merasa lebih nyaman di dunia pikiran dan ide daripada di dunia perasaan dan hubungan interpersonal." },
  { id: 28, triad: "Head", type: "Tipe 5", text: "Saya khawatir kehabisan energi atau sumber daya jika terlalu banyak terlibat dengan tuntutan dunia luar." },
  { id: 29, triad: "Head", type: "Tipe 6", text: "Saya sering memikirkan skenario terburuk yang mungkin terjadi dan mempersiapkan diri untuk menghadapinya." },
  { id: 30, triad: "Head", type: "Tipe 6", text: "Saya sangat setia pada kelompok atau institusi yang saya percaya, dan merasa tidak nyaman ketika loyalitas itu dipertanyakan." },
  { id: 31, triad: "Head", type: "Tipe 6", text: "Saya cenderung meragukan motivasi orang lain dan butuh waktu lama untuk benar-benar mempercayai seseorang." },
  { id: 32, triad: "Head", type: "Tipe 6", text: "Ketika menghadapi keputusan penting, saya membutuhkan konfirmasi atau dukungan dari orang yang saya percaya." },
  { id: 33, triad: "Head", type: "Tipe 7", text: "Saya selalu bersemangat dengan ide-ide baru dan mudah berpindah dari satu proyek ke proyek lain yang terasa lebih menarik." },
  { id: 34, triad: "Head", type: "Tipe 7", text: "Saya merasa tidak nyaman ketika terjebak dalam rutinitas atau situasi yang membosankan dan membatasi." },
  { id: 35, triad: "Head", type: "Tipe 7", text: "Saya cenderung memiliki banyak rencana dan kemungkinan di masa depan yang membuat saya tetap bersemangat." },
  { id: 36, triad: "Head", type: "Tipe 7", text: "Saya cepat mengalihkan perhatian dari pengalaman negatif atau menyakitkan dengan mencari hal-hal yang menyenangkan." },
];

const triadLabels = {
  Gut: "Instinctive (Gut)",
  Heart: "Feeling (Heart)",
  Head: "Thinking (Head)",
};

const getTriadFromEnneagram = (enneagramType) => {
  if (!enneagramType) return null;

  const number = Number(enneagramType.replace(/[^0-9]/g, ""));
  if ([2, 3, 4].includes(number)) return "Heart";
  if ([5, 6, 7].includes(number)) return "Head";
  return "Gut";
};



export default function ValidationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams?.get("analysisId");

  const [analysisType, setAnalysisType] = useState(null);
  const [analysisTriad, setAnalysisTriad] = useState(null);
  const [analysisError, setAnalysisError] = useState("");
  const [answers, setAnswers] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState("");

  const filteredQuestions = useMemo(() => {
    if (!analysisTriad) {
      return questions;
    }
    return questions.filter((question) => question.triad === analysisTriad);
  }, [analysisTriad]);

  const current = filteredQuestions[index] || questions[0];
  const progress = Math.round(((index + 1) / filteredQuestions.length) * 100);

  const triadScores = useMemo(() => {
    return filteredQuestions.reduce(
      (acc, q, idx) => {
        const score = Number(answers[idx]) || 0;
        acc[q.triad] += score;
        return acc;
      },
      { Gut: 0, Heart: 0, Head: 0 }
    );
  }, [answers, filteredQuestions]);

  const strongestTriad = useMemo(() => {
    const entries = Object.entries(triadScores);
    const maxScore = Math.max(...entries.map(([_, score]) => score));
    return entries.filter(([_, score]) => score === maxScore).map(([triad]) => triad).join(" / ");
  }, [triadScores]);

  useEffect(() => {
    const testType = searchParams?.get("testType");
    
    if (testType) {
      const triad = getTriadFromEnneagram(testType);
      setAnalysisType(testType);
      setAnalysisTriad(triad);
      const baseQuestions = questions.filter((question) => question.triad === triad);
      setAnswers(Array(baseQuestions.length).fill(null));
      setIndex(0);
      return;
    }

    if (!analysisId) {
      setAnalysisError("Analysis ID tidak ditemukan. Silakan kembali ke halaman hasil untuk memulai validasi ulang.");
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const analysis = await analysisApi.getDetail(analysisId);
        setAnalysisData(analysis);
        const ennType = analysis.enneagramType || analysis.type || null;
        const triad = getTriadFromEnneagram(ennType);
        setAnalysisType(ennType);
        setAnalysisTriad(triad);

        const baseQuestions = questions.filter((question) => question.triad === triad);
        setAnswers(Array(baseQuestions.length).fill(null));
        setIndex(0);
      } catch (err) {
        setAnalysisError("Gagal memuat data analisis. Pastikan kamu membuka validasi dari halaman hasil.");
      }
    };

    fetchAnalysis();
  }, [analysisId, searchParams]);

  const handleSelect = (score) => {
    const copy = [...answers];
    copy[index] = score;
    setAnswers(copy);
  };

  const next = () => {
    if (index < filteredQuestions.length - 1) setIndex(index + 1);
  };

  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleFinish = async () => {
    if (!analysisTriad) {
      setError("Data analisis belum dimuat. Silakan kembali ke halaman hasil untuk memulai validasi ulang.");
      return;
    }

    if (answers.some((answer) => answer === null)) {
      setError("Silakan jawab semua pertanyaan sebelum menyelesaikan validasi.");
      return;
    }

    setError("");
    setLoading(true);

    if (!analysisId) {
      // Mode testing tanpa backend
      setTimeout(() => {
        setSaved(true);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      await analysisApi.saveValidationResult(analysisId, {
        triadScores,
        answers,
      });
      setSaved(true);
    } catch (err) {
      setError("Gagal menyimpan hasil validasi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/user/analysis?analysisId=${analysisId ?? ""}`);
  };

  if (saved) {
    const fallbackType = analysisType || "Tipe 9";
    const detail = enneagramDetails[fallbackType] || enneagramDetails["Tipe 9"];
    
    // Safely extract graphology features
    let features = {};
    if (analysisData?.traits) {
      features = analysisData.traits;
    } else if (analysisData?.graphologyAnalysis) {
      features = analysisData.graphologyAnalysis;
    }

    return (
      <div className="min-h-screen bg-[#FFF8F4] pt-32 pb-24 font-serif">
        <div className="max-w-[1000px] w-full mx-auto px-6">
          <div className="mb-4 inline-flex items-center rounded-full bg-[#E8D6CD] px-4 py-1.5">
             <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A4640]">Akurasi Analisis: {Math.round(analysisData?.confidence || 98)}%</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#33241D] leading-tight">
            Hasil Akhir - <span className="text-[#A16461]">{fallbackType} : {detail.title}</span>
          </h1>
          <p className="mt-3 text-lg text-[#5A433D] italic max-w-3xl leading-relaxed">
            {detail.subtitle}
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2 items-stretch">
            {/* Analisis Grafologi Card */}
            <div className="rounded-[24px] bg-[#FCEBE3] p-8 shadow-sm h-full">
              <div className="flex items-center gap-3 mb-6">
                <Menu className="text-[#33241D]" size={22} />
                <h2 className="text-2xl font-bold text-[#33241D]">Analisis Grafologi</h2>
              </div>
              
              <div className="space-y-6">
                {features.size ? (
                   <div className="relative">
                     <div className="flex items-center gap-2 mb-2 bg-[#FFF5F0] px-3 py-2 rounded-lg">
                       <Search size={14} className="text-[#A16461]" />
                       <p className="text-sm font-bold text-[#A16461]">Ukuran = {features.size.val || "Menengah"}</p>
                     </div>
                     <p className="text-[#5A433D] text-sm leading-relaxed px-1">{features.size.meaning || "Menunjukkan kemampuan adaptasi yang baik dan keseimbangan antara objektivitas dan fokus detail."}</p>
                   </div>
                ) : null}
                
                {features.slant ? (
                   <div className="relative">
                     <div className="flex items-center gap-2 mb-2 bg-[#FFF5F0] px-3 py-2 rounded-lg">
                       <ArrowUpFromLine size={14} className="text-[#A16461]" />
                       <p className="text-sm font-bold text-[#A16461]">Kemiringan = {features.slant.val || "Tegak Lurus"}</p>
                     </div>
                     <p className="text-[#5A433D] text-sm leading-relaxed px-1">{features.slant.meaning || "Garis vertikal yang stabil mencerminkan kemandirian emosional dan pengambilan keputusan berbasis data."}</p>
                   </div>
                ) : null}

                {features.baseline ? (
                   <div className="relative">
                     <div className="flex items-center gap-2 mb-2 bg-[#FFF5F0] px-3 py-2 rounded-lg">
                       <ArrowRightLeft size={14} className="text-[#A16461]" />
                       <p className="text-sm font-bold text-[#A16461]">Spasi / Garis Dasar = {features.baseline.val || "Lurus"}</p>
                     </div>
                     <p className="text-[#5A433D] text-sm leading-relaxed px-1">{features.baseline.meaning || "Jarak dan arah yang konsisten menandakan kestabilan emosi dan kontrol diri yang teratur."}</p>
                   </div>
                ) : null}

                {/* Tampilkan fallback statis jika tidak ada fitur yang terbaca dari API */}
                {!features.size && !features.slant && !features.baseline && (() => {
                  const defaultFeaturesMap = {
                    "Tipe 1": [
                      { icon: Search, title: "Kerapian = Terstruktur", desc: "Kerapian yang konsisten dan baseline lurus menunjukkan kedisiplinan dan kebutuhan akan keteraturan." },
                      { icon: ArrowUpFromLine, title: "Tekanan = Kuat", desc: "Tekanan yang kuat pada tulisan mencerminkan prinsip yang teguh dan komitmen tinggi terhadap standar." },
                      { icon: ArrowRightLeft, title: "Spasi = Teratur", desc: "Spasi yang proporsional menandakan pemikiran yang terorganisir dan kejelasan visi." }
                    ],
                    "Tipe 2": [
                      { icon: Search, title: "Bentuk Huruf = Membulat", desc: "Huruf yang membulat dan lembut mencerminkan kehangatan, keramahan, dan empati." },
                      { icon: ArrowUpFromLine, title: "Kemiringan = Ke Kanan", desc: "Kemiringan ke kanan menunjukkan orientasi pada orang lain dan keinginan untuk berinteraksi." },
                      { icon: ArrowRightLeft, title: "Spasi Antar Kata = Dekat", desc: "Jarak yang dekat mencerminkan kebutuhan akan kedekatan emosional dan hubungan interpersonal." }
                    ],
                    "Tipe 3": [
                      { icon: Search, title: "Kecepatan = Dinamis", desc: "Kecepatan menulis yang dinamis menunjukkan energi, ambisi, dan fokus pada pencapaian." },
                      { icon: ArrowUpFromLine, title: "Huruf Tengah = Dominan", desc: "Zona tengah yang menonjol mencerminkan fokus pada masa kini dan kebutuhan untuk tampil baik." },
                      { icon: ArrowRightLeft, title: "Tekanan = Stabil & Kuat", desc: "Tekanan kuat memperlihatkan dorongan kompetitif dan tekad yang bulat untuk sukses." }
                    ],
                    "Tipe 4": [
                      { icon: Search, title: "Gaya Tulisan = Khas", desc: "Gaya yang unik dan orisinal mencerminkan kebutuhan akan identitas diri yang autentik." },
                      { icon: ArrowUpFromLine, title: "Variasi Huruf = Beragam", desc: "Variasi ukuran dan bentuk menunjukkan fluktuasi emosi dan kekayaan dunia batin." },
                      { icon: ArrowRightLeft, title: "Tanda Tangan = Orisinil", desc: "Bentuk yang ekspresif menandakan keinginan untuk tampil berbeda dan dihargai atas keunikannya." }
                    ],
                    "Tipe 5": [
                      { icon: Search, title: "Huruf Kecil = Fokus Tajam", desc: "Tulisan kecil menunjukkan konsentrasi tinggi, observasi mendalam, dan perhatian terhadap detail spesifik." },
                      { icon: ArrowUpFromLine, title: "Kemiringan Tegak = Logis", desc: "Garis vertikal yang stabil mencerminkan kemandirian emosional dan pengambilan keputusan berbasis data." },
                      { icon: ArrowRightLeft, title: "Spasi Lebar = Butuh Privasi", desc: "Jarak antar kata yang konsisten menandakan kamu menghargai ruang pribadi dan waktu untuk refleksi." }
                    ],
                    "Tipe 6": [
                      { icon: Search, title: "Garis Dasar = Fluktuatif", desc: "Baseline yang sedikit naik turun mencerminkan kehati-hatian, kewaspadaan, dan antisipasi." },
                      { icon: ArrowUpFromLine, title: "Tulisan = Rapat", desc: "Spasi yang berdekatan dapat menunjukkan kebutuhan akan keamanan dan dukungan dari lingkungan." },
                      { icon: ArrowRightLeft, title: "Tekanan = Bervariasi", desc: "Variasi tekanan mencerminkan dinamika antara rasa ragu dan komitmen yang kuat saat merasa yakin." }
                    ],
                    "Tipe 7": [
                      { icon: Search, title: "Kecepatan = Cepat", desc: "Tulisan yang sangat cepat mencerminkan pikiran yang aktif, antusias, dan selalu mencari ide baru." },
                      { icon: ArrowUpFromLine, title: "Coretan = Impulsif", desc: "Bentuk huruf yang disederhanakan menunjukkan spontanitas dan ketidaksukaan pada rutinitas." },
                      { icon: ArrowRightLeft, title: "Spasi = Tidak Teratur", desc: "Jarak yang bervariasi mencerminkan fleksibilitas tinggi dan keinginan akan kebebasan." }
                    ],
                    "Tipe 8": [
                      { icon: Search, title: "Tekanan = Sangat Kuat", desc: "Tekanan tulisan yang sangat dalam mencerminkan vitalitas, keberanian, dan intensitas emosional." },
                      { icon: ArrowUpFromLine, title: "Huruf Kapital = Besar", desc: "Ukuran kapital yang besar menandakan rasa percaya diri, kepemimpinan alami, dan dominasi." },
                      { icon: ArrowRightLeft, title: "Garis = Tegas & Keras", desc: "Garis penutup yang tegas menunjukkan sikap berani mengambil kendali dan ketegasan dalam bertindak." }
                    ],
                    "Tipe 9": [
                      { icon: Search, title: "Huruf = Membulat", desc: "Coretan yang rileks dan membulat menunjukkan pembawaan yang tenang, reseptif, dan menghindari konflik." },
                      { icon: ArrowUpFromLine, title: "Kecepatan = Santai", desc: "Irama menulis yang stabil dan santai mencerminkan kedamaian batin dan sifat yang akomodatif." },
                      { icon: ArrowRightLeft, title: "Tekanan = Ringan Sedang", desc: "Tekanan yang tidak terlalu kuat menunjukkan fleksibilitas dan kemampuan untuk mengalah demi harmoni." }
                    ]
                  };
                  
                  const defaults = defaultFeaturesMap[fallbackType] || defaultFeaturesMap["Tipe 5"];
                  return (
                    <>
                      {defaults.map((item, idx) => (
                        <div key={idx} className="relative">
                          <div className="flex items-center gap-2 mb-2 bg-[#FFF5F0] px-3 py-2 rounded-lg">
                            <item.icon size={14} className="text-[#A16461]" />
                            <p className="text-sm font-bold text-[#A16461]">{item.title}</p>
                          </div>
                          <p className="text-[#5A433D] text-sm leading-relaxed px-1">{item.desc}</p>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Validasi Hasil Card */}
            <div className="rounded-[24px] bg-[#6B5A4B] p-8 shadow-sm h-full text-white">
              <div className="flex items-center gap-3 mb-6">
                <BadgeCheck className="text-[#FCEBE3]" size={26} />
                <h2 className="text-2xl font-bold text-white">Validasi Hasil</h2>
              </div>
              <div className="leading-loose text-white/95 whitespace-pre-line text-[15px]">
                {detail.validationText.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className={idx === 0 ? "italic mb-6" : ""}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Analisis Enneagram Full Width Card */}
          <div className="mt-6 rounded-[24px] bg-[#E8D6CD] p-8 md:p-10 shadow-sm border border-[#D9C4BA]">
            <div className="grid gap-10 md:grid-cols-[1.8fr_1fr] items-center">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <Brain className="text-[#33241D]" size={24} />
                  <h2 className="text-2xl font-bold text-[#33241D]">Analisis Enneagram</h2>
                </div>
                <div className="space-y-4 text-[#4A3831] leading-relaxed text-[15px]">
                  {detail.analysis.map((para, i) => <p key={i}>{para}</p>)}
                </div>
              </div>

              <div className="rounded-[20px] bg-[#FFF8F4] p-8 text-center shadow-sm border border-[#F2E4DC]">
                <div className="mb-6">
                  <p className="text-[11px] font-bold text-[#A16461] uppercase tracking-widest mb-2">Dominasi</p>
                  <p className="text-[19px] font-semibold text-[#33241D]">{detail.dominasi}</p>
                </div>
                <div className="w-20 h-px bg-[#E8D6CD] mx-auto mb-6" />
                <div>
                  <p className="text-[11px] font-bold text-[#A16461] uppercase tracking-widest mb-2">Fokus Utama</p>
                  <p className="text-[19px] font-semibold text-[#33241D]">{detail.fokusUtama}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Advice (3 Columns) */}
          <div className="mt-12 grid gap-8 md:grid-cols-3 relative">
             {/* Garis penghubung di belakang ikon */}
             <div className="absolute top-8 left-[16.66%] right-[16.66%] h-px bg-[#E8D6CD] hidden md:block -z-10" />
             
             <div className="text-center bg-transparent">
               <div className="mx-auto flex w-16 h-16 items-center justify-center rounded-[20px] bg-white shadow-sm mb-6 border border-[#F2E4DC]">
                 <PersonStanding className="text-[#A16461]" size={24} />
               </div>
               <h3 className="text-lg font-bold text-[#33241D] mb-2">{detail.actions.moving.title}</h3>
               <p className="text-[#5A433D] text-[13px] leading-relaxed px-2">{detail.actions.moving.desc}</p>
             </div>
             
             <div className="text-center bg-transparent">
               <div className="mx-auto flex w-16 h-16 items-center justify-center rounded-[20px] bg-white shadow-sm mb-6 border border-[#F2E4DC]">
                 <MessageSquare className="text-[#A16461]" size={24} />
               </div>
               <h3 className="text-lg font-bold text-[#33241D] mb-2">{detail.actions.sharing.title}</h3>
               <p className="text-[#5A433D] text-[13px] leading-relaxed px-2">{detail.actions.sharing.desc}</p>
             </div>
             
             <div className="text-center bg-transparent">
               <div className="mx-auto flex w-16 h-16 items-center justify-center rounded-[20px] bg-white shadow-sm mb-6 border border-[#F2E4DC]">
                 <Accessibility className="text-[#A16461]" size={24} />
               </div>
               <h3 className="text-lg font-bold text-[#33241D] mb-2">{detail.actions.body.title}</h3>
               <p className="text-[#5A433D] text-[13px] leading-relaxed px-2">{detail.actions.body.desc}</p>
             </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F4] pt-32 pb-16">
      <div className="max-w-4xl w-full mx-auto px-6">
        <div className="mb-6 rounded-[32px] bg-[#7A4640] p-8 text-white shadow-lg sm:p-10">
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm uppercase tracking-[0.3em] font-semibold text-white/90">
                {analysisTriad ? `${analysisTriad} Triad` : "Validasi Triad"}
              </div>
              <h1 className="text-3xl font-bold">Validasi Kuesioner Enneagram</h1>
            </div>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
              Lengkapi pertanyaan validasi yang disesuaikan dengan hasil analisis grafologi kamu.
            </p>
            <p className="mt-3 text-sm text-white/75">
              {analysisType ? `Hasil analisis kamu terdeteksi sebagai ${analysisType}, sehingga kuis ini menampilkan triad ${analysisTriad}.` : "Memuat data analisis..."}
            </p>
            {analysisError && (
              <p className="mt-3 rounded-3xl bg-[#FCE8E3] px-4 py-3 text-sm text-[#8A3834]">{analysisError}</p>
            )}
          </div>

        {analysisTriad && (
          <div className="bg-white rounded-[32px] p-8 shadow-lg">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#A16461]">Pertanyaan validasi</p>
                <h2 className="mt-2 text-2xl font-bold text-[#33241D]">{current.type} — {current.triad}</h2>
              </div>
              <div className="rounded-3xl bg-[#FFF2EC] px-4 py-2 text-sm text-[#7A4640]">
                {index + 1}/{filteredQuestions.length}
              </div>
            </div>
            <div className="mb-8 rounded-3xl border border-[#F0D7CE] bg-[#FFF6F2] p-6 text-[#5A433D]">
              <p className="text-lg font-semibold">{current.text}</p>
            </div>

            <div className="grid gap-3">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleSelect(score)}
                  className={`rounded-3xl border px-5 py-4 text-left transition ${answers[index] === score ? "border-[#A16461] bg-[#F9E5D9]" : "border-[#E7D1C7] bg-[#FFF8F4]"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#4B312B]">Skor {score}</span>
                    <span className="text-sm text-[#7A4640]/80">
                      {score === 1 ? "Tidak sama sekali" : score === 5 ? "Sangat sesuai" : ""}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {error && <p className="mt-6 rounded-3xl bg-[#FCE8E3] px-4 py-3 text-sm text-[#8A3834]">{error}</p>}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button type="button" onClick={prev} disabled={index === 0} className="rounded-2xl border border-[#A16461] px-4 py-3 text-sm font-semibold text-[#7A4640] disabled:cursor-not-allowed disabled:opacity-50">
                  Sebelumnya
                </button>
                <button type="button" onClick={next} disabled={index === filteredQuestions.length - 1} className="rounded-2xl border border-[#A16461] bg-white px-4 py-3 text-sm font-semibold text-[#7A4640] disabled:cursor-not-allowed disabled:opacity-50">
                  Lanjutkan
                </button>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span className="text-sm text-[#7A4640]/80">Progress: {progress}%</span>
                <button type="button" onClick={handleFinish} disabled={loading} className="rounded-2xl bg-[#A16461] px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70">
                  {loading ? "Menyimpan..." : "Selesai dan Simpan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
