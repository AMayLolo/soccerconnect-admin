"use client";

import * as React from "react";

export function RadioGroup({ children, value, onValueChange, className = "" }: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}

export function RadioGroupItem({ value, id, className = "" }: {
  value: string;
  id?: string;
  className?: string;
}) {
  return (
    <input
      type="radio"
      value={value}
      id={id}
      className={`w-4 h-4 text-blue-600 ${className}`}
    />
  );
}
