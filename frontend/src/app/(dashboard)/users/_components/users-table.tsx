"use client";

import React, { useMemo } from "react";
import { Shield, LogOut, RefreshCw, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DataTable, Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { User } from "@/lib/types";
import { FilterBar, FilterField } from "@/components/shared/filter-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface UserWithSessions {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  activeSessionCount: number;
  lastActivity?: string;
}

interface UsersTableProps {
  users: UserWithSessions[];
  isLoading: boolean;
  onRevoke: (userId: string, email: string) => void;
  currentUser: User | null;
  isPending: boolean;
  fetchUsers: (showLoading?: boolean) => Promise<void>;
  filters: FilterField[];
}

export function UsersTable({
  users,
  isLoading,
  onRevoke,
  currentUser,
  isPending,
  fetchUsers,
  filters,
}: UsersTableProps) {
  const searchParams = useSearchParams();

  // Derived filtered users list
  const filteredUsers = useMemo(() => {
    const search = searchParams.get("search")?.toLowerCase() || "";
    const role = searchParams.get("role") || "all";

    return users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search);

      const matchesRole = role === "all" || user.role === role;

      return matchesSearch && matchesRole;
    });
  }, [users, searchParams]);

  // Table columns definition
  const columns: Column<UserWithSessions>[] = useMemo(
    () => [
      {
        header: "User Info",
        cell: (u) => {
          const isSelf = u.id === currentUser?.id;
          return (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 shadow-inner">
                {u.email[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  {u.email}
                  {isSelf && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 font-bold tracking-wider">
                      YOU
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full border border-white/5">
                    <Shield className="h-2.5 w-2.5" />
                    {u.role}
                  </span>
                  {u.activeSessionCount > 0 && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                      <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        header: "Status",
        className: "text-center",
        cell: (u) => {
          const isActive = u.activeSessionCount > 0;
          return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
              {isActive ? (
                <span className="text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10 shadow-[0_0_10px_-5px_rgba(16,185,129,0.3)]">
                  Active
                </span>
              ) : (
                <span className="text-slate-500 bg-slate-500/5 px-2.5 py-1 rounded-full border border-white/5">
                  Inactive
                </span>
              )}
            </div>
          );
        },
      },
      {
        header: "Sessions",
        className: "text-center",
        cell: (u) => (
          <span
            className={cn(
              "px-2.5 py-1 rounded-lg text-sm font-bold border transition-all",
              u.activeSessionCount > 0
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_-5px_rgba(99,102,241,0.3)]"
                : "bg-slate-800/50 text-slate-500 border-white/5",
            )}
          >
            {u.activeSessionCount}
          </span>
        ),
      },
      {
        header: "Last Active",
        cell: (u) =>
          u.lastActivity ? (
            <div>
              <p className="text-xs text-slate-300 font-medium">
                {new Date(u.lastActivity).toLocaleString([], {
                  dateStyle: "medium",
                })}
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                {new Date(u.lastActivity).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ) : (
            <span className="text-xs text-slate-600 italic">Never</span>
          ),
      },
      {
        header: "Actions",
        className: "text-right",
        cell: (u) => {
          const isActive = u.activeSessionCount > 0;
          const isSelf = u.id === currentUser?.id;
          if (!isActive || isSelf) return null;

          return (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all rounded-xl"
              onClick={() => onRevoke(u.id, u.email)}
              disabled={isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Revoke
            </Button>
          );
        },
      },
    ],
    [currentUser, isPending, onRevoke],
  );

  if (isLoading) {
    return (
      <TableSkeleton
        cols={5}
        rows={6}
        className="border-none bg-transparent shadow-none"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <FilterBar filters={filters} className="flex-1" />
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchUsers()}
          disabled={isLoading}
          className="border-white/10 bg-slate-900/50 text-slate-400 hover:text-white h-11 w-11 rounded-xl mb-[2px]"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Registered Users
          </CardTitle>
          <CardDescription>
            {users.length} total users in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredUsers}
            columns={columns}
            className="border-none bg-transparent shadow-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}
