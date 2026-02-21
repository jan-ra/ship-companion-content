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
import { Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import type { LanguageCode, Question } from "@/lib/types";

export default function FAQPage() {
  const { data, updateData } = useAppDataStore();
  const [openItem, setOpenItem] = useState<string>("0");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");

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

    setOpenItem(String(questions.length));
    toast.success("New FAQ question added");
  };

  const removeQuestion = (index: number) => {
    if (confirm("Are you sure you want to delete this FAQ question?")) {
      updateData((d) => ({
        ...d,
        data: {
          ...d.data,
          questions: d.data.questions.filter((_, i) => i !== index),
        },
      }));
      toast.success("FAQ question deleted");
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

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">FAQ</h1>
          <p className="text-muted-foreground">
            Manage frequently asked questions ({questions.length} questions)
          </p>
        </div>
        <Button onClick={addQuestion} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No FAQ questions yet</p>
            <Button onClick={addQuestion} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
          {questions.map((question, index) => (
            <AccordionItem key={index} value={String(index)}>
              <Card className="mb-4">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {question.translations.en.questiontext || `Question ${index + 1}`}
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

                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Question
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
  );
}
