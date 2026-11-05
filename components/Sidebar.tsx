"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  MoreVertical,
  UserCircle,
  LogOut,
} from "lucide-react";
import { api, getToken } from "@/lib/api"; // Pastikan import 'api' ditambahkan

interface SidebarProps {
  role: "admin" | "guru";
}

export default function Sidebar({ role }: SidebarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isAdmin = role === "admin";
  const basePath = isAdmin ? "/admin" : "/guru";

  useEffect(() => {
    // FUNGSI BARU: Ambil data user dari API agar sinkron dengan Profile
    const fetchUserData = async () => {
      const token = getToken();
      if (!token) return;

      try {
        // Coba ambil dari API profil agar datanya akurat
        const data = await api.get<{ name: string; role: string }>("/profil");
        setUser({ name: data.name, role: data.role });
      } catch (error) {
        // Jika API gagal, fallback ke decoding token (seperti kode lama Anda)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({ 
            name: payload.name || "User", 
            role: payload.role || role 
          });
        } catch {
          setUser({ name: "User", role: role });
        }
      }
    };

    fetchUserData();

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [role]);

  // Logic initials tetap sama
  const initials = user?.name 
    ? user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <aside className="w-[248px] min-h-screen bg-white border-r border-slate-200 flex flex-col">
      {/* ... bagian logo sama ... */}
      <div className="h-14 flex items-center px-5 border-b border-slate-100 flex-shrink-0">
        <Link href={`${basePath}/dashboard`} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white text-lg" />
          </div>
          <span className="font-bold text-zinc-900 text-[15px] tracking-tight">Sistem Penilaian</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        <Link
          href={`${basePath}/dashboard`}
          className={`nav-link ${pathname === `${basePath}/dashboard` ? "active" : ""}`}
        >
          <LayoutDashboard className="text-[18px] flex-shrink-0" />
          Dashboard
        </Link>
        <Link
          href={`${basePath}/mata-pelajaran`}
          className={`nav-link ${pathname.startsWith(`${basePath}/mata-pelajaran`) ? "active" : ""}`}
        >
          <BookOpen className="text-[18px] flex-shrink-0" />
          Mata Pelajaran
        </Link>
        {isAdmin && (
          <Link
            href={`${basePath}/manajemen-user`}
            className={`nav-link ${pathname === `${basePath}/manajemen-user` ? "active" : ""}`}
          >
            <Users className="text-[18px] flex-shrink-0" />
            Manajemen User
          </Link>
        )}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-slate-100 flex-shrink-0 relative" ref={menuRef}>
        {showMenu && (
          <div className="absolute left-4 right-4 bottom-[76px] bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
            <div className="p-1.5 space-y-0.5">
              <Link
                href="/profile"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-700 hover:bg-slate-50 transition-colors"
              >
                <UserCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                Profile
              </Link>
              <Link
                href="/profile/logout"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Logout
              </Link>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none"
        >
          <div className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] font-semibold text-zinc-900 truncate">
              {user?.name || "Loading..."} 
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.role === "ADMIN" ? "Administrator" : "Guru"}
            </p>
          </div>
          <MoreVertical className="text-slate-400 text-base flex-shrink-0" />
        </button>
      </div>
    </aside>
  );
}