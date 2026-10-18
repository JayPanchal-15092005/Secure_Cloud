"use client";

import { useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "./ui/card";
import { Spinner } from "./ui/spinner";
import { Avatar } from "./ui/avatar";
import { Separator } from "./ui/separator";
import Badge from "./ui/Badge";
import { useRouter } from "next/navigation";
import {
  Mail,
  User,
  LogOut,
  Shield,
  ArrowRight,
  Camera,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function UserProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <Spinner size="large" />
        <p className="mt-4 text-muted-foreground text-sm">Loading your profile...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <Card className="max-w-md mx-auto border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex gap-3">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">User Profile</h2>
        </CardHeader>
        <Separator />
        <CardContent className="text-center py-10">
          <div className="mb-6">
            <Avatar name="Guest" size="lg" className="mx-auto mb-4" />
            <p className="text-lg font-medium">Not Signed In</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Please sign in to access your profile
            </p>
          </div>
          <Button
            variant="default"
            color="primary"
            size="lg"
            onClick={() => router.push("/sign-in")}
            className="px-8"
            endContent={<ArrowRight className="h-4 w-4" />}
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  const user = session.user;
  const email = user?.email || "";
  const name = user?.name || email.split("@")[0] || "";
  const avatarUrl = user?.image || null;
  const initials = name
    .trim()
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File Type", {
        description: "Please select an image file (PNG, JPG, WebP).",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File Too Large", {
        description: "Avatar image must be smaller than 5 MB.",
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newImageUrl = res.data.image;

      // Update NextAuth session so Navbar and Profile re-render with new avatar
      await update({ image: newImageUrl });

      toast.success("Profile Photo Updated", {
        description: "Your new profile picture has been saved successfully.",
      });
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      toast.error("Upload Failed", {
        description:
          err?.response?.data?.error || "Could not upload profile picture.",
      });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;

    setRemovingAvatar(true);

    try {
      await axios.delete("/api/user/avatar");

      // Update NextAuth session
      await update({ image: null });

      toast.success("Profile Photo Removed", {
        description: "Your avatar has been reset to default initials.",
      });
    } catch (err) {
      console.error("Failed to remove avatar:", err);
      toast.error("Error", {
        description: "Failed to remove avatar. Please try again.",
      });
    } finally {
      setRemovingAvatar(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex gap-3">
        <User className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">User Profile</h2>
      </CardHeader>
      <Separator />
      <CardContent className="py-6">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarFileChange}
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
        />

        <div className="flex flex-col items-center text-center mb-6">
          {/* Avatar Container with Hover Overlay */}
          <div className="relative group mb-3">
            <Avatar
              src={avatarUrl || undefined}
              name={initials || "U"}
              size="lg"
              className="h-28 w-28 text-2xl border-2 border-primary/20 shadow-md ring-4 ring-primary/5"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50"
              title="Change Profile Picture"
            >
              {uploadingAvatar ? (
                <Spinner size="small" />
              ) : (
                <>
                  <Camera className="h-6 w-6 mb-1" />
                  <span className="text-[11px] font-medium">Change</span>
                </>
              )}
            </button>
          </div>

          {/* Avatar action buttons */}
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              isLoading={uploadingAvatar}
              startContent={<Camera className="h-3.5 w-3.5" />}
              className="h-7 text-xs"
            >
              {avatarUrl ? "Change Photo" : "Upload Photo"}
            </Button>

            {avatarUrl && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemoveAvatar}
                isLoading={removingAvatar}
                startContent={<Trash2 className="h-3.5 w-3.5 text-destructive" />}
                className="h-7 text-xs text-destructive hover:bg-destructive/10"
              >
                Remove
              </Button>
            )}
          </div>

          <h3 className="text-xl font-semibold text-foreground">{name}</h3>
          {email && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span>{email}</span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary/70" />
              <span className="font-medium text-sm">Account Status</span>
            </div>
            <Badge
              color="success"
              variant="flat"
              aria-label="Account status: Active"
            >
              Active
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary/70" />
              <span className="font-medium text-sm">Storage Provider</span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              ImageKit & Neon DB
            </span>
          </div>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-between">
        <Button
          variant="destructive"
          color="danger"
          startContent={<LogOut className="h-4 w-4" />}
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
}
