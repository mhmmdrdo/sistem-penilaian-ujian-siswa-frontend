import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Decode JWT tanpa library (karena middleware Next.js berjalan di Edge Runtime)
function decodeJwt(token: string): { role?: string } | null {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ["/admin"],
  GURU: ["/guru"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ambil token dari cookie (lihat catatan di bawah)
  const token = request.cookies.get("token")?.value;

  // Tentukan role yang diizinkan untuk path ini
  const requiredRole = Object.entries(ROLE_ROUTES).find(([, paths]) =>
    paths.some((p) => pathname.startsWith(p))
  )?.[0];

  // Kalau bukan route yang diproteksi, lanjutkan
  if (!requiredRole) return NextResponse.next();

  // Tidak ada token → redirect ke login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const payload = decodeJwt(token);

  // Token invalid atau role tidak sesuai → redirect ke halaman yang benar
  if (!payload || payload.role !== requiredRole) {
    const correctPath =
      payload?.role === "ADMIN" ? "/admin/dashboard" : "/guru/dashboard";
    return NextResponse.redirect(new URL(correctPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/guru/:path*"],
};