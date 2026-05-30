import { prisma } from "@/lib/prisma";
import CategoryForm from "../CategoryForm";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true },
  });

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Category</h1>
        <p className="text-slate-500 text-sm mt-0.5">Add a new product category</p>
      </div>
      <CategoryForm categories={categories} />
    </div>
  );
}
