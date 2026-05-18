import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE, setToken } from "../lib/adminApi";
import { useNavigate } from "react-router-dom";
import { s, colors } from "../lib/adminStyles";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState("");
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => { checkApiStatus(); }, []);

  async function checkApiStatus() {
    try {
      await axios.get(`${API_BASE}/health`);
      setApiStatus("online");
    } catch {
      setApiStatus("offline");
    }
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await axios.post(`${API_BASE}/api/admin/login`, { username, password });
      setToken(data.token);
      nav("/dashboard");
    } catch (error) {
      setErr(error.response?.data?.error || "Invalid credentials");
    }
  }

  const statusColor = apiStatus === "online" ? colors.green : apiStatus === "offline" ? colors.danger : "#ffcc00";
  const statusLabel = apiStatus === "checking" ? "Checking…" : apiStatus === "online" ? "Online ●" : "Offline ●";

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.brandIcon}>🏷️</div>
          <div style={styles.brandName}>IDEAZZZZ 360</div>
          <div style={styles.brandSub}>Admin Panel</div>
        </div>

        <div style={styles.divider} />

        {/* API Status */}
        <div style={styles.statusBar}>
          <span style={styles.statusLabel}>API Server</span>
          <span style={{ ...styles.statusBadge, color: statusColor, borderColor: `${statusColor}44`, background: `${statusColor}11` }}>
            {statusLabel}
          </span>
          {apiStatus === "offline" && (
            <button onClick={checkApiStatus} style={styles.retryBtn}>Retry</button>
          )}
        </div>
        {apiStatus === "offline" && (
          <div style={s.errMsg}>Cannot connect to API. Ensure the server is running.</div>
        )}

        {/* Form */}
        <form onSubmit={submit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              autoComplete="username"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoComplete="current-password"
            />
          </div>

          {err && <div style={s.errMsg}>{err}</div>}

          <button
            type="submit"
            style={{ ...styles.loginBtn, ...(apiStatus !== "online" ? { opacity: 0.4, cursor: "not-allowed" } : {}) }}
            disabled={apiStatus !== "online"}
          >
            Login →
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #1a0000, #000)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    padding: 20,
  },
  card: {
    background: "linear-gradient(135deg, #2a0000, #150000)",
    border: "2px solid rgba(255,0,0,0.35)",
    borderRadius: 24,
    padding: "40px 44px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 0 60px rgba(255,0,0,0.15)",
    color: "#fff",
  },
  brand: {
    textAlign: "center",
    marginBottom: 4,
  },
  brandIcon: { fontSize: 52, marginBottom: 10 },
  brandName: {
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: 2,
    color: "#ffcc00",
  },
  brandSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 1.5,
    marginTop: 4,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(255,0,0,0.4), transparent)",
    margin: "24px 0",
  },
  statusBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  statusLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    fontWeight: 600,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 99,
    border: "1px solid",
    letterSpacing: 0.5,
  },
  retryBtn: {
    fontSize: 12,
    padding: "3px 10px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    color: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  loginBtn: {
    marginTop: 8,
    width: "100%",
    padding: "14px",
    borderRadius: 12,
    border: "1px solid rgba(255,0,0,0.7)",
    background: "linear-gradient(180deg, #ff1f1f, #920000)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
    letterSpacing: 1,
    boxShadow: "0 0 20px rgba(255,0,0,0.25)",
  },
};
