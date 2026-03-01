"use client";

import { useT } from "@/lib/i18n";
import { BookOpen, CheckSquare, ChevronRight, FileDown, FileUp, HelpCircle, Info, Lightbulb, Map, MessageSquare, Settings, Ship, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold border-b pb-2">{title}</h2>
      {children}
    </section>
  );
}

function Step({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function SectionRow({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="flex gap-3 py-3 border-b last:border-b-0">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="space-y-0.5">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function Tip({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <ChevronRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
      <div className="space-y-0.5">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="space-y-1">
      <p className="font-medium flex gap-2 items-start">
        <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        {question}
      </p>
      <p className="text-sm text-muted-foreground pl-6">{answer}</p>
    </div>
  );
}

export default function HelpPage() {
  const { t } = useT();

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          {t("help.title")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("help.subtitle")}</p>
      </div>

      <Section title={t("help.introTitle")}>
        <p className="text-muted-foreground leading-relaxed">{t("help.introText")}</p>
      </Section>

      <Section title={t("help.workflowTitle")}>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <Step icon={FileUp} title={t("help.workflowStep1Title")} text={t("help.workflowStep1Text")} />
            <Step icon={Settings} title={t("help.workflowStep2Title")} text={t("help.workflowStep2Text")} />
            <Step icon={FileDown} title={t("help.workflowStep3Title")} text={t("help.workflowStep3Text")} />
          </CardContent>
        </Card>
      </Section>

      <Section title={t("help.sectionsTitle")}>
        <Card>
          <CardContent className="pt-2 pb-2">
            <SectionRow icon={Settings} title={t("help.sectionGeneral")} text={t("help.sectionGeneralText")} />
            <SectionRow icon={Info} title={t("help.sectionAbout")} text={t("help.sectionAboutText")} />
            <SectionRow icon={Ship} title={t("help.sectionCabinPlan")} text={t("help.sectionCabinPlanText")} />
            <SectionRow icon={CheckSquare} title={t("help.sectionChecklists")} text={t("help.sectionChecklistsText")} />
            <SectionRow icon={HelpCircle} title={t("help.sectionFaq")} text={t("help.sectionFaqText")} />
            <SectionRow icon={MessageSquare} title={t("help.sectionContact")} text={t("help.sectionContactText")} />
            <SectionRow icon={BookOpen} title={t("help.sectionLinks")} text={t("help.sectionLinksText")} />
            <SectionRow icon={Map} title={t("help.sectionMap")} text={t("help.sectionMapText")} />
            <SectionRow icon={UtensilsCrossed} title={t("help.sectionRecipes")} text={t("help.sectionRecipesText")} />
          </CardContent>
        </Card>
      </Section>

      <Section title={t("help.tipsTitle")}>
        <Card>
          <CardContent className="pt-6 space-y-5">
            <Tip title={t("help.tipLanguages")} text={t("help.tipLanguagesText")} />
            <Tip title={t("help.tipImages")} text={t("help.tipImagesText")} />
            <Tip title={t("help.tipAutoSave")} text={t("help.tipAutoSaveText")} />
            <Tip title={t("help.tipExport")} text={t("help.tipExportText")} />
            <Tip title={t("help.tipDevMode")} text={t("help.tipDevModeText")} />
          </CardContent>
        </Card>
      </Section>

      <Section title={t("help.faqTitle")}>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <FaqItem question={t("help.faqQ1")} answer={t("help.faqA1")} />
            <FaqItem question={t("help.faqQ2")} answer={t("help.faqA2")} />
            <FaqItem question={t("help.faqQ3")} answer={t("help.faqA3")} />
            <FaqItem question={t("help.faqQ4")} answer={t("help.faqA4")} />
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
