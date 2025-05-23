"use client";

import { useEffect, useCallback, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileUp, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploadForm from "./FileUploadForm";
import FileList from "./FileList";
import { useSearchParams } from "next/navigation";
import UserProfile from "./UserProfile";

interface DashboardContentProps {
  userId: string;
  userName: string;
}

export default function DashboardContent({
  userId,
  userName,
}: DashboardContentProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<string>("files");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  // Set the active tab based on URL parameter
  useEffect(() => {
    if (tabParam === "profile") {
      setActiveTab("profile");
    } else {
      setActiveTab("files");
    }
  }, [tabParam]);

  const handleFileUploadSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleFolderChange = useCallback((folderId: string | null) => {
    setCurrentFolder(folderId);
  }, []);

 return (
  <>
    <div className="mb-8">
      <h2 className="text-3xl sm:text-4xl font-bold text-default-900">
        Hi,{" "}
        <span className="text-primary">
          {userName?.length > 10
            ? `${userName?.substring(0, 10)}...`
            : userName?.split(" ")[0] || "there"}
        </span>
        !
      </h2>
      <p className="text-default-600 mt-2 text-lg">
        Your files are waiting for you.
      </p>
    </div>

    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      {/* Tabs Header */}
      <TabsList className="gap-6 border-b overflow-x-auto no-scrollbar">
        <TabsTrigger
          value="files"
          className="py-3 data-[state=active]:text-primary"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span className="font-medium">My Files</span>
          </div>
        </TabsTrigger>
        {/* Add more tabs as needed */}
      </TabsList>

      {/* Tab: Files */}
      <TabsContent value="files" className="pt-6">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Upload */}
          <div className="w-full">
            <Card className="border border-default-200 bg-default-50 shadow-sm hover:shadow-md transition-shadow w-full">
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
            <Card className="border border-default-200 bg-default-50 shadow-sm hover:shadow-md transition-shadow w-full">
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
        <div className="mt-8">
          <UserProfile />
        </div>
      </TabsContent>
    </Tabs>
  </>
);

}
