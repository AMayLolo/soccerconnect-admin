// src/app/login/page.tsx
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const user = await getCurrentUser();

  // ✅ Only redirect if user is actually logged in
  if (user) {
    redirect("/protected");
  }

  // ✅ Otherwise show the login client (form UI)
  return <LoginClient />;
}
