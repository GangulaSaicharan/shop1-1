import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id, published: true },
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
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}
