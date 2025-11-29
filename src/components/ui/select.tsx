"use client";

import * as React from "react";

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export function Select({ children, value, onValueChange }: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = React.useContext(SelectContext);
  
  return (
    <button 
      type="button"
      onClick={() => setOpen(!open)}
      className={`flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md ${className}`}
    >
      {children}
      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string } = {}) {
  const { value } = React.useContext(SelectContext);
  
  // Map values to display text
  const displayText = value === "newest" ? "Newest" 
    : value === "highest" ? "Highest Rated"
    : value === "lowest" ? "Lowest Rated"
    : placeholder || "Select...";
  
  return <span>{displayText}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const { open } = React.useContext(SelectContext);
  
  if (!open) return null;
  
  return (
    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
      {children}
    </div>
  );
}

export function SelectItem({ children, value }: { children: React.ReactNode; value: string }) {
  const ctx = React.useContext(SelectContext);
  
  return (
    <div 
      onClick={() => {
        ctx.onValueChange?.(value);
        ctx.setOpen(false);
      }}
      className={`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${ctx.value === value ? 'bg-gray-50 font-medium' : ''}`}
    >
      {children}
    </div>
  );
}
