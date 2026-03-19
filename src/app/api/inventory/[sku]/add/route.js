import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeVariant } from "@/lib/serialize";

const VALID_REASONS = ["restock", "return", "correction", "new-shipment"];

export async function POST(request, { params }) {
  const { sku } = await params;
  const body = await request.json();
  const { quantity, reason, note } = body;

  if (!quantity || quantity < 1) {
    return NextResponse.json({ error: "Quantity must be >= 1" }, { status: 400 });
  }
  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const variant = await tx.variant.findUnique({
      where: { sku: decodeURIComponent(sku) },
    });
    if (!variant) return null;

    const newQty = variant.currentStock + quantity;

    await tx.variant.update({
      where: { sku: decodeURIComponent(sku) },
      data: { currentStock: newQty },
    });

    await tx.stockMovement.create({
      data: {
        variantId: variant.id,
        type: "addition",
        quantity,
        reason,
        note: note || null,
        resultingQty: newQty,
      },
    });

    return tx.variant.findUnique({
      where: { sku: decodeURIComponent(sku) },
      include: { product: true, movements: { orderBy: { createdAt: "desc" } } },
    });
  });

  if (!result) {
    return NextResponse.json({ error: "SKU not found" }, { status: 404 });
  }

  return NextResponse.json(serializeVariant(result));
}
