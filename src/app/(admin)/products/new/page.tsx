import { prisma } from "@/lib/prisma";
import ProductForm from "../../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <a href="/products" className="text-sm text-slate-500 hover:text-slate-700">← Back to Products</a>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Add New Product</h1>
      </div>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
