"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Folder,
  Star,
  Trash,
  X,
  ExternalLink,
  Search,
  CheckSquare,
  Square,
  MinusSquare,
  ArrowUpFromLine,
  Eye,
  Filter,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableColumn,
} from "./ui/table";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Badge from "./ui/Badge";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { File as FileType } from "@/lib/db/schema";
import axios from "axios";
import ConfirmationModal from "./ui/ConfirmationModal";
import FileEmptyState from "./FileEmptyState";
import FileIcon from "./FileIcon";
import FileActions from "./FileActions";
import FileLoadingState from "./FileLoadingState";
import FileTabs from "./FileTabs";
import FolderNavigation from "./FolderNavigation";
import FileActionButtons from "./FileActionButtons";
import FilePreviewModal from "./FilePreviewModal";

interface FileListProps {
  userId: string;
  refreshTrigger?: number;
  onFolderChange?: (folderId: string | null) => void;
}

export default function FileList({
  userId,
  refreshTrigger = 0,
  onFolderChange,
}: FileListProps) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "image" | "video" | "pdf" | "folder"
  >("all");

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [batchDeleteModalOpen, setBatchDeleteModalOpen] = useState(false);

  // Single file delete / empty trash modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  // In-app preview state
  const [previewFile, setPreviewFile] = useState<FileType | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Fetch files
  const fetchFiles = async () => {
    setLoading(true);

    try {
      let url = `/api/files?userId=${userId}`;
      if (currentFolder) {
        url += `&parentId=${currentFolder}`;
      }

      const response = await axios.get(url);
      setFiles(response.data);
      // Clear selection on new folder/fetch
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Error Loading Files", {
        description: "We couldn't load your files. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [userId, refreshTrigger, currentFolder]);

  // Reset multi-select when switching tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedIds(new Set());
  };

  // Base filtering by tab
  const tabFilteredFiles = useMemo(() => {
    switch (activeTab) {
      case "starred":
        return files.filter((file) => file.isStarred && !file.isTrash);
      case "trash":
        return files.filter((file) => file.isTrash);
      case "all":
      default:
        return files.filter((file) => !file.isTrash);
    }
  }, [files, activeTab]);

  // Combined filtering (Tab + Search Query + Type Filter)
  const filteredFiles = useMemo(() => {
    return tabFilteredFiles.filter((file) => {
      // 1. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = file.name.toLowerCase().includes(query);
        const matchesType = file.type.toLowerCase().includes(query);
        if (!matchesName && !matchesType) return false;
      }

      // 2. Type filter
      if (typeFilter === "image") {
        return file.type.startsWith("image/");
      }
      if (typeFilter === "video") {
        return file.type.startsWith("video/");
      }
      if (typeFilter === "pdf") {
        return file.type === "application/pdf";
      }
      if (typeFilter === "folder") {
        return file.isFolder;
      }

      return true;
    });
  }, [tabFilteredFiles, searchQuery, typeFilter]);

  // Count files in trash & starred
  const trashCount = useMemo(() => {
    return files.filter((file) => file.isTrash).length;
  }, [files]);

  const starredCount = useMemo(() => {
    return files.filter((file) => file.isStarred && !file.isTrash).length;
  }, [files]);

  // --- Multi-select handlers ---
  const isAllSelected =
    filteredFiles.length > 0 &&
    filteredFiles.every((f) => selectedIds.has(f.id));

  const isSomeSelected =
    selectedIds.size > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set<string>();
      filteredFiles.forEach((f) => newSet.add(f.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelectRow = (fileId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  const handleBatchAction = async (
    action: "star" | "unstar" | "trash" | "restore" | "delete"
  ) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setBatchActionLoading(true);

    try {
      const res = await axios.post("/api/files/batch", {
        action,
        fileIds: ids,
      });

      // Update local files state
      setFiles((prev) => {
        if (action === "delete") {
          return prev.filter((f) => !ids.includes(f.id));
        }
        return prev.map((f) => {
          if (!ids.includes(f.id)) return f;
          if (action === "star") return { ...f, isStarred: true };
          if (action === "unstar") return { ...f, isStarred: false };
          if (action === "trash") return { ...f, isTrash: true };
          if (action === "restore") return { ...f, isTrash: false };
          return f;
        });
      });

      setSelectedIds(new Set());
      setBatchDeleteModalOpen(false);

      toast.success("Action Completed", {
        description: res.data.message || `Successfully processed ${ids.length} item(s).`,
      });
    } catch (err) {
      console.error("Batch action failed:", err);
      toast.error("Action Failed", {
        description: "Failed to perform bulk operation. Please try again.",
      });
    } finally {
      setBatchActionLoading(false);
    }
  };

  // --- Single item handlers ---
  const handleStarFile = async (fileId: string) => {
    try {
      await axios.patch(`/api/files/${fileId}/star`);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, isStarred: !f.isStarred } : f
        )
      );
      const file = files.find((f) => f.id === fileId);
      toast.success(
        file?.isStarred ? "Removed from Starred" : "Added to Starred"
      );
    } catch (error) {
      console.error("Error starring file:", error);
      toast.error("Action Failed");
    }
  };

  const handleTrashFile = async (fileId: string) => {
    try {
      const response = await axios.patch(`/api/files/${fileId}/trash`);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, isTrash: !f.isTrash } : f
        )
      );
      toast.success(
        response.data.isTrash ? "Moved to Trash" : "Restored from Trash"
      );
    } catch (error) {
      console.error("Error trashing file:", error);
      toast.error("Action Failed");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const fileToDelete = files.find((f) => f.id === fileId);
      await axios.delete(`/api/files/${fileId}/delete`);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success("Permanently Deleted", {
        description: `"${fileToDelete?.name || "File"}" has been deleted.`,
      });
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Deletion Failed");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await axios.delete(`/api/files/empty-trash`);
      setFiles((prev) => prev.filter((file) => !file.isTrash));
      toast.success("Trash Emptied", {
        description: `All items have been permanently deleted`,
      });
      setEmptyTrashModalOpen(false);
    } catch (error) {
      console.error("Error emptying trash:", error);
      toast.error("Action Failed");
    }
  };

  const handleDownloadFile = async (file: FileType) => {
    try {
      toast.loading("Preparing Download", {
        description: `Getting "${file.name}" ready...`,
      });

      const url = file.type.startsWith("image/")
        ? `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-100,orig-true/${file.path}`
        : file.fileUrl;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast.success("Download Ready");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download Failed");
    }
  };

  // --- In-App Preview Handlers ---
  const previewableFiles = useMemo(() => {
    return filteredFiles.filter((f) => !f.isFolder);
  }, [filteredFiles]);

  const currentPreviewIndex = useMemo(() => {
    if (!previewFile) return -1;
    return previewableFiles.findIndex((f) => f.id === previewFile.id);
  }, [previewFile, previewableFiles]);

  const handleOpenPreview = (file: FileType) => {
    if (file.isFolder) {
      navigateToFolder(file.id, file.name);
      return;
    }
    setPreviewFile(file);
    setPreviewModalOpen(true);
  };

  const handleNextPreview = () => {
    if (currentPreviewIndex >= 0 && currentPreviewIndex < previewableFiles.length - 1) {
      setPreviewFile(previewableFiles[currentPreviewIndex + 1]);
    }
  };

  const handlePrevPreview = () => {
    if (currentPreviewIndex > 0) {
      setPreviewFile(previewableFiles[currentPreviewIndex - 1]);
    }
  };

  // --- Folder Navigation ---
  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolder(folderId);
    setFolderPath([...folderPath, { id: folderId, name: folderName }]);
    onFolderChange?.(folderId);
  };

  const navigateUp = () => {
    if (folderPath.length > 0) {
      const newPath = [...folderPath];
      newPath.pop();
      setFolderPath(newPath);
      const newFolderId =
        newPath.length > 0 ? newPath[newPath.length - 1].id : null;
      setCurrentFolder(newFolderId);
      onFolderChange?.(newFolderId);
    }
  };

  const navigateToPathFolder = (index: number) => {
    if (index < 0) {
      setCurrentFolder(null);
      setFolderPath([]);
      onFolderChange?.(null);
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      const newFolderId = newPath[newPath.length - 1].id;
      setCurrentFolder(newFolderId);
      onFolderChange?.(newFolderId);
    }
  };

  if (loading) {
    return <FileLoadingState />;
  }

  return (
    <div className="space-y-5">
      {/* Tabs for filtering files */}
      <FileTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        files={files}
        starredCount={starredCount}
        trashCount={trashCount}
      />

      {/* Global Search Bar & Type Filter Chips */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-default-100/50 p-3 rounded-lg border border-default-200/80">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search files or folders by name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="h-4 w-4 text-default-400" />}
            endContent={
              searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-default-400 hover:text-default-700 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null
            }
            className="w-full bg-background"
          />
        </div>

        {/* Quick Type Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 items-center">
          <Filter className="h-3.5 w-3.5 text-default-400 ml-1 hidden sm:inline" />
          {(
            [
              { key: "all", label: "All" },
              { key: "image", label: "Images" },
              { key: "video", label: "Videos" },
              { key: "pdf", label: "PDFs" },
              { key: "folder", label: "Folders" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setTypeFilter(item.key)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition cursor-pointer whitespace-nowrap ${
                typeFilter === item.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-default-200/60 hover:bg-default-200 text-default-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search results active indicator */}
      {(searchQuery.trim() || typeFilter !== "all") && (
        <div className="flex items-center justify-between text-xs text-default-500 px-1">
          <span>
            Found <strong>{filteredFiles.length}</strong> matching item(s)
            {searchQuery && ` for "${searchQuery}"`}
            {typeFilter !== "all" && ` in ${typeFilter}s`}
          </span>
          <button
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("all");
            }}
            className="text-primary hover:underline font-medium"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Folder navigation */}
      {activeTab === "all" && (
        <FolderNavigation
          folderPath={folderPath}
          navigateUp={navigateUp}
          navigateToPathFolder={navigateToPathFolder}
        />
      )}

      {/* Action buttons bar */}
      <FileActionButtons
        activeTab={activeTab}
        trashCount={trashCount}
        folderPath={folderPath}
        onRefresh={fetchFiles}
        onEmptyTrash={() => setEmptyTrashModalOpen(true)}
      />

      {/* Multi-Select Floating Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-24 z-30 bg-primary/10 backdrop-blur-md border border-primary/30 p-3 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Badge color="primary" variant="solid" size="md">
              {selectedIds.size} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="h-7 text-xs text-default-600 hover:text-default-900"
            >
              Deselect All
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab !== "trash" ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBatchAction("star")}
                  isLoading={batchActionLoading}
                  startContent={<Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />}
                  className="h-8 text-xs"
                >
                  Star All
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBatchAction("unstar")}
                  isLoading={batchActionLoading}
                  startContent={<Star className="h-3.5 w-3.5 text-default-400" />}
                  className="h-8 text-xs"
                >
                  Unstar All
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBatchAction("trash")}
                  isLoading={batchActionLoading}
                  startContent={<Trash className="h-3.5 w-3.5" />}
                  className="h-8 text-xs"
                >
                  Move to Trash
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBatchAction("restore")}
                  isLoading={batchActionLoading}
                  startContent={<ArrowUpFromLine className="h-3.5 w-3.5 text-success" />}
                  className="h-8 text-xs"
                >
                  Restore Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBatchDeleteModalOpen(true)}
                  isLoading={batchActionLoading}
                  startContent={<X className="h-3.5 w-3.5" />}
                  className="h-8 text-xs"
                >
                  Delete Permanently
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <Separator className="my-3" />

      {/* Files Table */}
      {filteredFiles.length === 0 ? (
        <FileEmptyState activeTab={activeTab} />
      ) : (
        <Card className="border border-default-200 bg-default-50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table
              aria-label="Files table"
              isStriped
              color="default"
              selectionMode="none"
              classNames={{
                base: "min-w-full",
                th: "bg-default-100 text-default-800 font-medium text-sm",
                td: "py-3",
              }}
            >
              <TableHeader>
                <TableRow>
                  {/* Multi-select Header Checkbox */}
                  <TableColumn width={40}>
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="p-1 rounded hover:bg-default-200/70 text-default-600 cursor-pointer"
                      title={isAllSelected ? "Deselect All" : "Select All"}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : isSomeSelected ? (
                        <MinusSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4 text-default-400" />
                      )}
                    </button>
                  </TableColumn>
                  <TableColumn>Name</TableColumn>
                  <TableColumn className="hidden sm:table-cell">Type</TableColumn>
                  <TableColumn className="hidden md:table-cell">Size</TableColumn>
                  <TableColumn className="hidden sm:table-cell">Added</TableColumn>
                  <TableColumn width={240}>Actions</TableColumn>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => {
                  const isSelected = selectedIds.has(file.id);

                  return (
                    <TableRow
                      key={file.id}
                      className={`hover:bg-default-100 transition-colors ${
                        isSelected ? "bg-primary/5" : ""
                      } cursor-pointer`}
                      onClick={() => handleOpenPreview(file)}
                    >
                      {/* Row Checkbox */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleSelectRow(file.id)}
                          className="p-1 rounded hover:bg-default-200/70 text-default-600 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 text-default-400 hover:text-default-600" />
                          )}
                        </button>
                      </TableCell>

                      {/* File Name & Preview indicator */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <FileIcon file={file} />
                          <div>
                            <div className="font-medium flex items-center gap-2 text-default-800">
                              <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-[300px]">
                                {file.name}
                              </span>
                              {file.isStarred && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Star
                                      className="h-4 w-4 text-yellow-400"
                                      fill="currentColor"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>Starred</TooltipContent>
                                </Tooltip>
                              )}
                              {file.isFolder && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Folder className="h-3 w-3 text-default-400" />
                                  </TooltipTrigger>
                                  <TooltipContent>Folder</TooltipContent>
                                </Tooltip>
                              )}
                              {!file.isFolder && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Eye className="h-3 w-3 text-default-400 hover:text-primary" />
                                  </TooltipTrigger>
                                  <TooltipContent>Click to Preview</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <div className="text-xs text-default-500 sm:hidden">
                              {formatDistanceToNow(new Date(file.createdAt), {
                                addSuffix: true,
                              })}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Type Column */}
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-xs text-default-500">
                          {file.isFolder ? "Folder" : file.type.split("/")[1] || file.type}
                        </div>
                      </TableCell>

                      {/* Size Column */}
                      <TableCell className="hidden md:table-cell">
                        <div className="text-default-700">
                          {file.isFolder
                            ? "-"
                            : file.size < 1024
                            ? `${file.size} B`
                            : file.size < 1024 * 1024
                            ? `${(file.size / 1024).toFixed(1)} KB`
                            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                        </div>
                      </TableCell>

                      {/* Added Column */}
                      <TableCell className="hidden sm:table-cell">
                        <div>
                          <div className="text-default-700">
                            {formatDistanceToNow(new Date(file.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                          <div className="text-xs text-default-500 mt-0.5">
                            {format(new Date(file.createdAt), "MMM d, yyyy")}
                          </div>
                        </div>
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <FileActions
                          file={file}
                          onStar={handleStarFile}
                          onTrash={handleTrashFile}
                          onDelete={(file) => {
                            setSelectedFile(file);
                            setDeleteModalOpen(true);
                          }}
                          onDownload={handleDownloadFile}
                          onPreview={handleOpenPreview}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* In-App File Preview Modal */}
      <FilePreviewModal
        isOpen={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        file={previewFile}
        onDownload={handleDownloadFile}
        onNext={handleNextPreview}
        onPrev={handlePrevPreview}
        hasNext={currentPreviewIndex < previewableFiles.length - 1}
        hasPrev={currentPreviewIndex > 0}
      />

      {/* Batch Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={batchDeleteModalOpen}
        onOpenChange={setBatchDeleteModalOpen}
        title="Confirm Permanent Deletion"
        description={`Are you sure you want to permanently delete ${selectedIds.size} selected item(s)?`}
        icon={X}
        iconColor="text-danger"
        confirmText="Delete Permanently"
        confirmColor="danger"
        onConfirm={() => handleBatchAction("delete")}
        isDangerous={true}
        warningMessage={`You are about to permanently delete ${selectedIds.size} files. They will be permanently removed from your account and storage, and cannot be recovered.`}
      />

      {/* Single file delete confirmation modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirm Permanent Deletion"
        description="Are you sure you want to permanently delete this file?"
        icon={X}
        iconColor="text-danger"
        confirmText="Delete Permanently"
        confirmColor="danger"
        onConfirm={() => {
          if (selectedFile) {
            handleDeleteFile(selectedFile.id);
          }
        }}
        isDangerous={true}
        warningMessage={`You are about to permanently delete "${selectedFile?.name}". This file will be permanently removed from your account and cannot be recovered.`}
      />

      {/* Empty trash confirmation modal */}
      <ConfirmationModal
        isOpen={emptyTrashModalOpen}
        onOpenChange={setEmptyTrashModalOpen}
        title="Empty Trash"
        description="Are you sure you want to empty the trash?"
        icon={Trash}
        iconColor="text-danger"
        confirmText="Empty Trash"
        confirmColor="danger"
        onConfirm={handleEmptyTrash}
        isDangerous={true}
        warningMessage={`You are about to permanently delete all ${trashCount} items in your trash. These files will be permanently removed from your account and cannot be recovered.`}
      />
    </div>
  );
}
