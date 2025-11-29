import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "SoccerConnect Admin",
  description: "Admin console for managing soccer clubs and reports.",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      {children}
      {/* Toasts */}
      <Toaster position="top-right" />
    </>
  );
}
