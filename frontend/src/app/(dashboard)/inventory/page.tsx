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

  const productsResponse = await getProductsAction({
    searchTerm: params.searchTerm,
    category_id: selectedCategory?._id,
    page: params.page || "1",
    limit: params.limit || "10",
  });

  const products = productsResponse.success ? productsResponse.data.data : [];
  const meta = productsResponse.success
    ? productsResponse.data.meta
    : { page: 1, limit: 10, total: 0, totalPage: 0 };

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
        {user?.role === "Admin" && (
          <AddProductDialog categoryOptions={categoryOptions} />
        )}
      </PageHeader>

      <div className="flex flex-col gap-6">
        <FilterBar filters={filters} />

        <div className="relative group">
          {!productsResponse.success ? (
            <ErrorAlert
              error={
                productsResponse.error ||
                "Failed to load inventory. Please try again later."
              }
            />
          ) : products.length === 0 ? (
            <EmptyState
              className="py-12 bg-slate-900/10 border-white/5 rounded-2xl"
              icon={<PackageSearch className="h-12 w-12 text-indigo-500/40" />}
              title={
                params.searchTerm ? "No results found" : "No products found"
              }
              description={
                params.searchTerm
                  ? `We couldn't find any products matching "${params.searchTerm}".`
                  : "Your inventory is currently empty. Start by adding your first product."
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              <ProductList
                products={products}
                categoryOptions={categoryOptions}
                userRole={user?.role}
              />
              <Pagination meta={meta} itemLabel="products" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
