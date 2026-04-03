import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus, PackageSearch } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Inventory"
        description="Manage your products, stock levels, and pricing."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </PageHeader>

      <EmptyState
        icon={<PackageSearch />}
        title="No products found"
        description="Your inventory is currently empty. Start by adding your first product to track stock and sales."
      />
    </div>
  );
}
