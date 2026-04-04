"use client";

import {
  useForm,
  FieldValues,
  DefaultValues,
  Path,
  UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputField, FormInputFieldType } from "./form-input-field";

export type FieldType = FormInputFieldType | "custom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FieldConfig<T extends FieldValues = any> {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  icon?: LucideIcon;
  options?: { label: string; value: string; disabled?: boolean }[];
  render?: (form: UseFormReturn<T>) => ReactNode;
}

export interface DynamicFormProps<T extends FieldValues> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<T, any, any>;
  defaultValues: DefaultValues<T>;
  fields: FieldConfig<T>[];
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
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => {
          if (field.type === "custom") {
            return (
              <div key={field.name}>
                {field.render ? field.render(form) : null}
              </div>
            );
          }

          return (
            <FormInputField
              key={field.name}
              control={form.control}
              name={field.name as Path<T>}
              label={field.label}
              type={field.type as FormInputFieldType}
              placeholder={field.placeholder}
              icon={field.icon}
              options={field.options}
            />
          );
        })}
        <Button
          type="submit"
          variant="default"
          size="dashboard"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
          disabled={
            isPending ||
            !form.formState.isValid ||
            Object.keys(form.formState.errors).length > 0
          }
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
