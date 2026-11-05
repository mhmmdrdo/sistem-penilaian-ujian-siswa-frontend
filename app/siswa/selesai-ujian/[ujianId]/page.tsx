"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  CheckCircle,
  XCircle,
  MinusCircle,
  Clock,
  CalendarCheck,
  ClipboardList,
  ShieldCheck,
  PartyPopper,
  AlertTriangle,
  School,
  User,
  BookOpen,
} from "lucide-react";

type UjianInfo = {
  id: string;
  nama: string;
  kelas: string;
  durasi: number;
  namaSekolah: string;
  namaGuru: string;
  namaMataPelajaran?: string;
  jumlahSoal?: number;
};

export default function SelesaiUjianPage() {
  const searchParams = useSearchParams();
  const { ujianId } = useParams<{ ujianId: string }>();

  const nilai = parseFloat(searchParams.get("nilai") || "0");
  const benar = parseInt(searchParams.get("benar") || "0");
  const salah = parseInt(searchParams.get("salah") || "0");
  const lulus = searchParams.get("lulus") === "true";
  const durasiDetik = parseInt(searchParams.get("durasi") || "0");
  const totalSoal = parseInt(searchParams.get("totalSoal") || "0");
  const pelanggaran = parseInt(searchParams.get("pelanggaran") || "0");

  const kosong = Math.max(0, totalSoal - benar - salah);

  // ── Fetch info ujian ──────────────────────────────────
  const [ujian, setUjian] = useState<UjianInfo | null>(null);
  const [loadingUjian, setLoadingUjian] = useState(true);

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
        // Biarkan ujian null, halaman tetap tampil dengan data dari query params
      })
      .finally(() => setLoadingUjian(false));
  }, [ujianId]);

  // ── Helpers ───────────────────────────────────────────
  function formatDurasi(detik: number) {
    if (!detik) return "—";
    const m = Math.floor(detik / 60);
    const s = detik % 60;
    return `${m} menit ${s} detik`;
  }

  function formatWaktuSubmit() {
    const now = new Date();
    return now.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[520px] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* ── Score Header ── */}
        <div className="text-center py-10">
          <div className="relative flex flex-col items-center justify-center w-28 h-28 mx-auto rounded-full border-4 border-zinc-900 mb-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Nilai
            </span>
            <span className="text-3xl font-bold text-zinc-900 tracking-tight">
              {nilai.toFixed(2)}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
              lulus
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {lulus ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            {lulus ? "Lulus" : "Belum Lulus"}
          </span>

          <h1 className="text-2xl font-semibold text-zinc-900">
            Ujian Selesai!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hasil telah dicatat secara otomatis
          </p>
        </div>

        <hr className="border-slate-100 mx-8" />

        {/* ── Soal Stats Grid ── */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-center">
              <CheckCircle className="text-emerald-600 w-5 h-5 mx-auto mb-1" />
              <p className="text-[11px] font-medium text-slate-500 uppercase">Benar</p>
              <p className="text-sm font-semibold text-zinc-900">{benar} Soal</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-center">
              <XCircle className="text-red-500 w-5 h-5 mx-auto mb-1" />
              <p className="text-[11px] font-medium text-slate-500 uppercase">Salah</p>
              <p className="text-sm font-semibold text-zinc-900">{salah} Soal</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-center">
              <MinusCircle className="text-slate-400 w-5 h-5 mx-auto mb-1" />
              <p className="text-[11px] font-medium text-slate-500 uppercase">Kosong</p>
              <p className="text-sm font-semibold text-zinc-900">{kosong} Soal</p>
            </div>
          </div>
        </div>

        <hr className="border-slate-100 mx-8" />

        {/* ── Detail Info ── */}
        <div className="px-8 py-6 space-y-4">

          {/* Nama Sekolah */}
          {loadingUjian ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
                  <School className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-600">Sekolah</span>
              </div>
              <div className="h-3 bg-slate-100 rounded animate-pulse w-28" />
            </div>
          ) : ujian?.namaSekolah ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <School className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-600">Sekolah</span>
              </div>
              <span className="text-sm font-medium text-zinc-900 text-right max-w-[60%]">
                {ujian.namaSekolah}
              </span>
            </div>
          ) : null}

          {/* Nama Guru */}
          {loadingUjian ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-600">Guru</span>
              </div>
              <div className="h-3 bg-slate-100 rounded animate-pulse w-24" />
            </div>
          ) : ujian?.namaGuru ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-600">Guru</span>
              </div>
              <span className="text-sm font-medium text-zinc-900 text-right max-w-[60%]">
                {ujian.namaGuru}
              </span>
            </div>
          ) : null}

          {/* Nama Ujian / Mata Pelajaran */}
          {loadingUjian ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-600">Mata Pelajaran</span>
              </div>
              <div className="h-3 bg-slate-100 rounded animate-pulse w-32" />
            </div>
          ) : ujian && (ujian.namaMataPelajaran || ujian.nama) ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-600">Mata Pelajaran</span>
              </div>
              <span className="text-sm font-medium text-zinc-900 text-right max-w-[60%]">
                {ujian.namaMataPelajaran ?? ujian.nama}
              </span>
            </div>
          ) : null}

          {/* Divider tipis jika ada data ujian */}
          {!loadingUjian && ujian && (
            <div className="border-t border-slate-100 pt-0" />
          )}

          {/* Durasi */}
          {durasiDetik > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-600">Durasi Pengerjaan</span>
              </div>
              <span className="text-sm font-medium text-zinc-900">
                {formatDurasi(durasiDetik)}
              </span>
            </div>
          )}

          {/* Waktu Submit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <span className="text-sm text-slate-600">Waktu Submit</span>
            </div>
            <span className="text-sm font-medium text-zinc-900">
              {formatWaktuSubmit()}
            </span>
          </div>

          {/* Total Soal */}
          {totalSoal > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-600">Total Soal</span>
              </div>
              <span className="text-sm font-medium text-zinc-900">
                {totalSoal} Soal
              </span>
            </div>
          )}

          {/* Pelanggaran */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  pelanggaran > 0
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm text-slate-600">Pelanggaran</span>
            </div>
            <span
              className={`text-sm font-medium ${
                pelanggaran > 0 ? "text-red-600" : "text-emerald-700"
              }`}
            >
              {pelanggaran} Pelanggaran
            </span>
          </div>
        </div>

        {/* ── Message ── */}
        <div className="px-8 pb-8">
          <div
            className={`p-4 rounded-lg flex gap-3 ${
              lulus
                ? "bg-zinc-50 border border-zinc-200"
                : "bg-red-50 border border-red-100"
            }`}
          >
            {lulus ? (
              <PartyPopper className="text-zinc-900 w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                {lulus ? "Bagus Sekali!" : "Jangan Menyerah!"}
              </p>
              <p className="text-sm text-slate-600 mt-0.5">
                {lulus
                  ? "Selamat! Anda berhasil menyelesaikan ujian dengan baik. Hasil ini telah dicatat oleh guru Anda secara otomatis."
                  : "Anda belum mencapai nilai KKM. Tetap semangat dan terus belajar. Hasil ini telah dicatat oleh guru Anda."}
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer Note ── */}
        <div className="bg-slate-50 py-4 px-8 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Halaman ini dapat Anda screenshot sebagai bukti pengerjaan.
            <br />
            Jangan tutup halaman ini sebelum mencatat nilai Anda.
          </p>
        </div>
      </div>
    </div>
  );
}