"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LanguageCode } from "@/lib/types";

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (lang: LanguageCode) => void;
  className?: string;
}

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
  { code: "nl", label: "NL" },
];

export function LanguageSelector({ value, onChange, className }: LanguageSelectorProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as LanguageCode)} className={className}>
      <TabsList className="grid w-full grid-cols-3">
        {LANGUAGES.map(({ code, label }) => (
          <TabsTrigger key={code} value={code}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
