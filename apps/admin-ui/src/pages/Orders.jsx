import React, { useEffect, useState } from "react";
import { api } from "../lib/adminApi";
import { Link } from "react-router-dom";
import { s, colors } from "../lib/adminStyles";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/api/orders");
      setOrders(data);
    })();
  }, []);

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Orders</div>

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
