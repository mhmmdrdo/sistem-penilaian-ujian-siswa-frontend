// // "use client";

// // import { useEffect, useState } from "react";
// // import { useRouter, useSearchParams } from "next/navigation";
// // import { GraduationCap, Clock, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

// // export default function InstruksiUjianPage() {
// //   const router = useRouter();
// //   const searchParams = useSearchParams();
// //   const sesiId = searchParams.get("sesiId");
// //   const ujianId = searchParams.get("ujianId");
  
// //   const [ujian, setUjian] = useState<{
// //     id: string;
// //     nama: string;
// //     kelas: string;
// //     durasi: number;
// //     status: string;
// //     namaSekolah: string;
// //   } | null>(null);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     if (!ujianId) return;

// //     fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/ujian/${ujianId}`)
// //       .then(res => res.json())
// //       .then(data => {
// //         setUjian(data);
// //         setLoading(false);
// //       })
// //       .catch(() => setLoading(false));
// //   }, [ujianId]);

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-slate-50">
// //         <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
// //       <div className="w-full max-w-2xl space-y-8">
// //         <div className="text-center">
// //           <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
// //             <GraduationCap className="w-8 h-8 text-white" />
// //           </div>
// //           <h1 className="text-2xl font-semibold text-zinc-900">Instruksi Ujian</h1>
// //         </div>

// //         {ujian && (
// //           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
// //             <div>
// //               <h2 className="text-xl font-bold text-zinc-900">{ujian.nama}</h2>
// //               <p className="text-sm text-slate-500 mt-1">{ujian.namaSekolah} • Kelas {ujian.kelas}</p>
// //             </div>

// //             <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
// //               <Clock className="w-5 h-5 text-blue-600" />
// //               <div>
// //                 <p className="text-sm font-medium text-blue-900">Durasi Ujian</p>
// //                 <p className="text-2xl font-bold text-blue-600">{ujian.durasi} menit</p>
// //               </div>
// //             </div>

// //             <div className="space-y-4">
// //               <h3 className="font-semibold text-zinc-900">Peraturan Ujian:</h3>
// //               <div className="space-y-3">
// //                 {[
// //                   "Pastikan koneksi internet stabil selama ujian",
// //                   "Dilarang membuka tab lain atau beralih aplikasi",
// //                   "Dilarang melakukan screenshot atau screen recording",
// //                   "Pelanggaran akan dicatat dan dapat mengakibatkan ujian dihentikan",
// //                   "Pastikan baterai perangkat cukup selama ujian",
// //                 ].map((rule, i) => (
// //                   <div key={i} className="flex items-start gap-3">
// //                     <div className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
// //                       <span className="text-xs font-bold text-zinc-600">{i + 1}</span>
// //                     </div>
// //                     <p className="text-sm text-zinc-600">{rule}</p>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>

// //             <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-xl border border-amber-100">
// //               <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
// //               <p className="text-sm text-amber-700">
// //                 Dengan mengklik "Mulai Ujian", Anda menyatakan siap mengikuti ujian sesuai peraturan.
// //               </p>
// //             </div>

// //             <button
// //               onClick={() => router.push(`/siswa/ujian?sesiId=${sesiId}&ujianId=${ujianId}`)}
// //               className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-800 transition-all"
// //             >
// //               Mulai Ujian
// //               <ArrowRight className="w-4 h-4" />
// //             </button>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useParams, useSearchParams } from "next/navigation";
// import { GraduationCap, Clock, AlertTriangle, ArrowRight, Loader2, AlertCircle } from "lucide-react";

// // Letakkan file ini di:
// // app/siswa/instruksi-ujian/[ujianId]/page.tsx

// type UjianInfo = {
//   id: string;
//   nama: string;
//   kelas: string;
//   durasi: number;
//   status: string;
//   namaSekolah: string;
//   namaGuru: string;
// };

