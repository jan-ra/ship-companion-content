"use client";

import { RestoreDataDialog } from "./restore-data-dialog";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RestoreDataDialog />
    </>
  );
}
