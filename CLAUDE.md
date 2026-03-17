# CLAUDE.md — Project Instructions for Claude Code

## What This Is

An inventory management system for a premium apparel brand. Currently a working client-side React app (Next.js) with localStorage persistence. The next phase is converting to a full-stack app with a real database.

## Project Structure

```
inventory-system/
├── src/
│   ├── app/
│   │   ├── layout.js          # Root layout
│   │   ├── globals.css         # Tailwind + print styles
│   │   └── page.js             # Entry point, renders InventoryApp
│   ├── components/
│   │   └── InventoryApp.jsx    # Main inventory UI (all-in-one for now)
│   └── lib/
│       └── inventory-data.js   # Seed data, cost constants, color map
├── docs/
│   ├── INVENTORY_SYSTEM.md     # Full build spec (data model, routes, API, design system)
│   └── source-documents/       # Original invoices and PO spreadsheet
│       ├── kloud_inventory_comparison.xlsx
│       ├── ITC_freight_invoice_IN-28854.pdf
│       ├── WCS_broker_invoice_1030747-01.pdf
│       └── CBP_entry_summary_JE8-1030747-8.pdf
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── CLAUDE.md                   # (this file)
```

## Quick Start

```bash
npm install
npm run dev
```

Opens at http://localhost:3000

## Current State (Phase 1 — Client-Side)

The app currently runs entirely in the browser with localStorage. It supports:

- **Dashboard**: metric cards (SKUs, units, landed cost, wholesale value, retail value), removals breakdown, stock overview by product
- **Inventory grid**: filterable by style/color, quick add/remove with reason tracking (sale, sample, gift, damaged, return-to-vendor, etc.)
- **SKU detail**: full cost waterfall (mfg → import → landed → wholesale → retail), HS code, activity log
- **QR placards**: selectable grid with bulk print (inline print view, no popups), 3-up layout for letter paper
- **Activity log**: global movement history across all SKUs

## Inventory Data

45 SKUs across 3 product types, 858 total units from Kloud Prints PO CF-4322025:

| Product | Units | Mfg | Import | Landed | Wholesale | Retail | HS Code |
|---------|-------|-----|--------|--------|-----------|--------|---------|
| Standard Hoodie 320 GSM | 321 | $9.84 | $4.48 | $14.32 | $24 | $48 | 6110.20.2010 |
| Premium Hoodie 530 GSM | 277 | $15.95 | $4.48 | $20.43 | $42 | $85 | 6110.20.2010 |
| Premium Crew Neck Tee | 260 | $6.60 | $2.34 | $8.94 | $18 | $38 | 6109.10.0012 |

Import costs: freight $633 (ITC) + duties $1,766.17 (CBP) + broker $885.52 (WCS) = $3,284.69 total.
Duties appear on both the CBP entry summary and WCS broker invoice — same charge, do not double-count.

## Phase 2 — What to Build Next

Refer to `docs/INVENTORY_SYSTEM.md` for the full spec. Priority order:

1. **Add Prisma + PostgreSQL** — Define schema (Product, Variant, StockMovement, Placard), run migrations
2. **Seed script** — Load all 45 SKUs with quantities from `src/lib/inventory-data.js`
3. **API routes** — CRUD for inventory, stock movements, placard generation
4. **Refactor InventoryApp.jsx** — Break into smaller components, fetch from API instead of localStorage
5. **QR scanner page** — Mobile camera-based scanner using `html5-qrcode`
6. **Auth** — NextAuth.js with credentials provider
7. **CSV export** — Movement log download

## Design Rules

- Font: Helvetica Neue / system-ui. Tight letter-spacing on headers.
- Palette: Monochromatic black/white/gray. Color only for status (red = out of stock, amber = low, green = additions).
- All-caps + wide tracking for nav and section headers. Monospace for SKUs.
- Square buttons (no border-radius). Thin 1px borders, no shadows.
- Mobile-first for scan and quick stock adjustments.

## Key Business Rules

- Stock can never go below 0
- Every stock change creates a StockMovement record
- QR data encodes only the SKU identifier (not quantity) — quantity is fetched live
- Removal reasons: sale, sample, gift, damaged, return-to-vendor, other
- Addition reasons: restock, return, correction, new-shipment
