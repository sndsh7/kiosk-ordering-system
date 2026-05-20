import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKioskStatus } from "../lib/kioskApi";
import { useCart } from "../state/cart.jsx";

export default function Cart() {
  const nav = useNavigate();
  const { list, total, dispatch } = useCart();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    (async () => {
      const s = await getKioskStatus();
      setBalance(s.balance);
    })();
  }, []);

  const remaining = balance - total;
  const canProceed = list.length > 0 && total <= balance;

  return (
    <div className="kiosk-page">
      <div className="kiosk-container">
        {/* HEADER */}
        <div className="kiosk-header">
          <button className="kiosk-back-btn" onClick={() => nav("/menu")}>←</button>
          <div className="kiosk-header-title">YOUR CART</div>
          <div className="kiosk-header-title" style={{ fontSize: "2rem" }}></div>
        </div>

        {/* BALANCE SUMMARY */}
        <div className="kiosk-balance-card">
          <div className="cart-balance-row">
            <span className="cart-balance-label">Total</span>
            <span className="cart-balance-value">₹ {total}</span>
          </div>
          <div className="cart-divider" />
          <div className="cart-balance-row">
            <span className="cart-balance-label">Wallet</span>
            <span className="cart-balance-value">₹ {balance}</span>
          </div>
          <div className="cart-balance-row">
            <span className="cart-balance-label">Remaining</span>
            <span className="cart-balance-value" style={{ color: remaining < 0 ? "#ff4444" : "#ffcc00" }}>
              ₹ {Math.max(0, remaining)}
            </span>
          </div>
          {total > balance && (
            <div className="cart-warning-text">
              ⚠ Insufficient balance. Remove items to proceed.
            </div>
          )}
        </div>

        {/* ITEM LIST */}
        {list.length === 0 ? (
          <div className="cart-empty-state">
            <div className="cart-empty-icon">🛒</div>
            <div className="cart-empty-text">Your cart is empty</div>
            <button className="kiosk-btn" style={{ height: "auto", padding: "1rem 2rem" }} onClick={() => nav("/menu")}>
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="kiosk-list" style={{ marginBottom: "2rem" }}>
            {list.map(({ item, qty }) => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">
                    ₹ {item.pricePoints} × {qty} = <span className="cart-item-total">₹ {item.pricePoints * qty}</span>
                  </div>
                </div>

                {/* QTY STEPPER */}
                <div className="cart-qty-wrap">
                  <button
                    className="cart-qty-btn"
                    onClick={() => dispatch({ type: "DEC", itemId: item.id })}
                  >
                    −
                  </button>
                  <div className="cart-qty-text">{qty}</div>
                  <button
                    className="cart-qty-btn"
                    onClick={() => dispatch({ type: "INC", itemId: item.id })}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <div className="kiosk-actions-fixed">
          <button
            className="kiosk-clear-btn"
            disabled={list.length === 0}
            onClick={() => dispatch({ type: "CLEAR" })}
          >
            🗑 CLEAR
          </button>
          <button
            className="kiosk-proceed-btn"
            disabled={!canProceed}
            style={{ opacity: canProceed ? 1 : 0.4, cursor: canProceed ? "pointer" : "not-allowed" }}
            onClick={() => nav("/confirm")}
          >
            PROCEED →
          </button>
        </div>
      </div>
    </div>
  );
}
