"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Settings,
  Menu,
  X,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Activity", href: "/activity", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b border-white/5 px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-bold text-xl tracking-tight text-white hover:opacity-90 transition-opacity"
            >
              <div className="h-8 w-8 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white">
                <Package className="h-5 w-5" />
              </div>
              <span>SmartInv</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "h-4 relative z-10 w-4 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-slate-500 group-hover:text-indigo-400",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/5 p-4 mt-auto">
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group",
                pathname === "/settings"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Settings
                className={cn(
                  "h-4 relative z-10 w-4 transition-colors",
                  pathname === "/settings"
                    ? "text-white"
                    : "text-slate-500 group-hover:text-indigo-400",
                )}
              />
              Settings
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
