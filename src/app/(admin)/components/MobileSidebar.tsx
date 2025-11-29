"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-black text-white px-3 py-2 rounded-md"
        onClick={() => setOpen(true)}
      >
        Menu
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute left-0 top-0 h-full w-64 bg-white p-4">
            <AdminSidebar />
          </div>

          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-white text-xl"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
