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
      <div className="kiosk-page">
        <div className="welcome-loading-text" style={{ margin: "auto" }}>Loading…</div>
      </div>
    );
  }

  if (!status.isActive) {
    return (
      <div className="kiosk-page">
        <div className="kiosk-card">
          <div className="welcome-error-icon">🚫</div>
          <div className="welcome-title">OUT OF SERVICE</div>
          <div className="welcome-subtitle">Kiosk is inactive. Please contact staff.</div>
          <button className="kiosk-btn" style={{ marginTop: "2rem" }} onClick={() => nav("/")}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const modeIcon = status.mode?.toLowerCase() === 'individual' ? '👤' : 
                   status.mode?.toLowerCase() === 'pair' ? '👥' : 
                   status.mode?.toLowerCase() === 'group' ? '🧑‍🤝‍🧑' : '⚙️';
                   
  const displayMode = status.mode ? status.mode.charAt(0).toUpperCase() + status.mode.slice(1).toLowerCase() : "";

  return (
    <div className="kiosk-page">
      <div className="kiosk-container">
        {/* HEADER */}
        <div className="kiosk-header">
          <button className="kiosk-back-btn" onClick={() => nav("/")}>←</button>
          <div className="kiosk-header-title" style={{ fontSize: "3rem" }}>{modeIcon}</div>
          <div className="kiosk-header-title" style={{ fontSize: "2rem" }}></div>
        </div>

        {/* COMBINED MODE & BALANCE CARD */}
        <div className="kiosk-balance-card" style={{ marginBottom: "1.5rem", padding: "3rem 2rem" }}>
          <div className="mode-name" style={{ marginBottom: "1.5rem", color: "#fff" }}>
            {displayMode}{status.entityName ? ` (${status.entityName})` : ""}
          </div>
          <div className="kiosk-wallet-text" style={{ opacity: 0.8, fontSize: "1.2rem", textTransform: "uppercase", letterSpacing: "2px" }}>Lockup Money</div>
          <div className="kiosk-balance-amount" style={{ marginTop: "1rem" }}>₹ {status.balance}</div>
        </div>

        {/* ACTIONS */}
        <div className="mode-actions">
          <button className="kiosk-btn" style={{ width: "100%", height: "var(--cart-btn-height)", fontSize: "1.6rem" }} onClick={() => nav("/menu")}>
            🛒 START ORDERING
          </button>
        </div>
      </div>
    </div>
  );
}
