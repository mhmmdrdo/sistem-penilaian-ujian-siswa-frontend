"use client";
import { Suspense } from "react";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Clock, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

// export default function InstruksiUjianPage() {
function InstruksiUjianPage() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const sesiId = searchParams.get("sesiId");
  const ujianId = searchParams.get("ujianId");
  
  const [ujian, setUjian] = useState<{
    id: string;
    nama: string;
    kelas: string;
    durasi: number;
    status: string;
    namaSekolah: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ujianId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/ujian/${ujianId}`)
      .then(res => res.json())
      .then(data => {
        setUjian(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ujianId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900">Instruksi Ujian</h1>
        </div>

        {ujian && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">{ujian.nama}</h2>
              <p className="text-sm text-slate-500 mt-1">{ujian.namaSekolah} • Kelas {ujian.kelas}</p>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Durasi Ujian</p>
                <p className="text-2xl font-bold text-blue-600">{ujian.durasi} menit</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-zinc-900">Peraturan Ujian:</h3>
              <div className="space-y-3">
                {[
                  "Pastikan koneksi internet stabil selama ujian",
                  "Dilarang membuka tab lain atau beralih aplikasi",
                  "Dilarang melakukan screenshot atau screen recording",
                  "Pelanggaran akan dicatat dan dapat mengakibatkan ujian dihentikan",
                  "Pastikan baterai perangkat cukup selama ujian",
                ].map((rule, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-zinc-600">{i + 1}</span>
                    </div>
                    <p className="text-sm text-zinc-600">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Dengan mengklik "Mulai Ujian", Anda menyatakan siap mengikuti ujian sesuai peraturan.
              </p>
            </div>

            <button
              onClick={() => router.push(`/siswa/ujian?sesiId=${sesiId}&ujianId=${ujianId}`)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-800 transition-all"
            >
              Mulai Ujian
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default function Page() {
  return (
    <Suspense fallback={null}>
      <InstruksiUjianPage />
    </Suspense>
  );
}