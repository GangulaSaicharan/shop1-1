import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(brands);
}

export async function POST(request: NextRequest) {
  const { name, slug, logoUrl } = await request.json();
  if (!name || !slug) {
    return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
  }
  try {
    const brand = await prisma.brand.create({ data: { name, slug, logoUrl: logoUrl ?? "" } });
    return NextResponse.json(brand, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Brand name or slug already exists" }, { status: 409 });
  }
}
