"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";

// COST BREAKDOWN (from Kloud Prints PO + ITC freight + WCS customs broker + CBP duties)
// Freight forwarder (ITC IN-28854): $633.00 | Customs duties (CBP 7501): $1,766.17 | Broker fees (WCS 1030747-01 excl duties): $885.52
// Hoodies — HS 6110.20.2010: Section 122 10% + 16.5% duty — import cost $4.48/unit
// Tees — HS 6109.10.0012: Section 122 10% + 16.5% duty + cotton fee — import cost $2.34/unit
const H = {hs:"6110.20.2010",imp:4.48}; // hoodie import allocation
const T = {hs:"6109.10.0012",imp:2.34}; // tee import allocation

const INITIAL_INVENTORY = [
  {sku:"CORE-CH-BLA-S",style:"Standard Cropped Hoodie 320 GSM",color:"Black",size:"S",received:26,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-BLA-M",style:"Standard Cropped Hoodie 320 GSM",color:"Black",size:"M",received:20,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-BLA-L",style:"Standard Cropped Hoodie 320 GSM",color:"Black",size:"L",received:24,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-BLA-XL",style:"Standard Cropped Hoodie 320 GSM",color:"Black",size:"XL",received:24,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-BLA-2XL",style:"Standard Cropped Hoodie 320 GSM",color:"Black",size:"2XL",received:9,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-BRO-S",style:"Standard Cropped Hoodie 320 GSM",color:"Brown",size:"S",received:22,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-BRO-M",style:"Standard Cropped Hoodie 320 GSM",color:"Brown",size:"M",received:23,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-BRO-L",style:"Standard Cropped Hoodie 320 GSM",color:"Brown",size:"L",received:24,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-BRO-XL",style:"Standard Cropped Hoodie 320 GSM",color:"Brown",size:"XL",received:25,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-BRO-2XL",style:"Standard Cropped Hoodie 320 GSM",color:"Brown",size:"2XL",received:11,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-RED-S",style:"Standard Cropped Hoodie 320 GSM",color:"Red",size:"S",received:24,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-RED-M",style:"Standard Cropped Hoodie 320 GSM",color:"Red",size:"M",received:27,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-RED-L",style:"Standard Cropped Hoodie 320 GSM",color:"Red",size:"L",received:27,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-RED-XL",style:"Standard Cropped Hoodie 320 GSM",color:"Red",size:"XL",received:24,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"CORE-CH-RED-2XL",style:"Standard Cropped Hoodie 320 GSM",color:"Red",size:"2XL",received:11,mfgCost:9.84,...H,landed:14.32,wholesale:24,retail:48},
  {sku:"BLK2-CH-BLA-S",style:"Premium Cropped Hoodie 530 GSM",color:"Black",size:"S",received:18,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-BLA-M",style:"Premium Cropped Hoodie 530 GSM",color:"Black",size:"M",received:16,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-BLA-L",style:"Premium Cropped Hoodie 530 GSM",color:"Black",size:"L",received:15,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-BLA-XL",style:"Premium Cropped Hoodie 530 GSM",color:"Black",size:"XL",received:19,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-BLA-2XL",style:"Premium Cropped Hoodie 530 GSM",color:"Black",size:"2XL",received:7,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-PEA-S",style:"Premium Cropped Hoodie 530 GSM",color:"Peach",size:"S",received:22,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-PEA-M",style:"Premium Cropped Hoodie 530 GSM",color:"Peach",size:"M",received:24,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-PEA-L",style:"Premium Cropped Hoodie 530 GSM",color:"Peach",size:"L",received:23,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-PEA-XL",style:"Premium Cropped Hoodie 530 GSM",color:"Peach",size:"XL",received:21,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-PEA-2XL",style:"Premium Cropped Hoodie 530 GSM",color:"Peach",size:"2XL",received:6,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-BLU-S",style:"Premium Cropped Hoodie 530 GSM",color:"Blue",size:"S",received:22,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-BLU-M",style:"Premium Cropped Hoodie 530 GSM",color:"Blue",size:"M",received:19,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-BLU-L",style:"Premium Cropped Hoodie 530 GSM",color:"Blue",size:"L",received:23,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-BLU-XL",style:"Premium Cropped Hoodie 530 GSM",color:"Blue",size:"XL",received:31,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CH-BLU-2XL",style:"Premium Cropped Hoodie 530 GSM",color:"Blue",size:"2XL",received:11,mfgCost:15.95,...H,landed:20.43,wholesale:42,retail:85},
  {sku:"BLK2-CT-BLA-S",style:"Premium Crew Neck Tee",color:"Black",size:"S",received:20,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-BLA-M",style:"Premium Crew Neck Tee",color:"Black",size:"M",received:21,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-BLA-L",style:"Premium Crew Neck Tee",color:"Black",size:"L",received:22,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-BLA-XL",style:"Premium Crew Neck Tee",color:"Black",size:"XL",received:23,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-BLA-2XL",style:"Premium Crew Neck Tee",color:"Black",size:"2XL",received:12,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-PEA-S",style:"Premium Crew Neck Tee",color:"Peach",size:"S",received:19,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-PEA-M",style:"Premium Crew Neck Tee",color:"Peach",size:"M",received:19,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-PEA-L",style:"Premium Crew Neck Tee",color:"Peach",size:"L",received:20,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-PEA-XL",style:"Premium Crew Neck Tee",color:"Peach",size:"XL",received:22,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-PEA-2XL",style:"Premium Crew Neck Tee",color:"Peach",size:"2XL",received:9,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-BRO-S",style:"Premium Crew Neck Tee",color:"Brown",size:"S",received:14,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-BRO-M",style:"Premium Crew Neck Tee",color:"Brown",size:"M",received:17,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-BRO-L",style:"Premium Crew Neck Tee",color:"Brown",size:"L",received:19,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-BRO-XL",style:"Premium Crew Neck Tee",color:"Brown",size:"XL",received:15,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
  {sku:"BLK2-CT-BRO-2XL",style:"Premium Crew Neck Tee",color:"Brown",size:"2XL",received:8,mfgCost:6.60,...T,landed:8.94,wholesale:18,retail:38},
];

const COLOR_MAP = {
  Black:"#1a1a1a", Brown:"#6B4226", Red:"#C41E3A",
  Peach:"#FFCBA4", Blue:"#4A90D9"
};

const SIZE_ORDER = ["S","M","L","XL","2XL"];

function QRSvg({ text, size = 100 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current && text) {
      QRCode.toCanvas(canvasRef.current, text, {
        width: size,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
    }
  }, [text, size]);
  return <canvas ref={canvasRef} width={size} height={size} />;
}

function PlacardModal({ item, onClose }) {
  const ref = useRef();
  if (!item) return null;

  const qrData = typeof window !== "undefined" ? `${window.location.origin}/scan/${encodeURIComponent(item.sku)}` : item.sku;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:0,padding:0,maxWidth:560,width:"100%",color:"#000"}} onClick={e => e.stopPropagation()}>
        <div ref={ref}>
          <div style={{border:"2px solid #000",padding:24,fontFamily:"'Helvetica Neue', Arial, sans-serif",display:"flex",alignItems:"center",gap:24}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
              <QRSvg text={qrData} size={120} />
              <div style={{fontSize:9,letterSpacing:3,color:"#666",marginTop:6}}>{item.sku}</div>
            </div>
            <div style={{flex:1}}>
              <h1 style={{fontSize:16,letterSpacing:6,fontWeight:800,margin:"0 0 2px",color:"#000"}}>INVENTORY</h1>
              <div style={{fontSize:12,fontWeight:600,margin:"0 0 12px",color:"#000"}}>{item.style}</div>
              <div style={{display:"flex",gap:20,borderTop:"1px solid #ccc",paddingTop:12}}>
                <div>
                  <div style={{fontSize:9,letterSpacing:2,color:"#999",textTransform:"uppercase"}}>Color</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                    <span style={{width:14,height:14,borderRadius:"50%",background:COLOR_MAP[item.color]||"#888",border:"1px solid #ccc",display:"inline-block"}}/>
                    <span style={{fontSize:14,fontWeight:700,color:"#000"}}>{item.color}</span>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:9,letterSpacing:2,color:"#999",textTransform:"uppercase"}}>Size</div>
                  <div style={{fontSize:22,fontWeight:800,marginTop:2,color:"#000"}}>{item.size}</div>
                </div>
                <div>
                  <div style={{fontSize:9,letterSpacing:2,color:"#999",textTransform:"uppercase"}}>In stock</div>
                  <div style={{fontSize:22,fontWeight:800,marginTop:2,color:"#000"}}>{item.current}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:20,marginTop:10,borderTop:"1px solid #eee",paddingTop:10}}>
                <div>
                  <div style={{fontSize:9,letterSpacing:2,color:"#999",textTransform:"uppercase"}}>Wholesale</div>
                  <div style={{fontSize:16,fontWeight:700,marginTop:2,color:"#000"}}>${item.wholesale}</div>
                </div>
                <div>
                  <div style={{fontSize:9,letterSpacing:2,color:"#999",textTransform:"uppercase"}}>Retail</div>
                  <div style={{fontSize:16,fontWeight:700,marginTop:2,color:"#000"}}>${item.retail}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:0}}>
          <button onClick={onClose} style={{flex:1,padding:"14px",background:"#f5f5f5",color:"#000",border:"none",fontSize:13,letterSpacing:2,fontWeight:600,cursor:"pointer"}}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

