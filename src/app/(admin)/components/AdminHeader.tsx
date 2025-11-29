"use client";

import Link from "next/link";

export default function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Admin Dashboard</h1>

      <Link href="/admin/login" className="text-gray-600 hover:text-black">
        Logout
      </Link>
    </header>
  );
}
