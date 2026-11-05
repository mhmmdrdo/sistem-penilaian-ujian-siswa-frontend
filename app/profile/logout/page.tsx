"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { removeToken } from "@/lib/api";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: "POST",
        });
      } catch {
        // ignore error
      } finally {
        removeToken();
        router.push("/auth/login");
      }
    };

    logout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mx-auto" />
        <p className="text-slate-500">Sedang logout...</p>
      </div>
    </div>
  );
}
