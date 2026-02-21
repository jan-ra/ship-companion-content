"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LanguageTabs } from "@/components/language-tabs";
import type { LanguageCode, Translations } from "@/lib/types";

interface MultiLanguageTextareaProps {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: Translations<any>;
  field: string;
  onChange: (lang: LanguageCode, value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  /** If provided, use external language control instead of internal tabs */
  selectedLanguage?: LanguageCode;
}

export function MultiLanguageTextarea({
  label,
  value,
  field,
  onChange,
  placeholder,
  required = false,
  rows = 4,
  selectedLanguage,
}: MultiLanguageTextareaProps) {
  // If external language control is provided, render just the textarea
  if (selectedLanguage) {
    return (
      <div className="space-y-2">
        {label && (
          <Label>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Textarea
          value={(value[selectedLanguage]?.[field] as string) || ""}
          onChange={(e) => onChange(selectedLanguage, e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={rows}
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
          <Textarea
            value={(value[lang]?.[field] as string) || ""}
            onChange={(e) => onChange(lang, e.target.value)}
            placeholder={placeholder}
            required={required}
            rows={rows}
          />
        )}
      </LanguageTabs>
    </div>
  );
}
