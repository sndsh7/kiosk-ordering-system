import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKioskStatus, connectSocket } from "../lib/kioskApi";

export default function Welcome() {
  const nav = useNavigate();
  const [inactive, setInactive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let socket;
    (async () => {
      try {
        const status = await getKioskStatus();
        setInactive(!status.isActive);
      } finally {
        setLoading(false);
      }
      socket = connectSocket((s) => setInactive(!s.isActive));
    })();
    return () => socket?.disconnect();
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingText}>Loading…</div>
      </div>
    );
  }

  if (inactive) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.errorIcon}>🚫</div>
          <div style={styles.title}>OUT OF SERVICE</div>
          <div style={styles.subtitle}>Please contact staff.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.page, cursor: "pointer" }} onClick={() => nav("/mode")}>
      <div style={styles.card}>
        <div style={styles.logo}>🏷️</div>
        <div style={styles.brand}>IDEAZZZZ 360</div>
        <div style={styles.tagline}>Reality Show Kiosk</div>
        <div style={styles.divider} />
        <div style={styles.touchHint}>👆 TOUCH TO START</div>
        <div style={styles.pulse} />
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
    position: "relative",
    overflow: "hidden",
  },
  logo: {
    fontSize: 90,
    marginBottom: 16,
  },
  brand: {
    fontSize: 52,
    fontWeight: 900,
    letterSpacing: 3,
    color: "#ffcc00",
    textAlign: "center",
  },
  tagline: {
    fontSize: 22,
    fontWeight: 600,
    opacity: 0.8,
    marginTop: 8,
    letterSpacing: 1,
  },
  divider: {
    width: 200,
    height: 2,
    background: "linear-gradient(90deg, transparent, rgba(255,0,0,0.7), transparent)",
    margin: "30px 0",
  },
  touchHint: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: 2,
    animation: "pulse 1.6s ease-in-out infinite",
  },
  pulse: {},
  loadingText: {
    fontSize: 32,
    fontWeight: 700,
    color: "#fff",
  },
  errorIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 900,
    color: "#ff4444",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 22,
    marginTop: 12,
    opacity: 0.8,
    textAlign: "center",
  },
};
