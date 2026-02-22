"use client";

import { useState } from "react";
import { useAppDataStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link as LinkIcon, ExternalLink, Plus, Trash2, ShoppingCart, Globe, Info } from "lucide-react";
import { toast } from "sonner";
import { generateId } from "@/lib/json-utils";
import type { LanguageCode, SupplyLink, AdditionalLink } from "@/lib/types";
import { useT } from "@/lib/i18n";

export default function LinksPage() {
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

  const linksData = data.data.links;
  const links = linksData.links;
  const supplies: SupplyLink[] = links.supplies || [];
  const additional: AdditionalLink[] = links.additional || [];

  // Supply link operations
  const addSupplyLink = () => {
    const newSupply: SupplyLink = {
      url: "",
      translations: {
        de: { name: "", description: "" },
        en: { name: "", description: "" },
        nl: { name: "", description: "" },
      },
    };
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        links: {
          ...d.data.links,
          links: {
            ...d.data.links.links,
            supplies: [...(d.data.links.links.supplies || []), newSupply],
          },
        },
      },
    }));
    toast.success(t("links.toastSupplyAdded"));
  };

  const updateSupplyLink = (index: number, updates: Partial<SupplyLink>) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        links: {
          ...d.data.links,
          links: {
            ...d.data.links.links,
            supplies: (d.data.links.links.supplies || []).map((s, i) =>
              i === index ? { ...s, ...updates } : s
            ),
          },
        },
      },
    }));
  };

  const updateSupplyTranslation = (
    index: number,
    lang: LanguageCode,
    field: "name" | "description",
    value: string
  ) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        links: {
          ...d.data.links,
          links: {
            ...d.data.links.links,
            supplies: (d.data.links.links.supplies || []).map((s, i) =>
              i === index
                ? {
                    ...s,
                    translations: {
                      ...s.translations,
                      [lang]: { ...s.translations[lang], [field]: value },
                    },
                  }
                : s
            ),
          },
        },
      },
    }));
  };

  const removeSupplyLink = (index: number) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        links: {
          ...d.data.links,
          links: {
            ...d.data.links.links,
            supplies: (d.data.links.links.supplies || []).filter((_, i) => i !== index),
          },
        },
      },
    }));
    toast.success(t("links.toastSupplyRemoved"));
  };

  // Supply explanation
  const updateSupplyExplanation = (lang: LanguageCode, value: string) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        links: {
          ...d.data.links,
          translations: {
            ...d.data.links.translations,
            [lang]: { ...d.data.links.translations[lang], supplyExplanation: value },
          },
        },
      },
    }));
  };

  // Additional link operations
  const addAdditionalLink = () => {
    const newLink: AdditionalLink = {
      id: generateId("link-"),
      url: "",
      translations: {
        de: { name: "", description: "" },
        en: { name: "", description: "" },
        nl: { name: "", description: "" },
      },
    };
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        links: {
          ...d.data.links,
          links: {
            ...d.data.links.links,
            additional: [...(d.data.links.links.additional || []), newLink],
          },
        },
      },
    }));
    toast.success(t("links.toastLinkAdded"));
  };

  const updateAdditionalLink = (index: number, updates: Partial<AdditionalLink>) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        links: {
          ...d.data.links,
          links: {
            ...d.data.links.links,
            additional: (d.data.links.links.additional || []).map((l, i) =>
              i === index ? { ...l, ...updates } : l
            ),
          },
        },
      },
    }));
  };

  const updateAdditionalLinkTranslation = (
    index: number,
    lang: LanguageCode,
    field: "name" | "description",
    value: string
  ) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        links: {
          ...d.data.links,
          links: {
            ...d.data.links.links,
            additional: (d.data.links.links.additional || []).map((l, i) =>
              i === index
                ? {
                    ...l,
                    translations: {
                      ...l.translations,
                      [lang]: { ...l.translations[lang], [field]: value },
                    },
                  }
                : l
            ),
          },
        },
      },
    }));
  };

  const removeAdditionalLink = (index: number) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        links: {
          ...d.data.links,
          links: {
            ...d.data.links.links,
            additional: (d.data.links.links.additional || []).filter((_, i) => i !== index),
          },
        },
      },
    }));
    toast.success(t("links.toastLinkRemoved"));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("links.title")}</h1>
        <p className="text-muted-foreground">
          {t("links.subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Required Links */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("links.requiredLinks")}</CardTitle>
                <CardDescription>{t("links.requiredLinksDesc")}</CardDescription>
              </div>
              <Badge>{t("links.required")}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="booking">
                {t("links.bookingLabel")}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="booking"
                  type="url"
                  value={links.booking}
                  onChange={(e) =>
                    updateData((d) => ({
                      ...d,
                      data: {
                        ...d.data,
                        links: {
                          ...d.data.links,
                          links: { ...d.data.links.links, booking: e.target.value },
                        },
                      },
                    }))
                  }
                  placeholder="https://example.com"
                  required
                />
                {links.booking && (
                  <a href={links.booking} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="privacy">
                {t("links.privacyLabel")}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="privacy"
                  type="url"
                  value={links.privacy}
                  onChange={(e) =>
                    updateData((d) => ({
                      ...d,
                      data: {
                        ...d.data,
                        links: {
                          ...d.data.links,
                          links: { ...d.data.links.links, privacy: e.target.value },
                        },
                      },
                    }))
                  }
                  placeholder="https://example.com"
                  required
                />
                {links.privacy && (
                  <a href={links.privacy} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipLocation">{t("links.shipLocationLabel")}</Label>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="shipLocation"
                  type="url"
                  value={links.shipLocation || ""}
                  onChange={(e) =>
                    updateData((d) => ({
                      ...d,
                      data: {
                        ...d.data,
                        links: {
                          ...d.data.links,
                          links: { ...d.data.links.links, shipLocation: e.target.value || undefined },
                        },
                      },
                    }))
                  }
                  placeholder="https://example.com"
                />
                {links.shipLocation && (
                  <a href={links.shipLocation} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Links */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t("links.additionalLinks")}
                </CardTitle>
                <CardDescription>
                  {additional.length === 1
                    ? t("links.additionalLinksDesc_one", { count: additional.length })
                    : t("links.additionalLinksDesc_other", { count: additional.length })}
                </CardDescription>
              </div>
              <Button onClick={addAdditionalLink} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("links.addLink")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {additional.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <p className="text-sm">{t("links.noAdditionalLinks")}</p>
                <Button variant="outline" size="sm" onClick={addAdditionalLink} className="mt-3 gap-1">
                  <Plus className="h-3 w-3" />
                  {t("links.addFirstLink")}
                </Button>
              </div>
            ) : (
              <>
                <LanguageSelector
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  className="max-w-xs"
                />
                {additional.map((link, index) => (
                  <div key={link.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {link.translations[selectedLanguage]?.name || t("links.linkFallback", { index: index + 1 })}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => removeAdditionalLink(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("links.urlLabel")}</Label>
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateAdditionalLink(index, { url: e.target.value })}
                          placeholder="https://example.com"
                        />
                        {link.url && (
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>{t("links.nameLabel")}</Label>
                        <Input
                          value={link.translations[selectedLanguage]?.name || ""}
                          onChange={(e) => updateAdditionalLinkTranslation(index, selectedLanguage, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("links.descriptionLabel")}</Label>
                        <Input
                          value={link.translations[selectedLanguage]?.description || ""}
                          onChange={(e) => updateAdditionalLinkTranslation(index, selectedLanguage, "description", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Supply Links */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  {t("links.supplyLinks")}
                </CardTitle>
                <CardDescription>
                  {supplies.length === 1
                    ? t("links.supplyLinksDesc_one", { count: supplies.length })
                    : t("links.supplyLinksDesc_other", { count: supplies.length })}
                </CardDescription>
              </div>
              <Button onClick={addSupplyLink} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("links.addSupplyLink")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t("links.supplyButtonNote")}
              </AlertDescription>
            </Alert>

            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              className="max-w-xs"
            />

            {/* Supply Explanation */}
            <div className="space-y-2">
              <Label>{t("links.supplyExplanationLabel")}</Label>
              <Textarea
                value={linksData.translations[selectedLanguage]?.supplyExplanation || ""}
                onChange={(e) => updateSupplyExplanation(selectedLanguage, e.target.value)}
                rows={4}
                placeholder={t("links.supplyExplanationPlaceholder")}
              />
            </div>

            {/* Supply Links List */}
            {supplies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <p className="text-sm">{t("links.noSupplyLinks")}</p>
                <Button variant="outline" size="sm" onClick={addSupplyLink} className="mt-3 gap-1">
                  <Plus className="h-3 w-3" />
                  {t("links.addFirstSupplyLink")}
                </Button>
              </div>
            ) : (
              supplies.map((supply, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {supply.translations[selectedLanguage]?.name || t("links.supplyFallback", { index: index + 1 })}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => removeSupplyLink(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("links.urlLabel")}</Label>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="url"
                        value={supply.url}
                        onChange={(e) => updateSupplyLink(index, { url: e.target.value })}
                        placeholder="https://example.com"
                      />
                      {supply.url && (
                        <a href={supply.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{t("links.nameLabel")}</Label>
                      <Input
                        value={supply.translations[selectedLanguage]?.name || ""}
                        onChange={(e) => updateSupplyTranslation(index, selectedLanguage, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("links.descriptionLabel")}</Label>
                      <Input
                        value={supply.translations[selectedLanguage]?.description || ""}
                        onChange={(e) => updateSupplyTranslation(index, selectedLanguage, "description", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
