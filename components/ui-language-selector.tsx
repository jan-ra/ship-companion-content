"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePreferencesStore } from "@/lib/preferences-store";
import { useT } from "@/lib/i18n";
import type { LanguageCode } from "@/lib/types";

const UI_LANGUAGES: { code: LanguageCode; nativeLabel: string; flag: string }[] = [
  { code: "en", nativeLabel: "English", flag: "🇬🇧" },
  { code: "de", nativeLabel: "Deutsch", flag: "🇩🇪" },
  { code: "nl", nativeLabel: "Nederlands", flag: "🇳🇱" },
];

export function UiLanguageSelector() {
  const { uiLanguage, setUiLanguage } = usePreferencesStore();
  const { t } = useT();

  const current = UI_LANGUAGES.find((l) => l.code === uiLanguage) ?? UI_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" title={t("uiLanguage.label")}>
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">
            {current.flag} {current.code.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("uiLanguage.label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {UI_LANGUAGES.map(({ code, nativeLabel, flag }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setUiLanguage(code)}
            className={uiLanguage === code ? "bg-accent" : ""}
          >
            <span className="mr-2">{flag}</span>
            {nativeLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
