

"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Flag,
  Send,
  Menu,
  X,
  ShieldAlert,
  Maximize,
} from "lucide-react";

// Letakkan file ini di:
// app/siswa/ujian/[ujianId]/page.tsx

type Soal = {
  id: string;
  nomorUrut: number;
  pertanyaan: string;
  tipe: "PILIHAN_GANDA" | "ESSAY";
  topik?: string;
  gambarUrl?: string;
  opsiA?: string;
  opsiB?: string;
  opsiC?: string;
  opsiD?: string;
  opsiE?: string;
};

// ✅ FIX: jawaban disimpan sebagai HURUF opsi (A/B/C/D/E), bukan teks opsi
type JawabanMap = Record<string, string>;
type RaguMap = Record<string, boolean>;

export default function UjianSiswaPage() {
  const { ujianId } = useParams<{ ujianId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sesiId = searchParams.get("sesiId");

  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [sisaWaktu, setSisaWaktu] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  // ✅ FIX: jawaban[soalId] = "A" | "B" | "C" | "D" | "E"  (bukan teks opsi)
  const [jawaban, setJawaban] = useState<JawabanMap>({});
  const [ragu, setRagu] = useState<RaguMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pelanggaranCount, setPelanggaranCount] = useState(0);
  const [violationAlert, setViolationAlert] = useState({
    show: false,
    message: "",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch soal via sesiId ──
  useEffect(() => {
    if (!sesiId) {
      setError("Sesi tidak valid. Silakan akses ulang ujian.");
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/sesi/${sesiId}/soal`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          if (data.timeout) {
            handleTimeout();
            return;
          }
          throw new Error(data.message || "Gagal memuat soal");
        }
        setSoalList(data.soal || []);
        setSisaWaktu(data.sisaWaktu || 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sesiId]);

  // ── Timer countdown ──
  useEffect(() => {
    if (sisaWaktu <= 0 || loading) return;

    timerRef.current = setInterval(() => {
      setSisaWaktu((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [sisaWaktu, loading]);

  // ── Anti-cheat: tab visibility ──
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation(
          "Anda meninggalkan halaman ujian. Dilarang membuka tab atau aplikasi lain."
        );
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pelanggaranCount, violationAlert.show]);

  // ── Anti-cheat: keyboard & context menu ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        triggerViolation("Tindakan screenshot terdeteksi. Sistem telah mencatat aktivitas ini.");
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "a", "s", "p"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        if (e.key.toLowerCase() === "c") {
          triggerViolation("Dilarang menyalin (Copy) soal ujian.");
        }
      }
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I")
      ) {
        e.preventDefault();
      }
    };

    const preventCtxMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerViolation("Fungsi klik kanan dinonaktifkan.");
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation("Dilarang menyalin soal ujian.");
    };

    const handleBlur = () => {
      triggerViolation("Fokus ujian hilang. Harap pastikan Anda tetap berada di halaman ini.");
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", preventCtxMenu);
    document.addEventListener("copy", handleCopy);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", preventCtxMenu);
      document.removeEventListener("copy", handleCopy);
      window.removeEventListener("blur", handleBlur);
    };
  }, [pelanggaranCount, violationAlert.show]);

  function triggerViolation(message: string) {
    if (violationAlert.show) return;

    const nextCount = pelanggaranCount + 1;
    setPelanggaranCount(nextCount);

    reportPelanggaran("CHEATING_ATTEMPT", message);

    if (nextCount >= 3) {
      submitUjian("DIHENTIKAN", nextCount);
    } else {
      setViolationAlert({ show: true, message });
    }
  }

  async function reportPelanggaran(jenis: string, catatan: string) {
    if (!sesiId) return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/siswa/sesi/${sesiId}/pelanggaran`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jenis, catatan }),
        }
      );
    } catch (_) { }
  }

  async function handleTimeout() {
    await submitUjian("TIMEOUT");
  }

  async function simpanJawaban(
    soalId: string,
    // ✅ FIX: hurufOpsi adalah "A" | "B" | "C" | "D" | "E"
    hurufOpsi: string,
    isRagu: boolean
  ) {
    if (!sesiId) return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/siswa/sesi/${sesiId}/jawab`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            soalId,
            jawaban: hurufOpsi, // ✅ kirim huruf, bukan teks opsi
            isRagu,
          }),
        }
      );
    } catch (_) { }
  }

  // ✅ FIX: hurufOpsi = "A" | "B" | "C" | "D" | "E"
  function handlePilihJawaban(soalId: string, hurufOpsi: string) {
    setJawaban((prev) => ({ ...prev, [soalId]: hurufOpsi }));
    simpanJawaban(soalId, hurufOpsi, ragu[soalId] || false);
  }

  function handleToggleRagu(soalId: string) {
    const newRagu = !ragu[soalId];
    setRagu((prev) => ({ ...prev, [soalId]: newRagu }));
    if (jawaban[soalId]) {
      simpanJawaban(soalId, jawaban[soalId], newRagu);
    }
  }

  async function submitUjian(alasan: string = "SELESAI", finalPelanggaran?: number) {
    if (!sesiId || submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current!);

    const jumlahPelanggaran = finalPelanggaran ?? pelanggaranCount;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/siswa/sesi/${sesiId}/selesai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alasan }),
        }
      );
      const data = await res.json();
      // router.push(
      //   `/siswa/selesai-ujian/${ujianId}?nilai=${data.nilaiAkhir}&benar=${data.nilaiBenar}&salah=${data.nilaiSalah}&lulus=${data.lulus}&durasi=${data.durasi || 0}&totalSoal=${soalList.length}&pelanggaran=${jumlahPelanggaran}`
      // );
      router.replace(
        `/siswa/selesai-ujian/${ujianId}?nilai=${data.nilaiAkhir}&benar=${data.nilaiBenar}&salah=${data.nilaiSalah}&lulus=${data.lulus}&durasi=${data.durasi || 0}&totalSoal=${soalList.length}&pelanggaran=${jumlahPelanggaran}`
      );
    } catch (_) {
      setSubmitting(false);
    }
  }

  function formatWaktu(detik: number) {
    const m = Math.floor(detik / 60)
      .toString()
      .padStart(2, "0");
    const s = (detik % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  const soalCount = soalList.length;
  const dijawab = Object.keys(jawaban).filter((k) => jawaban[k]).length;
  const belumDijawab = soalCount - dijawab;
  const currentSoal = soalList[activeIndex];
  const isWarning = sisaWaktu <= 300 && sisaWaktu > 0;
  const isDanger = sisaWaktu <= 60 && sisaWaktu > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mx-auto" />
          <p className="text-sm text-slate-500">Memuat soal ujian...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-zinc-900 mb-1">
            Gagal Memuat Ujian
          </h2>
          <p className="text-[13px] text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen select-none bg-slate-50">
      {/* ── Violation Alert Modal ── */}
      {violationAlert.show && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[380px] overflow-hidden border border-slate-200">
            <div className="bg-red-50 px-6 py-8 text-center border-b border-red-100">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-red-200">
                <ShieldAlert
                  className="text-red-600 w-8 h-8"
                  strokeWidth={2.5}
                />
              </div>
              <h2 className="text-xl font-bold text-red-900">
                Peringatan Keamanan
              </h2>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-bold uppercase tracking-wider">
                Pelanggaran ke-{pelanggaranCount} dari 3
              </div>
            </div>

            <div className="p-8 text-center">
              <p className="text-[14px] text-slate-600 leading-relaxed mb-8">
                {violationAlert.message}
                <br />
                <span className="font-semibold text-zinc-900 mt-2 block">
                  Jika Anda melanggar 1x lagi, ujian akan dihentikan secara
                  otomatis.
                </span>
              </p>

              <button
                onClick={() =>
                  setViolationAlert({ show: false, message: "" })
                }
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98]"
              >
                Saya Mengerti & Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed left-0 top-0 w-[280px] h-full z-50 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Ujian Aktif
              </p>
              <h2 className="text-[13px] font-bold text-zinc-900 leading-tight">
                Ujian Berlangsung
              </h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timer */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="text-slate-400 w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sisa Waktu
            </span>
          </div>
          <div
            className={`text-[36px] font-mono font-bold ${isDanger
                ? "text-red-600 animate-pulse"
                : isWarning
                  ? "text-amber-600"
                  : "text-zinc-900"
              }`}
          >
            {formatWaktu(sisaWaktu)}
          </div>
        </div>

        {/* Progress */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Progress
            </span>
            <span className="text-[10px] font-bold text-zinc-700">
              {soalCount > 0 ? Math.round((dijawab / soalCount) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
            <div
              className="bg-zinc-900 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${soalCount > 0 ? (dijawab / soalCount) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-2 h-2 bg-emerald-500 rounded-sm inline-block" />{" "}
              {dijawab} dijawab
            </span>
            <span className="flex items-center gap-1 text-slate-400 font-semibold">
              <span className="w-2 h-2 bg-slate-200 rounded-sm inline-block" />{" "}
              {belumDijawab} belum
            </span>
          </div>
        </div>

        {/* Navigator Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Navigasi Soal
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {soalList.map((s, i) => {
              const isAnswered = !!jawaban[s.id];
              const isRagu_ = ragu[s.id];
              const isActive = i === activeIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveIndex(i);
                    setSidebarOpen(false);
                  }}
                  className={`w-full aspect-square rounded-lg text-xs font-bold flex items-center justify-center border transition-all relative ${isActive
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-md"
                      : isRagu_
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : isAnswered
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  {i + 1}
                  {isRagu_ && !isActive && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-1.5 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-emerald-50 border border-emerald-200 rounded" />
              <span className="text-slate-500">Sudah dijawab</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-amber-50 border border-amber-200 rounded" />
              <span className="text-slate-500">Ragu-ragu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-white border border-slate-200 rounded" />
              <span className="text-slate-500">Belum dijawab</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-5 border-t border-slate-100 space-y-3">
          {currentSoal && (
            <button
              onClick={() => handleToggleRagu(currentSoal.id)}
              className="flex items-center gap-3 w-full group"
            >
              <div className="relative w-10 h-6 flex-shrink-0">
                <div
                  className={`w-10 h-6 rounded-full transition-colors duration-200 ${ragu[currentSoal.id] ? "bg-amber-400" : "bg-slate-200"
                    }`}
                />
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${ragu[currentSoal.id] ? "translate-x-5" : "translate-x-1"
                    }`}
                />
              </div>
              <div className="text-left flex-1">
                <p className="text-xs font-bold text-zinc-900">Ragu-ragu</p>
              </div>
              <Flag
                className={`w-4 h-4 ${ragu[currentSoal.id]
                    ? "text-amber-500 fill-amber-500"
                    : "text-slate-300"
                  }`}
              />
            </button>
          )}

          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="w-full h-10 bg-red-50 text-red-600 border border-red-200 text-xs font-bold uppercase rounded-xl hover:bg-red-100 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            <AlertTriangle className="w-4 h-4" /> Akhiri Ujian
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex flex-col flex-1 md:ml-[280px] min-h-screen">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-bold">
              SOAL {activeIndex + 1}
            </span>
            <span className="text-[12px] text-slate-400 hidden md:block">
              {activeIndex + 1} dari {soalCount}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer (mobile) */}
            <div
              className={`md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${isDanger
                  ? "bg-red-100 text-red-700 animate-pulse"
                  : isWarning
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-zinc-700"
                }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {formatWaktu(sisaWaktu)}
            </div>

            {/* <button className="hidden md:flex items-center gap-1.5 text-slate-500 hover:text-zinc-900 text-xs font-medium transition-colors">
              <Maximize className="w-4 h-4" />
              <span className="hidden lg:inline">Full Screen</span>
            </button> */}
          </div>
        </header>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 pb-32">
          <div className="max-w-[720px] mx-auto">
            {currentSoal ? (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                {/* Meta */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentSoal.topik && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                      {currentSoal.topik}
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${currentSoal.tipe === "PILIHAN_GANDA"
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}
                  >
                    {currentSoal.tipe === "PILIHAN_GANDA"
                      ? "Pilihan Ganda"
                      : "Essay"}
                  </span>
                </div>

                {/* Pertanyaan */}
                <div className="mb-8">
                  <h1 className="text-[17px] md:text-xl font-medium text-zinc-800 leading-relaxed">
                    {currentSoal.pertanyaan}
                  </h1>
                </div>

                {/* Gambar */}
                {currentSoal.gambarUrl && (
                  <img
                    src={currentSoal.gambarUrl}
                    alt="Gambar soal"
                    className="max-w-sm rounded-xl mb-6 border border-slate-200"
                  />
                )}

                {/* ✅ FIX: Opsi Pilihan Ganda — value & jawaban pakai HURUF (A/B/C/D/E) */}
                {currentSoal.tipe === "PILIHAN_GANDA" && (
                  <div className="space-y-3">
                    {(
                      [
                        { key: "A", val: currentSoal.opsiA },
                        { key: "B", val: currentSoal.opsiB },
                        { key: "C", val: currentSoal.opsiC },
                        { key: "D", val: currentSoal.opsiD },
                        { key: "E", val: currentSoal.opsiE },
                      ] as { key: string; val: string | undefined }[]
                    )
                      .filter((o) => o.val)
                      .map((opt) => {
                        // ✅ FIX: bandingkan dengan HURUF, bukan teks opsi
                        const isSelected =
                          jawaban[currentSoal.id] === opt.key;
                        return (
                          <label
                            key={opt.key}
                            className="relative block cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`soal-${currentSoal.id}`}
                              // ✅ FIX: value adalah HURUF opsi (A/B/C/D/E)
                              value={opt.key}
                              checked={isSelected}
                              onChange={() =>
                                // ✅ FIX: kirim huruf opsi ke handler
                                handlePilihJawaban(currentSoal.id, opt.key)
                              }
                              className="sr-only"
                            />
                            <div
                              className={`flex items-center gap-4 px-5 h-14 border rounded-xl transition-all ${isSelected
                                  ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                                  : "border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-slate-300"
                                  }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <span
                                className={`text-xs font-bold ${isSelected
                                    ? "text-blue-600"
                                    : "text-slate-400"
                                  }`}
                              >
                                {opt.key}.
                              </span>
                              {/* ✅ Teks opsi tetap ditampilkan untuk dibaca siswa */}
                              <span
                                className={`text-sm flex-1 ${isSelected
                                    ? "font-semibold text-blue-900"
                                    : "text-zinc-700"
                                  }`}
                              >
                                {opt.val}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                )}

                {/* Essay */}
                {currentSoal.tipe === "ESSAY" && (
                  <textarea
                    value={jawaban[currentSoal.id] || ""}
                    onChange={(e) =>
                      handlePilihJawaban(currentSoal.id, e.target.value)
                    }
                    rows={6}
                    placeholder="Tulis jawaban Anda di sini..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 resize-none transition-all"
                  />
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <p className="text-slate-400">Tidak ada soal</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="h-20 border-t border-slate-200 bg-white fixed bottom-0 right-0 left-0 md:left-[280px] z-30">
          <div className="max-w-[720px] mx-auto w-full px-4 md:px-8 flex items-center justify-between h-full">
            <button
              onClick={() => setActiveIndex((p) => Math.max(0, p - 1))}
              disabled={activeIndex === 0}
              className="h-10 px-5 border border-slate-200 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Sebelumnya
            </button>

            {activeIndex < soalCount - 1 ? (
              <button
                onClick={() =>
                  setActiveIndex((p) => Math.min(soalCount - 1, p + 1))
                }
                className="h-10 px-6 bg-zinc-900 text-white text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-zinc-800 shadow-sm transition-colors"
              >
                Selanjutnya <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="h-10 px-6 bg-emerald-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" /> Selesai
              </button>
            )}
          </div>
        </footer>
      </main>

      {/* ── Modal Konfirmasi Submit ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl z-10">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="w-6 h-6 text-zinc-700" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 text-center mb-1">
              Kumpulkan Ujian?
            </h3>
            <p className="text-[13px] text-slate-500 text-center mb-4">
              Anda telah menjawab{" "}
              <strong className="text-zinc-900">{dijawab}</strong> dari{" "}
              <strong className="text-zinc-900">{soalCount}</strong> soal.
              {belumDijawab > 0 && (
                <span className="text-amber-600 font-semibold">
                  {" "}
                  {belumDijawab} soal belum dijawab.
                </span>
              )}
            </p>
            {belumDijawab > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-[11px] text-amber-700">
                  Soal yang belum dijawab tidak akan mendapat nilai.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-[13px] font-semibold hover:bg-slate-50 transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  submitUjian("SELESAI");
                }}
                disabled={submitting}
                className="flex-1 py-2.5 bg-zinc-900 text-white rounded-xl text-[13px] font-bold hover:bg-zinc-800 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}