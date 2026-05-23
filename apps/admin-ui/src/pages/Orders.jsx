import React, { useEffect, useState } from "react";
import { api } from "../lib/adminApi";
import { Link } from "react-router-dom";
import { s, colors } from "../lib/adminStyles";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchOrders = async () => {
    const { data } = await api.get("/api/orders");
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleClearOrders = async () => {
    if (!window.confirm("Are you sure you want to clear all orders? This cannot be undone.")) return;
    try {
      await api.delete("/api/orders");
      fetchOrders();
    } catch (e) {
      alert("Failed to clear orders");
    }
  };

  const handleExport = () => {
    let filtered = orders;
    if (fromDate) {
      const from = new Date(fromDate);
      filtered = filtered.filter(o => new Date(o.createdAt) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(o => new Date(o.createdAt) <= to);
    }

    if (filtered.length === 0) {
      alert("No orders found for the selected dates.");
      return;
    }

    const csvRows = [];
    csvRows.push(["Order ID", "Time", "Entity", "Mode", "Total Points"]);
    for (const o of filtered) {
      csvRows.push([
        o.id,
        `"${new Date(o.createdAt).toLocaleString()}"`,
        `"${o.entityName || "Unknown"}"`,
        o.mode,
        o.totalPoints
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={s.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ ...s.pageTitle, marginBottom: 0 }}>Orders</div>
        
        <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", background: colors.card, padding: "8px 12px", borderRadius: 8 }}>
            <span style={{ fontSize: 13, color: colors.muted }}>From:</span>
            <input 
              type="date" 
              value={fromDate} 
              onChange={e => setFromDate(e.target.value)} 
              style={{ ...s.input, width: "auto", padding: "4px 8px" }}
            />
            <span style={{ fontSize: 13, color: colors.muted }}>To:</span>
            <input 
              type="date" 
              value={toDate} 
              onChange={e => setToDate(e.target.value)} 
              style={{ ...s.input, width: "auto", padding: "4px 8px" }}
            />
            <button onClick={handleExport} style={{ ...s.btnSm, background: colors.gold, color: "#000" }}>Export CSV</button>
          </div>
          
          <button onClick={handleClearOrders} style={{ ...s.btnSm, background: colors.red, color: "#fff" }}>
            Clear All Orders
          </button>
        </div>
      </div>

      <div style={s.card}>
        {orders.length === 0 ? (
          <div style={{ color: colors.muted, padding: "20px 0", textAlign: "center" }}>No orders yet.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>#</th>
                <th style={s.th}>Time</th>
                <th style={s.th}>Entity</th>
                <th style={s.th}>Mode</th>
                <th style={s.th}>Total</th>
                <th style={s.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ transition: "background 0.15s" }}>
                  <td style={{ ...s.td, fontWeight: 700, color: colors.gold }}>#{o.id}</td>
                  <td style={{ ...s.td, color: colors.muted, fontSize: 13 }}>
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td style={{ ...s.td, color: "#fff", fontWeight: 500 }}>
                    {o.entityName || "Unknown"}
                  </td>
                  <td style={s.td}>
                    <span style={s.badge(colors.red)}>{o.mode}</span>
                  </td>
                  <td style={{ ...s.td, fontWeight: 800, color: colors.gold }}>₹ {o.totalPoints}</td>
                  <td style={s.td}>
                    <Link
                      to={`/orders/${o.id}`}
                      style={{
                        ...s.btnSm,
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
