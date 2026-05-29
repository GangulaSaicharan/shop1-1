import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm from "../../../ProductForm";
import ProductActions from "./ProductActions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            attributes: true,
            images: { orderBy: { order: "asc" } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <a href="/products" className="text-sm text-slate-500 hover:text-slate-700">← Back to Products</a>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Edit Product</h1>
        </div>
        <ProductActions id={product.id} published={product.published} />
      </div>
      <ProductForm categories={categories} brands={brands} product={product} />
    </div>
  );
}