export default function BlnkthryInventory() {
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem("stock_inv");
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY.map(i => ({...i, current: i.received, log: [{type:"initial",qty:i.received,date:new Date().toISOString(),reason:"Initial stock from Kloud Prints PO"}]}));
    } catch {
      return INITIAL_INVENTORY.map(i => ({...i, current: i.received, log: [{type:"initial",qty:i.received,date:new Date().toISOString(),reason:"Initial stock from Kloud Prints PO"}]}));
    }
  });

  const [view, setView] = useState("dashboard");
  const [selectedSku, setSelectedSku] = useState(null);
  const [filterStyle, setFilterStyle] = useState("all");
  const [filterColor, setFilterColor] = useState("all");
  const [placardItem, setPlacardItem] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [actionQty, setActionQty] = useState(1);
  const [actionReason, setActionReason] = useState("sale");
  const [actionNote, setActionNote] = useState("");
  const [toast, setToast] = useState(null);
  const [scannedSku, setScannedSku] = useState("");
  const [selectedPlacards, setSelectedPlacards] = useState(new Set());
  const [printView, setPrintView] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [editPriceValue, setEditPriceValue] = useState("");

  useEffect(() => {
    try { localStorage.setItem("stock_inv", JSON.stringify(inventory)); } catch {}
  }, [inventory]);

  const showToast = (msg, type="success") => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 2500);
  };

  const styles = [...new Set(inventory.map(i => i.style))];
  const colors = [...new Set(inventory.map(i => i.color))];

  const filtered = inventory.filter(i =>
    (filterStyle === "all" || i.style === filterStyle) &&
    (filterColor === "all" || i.color === filterColor)
  ).sort((a, b) => {
    if (a.style !== b.style) return a.style.localeCompare(b.style);
    if (a.color !== b.color) return a.color.localeCompare(b.color);
    return SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size);
  });

  const totalUnits = inventory.reduce((s, i) => s + i.current, 0);
  const totalLandedValue = inventory.reduce((s, i) => s + i.current * i.landed, 0);
  const totalRetailValue = inventory.reduce((s, i) => s + i.current * i.retail, 0);
  const totalWholesaleValue = inventory.reduce((s, i) => s + i.current * i.wholesale, 0);
  const totalReceived = inventory.reduce((s, i) => s + i.received, 0);
  const totalRemoved = totalReceived - totalUnits;

  const allLogs = inventory.flatMap(i => i.log.map(l => ({...l, sku: i.sku, style: i.style, color: i.color, size: i.size}))).sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleRemove = (sku) => {
    setActionModal({type:"remove", sku});
    setActionQty(1);
    setActionReason("sale");
    setActionNote("");
  };

  const handleAdd = (sku) => {
    setActionModal({type:"add", sku});
    setActionQty(1);
    setActionReason("restock");
    setActionNote("");
  };

  const confirmAction = () => {
    if (!actionModal) return;
    const qty = parseInt(actionQty);
    if (isNaN(qty) || qty < 1) return;
    const {type, sku} = actionModal;

    setInventory(prev => prev.map(item => {
      if (item.sku !== sku) return item;
      const newQty = type === "remove" ? Math.max(0, item.current - qty) : item.current + qty;
      const logEntry = {
        type: type === "remove" ? "removal" : "addition",
        qty,
        date: new Date().toISOString(),
        reason: actionReason,
        note: actionNote || undefined,
        newTotal: newQty
      };
      return {...item, current: newQty, log: [...item.log, logEntry]};
    }));
    showToast(`${type === "remove" ? "Removed" : "Added"} ${qty} unit${qty > 1 ? "s" : ""} — ${sku} (${actionReason})`);
    setActionModal(null);
  };

  const startEditPrice = (sku, field) => {
    const item = inventory.find(i => i.sku === sku);
    if (!item) return;
    setEditingPrice({sku, field});
    setEditPriceValue(String(item[field]));
  };

  const confirmEditPrice = () => {
    if (!editingPrice) return;
    const val = parseFloat(editPriceValue);
    if (isNaN(val) || val < 0) return;
    const {sku, field} = editingPrice;
    setInventory(prev => prev.map(item => {
      if (item.sku !== sku) return item;
      const logEntry = {
        type: "price-change",
        qty: 0,
        date: new Date().toISOString(),
        reason: `${field} changed from $${item[field]} to $${val}`,
        newTotal: item.current
      };
      return {...item, [field]: val, log: [...item.log, logEntry]};
    }));
    showToast(`Updated ${editingPrice.field} to $${val} — ${sku}`);
    setEditingPrice(null);
  };

  const handleScan = () => {
    const parts = scannedSku.split("|");
    const sku = parts.length > 1 ? parts[1] : scannedSku.trim();
    const item = inventory.find(i => i.sku === sku);
    if (item) {
      setSelectedSku(sku);
      setView("detail");
      setScannedSku("");
    } else {
      showToast(`SKU "${sku}" not found`, "error");
    }
  };

  const resetInventory = () => {
    if (confirm("Reset all inventory to initial stock levels? This cannot be undone.")) {
      const fresh = INITIAL_INVENTORY.map(i => ({...i, current: i.received, log: [{type:"initial",qty:i.received,date:new Date().toISOString(),reason:"Reset to initial stock"}]}));
      setInventory(fresh);
      showToast("Inventory reset to initial stock levels");
    }
  };

  const selectedItem = selectedSku ? inventory.find(i => i.sku === selectedSku) : null;

  const groupedByStyleColor = {};
  filtered.forEach(item => {
    const key = `${item.style}|${item.color}`;
    if (!groupedByStyleColor[key]) groupedByStyleColor[key] = [];
    groupedByStyleColor[key].push(item);
  });

  const removalsByReason = {};
  allLogs.filter(l => l.type === "removal").forEach(l => {
    removalsByReason[l.reason] = (removalsByReason[l.reason] || 0) + l.qty;
  });

  return (
    <div style={{fontFamily:"'Helvetica Neue', system-ui, -apple-system, sans-serif", maxWidth:900, margin:"0 auto", color:"var(--color-text-primary, #111)"}}>
      {toast && (
        <div style={{position:"fixed",top:16,right:16,zIndex:1000,padding:"12px 20px",background:toast.type==="error"?"#C41E3A":"#1a1a1a",color:"#fff",fontSize:13,letterSpacing:1,fontWeight:500,boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>
          {toast.msg}
        </div>
      )}

      <div style={{borderBottom:"1px solid var(--color-border-tertiary, #ddd)",padding:"20px 0 16px",marginBottom:24}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:800,letterSpacing:6,margin:0}}>INVENTORY</h1>
            <p style={{fontSize:11,letterSpacing:3,color:"var(--color-text-secondary, #888)",margin:"4px 0 0",textTransform:"uppercase"}}>Stock management system</p>
          </div>
          <div style={{display:"flex",gap:2}}>
            {["dashboard","inventory","placards","log"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding:"8px 16px",fontSize:11,letterSpacing:2,textTransform:"uppercase",fontWeight:view===v?700:400,
                background:view===v?"#1a1a1a":"transparent",color:view===v?"#fff":"var(--color-text-secondary, #666)",
                border:"1px solid "+(view===v?"#1a1a1a":"var(--color-border-tertiary, #ddd)"),cursor:"pointer"
              }}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{marginBottom:20,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <input value={scannedSku} onChange={e => setScannedSku(e.target.value)} onKeyDown={e => e.key==="Enter" && handleScan()}
          placeholder="Scan QR or enter SKU..." style={{flex:1,minWidth:200,padding:"10px 14px",fontSize:13,border:"1px solid var(--color-border-tertiary, #ddd)",background:"var(--color-background-primary, #fff)",color:"var(--color-text-primary, #111)",fontFamily:"monospace",letterSpacing:1}} />
        <button onClick={handleScan} style={{padding:"10px 20px",fontSize:11,letterSpacing:2,background:"#1a1a1a",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}}>LOOKUP</button>
      </div>

      {view === "dashboard" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:12,marginBottom:28}}>
            {[
              {label:"Total SKUs", val:inventory.length},
              {label:"Units in stock", val:totalUnits.toLocaleString()},
              {label:"Units removed", val:totalRemoved.toLocaleString()},
              {label:"Cost (landed)", val:`$${totalLandedValue.toLocaleString(undefined,{minimumFractionDigits:2})}`},
              {label:"Wholesale value", val:`$${totalWholesaleValue.toLocaleString(undefined,{minimumFractionDigits:2})}`},
              {label:"Retail value", val:`$${totalRetailValue.toLocaleString(undefined,{minimumFractionDigits:2})}`},
            ].map(({label,val}) => (
              <div key={label} style={{background:"var(--color-background-secondary, #f8f8f6)",borderRadius:"var(--border-radius-md, 8px)",padding:"16px 20px"}}>
                <div style={{fontSize:11,letterSpacing:2,color:"var(--color-text-secondary, #999)",textTransform:"uppercase",marginBottom:4}}>{label}</div>
                <div style={{fontSize:22,fontWeight:700}}>{val}</div>
              </div>
            ))}
          </div>

          {Object.keys(removalsByReason).length > 0 && (
            <div style={{marginBottom:28}}>
              <h3 style={{fontSize:13,letterSpacing:2,textTransform:"uppercase",color:"var(--color-text-secondary, #888)",marginBottom:12,fontWeight:500}}>Removals breakdown</h3>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                {Object.entries(removalsByReason).map(([reason, qty]) => (
                  <div key={reason} style={{background:"var(--color-background-secondary, #f8f8f6)",borderRadius:"var(--border-radius-md, 8px)",padding:"12px 20px",minWidth:120}}>
                    <div style={{fontSize:10,letterSpacing:2,color:"var(--color-text-secondary, #999)",textTransform:"uppercase",marginBottom:2}}>{reason}</div>
                    <div style={{fontSize:18,fontWeight:700}}>{qty}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 style={{fontSize:13,letterSpacing:2,textTransform:"uppercase",color:"var(--color-text-secondary, #888)",marginBottom:12,fontWeight:500}}>Stock by product</h3>
          {styles.map(style => {
            const styleItems = inventory.filter(i => i.style === style);
            const styleTotal = styleItems.reduce((s, i) => s + i.current, 0);
            const styleReceived = styleItems.reduce((s, i) => s + i.received, 0);
            return (
              <div key={style} style={{marginBottom:16,border:"1px solid var(--color-border-tertiary, #eee)",borderRadius:"var(--border-radius-md, 8px)",overflow:"hidden"}}>
                <div style={{padding:"12px 16px",background:"var(--color-background-secondary, #f8f8f6)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:600}}>{style}</span>
                  <span style={{fontSize:12,color:"var(--color-text-secondary, #888)"}}>{styleTotal} / {styleReceived} in stock</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))",gap:1,background:"var(--color-border-tertiary, #eee)"}}>
                  {[...new Set(styleItems.map(i => i.color))].map(color => {
                    const colorItems = styleItems.filter(i => i.color === color);
                    const colorTotal = colorItems.reduce((s, i) => s + i.current, 0);
                    return (
                      <div key={color} style={{background:"var(--color-background-primary, #fff)",padding:"12px",cursor:"pointer"}} onClick={() => { setFilterStyle(style); setFilterColor(color); setView("inventory"); }}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                          <span style={{width:10,height:10,borderRadius:"50%",background:COLOR_MAP[color]||"#888",border:"1px solid rgba(0,0,0,0.1)",flexShrink:0}}/>
                          <span style={{fontSize:12,fontWeight:600}}>{color}</span>
                        </div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          {colorItems.sort((a,b) => SIZE_ORDER.indexOf(a.size)-SIZE_ORDER.indexOf(b.size)).map(i => (
                            <span key={i.sku} style={{fontSize:10,padding:"2px 6px",background: i.current === 0 ? "var(--color-background-danger, #fee)" : i.current <= 5 ? "var(--color-background-warning, #fff8e1)" : "var(--color-background-secondary, #f5f5f3)",borderRadius:3,fontFamily:"monospace",color: i.current === 0 ? "var(--color-text-danger, #c00)" : "var(--color-text-primary, #333)"}}>
                              {i.size}:{i.current}
                            </span>
                          ))}
                        </div>
                        <div style={{fontSize:11,color:"var(--color-text-secondary, #999)",marginTop:6}}>{colorTotal} total</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <button onClick={resetInventory} style={{marginTop:20,padding:"8px 16px",fontSize:10,letterSpacing:2,color:"var(--color-text-danger, #c00)",background:"transparent",border:"1px solid var(--color-border-tertiary, #ddd)",cursor:"pointer",textTransform:"uppercase"}}>Reset inventory</button>
        </div>
      )}

      {view === "inventory" && !selectedItem && (
        <div>
          <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
            <select value={filterStyle} onChange={e => setFilterStyle(e.target.value)} style={{padding:"8px 12px",fontSize:12,border:"1px solid var(--color-border-tertiary, #ddd)",background:"var(--color-background-primary, #fff)",color:"var(--color-text-primary, #111)"}}>
              <option value="all">All styles</option>
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterColor} onChange={e => setFilterColor(e.target.value)} style={{padding:"8px 12px",fontSize:12,border:"1px solid var(--color-border-tertiary, #ddd)",background:"var(--color-background-primary, #fff)",color:"var(--color-text-primary, #111)"}}>
              <option value="all">All colors</option>
              {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => {setFilterStyle("all"); setFilterColor("all");}} style={{padding:"8px 12px",fontSize:11,letterSpacing:1,background:"transparent",border:"1px solid var(--color-border-tertiary, #ddd)",cursor:"pointer",color:"var(--color-text-secondary, #888)"}}>Clear filters</button>
          </div>

          {Object.entries(groupedByStyleColor).map(([key, items]) => {
            const [style, color] = key.split("|");
            return (
              <div key={key} style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{width:12,height:12,borderRadius:"50%",background:COLOR_MAP[color]||"#888",border:"1px solid rgba(0,0,0,0.1)"}}/>
                  <span style={{fontSize:13,fontWeight:600}}>{style}</span>
                  <span style={{fontSize:12,color:"var(--color-text-secondary, #999)"}}>— {color}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))",gap:8}}>
                  {items.sort((a,b) => SIZE_ORDER.indexOf(a.size)-SIZE_ORDER.indexOf(b.size)).map(item => (
                    <div key={item.sku} onClick={() => { setSelectedSku(item.sku); setView("detail"); }}
                      style={{border:"1px solid var(--color-border-tertiary, #eee)",borderRadius:"var(--border-radius-md, 8px)",padding:"14px",cursor:"pointer",background: item.current===0?"var(--color-background-danger, #fff5f5)":"var(--color-background-primary, #fff)",
                        transition:"border-color 0.15s",position:"relative"}}
                      onMouseOver={e => e.currentTarget.style.borderColor="var(--color-border-primary, #999)"}
                      onMouseOut={e => e.currentTarget.style.borderColor="var(--color-border-tertiary, #eee)"}>
                      <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>{item.size}</div>
                      <div style={{fontSize:11,fontFamily:"monospace",color:"var(--color-text-secondary, #999)",marginBottom:8}}>{item.sku}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                        <span style={{fontSize:24,fontWeight:800,color: item.current===0?"var(--color-text-danger, #c00)": item.current<=5?"var(--color-text-warning, #b8860b)":"var(--color-text-primary, #111)"}}>{item.current}</span>
                        <span style={{fontSize:11,color:"var(--color-text-secondary, #999)"}}>/ {item.received}</span>
                      </div>
                      <div style={{display:"flex",gap:4,marginTop:10}}>
                        <button onClick={e => {e.stopPropagation(); handleRemove(item.sku);}} style={{flex:1,padding:"6px",fontSize:10,letterSpacing:1,background:"transparent",border:"1px solid var(--color-border-tertiary, #ddd)",cursor:"pointer",color:"var(--color-text-primary, #111)"}}>− REMOVE</button>
                        <button onClick={e => {e.stopPropagation(); handleAdd(item.sku);}} style={{flex:1,padding:"6px",fontSize:10,letterSpacing:1,background:"transparent",border:"1px solid var(--color-border-tertiary, #ddd)",cursor:"pointer",color:"var(--color-text-primary, #111)"}}>+ ADD</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "detail" && selectedItem && (
        <div>
          <button onClick={() => { setSelectedSku(null); setView("inventory"); }} style={{marginBottom:16,padding:"8px 16px",fontSize:11,letterSpacing:2,background:"transparent",border:"1px solid var(--color-border-tertiary, #ddd)",cursor:"pointer",color:"var(--color-text-secondary, #888)"}}>← BACK</button>
          <div style={{border:"1px solid var(--color-border-tertiary, #eee)",borderRadius:"var(--border-radius-md, 8px)",padding:24,marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16}}>
              <div>
                <div style={{fontSize:11,fontFamily:"monospace",color:"var(--color-text-secondary, #999)",letterSpacing:2,marginBottom:4}}>{selectedItem.sku}</div>
                <h2 style={{fontSize:18,fontWeight:700,margin:"0 0 4px"}}>{selectedItem.style}</h2>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:14,height:14,borderRadius:"50%",background:COLOR_MAP[selectedItem.color]||"#888",border:"1px solid rgba(0,0,0,0.1)"}}/>
                  <span style={{fontSize:14}}>{selectedItem.color} — {selectedItem.size}</span>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:36,fontWeight:800,color: selectedItem.current===0?"var(--color-text-danger, #c00)":selectedItem.current<=5?"var(--color-text-warning, #b8860b)":"var(--color-text-primary, #111)"}}>{selectedItem.current}</div>
                <div style={{fontSize:11,color:"var(--color-text-secondary, #999)"}}>of {selectedItem.received} received</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(100px, 1fr))",gap:8,marginTop:16,padding:"12px 0",borderTop:"1px solid var(--color-border-tertiary, #eee)"}}>
              {[
                {label:"Mfg cost",val:`$${selectedItem.mfgCost.toFixed(2)}`},
                {label:"Import",val:`$${selectedItem.imp.toFixed(2)}`},
                {label:"Landed",val:`$${selectedItem.landed.toFixed(2)}`},
                {label:"Wholesale",val:`$${selectedItem.wholesale}`,editable:"wholesale"},
                {label:"Retail",val:`$${selectedItem.retail}`,editable:"retail"},
                {label:"Margin (retail)",val:`${Math.round((selectedItem.retail - selectedItem.landed) / selectedItem.retail * 100)}%`},
              ].map(({label,val,editable}) => (
                <div key={label} style={{textAlign:"center"}}>
                  <div style={{fontSize:9,letterSpacing:1,color:"var(--color-text-secondary, #999)",textTransform:"uppercase"}}>{label}</div>
                  {editable ? (
                    editingPrice && editingPrice.sku === selectedItem.sku && editingPrice.field === editable ? (
                      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginTop:2}}>
                        <span style={{fontSize:14,fontWeight:700}}>$</span>
                        <input
                          autoFocus
                          type="number"
                          min="0"
                          step="0.01"
                          value={editPriceValue}
                          onChange={e => setEditPriceValue(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") confirmEditPrice(); if (e.key === "Escape") setEditingPrice(null); }}
                          onBlur={confirmEditPrice}
                          style={{width:60,fontSize:14,fontWeight:700,border:"none",borderBottom:"2px solid #1a1a1a",outline:"none",textAlign:"center",background:"transparent",padding:"0 2px"}}
                        />
                      </div>
                    ) : (
                      <div onClick={() => startEditPrice(selectedItem.sku, editable)} style={{fontSize:14,fontWeight:700,marginTop:2,cursor:"pointer",borderBottom:"1px dashed var(--color-border-tertiary, #ccc)",display:"inline-block"}} title="Click to edit">{val}</div>
                    )
                  ) : (
                    <div style={{fontSize:14,fontWeight:700,marginTop:2}}>{val}</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:"var(--color-text-secondary, #888)",marginTop:4}}>HS code: {selectedItem.hs}</div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:20}}>
              <button onClick={() => handleRemove(selectedItem.sku)} style={{flex:1,padding:"12px",fontSize:12,letterSpacing:2,background:"#1a1a1a",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}}>− REMOVE STOCK</button>
              <button onClick={() => handleAdd(selectedItem.sku)} style={{flex:1,padding:"12px",fontSize:12,letterSpacing:2,background:"transparent",color:"var(--color-text-primary, #111)",border:"1px solid var(--color-border-tertiary, #ddd)",cursor:"pointer",fontWeight:600}}>+ ADD STOCK</button>
              <button onClick={() => setPlacardItem(selectedItem)} style={{padding:"12px 20px",fontSize:12,letterSpacing:2,background:"transparent",color:"var(--color-text-primary, #111)",border:"1px solid var(--color-border-tertiary, #ddd)",cursor:"pointer",fontWeight:600}}>QR</button>
            </div>

          <h3 style={{fontSize:13,letterSpacing:2,textTransform:"uppercase",color:"var(--color-text-secondary, #888)",marginBottom:12,fontWeight:500}}>Activity log</h3>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {selectedItem.log.slice().reverse().map((entry, idx) => (
              <div key={idx} style={{display:"flex",gap:12,alignItems:"baseline",padding:"8px 12px",background:"var(--color-background-secondary, #f8f8f6)",borderRadius:6,fontSize:13}}>
                <span style={{fontSize:11,fontFamily:"monospace",color:"var(--color-text-secondary, #999)",minWidth:130}}>{new Date(entry.date).toLocaleString()}</span>
                <span style={{fontWeight:600,minWidth:60,color: entry.type==="removal"?"var(--color-text-danger, #c00)":entry.type==="addition"?"var(--color-text-success, #080)":"var(--color-text-primary, #111)"}}>
                  {entry.type === "removal" ? `−${entry.qty}` : entry.type === "addition" ? `+${entry.qty}` : `=${entry.qty}`}
                </span>
                <span>{entry.reason}</span>
                {entry.note && <span style={{color:"var(--color-text-secondary, #999)",fontStyle:"italic"}}>— {entry.note}</span>}
                {entry.newTotal !== undefined && <span style={{marginLeft:"auto",fontSize:11,color:"var(--color-text-secondary, #999)"}}>→ {entry.newTotal}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "placards" && (
        <div>
          <p style={{fontSize:13,color:"var(--color-text-secondary, #888)",marginBottom:16}}>Select placards to print for your shelves. Click the QR to preview a single placard.</p>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
            <select value={filterStyle} onChange={e => setFilterStyle(e.target.value)} style={{padding:"8px 12px",fontSize:12,border:"1px solid var(--color-border-tertiary, #ddd)",background:"var(--color-background-primary, #fff)",color:"var(--color-text-primary, #111)"}}>
              <option value="all">All styles</option>
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterColor} onChange={e => setFilterColor(e.target.value)} style={{padding:"8px 12px",fontSize:12,border:"1px solid var(--color-border-tertiary, #ddd)",background:"var(--color-background-primary, #fff)",color:"var(--color-text-primary, #111)"}}>
              <option value="all">All colors</option>
              {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={() => {
                const allSkus = filtered.map(i => i.sku);
                const allSelected = allSkus.every(s => selectedPlacards.has(s));
                if (allSelected) { setSelectedPlacards(new Set()); }
                else { setSelectedPlacards(new Set(allSkus)); }
              }} style={{padding:"8px 14px",fontSize:11,letterSpacing:1,background:"transparent",border:"1px solid var(--color-border-tertiary, #ddd)",cursor:"pointer",color:"var(--color-text-secondary, #888)"}}>
                {filtered.every(i => selectedPlacards.has(i.sku)) ? "DESELECT ALL" : "SELECT ALL"}
              </button>
              {selectedPlacards.size > 0 && (
                <button onClick={() => setPrintView(true)} style={{padding:"8px 20px",fontSize:11,letterSpacing:2,background:"#1a1a1a",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}}>
                  PRINT {selectedPlacards.size} PLACARD{selectedPlacards.size !== 1 ? "S" : ""}
                </button>
              )}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:12}}>
            {filtered.map(item => {
              const isSelected = selectedPlacards.has(item.sku);
              return (
                <div key={item.sku}
                  style={{border: isSelected ? "2px solid #1a1a1a" : "1px solid var(--color-border-tertiary, #eee)",borderRadius:"var(--border-radius-md, 8px)",padding:16,cursor:"pointer",textAlign:"center",background: isSelected ? "var(--color-background-secondary, #f8f8f6)" : "var(--color-background-primary, #fff)",transition:"all 0.15s",position:"relative"}}>
                  <div style={{position:"absolute",top:8,left:8}} onClick={(e) => { e.stopPropagation(); setSelectedPlacards(prev => { const next = new Set(prev); if (next.has(item.sku)) next.delete(item.sku); else next.add(item.sku); return next; }); }}>
                    <div style={{width:20,height:20,border: isSelected?"2px solid #1a1a1a":"2px solid var(--color-border-secondary, #bbb)",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",background: isSelected?"#1a1a1a":"transparent",transition:"all 0.15s"}}>
                      {isSelected && <span style={{color:"#fff",fontSize:13,fontWeight:700,lineHeight:1}}>✓</span>}
                    </div>
                  </div>
                  <div onClick={() => setPlacardItem(item)} style={{paddingTop:8}}>
                    <div style={{fontSize:11,letterSpacing:3,fontWeight:700,marginBottom:2}}>INVENTORY</div>
                    <div style={{fontSize:9,letterSpacing:2,color:"var(--color-text-secondary, #999)",marginBottom:8}}>{item.sku}</div>
                    <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
                      <QRSvg text={`${window.location.origin}/scan/${encodeURIComponent(item.sku)}`} size={80} />
                    </div>
                    <div style={{display:"flex",justifyContent:"space-around",fontSize:11}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"center"}}>
                          <span style={{width:8,height:8,borderRadius:"50%",background:COLOR_MAP[item.color]||"#888"}}/>
                          <span>{item.color}</span>
                        </div>
                      </div>
                      <div style={{fontWeight:700}}>{item.size}</div>
                      <div style={{fontWeight:700,color: item.current===0?"var(--color-text-danger, #c00)":"var(--color-text-primary, #111)"}}>{item.current}</div>
                    </div>
                    <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:6,fontSize:10,color:"var(--color-text-secondary, #888)"}}>
                      <span>W: ${item.wholesale}</span>
                      <span>R: ${item.retail}</span>
                    </div>
                  </div>
                  <div style={{position:"absolute",top:8,right:8}} onClick={(e) => { e.stopPropagation(); setSelectedPlacards(prev => { const next = new Set(prev); if (next.has(item.sku)) next.delete(item.sku); else next.add(item.sku); return next; }); }}>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "log" && (
        <div>
          <h3 style={{fontSize:13,letterSpacing:2,textTransform:"uppercase",color:"var(--color-text-secondary, #888)",marginBottom:12,fontWeight:500}}>All activity ({allLogs.length} entries)</h3>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {allLogs.slice(0, 200).map((entry, idx) => (
              <div key={idx} style={{display:"flex",gap:8,alignItems:"baseline",padding:"8px 12px",background: idx%2===0?"var(--color-background-secondary, #f8f8f6)":"transparent",borderRadius:4,fontSize:12,flexWrap:"wrap"}}>
                <span style={{fontSize:10,fontFamily:"monospace",color:"var(--color-text-secondary, #999)",minWidth:120}}>{new Date(entry.date).toLocaleString()}</span>
                <span style={{fontFamily:"monospace",fontSize:11,minWidth:110,color:"var(--color-text-secondary, #888)"}}>{entry.sku}</span>
                <span style={{fontWeight:600,minWidth:44,color: entry.type==="removal"?"var(--color-text-danger, #c00)":entry.type==="addition"?"var(--color-text-success, #080)":"var(--color-text-primary, #111)"}}>
                  {entry.type === "removal" ? `−${entry.qty}` : entry.type === "addition" ? `+${entry.qty}` : `=${entry.qty}`}
                </span>
                <span style={{fontSize:11}}>{entry.reason}</span>
                {entry.note && <span style={{color:"var(--color-text-secondary, #999)",fontStyle:"italic",fontSize:11}}>— {entry.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {actionModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={() => setActionModal(null)}>
          <div style={{background:"var(--color-background-primary, #fff)",borderRadius:"var(--border-radius-md, 8px)",padding:28,maxWidth:380,width:"100%",color:"var(--color-text-primary, #111)"}} onClick={e => e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 4px"}}>{actionModal.type === "remove" ? "Remove stock" : "Add stock"}</h3>
            <p style={{fontSize:12,color:"var(--color-text-secondary, #888)",margin:"0 0 20px",fontFamily:"monospace"}}>{actionModal.sku}</p>

            <label style={{fontSize:11,letterSpacing:2,color:"var(--color-text-secondary, #999)",textTransform:"uppercase",display:"block",marginBottom:4}}>Quantity</label>
            <input type="number" min={1} value={actionQty} onChange={e => setActionQty(e.target.value)}
              style={{width:"100%",padding:"10px 12px",fontSize:16,fontWeight:700,border:"1px solid var(--color-border-tertiary, #ddd)",marginBottom:16,background:"var(--color-background-primary, #fff)",color:"var(--color-text-primary, #111)"}} />

            <label style={{fontSize:11,letterSpacing:2,color:"var(--color-text-secondary, #999)",textTransform:"uppercase",display:"block",marginBottom:4}}>Reason</label>
            {actionModal.type === "remove" ? (
              <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                {["sale","sample","gift","damaged","return-to-vendor","other"].map(r => (
                  <button key={r} onClick={() => setActionReason(r)} style={{
                    padding:"8px 14px",fontSize:11,letterSpacing:1,textTransform:"uppercase",
                    background: actionReason===r?"#1a1a1a":"transparent",
                    color: actionReason===r?"#fff":"var(--color-text-primary, #111)",
                    border:"1px solid "+(actionReason===r?"#1a1a1a":"var(--color-border-tertiary, #ddd)"),cursor:"pointer"
                  }}>{r}</button>
                ))}
              </div>
            ) : (
              <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                {["restock","return","correction","new-shipment"].map(r => (
                  <button key={r} onClick={() => setActionReason(r)} style={{
                    padding:"8px 14px",fontSize:11,letterSpacing:1,textTransform:"uppercase",
                    background: actionReason===r?"#1a1a1a":"transparent",
                    color: actionReason===r?"#fff":"var(--color-text-primary, #111)",
                    border:"1px solid "+(actionReason===r?"#1a1a1a":"var(--color-border-tertiary, #ddd)"),cursor:"pointer"
                  }}>{r}</button>
                ))}
              </div>
            )}

            <label style={{fontSize:11,letterSpacing:2,color:"var(--color-text-secondary, #999)",textTransform:"uppercase",display:"block",marginBottom:4}}>Note (optional)</label>
            <input value={actionNote} onChange={e => setActionNote(e.target.value)} placeholder="e.g. Order #1234, Instagram collab..."
              style={{width:"100%",padding:"10px 12px",fontSize:13,border:"1px solid var(--color-border-tertiary, #ddd)",marginBottom:20,background:"var(--color-background-primary, #fff)",color:"var(--color-text-primary, #111)"}} />

            <div style={{display:"flex",gap:8}}>
              <button onClick={confirmAction} style={{flex:1,padding:"12px",fontSize:12,letterSpacing:2,background:"#1a1a1a",color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>CONFIRM</button>
              <button onClick={() => setActionModal(null)} style={{flex:1,padding:"12px",fontSize:12,letterSpacing:2,background:"transparent",color:"var(--color-text-primary, #111)",border:"1px solid var(--color-border-tertiary, #ddd)",cursor:"pointer"}}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      <PlacardModal item={placardItem} onClose={() => setPlacardItem(null)} />

      {printView && (() => {
        const items = inventory.filter(i => selectedPlacards.has(i.sku)).sort((a,b) => {
          if (a.style !== b.style) return a.style.localeCompare(b.style);
          if (a.color !== b.color) return a.color.localeCompare(b.color);
          return SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size);
        });
        return (
          <div style={{position:"fixed",inset:0,zIndex:1000,background:"#fff",overflow:"auto",color:"#000",fontFamily:"'Helvetica Neue', Arial, sans-serif"}}>
            <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",borderBottom:"1px solid #ddd",background:"#f8f8f6"}}>
              <span style={{fontSize:13,fontWeight:600}}>{items.length} placard{items.length !== 1 ? "s" : ""} ready — use Ctrl+P / Cmd+P to print this page</span>
              <button onClick={() => setPrintView(false)} style={{padding:"8px 20px",fontSize:11,letterSpacing:2,background:"#1a1a1a",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}}>CLOSE</button>
            </div>
            <style dangerouslySetInnerHTML={{__html:`
              @media print {
                .no-print { display:none !important; }
                @page { margin: 0.3in; }
              }
            `}} />
            <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",maxWidth:"8.5in",margin:"0 auto"}}>
              {items.map(item => (
                <div key={item.sku} style={{border:"1.5px solid #000",padding:"10px 14px",display:"flex",alignItems:"center",gap:14,height:"2in",breakInside:"avoid",pageBreakInside:"avoid"}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                    <QRSvg text={`${window.location.origin}/scan/${encodeURIComponent(item.sku)}`} size={80} />
                    <div style={{fontSize:7,letterSpacing:2,color:"#666",marginTop:4,fontFamily:"monospace"}}>{item.sku}</div>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:10,letterSpacing:4,fontWeight:800,marginBottom:2}}>INVENTORY</div>
                    <div style={{fontSize:9,fontWeight:600,marginBottom:6}}>{item.style}</div>
                    <div style={{display:"flex",gap:12,borderTop:"1px solid #ccc",paddingTop:6,marginBottom:6}}>
                      <div>
                        <div style={{fontSize:7,letterSpacing:1.5,color:"#999",textTransform:"uppercase"}}>Color</div>
                        <div style={{fontSize:10,fontWeight:700,marginTop:1,display:"flex",alignItems:"center",gap:3}}>
                          <span style={{width:8,height:8,borderRadius:"50%",background:COLOR_MAP[item.color]||"#888",border:"1px solid #ccc",display:"inline-block"}}/> {item.color}
                        </div>
                      </div>
                      <div>
                        <div style={{fontSize:7,letterSpacing:1.5,color:"#999",textTransform:"uppercase"}}>Size</div>
                        <div style={{fontSize:14,fontWeight:800,marginTop:0}}>{item.size}</div>
                      </div>
                      <div>
                        <div style={{fontSize:7,letterSpacing:1.5,color:"#999",textTransform:"uppercase"}}>Qty</div>
                        <div style={{fontSize:14,fontWeight:800,marginTop:0}}>{item.current}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:12,borderTop:"1px solid #eee",paddingTop:4}}>
                      <div>
                        <div style={{fontSize:7,letterSpacing:1.5,color:"#999",textTransform:"uppercase"}}>Wholesale</div>
                        <div style={{fontSize:11,fontWeight:700,marginTop:1}}>${item.wholesale}</div>
                      </div>
                      <div>
                        <div style={{fontSize:7,letterSpacing:1.5,color:"#999",textTransform:"uppercase"}}>Retail</div>
                        <div style={{fontSize:11,fontWeight:700,marginTop:1}}>${item.retail}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
