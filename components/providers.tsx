"use client";

import { useEffect } from "react";
import { RestoreDataDialog } from "./restore-data-dialog";
import { useUiLanguage } from "@/lib/preferences-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const uiLanguage = useUiLanguage();

  useEffect(() => {
    document.documentElement.lang = uiLanguage;
  }, [uiLanguage]);

  return (
    <>
      {children}
      <RestoreDataDialog />
    </>
  );
}
