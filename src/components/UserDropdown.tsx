// src/components/UserDropdown.tsx
"use client";

import { useState } from "react";

export default function UserDropdown({ email }: { email: string }) {
  const [open, setOpen] = useState(false);

  function handleSignOut() {
    // hard redirect so we actually run the server route
    window.location.href = "/api/auth/signout";
  }

  return (
    <div className="relative">
      {/* button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-left text-sm text-neutral-800 shadow-sm hover:bg-neutral-50"
      >
        <div className="flex flex-col leading-tight text-left">
          <span className="font-medium text-neutral-900 text-xs">
            {email}
          </span>
          <span className="text-[10px] text-neutral-500">Admin</span>
        </div>

        {/* avatar circle */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-semibold text-white">
          {email
            ? email.substring(0, 2).toUpperCase()
            : "SC"}
        </div>
      </button>

      {/* menu */}
      {open && (
        <div
          className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-neutral-200 bg-white p-2 text-sm shadow-xl"
          role="menu"
        >
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50 text-[13px] font-medium"
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
