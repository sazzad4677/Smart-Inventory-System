import { PageHeader } from "@/components/layout/page-header";
import { Tags } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategoriesAction } from "@/actions/category.actions";
import { AddCategoryDialog } from "./_components/add-category-dialog";
import { CategoryList } from "./_components/category-list";

export default async function CategoriesPage() {
  const categories = await getCategoriesAction();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Categories"
        description="Organize your products into categories for better filtering."
      >
        <AddCategoryDialog />
      </PageHeader>

      <div className="relative group">
        {categories.length === 0 ? (
          <EmptyState
            className="py-12 bg-slate-900/10 border-white/5 rounded-2xl"
            icon={<Tags className="h-12 w-12 text-indigo-500/40" />}
            title="No categories found"
            description="Start organizing your inventory by creating your first product category today."
          />
        ) : (
          <CategoryList categories={categories} />
        )}
      </div>
    </div>
  );
}
