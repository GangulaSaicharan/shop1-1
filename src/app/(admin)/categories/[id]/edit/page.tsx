import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CategoryForm from "../../CategoryForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, categories] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({ select: { id: true, slug: true } }),
  ]);

  if (!category) notFound();

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Category</h1>
        <p className="text-slate-500 text-sm mt-0.5">Updating &ldquo;{category.name}&rdquo;</p>
      </div>
      <CategoryForm categories={categories} category={category} />
    </div>
  );
}
