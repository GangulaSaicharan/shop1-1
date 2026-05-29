import { prisma } from "@/lib/prisma";
import CategoriesManager from "./CategoriesManager";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 text-sm mt-0.5">Organise your product catalogue</p>
        </div>
        <Link
          href="/categories/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <span className="text-base leading-none">+</span> Add Category
        </Link>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  );
}
