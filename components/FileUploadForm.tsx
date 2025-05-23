"use client";

import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import {
  Upload,
  X,
  FileUp,
  AlertTriangle,
  FolderPlus,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogBody,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "./ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";

interface FileUploadFormProps {
  userId: string;
  onUploadSuccess?: () => void;
  currentFolder?: string | null;
}

export default function FileUploadForm({
  userId,
  onUploadSuccess,
  currentFolder = null,
}: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder creation state
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // size limits in bytes
  const LIMITS = {
    image: 50 * 1024 * 1024, // 50MB
    video: 400 * 1024 * 1024, // 400MB
    pdf: 50 * 1024 * 1024, // 50MB
  };

  function validateFile(f: File): string | null {
    const { type, size } = f;
    if (type.startsWith("image/")) {
      if (size > LIMITS.image) return "Image exceeds 50 MB limit";
      return null;
    }
    if (type.startsWith("video/")) {
      if (size > LIMITS.video) return "Video exceeds 400 MB limit";
      return null;
    }
    if (type === "application/pdf") {
      if (size > LIMITS.pdf) return "PDF exceeds 50 MB limit";
      return null;
    }
    return "Unsupported file type";
  }

  const handleFile = (f: File) => {
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }
    setFile(f);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const humanSize = (n: number) =>
    n < 1024
      ? `${n} B`
      : n < 1024 * 1024
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / (1024 * 1024)).toFixed(1)} MB`;

  const handleUpload = async () => { // 
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    if (currentFolder) formData.append("parentId", currentFolder);

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      await axios.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
      });

      toast.success("Upload Successful", {
        description: `${file.name} has been uploaded successfully.`,
      });
      clearFile();
      onUploadSuccess?.();
    } catch (err) {
      console.error(err);
      setError("Failed to upload. Please try again.");
      toast.error("Upload Failed", {
        description: "We couldn't upload your file. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.message("Invalid Folder Name", {
        description: "Please enter a valid folder name.",
      });
      return;
    }

    setCreatingFolder(true);

    try {
      await axios.post("/api/folders/create", {
        name: folderName.trim(),
        userId: userId,
        parentId: currentFolder,
      });

      toast.success("Folder Created", {
        description: `Folder "${folderName}" has been created successfully.`,
      });

      // Reset folder name and close modal
      setFolderName("");
      setFolderModalOpen(false);

      // Call the onUploadSuccess callback to refresh the file list
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Folder Creation Failed", {
        description: "We couldn't create the folder. Please try again.",
      });
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-2 mb-2">
        <Button
          variant="default"
          startContent={<FolderPlus className="h-4 w-4" />}
          onClick={() => setFolderModalOpen(true)}
          className="flex-1"
        >
          New Folder
        </Button>
        <Button
          variant="default"
          startContent={<FileUp className="h-4 w-4" />}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          Add File
        </Button>
      </div>

      {/* File drop area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          error
            ? "border-danger/70 bg-danger/10"
            : file
            ? "border-primary/30 bg-primary/10"
            : "border-default-300 hover:border-primary/50"
        )}
      >
        {!file ? (
          <div className="space-y-3">
            <FileUp className="h-12 w-12 mx-auto text-primary/70" />
            <p className="text-default-600">
              Drag & drop an image, video or PDF here, or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-default-500 mt-1">
              Supported: images (≤90 MB), videos (≤100 MB), PDFs (≤90 MB)
            </p>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".png,.jpg,.jpeg,.gif,.mp4,.mkv,.mov,.webm,.pdf"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* File info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <FileUp className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium truncate max-w-[180px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-default-500">
                    {humanSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="text-default-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-danger/10 text-danger-700 p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Progress */}
            {uploading && (
              <Progress
                value={progress}
                size="sm"
                showValueLabel
                className="w-full"
              />
            )}

            {/* Upload button */}
            <Button
              startContent={<Upload className="h-4 w-4" />}
              endContent={!uploading && <ArrowRight className="h-4 w-4" />}
              onClick={handleUpload}
              isLoading={uploading}
              className="w-full"
            >
              {uploading ? `Uploading… ${progress}%` : "Upload File"}
            </Button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-default-100/5 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Tips</h4>
        <ul className="text-xs text-default-600 space-y-1">
          <li>• Images (jpg, png, gif…), ≤ 90 MB</li>
          <li>• Videos (mp4, mkv…), ≤ 100 MB</li>
          <li>• PDFs, ≤ 90 MB</li>
        </ul>
      </div>

      {/* Create Folder Modal */}
      <Dialog
        isOpen={folderModalOpen}
        onOpenChange={setFolderModalOpen}
        classNames={{ content: "border border-default-200 bg-default-5" }}
      >
          <DialogHeader className="border-b border-default-200 flex gap-2 items-center">
            <FolderPlus className="h-5 w-5 text-primary" />
            <DialogTitle className="text-base font-medium">
              New Folder
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="border-t border-default-200 px-6 py-4">
            <p className="text-sm text-default-600 mb-2">
              Enter a name for your folder:
            </p>
            <div className="px-6 pt-4">
            <Input
              type="text"
              placeholder="My Images"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
            />
            </div>
          </DialogBody>
          <DialogFooter className="border-t border-default-200 px-6 py-4">
      { /*// */} <div className="flex items-center justify-end gap-4 w-full">
            <Button
              variant="destructive"
              onClick={() => setFolderModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              onClick={handleCreateFolder}
              isLoading={creatingFolder}
              endContent={!creatingFolder && <ArrowRight className="h-4 w-4" />}
            >
              Create
            </Button>
            </div>
          </DialogFooter>
      </Dialog>
    </div>
  );
}
