"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SideBar from "@/components/Sidebar";
import Header from "@/components/Header";
import { api, getToken } from "@/lib/api";
import {
  BookOpen,
  ClipboardList,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardData = {
  totalSoal: number;
  ujianAktif: number;
  totalGuru: number;
  rataRataNilai: number;
  ujianBerlangsung: Array<{
    id: string;
    nama: string;
    namaSekolah: string;
    namaGuru: string;
    kelas: string;
    peserta: string;
    status: string;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    nip?: string;
    namaSekolah?: string;
    isActive: boolean;
    createdAt: string;
  }>;
};

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  badge?: string;
  isLive?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#0ea5e9", "#f97316",
];

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function formatStatus(status: string): {
  label: string;
  badgeClass: string;
  isLive: boolean;
} {
  const s = status.toUpperCase();
  if (s === "BERLANGSUNG")
    return { label: "BERLANGSUNG", badgeClass: "badge-blue", isLive: true };
  if (s === "AKTIF")
    return { label: "AKTIF", badgeClass: "badge-green", isLive: false };
  if (s === "SELESAI")
    return { label: "SELESAI", badgeClass: "badge-slate", isLive: false };
  return { label: s, badgeClass: "badge-slate", isLive: false };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, badge, isLive }: StatCardProps) {
  return (
    <div className="stat-card bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-start mb-3">
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        router.push("/auth/login");
        return;
      }
      try {
        const res = await api.get<DashboardData>("/admin/dashboard");
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 fixed md:relative z-50`}
      >
        <SideBar role="admin" />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Dashboard"
          showHamburger
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-10 space-y-8">

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* ── Welcome Banner ─────────────────────────────── */}
            <div className="bg-zinc-900 rounded-2xl p-7 md:p-8 relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <p className="text-zinc-400 text-[12px] font-semibold uppercase tracking-widest">
                  Selamat Datang
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Admin Dashboard 👋
                </h1>
                <p className="text-zinc-400 text-sm capitalize">{today}</p>
                <div className="pt-3">
                  <Link
                    href="/admin/manajemen-user"
                    className="inline-flex items-center gap-2 bg-white text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-100 transition-colors shadow-sm"
                  >
                    Kelola Pengguna
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-zinc-800/50 rounded-full blur-3xl" />
              <div className="absolute right-12 top-4 w-24 h-24 bg-zinc-700/30 rounded-full blur-xl" />
            </div>

            {/* ── Stats ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<BookOpen className="text-zinc-600 w-5 h-5" />}
                value={data?.totalSoal ?? 0}
                label="Total Soal"
              />
              <StatCard
                icon={<ClipboardList className="text-zinc-600 w-5 h-5" />}
                value={data?.ujianAktif ?? 0}
                label="Ujian Aktif"
                isLive={(data?.ujianAktif ?? 0) > 0}
              />
              <StatCard
                icon={<Users className="text-zinc-600 w-5 h-5" />}
                value={data?.totalGuru ?? 0}
                label="Total Guru"
              />
              <StatCard
                icon={<TrendingUp className="text-zinc-600 w-5 h-5" />}
                value={data?.rataRataNilai?.toFixed(1) ?? "0.0"}
                label="Rata-rata Nilai"
              />
            </div>

            {/* ── Exam Table ─────────────────────────────────── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-900">
                  Ujian Berlangsung & Mendatang
                </h2>
                <button
                  onClick={() => router.push("/admin/mata-pelajaran")}
                  className="text-[13px] text-slate-400 hover:text-zinc-900 font-medium transition-colors"
                >
                  Lihat Semua →
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {!data?.ujianBerlangsung?.length ? (
                  <p className="text-gray-400 text-sm text-center py-10">
                    Tidak ada ujian berlangsung
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Nama Ujian
                          </th>
                          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">
                            Nama Sekolah
                          </th>
                          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">
                            Nama Guru
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
                          <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.ujianBerlangsung.map((exam) => {
                          const st = formatStatus(exam.status);
                          return (
                            <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3.5 font-medium text-zinc-900">
                                {exam.nama}
                              </td>
                              <td className="px-5 py-3.5 text-slate-500 hidden lg:table-cell">
                                {exam.namaSekolah}
                              </td>
                              <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">
                                {exam.namaGuru}
                              </td>
                              <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">
                                {exam.kelas}
                              </td>
                              <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">
                                {exam.peserta}
                              </td>
                              <td className="px-5 py-3.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                    st.badgeClass === "badge-blue"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : st.badgeClass === "badge-green"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-slate-100 text-slate-600 border-slate-200"
                                  }`}
                                >
                                  {st.isLive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                  )}
                                  {st.label}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <button className="h-7 px-3 border border-slate-200 rounded-lg text-[11px] font-semibold hover:bg-slate-50 transition-colors">
                                  {exam.status.toUpperCase() === "SELESAI"
                                    ? "Laporan"
                                    : exam.status.toUpperCase() === "DRAFT"
                                    ? "Edit"
                                    : "Detail"}
                                </button>
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

            {/* ── Pengguna Terbaru ────────────────────────────── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-900">
                  Pengguna Terbaru
                </h2>
                <Link
                  href="/admin/manajemen-user"
                  className="text-[13px] text-slate-400 hover:text-zinc-900 font-medium transition-colors"
                >
                  Kelola Semua →
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {!data?.recentUsers?.length ? (
                  <p className="text-gray-400 text-sm text-center py-10">
                    Tidak ada data user
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Pengguna
                          </th>
                          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">
                            NIP
                          </th>
                          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">
                            Nama Sekolah
                          </th>
                          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Role
                          </th>
                          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Status
                          </th>
                          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden sm:table-cell">
                            Bergabung
                          </th>
                          <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.recentUsers.map((user, i) => (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                                  style={{ backgroundColor: getAvatarColor(i) }}
                                >
                                  {getInitials(user.name)}
                                </div>
                                <div>
                                  <p className="font-semibold text-zinc-900 text-[13px]">
                                    {user.name}
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell text-[12px]">
                              {user.nip ?? "—"}
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 hidden lg:table-cell text-[12px]">
                              {user.namaSekolah ?? "—"}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                  user.role.toUpperCase() === "ADMIN"
                                    ? "bg-zinc-900 text-white border-zinc-900"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {user.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              {user.isActive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                  <CheckCircle className="w-3 h-3" />
                                  Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                  <XCircle className="w-3 h-3" />
                                  Nonaktif
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell text-[12px]">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button className="h-7 px-3 border border-slate-200 rounded-lg text-[11px] font-semibold hover:bg-slate-50 transition-colors">
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))}
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