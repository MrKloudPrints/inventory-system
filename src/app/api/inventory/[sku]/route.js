import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeVariant } from "@/lib/serialize";

export async function GET(request, { params }) {
  const { sku } = await params;

  const variant = await prisma.variant.findUnique({
    where: { sku: decodeURIComponent(sku) },
    include: {
      product: true,
      movements: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!variant) {
    return NextResponse.json({ error: "SKU not found" }, { status: 404 });
  }

  return NextResponse.json(serializeVariant(variant));
}
