"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Tag } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  _count: { products: number };
};

export default function CategoriesManager({
  categories: initial,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/categories/${deleteTarget}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget));
      toast.success("Category deleted");
    } else {
      toast.error("Failed to delete category");
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  const deleteTargetCat = categories.find((c) => c.id === deleteTarget);
  const targetName = deleteTargetCat?.name;
  const targetProductCount = deleteTargetCat?._count.products ?? 0;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <Tag className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-slate-700 font-semibold text-base">No categories yet</p>
            <p className="text-slate-400 text-sm mt-1 mb-5">
              Categories help shoppers browse your store.
            </p>
            <Link
              href="/categories/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
            >
              Add your first category
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-right px-4 py-3">Products</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition group">
                  <td className="px-4 py-3 font-medium text-slate-900">{cat.name}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{cat._count.products}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/categories/${cat.id}/edit`)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit category"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete category"
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
        title="Delete category?"
        description={
          targetName
            ? targetProductCount > 0
              ? `"${targetName}" and all ${targetProductCount} product(s) in it will be permanently deleted. This cannot be undone.`
              : `"${targetName}" will be permanently removed.`
            : undefined
        }
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
