import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileAvatars from "../components/ProfileAvatars";

export default function Success() {
  const nav = useNavigate();
  const { state } = useLocation();
  const remaining = state?.remaining ?? 0;
  const entityName = state?.entityName ?? null;
  const photos = state?.photos ?? [];
  const mode = state?.mode ?? null;

  useEffect(() => {
    const t = setTimeout(() => nav("/", { replace: true }), 6000);
    return () => clearTimeout(t);
  }, [nav]);

  return (
    <div className="kiosk-page kiosk-page-success" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="kiosk-card kiosk-card-success">

        {/* PROFILE */}
        {entityName && mode?.toLowerCase() !== "group" ? (
          <div style={{ width: "100%", marginBottom: "1rem" }}>
            <ProfileAvatars entityName={entityName} photos={photos} mode={mode} />
          </div>
        ) : entityName && mode?.toLowerCase() === "group" ? (
          <div style={{ width: "100%", marginBottom: "1rem" }}>
            <div className="mode-name" style={{ color: "#fff", fontSize: "1.3rem", fontWeight: "700", letterSpacing: "1px" }}>
              Group{entityName ? ` (${entityName.replace(/\s*\+\s*/g, "+")})` : ""}
            </div>
          </div>
        ) : null}

        <div className="success-check-icon">✅</div>
        <div className="success-title">ORDER PLACED!</div>
        <div className="success-subtitle">Your order has been received.</div>

        <div className="success-divider" />

        <div className="success-balance-label">REMAINING BALANCE</div>
        <div className="success-balance-amount">₹ {Math.max(0, remaining)}</div>

        <div className="success-divider" />

        <div className="success-return-msg">Returning to home in a moment…</div>

        {/* Progress bar */}
        <div className="success-progress-track">
          <div className="success-progress-bar" />
        </div>
      </div>
    </div>
  );
}
