import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { files } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import ImageKit from "imagekit";

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

    const body = await request.json();
    const { action, fileIds } = body;

    if (!action || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid action or empty fileIds list" },
        { status: 400 }
      );
    }

    // Verify ownership and get files
    const userFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), inArray(files.id, fileIds)));

    if (userFiles.length === 0) {
      return NextResponse.json({ error: "No matching files found" }, { status: 404 });
    }

    const matchedIds = userFiles.map((f) => f.id);

    switch (action) {
      case "star": {
        await db
          .update(files)
          .set({ isStarred: true })
          .where(and(eq(files.userId, userId), inArray(files.id, matchedIds)));
        return NextResponse.json({
          success: true,
          count: matchedIds.length,
          message: `${matchedIds.length} item(s) starred`,
        });
      }

      case "unstar": {
        await db
          .update(files)
          .set({ isStarred: false })
          .where(and(eq(files.userId, userId), inArray(files.id, matchedIds)));
        return NextResponse.json({
          success: true,
          count: matchedIds.length,
          message: `${matchedIds.length} item(s) unstarred`,
        });
      }

      case "trash": {
        await db
          .update(files)
          .set({ isTrash: true })
          .where(and(eq(files.userId, userId), inArray(files.id, matchedIds)));
        return NextResponse.json({
          success: true,
          count: matchedIds.length,
          message: `${matchedIds.length} item(s) moved to trash`,
        });
      }

      case "restore": {
        await db
          .update(files)
          .set({ isTrash: false })
          .where(and(eq(files.userId, userId), inArray(files.id, matchedIds)));
        return NextResponse.json({
          success: true,
          count: matchedIds.length,
          message: `${matchedIds.length} item(s) restored`,
        });
      }

      case "delete": {
        // Permanently delete non-folders from ImageKit in parallel
        await Promise.allSettled(
          userFiles
            .filter((f) => !f.isFolder)
            .map(async (file) => {
              try {
                let imagekitFileId = null;
                if (file.fileUrl) {
                  const urlWithoutQuery = file.fileUrl.split("?")[0];
                  imagekitFileId = urlWithoutQuery.split("/").pop();
                }
                if (!imagekitFileId && file.path) {
                  imagekitFileId = file.path.split("/").pop();
                }
                if (imagekitFileId) {
                  const searchResults = await imagekit.listFiles({
                    name: imagekitFileId,
                    limit: 1,
                  });
                  if (
                    searchResults &&
                    searchResults.length > 0 &&
                    "fileId" in searchResults[0]
                  ) {
                    await imagekit.deleteFile(searchResults[0].fileId);
                  } else {
                    await imagekit.deleteFile(imagekitFileId);
                  }
                }
              } catch (e) {
                console.error("ImageKit file deletion error:", e);
              }
            })
        );

        // Delete from DB
        await db
          .delete(files)
          .where(and(eq(files.userId, userId), inArray(files.id, matchedIds)));

        return NextResponse.json({
          success: true,
          count: matchedIds.length,
          message: `${matchedIds.length} item(s) permanently deleted`,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unsupported batch action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error performing batch file operation:", error);
    return NextResponse.json(
      { error: "Failed to perform batch file operation" },
      { status: 500 }
    );
  }
}
