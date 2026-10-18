import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";

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
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed for avatar" },
        { status: 400 }
      );
    }

    // Limit avatar size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Avatar image must be smaller than 5MB" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    const ext = file.name.split(".").pop() || "jpg";
    const uniqueFilename = `avatar_${uuidv4()}.${ext}`;

    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: uniqueFilename,
      folder: `/droply/${userId}/avatar`,
      useUniqueFileName: false,
    });

    const avatarUrl = uploadResponse.url;

    // Update user in database
    await db
      .update(users)
      .set({ image: avatarUrl })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      image: avatarUrl,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clear user avatar in database
    await db
      .update(users)
      .set({ image: null })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      image: null,
    });
  } catch (error) {
    console.error("Error removing avatar:", error);
    return NextResponse.json(
      { error: "Failed to remove avatar" },
      { status: 500 }
    );
  }
}
