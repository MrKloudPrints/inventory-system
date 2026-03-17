// ============================================================
// INVENTORY SEED DATA
// Source: Kloud Prints PO CF-4322025 (Nov 7, 2025)
// Manufacturer: Chimnot Fabrics, Pakistan
// Received: 858 units (invoiced 861, 3-unit variance)
// ============================================================

// IMPORT COST ALLOCATION
// Freight forwarder (ITC IN-28854):        $633.00
// Customs duties (CBP Entry JE8-1030747-8): $1,766.17
// Broker fees (WCS 1030747-01 excl duties): $885.52
// Total import costs:                       $3,284.69
//
// HS 6110.20.2010 — Hoodies: Sec 122 (10%) + 16.5% duty → $4.48/unit
// HS 6109.10.0012 — Tees:    Sec 122 (10%) + 16.5% duty + cotton fee → $2.34/unit

const H = { hs: "6110.20.2010", imp: 4.48 }; // hoodie import allocation
const T = { hs: "6109.10.0012", imp: 2.34 }; // tee import allocation

export const INITIAL_INVENTORY = [
  { sku: "CORE-CH-BLA-S",   style: "Standard Cropped Hoodie 320 GSM", color: "Black", size: "S",   received: 26, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-BLA-M",   style: "Standard Cropped Hoodie 320 GSM", color: "Black", size: "M",   received: 20, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-BLA-L",   style: "Standard Cropped Hoodie 320 GSM", color: "Black", size: "L",   received: 24, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-BLA-XL",  style: "Standard Cropped Hoodie 320 GSM", color: "Black", size: "XL",  received: 24, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-BLA-2XL", style: "Standard Cropped Hoodie 320 GSM", color: "Black", size: "2XL", received: 9,  mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-BRO-S",   style: "Standard Cropped Hoodie 320 GSM", color: "Brown", size: "S",   received: 22, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-BRO-M",   style: "Standard Cropped Hoodie 320 GSM", color: "Brown", size: "M",   received: 23, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-BRO-L",   style: "Standard Cropped Hoodie 320 GSM", color: "Brown", size: "L",   received: 24, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-BRO-XL",  style: "Standard Cropped Hoodie 320 GSM", color: "Brown", size: "XL",  received: 25, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-BRO-2XL", style: "Standard Cropped Hoodie 320 GSM", color: "Brown", size: "2XL", received: 11, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-RED-S",   style: "Standard Cropped Hoodie 320 GSM", color: "Red",   size: "S",   received: 24, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-RED-M",   style: "Standard Cropped Hoodie 320 GSM", color: "Red",   size: "M",   received: 27, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-RED-L",   style: "Standard Cropped Hoodie 320 GSM", color: "Red",   size: "L",   received: 27, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-RED-XL",  style: "Standard Cropped Hoodie 320 GSM", color: "Red",   size: "XL",  received: 24, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "CORE-CH-RED-2XL", style: "Standard Cropped Hoodie 320 GSM", color: "Red",   size: "2XL", received: 11, mfgCost: 9.84,  ...H, landed: 14.32, wholesale: 24, retail: 48 },
  { sku: "BLK2-CH-BLA-S",   style: "Premium Cropped Hoodie 530 GSM",  color: "Black", size: "S",   received: 18, mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-BLA-M",   style: "Premium Cropped Hoodie 530 GSM",  color: "Black", size: "M",   received: 16, mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-BLA-L",   style: "Premium Cropped Hoodie 530 GSM",  color: "Black", size: "L",   received: 15, mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-BLA-XL",  style: "Premium Cropped Hoodie 530 GSM",  color: "Black", size: "XL",  received: 19, mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-BLA-2XL", style: "Premium Cropped Hoodie 530 GSM",  color: "Black", size: "2XL", received: 7,  mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-PEA-S",   style: "Premium Cropped Hoodie 530 GSM",  color: "Peach", size: "S",   received: 22, mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-PEA-M",   style: "Premium Cropped Hoodie 530 GSM",  color: "Peach", size: "M",   received: 24, mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-PEA-L",   style: "Premium Cropped Hoodie 530 GSM",  color: "Peach", size: "L",   received: 23, mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-PEA-XL",  style: "Premium Cropped Hoodie 530 GSM",  color: "Peach", size: "XL",  received: 21, mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-PEA-2XL", style: "Premium Cropped Hoodie 530 GSM",  color: "Peach", size: "2XL", received: 6,  mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-BLU-S",   style: "Premium Cropped Hoodie 530 GSM",  color: "Blue",  size: "S",   received: 22, mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-BLU-M",   style: "Premium Cropped Hoodie 530 GSM",  color: "Blue",  size: "M",   received: 19, mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-BLU-L",   style: "Premium Cropped Hoodie 530 GSM",  color: "Blue",  size: "L",   received: 23, mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-BLU-XL",  style: "Premium Cropped Hoodie 530 GSM",  color: "Blue",  size: "XL",  received: 31, mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CH-BLU-2XL", style: "Premium Cropped Hoodie 530 GSM",  color: "Blue",  size: "2XL", received: 11, mfgCost: 15.95, ...H, landed: 20.43, wholesale: 42, retail: 85 },
  { sku: "BLK2-CT-BLA-S",   style: "Premium Crew Neck Tee",           color: "Black", size: "S",   received: 20, mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-BLA-M",   style: "Premium Crew Neck Tee",           color: "Black", size: "M",   received: 21, mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-BLA-L",   style: "Premium Crew Neck Tee",           color: "Black", size: "L",   received: 22, mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-BLA-XL",  style: "Premium Crew Neck Tee",           color: "Black", size: "XL",  received: 23, mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-BLA-2XL", style: "Premium Crew Neck Tee",           color: "Black", size: "2XL", received: 12, mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-PEA-S",   style: "Premium Crew Neck Tee",           color: "Peach", size: "S",   received: 19, mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-PEA-M",   style: "Premium Crew Neck Tee",           color: "Peach", size: "M",   received: 19, mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-PEA-L",   style: "Premium Crew Neck Tee",           color: "Peach", size: "L",   received: 20, mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-PEA-XL",  style: "Premium Crew Neck Tee",           color: "Peach", size: "XL",  received: 22, mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-PEA-2XL", style: "Premium Crew Neck Tee",           color: "Peach", size: "2XL", received: 9,  mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-BRO-S",   style: "Premium Crew Neck Tee",           color: "Brown", size: "S",   received: 14, mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-BRO-M",   style: "Premium Crew Neck Tee",           color: "Brown", size: "M",   received: 17, mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-BRO-L",   style: "Premium Crew Neck Tee",           color: "Brown", size: "L",   received: 19, mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-BRO-XL",  style: "Premium Crew Neck Tee",           color: "Brown", size: "XL",  received: 15, mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
  { sku: "BLK2-CT-BRO-2XL", style: "Premium Crew Neck Tee",           color: "Brown", size: "2XL", received: 8,  mfgCost: 6.60,  ...T, landed: 8.94,  wholesale: 18, retail: 38 },
];

export const COLOR_MAP = {
  Black: "#1a1a1a",
  Brown: "#6B4226",
  Red: "#C41E3A",
  Peach: "#FFCBA4",
  Blue: "#4A90D9",
};

export const SIZE_ORDER = ["S", "M", "L", "XL", "2XL"];
