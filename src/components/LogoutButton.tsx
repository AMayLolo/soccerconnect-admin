"use client";

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch("/logout", { method: "GET" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}
