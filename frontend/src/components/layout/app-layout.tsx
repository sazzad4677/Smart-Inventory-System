import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { auth } from "@/auth";
import { User as UserType } from "@/lib/types";

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex h-full min-h-full font-sans text-slate-100">
      <Sidebar aria-label="Sidebar navigation" user={user as UserType | null} />
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        <Navbar />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
