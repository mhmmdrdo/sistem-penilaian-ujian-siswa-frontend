// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import Sidebar from "@/components/Sidebar";
// import Header from "@/components/Header";
// import { api, getToken } from "@/lib/api";
// import {
//   BookOpen,
//   ClipboardList,
//   TrendingUp,
//   ArrowRight,
//   Loader2,
//   AlertCircle,
// } from "lucide-react";

// function StatCard({ icon, value, label, badge, isLive }: { 
//   icon: React.ReactNode; 
//   value: string | number; 
//   label: string; 
//   badge?: string;
//   isLive?: boolean;
// }) {
//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//       <div className="flex justify-between items-start mb-3">
//         <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">{icon}</div>
//         {badge && <span className="badge badge-green">{badge}</span>}
//         {isLive && (
//           <div className="flex items-center gap-1.5">
//             <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
//             <span className="text-[11px] font-bold text-blue-600">Live</span>
//           </div>
//         )}
//       </div>
//       <p className="text-3xl font-bold text-zinc-900">{value}</p>
//       <p className="text-[13px] text-slate-500 font-medium mt-0.5">{label}</p>
//     </div>
//   );
// }

// export default function GuruDashboard() {
//   const router = useRouter();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [matpelData, setMatpelData] = useState({ total: 0, breakdown: [] });
//   const [examData, setExamData] = useState([]);
//   const [activities, setActivities] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const token = getToken();
//       if (!token) { router.push("/auth/login"); return; }

//       try {
//         const res = await api.get<{
//           data: Array<{ id: number; nama: string; kelas: string; totalSoal: number; totalUjian: number }>;
//           stats: { totalSoal: number; totalUjian: number };
//         }>("/mata-pelajaran");
        
//         setMatpelData({
//           total: res.data.length,
//           breakdown: [
//             { label: "Ujian", count: res.stats.totalUjian, color: "badge-blue" },
//             { label: "Soal", count: res.stats.totalSoal, color: "badge-green" },
//           ],
//         });

//         // Fetch ujian for first mapel (demo)
//         if (res.data.length > 0) {
//           const ujianRes = await api.get<{ data: Array<{ nama: string; kelas: string; peserta: string; status: string }> }>(`/mata-pelajaran/${res.data[0].id}/ujian`);
//           setExamData(ujianRes.data?.slice(0, 3) || []);
//         }
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Gagal memuat data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [router]);

//   if (loading) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-gray-50">
//         <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen overflow-hidden">
//       {sidebarOpen && (
//         <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
//       )}

//       <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 fixed md:relative z-50`}>
//         <Sidebar role="guru" />
//       </div>

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <Header title="Dashboard" showHamburger onHamburgerClick={() => setSidebarOpen(true)} />

//         <div className="flex-1 overflow-y-auto">
//           <div className="p-6 md:p-10 space-y-8 fade-up">
//             {/* Welcome Banner */}
//             <div className="bg-zinc-900 rounded-2xl p-7 md:p-8 relative overflow-hidden fade-up">
//               <div className="relative z-10 space-y-2">
//                 <p className="text-zinc-400 text-[12px] font-semibold uppercase tracking-widest">Selamat Pagi</p>
//                 <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Budi Santosa 👋</h1>
//                 <p className="text-zinc-400 text-sm">Rabu, 22 April 2026</p>
//                 <div className="pt-3">
//                   <Link href="/guru/mata-pelajaran" className="inline-flex items-center gap-2 bg-white text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-100 transition-colors shadow-sm">
//                     Kelola Mata Pelajaran
//                     <ArrowRight className="w-4 h-4" />
//                   </Link>
//                 </div>
//               </div>
//               <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-zinc-800/50 rounded-full blur-3xl" />
//               <div className="absolute right-12 top-4 w-24 h-24 bg-zinc-700/30 rounded-full blur-xl" />
//             </div>

//             {error && (
//               <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600">
//                 <AlertCircle className="w-5 h-5" />
//                 {error}
//               </div>
//             )}

//             {/* Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <StatCard icon={<BookOpen className="w-4 h-4" />} value={matpelData.total} label="Mata Pelajaran" />
//               <StatCard icon={<ClipboardList className="w-4 h-4" />} value={matpelData.breakdown[0]?.count || 0} label="Total Ujian" />
//               <StatCard icon={<BookOpen className="w-4 h-4" />} value={matpelData.breakdown[1]?.count || 0} label="Total Soal" />
//             </div>

//             {/* Recent Exams */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-lg font-semibold text-gray-900">Ujian Terbaru</h2>
//                 <Link href="/guru/mata-pelajaran" className="text-sm text-zinc-900 hover:underline flex items-center gap-1">
//                   Lihat Semua <ArrowRight className="w-4 h-4" />
//                 </Link>
//               </div>

//               <div className="space-y-4">
//                 {examData.map((exam: any, i: number) => (
//                   <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
//                     <div className="flex items-start justify-between mb-2">
//                       <div>
//                         <h3 className="font-medium text-gray-900">{exam.nama}</h3>
//                         <p className="text-sm text-gray-500">{exam.kelas}</p>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         exam.status === "BERLANGSUNG" ? "bg-blue-50 text-blue-700 border border-blue-200" :
//                         exam.status === "AKTIF" ? "bg-green-50 text-green-700 border border-green-200" :
//                         "bg-gray-50 text-gray-600 border border-gray-200"
//                       }`}>
//                         {exam.status}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-4 text-sm text-gray-500">
//                       <span>Peserta: {exam.peserta}</span>
//                     </div>
//                   </div>
//                 ))}
//                 {!examData.length && (
//                   <p className="text-center text-gray-400 py-8">Belum ada ujian</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { api, getToken } from "@/lib/api";
import {
  BookOpen,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  badge?: string;
  isLive?: boolean;
}

