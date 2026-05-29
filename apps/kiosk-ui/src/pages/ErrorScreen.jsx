import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileAvatars from "../components/ProfileAvatars";

import backgroundImg from "../assets/Background.png";
import errorBoxBg from "../assets/Asset_congratulationsBox_Red.png";

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
    <div className="kiosk-page kiosk-page-success" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundImage: `url(${backgroundImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundColor: "#000" }}>
      <div className="kiosk-card kiosk-card-success" style={{ backgroundImage: `url(${errorBoxBg})`, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat", backgroundColor: "transparent", border: "none", boxShadow: "none", padding: "4rem", width: "80%", maxWidth: "800px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* PROFILE */}
        {entityName && mode?.toLowerCase() !== "group" && (
          <div style={{ width: "100%", marginBottom: "0.5rem" }}>
            <ProfileAvatars entityName={entityName} photos={photos} mode={mode} />
          </div>
        )}
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
