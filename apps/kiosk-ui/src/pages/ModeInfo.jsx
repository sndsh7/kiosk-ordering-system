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

  return (
    <div className="kiosk-page">
      <div className="kiosk-container">
        {/* HEADER */}
        <div className="kiosk-header">
          <button className="kiosk-back-btn" onClick={() => nav("/")}>←</button>
          <div className="kiosk-header-title">ORDER MODE</div>
          <div className="kiosk-header-title" style={{ fontSize: "2rem" }}></div>
        </div>

        {/* MODE CARD */}
        <div className="kiosk-balance-card" style={{ marginBottom: "1.5rem" }}>
          <div className="mode-label">CURRENT MODE</div>
          <div className="mode-name">{status.mode?.toUpperCase()}</div>
        </div>

        {/* BALANCE CARD */}
        <div className="kiosk-balance-card" style={{ marginBottom: "1.5rem" }}>
          <div className="kiosk-wallet-text">GROUP WALLET BALANCE</div>
          <div className="kiosk-balance-amount">₹ {status.balance}</div>
          <div className="kiosk-wallet-text" style={{ opacity: 0.7, fontSize: "1.1rem" }}>Available Balance</div>
        </div>

        {/* ENTITY */}
        {status.entityName && (
          <div className="mode-entity-card">
            <div className="mode-entity-label">ASSIGNED TO</div>
            <div className="mode-entity-name">{status.entityName}</div>
          </div>
        )}

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
