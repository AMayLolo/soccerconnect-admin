// src/app/protected/status/page.tsx
"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useCallback, useEffect, useState } from "react";

type Status = "checking" | "ok" | "error";

export default function SystemStatusPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
    <section className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-neutral-900">System Status</h1>
        <p className="text-sm text-neutral-600">
          Live operational health of core services.
        </p>
      </header>

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

      <div className="mt-8 text-[12px] text-neutral-500">
        Status refreshes on page load. All systems should show green when healthy.
      </div>
    </section>
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

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-800">{label}</h2>
        <span className={`text-xs font-semibold ${color}`}>
          ● {statusText}
        </span>
      </div>
      <p className="mt-1 text-[13px] text-neutral-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
