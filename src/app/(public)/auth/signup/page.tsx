import { signup } from "./action";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PublicSignupPage({ searchParams }) {
  const redirectTo = searchParams.redirectTo || "/";

  return (
    <div className="max-w-md mx-auto py-20 space-y-8">
      <h1 className="text-3xl font-bold text-center">Create Account</h1>

      <form action={signup} className="space-y-6">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="space-y-2">
          <label>Full Name</label>
          <Input name="full_name" required />
        </div>

        <div className="space-y-2">
          <label>Email</label>
          <Input name="email" type="email" required />
        </div>

        <div className="space-y-2">
          <label>Password</label>
          <Input name="password" type="password" required />
        </div>

        <Button type="submit" className="w-full py-3 text-lg">
          Sign Up
        </Button>
      </form>

      <p className="text-center text-muted-foreground">
        Already have an account?{" "}
        <a
          className="text-primary underline"
          href={`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`}
        >
          Log In
        </a>
      </p>
    </div>
  );
}
