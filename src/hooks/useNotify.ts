// src/hooks/useNotify.ts
"use client";

import toast from "react-hot-toast";

export const notify = {
  success: (msg: string) =>
    toast.success(msg, {
      style: {
        background: "#16a34a", // green-600
        color: "#fff",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#16a34a",
      },
    }),

  error: (msg: string) =>
    toast.error(msg, {
      style: {
        background: "#dc2626", // red-600
        color: "#fff",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#dc2626",
      },
    }),

  info: (msg: string) =>
    toast(msg, {
      style: {
        background: "#2563eb", // blue-600
        color: "#fff",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#2563eb",
      },
    }),

  neutral: (msg: string) =>
    toast(msg, {
      style: {
        background: "#333",
        color: "#fff",
      },
    }),
};
