"use client";

import { User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationBell from "./notification-bell";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { logoutAction } from "@/actions/auth.actions";

export function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;

  const logout = async () => {
    try {
      const result = await logoutAction();

      if (!result.success) {
        toast.error(result.error || "Logout failed. Please try again.");
      }
    } catch {
      toast.error("Logout failed. Please check your connection and try again.");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-white/5 bg-slate-950/40 backdrop-blur-md px-4 sm:px-6">
      <div className="flex flex-1 items-center gap-4"></div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 hover:bg-white/5 text-slate-400 hover:text-white ring-offset-slate-950 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-xl"
              />
            }
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400">
              <User className="h-5 w-5" />
            </div>
            <div className="hidden flex-col items-start text-sm md:flex">
              <span className="font-semibold leading-none text-white text-left">
                {user?.role || "Guest"}
              </span>
              <span className="text-xs text-slate-500">
                {user?.email || "guest@example.com"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-slate-900 border-white/10 text-slate-300 rounded-xl"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-slate-500 font-medium">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem className="focus:bg-indigo-600 focus:text-white rounded-lg mx-1 cursor-pointer">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-indigo-600 focus:text-white rounded-lg mx-1 cursor-pointer">
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              onClick={logout}
              className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 rounded-lg mx-1 cursor-pointer"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
