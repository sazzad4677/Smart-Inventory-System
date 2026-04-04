import { PageHeader } from "@/components/layout/page-header";
import { PackageSearch } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getProductsAction } from "@/actions/product.actions";
import { getCategoriesAction } from "@/actions/category.actions";
import { AddProductDialog } from "./_components/add-product-dialog";
import { ProductList } from "./_components/product-list";
import { InventoryFilters } from "./_components/inventory-filters";
import { Pagination } from "@/components/shared/pagination";
import { getCurrentUser } from "@/actions/auth.actions";

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

  const categories = await getCategoriesAction();

  const categoryName = params.category;
  const selectedCategory = categories.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (cat: any) => cat.name === categoryName,
  );

  const productsResponse = await getProductsAction({
    searchTerm: params.searchTerm,
    category_id: selectedCategory?._id,
    page: params.page || "1",
    limit: params.limit || "10",
  });

  const { data: products, meta } = productsResponse;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryOptions = categories.map((cat: any) => ({
    label: cat.name,
    value: cat._id,
  }));

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
        <InventoryFilters categoryOptions={categoryOptions} />

        <div className="relative group">
          {products.length === 0 ? (
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
              <ProductList products={products} />
              <Pagination meta={meta} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
