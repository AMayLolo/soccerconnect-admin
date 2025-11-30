"use client";

import LogoImg from "@/components/LogoImg";
import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout");
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <LogoImg className="h-8" />
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
      </div>

      <button
        onClick={handleLogout}
        className="text-gray-600 hover:text-black transition"
      >
        Logout
      </button>
    </header>
  );
}
