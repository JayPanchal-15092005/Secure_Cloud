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
  CheckCircle2,
  FileText,
  FileVideo2,
  FileImage,
  Plus,
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

interface SelectedFileItem {
  id: string;
  file: File;
  error?: string | null;
}

export default function FileUploadForm({
  userId,
  onUploadSuccess,
  currentFolder = null,
}: FileUploadFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [overallError, setOverallError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder creation state
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Size limits in bytes
  const LIMITS = {
    image: 50 * 1024 * 1024, // 50MB
    video: 400 * 1024 * 1024, // 400MB
    pdf: 50 * 1024 * 1024, // 50MB
  };

  function validateFile(f: File): string | null {
    const { type, size } = f;
    if (type.startsWith("image/")) {
      if (size > LIMITS.image) return "Exceeds 50 MB limit";
      return null;
    }
    if (type.startsWith("video/")) {
      if (size > LIMITS.video) return "Exceeds 400 MB limit";
      return null;
    }
    if (type === "application/pdf") {
      if (size > LIMITS.pdf) return "Exceeds 50 MB limit";
      return null;
    }
    return "Unsupported format (Images, Videos & PDFs only)";
  }

  const addFiles = (filesList: FileList | File[]) => {
    const newItems: SelectedFileItem[] = [];
    const filesArray = Array.from(filesList);

    for (const f of filesArray) {
      // Avoid duplicate file names of same size in the batch
      const isDuplicate = selectedFiles.some(
        (item) => item.file.name === f.name && item.file.size === f.size
      );
      if (!isDuplicate) {
        const error = validateFile(f);
        newItems.push({
          id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
          file: f,
          error,
        });
      }
    }

    if (newItems.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newItems]);
      setOverallError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setOverallError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const humanSize = (n: number) =>
    n < 1024
      ? `${n} B`
      : n < 1024 * 1024
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / (1024 * 1024)).toFixed(1)} MB`;

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <FileImage className="h-4 w-4 text-blue-500" />;
    }
    if (file.type.startsWith("video/")) {
      return <FileVideo2 className="h-4 w-4 text-purple-500" />;
    }
    return <FileText className="h-4 w-4 text-red-500" />;
  };

  const validFiles = selectedFiles.filter((item) => !item.error);

  const handleUpload = async () => {
    if (validFiles.length === 0) {
      setOverallError("Please add at least one valid file to upload.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setOverallError(null);

    const formData = new FormData();
    formData.append("userId", userId);
    if (currentFolder) formData.append("parentId", currentFolder);

    for (const item of validFiles) {
      formData.append("files", item.file);
    }

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
        description: `Successfully uploaded ${validFiles.length} file(s).`,
      });

      clearAllFiles();
      onUploadSuccess?.();
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.error || "Failed to upload. Please try again.";
      setOverallError(msg);
      toast.error("Upload Failed", { description: msg });
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

      setFolderName("");
      setFolderModalOpen(false);
      onUploadSuccess?.();
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
      {/* Hidden input supporting multiple files */}
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept=".png,.jpg,.jpeg,.gif,.webp,.mp4,.mkv,.mov,.webm,.pdf"
      />

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
          Add Files
        </Button>
      </div>

      {/* File drop area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "border-2 border-dashed rounded-lg p-5 text-center transition-colors",
          selectedFiles.length > 0
            ? "border-primary/40 bg-primary/5"
            : "border-default-300 hover:border-primary/50"
        )}
      >
        {selectedFiles.length === 0 ? (
          <div className="space-y-3 py-2">
            <FileUp className="h-10 w-10 mx-auto text-primary/70" />
            <div>
              <p className="text-default-700 font-medium">
                Drag & drop multiple files here, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary underline font-semibold cursor-pointer"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-default-500 mt-1">
                Select multiple Images (≤50 MB), Videos (≤400 MB), or PDFs (≤50 MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-semibold text-default-600 uppercase tracking-wider">
                Selected Files ({selectedFiles.length})
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 text-xs px-2"
                  startContent={<Plus className="h-3 w-3" />}
                  disabled={uploading}
                >
                  Add More
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearAllFiles}
                  className="h-7 text-xs px-2 text-default-500 hover:text-danger"
                  disabled={uploading}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* List of selected files with scrollbar */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {selectedFiles.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md border text-sm transition-colors",
                    item.error
                      ? "border-danger/40 bg-danger/10 text-danger"
                      : "border-default-200 bg-background/80"
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    {getFileIcon(item.file)}
                    <div className="truncate">
                      <p className="truncate font-medium text-xs text-default-800">
                        {item.file.name}
                      </p>
                      <p className="text-[10px] text-default-500">
                        {humanSize(item.file.size)}
                        {item.error && (
                          <span className="text-danger font-medium ml-1">
                            • {item.error}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {!uploading && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(item.id)}
                      className="h-6 w-6 min-w-6 text-default-400 hover:text-danger"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Overall Error display */}
            {overallError && (
              <div className="bg-danger/10 text-danger-700 p-2.5 rounded-md flex items-center gap-2 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{overallError}</span>
              </div>
            )}

            {/* Progress bar */}
            {uploading && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-default-600">
                  <span>Uploading files...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} size="sm" className="w-full" />
              </div>
            )}

            {/* Upload Button */}
            <Button
              startContent={<Upload className="h-4 w-4" />}
              endContent={!uploading && <ArrowRight className="h-4 w-4" />}
              onClick={handleUpload}
              isLoading={uploading}
              disabled={validFiles.length === 0 || uploading}
              className="w-full mt-2"
            >
              {uploading
                ? `Uploading ${validFiles.length} file(s)... ${progress}%`
                : `Upload ${validFiles.length} File${
                    validFiles.length === 1 ? "" : "s"
                  }`}
            </Button>
          </div>
        )}
      </div>

      {/* Upload rules/tips */}
      <div className="bg-default-100/40 p-3.5 rounded-lg border border-default-200/60">
        <h4 className="text-xs font-semibold text-default-700 mb-1.5">
          Supported Upload Formats
        </h4>
        <ul className="text-xs text-default-600 space-y-1">
          <li>• Images (JPG, PNG, GIF, WebP) up to 50 MB</li>
          <li>• Videos (MP4, MKV, MOV, WebM) up to 400 MB</li>
          <li>• Documents (PDF) up to 50 MB</li>
        </ul>
      </div>

      {/* Create Folder Modal */}
      <Dialog
        isOpen={folderModalOpen}
        onOpenChange={setFolderModalOpen}
        classNames={{ content: "border border-default-200 bg-default-50" }}
      >
        <DialogHeader className="border-b border-default-200 flex gap-2 items-center">
          <FolderPlus className="h-5 w-5 text-primary" />
          <DialogTitle className="text-base font-medium">New Folder</DialogTitle>
        </DialogHeader>
        <DialogBody className="border-t border-default-200 px-6 py-4">
          <p className="text-sm text-default-600 mb-2">
            Enter a name for your folder:
          </p>
          <div className="px-6 pt-2">
            <Input
              type="text"
              placeholder="e.g. Work Documents"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
            />
          </div>
        </DialogBody>
        <DialogFooter className="border-t border-default-200 px-6 py-4">
          <div className="flex items-center justify-end gap-3 w-full">
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
