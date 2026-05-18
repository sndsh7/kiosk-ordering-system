import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKioskStatus, connectSocket } from "../lib/kioskApi";

export default function ModeInfo() {
  const nav = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let socket;
    (async () => {
      const s = await getKioskStatus();
      setStatus(s);
      socket = connectSocket(setStatus);
    })();
    return () => socket?.disconnect();
  }, []);

  if (!status) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingText}>Loading…</div>
      </div>
    );
  }

  if (!status.isActive) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.bigIcon}>🚫</div>
          <div style={styles.heading}>OUT OF SERVICE</div>
          <div style={styles.subtext}>Kiosk is inactive. Please contact staff.</div>
          <button style={styles.btn} onClick={() => nav("/")}>← Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => nav("/")}>←</button>
        <div style={styles.headerTitle}>ORDER MODE</div>
        <div style={styles.headerIcon}>⚙️</div>
      </div>

      {/* MODE CARD */}
      <div style={styles.modeCard}>
        <div style={styles.modeLabel}>CURRENT MODE</div>
        <div style={styles.modeName}>{status.mode?.toUpperCase()}</div>
      </div>

      {/* BALANCE CARD */}
      <div style={styles.balanceCard}>
        <div style={styles.walletText}>GROUP WALLET BALANCE</div>
        <div style={styles.balanceAmount}>₹ {status.balance}</div>
        <div style={styles.available}>Available Balance</div>
      </div>

      {/* ENTITY */}
      {status.entityName && (
        <div style={styles.entityCard}>
          <div style={styles.entityLabel}>ASSIGNED TO</div>
          <div style={styles.entityName}>{status.entityName}</div>
        </div>
      )}

      {/* ACTIONS */}
      <div style={styles.actions}>
        <button style={styles.primaryBtn} onClick={() => nav("/menu")}>
          🛒 START ORDERING
        </button>
        {/* <button style={styles.secondaryBtn} onClick={() => nav("/")}>
          ← BACK
        </button> */}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #2b0000, #000)",
    padding: 18,
    paddingBottom: 40,
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  loadingText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    fontSize: 32,
    fontWeight: 700,
    color: "#fff",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 48,
    cursor: "pointer",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: 1,
  },
  headerIcon: {
    fontSize: 34,
  },
  modeCard: {
    border: "2px solid rgba(255,0,0,0.5)",
    background: "linear-gradient(180deg, #3d0000, #170000)",
    borderRadius: 24,
    padding: "22px 28px",
    marginBottom: 16,
    boxShadow: "0 0 30px rgba(255,0,0,0.2)",
    textAlign: "center",
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: 700,
    opacity: 0.7,
    letterSpacing: 2,
    marginBottom: 8,
  },
  modeName: {
    fontSize: 52,
    fontWeight: 900,
    color: "#ff4444",
    letterSpacing: 2,
  },
  balanceCard: {
    border: "2px solid rgba(255,0,0,0.5)",
    background: "linear-gradient(180deg, #3d0000, #170000)",
    borderRadius: 24,
    padding: 28,
    marginBottom: 16,
    boxShadow: "0 0 30px rgba(255,0,0,0.2)",
  },
  walletText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: 700,
    opacity: 0.9,
  },
  balanceAmount: {
    textAlign: "center",
    fontSize: 78,
    fontWeight: 900,
    color: "#ffcc00",
    marginTop: 10,
    lineHeight: 1,
  },
  available: {
    textAlign: "center",
    fontSize: 20,
    marginTop: 8,
  },
  entityCard: {
    border: "1px solid rgba(255,0,0,0.35)",
    background: "linear-gradient(90deg, #2b0000, #160000)",
    borderRadius: 18,
    padding: "18px 24px",
    marginBottom: 16,
    textAlign: "center",
  },
  entityLabel: {
    fontSize: 14,
    fontWeight: 700,
    opacity: 0.6,
    letterSpacing: 2,
    marginBottom: 6,
  },
  entityName: {
    fontSize: 30,
    fontWeight: 800,
    color: "#ffcc00",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginTop: 24,
  },
  primaryBtn: {
    width: "100%",
    height: 90,
    borderRadius: 22,
    border: "1px solid rgba(255,0,0,0.7)",
    background: "linear-gradient(180deg, #ff1f1f, #920000)",
    color: "#fff",
    fontSize: 30,
    fontWeight: 900,
    cursor: "pointer",
    letterSpacing: 1,
    boxShadow: "0 0 20px rgba(255,0,0,0.3)",
  },
  secondaryBtn: {
    width: "100%",
    height: 72,
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 24,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 1,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "linear-gradient(180deg, #3d0000, #170000)",
    border: "2px solid rgba(255,0,0,0.5)",
    borderRadius: 32,
    padding: "60px 80px",
    boxShadow: "0 0 60px rgba(255,0,0,0.25)",
    maxWidth: 500,
    margin: "60px auto",
  },
  bigIcon: { fontSize: 80, marginBottom: 20 },
  heading: { fontSize: 42, fontWeight: 900, color: "#ff4444", textAlign: "center" },
  subtext: { fontSize: 20, opacity: 0.8, marginTop: 12, textAlign: "center" },
  btn: {
    marginTop: 32,
    padding: "16px 32px",
    borderRadius: 16,
    border: "none",
    background: "linear-gradient(180deg, #ff1f1f, #920000)",
    color: "#fff",
    fontSize: 20,
    fontWeight: 800,
    cursor: "pointer",
  },
};
