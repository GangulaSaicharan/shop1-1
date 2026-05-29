"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil, Trash2, Package } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Category = { id: string; name: string; slug: string };
type Brand = { id: string; name: string; logoUrl: string };
type ProductVariant = { id: string; name: string; stock: number; images: { url: string }[] };
type Product = {
  id: string;
  name: string;
  actualPrice: number;
  price: number;
  published: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  category: Category;
  brand: Brand | null;
  variants: ProductVariant[];
  createdAt: Date | string;
};

export default function ProductsTable({
  products: initial,
  categories,
  brands,
}: {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initial);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || p.category.id === filterCategory;
    const matchesBrand = !filterBrand || p.brand?.id === filterBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  async function toggleField(
    id: string,
    field: "published" | "isFeatured" | "isNewArrival",
    value: boolean
  ) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (!res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: !value } : p))
      );
      toast.error("Failed to update");
    } else {
      if (field === "isNewArrival" && value) {
        // Server may have uncapped another product; refresh to reflect that
        router.refresh();
      }
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/products/${deleteTarget}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget));
      toast.success("Product deleted");
    } else {
      toast.error("Failed to delete product");
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  const targetName = products.find((p) => p.id === deleteTarget)?.name;

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          <Package className="w-7 h-7 text-indigo-400" />
        </div>
        <p className="text-slate-700 font-semibold text-base">No products yet</p>
        <p className="text-slate-400 text-sm mt-1 mb-5">
          Add your first product to start selling.
        </p>
        <Link
          href="/products/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
        >
          Add your first product
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-right px-4 py-3">MRP</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-right px-4 py-3">Stock</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <p className="text-slate-500 font-medium text-sm">No products match your filters</p>
                    <button
                      onClick={() => { setSearch(""); setFilterCategory(""); setFilterBrand(""); }}
                      className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        {product.variants[0]?.images[0]?.url ? (
                          <Image
                            src={product.variants[0].images[0].url}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg">📷</div>
                        )}
                      </div>
                      <span className="font-medium text-slate-900 max-w-48 truncate">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 w-fit">
                        {product.category.name}
                      </span>
                      {product.brand && (
                        <span className="text-xs text-slate-400">{product.brand.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 line-through text-xs">
                    ₹{product.actualPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    ₹{product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-slate-500">{product.variants.length} variant{product.variants.length !== 1 ? "s" : ""}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {(
                        [
                          { field: "published", label: "Publish", on: "bg-green-500" },
                          { field: "isFeatured", label: "Top", on: "bg-amber-400" },
                          { field: "isNewArrival", label: "New", on: "bg-violet-600" },
                        ] as const
                      ).map(({ field, label, on }) => (
                        <button
                          key={field}
                          type="button"
                          onClick={() => toggleField(product.id, field, !product[field])}
                          className="flex items-center gap-1.5 group"
                        >
                          <span
                            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors flex-shrink-0 ${
                              product[field] ? on : "bg-slate-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                                product[field] ? "translate-x-3.5" : "translate-x-0.5"
                              }`}
                            />
                          </span>
                          <span className="text-xs text-slate-400 group-hover:text-slate-600 transition">
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/products/${product.id}/edit`)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit product"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        title="Delete product?"
        description={targetName ? `"${targetName}" will be permanently removed.` : "This cannot be undone."}
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
