"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface AppSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface AppSelectProps {
  options: AppSelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function AppSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  triggerClassName,
  disabled,
}: AppSelectProps) {
  const handleValueChange = (val: string | null) => {
    if (onValueChange && val !== null) {
      onValueChange(val);
    }
  };

  const currentVal = value ?? defaultValue;
  const selectedOption = options.find((opt) => opt.value === currentVal);

  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        size="dashboard"
        className={cn(
          "bg-slate-900/50 border-white/10 text-white flex-1 sm:flex-none min-w-[160px]",
          triggerClassName,
        )}
      >
        <SelectValue placeholder={placeholder}>
          {selectedOption?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-slate-950 border-white/10 text-white dark min-w-[200px]">
        {options.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-500 text-white/50">
            No options available
          </div>
        ) : (
          options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              className="focus:bg-indigo-500/20 focus:text-indigo-400 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {opt.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
