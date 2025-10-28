// src/app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-2 text-red-600">Access Denied</h1>
      <p className="text-gray-600">
        You do not have permission to view this page.
      </p>
      <a
        href="/"
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go Home
      </a>
    </div>
  );
}
