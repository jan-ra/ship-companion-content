"use client";

import { Label } from "@/components/ui/label";
import { LanguageTabs } from "@/components/language-tabs";
import { ImageUploader } from "@/components/image-uploader";
import type { LanguageCode, Translations } from "@/lib/types";

const LANGUAGES: LanguageCode[] = ["de", "en", "nl"];

interface MultiLanguageImageUploaderProps {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: Translations<any>;
  field: string;
  onChange: (lang: LanguageCode, value: string) => void;
  required?: boolean;
  /** If provided, use external language control instead of internal tabs */
  selectedLanguage?: LanguageCode;
}

export function MultiLanguageImageUploader({
  label,
  value,
  field,
  onChange,
  required = false,
  selectedLanguage,
}: MultiLanguageImageUploaderProps) {
  // Check if any language has an image set
  const hasAnyLanguageImage = LANGUAGES.some((lang) => {
    const val = value[lang]?.[field] as string | undefined;
    return val && val.length > 0;
  });

  // Set image for all languages at once
  const handleSetAllLanguages = (filename: string) => {
    LANGUAGES.forEach((lang) => {
      onChange(lang, filename);
    });
  };

  // Remove image from all languages at once
  const handleRemoveAllLanguages = () => {
    LANGUAGES.forEach((lang) => {
      onChange(lang, "");
    });
  };

  // If external language control is provided, render just the image uploader
  if (selectedLanguage) {
    return (
      <div className="space-y-2">
        {label && (
          <Label>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <ImageUploader
          value={(value[selectedLanguage]?.[field] as string) || ""}
          onChange={(filename) => onChange(selectedLanguage, filename)}
          label=""
          required={required}
          isMultiLanguage={true}
          hasAnyLanguageImage={hasAnyLanguageImage}
          onSetAllLanguages={handleSetAllLanguages}
          onRemoveAllLanguages={handleRemoveAllLanguages}
        />
      </div>
    );
  }

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
          <ImageUploader
            value={(value[lang]?.[field] as string) || ""}
            onChange={(filename) => onChange(lang, filename)}
            label=""
            required={required}
            isMultiLanguage={true}
            hasAnyLanguageImage={hasAnyLanguageImage}
            onSetAllLanguages={handleSetAllLanguages}
            onRemoveAllLanguages={handleRemoveAllLanguages}
          />
        )}
      </LanguageTabs>
    </div>
  );
}
