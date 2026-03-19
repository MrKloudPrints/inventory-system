import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "200");
  const offset = parseInt(searchParams.get("offset") || "0");

  const movements = await prisma.stockMovement.findMany({
    include: {
      variant: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  return NextResponse.json(
    movements.map((m) => ({
      type: m.type,
      qty: m.quantity,
      date: m.createdAt.toISOString(),
      reason: m.reason,
      note: m.note || undefined,
      newTotal: m.resultingQty,
      sku: m.variant.sku,
      style: m.variant.product.name,
      color: m.variant.color,
      size: m.variant.size,
    }))
  );
}
