"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { INITIAL_INVENTORY } from "@/lib/inventory-data";

const REMOVAL_REASONS = ["sale", "sample", "gift", "damaged", "return-to-vendor", "other"];
const ADDITION_REASONS = ["restock", "return", "correction", "new-shipment"];

export default function ScanSkuPage() {
  const params = useParams();
  const sku = decodeURIComponent(params.sku);

  const [item, setItem] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState(null); // "add" or "remove"
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let data;
    try {
      const saved = localStorage.getItem("stock_inv");
      data = saved ? JSON.parse(saved) : null;
    } catch {
      data = null;
    }
    // Fall back to seed data if localStorage is empty (e.g. scanning from a different device)
    if (!data || !Array.isArray(data) || data.length === 0) {
      data = INITIAL_INVENTORY.map(i => ({ ...i, current: i.received, log: [] }));
      localStorage.setItem("stock_inv", JSON.stringify(data));
    }
    const found = data.find((d) => d.sku === sku);
    if (found) {
      setItem(found);
    } else {
      setNotFound(true);
    }
  }, [sku]);

  function handleConfirm() {
    if (!mode || !reason || amount < 1) return;

    const data = JSON.parse(localStorage.getItem("stock_inv") || "[]");
    const idx = data.findIndex((d) => d.sku === sku);
    if (idx === -1) return;

    const entry = data[idx];
    let newQty = entry.current;

    if (mode === "add") {
      newQty = entry.current + amount;
    } else {
      newQty = entry.current - amount;
      if (newQty < 0) newQty = 0;
    }

    const movement = {
      type: mode,
      quantity: amount,
      reason,
      date: new Date().toISOString(),
      note: "",
    };

    entry.current = newQty;
    if (!entry.movements) entry.movements = [];
    entry.movements.push(movement);
    data[idx] = entry;

    localStorage.setItem("stock_inv", JSON.stringify(data));

    setItem({ ...entry });
    setSuccess({
      type: mode,
      quantity: amount,
      reason,
      newQty,
    });
    setMode(null);
    setReason("");
    setAmount(1);
  }

  if (notFound) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>SKU NOT FOUND</h1>
        <p style={styles.skuDisplay}>{sku}</p>
        <p style={{ color: "#999", marginTop: 16 }}>
          This SKU does not exist in the inventory.
        </p>
        <Link href="/" style={styles.backLink}>
          BACK TO INVENTORY
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={styles.container}>
        <p style={{ color: "#999" }}>Loading...</p>
      </div>
    );
  }

  const reasons = mode === "add" ? ADDITION_REASONS : mode === "remove" ? REMOVAL_REASONS : [];
  const canConfirm = mode && reason && amount >= 1;
  const wouldGoNegative = mode === "remove" && item.current - amount < 0;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <p style={styles.sectionLabel}>STOCK ADJUSTMENT</p>
      </header>

      {/* SKU Info */}
      <div style={styles.infoCard}>
        <p style={styles.skuDisplay}>{item.sku}</p>
        <p style={styles.itemDetail}>{item.style}</p>
        <p style={styles.itemDetailSub}>
          {item.color} &middot; {item.size}
        </p>
      </div>

      {/* Current Quantity */}
      <div style={styles.qtyBlock}>
        <p style={styles.qtyLabel}>CURRENT STOCK</p>
        <p style={styles.qtyValue}>{item.current}</p>
      </div>

      {/* Success Message */}
      {success && (
        <div
          style={{
            ...styles.successBox,
            borderColor: success.type === "add" ? "#22c55e" : "#ef4444",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>
            {success.type === "add" ? "+" : "-"}
            {success.quantity} &middot; {success.reason.toUpperCase()}
          </p>
          <p style={{ margin: "4px 0 0", color: "#999", fontSize: 13 }}>
            Updated quantity: {success.newQty}
          </p>
        </div>
      )}

      {/* Mode Selection */}
      <div style={styles.modeRow}>
        <button
          style={{
            ...styles.modeBtn,
            backgroundColor: mode === "add" ? "#22c55e" : "#fff",
            color: mode === "add" ? "#fff" : "#000",
            borderColor: "#22c55e",
          }}
          onClick={() => {
            setMode("add");
            setReason("");
            setSuccess(null);
          }}
        >
          + ADD
        </button>
        <button
          style={{
            ...styles.modeBtn,
            backgroundColor: mode === "remove" ? "#ef4444" : "#fff",
            color: mode === "remove" ? "#fff" : "#000",
            borderColor: "#ef4444",
          }}
          onClick={() => {
            setMode("remove");
            setReason("");
            setSuccess(null);
          }}
        >
          - REMOVE
        </button>
      </div>

      {/* Amount Control */}
      {mode && (
        <div style={styles.section}>
          <p style={styles.sectionLabel}>QUANTITY</p>
          <div style={styles.amountRow}>
            <button
              style={styles.amountBtn}
              onClick={() => setAmount((a) => Math.max(1, a - 1))}
            >
              -
            </button>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1) setAmount(val);
              }}
              style={styles.amountInput}
            />
            <button
              style={styles.amountBtn}
              onClick={() => setAmount((a) => a + 1)}
            >
              +
            </button>
          </div>
          {wouldGoNegative && (
            <p style={{ color: "#ef4444", fontSize: 13, marginTop: 8 }}>
              Stock cannot go below 0. Will be set to 0.
            </p>
          )}
        </div>
      )}

      {/* Reason Selection */}
      {mode && (
        <div style={styles.section}>
          <p style={styles.sectionLabel}>REASON</p>
          <div style={styles.reasonGrid}>
            {reasons.map((r) => (
              <button
                key={r}
                style={{
                  ...styles.reasonBtn,
                  backgroundColor: reason === r ? "#000" : "#fff",
                  color: reason === r ? "#fff" : "#000",
                }}
                onClick={() => setReason(r)}
              >
                {r.toUpperCase().replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirm */}
      {mode && (
        <button
          style={{
            ...styles.confirmBtn,
            opacity: canConfirm ? 1 : 0.35,
            cursor: canConfirm ? "pointer" : "default",
          }}
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          CONFIRM {mode === "add" ? "ADDITION" : "REMOVAL"}
        </button>
      )}

      <Link href="/" style={styles.backLink}>
        BACK TO INVENTORY
      </Link>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    maxWidth: 440,
    margin: "0 auto",
    padding: "24px 16px",
    minHeight: "100dvh",
    backgroundColor: "#fff",
    color: "#000",
  },
  header: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#999",
    margin: "0 0 8px",
  },
  infoCard: {
    border: "1px solid #e5e5e5",
    padding: 16,
    marginBottom: 16,
  },
  skuDisplay: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    margin: "0 0 4px",
  },
  itemDetail: {
    fontSize: 15,
    fontWeight: 600,
    margin: "8px 0 2px",
    color: "#000",
  },
  itemDetailSub: {
    fontSize: 14,
    color: "#666",
    margin: 0,
  },
  qtyBlock: {
    textAlign: "center",
    padding: "20px 0",
    marginBottom: 16,
    border: "1px solid #e5e5e5",
  },
  qtyLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.15em",
    color: "#999",
    margin: "0 0 4px",
  },
  qtyValue: {
    fontSize: 48,
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.03em",
  },
  successBox: {
    border: "1px solid",
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  modeRow: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    padding: "16px 0",
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "0.08em",
    border: "1px solid",
    borderRadius: 0,
    cursor: "pointer",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  section: {
    marginBottom: 20,
  },
  amountRow: {
    display: "flex",
    alignItems: "center",
    gap: 0,
  },
  amountBtn: {
    width: 56,
    height: 56,
    fontSize: 24,
    fontWeight: 700,
    border: "1px solid #000",
    borderRadius: 0,
    backgroundColor: "#fff",
    cursor: "pointer",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  amountInput: {
    flex: 1,
    height: 56,
    fontSize: 24,
    fontWeight: 700,
    textAlign: "center",
    border: "1px solid #000",
    borderLeft: "none",
    borderRight: "none",
    borderRadius: 0,
    outline: "none",
    fontFamily: "system-ui, -apple-system, sans-serif",
    WebkitAppearance: "none",
    MozAppearance: "textfield",
  },
  reasonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  reasonBtn: {
    padding: "14px 8px",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.06em",
    border: "1px solid #000",
    borderRadius: 0,
    cursor: "pointer",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  confirmBtn: {
    width: "100%",
    padding: "18px 0",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.1em",
    backgroundColor: "#000",
    color: "#fff",
    border: "1px solid #000",
    borderRadius: 0,
    cursor: "pointer",
    marginBottom: 24,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  backLink: {
    display: "block",
    textAlign: "center",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#999",
    textDecoration: "none",
    padding: "12px 0",
  },
};
