import { PageHeader } from "@/components/layout/page-header";
import { Tags } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategoriesAction } from "@/actions/category.actions";
import { AddCategoryDialog } from "./_components/add-category-dialog";
import { CategoryList } from "./_components/category-list";

import { FilterBar, FilterField } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { ErrorAlert } from "@/components/shared/error-alert";

interface CategoriesPageProps {
  searchParams: Promise<{
    searchTerm?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const params = await searchParams;
  const response = await getCategoriesAction({
    searchTerm: params.searchTerm,
    page: params.page,
    limit: params.limit,
  });

  const categories = response.success ? response.data.data : [];
  const meta = response.success
    ? response.data.meta
    : { page: 1, limit: 10, total: 0, totalPage: 0 };

  const filters: FilterField[] = [
    {
      key: "searchTerm",
      label: "Search",
      type: "search",
      placeholder: "Search categories...",
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

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Categories"
        description="Organize your products into categories for better filtering."
      >
        <AddCategoryDialog />
      </PageHeader>

      <FilterBar filters={filters} />

      <div className="relative group">
        {!response.success ? (
          <ErrorAlert
            error={
              response.error ||
              "Failed to load categories. Please try again later."
            }
          />
        ) : categories.length === 0 ? (
          <EmptyState
            className="py-12 bg-slate-900/10 border-white/5 rounded-2xl"
            icon={<Tags className="h-12 w-12 text-indigo-500/40" />}
            title={
              params.searchTerm ? "No results found" : "No categories found"
            }
            description={
              params.searchTerm
                ? `We couldn't find any categories matching "${params.searchTerm}".`
                : "Start organizing your inventory by creating your first product category today."
            }
          />
        ) : (
          <div className="flex flex-col gap-6">
            <CategoryList categories={categories} />
            <Pagination meta={meta} itemLabel="categories" />
          </div>
        )}
      </div>
    </div>
  );
}
