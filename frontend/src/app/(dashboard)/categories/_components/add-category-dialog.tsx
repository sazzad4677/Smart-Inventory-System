"use client";

import { useState } from "react";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/shared/action-modal";
import { DynamicForm, FieldConfig } from "@/components/shared/dynamic-form";
import { CategorySchema, CategoryInput } from "@/lib/validations";
import { createCategoryAction } from "@/actions/category.actions";
import { toast } from "sonner";

const fields: FieldConfig[] = [
  {
    name: "name",
    label: "Category Name",
    type: "text",
    placeholder: "e.g., Electronics, Furniture",
    icon: Tag,
  },
];

export function AddCategoryDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: CategoryInput) => {
    setIsPending(true);
    const formData = new FormData();
    formData.append("name", data.name);

    try {
      const result = await createCategoryAction(formData);
      if (result.success) {
        setIsOpen(false);
        toast.success("Category created successfully");
      } else {
        toast.error(result.error || "Failed to create category");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ActionModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Create Category"
      description="Add a new category to organize your products efficiently."
      trigger={
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 px-6 font-semibold h-11 rounded-xl active:scale-[0.98] transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      }
    >
      <DynamicForm
        schema={CategorySchema}
        defaultValues={{ name: "" }}
        fields={fields}
        onSubmit={onSubmit}
        submitText="Create Category"
        isPending={isPending}
      />
    </ActionModal>
  );
}
