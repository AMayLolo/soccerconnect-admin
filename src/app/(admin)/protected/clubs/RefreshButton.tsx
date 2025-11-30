"use client";

import { useRouter } from "next/navigation";
import { ReactNode, cloneElement, isValidElement } from "react";

export function RefreshButton({ children }: { children: ReactNode }) {
  const router = useRouter();

  function handleRefresh() {
    router.refresh();
  }

  // Clone the child element and pass the onImportComplete callback
  if (isValidElement(children)) {
    return cloneElement(children as any, {
      onImportComplete: handleRefresh,
    });
  }

  return <>{children}</>;
}
