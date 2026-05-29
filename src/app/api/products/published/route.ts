import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categorySlug = searchParams.get("category");
  const brandSlug = searchParams.get("brand");
  const inStock = searchParams.get("inStock");
  const featured = searchParams.get("featured");
  const newArrival = searchParams.get("newArrival");
  const limitParam = searchParams.get("limit");
  const skipParam = searchParams.get("skip");
  const sortBy = searchParams.get("sortBy");
  const search = searchParams.get("search");

  const take = limitParam ? parseInt(limitParam, 10) : undefined;
  const skip = skipParam ? parseInt(skipParam, 10) : undefined;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const orderBy =
    sortBy === "price_asc" ? { price: "asc" as const } :
    sortBy === "price_desc" ? { price: "desc" as const } :
    { createdAt: "desc" as const };

  const products = await prisma.product.findMany({
    take,
    skip,
    where: {
      published: true,
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(brandSlug && { brand: { slug: brandSlug } }),
      ...(inStock === "true" && { variants: { some: { stock: { gt: 0 } } } }),
      ...(inStock === "false" && { variants: { every: { stock: { equals: 0 } } } }),
      ...(featured === "true" && { isFeatured: true }),
      ...(newArrival === "true" && { isNewArrival: true }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    },
    include: {
      category: true,
      brand: true,
      variants: {
        include: {
          attributes: true,
          images: { orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy,
  });

  return NextResponse.json(products);
}
