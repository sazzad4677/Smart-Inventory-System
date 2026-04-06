"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppSelect } from "./app-select";
import { AppCombobox } from "./app-combobox";
import { cn } from "@/lib/utils";

export type FormInputFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "select"
  | "combobox"
  | "textarea";

interface FormInputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  type: FormInputFieldType;
  placeholder?: string;
  icon?: LucideIcon;
  options?: { label: string; value: string; disabled?: boolean }[];
  className?: string;
  inputClassName?: string;
  extraContent?: ReactNode;
  showError?: boolean;
  onSearchValueChange?: (value: string) => void;
  isLoading?: boolean;
}

export function FormInputField<T extends FieldValues>({
  control,
  name,
  label,
  type,
  placeholder,
  icon: Icon,
  options,
  className,
  inputClassName,
  extraContent,
  showError = true,
  onSearchValueChange,
  isLoading,
}: FormInputFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-1.5", className)}>
          {label && (
            <FormLabel className="text-sm font-medium text-slate-300">
              {label}
            </FormLabel>
          )}
          <FormControl>
            {(() => {
              switch (type) {
                case "textarea":
                  return (
                    <Textarea
                      placeholder={placeholder}
                      className={cn(
                        "bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all min-h-[100px]",
                        inputClassName,
                      )}
                      {...field}
                    />
                  );
                case "select":
                  return (
                    <AppSelect
                      options={options || []}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={placeholder}
                      triggerClassName={cn("w-full", inputClassName)}
                    />
                  );
                case "combobox":
                  return (
                    <AppCombobox
                      options={options || []}
                      value={field.value}
                      onValueChange={(val: string) => {
                        field.onChange(val);
                      }}
                      onSearchValueChange={onSearchValueChange}
                      isLoading={isLoading}
                      placeholder={placeholder}
                      className={inputClassName}
                    />
                  );
                default:
                  return (
                    <div className="relative group">
                      {Icon && (
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                      )}
                      <Input
                        type={type}
                        placeholder={placeholder}
                        className={cn(Icon && "pl-10", inputClassName)}
                        {...field}
                      />
                    </div>
                  );
              }
            })()}
          </FormControl>
          {extraContent}
          {showError && <FormMessage className="text-xs text-rose-400" />}
        </FormItem>
      )}
    />
  );
}
