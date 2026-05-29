"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ProductActions({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(published);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleTogglePublish() {
    setToggling(true);
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !isPublished }),
    });
    if (res.ok) {
      const next = !isPublished;
      setIsPublished(next);
      toast.success(next ? "Product published" : "Product unpublished");
    } else {
      toast.error("Failed to update product");
    }
    setToggling(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Product deleted");
      router.push("/products");
      router.refresh();
    } else {
      toast.error("Failed to delete product");
      setDeleting(false);
    }
    setConfirmOpen(false);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleTogglePublish}
          disabled={toggling}
          className={`text-sm font-semibold px-4 py-2 rounded-xl border transition disabled:opacity-60 ${
            isPublished
              ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          {toggling ? "..." : isPublished ? "Unpublish" : "Publish"}
        </button>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={deleting}
          className="text-sm font-semibold px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-60"
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete product?"
        description="This product will be permanently removed and cannot be recovered."
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
