// src/components/ProtectedHeader.tsx
import UserDropdown from "./UserDropdown";
import { getCurrentUser } from "@/utils/auth";

export default async function ProtectedHeader() {
  // this is server-side, so it's trustworthy
  const user = await getCurrentUser();

  return (
    <header className="w-full border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left side: brand / app name */}
        <div className="flex items-baseline gap-2">
          <div className="text-base font-semibold text-neutral-900">
            SoccerConnect Admin
          </div>
          <div className="text-[11px] font-medium text-neutral-500">
            Console
          </div>
        </div>

        {/* Right side: user info / dropdown */}
        <UserDropdown
          email={user?.email ?? "unknown"}
        />
      </div>
    </header>
  );
}
