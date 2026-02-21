"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageTabs } from "@/components/language-tabs";
import type { LanguageCode, Translations } from "@/lib/types";

interface MultiLanguageInputProps {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: Translations<any>;
  field: string;
  onChange: (lang: LanguageCode, value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  /** If provided, use external language control instead of internal tabs */
  selectedLanguage?: LanguageCode;
}

export function MultiLanguageInput({
  label,
  value,
  field,
  onChange,
  placeholder,
  required = false,
  type = "text",
  selectedLanguage,
}: MultiLanguageInputProps) {
  // If external language control is provided, render just the input
  if (selectedLanguage) {
    return (
      <div className="space-y-2">
        {label && (
          <Label>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Input
          type={type}
          value={(value[selectedLanguage]?.[field] as string) || ""}
          onChange={(e) => onChange(selectedLanguage, e.target.value)}
          placeholder={placeholder}
          required={required}
        />
      </div>
    );
  }

  // Otherwise use internal tabs
  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <LanguageTabs>
        {(lang) => (
          <Input
            type={type}
            value={(value[lang]?.[field] as string) || ""}
            onChange={(e) => onChange(lang, e.target.value)}
            placeholder={placeholder}
            required={required}
          />
        )}
      </LanguageTabs>
    </div>
  );
}
