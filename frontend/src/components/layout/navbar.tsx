"use client";

import { Search, Bell, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user: {
    email: string;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.refresh();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-white/5 bg-slate-950/40 backdrop-blur-md px-4 sm:px-6">
      <div className="flex flex-1 items-center gap-4"></div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-white/5 text-slate-400 hover:text-white rounded-xl"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
          <span className="sr-only">Notifications</span>
        </Button>

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
              <span className="font-semibold leading-none text-white">
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
              onClick={handleLogout}
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
