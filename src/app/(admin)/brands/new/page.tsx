import { prisma } from "@/lib/prisma";
import BrandForm from "../BrandForm";

export const dynamic = "force-dynamic";

export default async function NewBrandPage() {
  const brands = await prisma.brand.findMany({
    select: { id: true, slug: true },
  });

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Brand</h1>
        <p className="text-slate-500 text-sm mt-0.5">Add a new product brand</p>
      </div>
      <BrandForm brands={brands} />
    </div>
  );
}
