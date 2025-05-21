"use client";

import { Folder, FileText, FileVideo2, FileImage, File } from "lucide-react";
import { IKImage } from "imagekitio-next";
import type { File as FileType } from "@/lib/db/schema";

interface FileIconProps {
  file: FileType;
}

export default function FileIcon({ file }: FileIconProps) {
  if (file.isFolder) return <Folder className="h-5 w-5 text-blue-500" />;

  const fileType = file.type.split("/")[0];
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

  switch (fileType) {
    case "image":
      return (
        <div className="h-12 w-12 relative overflow-hidden rounded">
          <IKImage
            path={file.path}
            transformation={[
              {
                height: 48,
                width: 48,
                focus: "auto",
                quality: 80,
                dpr: 2,
              },
            ]}
            loading="lazy"
            lqip={{ active: true }}
            alt={file.name}
            style={{ objectFit: "cover", height: "100%", width: "100%" }}
          />
        </div>
      );

    case "video":
      return (
        <div className="h-12 w-12 bg-purple-100 text-purple-700 rounded flex items-center justify-center">
          <FileVideo2 className="h-5 w-5" />
        </div>
      );

    case "application":
      if (fileExtension === "pdf") {
        return (
          <div className="h-12 w-12 bg-red-100 text-red-700 rounded flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        );
      }
      return (
        <div className="h-12 w-12 bg-orange-100 text-orange-700 rounded flex items-center justify-center">
          <File className="h-5 w-5" />
        </div>
      );

    default:
      return (
        <div className="h-12 w-12 bg-gray-100 text-gray-700 rounded flex items-center justify-center">
          <File className="h-5 w-5" />
        </div>
      );
  }
}
