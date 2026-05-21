import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKioskStatus, placeOrder } from "../lib/kioskApi";
import { useCart } from "../state/cart.jsx";
import ProfileAvatars from "../components/ProfileAvatars";

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
      <div className="kiosk-page">
        <div className="kiosk-card">
          <div className="welcome-error-icon">🛒</div>
          <div className="welcome-title" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>No items in cart.</div>
          <button className="kiosk-btn" onClick={() => nav("/menu")}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const modeIcon = status?.mode?.toLowerCase() === 'individual' ? '👤' :
    status?.mode?.toLowerCase() === 'pair' ? '👥' :
      status?.mode?.toLowerCase() === 'group' ? '👨‍👦‍👦' : '⚙️';

  return (
    <div className="kiosk-page">
      <div className="kiosk-container">
        {/* HEADER */}
        <div className="kiosk-header">
          <div style={{ width: "60px" }}>
            <button className="kiosk-back-btn" onClick={() => nav("/cart")}>←</button>
          </div>
          <div className="kiosk-header-title">CONFIRM ORDER</div>
          <div style={{ width: "60px", textAlign: "right" }}>
            <span style={{ fontSize: "2.5rem" }}>{modeIcon}</span>
          </div>
        </div>

        {/* PROFILE CARD */}
        {status?.entityName && (
          <div className="kiosk-balance-card" style={{ marginBottom: "1.5rem", padding: "1.5rem 2rem" }}>
            {status.mode?.toLowerCase() === "group" ? (
              <div className="mode-name" style={{ color: "#fff", fontSize: "1.2rem", letterSpacing: "1px" }}>
                {status.groupName}
              </div>
            ) : (
              <>
                <ProfileAvatars entityName={status.entityName} photos={status.photos} mode={status.mode} />
                <div className="mode-name" style={{ marginTop: "1.5rem", color: "#fff", fontSize: "1.2rem", letterSpacing: "1px", textTransform: "uppercase" }}>
                  {status.entityName}
                </div>
              </>
            )}
          </div>
        )}

        {/* ORDER SUMMARY */}
        <div className="kiosk-balance-card" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
          <div className="mode-label" style={{ marginBottom: "1rem" }}>ORDER SUMMARY</div>
          <div className="kiosk-list" style={{ gap: "0.8rem" }}>
            {list.map(({ item, qty }) => (
              <div key={item.id} className="confirm-item-row">
                <div className="confirm-item-name">{item.name}</div>
                <div className="confirm-item-qty">× {qty}</div>
                <div className="confirm-item-price">₹ {item.pricePoints * qty}</div>
              </div>
            ))}
          </div>
          <div className="cart-divider" style={{ margin: "1.2rem 0" }} />
          <div className="confirm-item-row" style={{ justifyContent: "space-between" }}>
            <span className="confirm-total-label">TOTAL</span>
            <span className="confirm-total-amount">₹ {total}</span>
          </div>
        </div>

        {/* BALANCE CARD */}
        <div className="kiosk-balance-card" style={{ marginBottom: "2rem" }}>
          <div className="cart-balance-row">
            <span className="cart-balance-label">Wallet Balance</span>
            <span className="cart-balance-value">₹ {balance}</span>
          </div>
          <div className="cart-balance-row">
            <span className="cart-balance-label">Order Total</span>
            <span className="cart-balance-value" style={{ color: "#ff4444" }}>− ₹ {total}</span>
          </div>
          <div className="cart-divider" style={{ opacity: 0.3 }} />
          <div className="cart-balance-row">
            <span className="cart-balance-label">Remaining</span>
            <span className="cart-balance-value" style={{ color: remaining < 0 ? "#ff4444" : "#ffcc00" }}>
              ₹ {Math.max(0, remaining)}
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="kiosk-actions-fixed">
          <button className="kiosk-clear-btn" disabled={busy} onClick={() => nav("/cart")}>
            ✕ CANCEL
          </button>
          <button
            className="kiosk-proceed-btn"
            disabled={busy || total > balance}
            style={{ opacity: busy || total > balance ? 0.4 : 1, cursor: busy || total > balance ? "not-allowed" : "pointer" }}
            onClick={submit}
          >
            {busy ? "⏳ PROCESSING…" : "✓ PLACE ORDER"}
          </button>
        </div>
      </div>
    </div>
  );
}
