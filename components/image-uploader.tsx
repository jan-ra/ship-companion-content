"use client";

import { useRef, useState } from "react";
import { useAppDataStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

interface ImageUploaderProps {
  value: string;
  onChange: (filename: string) => void;
  label: string;
  required?: boolean;
  /** Called when an image is uploaded and should be set for all languages */
  onSetAllLanguages?: (filename: string) => void;
  /** Called when delete is confirmed and should clear all languages */
  onRemoveAllLanguages?: () => void;
  /** Whether this is part of a multi-language uploader */
  isMultiLanguage?: boolean;
  /** Whether any language has an image set (for initial upload detection) */
  hasAnyLanguageImage?: boolean;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB max input size
const MAX_DIMENSION = 1920; // Max width/height for resizing
const WEBP_QUALITY = 0.85; // WebP quality (0-1)

/**
 * Generate a hash from an ArrayBuffer using SHA-256
 */
async function generateHash(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex.substring(0, 12); // Use first 12 characters for shorter filenames
}

/**
 * Convert an image file to WebP format with optional resizing
 */
async function convertToWebP(file: File): Promise<{ blob: Blob; hash: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions if needed
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create canvas and draw resized image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP blob
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error("Failed to convert image to WebP"));
            return;
          }

          // Generate hash from the blob content
          const arrayBuffer = await blob.arrayBuffer();
          const hash = await generateHash(arrayBuffer);

          resolve({ blob, hash });
        },
        "image/webp",
        WEBP_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

export function ImageUploader({
  value,
  onChange,
  label,
  required = false,
  onSetAllLanguages,
  onRemoveAllLanguages,
  isMultiLanguage = false,
  hasAnyLanguageImage = false,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addImage, removeImage, getImageUrl, hasImage } = useAppDataStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { t } = useT();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("imageUploader.selectImageError"));
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("imageUploader.fileSizeError", { size: MAX_FILE_SIZE / 1024 / 1024 }));
      return;
    }

    setIsProcessing(true);

    try {
      // Convert to WebP and generate hash
      const { blob, hash } = await convertToWebP(file);

      // Generate filename with hash
      const filename = `${hash}.webp`;

      // Check if we already have this exact image
      if (hasImage(filename)) {
        // Image already exists, just reference it
        // If this is a multi-language uploader and no language has an image yet, set for all
        if (isMultiLanguage && !hasAnyLanguageImage && onSetAllLanguages) {
          onSetAllLanguages(filename);
          toast.success(t("imageUploader.linkedAllLanguages"));
        } else {
          onChange(filename);
          toast.success(t("imageUploader.alreadyExists"));
        }
      } else {
        // Remove old image if replacing (only for this language)
        if (value && hasImage(value)) {
          removeImage(value);
        }

        // Add new image to store
        addImage(filename, blob);

        // If this is a multi-language uploader and no language has an image yet, set for all
        if (isMultiLanguage && !hasAnyLanguageImage && onSetAllLanguages) {
          onSetAllLanguages(filename);
          toast.success(t("imageUploader.setAllLanguages"));
        } else {
          onChange(filename);
          const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
          toast.success(t("imageUploader.convertedWebP", { size: sizeMB }));
        }
      }
    } catch (error) {
      console.error("Image processing error:", error);
      toast.error(t("imageUploader.processingError"));
    } finally {
      setIsProcessing(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveClick = () => {
    if (isMultiLanguage && onRemoveAllLanguages) {
      // Show confirmation dialog for multi-language removal
      setShowDeleteDialog(true);
    } else {
      // Single language - remove directly
      if (value && hasImage(value)) {
        removeImage(value);
      }
      onChange("");
      toast.success(t("imageUploader.imageRemoved"));
    }
  };

  const handleConfirmRemove = () => {
    if (value && hasImage(value)) {
      removeImage(value);
    }
    if (onRemoveAllLanguages) {
      onRemoveAllLanguages();
    }
    setShowDeleteDialog(false);
    toast.success(t("imageUploader.imageRemovedAll"));
  };

  const imageUrl = value ? getImageUrl(value) : null;
  const imageExists = value ? hasImage(value) : false;

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      {imageUrl && imageExists ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                <img src={imageUrl} alt={value} className="object-contain w-full h-full" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground truncate flex-1">{value}</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveClick}
                  className="gap-2 ml-2"
                >
                  <X className="h-4 w-4" />
                  {t("imageUploader.remove")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {value && !imageExists && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-muted text-sm">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t("imageUploader.referenced")} <code className="text-xs">{value}</code> {t("imageUploader.notFound")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange("")}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isProcessing}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-2"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("imageUploader.processing")}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {value && !imageExists ? t("imageUploader.uploadImage") : t("imageUploader.chooseImage")}
              </>
            )}
          </Button>
          {!value && !isProcessing && (
            <p className="text-xs text-muted-foreground">
              {t("imageUploader.fileHint")}
            </p>
          )}
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("imageUploader.removeAllTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("imageUploader.removeAllDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("imageUploader.removeFromAll")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
