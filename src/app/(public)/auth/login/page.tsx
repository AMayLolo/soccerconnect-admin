import { login } from "./action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PublicLoginPage({ searchParams }) {
  const redirectTo = searchParams.redirectTo || "/";

  return (
    <div className="max-w-md mx-auto py-20 space-y-8">
      <h1 className="text-3xl font-bold text-center">Log In</h1>

      <form action={login} className="space-y-6">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="space-y-2">
          <label>Email</label>
          <Input name="email" type="email" required />
        </div>

        <div className="space-y-2">
          <label>Password</label>
          <Input name="password" type="password" required />
        </div>

        <Button type="submit" className="w-full py-3 text-lg">
          Log In
        </Button>
      </form>

      <p className="text-center text-muted-foreground">
        Don't have an account?{" "}
        <a
          className="text-primary underline"
          href={`/auth/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
        >
          Sign Up
        </a>
      </p>
    </div>
  );
}
