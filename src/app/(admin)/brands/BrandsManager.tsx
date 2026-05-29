"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil, Trash2, Layers } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  _count: { products: number };
};

export default function BrandsManager({
  brands: initial,
}: {
  brands: Brand[];
}) {
  const router = useRouter();
  const [brands, setBrands] = useState(initial);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/brands/${deleteTarget}`, { method: "DELETE" });
    if (res.ok) {
      setBrands((prev) => prev.filter((b) => b.id !== deleteTarget));
      toast.success("Brand deleted");
    } else {
      toast.error("Failed to delete brand");
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  const deleteTargetBrand = brands.find((b) => b.id === deleteTarget);
  const targetName = deleteTargetBrand?.name;
  const targetProductCount = deleteTargetBrand?._count.products ?? 0;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
              <Layers className="w-7 h-7 text-teal-400" />
            </div>
            <p className="text-slate-700 font-semibold text-base">No brands yet</p>
            <p className="text-slate-400 text-sm mt-1 mb-5">
              Add brands to associate products with manufacturers.
            </p>
            <Link
              href="/brands/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
            >
              Add your first brand
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Brand</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-right px-4 py-3">Products</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-slate-50/50 transition group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {brand.logoUrl ? (
                        <div className="relative h-6 w-16 flex-shrink-0">
                          <Image src={brand.logoUrl} alt={brand.name} fill sizes="64px" className="object-contain" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold flex-shrink-0">
                          {brand.name[0]}
                        </div>
                      )}
                      <span className="font-medium text-slate-900">{brand.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{brand.slug}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{brand._count.products}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/brands/${brand.id}/edit`)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit brand"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(brand.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete brand"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        title="Delete brand?"
        description={
          targetName
            ? targetProductCount > 0
              ? `"${targetName}" will be permanently removed. ${targetProductCount} product(s) will have their brand cleared but will not be deleted.`
              : `"${targetName}" will be permanently removed.`
            : undefined
        }
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
