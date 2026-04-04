"use client";

import { useForm, FieldValues, DefaultValues, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { AppSelect } from "./app-select";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "select"
  | "textarea";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  icon?: LucideIcon;
  options?: { label: string; value: string }[];
}

export interface DynamicFormProps<T extends FieldValues> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<T, any, any>;
  defaultValues: DefaultValues<T>;
  fields: FieldConfig[];
  onSubmit: (data: T) => void | Promise<void>;
  submitText: string;
  isPending: boolean;
}

export function DynamicForm<T extends FieldValues>({
  schema,
  defaultValues,
  fields,
  onSubmit,
  submitText,
  isPending,
}: DynamicFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as Path<T>}
            render={({ field: formField }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium text-slate-300">
                  {field.label}
                </FormLabel>
                <FormControl>
                  {(() => {
                    const Icon = field.icon;
                    switch (field.type) {
                      case "textarea":
                        return (
                          <Textarea
                            placeholder={field.placeholder}
                            className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all min-h-[100px]"
                            {...formField}
                          />
                        );
                      case "select":
                        return (
                          <AppSelect
                            options={field.options || []}
                            value={formField.value}
                            onValueChange={formField.onChange}
                            placeholder={field.placeholder}
                            triggerClassName="w-full"
                          />
                        );
                      default:
                        return (
                          <div className="relative">
                            {Icon && (
                              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                            )}
                            <Input
                              type={field.type}
                              placeholder={field.placeholder}
                              className={cn(Icon && "pl-10")}
                              {...formField}
                            />
                          </div>
                        );
                    }
                  })()}
                </FormControl>
                <FormMessage className="text-xs text-rose-400" />
              </FormItem>
            )}
          />
        ))}
        <Button
          type="submit"
          variant="default"
          size="dashboard"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
          disabled={isPending}
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            submitText
          )}
        </Button>
      </form>
    </Form>
  );
}
