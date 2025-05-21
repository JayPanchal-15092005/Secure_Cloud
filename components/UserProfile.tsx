"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "./ui/card";
import { Spinner } from "./ui/spinner";
import { Avatar } from "./ui/avatar";
import { Separator } from "./ui/separator";
import Badge from "./ui/Badge";
import { useRouter } from "next/navigation";
import { Mail, User, LogOut, Shield, ArrowRight } from "lucide-react";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export default function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <Spinner size="large" />
        <p className="mt-4 text-default-600"> Loading your profile...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Card className="max-w-md mx-auto border border-default-200 bg-default-50 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex gap-3">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">User Profile</h2>
        </CardHeader>
        <Separator />
        <CardContent className="text-center py-10">
          <div className="mb-6">
            <Avatar name="Guest" size="lg" className="mx-auto mb-4" />
            <p className="text-lg font-medium">Not Signed In</p>
            <p className="text-default-500 mt-2">
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

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const email = user.primaryEmailAddress?.emailAddress || "";
  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  const userRole = user.publicMetadata.role as string | undefined;

  const handleSignOut = () => {
    signOut(() => {
      router.push("/");
    });
  };

  return (
    <Card className="max-w-md mx-auto border border-default-200 bg-default-50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex gap-3">
        <User className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">User Profile</h2>
      </CardHeader>
      <Separator />
      <CardContent className="py-6">
        <div className="flex flex-col items-center text-center mb-6">
          {user.imageUrl ? (
            <Avatar className="mb-4 h-24 w-24">
              <AvatarImage src={user.imageUrl} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="mb-4 h-24 w-24 text-lg">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          )}
          <h3 className="text-xl font-semibold">{fullName}</h3>
          {user.emailAddresses && user.emailAddresses.length > 0 && (
            <div className="flex items-center gap-2 mt-1 text-default-500">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
          )}
          {userRole && (
            <Badge
              color="primary"
              variant="flat"
              className="mt-3"
              aria-label={`User role: ${userRole}`}
            >
              {userRole}
            </Badge>
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary/70" />
              <span className="font-medium">Account Status</span>
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
              <Mail className="h-5 w-5 text-primary/70" />
              <span className="font-medium">Email Verification</span>
            </div>
            <Badge
              color={
                user.emailAddresses?.[0]?.verification?.status === "verified"
                  ? "success"
                  : "warning"
              }
              variant="flat"
              aria-label={`Email verification status: ${
                user.emailAddresses?.[0]?.verification?.status === "verified"
                  ? "Verified"
                  : "Pending"
              }`}
            >
              {user.emailAddresses?.[0]?.verification?.status === "verified"
                ? "Verified"
                : "Pending"}
            </Badge>
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
