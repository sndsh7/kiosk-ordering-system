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
    <div className="kiosk-page kiosk-page-success" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="kiosk-card kiosk-card-success">
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
