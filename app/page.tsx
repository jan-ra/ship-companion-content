"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDataStore } from "@/lib/store";
import { importAppConfFile } from "@/lib/json-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Anchor, FileJson, Upload } from "lucide-react";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

export default function Home() {
  const { data, setData } = useAppDataStore();
  const { t } = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // If data is already loaded (e.g. navigated back to /), redirect to /general
  useEffect(() => {
    if (data) {
      router.replace("/general");
    }
  }, [data, router]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const { data: appData, images: imageMap } = await importAppConfFile(file);
      setData(appData, imageMap);
      toast.success(t("toast.importSuccess", { count: imageMap.size }));
      router.push("/general");
    } catch (error) {
      toast.error((error as Error).message);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md m-6 text-center">
        <CardHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Anchor className="h-8 w-8" />
            <CardTitle className="text-2xl">{t("dashboard.welcomeTitle")}</CardTitle>
          </div>
          <CardDescription>
            {t("dashboard.welcomeDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".appconf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-5 w-5" />
            {t("header.import")}
          </Button>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <FileJson className="h-4 w-4 shrink-0" />
            <span>{t("dashboard.welcomeHint")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
