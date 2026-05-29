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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const {
    name, description, actualPrice, price,
    published, isFeatured, isNewArrival, categoryId, brandId, variants,
  } = body;

  if (isNewArrival === true) {
    const existing = await prisma.product.findMany({
      where: { isNewArrival: true, id: { not: id } },
      orderBy: { updatedAt: "asc" },
    });
    if (existing.length >= MAX_NEW_ARRIVALS) {
      await prisma.product.update({
        where: { id: existing[0].id },
        data: { isNewArrival: false },
      });
    }
  }

  if (variants !== undefined) {
    if (variants.length === 0) {
      return NextResponse.json(
        { error: "At least one variant is required" },
        { status: 400 }
      );
    }
    await prisma.productVariant.deleteMany({ where: { productId: id } });
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(actualPrice !== undefined && { actualPrice: parseFloat(actualPrice) }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(published !== undefined && { published }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(isNewArrival !== undefined && { isNewArrival }),
      ...(categoryId !== undefined && { categoryId }),
      ...("brandId" in body && { brandId: brandId || null }),
      ...(variants !== undefined && {
        variants: {
          create: (variants as { name: string; sku?: string; actualPrice?: string; price?: string; stock?: string; attributes?: { key: string; value: string }[]; images?: string[] }[]).map((v) => ({
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
      }),
    },
    include: productInclude,
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
