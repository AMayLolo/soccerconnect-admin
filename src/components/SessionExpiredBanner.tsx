"use client";

import { useEffect, useState } from "react";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function clearCookie(name: string) {
  // expire it immediately for this domain/path
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
}

export function SessionExpiredBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // run asynchronously so setShow isn't called synchronously in the effect body
    const id = setTimeout(() => {
      const flag = readCookie("session_expired");
      if (flag === "1") {
        setShow(true);
        // clear so we only show once
        clearCookie("session_expired");
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  if (!show) return null;

  return (
  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm px-4 py-3 rounded-lg shadow-lg ring-1 ring-red-400 animate-fade-in z-1000">
      <span className="font-medium">Session expired.</span>{" "}
      <span className="opacity-90">Please sign in again.</span>
    </div>
  );
}
