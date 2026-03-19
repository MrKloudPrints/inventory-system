import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeVariant } from "@/lib/serialize";

export async function PATCH(request, { params }) {
  const { sku } = await params;
  const body = await request.json();
  const { field, value } = body;

  const allowedFields = ["wholesalePrice", "retailPrice"];
  if (!allowedFields.includes(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }
  if (typeof value !== "number" || value < 0) {
    return NextResponse.json({ error: "Invalid value" }, { status: 400 });
  }

  const variant = await prisma.variant.findUnique({
    where: { sku: decodeURIComponent(sku) },
    include: { product: true },
  });
  if (!variant) {
    return NextResponse.json({ error: "SKU not found" }, { status: 404 });
  }

  const oldValue = Number(variant.product[field]);

  await prisma.product.update({
    where: { id: variant.productId },
    data: { [field]: value },
  });

  await prisma.stockMovement.create({
    data: {
      variantId: variant.id,
      type: "price-change",
      quantity: 0,
      reason: `${field === "wholesalePrice" ? "wholesale" : "retail"} changed from $${oldValue} to $${value}`,
      resultingQty: variant.currentStock,
    },
  });

  const updated = await prisma.variant.findUnique({
    where: { sku: decodeURIComponent(sku) },
    include: { product: true, movements: { orderBy: { createdAt: "desc" } } },
  });

  return NextResponse.json(serializeVariant(updated));
}
