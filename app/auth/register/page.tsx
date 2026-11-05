"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Lock,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "guru",
    bidang: "",
    nip: "",
    hp: "",
  });

  const getPasswordStrength = (password: string) => {
    const checks = {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    const labels = ["", "Lemah", "Cukup", "Kuat", "Sangat Kuat"];
    const colors = ["", "text-red-500", "text-amber-500", "text-blue-500", "text-emerald-500"];
    const barColors = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"];
    return { score, checks, label: labels[score], color: colors[score], barColor: barColors[score] };
  };

  const strength = getPasswordStrength(form.password);
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === form.password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/auth/register", form);
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">Akun Berhasil Dibuat!</h2>
          <p className="text-slate-500 mb-10 leading-relaxed">
            Pendaftaran Anda telah kami terima. Silakan masuk menggunakan email dan kata sandi yang telah Anda daftarkan.
          </p>
          <Link
            href="/auth/login"
            className="w-full h-12 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            Masuk Sekarang
            <ArrowLeft className="rotate-180" size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* Header */}
        <div className="p-8 pb-0">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-xs text-slate-500 hover:text-zinc-900 transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Login
          </Link>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center mb-4">
              <UserPlus className="text-zinc-900" size={20} />
            </div>
            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Daftar sebagai Guru</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Buat akun untuk mulai membuat dan mengelola ujian digital sekolah Anda.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Data Diri */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Langkah 1: Data Diri
            </span>

            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Dr. Budi Santosa, S.Pd"
                  className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  required
                />
              </div>
            </div>

            {/* Email & NIP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="budi@gmail.com"
                    className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">
                  NIP{" "}
                  <span className="text-[10px] text-slate-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    value={form.nip}
                    onChange={(e) => setForm({ ...form, nip: e.target.value })}
                    placeholder="19850101..."
                    className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Step 2: Asal Sekolah */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Langkah 2:  Sekolah
            </span>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900"> Sekolah</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  value={form.bidang}
                  onChange={(e) => setForm({ ...form, bidang: e.target.value })}
                  placeholder="Nama sekolah atau instansi"
                  className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  required
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Step 3: Keamanan */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Langkah 3: Keamanan
            </span>

            <div className="space-y-4">
              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full h-10 pl-10 pr-10 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-zinc-900"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength */}
                {form.password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Kekuatan Sandi:{" "}
                        <span className={strength.color}>{strength.label}</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.barColor}`}
                        style={{ width: `${(strength.score / 4) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                      {[
                        { label: "Min 8 karakter", key: "minLength" as const },
                        { label: "Huruf kapital", key: "uppercase" as const },
                        { label: "Angka", key: "number" as const },
                        { label: "Simbol", key: "symbol" as const },
                      ].map(({ label, key }) => (
                        <div
                          key={key}
                          className={`flex items-center gap-2 text-[10px] ${
                            strength.checks[key] ? "text-zinc-900" : "text-zinc-300"
                          }`}
                        >
                          <CheckCircle2
                            className={`h-3 w-3 flex-shrink-0 ${strength.checks[key] ? "text-emerald-500" : ""}`}
                          />
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Konfirmasi Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-10 pr-10 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {confirmPassword.length > 0 ? (
                      <CheckCircle2
                        className={`h-4 w-4 ${passwordsMatch ? "text-emerald-500" : "text-slate-200"}`}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-slate-400 hover:text-zinc-900"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-[11px] text-red-500">Kata sandi tidak cocok.</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Memproses...
                </>
              ) : (
                "Buat Akun Guru"
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-6">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="text-zinc-900 font-semibold hover:underline">
                Masuk Sekarang
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}