// export default function InstruksiUjianPage() {
//   const router = useRouter();
//   const { ujianId } = useParams<{ ujianId: string }>();
//   const searchParams = useSearchParams();
//   const sesiId = searchParams.get("sesiId");

//   const [ujian, setUjian] = useState<UjianInfo | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!ujianId) return;

//     fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/ujian/${ujianId}`)
//       .then(async (res) => {
//         // Tangani response kosong / non-JSON
//         const text = await res.text();
//         if (!text) throw new Error("Respons server kosong");
//         const data = JSON.parse(text);
//         if (!res.ok) throw new Error(data.message || "Ujian tidak ditemukan");
//         setUjian(data);
//       })
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   }, [ujianId]);

//   // Validasi: sesiId harus ada
//   if (!sesiId) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
//         <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
//           <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
//           <h2 className="text-base font-bold text-zinc-900 mb-1">Sesi tidak valid</h2>
//           <p className="text-[13px] text-slate-500">
//             Silakan kembali ke halaman akses ujian dan masuk kembali.
//           </p>
//           <button
//             onClick={() => router.back()}
//             className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800"
//           >
//             Kembali
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
//       </div>
//     );
//   }

//   if (error || !ujian) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
//         <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
//           <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
//           <h2 className="text-base font-bold text-zinc-900 mb-1">Ujian tidak tersedia</h2>
//           <p className="text-[13px] text-slate-500">{error || "Data ujian tidak ditemukan."}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
//       <div className="w-full max-w-2xl space-y-8">
//         <div className="text-center">
//           <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <GraduationCap className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-2xl font-semibold text-zinc-900">Instruksi Ujian</h1>
//           <p className="text-sm text-slate-500 mt-1">{ujian.namaSekolah}</p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
//           <div>
//             <h2 className="text-xl font-bold text-zinc-900">{ujian.nama}</h2>
//             <p className="text-sm text-slate-500 mt-1">
//               Kelas {ujian.kelas} • Dibuat oleh:{" "}
//               <span className="font-medium text-zinc-700">{ujian.namaGuru}</span>
//             </p>
//           </div>

//           <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
//             <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
//             <div>
//               <p className="text-sm font-medium text-blue-900">Durasi Ujian</p>
//               <p className="text-2xl font-bold text-blue-600">{ujian.durasi} menit</p>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <h3 className="font-semibold text-zinc-900">Peraturan Ujian:</h3>
//             <div className="space-y-3">
//               {[
//                 "Pastikan koneksi internet stabil selama ujian",
//                 "Dilarang membuka tab lain atau beralih aplikasi",
//                 "Dilarang melakukan screenshot atau screen recording",
//                 "Pelanggaran akan dicatat dan dapat mengakibatkan ujian dihentikan",
//                 "Pastikan baterai perangkat cukup selama ujian",
//               ].map((rule, i) => (
//                 <div key={i} className="flex items-start gap-3">
//                   <div className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//                     <span className="text-xs font-bold text-zinc-600">{i + 1}</span>
//                   </div>
//                   <p className="text-sm text-zinc-600">{rule}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-xl border border-amber-100">
//             <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
//             <p className="text-sm text-amber-700">
//               Dengan mengklik "Mulai Ujian", Anda menyatakan siap mengikuti ujian sesuai peraturan.
//             </p>
//           </div>

//           <button
//             onClick={() =>
//               router.push(`/siswa/ujian/${ujianId}?sesiId=${sesiId}`)
//             }
//             className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-800 transition-all"
//           >
//             Mulai Ujian
//             <ArrowRight className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Info,
  AlertTriangle,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Letakkan file ini di:
// app/siswa/instruksi-ujian/[ujianId]/page.tsx

type UjianInfo = {
  id: string;
  nama: string;
  kelas: string;
  durasi: number;
  status: string;
  namaSekolah: string;
  namaGuru: string;
  jumlahSoal?: number;
};

