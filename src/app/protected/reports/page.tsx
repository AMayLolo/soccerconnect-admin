// src/app/protected/reports/page.tsx
import { Suspense } from "react";
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">
        Reports Dashboard
      </h1>

      {/* ✅ Fully compliant Suspense boundary */}
      <Suspense fallback={<ReportsFallback />} key={Math.random()}>
        <ReportsClient />
      </Suspense>
    </div>
  );
}

// ✅ Local fallback component for better compatibility
function ReportsFallback() {
  return (
    <div className="bg-white border rounded-lg shadow-sm p-6 text-gray-500">
      Loading reports...
    </div>
  );
}
