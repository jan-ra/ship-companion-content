"use client";

import { useEffect } from "react";
import { RestoreDataDialog } from "./restore-data-dialog";
import { usePreferencesStore, useUiLanguage } from "@/lib/preferences-store";
import { translate } from "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = usePreferencesStore((s) => s.hydrate);
  const uiLanguage = useUiLanguage();

  // Hydrate preferences from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.lang = uiLanguage;
    document.title = translate(uiLanguage, "app.title");
  }, [uiLanguage]);

  return (
    <>
      {children}
      <RestoreDataDialog />
    </>
  );
}
