import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { PackageSearch } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getProductsAction } from "@/actions/product.actions";
import { getCategoriesAction } from "@/actions/category.actions";
import { AddProductDialog } from "./_components/add-product-dialog";
import { ProductList } from "./_components/product-list";
import { FilterBar, FilterField } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { ErrorAlert } from "@/components/shared/error-alert";
import { getCurrentUser } from "@/actions/auth.actions";
import { Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryPageProps {
  searchParams: Promise<{
    searchTerm?: string;
    category?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);

  const categoriesResponse = await getCategoriesAction({ limit: "100" }); // Fetch all for dropdown
  const categories: Category[] = categoriesResponse.success
    ? categoriesResponse.data.data
    : [];

  const categoryName = params.category;
  const selectedCategory = categories.find((cat) => cat.name === categoryName);

  const productsPromise = getProductsAction({
    searchTerm: params.searchTerm,
    category_id: selectedCategory?._id,
    page: params.page || "1",
    limit: params.limit || "10",
  });

  const categoryOptions = categories.map((cat: Category) => ({
    label: cat.name,
    value: cat._id,
  }));

  const filters: FilterField[] = [
    {
      key: "searchTerm",
      label: "Search",
      type: "search",
      placeholder: "Search products...",
    },
    {
      key: "category",
      label: "Category",
      type: "select",
      options: [
        { label: "All Categories", value: "all" },
        ...categories.map((cat) => ({ label: cat.name, value: cat.name })),
      ],
      placeholder: "Filter by Category",
    },
    {
      key: "limit",
      label: "Limit",
      type: "select",
      options: [
        { label: "5 per page", value: "5" },
        { label: "10 per page", value: "10" },
        { label: "20 per page", value: "20" },
        { label: "50 per page", value: "50" },
      ],
      placeholder: "Rows per page",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Inventory"
        description="Manage your products, stock levels, and pricing."
      >
        {(user?.role === "Admin" || user?.role === "Staff") && (
          <AddProductDialog categoryOptions={categoryOptions} />
        )}
      </PageHeader>

      <div className="flex flex-col gap-6">
        <FilterBar filters={filters} />

        <div className="relative group">
          <Suspense fallback={<InventoryTableSkeleton />}>
            <InventoryTableAsync
              promise={productsPromise}
              categoryOptions={categoryOptions}
              userRole={user?.role}
              searchTerm={params.searchTerm}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function InventoryTableAsync({
  promise,
  categoryOptions,
  userRole,
  searchTerm,
}: {
  promise: ReturnType<typeof getProductsAction>;
  categoryOptions: { label: string; value: string }[];
  userRole?: string;
  searchTerm?: string;
}) {
  const productsResponse = await promise;

  if (!productsResponse.success) {
    return (
      <ErrorAlert
        error={
          productsResponse.error ||
          "Failed to load inventory. Please try again later."
        }
      />
    );
  }

  const products = productsResponse.data.data;
  const meta = productsResponse.data.meta;

  if (products.length === 0) {
    return (
      <EmptyState
        className="py-12 bg-slate-900/10 border-white/5 rounded-2xl"
        icon={<PackageSearch className="h-12 w-12 text-indigo-500/40" />}
        title={searchTerm ? "No results found" : "No products found"}
        description={
          searchTerm
            ? `We couldn't find any products matching "${searchTerm}".`
            : "Your inventory is currently empty. Start by adding your first product."
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ProductList
        products={products}
        categoryOptions={categoryOptions}
        userRole={userRole}
      />
      <Pagination meta={meta} itemLabel="products" />
    </div>
  );
}

function InventoryTableSkeleton() {
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
