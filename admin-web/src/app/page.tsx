// src/app/page.tsx
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect("/protected");
}
