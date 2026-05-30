import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKioskStatus } from "../lib/kioskApi";
import { useCart } from "../state/cart.jsx";
import ProfileAvatars from "../components/ProfileAvatars";
import { formatPoints } from "../lib/formatPoints";

import backArrowIcon from "../assets/Back_Arrow.png";
import backgroundImg from "../assets/Background.png";
import boxBg from "../assets/Box.png";
import groupIcon from "../assets/GroupIcon.png";
import pairIcon from "../assets/PairIcon.png";
import singleIcon from "../assets/Single.png";

export default function Cart() {
  const nav = useNavigate();
  const { list, total, dispatch } = useCart();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    (async () => {
      const s = await getKioskStatus();
      setStatus(s);
    })();
  }, []);

  const balance = status?.balance || 0;
  const remaining = balance - total;
  const canProceed = list.length > 0 && total <= balance;

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
            <button className="kiosk-back-btn" onClick={() => nav("/menu")} style={{ background: "none", border: "none", padding: 0 }}>
              <img src={backArrowIcon} alt="Back" className="header-back-icon" />
            </button>
          </div>
          <div className="kiosk-header-title">YOUR CART</div>
          <div className="header-right-col">
            {modeIconSrc && status && <img src={modeIconSrc} alt={status.mode} className="header-mode-icon" />}
          </div>
        </div>

        {/* BALANCE CARD — Box.png */}
        {status && (
          <div className="menu-balance-card" style={{ backgroundImage: `url(${boxBg})`, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat", backgroundColor: "transparent", border: "none", boxShadow: "none" }}>
            {status.mode?.toLowerCase() !== "group" && (
              <>
                <ProfileAvatars entityName={status.entityName} photos={status.photos} mode={status.mode} />
                <div className="menu-balance-entity">{status.entityName}</div>
              </>
            )}
            <div className="menu-balance-label">WEEKLY MONEY BANK</div>
            <div className="menu-balance-amount">{formatPoints(Math.max(0, remaining))}</div>
          </div>
        )}

        {/* SUMMARY ROWS */}
        <div className="cart-summary-box">
          <div className="cart-summary-group">
            <div className="cart-summary-row">
              <span className="cart-summary-label">ORDER TOTAL</span>
              <span className="cart-summary-value" style={{ color: "#00e676" }}>{formatPoints(total)}</span>
            </div>
          </div>

          <div className="cart-summary-group">
            <div className="cart-summary-row">
              <span className="cart-summary-label">WEEKLY MONEY BANK</span>
              <span className="cart-summary-value" style={{ color: "#00e676" }}>{formatPoints(balance)}</span>
            </div>
            <div className="cart-summary-row">
              <span className="cart-summary-label">REMAINNING BALANCE</span>
              <span className="cart-summary-value" style={{ color: remaining < 0 ? "#ff4444" : "#00e676" }}>{formatPoints(Math.max(0, remaining))}</span>
            </div>
          </div>
          {total > balance && (
            <div className="cart-warning-text">⚠ Insufficient balance. Remove items to proceed.</div>
          )}
        </div>

        {/* ITEM LIST */}
        {list.length === 0 ? (
          <div className="cart-empty-state">
            <div className="cart-empty-icon">🛒</div>
            <div className="cart-empty-text">Your cart is empty</div>
            <button className="kiosk-btn" style={{ marginTop: "2rem" }} onClick={() => nav("/menu")}>
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="kiosk-list" style={{ flex: 1, overflowY: "auto", marginBottom: "1rem" }}>
            {list.map(({ item, qty }) => (
              <div key={item.id} className="cart-item-card">
                {/* IMAGE */}
                {status?.showItemImages !== false && (
                  <div className="kiosk-food-image">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>🍽️</div>
                    )}
                  </div>
                )}

                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">
                    {formatPoints(item.pricePoints)} × {qty} = <span className="cart-item-total">{formatPoints(item.pricePoints * qty)}</span>
                  </div>
                </div>

                {/* QTY STEPPER */}
                <div className="menu-qty-wrap">
                  <button className="menu-qty-btn" onClick={() => dispatch({ type: "DEC", itemId: item.id })}>−</button>
                  <div className="menu-qty-text">{qty}</div>
                  <button className="menu-qty-btn" onClick={() => dispatch({ type: "INC", itemId: item.id })}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <div className="kiosk-actions-fixed">
          <button
            className="action-btn-clear"
            disabled={list.length === 0}
            onClick={() => dispatch({ type: "CLEAR" })}
            style={{ opacity: list.length === 0 ? 0.4 : 1 }}
          >
            🗑 CLEAR
          </button>
          <button
            className="action-btn-proceed"
            disabled={!canProceed}
            style={{ opacity: canProceed ? 1 : 0.4 }}
            onClick={() => nav("/confirm")}
          >
            CHECKOUT →
          </button>
        </div>
      </div>
    </div>
  );
}
