import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileAvatars from "../components/ProfileAvatars";

export default function ErrorScreen() {
  const nav = useNavigate();
  const { state } = useLocation();
  const error = state?.error || "SERVER_ERROR";
  const entityName = state?.entityName ?? null;
  const photos = state?.photos ?? [];
  const mode = state?.mode ?? null;

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
    <div className="kiosk-page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="kiosk-card">
        {/* PROFILE */}
        {entityName && mode?.toLowerCase() !== "group" ? (
          <div style={{ width: "100%", marginBottom: "0.5rem" }}>
            <ProfileAvatars entityName={entityName} photos={photos} mode={mode} />
          </div>
        ) : entityName && mode?.toLowerCase() === "group" ? (
          <div style={{ width: "100%", marginBottom: "0.5rem" }}>
            <div className="mode-name" style={{ color: "#fff", fontSize: "1.3rem", fontWeight: "700", letterSpacing: "1px" }}>
              Group{entityName ? ` (${entityName.replace(/\s*\+\s*/g, "+")})` : ""}
            </div>
          </div>
        ) : null}
        <div className="welcome-logo">{icon}</div>
        <div className="welcome-title">{title}</div>
        <div className="welcome-subtitle" style={{ maxWidth: "420px", marginBottom: "1.5rem" }}>{message}</div>

        <div className="welcome-divider" />

        <div className="mode-actions" style={{ width: "100%" }}>
          <button className="kiosk-btn" style={{ width: "100%", height: "var(--cart-btn-height)", fontSize: "1.5rem" }} onClick={() => nav(back)}>
            ← Go Back
          </button>
          <button className="kiosk-btn" style={{ width: "100%", height: "calc(var(--cart-btn-height) - 10px)", fontSize: "1.3rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)" }} onClick={() => nav("/")}>
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
}
