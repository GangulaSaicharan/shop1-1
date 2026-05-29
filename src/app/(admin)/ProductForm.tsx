"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Sparkles, X, Plus, Trash2, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { toast } from "@/components/ui/sonner";

type Category = { id: string; name: string; slug: string };
type Brand = { id: string; name: string; slug: string };
type VariantAttribute = { key: string; value: string };
type VariantInput = {
  name: string;
  sku: string;
  actualPrice: string;
  price: string;
  stock: string;
  attributes: VariantAttribute[];
  images: string[];
};
type ExistingVariant = {
  id: string;
  name: string;
  sku: string;
  actualPrice: number | null;
  price: number | null;
  stock: number;
  attributes: { id: string; key: string; value: string }[];
  images: { id: string; url: string; order: number }[];
};
type Product = {
  id: string;
  name: string;
  description: string;
  actualPrice: number;
  price: number;
  published: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  categoryId: string;
  brandId: string | null;
  variants: ExistingVariant[];
};

function Toggle({
  value,
  onChange,
  label,
  hint,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-indigo-600" : "bg-slate-200"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  );
}

function buildVariantName(attrs: VariantAttribute[]) {
  const filled = attrs.filter((a) => a.key && a.value);
  return filled.length > 0 ? filled.map((a) => a.value).join(" / ") : "";
}

export default function ProductForm({
  categories,
  brands,
  product,
}: {
  categories: Category[];
  brands: Brand[];
  product?: Product;
}) {
  const router = useRouter();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [actualPrice, setActualPrice] = useState(product?.actualPrice?.toString() ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [published, setPublished] = useState(product?.published ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(product?.isNewArrival ?? false);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [brandId, setBrandId] = useState(product?.brandId ?? "");
  const [variants, setVariants] = useState<VariantInput[]>(
    product?.variants.length
      ? product.variants.map((v) => ({
          name: v.name,
          sku: v.sku,
          actualPrice: v.actualPrice?.toString() ?? "",
          price: v.price?.toString() ?? "",
          stock: v.stock.toString(),
          attributes: v.attributes.map((a) => ({ key: a.key, value: a.value })),
          images: v.images?.map((i) => i.url) ?? [],
        }))
      : [{ name: "", sku: "", actualPrice: "", price: "", stock: "0", attributes: [{ key: "", value: "" }], images: [] }]
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState<Record<number, number>>({});

  // Variant helpers
  function addVariant() {
    setVariants((p) => [...p, { name: "", sku: "", actualPrice: "", price: "", stock: "0", attributes: [{ key: "", value: "" }], images: [] }]);
  }
  function removeVariant(i: number) {
    setVariants((p) => p.length > 1 ? p.filter((_, j) => j !== i) : p);
  }
  function updateVariant(i: number, field: keyof VariantInput, value: string) {
    setVariants((p) => p.map((v, j) => (j === i ? { ...v, [field]: value } : v)));
  }
  function addAttribute(vi: number) {
    setVariants((p) => p.map((v, j) => j === vi ? { ...v, attributes: [...v.attributes, { key: "", value: "" }] } : v));
  }
  function removeAttribute(vi: number, ai: number) {
    setVariants((p) => p.map((v, j) => {
      if (j !== vi) return v;
      const attrs = v.attributes.filter((_, k) => k !== ai);
      return { ...v, attributes: attrs, name: buildVariantName(attrs) };
    }));
  }
  function updateAttribute(vi: number, ai: number, field: "key" | "value", val: string) {
    setVariants((p) => p.map((v, j) => {
      if (j !== vi) return v;
      const attrs = v.attributes.map((a, k) => k === ai ? { ...a, [field]: val } : a);
      return { ...v, attributes: attrs, name: buildVariantName(attrs) || v.name };
    }));
  }

  // Variant image helpers
  function addVariantImage(vi: number) {
    setVariants((p) => {
      const newImages = [...p[vi].images, ""];
      setSelectedImageIdx((s) => ({ ...s, [vi]: newImages.length - 1 }));
      return p.map((v, j) => j === vi ? { ...v, images: newImages } : v);
    });
  }
  function removeVariantImage(vi: number, ii: number) {
    setVariants((p) => {
      const newImages = p[vi].images.filter((_, k) => k !== ii);
      setSelectedImageIdx((s) => ({ ...s, [vi]: Math.min(s[vi] ?? 0, Math.max(newImages.length - 1, 0)) }));
      return p.map((v, j) => j === vi ? { ...v, images: newImages } : v);
    });
  }
  function updateVariantImage(vi: number, ii: number, url: string) {
    setVariants((p) => p.map((v, j) => j === vi ? { ...v, images: v.images.map((u, k) => k === ii ? url : u) } : v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) return setError("Product name is required");
    if (name.trim().length < 2) return setError("Product name must be at least 2 characters");
    if (!categoryId) return setError("Please select a category");
    const mrp = parseFloat(actualPrice);
    const sp = parseFloat(price);
    if (!actualPrice || isNaN(mrp) || mrp <= 0) return setError("MRP must be a positive number");
    if (!price || isNaN(sp) || sp <= 0) return setError("Selling price must be a positive number");
    if (sp > mrp) return setError("Selling price cannot be higher than MRP");
    if (variants.length === 0) return setError("At least one variant is required");

    setSaving(true);

    const body = {
      name, description, actualPrice, price,
      published, isFeatured, isNewArrival, categoryId,
      brandId: brandId || null,
      variants: variants.map((v) => ({
        name: v.name || buildVariantName(v.attributes),
        sku: v.sku,
        actualPrice: v.actualPrice || null,
        price: v.price || null,
        stock: v.stock,
        attributes: v.attributes.filter((a) => a.key && a.value),
        images: v.images.filter((u) => u.trim() !== ""),
      })),
    };

    try {
      const res = await fetch(
        isEdit ? `/api/products/${product.id}` : "/api/products",
        { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      if (res.ok) {
        toast.success(isEdit ? "Product updated" : "Product created");
        router.push("/products");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to save product");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const discount =
    actualPrice && price && parseFloat(actualPrice) > parseFloat(price)
      ? Math.round(((parseFloat(actualPrice) - parseFloat(price)) / parseFloat(actualPrice)) * 100)
      : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-700 text-xs uppercase tracking-widest">Basic Info</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Wireless Headphones" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Describe the product..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
            <select value={brandId} onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">No brand</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-700 text-xs uppercase tracking-widest">Pricing & Stock</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">MRP *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input type="number" value={actualPrice} onChange={(e) => setActualPrice(e.target.value)} required min="0" step="0.01"
                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01"
                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
            </div>
          </div>
        </div>
        {discount > 0 && <p className="text-xs text-green-600 font-medium">🎉 {discount}% discount shown on website</p>}
      </div>

      {/* Visibility */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-1">
        <h2 className="font-semibold text-slate-700 text-xs uppercase tracking-widest mb-3">Visibility & Tags</h2>
        <Toggle value={published} onChange={setPublished} label="Published" hint="Visible on the website" />
        <div className="border-t border-slate-50" />
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">Top Product</p>
              <p className="text-xs text-slate-400">Featured in &quot;Top Products&quot; section</p>
            </div>
          </div>
          <button type="button" onClick={() => setIsFeatured((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFeatured ? "bg-amber-400" : "bg-slate-200"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isFeatured ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        <div className="border-t border-slate-50" />
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">New Arrival</p>
              <p className="text-xs text-slate-400">Shows in carousel (max 5, oldest auto-removed)</p>
            </div>
          </div>
          <button type="button" onClick={() => setIsNewArrival((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isNewArrival ? "bg-indigo-600" : "bg-slate-200"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isNewArrival ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-700 text-xs uppercase tracking-widest">Variants</h2>
            <p className="text-xs text-slate-400 mt-0.5">e.g. Color, Size, Material — each with its own price & stock</p>
          </div>
          <button type="button" onClick={addVariant}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition">
            <Plus className="w-4 h-4" /> Add Variant
          </button>
        </div>

        <p className="text-xs text-amber-600 font-medium -mt-1">Every product must have at least one variant.</p>

        {variants.map((variant, vi) => (
          <div key={vi} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                {variant.name || <span className="text-slate-400 font-normal">Variant {vi + 1}</span>}
              </span>
              <button type="button" onClick={() => removeVariant(vi)}
                disabled={variants.length === 1}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Attributes */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Attributes</p>
              {variant.attributes.map((attr, ai) => (
                <div key={ai} className="flex gap-2 items-center">
                  <input type="text" value={attr.key}
                    onChange={(e) => updateAttribute(vi, ai, "key", e.target.value)}
                    placeholder="e.g. Color"
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <input type="text" value={attr.value}
                    onChange={(e) => updateAttribute(vi, ai, "value", e.target.value)}
                    placeholder="e.g. Red"
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  {variant.attributes.length > 1 && (
                    <button type="button" onClick={() => removeAttribute(vi, ai)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addAttribute(vi)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition">
                <Plus className="w-3 h-3" /> Add attribute
              </button>
            </div>

            {/* Variant Images */}
            {(() => {
              const imgs = variant.images ?? [];
              const idx = Math.min(selectedImageIdx[vi] ?? 0, Math.max(imgs.length - 1, 0));
              const currentUrl = imgs[idx] ?? "";
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">Images {imgs.length > 0 && <span className="text-slate-400 font-normal">({idx + 1}/{imgs.length})</span>}</p>
                    <button type="button" onClick={() => addVariantImage(vi)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition">
                      <Plus className="w-3 h-3" /> Add image
                    </button>
                  </div>

                  {imgs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No images — falls back to product images</p>
                  ) : (
                    <>
                      {/* Preview */}
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        {currentUrl.trim() ? (
                          <Image src={currentUrl} alt="Variant image"
                            fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                            <p className="text-xs text-slate-400">Paste URL below</p>
                          </div>
                        )}
                        {/* Prev / Next */}
                        {imgs.length > 1 && (
                          <>
                            <button type="button"
                              onClick={() => setSelectedImageIdx((s) => ({ ...s, [vi]: (idx - 1 + imgs.length) % imgs.length }))}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition">
                              <ChevronLeft className="w-4 h-4 text-slate-600" />
                            </button>
                            <button type="button"
                              onClick={() => setSelectedImageIdx((s) => ({ ...s, [vi]: (idx + 1) % imgs.length }))}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition">
                              <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* URL input + remove */}
                      <div className="flex gap-2 items-center">
                        <input type="url" value={currentUrl}
                          onChange={(e) => updateVariantImage(vi, idx, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <button type="button" onClick={() => removeVariantImage(vi, idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Thumbnails */}
                      {imgs.length > 1 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {imgs.map((url, ii) => (
                            <button key={ii} type="button"
                              onClick={() => setSelectedImageIdx((s) => ({ ...s, [vi]: ii }))}
                              className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${ii === idx ? "border-indigo-500" : "border-transparent hover:border-slate-300"}`}>
                              {url.trim() ? (
                                <Image src={url} alt="" fill sizes="40px" className="object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
                              ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                  <ImageIcon className="w-3.5 h-3.5 text-slate-300" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">MRP</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                  <input type="number" value={variant.actualPrice}
                    onChange={(e) => updateVariant(vi, "actualPrice", e.target.value)}
                    min="0" step="0.01" placeholder="Same as product"
                    className="w-full pl-6 pr-2 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Selling Price</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                  <input type="number" value={variant.price}
                    onChange={(e) => updateVariant(vi, "price", e.target.value)}
                    min="0" step="0.01" placeholder="Same as product"
                    className="w-full pl-6 pr-2 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            {/* Stock / SKU */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Stock</label>
                <input type="number" value={variant.stock}
                  onChange={(e) => updateVariant(vi, "stock", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">SKU</label>
                <input type="text" value={variant.sku}
                  onChange={(e) => updateVariant(vi, "sku", e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition disabled:opacity-60">
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
        </button>
        <a href="/products"
          className="text-slate-600 hover:text-slate-900 text-sm font-medium px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
          Cancel
        </a>
      </div>
    </form>
  );
}
