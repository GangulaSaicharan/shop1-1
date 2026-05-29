import { prisma } from "@/lib/prisma";
import ProductsTable from "../ProductsTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        variants: {
          include: { images: { orderBy: { order: "asc" }, take: 1 } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your product catalogue</p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <span className="text-base leading-none">+</span> Add Product
        </Link>
      </div>

      <ProductsTable products={products} categories={categories} brands={brands} />
    </div>
  );
}
