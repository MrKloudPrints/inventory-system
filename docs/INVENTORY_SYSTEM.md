# Inventory Management System — Claude Code Build Instructions

## Overview

Build a full-stack inventory management system for a premium apparel brand operating dual B2C retail and B2B wholesale channels. The system manages physical inventory of heavyweight blanks with QR-coded bin placards, stock tracking, and removal categorization.

---

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS
- **Database**: PostgreSQL (via Prisma ORM)
- **Auth**: NextAuth.js (credential-based for now, expandable)
- **QR Generation**: `qrcode` npm package (server-side SVG generation)
- **Deployment target**: Vercel + Supabase (or any Postgres host)

---

## Data Model

### `Product` (the style/garment type)
```
id              String    @id @default(cuid())
name            String    // e.g. "Premium Cropped Hoodie 530 GSM"
shortName       String    // e.g. "BLK2-CH"
tier            String    // "Premium" or "Core"
garmentType     String    // "hoodie" or "tee"
weight          String    // "530 GSM", "320 GSM", "400 GSM"
hsCode          String    // HTSUS code: "6110.20.2010" (hoodies) or "6109.10.0012" (tees)
mfgCost         Decimal   // manufacturer cost per unit (FOB Pakistan)
importCost      Decimal   // allocated import cost per unit (duties + freight + broker)
landedCost      Decimal   // mfgCost + importCost = total cost per unit in warehouse
wholesalePrice  Decimal   // B2B base price
retailPrice     Decimal   // B2C price
createdAt       DateTime  @default(now())
variants        Variant[]
```

### `Variant` (specific SKU = product + color + size)
```
id            String    @id @default(cuid())
sku           String    @unique  // e.g. "BLK2-CH-BLA-XL"
productId     String
product       Product   @relation(fields: [productId])
color         String    // "Black", "Brown", "Red", "Peach", "Blue"
size          String    // "S", "M", "L", "XL", "2XL"
initialStock  Int       // quantity received from manufacturer
currentStock  Int       // live count
reorderPoint  Int       @default(5)
createdAt     DateTime  @default(now())
movements     StockMovement[]
placards      Placard[]
```

### `StockMovement` (every add/remove is logged)
```
id            String    @id @default(cuid())
variantId     String
variant       Variant   @relation(fields: [variantId])
type          String    // "addition" | "removal" | "initial" | "adjustment"
quantity      Int       // always positive; type determines direction
reason        String    // "sale" | "sample" | "gift" | "damaged" | "return-to-vendor" | "restock" | "return" | "correction" | "new-shipment" | "initial-stock"
note          String?   // freeform, e.g. "Order #1234", "Instagram collab with @user"
resultingQty  Int       // stock level AFTER this movement
performedBy   String?   // user who made the change
createdAt     DateTime  @default(now())
```

### `Placard` (generated QR placard for a bin/shelf)
```
id            String    @id @default(cuid())
variantId     String
variant       Variant   @relation(fields: [variantId])
qrData        String    // encoded string: "INV|SKU|Style|Color|Size"
location      String?   // physical location, e.g. "Shelf A3", "Bin 12"
isActive      Boolean   @default(true)
createdAt     DateTime  @default(now())
lastPrinted   DateTime?
```

---

## Import Cost Breakdown

Costs derived from three source documents for shipment arriving March 8, 2026:

### Freight Forwarder — ITC (Invoice IN-28854, $633.00)
DDC Charge $330, AMS CDF $55, Chassis $50, Unloading $88, DAD $30, Port Security $30, D/O $50

### Customs Broker — WCS International (Invoice 1030747-01, $2,651.69)
Duties-ACH $1,766.17, ISF Bond $95, ABI Fee $15, Customs Clearance $150, Duty Disbursement $18.54, Handling $35, Single Entry Bond $95, Trucking $375, CC Fee $101.98

**Note**: Duties ($1,766.17) appear on both the CBP Entry Summary and the WCS broker invoice. They are the same charge — do not double-count. Broker service fees excluding duties = $885.52.

### Customs Duties by HS Code (CBP Form 7501, Entry JE8-1030747-8)

