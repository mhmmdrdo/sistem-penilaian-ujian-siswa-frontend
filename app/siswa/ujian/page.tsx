"use client";
import { Suspense } from "react";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, AlertTriangle, Loader2, CheckCircle, Flag } from "lucide-react";

type Soal = {
  id: string;
  nomorUrut: number;
  pertanyaan: string;
  tipe: string;
  topik?: string;
  gambarUrl?: string;
  opsiA?: string;
  opsiB?: string;
  opsiC?: string;
  opsiD?: string;
};

// export default function UjianPage() {
function UjianPage() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const sesiId = searchParams.get("sesiId");
  const ujianId = searchParams.get("ujianId");

  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jawaban, setJawaban] = useState<Record<string, string>>({});
  const [ragu, setRagu] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [sisaWaktu, setSisaWaktu] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchSoal = useCallback(async () => {
    if (!sesiId) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/sesi/${sesiId}/soal`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSoalList(data.soal || []);
      setSisaWaktu(data.sisaWaktu || 0);
    } catch {
      // Fallback to demo data
      setSoalList([
        {
          id: "demo-1",
          nomorUrut: 1,
          pertanyaan: "Contoh soal pilihan ganda?",
          tipe: "PILIHAN_GANDA",
          opsiA: "Pilihan A",
          opsiB: "Pilihan B",
          opsiC: "Pilihan C",
          opsiD: "Pilihan D",
        },
      ]);
      setSisaWaktu(3600);
    } finally {
      setLoading(false);
    }
  }, [sesiId]);

  useEffect(() => {
    fetchSoal();
  }, [fetchSoal]);

  // Timer
  useEffect(() => {
    if (sisaWaktu <= 0) return;

    const timer = setInterval(() => {
      setSisaWaktu((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSelesai();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sisaWaktu]);

  const handleJawab = (soalId: string, jawabanDipilih: string) => {
    setJawaban((prev) => ({ ...prev, [soalId]: jawabanDipilih }));

    // Save to API
    if (sesiId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/sesi/${sesiId}/jawab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soalId,
          jawaban: jawabanDipilih,
          isRagu: ragu[soalId] || false,
        }),
      }).catch(() => { });
    }
  };

  const toggleRagu = (soalId: string) => {
    const newRagu = !ragu[soalId];
    setRagu((prev) => ({ ...prev, [soalId]: newRagu }));

    if (sesiId && jawaban[soalId]) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/sesi/${sesiId}/jawab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soalId,
          jawaban: jawaban[soalId],
          isRagu: newRagu,
        }),
      }).catch(() => { });
    }
  };

  const handleSelesai = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/sesi/${sesiId}/selesai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alasan: "SELESAI" }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/siswa/selesai-ujian?nilai=${data.nilaiAkhir}&benar=${data.nilaiBenar}&salah=${data.nilaiSalah}&lulus=${data.lulus}`);
      }
    } catch {
      alert("Gagal menyelesaikan ujian");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  const currentSoal = soalList[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">
            Soal {currentIndex + 1} dari {soalList.length}
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${sisaWaktu < 300 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
          < Clock className="w-4 h-4" />
          <span className="font-mono font-bold">{formatTime(sisaWaktu)}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Question */}
        {currentSoal && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {currentSoal.nomorUrut}
              </div>
              <div className="flex-1">
                <p className="text-lg text-zinc-900 mb-4">{currentSoal.pertanyaan}</p>

                {currentSoal.gambarUrl && (
                  <img src={currentSoal.gambarUrl} alt="Gambar soal" className="max-w-md rounded-lg mb-4" />
                )}

                {currentSoal.tipe === "PILIHAN_GANDA" && (
                  <div className="space-y-3">
                    {[
                      { key: "A", value: currentSoal.opsiA },
                      { key: "B", value: currentSoal.opsiB },
                      { key: "C", value: currentSoal.opsiC },
                      { key: "D", value: currentSoal.opsiD },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => handleJawab(currentSoal.id, opt.key)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${jawaban[currentSoal.id] === opt.key
                            ? "border-zinc-900 bg-zinc-50"
                            : "border-slate-200 hover:border-slate-300"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${jawaban[currentSoal.id] === opt.key
                              ? "bg-zinc-900 text-white"
                              : "bg-slate-100 text-slate-600"
                            }`}>
                            {opt.key}
                          </div>
                          <span>{opt.value}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => toggleRagu(currentSoal.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ragu[currentSoal.id]
                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                <Flag className="w-4 h-4 inline mr-1" />
                {ragu[currentSoal.id] ? "Ditandai Ragu" : "Tandai Ragu"}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Sebelumnya
          </button>

          {currentIndex < soalList.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(soalList.length - 1, prev + 1))}
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800"
            >
              Selanjutnya
            </button>
          ) : (
            <button
              onClick={handleSelesai}
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Selesai Ujian
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-sm font-medium text-zinc-700 mb-4">Navigasi Soal</h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {soalList.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${i === currentIndex
                    ? "bg-zinc-900 text-white"
                    : jawaban[s.id]
                      ? ragu[s.id]
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-green-100 text-green-700 border border-green-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {s.nomorUrut}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <UjianPage />
    </Suspense>
  );
}