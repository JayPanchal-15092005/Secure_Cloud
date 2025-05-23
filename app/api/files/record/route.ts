import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      name,
      path,
      size,
      type,
      fileUrl,
      thumbnailUrl,
      parentId,
    } = body;

    if (!name || !path || !size || !type || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate parent folder if provided
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

    const newFile = {
      name,
      path,
      size,
      type,
      fileUrl,
      thumbnailUrl: thumbnailUrl || null,
      userId,
      parentId: parentId || null,
      isFolder: false,
      isStarred: false,
      isTrash: false,
    };

    const [created] = await db.insert(files).values(newFile).returning();

    return NextResponse.json(created, { status: 200 });
  } catch (error) {
    console.error("Error recording file:", error);
    return NextResponse.json(
      { error: "Failed to record file" },
      { status: 500 }
    );
  }
}
