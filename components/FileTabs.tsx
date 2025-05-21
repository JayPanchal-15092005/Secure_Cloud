"use client";

import { File, Star, Trash } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Badge from "@/components/ui/Badge";
import type { File as FileType } from "@/lib/db/schema";

interface FileTabsProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  files: FileType[];
  starredCount: number;
  trashCount: number;
}

export default function FileTabs({
  activeTab,
  onTabChange,
  files,
  starredCount,
  trashCount,
}: FileTabsProps) {
  const allCount = files.filter((f) => !f.isTrash).length;

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="w-full overflow-x-auto"
    >
      <TabsList className="gap-2 sm:gap-4 md:gap-6 flex-nowrap min-w-full">
        <TabsTrigger value="all" className="py-3 whitespace-nowrap">
          <div className="flex items-center gap-2 sm:gap-3">
            <File className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium">All Files</span>
            <Badge
              variant="flat"
              color="default"
              size="sm"
              aria-label={`${allCount} files`}
            >
              {allCount}
            </Badge>
          </div>
        </TabsTrigger>

        <TabsTrigger value="starred" className="py-3 whitespace-nowrap">
          <div className="flex items-center gap-2 sm:gap-3">
            <Star className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium">Starred</span>
            <Badge
              variant="flat"
              color="warning"
              size="sm"
              aria-label={`${starredCount} starred files`}
            >
              {starredCount}
            </Badge>
          </div>
        </TabsTrigger>

        <TabsTrigger value="trash" className="py-3 whitespace-nowrap">
          <div className="flex items-center gap-2 sm:gap-3">
            <Trash className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium">Trash</span>
            <Badge
              variant="solid"
              color="danger"
              size="sm"
              aria-label={`${trashCount} files in trash`}
            >
              {trashCount}
            </Badge>
          </div>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
