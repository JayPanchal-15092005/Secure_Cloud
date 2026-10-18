"use client";

import { useEffect, useCallback, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileUp, FileText, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploadForm from "./FileUploadForm";
import FileList from "./FileList";
import { useRouter, useSearchParams } from "next/navigation";
import UserProfile from "./UserProfile";

interface DashboardContentProps {
  userId: string;
  userName: string;
  initialTab?: string;
}

export default function DashboardContent({
  userId,
  userName,
  initialTab = "files",
}: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<string>(
    urlTab === "profile" || initialTab === "profile" ? "profile" : "files"
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  // Sync state when URL searchParams changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "profile") {
      setActiveTab("profile");
    } else if (tabParam === "files" || !tabParam) {
      setActiveTab("files");
    }
  }, [searchParams]);

  // Listen to custom tab change events from Navbar
  useEffect(() => {
    const handleTabEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === "profile" || customEvent.detail === "files") {
        setActiveTab(customEvent.detail);
      }
    };

    window.addEventListener("dashboard-tab-change", handleTabEvent);
    return () => {
      window.removeEventListener("dashboard-tab-change", handleTabEvent);
    };
  }, []);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    router.replace(`/dashboard?tab=${val}`, { scroll: false });
  };

  const handleFileUploadSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleFolderChange = useCallback((folderId: string | null) => {
    setCurrentFolder(folderId);
  }, []);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          Hi,{" "}
          <span className="text-primary">
            {userName?.length > 10
              ? `${userName?.substring(0, 10)}...`
              : userName?.split(" ")[0] || "there"}
          </span>
          !
        </h2>
        <p className="text-muted-foreground mt-2 text-base sm:text-lg">
          {activeTab === "profile"
            ? "Manage your personal profile and account settings."
            : "Your files are securely stored and ready for you."}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* Tabs Header with both My Files and Profile */}
        <TabsList className="gap-2 border-b border-border bg-transparent p-0 h-auto overflow-x-auto no-scrollbar w-full justify-start rounded-none">
          <TabsTrigger
            value="files"
            className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary font-medium transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>My Files</span>
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="profile"
            className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary font-medium transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Files */}
        <TabsContent value="files" className="pt-6">
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
            {/* Upload */}
            <div className="w-full">
              <Card className="border border-border bg-card shadow-xs hover:shadow-sm transition-shadow w-full">
                <CardHeader className="flex items-center gap-3">
                  <FileUp className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Upload</h2>
                </CardHeader>
                <CardContent>
                  <FileUploadForm
                    userId={userId}
                    onUploadSuccess={handleFileUploadSuccess}
                    currentFolder={currentFolder}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Files List */}
            <div className="w-full lg:col-span-2">
              <Card className="border border-border bg-card shadow-xs hover:shadow-sm transition-shadow w-full">
                <CardHeader className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Your Files</h2>
                </CardHeader>
                <CardContent>
                  <FileList
                    userId={userId}
                    refreshTrigger={refreshTrigger}
                    onFolderChange={handleFolderChange}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Profile */}
        <TabsContent value="profile" className="pt-6">
          <div className="max-w-2xl mx-auto">
            <UserProfile />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
