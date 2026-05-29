"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";

type BrandRef = { id: string; slug: string };

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function BrandForm({
  brands,
  brand,
}: {
  brands: BrandRef[];
  brand?: { id: string; name: string; slug: string; logoUrl: string };
}) {
  const router = useRouter();
  const isEdit = !!brand;

  const [name, setName] = useState(brand?.name ?? "");
  const [slug, setSlug] = useState(brand?.slug ?? "");
  const [logoUrl, setLogoUrl] = useState(brand?.logoUrl ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!isEdit) setSlug(slugify(value));
    setErrors((e) => ({ ...e, name: "", slug: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    else if (name.trim().length < 2) e.name = "At least 2 characters";
    if (!slug.trim()) e.slug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(slug)) e.slug = "Only lowercase letters, numbers and hyphens";
    else if (brands.some((b) => b.slug === slug && b.id !== brand?.id))
      e.slug = "Slug already taken";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);

    const res = await fetch(
      isEdit ? `/api/brands/${brand.id}` : "/api/brands",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, logoUrl }),
      }
    );

    if (res.ok) {
      toast.success(isEdit ? "Brand updated" : "Brand created");
      router.push("/brands");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Failed to save brand");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? "border-red-400" : "border-slate-200"}`}
            placeholder="Nike"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setErrors((er) => ({ ...er, slug: "" })); }}
            className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.slug ? "border-red-400" : "border-slate-200"}`}
            placeholder="nike"
          />
          {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
          <p className="mt-1 text-xs text-slate-400">Used in URLs — e.g. /brand/nike</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://example.com/logo.png"
          />
          {logoUrl && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="relative h-10 w-24 flex-shrink-0 rounded border border-slate-200 bg-white overflow-hidden">
                <Image src={logoUrl} alt="Logo preview" fill sizes="96px" className="object-contain p-1" />
              </div>
              <span className="text-xs text-slate-400">Logo preview</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Brand"}
        </button>
        <a
          href="/brands"
          className="text-slate-600 hover:text-slate-900 text-sm font-medium px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
