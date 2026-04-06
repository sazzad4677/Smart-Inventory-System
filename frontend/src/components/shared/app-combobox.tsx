"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

export interface AppComboboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface AppComboboxProps {
  options: AppComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  onSearchValueChange?: (value: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AppCombobox({
  options,
  value,
  onValueChange,
  onSearchValueChange,
  isLoading,
  placeholder = "Search option...",
  className,
  disabled = false,
}: AppComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = React.useMemo(() => {
    // If external search is provided, we don't filter locally
    if (onSearchValueChange) return options;
    if (!searchValue) return options;
    const lowerSearch = searchValue.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(lowerSearch),
    );
  }, [options, searchValue, onSearchValueChange]);

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    if (onSearchValueChange) {
      onSearchValueChange(val);
    }
  };

  // When opening, if we have a selected option and no search value, initialize search with label
  // This allows the user to see what's selected and edit it
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearchValue("");
      if (onSearchValueChange) onSearchValueChange("");
    }
  };

  return (
    <Combobox
      value={value}
      onValueChange={(val) => {
        if (onValueChange && typeof val === "string") {
          onValueChange(val);
          setSearchValue(""); // Clear search on selection
          if (onSearchValueChange) onSearchValueChange("");
          setOpen(false); // Close on selection
        }
      }}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <ComboboxInput
        placeholder={placeholder}
        disabled={disabled}
        value={open ? searchValue : (selectedOption?.label ?? "")}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleSearchChange(e.target.value)
        }
        className={cn(
          "bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 min-h-9",
          className,
        )}
      />
      <ComboboxContent className="bg-slate-950 border-white/10 text-white dark min-w-[200px]">
        <ComboboxList className="custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 gap-2 text-slate-500">
              <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Searching...</span>
            </div>
          ) : (
            <>
              {filteredOptions.length === 0 && (
                <ComboboxEmpty className="flex text-slate-500 py-4 justify-center">
                  No results found.
                </ComboboxEmpty>
              )}
              {filteredOptions.map((option) => (
                <ComboboxItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="focus:bg-indigo-500/20 focus:text-indigo-400 py-2 disabled:opacity-30"
                >
                  {option.label}
                </ComboboxItem>
              ))}
            </>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
