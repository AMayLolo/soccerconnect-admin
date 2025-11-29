"use client";

import * as React from "react";

export function Dialog({ children, open, onOpenChange }: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <div>
      {children}
    </div>
  );
}

export function DialogTrigger({ children, asChild }: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  return <>{children}</>;
}

export function DialogContent({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`}>
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
}

export function DialogDescription({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
}
