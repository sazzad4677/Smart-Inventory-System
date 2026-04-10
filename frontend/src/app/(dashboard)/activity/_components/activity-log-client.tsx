"use client";

import { Activity, PaginationMeta } from "@/lib/types";
import { FilterBar, FilterField } from "@/components/shared/filter-bar";
import { DataTable, Column } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { User, Clock, Shield, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  undoActivityAction,
  redoActivityAction,
} from "@/actions/activity.actions";
import { toast } from "sonner";

interface ActivityLogClientProps {
  activities: Activity[];
  meta: PaginationMeta;
}

export function ActivityLogClient({
  activities,
  meta,
}: ActivityLogClientProps) {
  const filters: FilterField[] = [
    {
      key: "type",
      label: "Activity Type",
      type: "select",
      options: [
        { label: "All Types", value: "all" },
        { label: "Create", value: "CREATE" },
        { label: "Update", value: "UPDATE" },
        { label: "Delete", value: "DELETE" },
        { label: "Login", value: "LOGIN" },
        { label: "Restock", value: "RESTOCK" },
      ],
    },
    {
      key: "role",
      label: "User Role",
      type: "select",
      options: [
        { label: "All Roles", value: "all" },
        { label: "Admin", value: "Admin" },
        { label: "Manager", value: "Manager" },
        { label: "User", value: "User" },
      ],
    },
    {
      key: "resource",
      label: "System Module",
      type: "select",
      options: [
        { label: "All Modules", value: "all" },
        { label: "Product", value: "PRODUCT" },
        { label: "Category", value: "CATEGORY" },
        { label: "Order", value: "ORDER" },
        { label: "User", value: "USER" },
      ],
    },
    {
      key: "limit",
      label: "Limit",
      type: "select",
      options: [
        { label: "10 per page", value: "10" },
        { label: "20 per page", value: "20" },
        { label: "50 per page", value: "50" },
      ],
    },
  ];

  const columns: Column<Activity>[] = [
    {
      header: "User",
      cell: (activity) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-slate-200">
              {activity.user_id?.email || "Unknown User"}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              ID: {activity.user_id?._id?.slice(-6) || "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Activity Type",
      cell: (activity) => (
        <Badge
          variant="outline"
          className={cn(
            "font-medium shadow-sm transition-all border-none ring-1 ring-inset",
            activity.type === "CREATE"
              ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
              : activity.type === "DELETE"
                ? "bg-rose-500/10 text-rose-400 ring-rose-500/20"
                : activity.type === "UPDATE"
                  ? "bg-sky-500/10 text-sky-400 ring-sky-500/20"
                  : activity.type === "RESTOCK"
                    ? "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                    : "bg-slate-500/10 text-slate-400 ring-slate-500/20",
          )}
        >
          {activity.type}
        </Badge>
      ),
    },
    {
      header: "Action",
      cell: (activity) => (
        <div className="flex flex-col gap-1 max-w-md">
          <span className="text-slate-200 font-medium leading-relaxed">
            {activity.action_text}
          </span>
          {activity.resource && (
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider flex items-center gap-1 uppercase">
              <Shield className="h-2.5 w-2.5" />
              {activity.resource}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Role",
      cell: (activity) => (
        <Badge
          variant="outline"
          className={cn(
            "font-medium shadow-sm transition-all border-none ring-1 ring-inset",
            activity.user_id?.role === "Admin"
              ? "bg-rose-500/10 text-rose-400 ring-rose-500/20"
              : activity.user_id?.role === "Manager"
                ? "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
          )}
        >
          {activity.user_id?.role || "User"}
        </Badge>
      ),
    },
    {
      header: "Timestamp",
      cell: (activity) => {
        const date = new Date(activity.timestamp || activity.created_at);
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="h-3 w-3 text-indigo-400/70" />
              <span className="text-xs font-medium">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(date)}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium tabular-nums ml-4.5">
              {new Intl.DateTimeFormat("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              }).format(date)}
            </span>
          </div>
        );
      },
    },
    {
      header: "Actions",
      cell: (activity) => {
        const isUndoable =
          activity.type === "DELETE" && activity.resource === "PRODUCT";

        if (!isUndoable) return null;

        const handleToggle = async () => {
          if (activity.is_undone) {
            const result = await redoActivityAction(activity._id);
            if (result.success) {
              toast.success("Action redone: Product deleted again.");
            } else {
              toast.error(result.error);
            }
          } else {
            const result = await undoActivityAction(activity._id);
            if (result.success) {
              toast.success("Action undone: Product restored successfully!");
            } else {
              toast.error(result.error);
            }
          }
        };

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className={cn(
              "flex items-center gap-2 h-8 px-2 transition-colors rounded-lg group",
              activity.is_undone
                ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                : "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10",
            )}
            title={
              activity.is_undone ? "Re-delete item" : "Restore deleted item"
            }
          >
            <RotateCcw
              className={cn(
                "h-4 w-4 transition-transform",
                activity.is_undone
                  ? "group-hover:rotate-45"
                  : "group-hover:-rotate-45",
              )}
            />
            <span className="text-xs font-medium">
              {activity.is_undone ? "Redo" : "Undo"}
            </span>
          </Button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <FilterBar filters={filters} />
      <DataTable data={activities} columns={columns} />
      <div className="mt-2">
        <Pagination meta={meta} itemLabel="activities" />
      </div>
    </div>
  );
}
