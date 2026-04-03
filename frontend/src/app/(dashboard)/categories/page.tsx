import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Tags } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Categories"
        description="Organize your products into categories for better filtering."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>

      <EmptyState
        icon={<Tags />}
        title="No categories"
        description="Organize your products by creating categories. This makes browsing and managing stock much easier."
      />
    </div>
  );
}
