
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Hash,
  User,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Key,
  GraduationCap,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";

// Letakkan file ini di:
// app/siswa/akses-ujian/[ujianId]/page.tsx

type UjianInfo = {
  id: string;
  nama: string;
  kelas: string;
  durasi: number;
  namaSekolah: string;
  namaGuru: string;
  jumlahSoal?: number;
};

export default function AksesUjianPage() {
  const router = useRouter();
  const { ujianId } = useParams<{ ujianId: string }>();

  const [ujian, setUjian] = useState<UjianInfo | null>(null);
  const [loadingUjian, setLoadingUjian] = useState(true);

  const [nisn, setNisn] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [berhasil, setBerhasil] = useState(false);

  // Fetch info ujian saat pertama load
  useEffect(() => {
    if (!ujianId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/ujian/${ujianId}`)
      .then(async (res) => {
        const text = await res.text();
        if (!text) throw new Error("Respons server kosong");
        const data = JSON.parse(text);
        if (!res.ok) throw new Error(data.message || "Ujian tidak ditemukan");
        setUjian(data);
      })
      .catch(() => {
        // Biarkan ujian null, form tetap tampil
      })
      .finally(() => setLoadingUjian(false));
  }, [ujianId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/siswa/akses-ujian`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nisn, namaLengkap: nama, kelas, token }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengakses ujian");
      }

      setBerhasil(true);
      router.push(
        `/siswa/instruksi-ujian/${data.ujianId}?sesiId=${data.sesiId}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (berhasil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-semibold text-zinc-900">
            Berhasil Masuk!
          </h2>
          <p className="text-slate-500">Mengalihkan ke halaman instruksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] flex flex-col gap-5">

        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
            <GraduationCap className="text-zinc-800 w-7 h-7" />
          </div>
          <div className="text-center">
            {/* Nama ujian sebagai label atas, nama sekolah di bawah */}
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Sistem Penilaian Siswa
              {/* {loadingUjian
                ? "Memuat..."
                : (ujian?.nama ?? "Sistem Penilaian Siswa")} */}
            </h2>
            <p className="text-[13px] font-semibold text-zinc-600">
              {loadingUjian ? "—" : (ujian?.namaSekolah ?? "—")}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

          {/* Info Ujian */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/30">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  Ujian Aktif
                </span>
              </div>

              {loadingUjian ? (
                /* Skeleton saat loading */
                <div className="space-y-2 py-1">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                  <div className="flex gap-1.5 mt-2">
                    <div className="h-5 w-16 bg-slate-100 rounded animate-pulse" />
                    <div className="h-5 w-16 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              ) : ujian ? (
                <>
                  <h1 className="text-[16px] font-bold text-zinc-900 leading-tight">
                    {ujian.nama}
                  </h1>
                  {/* Nama Guru */}
                  <p className="text-[12px] text-slate-500">
                    Guru :{" "}
                    <span className="font-medium text-zinc-700">
                      {ujian.namaGuru}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-zinc-600 border border-slate-200 shadow-sm uppercase">
                      Kelas {ujian.kelas}
                    </span>
                    {ujian.jumlahSoal && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-zinc-600 border border-slate-200 shadow-sm">
                        {ujian.jumlahSoal} Soal
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-zinc-600 border border-slate-200 shadow-sm">
                      {ujian.durasi} Menit
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-[12px] text-slate-500">
                  Masukkan data diri dan token ujian yang diberikan pengawas untuk memulai.
                </p>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mx-5 mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[12px]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form className="p-5 space-y-4" onSubmit={handleSubmit}>

            {/* NISN */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-zinc-700">
                NISN
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                {/* <input
                  type="text"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  maxLength={10}
                  placeholder="10 Digit"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 transition-all"
                  required
                /> */}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={nisn}
                  onChange={(e) => {
                    // hanya angka
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setNisn(value);
                  }}
                  maxLength={10}
                  placeholder="10 Digit"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 transition-all"
                  required
                />
              </div>
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-zinc-700">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 transition-all"
                  required
                />
              </div>
            </div>

            {/* Kelas */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-zinc-700">
                Kelas
              </label>
              {/* <div className="relative">
                <select
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] bg-white appearance-none focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 cursor-pointer transition-all"
                  required
                >
                  <option value="">Pilih kelas...</option>
                  <option value="X IPA 1">X IPA 1</option>
                  <option value="X IPA 2">X IPA 2</option>
                  <option value="X IPS 1">X IPS 1</option>
                  <option value="X IPS 2">X IPS 2</option>
                  <option value="XI IPA 1">XI IPA 1</option>
                  <option value="XI IPA 2">XI IPA 2</option>
                  <option value="XI IPS 1">XI IPS 1</option>
                  <option value="XI IPS 2">XI IPS 2</option>
                  <option value="XII IPA 1">XII IPA 1</option>
                  <option value="XII IPA 2">XII IPA 2</option>
                  <option value="XII IPS 1">XII IPS 1</option>
                  <option value="XII IPS 2">XII IPS 2</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div> */}
              <input
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Contoh: XI"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] bg-white focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 transition-all"
                required
              />
            </div>

            {/* Token */}
            <div className="pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold text-zinc-700">
                    Token Akses
                  </label>
                  <div className="group relative">
                    <HelpCircle className="text-slate-400 w-3.5 h-3.5 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-40 p-2 bg-zinc-900 text-white text-[9px] rounded-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10">
                      Mintalah token ke pengawas ujian.
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    placeholder="XXXXXX"
                    className="w-full h-10 pl-9 pr-4 rounded-lg border border-zinc-200 bg-slate-50 text-[13px] font-mono uppercase tracking-[0.3em] focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-zinc-900 text-white text-[13px] font-bold rounded-xl hover:bg-zinc-800 flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk Ujian
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Security note */}
            <div className="flex gap-2 pt-2 border-t border-slate-50">
              <ShieldCheck className="text-slate-400 w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400">
                Sistem mendeteksi tab switching & screenshot. Pastikan Anda mematuhi peraturan ujian.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}