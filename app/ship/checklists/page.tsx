"use client";

import { useState } from "react";
import { useAppDataStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MultiLanguageInput } from "@/components/multi-language-input";
import { MultiLanguageTextarea } from "@/components/multi-language-textarea";
import { MultiLanguageImageUploader } from "@/components/multi-language-image-uploader";
import { LanguageSelector } from "@/components/language-selector";
import { MaterialIconSelector } from "@/components/material-icon-selector";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { generateId } from "@/lib/json-utils";
import { getIconSvg, toKebabCase } from "@/lib/material-icons";
import type { LanguageCode, ChecklistCategory, CheckItem } from "@/lib/types";
import { useT } from "@/lib/i18n";

function MaterialIcon({ name, size = 24 }: { name: string; size?: number }) {
  const svg = getIconSvg(name);

  if (!svg) {
    return <div style={{ width: size, height: size }} className="bg-muted rounded" />;
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

export default function ChecklistsPage() {
  const { data, updateData } = useAppDataStore();
  const { t } = useT();
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data loaded</p>
      </div>
    );
  }

  const checklists = data.data.checklists;
  const selectedChecklist = selectedChecklistId
    ? checklists.find(c => c.id === selectedChecklistId)
    : null;

  // Checklist CRUD operations
  const addChecklist = () => {
    const newChecklist: ChecklistCategory = {
      id: generateId("checklist-"),
      icon: "checklist",
      tasks: [],
      translations: {
        de: { title: "", description: "" },
        en: { title: "", description: "" },
        nl: { title: "", description: "" },
      },
    };

    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        checklists: [...d.data.checklists, newChecklist],
      },
    }));

    setSelectedChecklistId(newChecklist.id);
    toast.success(t("checklists.toastChecklistCreated"));
  };

  const deleteChecklist = (id: string) => {
    if (confirm(t("checklists.deleteChecklistConfirm"))) {
      updateData((d) => ({
        ...d,
        data: {
          ...d.data,
          checklists: d.data.checklists.filter((c) => c.id !== id),
        },
      }));

      if (selectedChecklistId === id) {
        setSelectedChecklistId(null);
      }
      toast.success(t("checklists.toastChecklistDeleted"));
    }
  };

  const updateChecklist = (id: string, updates: Partial<ChecklistCategory>) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        checklists: d.data.checklists.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      },
    }));
  };

  const updateChecklistTranslation = (
    id: string,
    lang: LanguageCode,
    field: "title" | "description",
    value: string
  ) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        checklists: d.data.checklists.map((c) =>
          c.id === id
            ? {
                ...c,
                translations: {
                  ...c.translations,
                  [lang]: { ...c.translations[lang], [field]: value },
                },
              }
            : c
        ),
      },
    }));
  };

  // Task CRUD operations
  const addTask = (checklistId: string) => {
    const newTask: CheckItem = {
      id: generateId("task-"),
      translations: {
        de: { title: "", description: "" },
        en: { title: "", description: "" },
        nl: { title: "", description: "" },
      },
    };

    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        checklists: d.data.checklists.map((c) =>
          c.id === checklistId
            ? { ...c, tasks: [...c.tasks, newTask] }
            : c
        ),
      },
    }));

    setOpenItem(newTask.id);
    toast.success(t("checklists.toastTaskAdded"));
  };

  const deleteTask = (checklistId: string, taskId: string) => {
    if (confirm(t("checklists.deleteTaskConfirm"))) {
      updateData((d) => ({
        ...d,
        data: {
          ...d.data,
          checklists: d.data.checklists.map((c) =>
            c.id === checklistId
              ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }
              : c
          ),
        },
      }));
      toast.success(t("checklists.toastTaskDeleted"));
    }
  };

  const updateTask = (
    checklistId: string,
    taskId: string,
    lang: LanguageCode,
    field: "title" | "description" | "image",
    value: string
  ) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        checklists: d.data.checklists.map((c) =>
          c.id === checklistId
            ? {
                ...c,
                tasks: c.tasks.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        translations: {
                          ...t.translations,
                          [lang]: { ...t.translations[lang], [field]: value },
                        },
                      }
                    : t
                ),
              }
            : c
        ),
      },
    }));
  };

  // List view - show all checklists
  if (!selectedChecklist) {
    return (
      <div className="p-6 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("checklists.title")}</h1>
            <p className="text-muted-foreground">
              {t("checklists.subtitle", { count: checklists.length })}
            </p>
          </div>
          <Button onClick={addChecklist} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("checklists.addChecklist")}
          </Button>
        </div>

        {checklists.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">{t("checklists.noChecklists")}</p>
              <Button onClick={addChecklist} className="gap-2">
                <Plus className="h-4 w-4" />
                {t("checklists.createFirst")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {checklists.map((checklist) => (
              <Card key={checklist.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <MaterialIcon name={toKebabCase(checklist.icon)} size={32} />
                    </div>
                    <button
                      onClick={() => setSelectedChecklistId(checklist.id)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium">
                        {checklist.translations.en.title || t("checklists.untitledChecklist")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("checklists.taskCount", { count: checklist.tasks.length })}
                        {checklist.translations.en.description && (
                          <> · {checklist.translations.en.description}</>
                        )}
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChecklist(checklist.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedChecklistId(checklist.id)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Detail view - edit selected checklist and its tasks
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedChecklistId(null)}
          className="gap-2 mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("checklists.backToChecklists")}
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {selectedChecklist.translations.en.title || t("checklists.untitledChecklist")}
            </h1>
            <p className="text-muted-foreground">
              {t("checklists.editSubtitle", { count: selectedChecklist.tasks.length })}
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => deleteChecklist(selectedChecklist.id)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t("checklists.deleteChecklist")}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Checklist Details */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-4">
              <MaterialIcon name={toKebabCase(selectedChecklist.icon)} size={48} />
              <div className="flex-1">
                <MaterialIconSelector
                  value={selectedChecklist.icon}
                  onChange={(icon) => updateChecklist(selectedChecklist.id, { icon })}
                  label={t("checklists.checklistIcon")}
                />
              </div>
            </div>

            <Separator />

            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              className="max-w-xs"
            />

            <MultiLanguageInput
              label="Title"
              value={selectedChecklist.translations}
              field="title"
              onChange={(lang, value) =>
                updateChecklistTranslation(selectedChecklist.id, lang, "title", value)
              }
              placeholder="Enter checklist title"
              required
              selectedLanguage={selectedLanguage}
            />

            <MultiLanguageTextarea
              label="Description"
              value={selectedChecklist.translations}
              field="description"
              onChange={(lang, value) =>
                updateChecklistTranslation(selectedChecklist.id, lang, "description", value)
              }
              placeholder="Enter checklist description"
              rows={2}
              selectedLanguage={selectedLanguage}
            />
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t("checklists.tasks")}</h2>
            <Button onClick={() => addTask(selectedChecklist.id)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("checklists.addTask")}
            </Button>
          </div>

          {selectedChecklist.tasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">{t("checklists.noTasks")}</p>
                <Button onClick={() => addTask(selectedChecklist.id)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("checklists.addFirstTask")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
              {selectedChecklist.tasks.map((task, index) => (
                <AccordionItem key={task.id} value={task.id}>
                  <Card className="mb-2">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <span className="text-muted-foreground font-mono text-sm w-6">
                          {index + 1}.
                        </span>
                        <span className="font-medium">
                          {task.translations.en.title || t("checklists.taskFallback", { index: index + 1 })}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="space-y-6 pt-4">
                        <LanguageSelector
                          value={selectedLanguage}
                          onChange={setSelectedLanguage}
                          className="max-w-xs"
                        />

                        <MultiLanguageInput
                          label="Task Title"
                          value={task.translations}
                          field="title"
                          onChange={(lang, value) =>
                            updateTask(selectedChecklist.id, task.id, lang, "title", value)
                          }
                          placeholder="Enter task title"
                          required
                          selectedLanguage={selectedLanguage}
                        />

                        <MultiLanguageTextarea
                          label="Task Description"
                          value={task.translations}
                          field="description"
                          onChange={(lang, value) =>
                            updateTask(selectedChecklist.id, task.id, lang, "description", value)
                          }
                          placeholder="Enter task description"
                          rows={3}
                          selectedLanguage={selectedLanguage}
                        />

                        <Separator />

                        <MultiLanguageImageUploader
                          label="Task Image (optional)"
                          value={task.translations}
                          field="image"
                          onChange={(lang, value) =>
                            updateTask(selectedChecklist.id, task.id, lang, "image", value)
                          }
                          selectedLanguage={selectedLanguage}
                        />

                        <div className="flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTask(selectedChecklist.id, task.id)}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("checklists.deleteTask")}
                          </Button>
                        </div>
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}
