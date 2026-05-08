import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";
import { CloudUpload } from "lucide-react";
import Navbar from "@/components/Navbar";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userId = session.user.id!;
  const userName = session.user.name || session.user.email?.split("@")[0] || "";

  return (
    <div className="min-h-screen flex flex-col bg-default-50">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 pt-28 pb-8">
        <DashboardContent
          userId={userId}
          userName={userName}
        />
      </main>

      <footer className="bg-default-50 border-t border-default-200 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <CloudUpload className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Cloud Storage</h2>{" "}
            </div>
            <p className="text-default-500 text-sm">
              &copy; {new Date().getFullYear()} Cloud Storage 
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
