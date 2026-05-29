"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";

type CategoryRef = { id: string; slug: string };

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function CategoryForm({
  categories,
  category,
}: {
  categories: CategoryRef[];
  category?: { id: string; name: string; slug: string; description: string };
}) {
  const router = useRouter();
  const isEdit = !!category;

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
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
    else if (categories.some((c) => c.slug === slug && c.id !== category?.id))
      e.slug = "Slug already taken";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);

    const res = await fetch(
      isEdit ? `/api/categories/${category.id}` : "/api/categories",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      }
    );

    if (res.ok) {
      toast.success(isEdit ? "Category updated" : "Category created");
      router.push("/categories");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Failed to save category");
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
            placeholder="Electronics"
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
            placeholder="electronics"
          />
          {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
          <p className="mt-1 text-xs text-slate-400">Used in URLs — e.g. /category/electronics</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Optional description"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Category"}
        </button>
        <a
          href="/categories"
          className="text-slate-600 hover:text-slate-900 text-sm font-medium px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
