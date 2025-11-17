'use client';

import React, { useState } from 'react';
import SidebarNav from './SidebarNav';
import Link from 'next/link';

export default function MobileSidebar({
  userEmail,
  role,
}: {
  userEmail: string | null;
  role: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button (mobile only) */}
      <button
        className="md:hidden inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        {/* icon: three bars */}
        <span className="flex flex-col gap-[3px]">
          <span className="block h-[2px] w-5 bg-gray-700 rounded" />
          <span className="block h-[2px] w-5 bg-gray-700 rounded" />
          <span className="block h-[2px] w-5 bg-gray-700 rounded" />
        </span>
      </button>

      {/* Overlay + drawer */}
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* dark backdrop */}
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* drawer panel */}
          <div className="relative ml-0 h-full w-72 max-w-[80%] bg-white shadow-xl flex flex-col border-r border-gray-200">
            {/* Header with app + close */}
            <div className="flex items-start justify-between p-4 border-b border-gray-200">
              <div className="flex items-start gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-600 text-white font-semibold">
                  SC
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 leading-tight">
                    SoccerConnect
                  </span>
                  <span className="text-xs text-gray-500 leading-tight">
                    Admin console
                  </span>
                </div>
              </div>

              <button
                className="ml-2 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-600 shadow-sm"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-200 text-[11px] text-gray-500 leading-snug">
              <div className="mb-1 text-gray-700 font-medium break-all">
                {userEmail ?? '—'}
              </div>
              <div className="text-gray-500">
                Role:{' '}
                <span className="font-medium text-gray-700">{role ?? '—'}</span>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto">
              <SidebarNav />
            </div>

            {/* Footer / Sign out */}
            <div className="border-t border-gray-200 p-4 text-xs text-gray-500">
              <form action="/auth/signout" method="post" className="mb-3">
                <button
                  type="submit"
                  className="w-full rounded-md border border-red-300 bg-white px-3 py-2 text-center text-[13px] font-medium text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </form>

              <div className="text-[11px] text-gray-400">
                © {new Date().getFullYear()} SoccerConnect
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
