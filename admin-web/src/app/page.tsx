// src/app/page.tsx
import { getCurrentUser } from "@/utils/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-gray-900 p-8">
      <div className="max-w-sm w-full border border-gray-300 rounded-lg p-6 shadow space-y-4 text-center">
        <div className="text-lg font-semibold text-gray-900">
          SoccerConnect Admin
        </div>

        {user ? (
          <>
            <div className="text-sm text-gray-700 leading-relaxed">
              Server sees you as signed in as:
              <br />
              <strong>{user.email ?? "(no email)"}</strong>
            </div>
            <div className="text-xs text-gray-500">
              We are not redirecting from / right now. Use the links below.
            </div>

            <a
              href="/protected"
              className="inline-block text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition rounded px-3 py-2"
            >
              Go to dashboard (/protected)
            </a>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-700 leading-relaxed">
              Server thinks you are NOT signed in.
            </div>
            <div className="text-xs text-gray-500">
              We are not redirecting from / right now.
            </div>

            <a
              href="/login"
              className="inline-block text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition rounded px-3 py-2"
            >
              Go to login
            </a>
          </>
        )}
      </div>
    </main>
  );
}
