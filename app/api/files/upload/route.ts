import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";

// Initialize ImageKit with credentials
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const formUserId = formData.get("userId") as string;
    const parentId = (formData.get("parentId") as string) || null;

    // Verify user owns the session
    if (formUserId && formUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Collect all uploaded files (supports "files" array or multiple "file" entries or single "file")
    const allFiles = [
      ...formData.getAll("files"),
      ...formData.getAll("file"),
    ].filter((item): item is File => item instanceof File && item.size > 0);

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Verify parent folder exists if provided
    if (parentId) {
      const [parentFolder] = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.id, parentId),
            eq(files.userId, userId),
            eq(files.isFolder, true)
          )
        );

      if (!parentFolder) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 }
        );
      }
    }

    const folderPath = parentId
      ? `/droply/${userId}/folders/${parentId}`
      : `/droply/${userId}`;

    const uploadedRecords = [];

    for (const file of allFiles) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isPdf = file.type === "application/pdf";

      if (!isImage && !isVideo && !isPdf) {
        continue; // Skip unsupported files
      }

      const buffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(buffer);

      const originalFilename = file.name;
      const fileExtension = originalFilename.split(".").pop() || "";
      const uniqueFilename = `${uuidv4()}.${fileExtension}`;

      const uploadResponse = await imagekit.upload({
        file: fileBuffer,
        fileName: uniqueFilename,
        folder: folderPath,
        useUniqueFileName: false,
      });

      const fileData = {
        name: originalFilename,
        path: uploadResponse.filePath,
        size: file.size,
        type: file.type,
        fileUrl: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl || null,
        userId: userId,
        parentId: parentId,
        isFolder: false,
        isStarred: false,
        isTrash: false,
      };

      const [newFile] = await db.insert(files).values(fileData).returning();
      uploadedRecords.push(newFile);
    }

    if (uploadedRecords.length === 0) {
      return NextResponse.json(
        { error: "No valid files were uploaded. Only images, videos, or PDFs are supported." },
        { status: 400 }
      );
    }

    // Return single file if only 1 uploaded (backwards compatible), or array if multiple
    if (uploadedRecords.length === 1 && allFiles.length === 1) {
      return NextResponse.json(uploadedRecords[0]);
    }

    return NextResponse.json({
      success: true,
      files: uploadedRecords,
      count: uploadedRecords.length,
    });
  } catch (error) {
    console.error("Error uploading file(s):", error);
    return NextResponse.json(
      { error: "Failed to upload file(s)" },
      { status: 500 }
    );
  }
}
