import { prisma } from "@/lib/prisma";
import BrandsManager from "./BrandsManager";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Brands</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage product manufacturers and labels</p>
        </div>
        <Link
          href="/brands/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <span className="text-base leading-none">+</span> Add
        </Link>
      </div>
      <BrandsManager brands={brands} />
    </div>
  );
}
