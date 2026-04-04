"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/5 bg-slate-900/20 backdrop-blur-sm overflow-hidden shadow-2xl shadow-indigo-500/5",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="hover:bg-transparent border-white/5">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    "h-14 px-6 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 border-none",
                    column.headerClassName || column.className,
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "group transition-all duration-300 border-white/5 hover:bg-white/[0.04] border-b",
                    onRowClick && "cursor-pointer",
                    rowIndex === data.length - 1 && "border-b-0",
                  )}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className={cn(
                        "px-6 py-5 text-sm text-slate-300 font-medium group-hover:text-white transition-colors border-none",
                        column.className,
                      )}
                    >
                      {column.cell
                        ? column.cell(item)
                        : column.accessorKey
                          ? (item[column.accessorKey] as ReactNode)
                          : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-slate-500 font-medium italic border-none"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
