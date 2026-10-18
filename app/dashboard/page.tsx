import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";
import { CloudUpload } from "lucide-react";
import Navbar from "@/components/Navbar";
import FileLoadingState from "@/components/FileLoadingState";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function Dashboard(props: DashboardPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const searchParams = await props.searchParams;
  const initialTab = searchParams?.tab === "profile" ? "profile" : "files";

  const userId = session.user.id!;
  const userName = session.user.name || session.user.email?.split("@")[0] || "";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 pt-28 pb-12">
        <Suspense fallback={<FileLoadingState />}>
          <DashboardContent
            userId={userId}
            userName={userName}
            initialTab={initialTab}
          />
        </Suspense>
      </main>

      <footer className="bg-card border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <CloudUpload className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold">Cloud Storage</h2>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} Cloud Storage. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
