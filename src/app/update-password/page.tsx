"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function UpdatePasswordPage() {
  const supabase = getSupabaseBrowserClient();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordInputType = useMemo(() => (showPassword ? "text" : "password"), [showPassword]);

  useEffect(() => {
    let cancelled = false;

    const ensureRecoverySession = async () => {
      if (typeof window === "undefined") return;

      const hashParams = new URLSearchParams(
        window.location.hash.startsWith("#") ? window.location.hash.slice(1) : ""
      );
      const searchParams = new URLSearchParams(window.location.search);

      const hasCodeParam = searchParams.has("code");
      const tokenHash = searchParams.get("token_hash");
      const hasTokenInHash = hashParams.has("access_token") || hashParams.has("refresh_token");
      const hasRecoveryType = hashParams.get("type") === "recovery" || searchParams.get("type") === "recovery";

      try {
        let sessionEstablished = false;

        if (hasCodeParam || tokenHash || hasTokenInHash || hasRecoveryType) {
          if (hasCodeParam) {
            const code = searchParams.get("code");
            if (code) {
              const { data, error } = await supabase.auth.exchangeCodeForSession(code);
              if (error) throw error;
              if (data?.session) {
                const { error: setSessionError } = await supabase.auth.setSession({
                  access_token: data.session.access_token,
                  refresh_token: data.session.refresh_token,
                });
                if (setSessionError) throw setSessionError;
                sessionEstablished = true;
              }
            }
          } else if (tokenHash) {
            const { data, error } = await supabase.auth.verifyOtp({
              type: "recovery",
              token_hash: tokenHash,
            });
            if (error) throw error;
            if (data?.session) {
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
              });
              if (setSessionError) throw setSessionError;
              sessionEstablished = true;
            }
          } else if (hasTokenInHash || hasRecoveryType) {
            const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
            if (error) throw error;
            if (data?.session) {
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
              });
              if (setSessionError) throw setSessionError;
              sessionEstablished = true;
            }
          }

          window.history.replaceState({}, document.title, "/update-password");
        }

        if (!sessionEstablished) {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            sessionEstablished = true;
          }
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!cancelled) {
          if (userError || !user) {
            setSessionReady(false);
            setError(
              sessionEstablished
                ? "We couldn't load your account details. Request a new reset link and try again."
                : "Password reset link is invalid or expired. Request a new link and try again."
            );
          } else {
            setSessionReady(true);
            setError("");
          }
        }
      } catch (recoveryError: any) {
        if (!cancelled) {
          const details =
            recoveryError?.message ||
            (typeof recoveryError === "string" ? recoveryError : "Password reset link is invalid or expired.");
          console.error("[UpdatePasswordPage] Unable to process reset link", recoveryError);
          setError(details);
          setSessionReady(false);
        }
      }
    };

    ensureRecoverySession();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    setSaving(true);

    const {
      data: { user },
      error: fetchError,
    } = await supabase.auth.getUser();

    if (fetchError || !user) {
      setSaving(false);
      setSessionReady(false);
      setError("Password reset link is invalid or expired. Request a new link and try again.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password successfully updated! You can now log in.");
      setSessionReady(false);
      setPassword("");
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleUpdate}
        className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Update Password
        </h1>
        <p className="text-center text-gray-500 text-sm mb-2">
          Enter your new password below.
        </p>

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        {message && (
          <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">
            {message}
          </div>
        )}

        <div className="relative">
          <input
            type={passwordInputType}
            placeholder="New Password"
            className="w-full border rounded p-2 pr-11 focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 hover:text-neutral-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={!sessionReady || saving}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Updating..." : "Update Password"}
        </button>

        <div className="text-center text-sm mt-2">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
