import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ErrorScreen() {
  const nav = useNavigate();
  const { state } = useLocation();
  const error = state?.error || "SERVER_ERROR";

  let icon = "⚠️";
  let title = "Something Went Wrong";
  let message = "An unexpected error occurred. Please try again.";
  let back = "/cart";

  if (error === "INSUFFICIENT_BALANCE") {
    icon = "💸";
    title = "Insufficient Balance";
    message = "You don't have enough balance. Remove some items and try again.";
    back = "/cart";
  }

  if (error === "ITEM_UNAVAILABLE") {
    icon = "🚫";
    title = "Item Unavailable";
    message = "Some items in your cart are no longer available. Please update your order.";
    back = "/menu";
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>{icon}</div>
        <div style={styles.title}>{title}</div>
        <div style={styles.message}>{message}</div>

        <div style={styles.divider} />

        <div style={styles.actions}>
          <button style={styles.primaryBtn} onClick={() => nav(back)}>
            ← Go Back
          </button>
          <button style={styles.secondaryBtn} onClick={() => nav("/")}>
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #2b0000, #000)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
    color: "#fff",
    padding: 18,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "linear-gradient(180deg, #3d0000, #170000)",
    border: "2px solid rgba(255,0,0,0.5)",
    borderRadius: 32,
    padding: "50px 60px",
    boxShadow: "0 0 60px rgba(255,0,0,0.25)",
    maxWidth: 540,
    width: "100%",
    textAlign: "center",
  },
  icon: {
    fontSize: 90,
    marginBottom: 16,
  },
  title: {
    fontSize: 44,
    fontWeight: 900,
    color: "#ff4444",
    marginBottom: 12,
    letterSpacing: 1,
  },
  message: {
    fontSize: 20,
    opacity: 0.8,
    lineHeight: 1.5,
    maxWidth: 360,
  },
  divider: {
    width: 200,
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(255,0,0,0.5), transparent)",
    margin: "30px 0",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    width: "100%",
  },
  primaryBtn: {
    width: "100%",
    height: 80,
    borderRadius: 20,
    border: "1px solid rgba(255,0,0,0.7)",
    background: "linear-gradient(180deg, #ff1f1f, #920000)",
    color: "#fff",
    fontSize: 26,
    fontWeight: 900,
    cursor: "pointer",
    letterSpacing: 1,
    boxShadow: "0 0 20px rgba(255,0,0,0.3)",
  },
  secondaryBtn: {
    width: "100%",
    height: 72,
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 24,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 1,
  },
};
