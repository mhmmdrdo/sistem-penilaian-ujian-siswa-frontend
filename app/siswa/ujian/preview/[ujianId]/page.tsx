"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen, Loader2, AlertCircle, Clock, FileText, Hash, Users,
  ChevronLeft, ChevronRight, CheckCircle, Shuffle, ListOrdered, Eye,
} from "lucide-react";

type SoalPreview = {
  id: string;
  urutan: number;
  pertanyaan: string;
  tipe: string;
  topik?: string;
  gambarUrl?: string;
  opsiA?: string;
  opsiB?: string;
  opsiC?: string;
  opsiD?: string;
  opsiE?: string;        // ← tambah
  jawabanBenar?: string; // ← tambah
};

type UjianDetail = {
  id: string;
  nama: string;
  tipe: string;
  status: string;
  kelas: string;
  durasi: number;
  token: string;
  totalSoal: number;
  acakSoal?: boolean;
  soal: SoalPreview[];
  peserta?: { masuk: number; total: number };
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
  AKTIF: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BERLANGSUNG: "bg-blue-50 text-blue-700 border-blue-200",
  SELESAI: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function PreviewUjianPage() {
  const { ujianId } = useParams<{ ujianId: string }>();
  const [ujian, setUjian] = useState<UjianDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [showJawaban, setShowJawaban] = useState(false);

  useEffect(() => {
    if (!ujianId) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/ujian/${ujianId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat ujian");
        setUjian(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ujianId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  if (error || !ujian) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-zinc-900 mb-1">Ujian tidak ditemukan</h2>
          <p className="text-[13px] text-slate-500">{error || "Data ujian tidak tersedia."}</p>
        </div>
      </div>
    );
  }

  const currentSoal = ujian.soal[activeIndex];
  const soalCount = ujian.soal.length;

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-zinc-900 truncate">{ujian.nama}</p>
              <p className="text-[10px] text-slate-400">{ujian.kelas} · Preview Guru</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* <button
              onClick={() => setShowJawaban((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${showJawaban
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {showJawaban ? "Sembunyikan Jawaban" : "Tampilkan Jawaban"}
            </button> */}
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_STYLE[ujian.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {ujian.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Info Ujian</h3>
            {[
              { icon: <FileText className="w-3.5 h-3.5 text-slate-400" />, label: "Total Soal", val: `${soalCount} soal` },
              { icon: <Clock className="w-3.5 h-3.5 text-slate-400" />, label: "Durasi", val: `${ujian.durasi} menit` },
              { icon: <Hash className="w-3.5 h-3.5 text-slate-400" />, label: "Token", val: ujian.token },
              { icon: <Users className="w-3.5 h-3.5 text-slate-400" />, label: "Peserta", val: ujian.peserta ? `${ujian.peserta.total} siswa` : "—" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                <div>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase leading-none">{item.label}</p>
                  <p className="text-[12px] font-semibold text-zinc-800 mt-0.5 font-mono">{item.val}</p>
                </div>
              </div>
            ))}
            <div className="pt-1">
              {ujian.acakSoal ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                  <Shuffle className="w-3 h-3" /> Soal Diacak
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  <ListOrdered className="w-3 h-3" /> Soal Berurutan
                </span>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Navigasi Soal</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {ujian.soal.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-8 rounded-lg text-[11px] font-bold transition-all ${i === activeIndex ? "bg-zinc-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {soalCount === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-[13px] font-semibold text-zinc-500">Belum ada soal</p>
              <p className="text-[11px] text-slate-400 mt-1">Tambahkan soal melalui panel admin.</p>
            </div>
          ) : currentSoal ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                    {activeIndex + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${currentSoal.tipe === "PILIHAN_GANDA" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                      {currentSoal.tipe === "PILIHAN_GANDA" ? "Pilihan Ganda" : "Essay"}
                    </span>
                    {currentSoal.topik && <span className="text-[10px] text-slate-400">{currentSoal.topik}</span>}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">{activeIndex + 1} / {soalCount}</span>
              </div>

              <div className="px-6 py-5">
                <p className="text-[15px] text-zinc-900 leading-relaxed mb-5">{currentSoal.pertanyaan}</p>
                {currentSoal.gambarUrl && (
                  <img src={currentSoal.gambarUrl} alt="Gambar soal" className="max-w-sm rounded-xl mb-5 border border-slate-200" />
                )}


                {currentSoal.tipe === "PILIHAN_GANDA" && (
                  <div className="space-y-2.5">
                    {[
                      { key: "A", val: currentSoal.opsiA },
                      { key: "B", val: currentSoal.opsiB },
                      { key: "C", val: currentSoal.opsiC },
                      { key: "D", val: currentSoal.opsiD },
                      { key: "E", val: currentSoal.opsiE },
                    ].filter((o) => o.val).map((opt) => {
                      const isBenar = currentSoal.jawabanBenar?.trim().toUpperCase() === opt.key;
                      return (
                        <div
                          key={opt.key}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${isBenar
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-slate-200 bg-slate-50/50"
                            }`}
                        >
                          <div className={`w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0 ${isBenar ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                            }`}>
                            {opt.key}
                          </div>
                          <span className={`text-[13px] flex-1 ${isBenar ? "font-semibold text-emerald-800" : "text-zinc-800"
                            }`}>
                            {opt.val}
                          </span>
                          {isBenar && <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                        </div>
                      );
                    })}

                    {/* Kunci jawaban — selalu tampil di preview guru, tidak perlu toggle */}
                    {/* <div className={`mt-3 p-3 rounded-xl flex items-center gap-2 ${currentSoal.jawabanBenar
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-red-50 border border-red-200"
                      }`}>
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${currentSoal.jawabanBenar ? "text-emerald-500" : "text-red-400"}`} />
                      <p className={`text-[12px] font-semibold ${currentSoal.jawabanBenar ? "text-emerald-700" : "text-red-600"}`}>
                        {currentSoal.jawabanBenar
                          ? <>
                            Jawaban Benar:{" "}
                            <span className="font-bold text-emerald-900">
                              {currentSoal.jawabanBenar.trim().toUpperCase()}
                            </span>
                            {" — "}
                            <span className="font-normal">
                              {currentSoal.jawabanBenar.trim().toUpperCase() === "A" ? currentSoal.opsiA
                                : currentSoal.jawabanBenar.trim().toUpperCase() === "B" ? currentSoal.opsiB
                                  : currentSoal.jawabanBenar.trim().toUpperCase() === "C" ? currentSoal.opsiC
                                    : currentSoal.jawabanBenar.trim().toUpperCase() === "D" ? currentSoal.opsiD
                                      : currentSoal.jawabanBenar.trim().toUpperCase() === "E" ? currentSoal.opsiE
                                        : ""}
                            </span>
                          </>
                          : "⚠️ Kunci jawaban belum diset untuk soal ini"
                        }
                      </p>
                    </div> */}
                  </div>
                )}
                {currentSoal.tipe === "ESSAY" && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-[11px] font-semibold text-amber-700">Soal Essay — Siswa akan mengisi jawaban secara tertulis.</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveIndex((p) => Math.max(0, p - 1))}
                  disabled={activeIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-[12px] font-semibold text-zinc-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                </button>
                <button
                  onClick={() => setActiveIndex((p) => Math.min(soalCount - 1, p + 1))}
                  disabled={activeIndex === soalCount - 1}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-[12px] font-semibold hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}