// src/app/debug-auth/page.tsx
import { getCurrentUser } from "@/utils/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function DebugAuthPage() {
  // read raw cookies the same way Next server sees them
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll().map((c) => ({
    name: c.name,
    // NEVER show full token in prod UI, but for now we show first 12 chars
    valuePreview: c.value?.slice(0, 12) ?? "",
  }));

  // ask our auth helper what it thinks
  const result = await getCurrentUser();

  // normalize shape
  const userObj =
    result && typeof result === "object" && "user" in result
      ? (result as any).user
      : result;

  return (
    <main className="min-h-screen bg-white text-gray-900 p-8">
      <div className="max-w-xl mx-auto space-y-6">
        <section className="border border-gray-300 rounded-lg p-4 shadow">
          <h1 className="text-lg font-semibold mb-2 text-gray-900">
            Debug Auth State
          </h1>
          {!userObj ? (
            <p className="text-red-600 text-sm font-medium">
              userObj = null (server thinks you are NOT logged in)
            </p>
          ) : (
            <div className="text-green-700 text-sm font-medium">
              <div>userObj.id: {userObj.id}</div>
              <div>userObj.email: {userObj.email}</div>
            </div>
          )}
        </section>

        <section className="border border-gray-300 rounded-lg p-4 shadow">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">
            Cookies (server-side view)
          </h2>
          <pre className="text-[11px] leading-relaxed bg-gray-50 p-3 rounded border border-gray-200 text-gray-700 overflow-x-auto">
            {JSON.stringify(allCookies, null, 2)}
          </pre>
          <p className="text-xs text-gray-500 mt-2">
            We expect to see sb-access-token and sb-refresh-token here.
          </p>
        </section>

        <section className="text-xs text-gray-500">
          <p>
            Next step:
            {` `}
            If cookies are missing, it's a cookie/redirect/domain issue.
            If cookies are present but userObj is null, it's a Supabase token
            validation issue.
          </p>
          <p className="mt-1">
            After this works, we’ll point login back to /protected and remove
            this page.
          </p>
        </section>
      </div>
    </main>
  );
}
