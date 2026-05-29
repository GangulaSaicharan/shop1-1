import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_NEW_ARRIVALS = 5;

const productInclude = {
  category: true,
  brand: true,
  variants: {
    include: {
      attributes: true,
      images: { orderBy: { order: "asc" as const } },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

export async function GET() {
  const products = await prisma.product.findMany({
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name, description, actualPrice, price,
    published, isFeatured, isNewArrival, categoryId, brandId, variants,
  } = body;

  if (!name || price === undefined || actualPrice === undefined || !categoryId) {
    return NextResponse.json(
      { error: "name, actualPrice, price and categoryId are required" },
      { status: 400 }
    );
  }
  if (!variants || variants.length === 0) {
    return NextResponse.json(
      { error: "At least one variant is required" },
      { status: 400 }
    );
  }

  if (isNewArrival) {
    const existing = await prisma.product.findMany({
      where: { isNewArrival: true },
      orderBy: { updatedAt: "asc" },
    });
    if (existing.length >= MAX_NEW_ARRIVALS) {
      await prisma.product.update({
        where: { id: existing[0].id },
        data: { isNewArrival: false },
      });
    }
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: description ?? "",
      actualPrice: parseFloat(actualPrice),
      price: parseFloat(price),
      published: published ?? false,
      isFeatured: isFeatured ?? false,
      isNewArrival: isNewArrival ?? false,
      categoryId,
      brandId: brandId || null,
      variants: {
        create: (variants ?? []).map((v: { name: string; sku?: string; actualPrice?: string; price?: string; stock?: string; attributes?: { key: string; value: string }[]; images?: string[] }) => ({
          name: v.name,
          sku: v.sku ?? "",
          actualPrice: v.actualPrice ? parseFloat(v.actualPrice) : null,
          price: v.price ? parseFloat(v.price) : null,
          stock: parseInt(v.stock ?? "0"),
          attributes: {
            create: (v.attributes ?? []).map((a) => ({ key: a.key, value: a.value })),
          },
          images: {
            create: (v.images ?? []).map((url: string, i: number) => ({ url, order: i })),
          },
        })),
      },
    },
    include: productInclude,
  });

  return NextResponse.json(product, { status: 201 });
}
