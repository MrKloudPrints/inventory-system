export function serializeVariant(variant) {
  const p = variant.product;
  return {
    sku: variant.sku,
    style: p.name,
    color: variant.color,
    size: variant.size,
    received: variant.initialStock,
    current: variant.currentStock,
    mfgCost: Number(p.mfgCost),
    imp: Number(p.importCost),
    hs: p.hsCode,
    landed: Number(p.landedCost),
    wholesale: Number(p.wholesalePrice),
    retail: Number(p.retailPrice),
    log: (variant.movements || []).map((m) => ({
      type: m.type,
      qty: m.quantity,
      date: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
      reason: m.reason,
      note: m.note || undefined,
      newTotal: m.resultingQty,
    })),
  };
}
