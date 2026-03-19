import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeVariant } from "@/lib/serialize";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const style = searchParams.get("style");
  const color = searchParams.get("color");

  const where = {};
  if (style) where.product = { name: style };
  if (color) where.color = color;

  const variants = await prisma.variant.findMany({
    where,
    include: {
      product: true,
      movements: { orderBy: { createdAt: "desc" } },
    },
    orderBy: [{ product: { name: "asc" } }, { color: "asc" }, { size: "asc" }],
  });

  return NextResponse.json(variants.map(serializeVariant));
}
