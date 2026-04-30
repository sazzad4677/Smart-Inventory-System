import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Tags } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategoriesAction } from "@/actions/category.actions";
import { AddCategoryDialog } from "./_components/add-category-dialog";
import { CategoryList } from "./_components/category-list";
import { getCurrentUser } from "@/actions/auth.actions";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);

  const categoriesPromise = getCategoriesAction({
    searchTerm: params.searchTerm,
    page: params.page,
    limit: params.limit,
  });

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
        {user && user.role !== "Staff" && <AddCategoryDialog />}
      </PageHeader>

      <FilterBar filters={filters} />

      <div className="relative group">
        <Suspense fallback={<CategoriesTableSkeleton />}>
          <CategoriesTableAsync
            promise={categoriesPromise}
            searchTerm={params.searchTerm}
          />
        </Suspense>
      </div>
    </div>
  );
}

async function CategoriesTableAsync({
  promise,
  searchTerm,
}: {
  promise: ReturnType<typeof getCategoriesAction>;
  searchTerm?: string;
}) {
  const response = await promise;

  if (!response.success) {
    return (
      <ErrorAlert
        error={
          response.error || "Failed to load categories. Please try again later."
        }
      />
    );
  }

  const categories = response.data.data;
  const meta = response.data.meta;

  if (categories.length === 0) {
    return (
      <EmptyState
        className="py-12 bg-slate-900/10 border-white/5 rounded-2xl"
        icon={<Tags className="h-12 w-12 text-indigo-500/40" />}
        title={searchTerm ? "No results found" : "No categories found"}
        description={
          searchTerm
            ? `We couldn't find any categories matching "${searchTerm}".`
            : "Start organizing your inventory by creating your first product category today."
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CategoryList categories={categories} />
      <Pagination meta={meta} itemLabel="categories" />
    </div>
  );
}

function CategoriesTableSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-6 min-h-[400px]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-white/5" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
