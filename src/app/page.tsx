// src/app/page.tsx
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getCurrentUser();

  // ✅ If logged in → go to dashboard
  if (user) redirect("/protected");

  // ✅ Otherwise → go to login
  redirect("/login");
}
