'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const NAV_LINKS = [
  { href: '/protected', label: 'Dashboard' },
  { href: '/protected/reviews', label: 'Reviews' },
  { href: '/protected/flagged', label: 'Flagged' },
  { href: '/protected/reports', label: 'Reports' },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
      {NAV_LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-md px-3 py-2 font-medium transition-colors ${
              active
                ? 'bg-green-100 text-green-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
