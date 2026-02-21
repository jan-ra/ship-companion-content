"use client";

import { useState } from "react";
import { useAppDataStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MaterialIconSelector } from "@/components/material-icon-selector";
import { LanguageSelector } from "@/components/language-selector";
import { ImageUploader } from "@/components/image-uploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Ship, Anchor, History, Wrench, ImageIcon, Pencil, User } from "lucide-react";
import { getIconSvg, toKebabCase } from "@/lib/material-icons";
import { toast } from "sonner";
import type { LanguageCode } from "@/lib/types";

// Component to render a Material Icon from SVG
function MaterialIcon({ name, size = 24 }: { name: string; size?: number }) {
  const svg = getIconSvg(name);

  if (!svg) {
    return <div style={{ width: size, height: size }} />;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ display: 'block' }}
    />
  );
}

export default function AboutPage() {
  const { data, updateData } = useAppDataStore();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
  const [editingFactIndex, setEditingFactIndex] = useState<number | null>(null);
  const [editingEquipmentIndex, setEditingEquipmentIndex] = useState<number | null>(null);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data loaded</p>
      </div>
    );
  }

  const about = data.data.about;

  // Update about translation
  const updateAboutTranslation = (lang: LanguageCode, field: "vita" | "captainImage" | "description", value: string) => {
    updateData((current) => ({
      ...current,
      data: {
        ...current.data,
        about: {
          ...current.data.about,
          translations: {
            ...current.data.about.translations,
            [lang]: {
              ...current.data.about.translations[lang],
              [field]: value,
            },
          },
        },
      },
    }));
  };

  // Fact operations
  const addFact = () => {
    updateData((current) => ({
      ...current,
      data: {
        ...current.data,
        about: {
          ...current.data.about,
          facts: [
            ...current.data.about.facts,
            {
              icon: "info",
              translations: {
                de: { key: "", value: "" },
                en: { key: "", value: "" },
                nl: { key: "", value: "" },
              },
            },
          ],
        },
      },
    }));
    toast.success("Fact added");
  };

  const updateFact = (index: number, updates: any) => {
    updateData((current) => ({
      ...current,
      data: {
        ...current.data,
        about: {
          ...current.data.about,
          facts: current.data.about.facts.map((fact, i) =>
            i === index ? { ...fact, ...updates } : fact
          ),
        },
      },
    }));
  };

  const removeFact = (index: number) => {
    updateData((current) => ({
      ...current,
      data: {
        ...current.data,
        about: {
          ...current.data.about,
          facts: current.data.about.facts.filter((_, i) => i !== index),
        },
      },
    }));
    toast.success("Fact removed");
  };

  // History operations
  const addHistoryStep = () => {
    const history = about.history || [];
    updateData((current) => ({
      ...current,
      data: {
        ...current.data,
        about: {
          ...current.data.about,
          history: [
            ...history,
            {
              translations: {
                de: { heading: "", text: "" },
                en: { heading: "", text: "" },
                nl: { heading: "", text: "" },
              },
            },
          ],
        },
      },
    }));
    toast.success("History step added");
  };

  const updateHistoryStep = (index: number, lang: LanguageCode, field: "heading" | "text", value: string) => {
    const history = about.history || [];
    updateData((current) => ({
      ...current,
      data: {
        ...current.data,
        about: {
          ...current.data.about,
          history: history.map((step, i) =>
            i === index
              ? {
                  ...step,
                  translations: {
                    ...step.translations,
                    [lang]: {
                      ...step.translations[lang],
                      [field]: value,
                    },
                  },
                }
              : step
          ),
        },
      },
    }));
  };

  const removeHistoryStep = (index: number) => {
    const history = about.history || [];
    updateData((current) => ({
      ...current,
      data: {
        ...current.data,
        about: {
          ...current.data.about,
          history: history.filter((_, i) => i !== index),
        },
      },
    }));
    toast.success("History step removed");
  };

  // Equipment operations
  const addEquipment = () => {
    const equipment = about.equipment || [];
    updateData((current) => ({
      ...current,
      data: {
        ...current.data,
        about: {
          ...current.data.about,
          equipment: [
            ...equipment,
            {
              icon: "build",
              translations: {
                de: { name: "", description: "" },
                en: { name: "", description: "" },
                nl: { name: "", description: "" },
              },
            },
          ],
        },
      },
    }));
    toast.success("Equipment added");
  };

  const updateEquipment = (index: number, updates: any) => {
    const equipment = about.equipment || [];
    updateData((current) => ({
      ...current,
      data: {
        ...current.data,
        about: {
          ...current.data.about,
          equipment: equipment.map((item, i) =>
            i === index ? { ...item, ...updates } : item
          ),
        },
      },
    }));
  };

  const removeEquipment = (index: number) => {
    const equipment = about.equipment || [];
    updateData((current) => ({
      ...current,
      data: {
        ...current.data,
        about: {
          ...current.data.about,
          equipment: equipment.filter((_, i) => i !== index),
        },
      },
    }));
    toast.success("Equipment removed");
  };

  // Impressions operations
  const addImpression = (filename: string) => {
    updateData((current) => ({
      ...current,
      data: {
        ...current.data,
        about: {
          ...current.data.about,
          impressions: [...(current.data.about.impressions || []), filename],
        },
      },
    }));
  };

  const updateImpression = (index: number, filename: string) => {
    updateData((current) => ({
      ...current,
      data: {
        ...current.data,
        about: {
          ...current.data.about,
          impressions: (current.data.about.impressions || []).map((img, i) =>
            i === index ? filename : img
          ),
        },
      },
    }));
  };

  const removeImpression = (index: number) => {
    updateData((current) => ({
      ...current,
      data: {
        ...current.data,
        about: {
          ...current.data.about,
          impressions: (current.data.about.impressions || []).filter((_, i) => i !== index),
        },
      },
    }));
    toast.success("Impression removed");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">About Page</h1>
        <p className="text-muted-foreground">
          Edit ship about information, facts, history, and equipment
        </p>
      </div>

      <div className="space-y-6">
        {/* Ship Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Ship Description
            </CardTitle>
            <CardDescription>General ship description for each language</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              className="max-w-xs"
            />
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={about.translations[selectedLanguage]?.description || ""}
                onChange={(e) => updateAboutTranslation(selectedLanguage, "description", e.target.value)}
                rows={3}
                placeholder="Enter ship description..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Skipper */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Skipper
            </CardTitle>
            <CardDescription>Skipper vita and captain image caption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              className="max-w-xs"
            />
            <div className="space-y-2">
              <Label>Vita</Label>
              <Textarea
                value={about.translations[selectedLanguage]?.vita || ""}
                onChange={(e) => updateAboutTranslation(selectedLanguage, "vita", e.target.value)}
                rows={6}
                placeholder="Enter skipper vita..."
              />
            </div>
            <div className="space-y-2">
              <Label>Captain Image Text</Label>
              <Input
                value={about.translations[selectedLanguage]?.captainImage || ""}
                onChange={(e) => updateAboutTranslation(selectedLanguage, "captainImage", e.target.value)}
                placeholder="Enter captain image caption..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Facts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="h-5 w-5" />
                  Ship Facts
                </CardTitle>
                <CardDescription>Key facts about the ship ({about.facts.length} facts)</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSelector
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  className="w-36"
                />
                <Button onClick={addFact} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Fact
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {about.facts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <p className="text-sm">No facts yet</p>
                <Button variant="outline" size="sm" onClick={addFact} className="mt-3 gap-1">
                  <Plus className="h-3 w-3" />
                  Add First Fact
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border bg-muted/40 p-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {about.facts.map((fact, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setEditingFactIndex(index)}
                      className="flex items-center gap-2 text-left rounded-lg p-2 -m-1 hover:bg-accent transition-colors group"
                    >
                      <div className="text-muted-foreground group-hover:text-foreground shrink-0">
                        <MaterialIcon name={toKebabCase(fact.icon)} size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-muted-foreground font-medium truncate leading-tight">
                          {fact.translations[selectedLanguage]?.key || "Untitled"}
                        </div>
                        <div className="text-sm font-bold truncate leading-tight">
                          {fact.translations[selectedLanguage]?.value || "—"}
                        </div>
                      </div>
                      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fact Edit Dialog */}
        <Dialog
          open={editingFactIndex !== null}
          onOpenChange={(open) => { if (!open) setEditingFactIndex(null); }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Fact</DialogTitle>
            </DialogHeader>
            {editingFactIndex !== null && about.facts[editingFactIndex] && (() => {
              const fact = about.facts[editingFactIndex];
              const index = editingFactIndex;
              return (
                <div className="space-y-4">
                  <MaterialIconSelector
                    value={fact.icon}
                    onChange={(icon) => updateFact(index, { icon })}
                    label="Icon"
                  />

                  <Separator />

                  <LanguageSelector
                    value={selectedLanguage}
                    onChange={setSelectedLanguage}
                    className="max-w-xs"
                  />

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Key</Label>
                      <Input
                        value={fact.translations[selectedLanguage]?.key || ""}
                        onChange={(e) =>
                          updateFact(index, {
                            translations: {
                              ...fact.translations,
                              [selectedLanguage]: {
                                ...fact.translations[selectedLanguage],
                                key: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="e.g., Length"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Value</Label>
                      <Input
                        value={fact.translations[selectedLanguage]?.value || ""}
                        onChange={(e) =>
                          updateFact(index, {
                            translations: {
                              ...fact.translations,
                              [selectedLanguage]: {
                                ...fact.translations[selectedLanguage],
                                value: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="e.g., 40 meters"
                      />
                    </div>
                  </div>

                  <Separator />

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      removeFact(index);
                      setEditingFactIndex(null);
                    }}
                    className="w-full gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Fact
                  </Button>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* History Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  History Timeline
                </CardTitle>
                <CardDescription>
                  Historical milestones ({about.history?.length || 0} steps)
                </CardDescription>
              </div>
              <Button onClick={addHistoryStep} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              className="max-w-xs"
            />
            {(about.history || []).map((step, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Step #{index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHistoryStep(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Heading</Label>
                    <Input
                      value={step.translations[selectedLanguage]?.heading || ""}
                      onChange={(e) =>
                        updateHistoryStep(index, selectedLanguage, "heading", e.target.value)
                      }
                      placeholder="e.g., 1925 - Built"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Text</Label>
                    <Textarea
                      value={step.translations[selectedLanguage]?.text || ""}
                      onChange={(e) =>
                        updateHistoryStep(index, selectedLanguage, "text", e.target.value)
                      }
                      rows={3}
                      placeholder="Enter history text..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Equipment
                </CardTitle>
                <CardDescription>
                  Ship equipment and amenities ({about.equipment?.length || 0} items)
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSelector
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  className="w-36"
                />
                <Button onClick={addEquipment} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(about.equipment || []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <p className="text-sm">No equipment yet</p>
                <Button variant="outline" size="sm" onClick={addEquipment} className="mt-3 gap-1">
                  <Plus className="h-3 w-3" />
                  Add First Equipment
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border bg-muted/40 p-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {(about.equipment || []).map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setEditingEquipmentIndex(index)}
                      className="flex items-center gap-2 text-left rounded-lg p-2 -m-1 hover:bg-accent transition-colors group"
                    >
                      <div className="text-muted-foreground group-hover:text-foreground shrink-0">
                        <MaterialIcon name={toKebabCase(item.icon)} size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-muted-foreground font-medium truncate leading-tight">
                          {item.translations[selectedLanguage]?.name || "Untitled"}
                        </div>
                        <div className="text-sm font-bold truncate leading-tight">
                          {item.translations[selectedLanguage]?.description || "—"}
                        </div>
                      </div>
                      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipment Edit Dialog */}
        <Dialog
          open={editingEquipmentIndex !== null}
          onOpenChange={(open) => { if (!open) setEditingEquipmentIndex(null); }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Equipment</DialogTitle>
            </DialogHeader>
            {editingEquipmentIndex !== null && (about.equipment || [])[editingEquipmentIndex] && (() => {
              const item = (about.equipment || [])[editingEquipmentIndex];
              const index = editingEquipmentIndex;
              return (
                <div className="space-y-4">
                  <MaterialIconSelector
                    value={item.icon}
                    onChange={(icon) => updateEquipment(index, { icon })}
                    label="Icon"
                  />

                  <Separator />

                  <LanguageSelector
                    value={selectedLanguage}
                    onChange={setSelectedLanguage}
                    className="max-w-xs"
                  />

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={item.translations[selectedLanguage]?.name || ""}
                        onChange={(e) =>
                          updateEquipment(index, {
                            translations: {
                              ...item.translations,
                              [selectedLanguage]: {
                                ...item.translations[selectedLanguage],
                                name: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="e.g., Navigation System"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={item.translations[selectedLanguage]?.description || ""}
                        onChange={(e) =>
                          updateEquipment(index, {
                            translations: {
                              ...item.translations,
                              [selectedLanguage]: {
                                ...item.translations[selectedLanguage],
                                description: e.target.value,
                              },
                            },
                          })
                        }
                        rows={2}
                        placeholder="Enter equipment description..."
                      />
                    </div>
                  </div>

                  <Separator />

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      removeEquipment(index);
                      setEditingEquipmentIndex(null);
                    }}
                    className="w-full gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Equipment
                  </Button>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Impressions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Impressions
                </CardTitle>
                <CardDescription>
                  Gallery images for the about page ({about.impressions?.length || 0} images)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(about.impressions || []).map((image, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Image #{index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImpression(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <ImageUploader
                  value={image}
                  onChange={(filename) => updateImpression(index, filename)}
                  label=""
                />
              </div>
            ))}
            <ImageUploader
              value=""
              onChange={(filename) => addImpression(filename)}
              label="Add Impression"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
