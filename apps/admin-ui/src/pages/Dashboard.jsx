import React, { useEffect, useState } from "react";
import { api } from "../lib/adminApi";
import { s, colors } from "../lib/adminStyles";

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #2a0000, #150000)",
      border: `1px solid ${accent || colors.border}`,
      borderRadius: 16,
      padding: "20px 24px",
      boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
      flex: 1,
      minWidth: 160,
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: colors.muted, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: accent || colors.gold, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [kiosk, setKiosk] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: k } = await api.get("/api/kiosk/status");
      setKiosk(k);
      const { data: o } = await api.get("/api/orders");
      setOrders(o);
    })();
  }, []);

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const todaySpend = todayOrders.reduce((s, o) => s + o.totalPoints, 0);

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Dashboard</div>

      {/* STAT CARDS */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard icon="🖥️" label="Kiosk Status" value={kiosk ? (kiosk.isActive ? "ACTIVE" : "OFF") : "…"}
          accent={kiosk?.isActive ? colors.green : colors.danger} />
        <StatCard icon="⚙️" label="Current Mode" value={kiosk?.mode || "…"} accent={colors.gold} />
        <StatCard icon="💰" label="Wallet Balance" value={kiosk ? `₹ ${kiosk.balance}` : "…"} accent={colors.gold} />
        <StatCard icon="🧾" label="Today's Orders" value={todayOrders.length} sub={`₹ ${todaySpend} spent`} />
      </div>

      {/* KIOSK DETAILS */}
      <div style={s.card}>
        <div style={s.sectionTitle}>Kiosk Details</div>
        {kiosk ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px" }}>
            {[
              ["Active", kiosk.isActive ? "Yes" : "No"],
              ["Mode", kiosk.mode],
              ["Assigned To", kiosk.entityName || "—"],
              ["Balance", `₹ ${kiosk.balance}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,0,0,0.1)" }}>
                <span style={{ color: colors.muted, fontSize: 14 }}>{k}</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{v}</span>
              </div>
            ))}
          </div>
        ) : <div style={{ color: colors.muted }}>Loading…</div>}
      </div>

      {/* TODAY SUMMARY */}
      <div style={s.card}>
        <div style={s.sectionTitle}>Today's Summary</div>
        <div style={{ display: "flex", gap: 32 }}>
          <div>
            <div style={{ fontSize: 13, color: colors.muted, marginBottom: 4 }}>Orders Placed</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: colors.gold }}>{todayOrders.length}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: colors.muted, marginBottom: 4 }}>Total Spent</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: colors.gold }}>₹ {todaySpend}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
