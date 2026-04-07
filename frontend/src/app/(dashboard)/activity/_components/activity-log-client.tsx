"use client";

import { Activity, PaginationMeta } from "@/lib/types";
import { FilterBar, FilterField } from "@/components/shared/filter-bar";
import { DataTable, Column } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { User, Clock, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
      key: "searchTerm",
      label: "Action Search",
      type: "search",
      placeholder: "Search actions...",
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
      key: "startDate",
      label: "Start Date",
      type: "date",
    },
    {
      key: "endDate",
      label: "End Date",
      type: "date",
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
      header: "Action",
      accessorKey: "action_text",
      cell: (activity) => (
        <span className="text-slate-300 leading-relaxed max-w-md block">
          {activity.action_text}
        </span>
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
          <Shield className="mr-1 h-3 w-3" />
          {activity.user_id?.role || "User"}
        </Badge>
      ),
    },
    {
      header: "Timestamp",
      cell: (activity) => {
        const date = new Date(activity.createdAt || activity.timestamp);
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
