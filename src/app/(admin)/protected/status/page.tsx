// src/app/protected/status/page.tsx
"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useCallback, useEffect, useState } from "react";

type Status = "checking" | "ok" | "error";

export default function SystemStatusPage() {
  const supabase = getSupabaseBrowserClient();

  const [supabaseStatus, setSupabaseStatus] = useState<Status>("checking");
  const [authStatus, setAuthStatus] = useState<Status>("checking");
  const [deployTime, setDeployTime] = useState<string>("");

  const checkHealth = useCallback(async () => {
    try {
      // Check if Supabase is reachable
      const { error } = await supabase.from("reviews").select("id").limit(1);
      setSupabaseStatus(error ? "error" : "ok");

      // Check auth API
      const { data: userData, error: authError } = await supabase.auth.getUser();
      setAuthStatus(authError ? "error" : "ok");

      // Set build info
      const build = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
        ? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 7)
        : "local";
      const time = new Date().toLocaleString();
      setDeployTime(`${build} • ${time}`);
    } catch (err) {
      console.error(err);
      setSupabaseStatus("error");
      setAuthStatus("error");
    }
  }, [supabase]);

  useEffect(() => {
    const run = async () => {
      await checkHealth();
    };
    run();
  }, [checkHealth]);

  const Indicator = ({ status }: { status: Status }) => {
    const color =
      status === "ok"
        ? "bg-green-500"
        : status === "error"
        ? "bg-red-500"
        : "bg-yellow-400";
    return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Status</h1>
        <p className="text-gray-600">
          Live operational health of core services
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          label="Supabase Database"
          status={supabaseStatus}
          description="Checks API connection & read access."
        />
        <StatusCard
          label="Auth Service"
          status={authStatus}
          description="Verifies Supabase Auth tokens and endpoints."
        />
        <StatusCard
          label="Deployment Info"
          status="ok"
          description={`Build: ${deployTime || "unknown"}`}
        />
      </div>

      <div className="mt-8 text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-200">
        Status refreshes on page load. All systems should show green when healthy.
      </div>
    </div>
  );
}

function StatusCard({
  label,
  status,
  description,
}: {
  label: string;
  status: Status;
  description: string;
}) {
  const statusText =
    status === "ok" ? "Operational" : status === "error" ? "Error" : "Checking";
  const color =
    status === "ok"
      ? "text-green-600"
      : status === "error"
      ? "text-red-600"
      : "text-yellow-600";
  const bgColor =
    status === "ok"
      ? "bg-green-50 border-green-200"
      : status === "error"
      ? "bg-red-50 border-red-200"
      : "bg-yellow-50 border-yellow-200";

  return (
    <div className={`rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow ${bgColor}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-900">{label}</h2>
        <span className={`text-xs font-semibold ${color}`}>
          ● {statusText}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
