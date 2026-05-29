import { prisma } from "@/lib/prisma";
import {
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Sparkles,
  Tag,
  Layers,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [products, categoryCount, brandCount, lowStockItems] = await Promise.all([
    prisma.product.findMany({
      select: {
        published: true,
        isFeatured: true,
        isNewArrival: true,
        variants: { select: { stock: true } },
      },
    }),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.productVariant.findMany({
      where: { stock: { gt: 0, lte: 5 } },
      select: {
        id: true,
        name: true,
        stock: true,
        product: { select: { id: true, name: true } },
      },
      orderBy: { stock: "asc" },
      take: 10,
    }),
  ]);

  const total = products.length;
  const published = products.filter((p) => p.published).length;
  const draft = total - published;
  const featured = products.filter((p) => p.isFeatured).length;
  const newArrivals = products.filter((p) => p.isNewArrival).length;
  const outOfStock = products.filter((p) =>
    p.variants.every((v) => v.stock === 0)
  ).length;

  const stats = [
    { label: "Total Products", value: total, icon: Package, color: "bg-indigo-50 text-indigo-600", border: "border-indigo-100", href: "/products" },
    { label: "Published", value: published, icon: CheckCircle, color: "bg-green-50 text-green-600", border: "border-green-100", href: "/products" },
    { label: "Draft", value: draft, icon: XCircle, color: "bg-slate-100 text-slate-500", border: "border-slate-200", href: "/products" },
    { label: "Out of Stock", value: outOfStock, icon: AlertTriangle, color: "bg-red-50 text-red-500", border: "border-red-100", href: "/products" },
    { label: "Featured", value: featured, icon: Star, color: "bg-amber-50 text-amber-500", border: "border-amber-100", href: "/products" },
    { label: "New Arrivals", value: `${newArrivals}/5`, icon: Sparkles, color: "bg-violet-50 text-violet-600", border: "border-violet-100", href: "/products" },
    { label: "Categories", value: categoryCount, icon: Tag, color: "bg-sky-50 text-sky-600", border: "border-sky-100", href: "/categories" },
    { label: "Brands", value: brandCount, icon: Layers, color: "bg-teal-50 text-teal-600", border: "border-teal-100", href: "/brands" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Your store at a glance</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color, border, href }) => (
          <Link key={label} href={href}
            className={`bg-white rounded-2xl border ${border} p-4 flex flex-col gap-2 hover:shadow-sm transition`}
          >
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Low Stock Alerts</h2>
              <p className="text-xs text-slate-400">Variants with 5 or fewer units remaining</p>
            </div>
          </div>
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <Link key={item.id} href={`/products/${item.product.id}/edit`}
                className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 transition group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate group-hover:text-indigo-600 transition">{item.product.name}</p>
                  <p className="text-xs text-slate-400 truncate">{item.name}</p>
                </div>
                <span className={`flex-shrink-0 ml-3 text-xs font-bold px-2.5 py-1 rounded-full ${item.stock <= 2 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                  {item.stock} left
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/products/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-5 flex items-center gap-4 transition shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Add Product</p>
            <p className="text-indigo-200 text-xs mt-0.5">Create a new listing</p>
          </div>
        </Link>
        <Link href="/categories"
          className="bg-white hover:shadow-sm border border-slate-200 text-slate-700 rounded-2xl p-5 flex items-center gap-4 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
            <Tag className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <p className="font-semibold text-sm">Manage Categories</p>
            <p className="text-slate-400 text-xs mt-0.5">{categoryCount} categories</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
