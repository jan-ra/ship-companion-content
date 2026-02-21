"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LanguageCode } from "@/lib/types";

interface LanguageTabsProps {
  children: (lang: LanguageCode) => React.ReactNode;
  defaultLanguage?: LanguageCode;
}

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
  { code: "nl", label: "NL" },
];

export function LanguageTabs({ children, defaultLanguage = "en" }: LanguageTabsProps) {
  return (
    <Tabs defaultValue={defaultLanguage} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {LANGUAGES.map(({ code, label }) => (
          <TabsTrigger key={code} value={code}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {LANGUAGES.map(({ code }) => (
        <TabsContent key={code} value={code} className="mt-4">
          {children(code)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
