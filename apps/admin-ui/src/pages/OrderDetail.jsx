import React, { useEffect, useState } from "react";
import { api } from "../lib/adminApi";
import { useParams, useNavigate } from "react-router-dom";
import { s, colors } from "../lib/adminStyles";

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/api/orders/${id}/receipt`);
      setReceipt(data);
    })();
  }, [id]);

  if (!receipt) return <div style={s.page}><div style={{ color: colors.muted }}>Loading…</div></div>;

  return (
    <div style={s.page}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={() => nav("/orders")} style={s.btnGhost}>← Back</button>
        <div style={s.pageTitle}>Receipt — Order #{receipt.orderId}</div>
      </div>

      {/* Receipt card */}
      <div style={{ ...s.card, maxWidth: 560 }} id="receipt">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: colors.muted, textTransform: "uppercase" }}>ORDER RECEIPT</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: colors.gold, marginTop: 4 }}>#{receipt.orderId}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
              {receipt.entityName || "Unknown"} <span style={{ ...s.badge(colors.red), marginLeft: 8 }}>{receipt.mode}</span>
            </div>
            <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>{new Date(receipt.createdAt).toLocaleString()}</div>
          </div>
        </div>

        <div style={s.divider} />

        {/* Line items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {receipt.items.map((it, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 700 }}>{it.name}</span>
                <span style={{ color: colors.muted, fontSize: 13, marginLeft: 8 }}>× {it.qty}</span>
              </div>
              <div style={{ fontWeight: 800, color: colors.gold }}>₹ {it.subtotal}</div>
            </div>
          ))}
        </div>

        <div style={s.divider} />

        {/* Total */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Total</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: colors.gold }}>₹ {receipt.total}</span>
        </div>
      </div>

      {/* Print button */}
      <div style={{ marginTop: 16 }}>
        <button onClick={() => window.print()} style={s.btn}>🖨️ Print Receipt</button>
      </div>

      <style>{`@media print {
        body * { visibility: hidden; }
        #receipt, #receipt * { visibility: visible; }
        #receipt { position: absolute; left: 0; top: 0; width: 100%; background: #fff; color: #000; border: none; }
      }`}</style>
    </div>
  );
}
