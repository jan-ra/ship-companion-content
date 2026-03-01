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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableItem } from "@/components/sortable-item";
import { generateId } from "@/lib/json-utils";
import type { LanguageCode, Question } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { useUiLanguage, useDevMode } from "@/lib/preferences-store";

export default function FAQPage() {
  const { data, updateData } = useAppDataStore();
  const { t } = useT();
  const uiLanguage = useUiLanguage();
  const devMode = useDevMode();
  const [openItem, setOpenItem] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(uiLanguage);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data loaded</p>
      </div>
    );
  }

  const questions = data.data.questions;

  const addQuestion = () => {
    const newQuestion: Question = {
      id: generateId("faq-"),
      translations: {
        de: { questiontext: "", answertext: "" },
        en: { questiontext: "", answertext: "" },
        nl: { questiontext: "", answertext: "" },
      },
    };

    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        questions: [...d.data.questions, newQuestion],
      },
    }));

    setOpenItem(newQuestion.id!);
    toast.success(t("faq.toastAdded"));
  };

  const reorderQuestions = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex(q => q.id === active.id);
    const newIndex = questions.findIndex(q => q.id === over.id);
    updateData(d => ({ ...d, data: { ...d.data, questions: arrayMove(d.data.questions, oldIndex, newIndex) } }));
  };

  const removeQuestion = (index: number) => {
    if (confirm(t("faq.deleteConfirm"))) {
      updateData((d) => ({
        ...d,
        data: {
          ...d.data,
          questions: d.data.questions.filter((_, i) => i !== index),
        },
      }));
      toast.success(t("faq.toastDeleted"));
    }
  };

  const updateQuestion = (index: number, lang: LanguageCode, field: "questiontext" | "answertext" | "answerImage", value: string) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        questions: d.data.questions.map((q, i) =>
          i === index
            ? {
                ...q,
                customerEdited: true,
                translations: {
                  ...q.translations,
                  [lang]: { ...q.translations[lang], [field]: value },
                },
              }
            : q
        ),
      },
    }));
  };

  const setQuestionCustomerEdited = (index: number, value: boolean) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        questions: d.data.questions.map((q, i) =>
          i === index ? { ...q, customerEdited: value } : q
        ),
      },
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("faq.title")}</h1>
          <p className="text-muted-foreground">
            {t("faq.subtitle", { count: questions.length })}
          </p>
        </div>
        <Button onClick={addQuestion} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("faq.addQuestion")}
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">{t("faq.noQuestions")}</p>
            <Button onClick={addQuestion} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("faq.addFirstQuestion")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorderQuestions}>
          <SortableContext items={questions.map(q => q.id!)} strategy={verticalListSortingStrategy}>
            <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
              {questions.map((question, index) => (
                <AccordionItem key={question.id} value={question.id!} className="border-0">
                  <Card className={`mb-4 ${question.customerEdited ? "border-amber-300" : ""}`}>
                    <SortableItem id={question.id!} className="px-4 py-0">
                      <AccordionTrigger className="flex-1 py-4 hover:no-underline">
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <span className="font-medium">
                            {question.translations[uiLanguage].questiontext || question.translations.en.questiontext || t("faq.questionFallback", { index: index + 1 })}
                          </span>
                          {question.customerEdited && (
                            <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50 text-xs shrink-0">
                              Edited
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                    </SortableItem>
                    <AccordionContent>
                      <CardContent className="space-y-6 pt-4">
                        {question.customerEdited && (
                          <div>
                            <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50 text-xs">
                              Edited
                            </Badge>
                          </div>
                        )}
                        <LanguageSelector
                          value={selectedLanguage}
                          onChange={setSelectedLanguage}
                          className="max-w-xs"
                        />

                        <MultiLanguageInput
                          label="Question"
                          value={question.translations}
                          field="questiontext"
                          onChange={(lang, value) => updateQuestion(index, lang, "questiontext", value)}
                          placeholder="Enter the question"
                          required
                          selectedLanguage={selectedLanguage}
                        />

                        <MultiLanguageTextarea
                          label="Answer"
                          value={question.translations}
                          field="answertext"
                          onChange={(lang, value) => updateQuestion(index, lang, "answertext", value)}
                          placeholder="Enter the answer"
                          rows={6}
                          required
                          selectedLanguage={selectedLanguage}
                        />

                        <Separator />

                        <MultiLanguageImageUploader
                          label="Answer Image (optional)"
                          value={question.translations}
                          field="answerImage"
                          onChange={(lang, value) => updateQuestion(index, lang, "answerImage", value)}
                          selectedLanguage={selectedLanguage}
                        />

                        <div className="flex items-center justify-between">
                          {devMode ? (
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={question.customerEdited === true}
                                onCheckedChange={(checked) => setQuestionCustomerEdited(index, checked)}
                              />
                              <Label className="font-normal">Customer Edited</Label>
                            </div>
                          ) : <div />}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("faq.deleteQuestion")}
                          </Button>
                        </div>
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
