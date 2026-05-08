"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { CloudUpload, ChevronDown, User, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ui/ThemeToggle";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const router = useRouter();
  const pathName = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isOnDashboard =
    pathName === "/dashboard" || pathName?.startsWith("/dashboard/");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-menu-button="true"]')) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const user = session?.user;
  const userDetails = {
    fullName: user?.name || user?.email?.split("@")[0] || "",
    initials: (user?.name || user?.email || "U")
      .trim()
      .split(" ")
      .map((n) => n?.[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U",
    displayName: user?.name || user?.email?.split("@")[0] || "User",
    email: user?.email || "",
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={`bg-default-50 border-b border-default-200 fixed top-0 w-full z-50 transition-shadow h-20${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="container mx-auto py-3 md:py-4 px-4 md:px-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 z-10">
            <CloudUpload className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Cloud Storage</h1>
          </Link>

          <div className="hidden md:flex gap-4 items-center">
            <ThemeToggle />
            {!isLoggedIn && (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" color="primary">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="ghost" color="primary">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {isLoggedIn && (
              <div className="flex items-center gap-4">
                {!isOnDashboard && (
                  <Link href="/dashboard">
                    <Button variant="secondary" color="primary">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="p-0 bg-transparent min-w-0"
                      endContent={<ChevronDown className="h-4 w-4 ml-2" />}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={userDetails.initials}
                          size="sm"
                          className="h-8 w-8 flex-shrink-0"
                          fallback={<User className="h-4 w-4" />}
                        />
                        <span className="text-default-600 hidden sm:inline">
                          {userDetails.displayName}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent aria-label="User actions">
                    <DropdownMenuItem
                      key="profile"
                      description={userDetails.email || "View your profile"}
                      onClick={() => router.push("/dashboard?tab=profile")}
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      key="files"
                      description="Manage your files"
                      onClick={() => router.push("/dashboard")}
                    >
                      My Files
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      key="logout"
                      description="Sign out of your account"
                      className="text-danger"
                      color="danger"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {isLoggedIn && (
              <Avatar
                name={userDetails.initials}
                size="sm"
                className="h-8 w-8 flex-shrink-0"
                fallback={<User className="h-4 w-4" />}
              />
            )}
            <button
              className="z-50 p-2"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              data-menu-button="true"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-default-700" />
              ) : (
                <Menu className="h-6 w-6 text-default-700" />
              )}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
          )}

          <div
            ref={mobileMenuRef}
            className={`fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-default-50 z-40 flex flex-col pt-20 px-6 shadow-xl transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            } md:hidden`}
          >
            {!isLoggedIn && (
              <div className="flex flex-col gap-4 items-center">
                <Link
                  href="/sign-in"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="ghost" color="primary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/sign-up"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="default" color="primary" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {isLoggedIn && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3 py-4 border-b border-default-200">
                  <Avatar
                    name={userDetails.initials}
                    size="md"
                    className="h-10 w-10 flex-shrink-0"
                    fallback={<User className="h-5 w-5" />}
                  />
                  <div>
                    <p className="font-medium">{userDetails.displayName}</p>
                    <p className="text-sm text-default-500">
                      {userDetails.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {!isOnDashboard && (
                    <Link
                      href="/dashboard"
                      className="py-2 px-3 hover:bg-default-100 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/dashboard?tab=profile"
                    className="py-2 px-3 hover:bg-default-100 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="py-2 px-3 text-left text-danger hover:bg-danger-50 rounded-md transition-colors mt-4"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}