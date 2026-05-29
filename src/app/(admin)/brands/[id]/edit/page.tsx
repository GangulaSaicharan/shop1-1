import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BrandForm from "../../BrandForm";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [brand, brands] = await Promise.all([
    prisma.brand.findUnique({ where: { id } }),
    prisma.brand.findMany({ select: { id: true, slug: true } }),
  ]);

  if (!brand) notFound();

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Brand</h1>
        <p className="text-slate-500 text-sm mt-0.5">Updating &ldquo;{brand.name}&rdquo;</p>
      </div>
      <BrandForm brands={brands} brand={brand} />
    </div>
  );
}
