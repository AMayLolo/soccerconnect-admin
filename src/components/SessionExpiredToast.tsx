"use client";

import { useState, useEffect } from "react";

export default function SessionExpiredToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setVisible(true);
      setTimeout(() => {
        // give them ~3 s to read, then send to login
        window.location.href = "/login?expired=1";
      }, 3000);
    };

    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg animate-fadeIn">
      Session expired — please sign in again
    </div>
  );
}
