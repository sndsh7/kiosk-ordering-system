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
      <div className="kiosk-page">
        <div className="welcome-loading-text" style={{ margin: "auto" }}>Loading…</div>
      </div>
    );
  }

  if (inactive) {
    return (
      <div className="kiosk-page">
        <div className="kiosk-card">
          <div className="welcome-error-icon">🚫</div>
          <div className="welcome-title">OUT OF SERVICE</div>
          <div className="welcome-subtitle">Please contact staff.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="kiosk-page" style={{ cursor: "pointer", paddingBottom: "var(--spacing-md)" }} onClick={() => nav("/mode")}>
      <div className="kiosk-card" style={{ maxWidth: "100%", flexGrow: 1, justifyContent: "center" }}>
        <div className="welcome-logo">🏷️</div>
        <div className="welcome-brand">IDEAZZZZ</div>
        {/* <div className="welcome-tagline">Reality Show Kiosk</div> */}
        <div className="welcome-divider" />
        <button className="welcome-start-button">START</button>
        {/* <div className="welcome-touch-hint">👆 TOUCH TO START</div> */}
      </div>
    </div>
  );
}
