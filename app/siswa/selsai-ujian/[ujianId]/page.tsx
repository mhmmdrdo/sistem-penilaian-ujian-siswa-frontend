"use client";

import Link from "next/link";
import { GraduationCap, CheckCircle, XCircle, MinusCircle, Clock, CalendarCheck, ClipboardList, ShieldCheck, PartyPopper } from "lucide-react";

export default function SelesaiUjianPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[520px] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="text-center py-10">
          <div className="relative flex flex-col items-center justify-center w-28 h-28 mx-auto rounded-full border-4 border-zinc-900 mb-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Nilai</span>
            <span className="text-3xl font-bold text-zinc-900 tracking-tight">82.50</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-4">
            <CheckCircle className="text-sm" />
            Lulus
          </span>

          <h1 className="text-2xl font-semibold text-zinc-900">Ujian Selesai!</h1>
          <p className="text-sm text-slate-500 mt-1">Matematika Peminatan — Kelas X IPA 2</p>
        </div>

        <hr className="border-slate-100 mx-8" />

        <div className="px-8 py-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-center">
              <CheckCircle className="text-emerald-600 text-xl mx-auto mb-1" />
              <p className="text-[11px] font-medium text-slate-500 uppercase">Benar</p>
              <p className="text-sm font-semibold text-zinc-900">33 Soal</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-center">
              <XCircle className="text-red-500 text-xl mx-auto mb-1" />
              <p className="text-[11px] font-medium text-slate-500 uppercase">Salah</p>
              <p className="text-sm font-semibold text-zinc-900">7 Soal</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-center">
              <MinusCircle className="text-slate-400 text-xl mx-auto mb-1" />
              <p className="text-[11px] font-medium text-slate-500 uppercase">Kosong</p>
              <p className="text-sm font-semibold text-zinc-900">0 Soal</p>
            </div>
          </div>
        </div>

        <hr className="border-slate-100 mx-8" />

        <div className="px-8 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                <Clock className="text-lg" />
              </div>
              <span className="text-sm text-slate-600">Durasi Pengerjaan</span>
            </div>
            <span className="text-sm font-medium text-zinc-900">67 menit 23 detik</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                <CalendarCheck className="text-lg" />
              </div>
              <span className="text-sm text-slate-600">Waktu Submit</span>
            </div>
            <span className="text-sm font-medium text-zinc-900">12 Apr 2026, 09:07 WIB</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                <ClipboardList className="text-lg" />
              </div>
              <span className="text-sm text-slate-600">Total Soal</span>
            </div>
            <span className="text-sm font-medium text-zinc-900">40 Soal</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="text-lg" />
              </div>
              <span className="text-sm text-slate-600">Pelanggaran</span>
            </div>
            <span className="text-sm font-medium text-emerald-700">0 Pelanggaran</span>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex gap-3">
            <PartyPopper className="text-zinc-900 text-xl mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-zinc-900">Bagus Sekali!</p>
              <p className="text-sm text-slate-600">Selamat! Anda berhasil menyelesaikan ujian dengan baik. Hasil ini telah dicatat oleh guru Anda secara otomatis.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 py-4 px-8 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Halaman ini dapat Anda screenshot sebagai bukti pengerjaan.
            <br />Jangan tutup halaman ini sebelum mencatat nilai Anda.
          </p>
        </div>
      </div>
    </div>
  );
}