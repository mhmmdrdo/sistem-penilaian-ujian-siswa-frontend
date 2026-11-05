"use client";
import { Suspense } from "react";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

// export default function SelesaiUjianPage() {
function SelesaiUjianPage() {

  const searchParams = useSearchParams();
  const router = useRouter();


  const nilai = parseFloat(searchParams.get("nilai") || "0");
  const benar = parseInt(searchParams.get("benar") || "0");
  const salah = parseInt(searchParams.get("salah") || "0");
  const lulus = searchParams.get("lulus") === "true";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Result Header */}
          <div className={`p-8 text-center ${lulus ? "bg-emerald-50" : "bg-red-50"}`}>
            {lulus ? (
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            <h1 className={`text-2xl font-bold ${lulus ? "text-emerald-700" : "text-red-700"}`}>
              {lulus ? "Selamat! Anda Lulus" : "Maaf, Anda Belum Lulus"}
            </h1>
          </div>

          {/* Score */}
          <div className="p-8 text-center border-b border-slate-100">
            <p className="text-sm text-slate-500 mb-2">Nilai Akhir</p>
            <p className={`text-5xl font-bold ${lulus ? "text-emerald-600" : "text-red-600"}`}>
              {Math.round(nilai)}
            </p>
            <p className="text-sm text-slate-500 mt-2">KKM: 70</p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Jawaban Benar</span>
              <span className="text-sm font-medium text-emerald-600">+ {benar}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Jawaban Salah</span>
              <span className="text-sm font-medium text-red-600">- {salah}</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-sm font-medium text-slate-900">Total Soal</span>
              <span className="text-sm font-bold text-zinc-900">{benar + salah}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Kembali ke Beranda
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function Page() {
  return (
    <Suspense fallback={null}>
      <SelesaiUjianPage />
    </Suspense>
  );
}