"use client";

import * as React from "react";

export function Select({ children, value, onValueChange }: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <div className="relative">
      {children}
    </div>
  );
}

export function SelectTrigger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <button className={`flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md ${className}`}>
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span>{placeholder}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
      {children}
    </div>
  );
}

export function SelectItem({ children, value }: { children: React.ReactNode; value: string }) {
  return (
    <div className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">
      {children}
    </div>
  );
}
