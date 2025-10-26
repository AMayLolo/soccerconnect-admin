// src/app/protected/layout.tsx
import { getCurrentUser } from "@/utils/auth";
import { Toaster } from "react-hot-toast";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ask auth what it thinks about this request
  const current = await getCurrentUser();

  // normalize like we did on login/page.tsx
  const userObj =
    current && typeof current === "object" && "user" in current
      ? (current as { user: any }).user
      : current;

  // if no user, instead of redirect() let's just render a helpful message
  if (!userObj) {
    return (
      <section className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-8">
        <div className="max-w-md w-full border border-gray-300 rounded-xl p-6 shadow">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Not authenticated
          </h1>
          <p className="text-sm text-gray-700 mb-4">
            The server does not see a valid admin session.
          </p>

          <p className="text-xs text-gray-500 mb-2">
            This usually means the cookies didn’t get set in production
            (sb-access-token / sb-refresh-token).
          </p>

          <p className="text-xs text-gray-500">
            Try refreshing this page. If you keep seeing this, we’ll adjust how
            we write cookies in <code>loginAction</code> for production.
          </p>
        </div>
      </section>
    );
  }

  // otherwise, show the dashboard shell like normal
  return (
    <section className="min-h-screen bg-gray-50 text-gray-900">
      <Toaster />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              SoccerConnect Admin
            </h1>
            <p className="text-xs text-gray-500">
              Internal tools — Clubs, Reports, Reviews
            </p>
          </div>
          <div className="text-xs text-gray-500 overflow-hidden text-ellipsis max-w-[200px]">
            {userObj.email ?? "Admin"}
          </div>
        </header>

        <main>{children}</main>
      </div>
    </section>
  );
}
