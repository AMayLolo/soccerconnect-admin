import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900">
      {/* Left nav */}
      <AdminSidebar />

      {/* Right side (header + page content) */}
      <div className="flex flex-col flex-1 min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