function StatCard({ icon, value, label, badge, isLive }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-start mb-3">
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">{icon}</div>
        {badge && (
          <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
            {badge}
          </span>
        )}
        {isLive && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-bold text-blue-600">Live</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-zinc-900">{value}</p>
      <p className="text-[13px] text-slate-500 font-medium mt-0.5">{label}</p>
    </div>
  );
}

function formatStatus(status: string): { label: string; badgeClass: string; isLive: boolean } {
  const s = status.toUpperCase();
  if (s === "BERLANGSUNG") return { label: "BERLANGSUNG", badgeClass: "badge-blue", isLive: true };
  if (s === "AKTIF") return { label: "AKTIF", badgeClass: "badge-green", isLive: false };
  if (s === "SELESAI") return { label: "SELESAI", badgeClass: "badge-slate", isLive: false };
  return { label: s, badgeClass: "badge-slate", isLive: false };
}

export default function GuruDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [matpelData, setMatpelData] = useState<{
    total: number;
    breakdown: { label: string; count: number }[];
  }>({ total: 0, breakdown: [] });
  const [examData, setExamData] = useState<any[]>([]);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) { router.push("/auth/login"); return; }
      try {
        const profileRes = await api.get<{ name?: string; nama?: string; email?: string }>("/auth/me");
        setUserName(profileRes.name || profileRes.nama || "Guru");

        const res = await api.get<{
          data: Array<{ id: number; nama: string; kelas: string; totalSoal: number; totalUjian: number }>;
          stats: { totalSoal: number; totalUjian: number };
        }>("/mata-pelajaran");

        setMatpelData({
          total: res.data.length,
          breakdown: [
            { label: "Ujian", count: res.stats?.totalUjian ?? 0 },
            { label: "Soal", count: res.stats?.totalSoal ?? 0 },
          ],
        });

        // Ambil ujian dari seluruh mata pelajaran, bukan hanya mapel pertama.
        // Sebelumnya dashboard kosong jika mapel pertama belum memiliki ujian,
        // meskipun mapel lain sudah memiliki ujian.
        const examResponses = await Promise.all(
          res.data.map((mapel) =>
            api.get<{
              data: Array<{
                id: string;
                nama: string;
                kelas: string;
                peserta: string;
                status: string;
                createdAt?: string;
              }>;
            }>(`/mata-pelajaran/${mapel.id}/ujian`)
          )
        );

        const allExams = examResponses.flatMap((response) => response.data || []);
        allExams.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setExamData(allExams.slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  function getSapaan() {
    const jam = new Date().getHours();
    if (jam < 11) return "Selamat Pagi";
    if (jam < 15) return "Selamat Siang";
    if (jam < 18) return "Selamat Sore";
    return "Selamat Malam";
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 fixed md:relative z-50`}>
        <Sidebar role="guru" />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" showHamburger onHamburgerClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-10 space-y-8">

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Welcome Banner */}
            <div className="bg-zinc-900 rounded-2xl p-7 md:p-8 relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <p className="text-zinc-400 text-[12px] font-semibold uppercase tracking-widest">
                  {getSapaan()}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {userName} 👋
                </h1>
                <p className="text-zinc-400 text-sm capitalize">{today}</p>
                <div className="pt-3">
                  <Link
                    href="/guru/mata-pelajaran"
                    className="inline-flex items-center gap-2 bg-white text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-100 transition-colors shadow-sm"
                  >
                    Kelola Mata Pelajaran
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-zinc-800/50 rounded-full blur-3xl" />
              <div className="absolute right-12 top-4 w-24 h-24 bg-zinc-700/30 rounded-full blur-xl" />
            </div>

            {/* Stats — sama persis dengan admin: grid-cols-2 lg:grid-cols-4 gap-4 */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                icon={<BookOpen className="w-5 h-5 text-zinc-600" />}
                value={matpelData.total}
                label="Mata Pelajaran"
              />
              <StatCard
                icon={<ClipboardList className="w-5 h-5 text-zinc-600" />}
                value={matpelData.breakdown[0]?.count ?? 0}
                label="Total Ujian"
                isLive={(matpelData.breakdown[0]?.count ?? 0) > 0}
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5 text-zinc-600" />}
                value={matpelData.breakdown[1]?.count ?? 0}
                label="Total Soal"
              />
            </div>

            {/* Ujian Terbaru — pakai tabel compact seperti admin */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-900">Ujian Terbaru</h2>
                <Link
                  href="/guru/mata-pelajaran"
                  className="text-[13px] text-slate-400 hover:text-zinc-900 font-medium transition-colors"
                >
                  Lihat Semua →
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {!examData.length ? (
                  <p className="text-gray-400 text-sm text-center py-10">Belum ada ujian</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Nama Ujian
                          </th>
                          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden sm:table-cell">
                            Kelas
                          </th>
                          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">
                            Peserta
                          </th>
                          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {examData.map((exam: any, i: number) => {
                          const st = formatStatus(exam.status);
                          return (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3.5 font-medium text-zinc-900">{exam.nama}</td>
                              <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell text-[12px]">{exam.kelas}</td>
                              <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell text-[12px]">{exam.peserta}</td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                  st.badgeClass === "badge-blue"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : st.badgeClass === "badge-green"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}>
                                  {st.isLive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                                  {st.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
