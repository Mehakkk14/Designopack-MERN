import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Upload, X, CheckCircle, ExternalLink, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadPdfToStorage } from "@/lib/api";

interface PdfUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label?: string;
  categoryName?: string;
  className?: string;
}

export function PdfUpload({
  value = "",
  onChange,
  disabled = false,
  label = "Catalogue PDF File",
  categoryName = "catalogue",
  className,
}: PdfUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size?: string } | null>(null);
  const [mode, setMode] = useState<"file" | "url">(
    value && !value.startsWith("data:") ? "url" : "file"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      if (value.startsWith("data:application/pdf")) {
        setFileInfo({ name: "Uploaded Catalogue.pdf" });
        setMode("file");
      } else if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
        setFileInfo({ name: value.split("/").pop()?.split("?")[0] || "Catalogue.pdf" });
      }
    } else {
      setFileInfo(null);
    }
  }, [value]);

  const handleFileSelect = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert("Please select a valid PDF document (.pdf)");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    setFileInfo({ name: file.name, size: `${sizeMb} MB` });

    try {
      if (file.size <= 900 * 1024) {
        // Under 900KB: Instant Base64 read (<50ms)
        const reader = new FileReader();
        await new Promise<void>((resolve, reject) => {
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            onChange(dataUrl);
            resolve();
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });
      } else {
        // Exceeds 900KB (Firestore 1MB limit per document)
        setUploadError(
          `⚠️ PDF file size is ${sizeMb} MB (exceeds Firestore 1 MB database limit).\n\n` +
          `👉 Please click 'URL Link' tab above to paste your Google Drive / Dropbox link, OR compress your PDF under 900 KB.`
        );
      }
    } catch (err) {
      console.error("PDF read error:", err);
      setUploadError("Error reading PDF file. Please try using the 'URL Link' tab to paste a link.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.target.files || e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    setFileInfo(null);
    setUploadError(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={cn(
              "px-2 py-0.5 rounded transition-colors font-medium",
              mode === "file" ? "bg-primary text-white" : "text-gray-500 hover:text-gray-900"
            )}
          >
            Upload File
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={cn(
              "px-2 py-0.5 rounded transition-colors font-medium",
              mode === "url" ? "bg-primary text-white" : "text-gray-500 hover:text-gray-900"
            )}
          >
            URL Link
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded-lg whitespace-pre-line leading-relaxed">
          {uploadError}
        </div>
      )}

      {mode === "url" ? (
        <div className="space-y-1">
          <div className="relative">
            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={value.startsWith("data:") ? "" : value}
              onChange={(e) => {
                setUploadError(null);
                onChange(e.target.value);
              }}
              placeholder="https://drive.google.com/... or https://example.com/catalogue.pdf"
              className="pl-9 text-sm"
              disabled={disabled}
            />
          </div>
          <p className="text-xs text-gray-500">Paste any web link or Google Drive / Dropbox link to your PDF.</p>
        </div>
      ) : (
        <div>
          {value ? (
            <div className="flex items-center justify-between p-3 border border-emerald-200 bg-emerald-50 rounded-lg">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2 bg-emerald-600 text-white rounded-lg flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-emerald-900 truncate">
                    {fileInfo?.name || "Uploaded Catalogue.pdf"}
                  </p>
                  {fileInfo?.size && (
                    <p className="text-xs text-emerald-700">{fileInfo.size}</p>
                  )}
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">
                    <CheckCircle className="h-3 w-3 text-emerald-600" /> Ready for Download
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {value.startsWith("http") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-emerald-800 hover:bg-emerald-100"
                    onClick={() => window.open(value, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleRemove}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors bg-gray-50/50",
                isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-red-100/60 text-primary rounded-full">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                  ) : (
                    <Upload className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {isUploading ? "Uploading PDF..." : "Click to upload PDF Catalogue"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Drag and drop your .pdf document here
                  </p>
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                handleFileSelect(files[0]);
              }
            }}
            className="hidden"
            disabled={disabled || isUploading}
          />
        </div>
      )}
    </div>
  );
}
