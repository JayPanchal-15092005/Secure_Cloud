"use client";

import React from "react";
import {
  X,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileVideo2,
  FileImage,
  File,
} from "lucide-react";
import { Button } from "./ui/button";
import type { File as FileType } from "@/lib/db/schema";
import { Dialog, DialogHeader, DialogBody, DialogTitle } from "./ui/dialog";
import Badge from "./ui/Badge";

interface FilePreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileType | null;
  onDownload: (file: FileType) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function FilePreviewModal({
  isOpen,
  onOpenChange,
  file,
  onDownload,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
}: FilePreviewModalProps) {
  if (!file) return null;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isPdf = file.type === "application/pdf";

  const humanSize = (n: number) =>
    n < 1024
      ? `${n} B`
      : n < 1024 * 1024
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / (1024 * 1024)).toFixed(1)} MB`;

  const getHighResImageUrl = (item: FileType) => {
    const base = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    if (base && item.path) {
      return `${base}/tr:q-90,w-1600,h-1200,fo-auto/${item.path}`;
    }
    return item.fileUrl;
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        overlay: "bg-black/80 backdrop-blur-md",
        content:
          "max-w-5xl w-[95vw] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-background border border-default-200 rounded-xl shadow-2xl",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-default-200 bg-default-50/70">
        <div className="flex items-center gap-3 overflow-hidden">
          {isImage && <FileImage className="h-5 w-5 text-blue-500 shrink-0" />}
          {isVideo && <FileVideo2 className="h-5 w-5 text-purple-500 shrink-0" />}
          {isPdf && <FileText className="h-5 w-5 text-red-500 shrink-0" />}
          {!isImage && !isVideo && !isPdf && (
            <File className="h-5 w-5 text-default-500 shrink-0" />
          )}

          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate max-w-[200px] sm:max-w-md">
              {file.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-default-500">
              <span>{humanSize(file.size)}</span>
              <span>•</span>
              <span className="capitalize">{file.type.split("/")[1] || file.type}</span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-2 pr-6">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDownload(file)}
            className="h-8 px-2.5 text-xs"
            startContent={<Download className="h-3.5 w-3.5" />}
          >
            <span className="hidden sm:inline">Download</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(file.fileUrl, "_blank")}
            className="h-8 px-2.5 text-xs"
            startContent={<ExternalLink className="h-3.5 w-3.5" />}
          >
            <span className="hidden sm:inline">Open in Tab</span>
          </Button>
        </div>
      </div>

      {/* Content Preview Area */}
      <div className="relative flex-1 overflow-auto bg-black/5 dark:bg-black/30 flex items-center justify-center p-2 sm:p-6 min-h-[50vh] max-h-[75vh]">
        {/* Navigation arrows */}
        {hasPrev && onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-3 z-20 p-2 rounded-full bg-background/80 hover:bg-background shadow-md border border-default-200 text-default-700 transition"
            aria-label="Previous file"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {hasNext && onNext && (
          <button
            onClick={onNext}
            className="absolute right-3 z-20 p-2 rounded-full bg-background/80 hover:bg-background shadow-md border border-default-200 text-default-700 transition"
            aria-label="Next file"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Image Preview */}
        {isImage && (
          <div className="max-w-full max-h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getHighResImageUrl(file)}
              alt={file.name}
              className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Video Preview */}
        {isVideo && (
          <div className="w-full flex items-center justify-center">
            <video
              src={file.fileUrl}
              controls
              autoPlay
              className="max-h-[70vh] max-w-full rounded-lg shadow-md"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* PDF Viewer */}
        {isPdf && (
          <div className="w-full h-full min-h-[68vh] rounded-lg overflow-hidden border border-default-200 shadow-sm bg-background">
            <iframe
              src={`${file.fileUrl}#toolbar=1`}
              className="w-full h-[68vh] border-0"
              title={file.name}
            />
          </div>
        )}

        {/* Other / Unsupported preview */}
        {!isImage && !isVideo && !isPdf && (
          <div className="text-center p-8 max-w-md">
            <File className="h-16 w-16 mx-auto text-default-400 mb-4" />
            <h4 className="font-medium text-base mb-2">No Preview Available</h4>
            <p className="text-xs text-default-500 mb-4">
              Preview is not supported for this file type. You can download the file to view it on your device.
            </p>
            <Button
              variant="default"
              startContent={<Download className="h-4 w-4" />}
              onClick={() => onDownload(file)}
            >
              Download File
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
