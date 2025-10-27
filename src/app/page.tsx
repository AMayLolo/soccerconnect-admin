import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/protected");
  } else {
    redirect("/login");
  }

}