const instructions = [
  "Bacalah setiap soal dengan seksama sebelum menjawab.",
  "Pilih jawaban yang paling tepat dan klik untuk memilih.",
  "Anda dapat mengubah jawaban kapan saja sebelum waktu ujian habis.",
  "Perhatikan batas waktu pengerjaan ujian yang tertera.",
  "Sistem akan otomatis menyimpan jawaban Anda setiap kali memilih opsi.",
  "Pastikan koneksi internet Anda stabil selama pengerjaan ujian.",
  "Jangan membuka tab atau aplikasi lain selama ujian berlangsung.",
  "Setelah waktu habis, sistem akan otomatis mengirim jawaban Anda.",
];

export default function InstruksiUjianPage() {
  const router = useRouter();
  const { ujianId } = useParams<{ ujianId: string }>();
  const searchParams = useSearchParams();
  const sesiId = searchParams.get("sesiId");

  const [ujian, setUjian] = useState<UjianInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

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
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ujianId]);

  // Validasi: sesiId harus ada
  if (!sesiId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-zinc-900 mb-1">
            Sesi tidak valid
          </h2>
          <p className="text-[13px] text-slate-500">
            Silakan kembali ke halaman akses ujian dan masuk kembali.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  if (error || !ujian) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-zinc-900 mb-1">
            Ujian tidak tersedia
          </h2>
          <p className="text-[13px] text-slate-500">
            {error || "Data ujian tidak ditemukan."}
          </p>
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
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Instruksi Pengerjaan
            </h2>
            <p className="text-[13px] font-semibold text-zinc-600">
              {ujian.namaSekolah}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          {/* Judul Ujian */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/30">
            <h1 className="text-[16px] font-bold text-zinc-900 leading-tight">
              {ujian.nama}
            </h1>
            <p className="text-[12px] text-slate-500 mt-1">
              Oleh: <span className="font-medium text-zinc-700">{ujian.namaGuru}</span>
            </p>

            <div className="flex flex-wrap gap-1.5 mt-3">
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
          </div>

          {/* Konten */}
          <div className="p-5 space-y-6">
            {/* Petunjuk */}
            <div className="space-y-3">
              <h2 className="text-[13px] font-bold text-zinc-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500" />
                Petunjuk
              </h2>

              <ul className="space-y-2">
                {instructions.map((inst, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12px] text-slate-600"
                  >
                    <span className="min-w-[18px] h-[18px] bg-zinc-900 text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Larangan */}
            <div className="border border-red-100 bg-red-50/40 rounded-xl p-4 space-y-2">
              <h3 className="text-[12px] font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Larangan
              </h3>
              <ul className="text-[11px] text-red-700 space-y-1 list-disc pl-5">
                <li>Tab switching / minimize window</li>
                <li>Copy paste jawaban</li>
                <li>Menggunakan tools eksternal</li>
                <li>Screenshot atau screen recording</li>
                <li>Login di perangkat lain</li>
              </ul>
              <p className="text-[11px] text-red-700 font-medium">
                Pelanggaran dapat menyebabkan ujian dibatalkan.
              </p>
            </div>

            {/* Agreement & Button */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-zinc-900 cursor-pointer"
                />
                <span className="text-[12px] text-slate-500">
                  Saya memahami dan setuju dengan aturan ujian di atas.
                </span>
              </label>

              <button
                onClick={() =>
                  router.push(`/siswa/ujian/${ujianId}?sesiId=${sesiId}`)
                }
                disabled={!agreed}
                className={`w-full h-11 bg-zinc-900 text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  !agreed
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-zinc-800 active:scale-[0.98]"
                }`}
              >
                Mulai Ujian
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[11px] text-red-500">
                Jangan keluar dari halaman selama ujian berlangsung
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400">
          Butuh bantuan?{" "}
          <a href="#" className="underline hover:text-slate-600 transition-colors">
            Hubungi Pengawas
          </a>
        </p>
      </div>
    </div>
  );
}