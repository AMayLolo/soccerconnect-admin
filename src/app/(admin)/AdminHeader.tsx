"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function AdminHeader() {
  const pathname = usePathname();

  const parts = pathname
    .replace("/admin", "")
    .split("/")
    .filter(Boolean);

  const breadcrumbs = parts.length
    ? parts.map((part, index) => ({
        label: part.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        href: "/admin/" + parts.slice(0, index + 1).join("/"),
      }))
    : [];

  return (
    <div className="h-16 border-b flex items-center justify-between px-4 lg:px-8 bg-card">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:underline">
          Admin
        </Link>

        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-2">
            <span>/</span>
            <Link href={crumb.href} className="hover:underline">
              {crumb.label}
            </Link>
          </div>
        ))}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
