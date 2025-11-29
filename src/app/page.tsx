import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center space-y-8 px-4">
      <h1 className="text-5xl font-bold">Welcome to SoccerConnect</h1>

      <p className="text-lg text-muted-foreground max-w-xl">
        Discover youth soccer clubs, read honest reviews, and manage club data with ease.
      </p>

      <div className="flex gap-4">
        <Link 
          href="/auth/login" 
          className="px-5 py-2 rounded-md bg-primary text-white font-medium"
        >
          Login
        </Link>

        <Link 
          href="/auth/signup" 
          className="px-5 py-2 rounded-md border font-medium"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
