"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { analysisApi } from "@/api/analysis";

const questions = [
  { id: 1, triad: "Gut", type: "Tipe 8", text: "Saya merasa perlu mengambil kendali dalam situasi yang tidak pasti agar sesuatu berjalan sesuai keinginan saya." },
  { id: 2, triad: "Gut", type: "Tipe 9", text: "Saya lebih memilih untuk mengalah atau diam daripada memulai perdebatan yang bisa merusak hubungan." },
  { id: 3, triad: "Gut", type: "Tipe 1", text: "Saya memiliki standar yang sangat tinggi dan merasa frustrasi ketika orang lain tidak memenuhi standar tersebut." },
  { id: 4, triad: "Gut", type: "Tipe 8", text: "Saya tidak segan menghadapi konflik secara langsung ketika saya merasa hak atau posisi saya terancam." },
  { id: 5, triad: "Heart", type: "Tipe 2", text: "Saya secara intuitif merasakan kebutuhan orang lain dan merasa terdorong untuk membantu bahkan sebelum diminta." },
  { id: 6, triad: "Heart", type: "Tipe 3", text: "Saya sangat termotivasi untuk mencapai tujuan dan merasa tidak nyaman jika tidak produktif atau berprestasi." },
  { id: 7, triad: "Heart", type: "Tipe 4", text: "Saya sering merasa bahwa ada sesuatu yang unik dan berbeda dalam diri saya yang tidak dimiliki orang lain." },
  { id: 8, triad: "Heart", type: "Tipe 3", text: "Saya sangat memperhatikan bagaimana saya terlihat di mata orang lain dan berusaha menampilkan citra yang sukses." },
  { id: 9, triad: "Head", type: "Tipe 5", text: "Saya lebih memilih mengamati dan menganalisis situasi sebelum mengambil tindakan atau mengekspresikan pendapat." },
  { id: 10, triad: "Head", type: "Tipe 6", text: "Saya sering memikirkan skenario terburuk yang mungkin terjadi dan mempersiapkan diri untuk menghadapinya." },
  { id: 11, triad: "Head", type: "Tipe 7", text: "Saya selalu bersemangat dengan ide-ide baru dan mudah berpindah dari satu proyek ke proyek lain yang terasa lebih menarik." },
  { id: 12, triad: "Head", type: "Tipe 5", text: "Saya sangat menghargai privasi dan waktu sendiri karena interaksi sosial yang berkepanjangan menguras energi saya." },
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

const triadLabels = {
  Gut: "Instinctive (Gut)",
  Heart: "Feeling (Heart)",
  Head: "Thinking (Head)",
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
    if (!analysisId) {
      setAnalysisError("Analysis ID tidak ditemukan. Silakan kembali ke halaman hasil untuk memulai validasi ulang.");
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const analysis = await analysisApi.getDetail(analysisId);
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
  }, [analysisId]);

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
    if (!analysisId || !analysisTriad) {
      setError("Analysis ID tidak ditemukan atau data analisis belum dimuat. Silakan kembali ke halaman hasil untuk memulai validasi ulang.");
      return;
    }

    if (answers.some((answer) => answer === null)) {
      setError("Silakan jawab semua pertanyaan sebelum menyelesaikan validasi.");
      return;
    }

    setError("");
    setLoading(true);

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
    return (
      <div className="min-h-screen bg-[#FFF8F4] py-10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="rounded-[32px] bg-white p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-[#7A4640]">Hasil Validasi Disimpan</h1>
            <p className="mt-4 text-[#5A433D]">
              Terima kasih, hasil Kuesioner Validasi Enneagram telah berhasil disimpan ke riwayat analisis.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {Object.entries(triadScores).map(([triad, score]) => (
                <div key={triad} className="rounded-3xl border border-[#E8D6CD] bg-[#FFF6F1] p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#7A4640]/70">{triadLabels[triad]}</p>
                  <p className="mt-3 text-3xl font-semibold text-[#7A4640]">{score}</p>
                  <p className="mt-2 text-sm text-[#6A4A45]">Lebih tinggi berarti kecenderungan triad tersebut lebih dominan.</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-[#E8D6CD] bg-[#FFF5EE] p-6">
              <p className="text-sm text-[#7A4640]/80">Triad dominan</p>
              <p className="mt-2 text-2xl font-semibold text-[#7A4640]">{strongestTriad}</p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button onClick={handleBack} className="rounded-2xl border border-[#A16461] px-6 py-3 text-[#7A4640] transition hover:bg-[#F5E1D8]">
                Kembali ke Hasil Analisis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F4] py-10">
      <div className="max-w-4xl mx-auto px-6">
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

        <div className="bg-white rounded-[32px] p-8 shadow-lg">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#A16461]">Pertanyaan validasi</p>
              <h2 className="mt-2 text-2xl font-bold text-[#33241D]">{current.type} — {current.triad}</h2>
            </div>
            <div className="rounded-3xl bg-[#FFF2EC] px-4 py-2 text-sm text-[#7A4640]">
              {index + 1}/{filteredQuestions.length}
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
      </div>
    </div>
  );
}
