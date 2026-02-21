"use client";

import { useState } from "react";
import { useAppDataStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiLanguageInput } from "@/components/multi-language-input";
import { LanguageSelector } from "@/components/language-selector";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, Instagram, Facebook, Youtube } from "lucide-react";
import type { LanguageCode } from "@/lib/types";
import { useT } from "@/lib/i18n";

export default function ContactPage() {
  const { data, updateData } = useAppDataStore();
  const { t } = useT();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data loaded</p>
      </div>
    );
  }

  const links = data.data.links;

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("contact.title")}</h1>
        <p className="text-muted-foreground">
          {t("contact.subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("contact.contactInfo")}</CardTitle>
            <CardDescription>{t("contact.contactInfoDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                {t("contact.phoneLabel")}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={links.phone}
                  onChange={(e) =>
                    updateData((d) => ({
                      ...d,
                      data: {
                        ...d.data,
                        links: { ...d.data.links, phone: e.target.value },
                      },
                    }))
                  }
                  placeholder={t("contact.phonePlaceholder")}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mail">
                {t("contact.emailLabel")}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="mail"
                  type="email"
                  value={links.mail}
                  onChange={(e) =>
                    updateData((d) => ({
                      ...d,
                      data: {
                        ...d.data,
                        links: { ...d.data.links, mail: e.target.value },
                      },
                    }))
                  }
                  placeholder={t("contact.emailPlaceholder")}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>{t("contact.socialMedia")}</CardTitle>
            <CardDescription>{t("contact.socialMediaDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">{t("contact.instagramLabel")}</Label>
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="instagram"
                  type="url"
                  value={links.instagram || ""}
                  onChange={(e) =>
                    updateData((d) => ({
                      ...d,
                      data: {
                        ...d.data,
                        links: { ...d.data.links, instagram: e.target.value || undefined },
                      },
                    }))
                  }
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">{t("contact.facebookLabel")}</Label>
              <div className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="facebook"
                  type="url"
                  value={links.facebook || ""}
                  onChange={(e) =>
                    updateData((d) => ({
                      ...d,
                      data: {
                        ...d.data,
                        links: { ...d.data.links, facebook: e.target.value || undefined },
                      },
                    }))
                  }
                  placeholder="https://facebook.com/page"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">{t("contact.youtubeLabel")}</Label>
              <div className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="youtube"
                  type="url"
                  value={links.youtube || ""}
                  onChange={(e) =>
                    updateData((d) => ({
                      ...d,
                      data: {
                        ...d.data,
                        links: { ...d.data.links, youtube: e.target.value || undefined },
                      },
                    }))
                  }
                  placeholder="https://youtube.com/channel"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Multi-language Fields */}
        <Card>
          <CardHeader>
            <CardTitle>{t("contact.companyAndSkipper")}</CardTitle>
            <CardDescription>{t("contact.companyAndSkipperDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              className="max-w-xs"
            />

            <MultiLanguageInput
              label="Company Name"
              value={links.translations}
              field="companyName"
              onChange={(lang: LanguageCode, value: string) =>
                updateData((d) => ({
                  ...d,
                  data: {
                    ...d.data,
                    links: {
                      ...d.data.links,
                      translations: {
                        ...d.data.links.translations,
                        [lang]: { ...d.data.links.translations[lang], companyName: value },
                      },
                    },
                  },
                }))
              }
              placeholder="Enter company name"
              required
              selectedLanguage={selectedLanguage}
            />

            <MultiLanguageInput
              label="Skipper Name"
              value={links.translations}
              field="skipperName"
              onChange={(lang: LanguageCode, value: string) =>
                updateData((d) => ({
                  ...d,
                  data: {
                    ...d.data,
                    links: {
                      ...d.data.links,
                      translations: {
                        ...d.data.links.translations,
                        [lang]: { ...d.data.links.translations[lang], skipperName: value },
                      },
                    },
                  },
                }))
              }
              placeholder="Enter skipper name"
              required
              selectedLanguage={selectedLanguage}
            />

            <MultiLanguageInput
              label="Claim/Tagline"
              value={links.translations}
              field="claim"
              onChange={(lang: LanguageCode, value: string) =>
                updateData((d) => ({
                  ...d,
                  data: {
                    ...d.data,
                    links: {
                      ...d.data.links,
                      translations: {
                        ...d.data.links.translations,
                        [lang]: { ...d.data.links.translations[lang], claim: value },
                      },
                    },
                  },
                }))
              }
              placeholder="Enter company tagline or claim"
              required
              selectedLanguage={selectedLanguage}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
