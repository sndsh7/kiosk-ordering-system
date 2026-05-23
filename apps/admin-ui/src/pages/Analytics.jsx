import React, { useEffect, useState } from "react";
import { api } from "../lib/adminApi";
import { s, colors } from "../lib/adminStyles";

function StatCard({ title, ordersCount, revenue, accent }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(30,0,0,0.8), rgba(0,0,0,0.8))",
      border: `1px solid ${accent || colors.border}`,
      borderRadius: 16,
      padding: "24px",
      boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
      flex: 1,
      minWidth: 250,
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = `0 12px 40px ${accent ? accent + '40' : 'rgba(0,0,0,0.6)'}`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4)`;
    }}
    >
      <div style={{ position: "absolute", top: -20, right: -10, fontSize: 100, opacity: 0.04 }}>📈</div>
      <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 2, color: colors.muted, textTransform: "uppercase", marginBottom: 20 }}>{title}</div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Revenue Generated</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: accent || colors.gold, lineHeight: 1 }}>₹ {revenue}</div>
      </div>
      <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 16 }}>
        <div style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Total Orders</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{ordersCount}</div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/orders");
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Start of week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  // Start of month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = {
    day: { count: 0, revenue: 0 },
    week: { count: 0, revenue: 0 },
    month: { count: 0, revenue: 0 },
  };

  orders.forEach(o => {
    const d = new Date(o.createdAt);
    if (d >= today) {
      stats.day.count++;
      stats.day.revenue += o.totalPoints;
    }
    if (d >= startOfWeek) {
      stats.week.count++;
      stats.week.revenue += o.totalPoints;
    }
    if (d >= startOfMonth) {
      stats.month.count++;
      stats.month.revenue += o.totalPoints;
    }
  });

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Analytics</div>
      
      {loading ? (
        <div style={{ color: colors.muted }}>Loading analytics...</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 32 }}>
            <StatCard title="Today" ordersCount={stats.day.count} revenue={stats.day.revenue} accent={colors.green} />
            <StatCard title="This Week" ordersCount={stats.week.count} revenue={stats.week.revenue} accent={colors.gold} />
            <StatCard title="This Month" ordersCount={stats.month.count} revenue={stats.month.revenue} accent="#00aaff" />
          </div>

          <div style={{ ...s.card, background: "rgba(255,255,255,0.02)" }}>
             <div style={s.sectionTitle}>Overview</div>
             <p style={{ color: colors.muted, lineHeight: 1.6 }}>
               Here you can monitor the performance of your Kiosk Ordering System over different time periods.
               The data is updated in real-time as new orders are placed. Use this to track peak ordering times
               and overall revenue growth.
             </p>
          </div>
        </>
      )}
    </div>
  );
}
