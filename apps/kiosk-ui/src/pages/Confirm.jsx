import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKioskStatus, placeOrder } from "../lib/kioskApi";
import { useCart } from "../state/cart.jsx";
import ProfileAvatars from "../components/ProfileAvatars";

import backArrowIcon from "../assets/Back_Arrow.png";
import backgroundImg from "../assets/Background.png";
import boxBg from "../assets/Box.png";
import placeOrderImg from "../assets/Asset_PLACE-ORDER.png";
import groupIcon from "../assets/GroupIcon.png";
import pairIcon from "../assets/PairIcon.png";
import singleIcon from "../assets/Single.png";

export default function Confirm() {
  const nav = useNavigate();
  const { list, total, dispatch } = useCart();
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getKioskStatus();
      setStatus(s);
    })();
  }, []);

  const balance = status?.balance || 0;
  const remaining = balance - total;

  async function submit() {
    setBusy(true);
    try {
      const payload = list.map((x) => ({ itemId: x.item.id, quantity: x.qty }));
      const result = await placeOrder(payload);
      dispatch({ type: "CLEAR" });
      nav("/success", { state: { remaining, orderId: result.orderId, entityName: status?.entityName, photos: status?.photos, mode: status?.mode } });
    } catch (e) {
      const err = e?.response?.data?.error || "SERVER_ERROR";
      const balanceServer = e?.response?.data?.balance;
      nav("/error", { state: { error: err, balance: balanceServer, entityName: status?.entityName, photos: status?.photos, mode: status?.mode } });
    } finally {
      setBusy(false);
    }
  }

  if (list.length === 0) {
    return (
      <div className="kiosk-page" style={{ backgroundImage: `url(${backgroundImg})`, backgroundSize: "cover", backgroundColor: "#000" }}>
        <div className="kiosk-card">
          <div className="welcome-error-icon">🛒</div>
          <div className="welcome-title" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>No items in cart.</div>
          <button className="kiosk-btn" onClick={() => nav("/menu")}>Back to Menu</button>
        </div>
      </div>
    );
  }

  const modeIconSrc = status?.mode?.toLowerCase() === 'individual' ? singleIcon :
    status?.mode?.toLowerCase() === 'pair' ? pairIcon :
      status?.mode?.toLowerCase() === 'group' ? groupIcon : null;

  const displayMode = status?.mode ? status.mode.toUpperCase() : "";

  return (
    <div className="kiosk-page menu-page" style={{ height: "100vh", maxHeight: "100vh", overflow: "hidden", backgroundImage: `url(${backgroundImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundColor: "#000" }}>
      {/* TOP SPOTLIGHT GLOW */}
      <div className="menu-spotlight" />

      <div className="kiosk-container" style={{ height: "100%", overflow: "hidden" }}>
        {/* HEADER */}
        <div className="kiosk-header" style={{ marginBottom: "0.5rem" }}>
          <div className="header-left-col">
            <button className="kiosk-back-btn" onClick={() => nav("/cart")} style={{ background: "none", border: "none", padding: 0 }}>
              <img src={backArrowIcon} alt="Back" className="header-back-icon" />
            </button>
          </div>
          <div className="kiosk-header-title">CONFIRM ORDER</div>
          <div className="header-right-col">
            {modeIconSrc && status && <img src={modeIconSrc} alt={status.mode} className="header-mode-icon" />}
          </div>
        </div>

        {/* MODE BOX CARD — just mode name, no balance */}
        {status && (
          <div className="confirm-mode-box" style={{ backgroundImage: `url(${boxBg})`, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}>
            {status.mode?.toLowerCase() === "group" ? (
              <div className="menu-balance-mode">{displayMode}</div>
            ) : (
              <>
                <ProfileAvatars entityName={status.entityName} photos={status.photos} mode={status.mode} />
                <div className="menu-balance-entity">{status.entityName}</div>
              </>
            )}
          </div>
        )}

        {/* SCROLLABLE CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: "1rem" }}>

          {/* ORDER SUMMARY BOX */}
          <div className="confirm-summary-box">
            <div className="confirm-summary-header">ORDER SUMMARY</div>
            {list.map(({ item, qty }) => (
              <div key={item.id} className="confirm-item-row">
                <div className="confirm-item-name">{item.name}</div>
                <div className="confirm-item-qty-price">{qty}X ₹{item.pricePoints}</div>
              </div>
            ))}
          </div>

          {/* TOTAL ROW */}
          <div className="confirm-total-row">
            <span className="confirm-total-label">TOTAL</span>
            <span className="confirm-total-amount">₹{total}</span>
          </div>

          {/* BALANCE BOX */}
          <div className="confirm-balance-box">
            <div className="confirm-balance-row">
              <span className="confirm-balance-label">WALLET BALANCE</span>
              <span className="confirm-balance-value">₹{balance}</span>
            </div>
            <div className="confirm-balance-row">
              <span className="confirm-balance-label">ORDER TOTAL</span>
              <span className="confirm-balance-value" style={{ color: "#ff4444" }}>−₹{total}</span>
            </div>
          </div>

          {/* REMAINING ROW */}
          <div className="confirm-remaining-row">
            <span className="confirm-remaining-label">REMAINING</span>
            <span className="confirm-remaining-value" style={{ color: remaining < 0 ? "#ff4444" : "#00e676" }}>₹{Math.max(0, remaining)}</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="kiosk-actions-fixed">
          <button
            className="action-btn-clear"
            disabled={busy}
            onClick={() => nav("/cart")}
            style={{ opacity: busy ? 0.4 : 1 }}
          >
            ✕ CANCEL
          </button>
          <button
            disabled={busy || total > balance}
            style={{ flex: 2, height: "var(--cart-btn-height)", padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', boxShadow: 'none', cursor: "pointer", opacity: busy || total > balance ? 0.4 : 1 }}
            onClick={submit}
          >
            {busy ? (
              <span style={{ fontSize: "var(--font-body-lg)", fontWeight: 900, color: "#fff", background: "linear-gradient(180deg, #e03030, #8b0000)", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px" }}>
                ⏳ PROCESSING…
              </span>
            ) : (
              <img src={placeOrderImg} alt="Place Order" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
