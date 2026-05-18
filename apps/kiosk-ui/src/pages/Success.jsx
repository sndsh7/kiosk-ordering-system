import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Success() {
  const nav = useNavigate();
  const { state } = useLocation();
  const remaining = state?.remaining ?? 0;

  useEffect(() => {
    const t = setTimeout(() => nav("/", { replace: true }), 6000);
    return () => clearTimeout(t);
  }, [nav]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.checkIcon}>✅</div>
        <div style={styles.title}>ORDER PLACED!</div>
        <div style={styles.subtitle}>Your order has been received.</div>

        <div style={styles.divider} />

        <div style={styles.balanceLabel}>REMAINING BALANCE</div>
        <div style={styles.balanceAmount}>₹ {Math.max(0, remaining)}</div>

        <div style={styles.divider} />

        <div style={styles.returnMsg}>Returning to home in a moment…</div>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div style={styles.progressBar} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #002b00, #000)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
    color: "#fff",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "linear-gradient(180deg, #003d00, #001700)",
    border: "2px solid rgba(0,200,0,0.4)",
    borderRadius: 32,
    padding: "50px 70px",
    boxShadow: "0 0 60px rgba(0,200,0,0.2)",
    maxWidth: 560,
    width: "100%",
    margin: "0 18px",
  },
  checkIcon: {
    fontSize: 90,
    marginBottom: 16,
  },
  title: {
    fontSize: 52,
    fontWeight: 900,
    letterSpacing: 2,
    color: "#00e676",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 22,
    opacity: 0.8,
    marginTop: 10,
    textAlign: "center",
  },
  divider: {
    width: 200,
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(0,200,0,0.5), transparent)",
    margin: "24px 0",
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 2,
    opacity: 0.6,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 72,
    fontWeight: 900,
    color: "#ffcc00",
    lineHeight: 1,
  },
  returnMsg: {
    fontSize: 20,
    opacity: 0.6,
    marginTop: 8,
  },
  progressTrack: {
    marginTop: 24,
    width: "100%",
    height: 6,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    width: "100%",
    background: "linear-gradient(90deg, #00e676, #00bcd4)",
    borderRadius: 99,
    animation: "shrink 6s linear forwards",
  },
};
