import React, { useState, useRef } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

const MAX_IMAGE_DIMENSION = 960;
const WEBP_QUALITY = 0.7;

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  label = "Image",
  required = false,
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  const convertFileToWebp = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const image = new Image();

        image.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = Math.min(
            1,
            MAX_IMAGE_DIMENSION / Math.max(image.width, image.height),
          );
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));

          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Unable to process image"));
            return;
          }

          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/webp", WEBP_QUALITY));
        };

        image.onerror = () => reject(new Error("Unable to load image"));
        image.src = event.target?.result as string;
      };

      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setIsUploading(true);

    try {
      const webpDataUrl = await convertFileToWebp(file);
      setPreview(webpDataUrl);
      onChange(webpDataUrl);
    } catch (error) {
      logger.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    setPreview("");
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {preview ? (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-white">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={removeImage}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              ) : (
                <Upload className="h-8 w-8 text-gray-600" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                {isUploading
                  ? "Uploading..."
                  : "Drop image here or click to browse"}
              </p>
              <p className="text-xs text-gray-500">
                Upload in WebP format for optimized storage and performance
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Choose Image
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}
