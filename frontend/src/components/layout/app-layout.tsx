import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { getCurrentUser } from "@/actions/auth.actions";

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-full min-h-full font-sans text-slate-100">
      <Sidebar aria-label="Sidebar navigation" user={user} />
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        <Navbar aria-label="Top navigation" user={user} />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
