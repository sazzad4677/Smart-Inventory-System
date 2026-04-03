import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-full font-sans text-slate-100">
      <Sidebar aria-label="Sidebar navigation" />
      <div className="flex flex-1 flex-col md:pl-64">
        <Navbar aria-label="Top navigation" />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
