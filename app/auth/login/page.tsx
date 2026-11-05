"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post<{
        token: string;
        user: { role: string; name: string; email: string };
      }>("/auth/login", { email, password });

      setToken(res.token);
      
      if (res.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/guru/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email atau kata sandi salah");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:w-[45%] bg-slate-900 flex-col justify-between p-16 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <GraduationCap className="text-slate-900 text-2xl" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">Sistem Penilaian Siswa</span>
          </div>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-semibold leading-tight">
              Platform Ujian Digital <br />
              <span className="text-slate-400 font-normal">untuk Sekolah Indonesia</span>
            </h1>

            <div className="space-y-6 mt-12">
              <div className="flex items-start gap-4">
                <CheckCircle className="text-zinc-400 text-2xl mt-1" />
                <div>
                  <h3 className="font-medium text-lg">Anti-kecurangan otomatis</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Sistem pengawasan cerdas untuk menjaga integritas ujian siswa secara real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="text-zinc-400 text-2xl mt-1" />
                <div>
                  <h3 className="font-medium text-lg">Nilai instan setelah ujian</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Proses penilaian otomatis untuk pilihan ganda, hasil langsung tersedia bagi guru dan siswa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="text-zinc-400 text-2xl mt-1" />
                <div>
                  <h3 className="font-medium text-lg">Kelola soal & kisi-kisi mudah</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Bank soal terpusat memudahkan pembuatan paket ujian dan penyusunan kisi-kisi standar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 text-sm">&copy; 2026 ExamHub. Hak Cipta Dilindungi.</p>
        </div>

        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-64 h-64 bg-slate-800/30 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-white text-3xl" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900">Masuk ke Akun</h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Selamat datang kembali, silakan masuk ke dashboard Anda.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-slate-400 text-lg" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-slate-400 text-lg" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="text-lg" /> : <Eye className="text-lg" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-800 focus:ring-4 focus:ring-zinc-900/10 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin text-lg" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">atau</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Belum punya akun?
              <Link href="/auth/register" className="font-medium text-zinc-900 hover:underline">
                {" "}Daftar sebagai Guru &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