| HS Code | Description | Entered Value | Section 122 (10%) | Regular Duty (16.5%) | Other Fees | Total Duties |
|---------|-------------|---------------|-------------------|---------------------|------------|-------------|
| 6110.20.2010 | Hoodies (sweaters, knit/crochet, cotton) | $5,300 | $530.00 | $874.50 | $24.99 | $1,438.51 |
| 6109.10.0012 | T-shirts (cotton men's) | $1,201 | $120.10 | $198.17 | $7.35 | $327.66 |

### Allocated Import Cost Per Unit

Freight + broker fees ($1,518.52) split proportionally by entered value (81.5% hoodies / 18.5% tees). Duties allocated directly by HS code.

| Product | Units | Mfg Cost | Import/Unit | Landed Cost | Wholesale | Retail | Retail Margin |
|---------|-------|----------|-------------|-------------|-----------|--------|---------------|
| Standard Hoodie 320 GSM | 321 | $9.84 | $4.48 | $14.32 | $24 | $48 | 70% |
| Premium Hoodie 530 GSM | 277 | $15.95 | $4.48 | $20.43 | $42 | $85 | 76% |
| Premium Crew Neck Tee | 260 | $6.60 | $2.34 | $8.94 | $18 | $38 | 76% |

**Total import costs**: $3,284.69 (freight $633 + duties $1,766.17 + broker fees $885.52)

---

## Initial Seed Data

Seed the database from the Kloud Prints purchase order (858 total units received). Here are the exact quantities:

### Core Cropped Hoodie 320 GSM (mfg $9.84 → landed $14.32 | wholesale $24 | retail $48)
| Color | S | M | L | XL | 2XL |
|-------|---|---|---|----|----|
| Black | 26 | 20 | 24 | 24 | 9 |
| Brown | 22 | 23 | 24 | 25 | 11 |
| Red   | 24 | 27 | 27 | 24 | 11 |

### Premium Cropped Hoodie 530 GSM (mfg $15.95 → landed $20.43 | wholesale $42 | retail $85)
| Color | S | M | L | XL | 2XL |
|-------|---|---|---|----|----|
| Black | 18 | 16 | 15 | 19 | 7 |
| Peach | 22 | 24 | 23 | 21 | 6 |
| Blue  | 22 | 19 | 23 | 31 | 11 |

### Premium Crew Neck Tee (mfg $6.60 → landed $8.94 | wholesale $18 | retail $38)
| Color | S | M | L | XL | 2XL |
|-------|---|---|---|----|----|
| Black | 20 | 21 | 22 | 23 | 12 |
| Peach | 19 | 19 | 20 | 22 | 9 |
| Brown | 14 | 17 | 19 | 15 | 8 |

**SKU format**: `{TIER_CODE}-{GARMENT_CODE}-{COLOR_3LETTER}-{SIZE}`
- Core Hoodie: `CORE-CH-BLA-S`, `CORE-CH-BRO-M`, etc.
- Premium Hoodie: `BLK2-CH-BLA-S`, `BLK2-CH-PEA-L`, etc.
- Premium Tee: `BLK2-CT-BLA-S`, `BLK2-CT-BRO-XL`, etc.

---

## Pages & Routes

### `/` — Dashboard
- Summary metric cards: total SKUs (45), total units in stock, units removed, inventory cost (landed), wholesale value, retail value
- Removals breakdown by reason (sale, sample, gift, damaged, etc.)
- Stock overview grouped by product → color → size with color-coded quantity badges
- Low stock alerts (items at or below reorder point)

### `/inventory` — Full Inventory Grid
- Filterable by style, color, size
- Each item card shows: SKU, color swatch, size, current stock / initial stock
- Quick action buttons: − Remove, + Add
- Click through to detail view

### `/inventory/[sku]` — SKU Detail
- Full item info: SKU, style, color, size, unit cost, current stock, initial stock
- Large stock count with color indicators (red = 0, amber = ≤5, normal otherwise)
- Remove stock / Add stock buttons open modal
- Generate/print QR placard button
- Complete activity log for this SKU (chronological, newest first)

### `/placards` — Placard Management
- Grid of all placards, filterable by style and color
- Each placard card shows: QR code, SKU, color swatch, size, current quantity
- Click to open print-ready placard modal
- Bulk print option: select multiple placards and print all on one page (4-up or 6-up layout)
- Assign physical locations to placards

### `/log` — Activity Log
- Global log of all stock movements across all SKUs
- Filterable by: date range, SKU, movement type, reason
- Columns: timestamp, SKU, type (+/-), quantity, reason, note, resulting qty, performed by
- Export to CSV

### `/scan` — QR Scanner Page
- Mobile-friendly camera-based QR scanner (use `html5-qrcode` or `@zxing/browser`)
- On scan: decode SKU from QR data, redirect to `/inventory/[sku]`
- Quick action overlay: immediately show current stock count + quick remove/add buttons
- Fallback: manual SKU text input with lookup button

---

## QR Placard Design

Each placard is a printable card (4" × 3") designed for bin/shelf labeling:

```
┌─────────────────────────────────┐
│        I N V E N T O R Y          │  ← header, letter-spaced
│        BLK2-CH-BLA-XL           │  ← SKU in monospace
│                                  │
│          ┌──────────┐            │
│          │  QR CODE │            │  ← encodes: INV|SKU|Style|Color|Size
│          └──────────┘            │
│                                  │
│  Premium Cropped Hoodie 530 GSM   │  ← style name
│                                  │
│   ● Black      XL      19       │  ← color swatch + size + current qty
│                                  │
│  Scan to check stock             │  ← instruction footer
└─────────────────────────────────┘
```

QR encodes: `INV|{SKU}|{STYLE}|{COLOR}|{SIZE}`

Do NOT encode quantity in the QR — the QR is a permanent identifier; quantity is looked up live on scan.

---

## Stock Movement Modal

When removing or adding stock, present a modal with:

1. **Quantity** — number input, default 1
2. **Reason** — button group selection:
   - **Removal reasons**: `sale`, `sample`, `gift`, `damaged`, `return-to-vendor`, `other`
   - **Addition reasons**: `restock`, `return`, `correction`, `new-shipment`
3. **Note** — optional freeform text (e.g. "Order #1234", "Gifted to @influencer", "B2B order for BrandX")
4. **Confirm / Cancel** buttons

Every movement creates a `StockMovement` record and updates `Variant.currentStock`.

---

## API Routes

```
GET    /api/inventory              — list all variants with current stock
GET    /api/inventory/[sku]        — single variant detail + recent movements
POST   /api/inventory/[sku]/remove — remove stock { quantity, reason, note }
POST   /api/inventory/[sku]/add    — add stock { quantity, reason, note }
GET    /api/movements              — global movement log (paginated, filterable)
GET    /api/movements/export       — CSV export of movement log
GET    /api/placards/[sku]         — generate placard SVG/PDF for a variant
POST   /api/placards/bulk-print    — generate multi-placard print layout
GET    /api/dashboard/stats        — aggregated dashboard metrics
POST   /api/scan                   — decode QR data, return variant info
```

---

## Design System

The UI should follow a clean, industrial aesthetic:

- **Font**: `'Helvetica Neue'`, system-ui fallback. Tight tracking on headers.
- **Palette**: Monochromatic — black (#1a1a1a), white (#fff), neutral grays. Minimal accent colors only for status indicators.
- **Status colors**: Red for out-of-stock / removals, amber for low stock / warnings, green for additions / healthy stock
- **Typography**: All-caps with wide letter-spacing for section headers and navigation. Monospace for SKUs and technical data.
- **Spacing**: Generous whitespace. Clean grid layouts. No rounded corners on buttons (square/sharp edges). Subtle borders.
- **Cards**: Thin 1px borders, no shadows. Hover state = darker border.
- **Buttons**: Square, outlined by default. Filled black for primary actions. Wide letter-spacing on labels.
- **Mobile-first**: The scan page and quick stock adjustments must work perfectly on phone screens.

---

## Key Behaviors

1. **Stock can never go below 0** — clamp at zero on removal
2. **Every stock change is logged** — no silent mutations
3. **QR data is static** — only the SKU identifier, never the quantity (quantity is fetched live)
4. **Placards are reprintable** — regenerate anytime with current location info
5. **Movement notes are searchable** — for tracing specific orders or events
6. **Session-based auth** — simple username/password for now, expandable to team roles later

---

## Future Expansion Hooks (don't build yet, but design schema to support)

- **B2B wholesale orders** — link stock removals to wholesale order records
- **Shopify integration** — auto-deduct stock on Shopify sale via webhook
- **Multi-location** — track which warehouse/shelf each variant lives in
- **Batch/lot tracking** — trace units back to specific shipments (e.g. Kloud Prints PO CF-4322025)
- **Team roles** — admin, warehouse staff, viewer permissions
- **Barcode support** — UPC/EAN alongside QR for retail POS
- **Analytics dashboard** — sell-through rates, velocity by SKU, reorder predictions

---

## Build Order

1. Initialize Next.js project with Tailwind, Prisma, PostgreSQL
2. Define Prisma schema and run migrations
3. Create seed script with all 45 SKUs and initial quantities from above
4. Build API routes (inventory CRUD, movements, placards)
5. Build dashboard page with metrics and product overview
6. Build inventory grid with filtering and quick actions
7. Build SKU detail page with activity log
8. Build stock movement modal (remove/add with reasons)
9. Build placard generation (QR + print layout)
10. Build QR scanner page for mobile
11. Build global activity log with filtering and CSV export
12. Add auth (NextAuth.js with credentials provider)
13. Test full flow: scan → view → remove → verify log → reprint placard
14. Deploy to Vercel

---

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

---

## Notes

- The manufacturer is **Chimnot Fabrics, Pakistan** — Invoice #CF-4322025, dated Nov 7, 2025
- Original PO was for 861 units; 858 were received (3-unit variance, net $172.92 short)
- The `initialStock` values in the seed data reflect **received** quantities, not invoiced
- SKU naming follows the pattern established in the brand strategy: tier prefix + garment code + 3-letter color + size
