import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  connectSocket,
  getCategories,
  getItems,
  getKioskStatus
} from "../lib/kioskApi";

import { useCart } from "../state/cart.jsx";
import ProfileAvatars from "../components/ProfileAvatars";

import backArrowIcon from "../assets/Back_Arrow.png";
import backgroundImg from "../assets/Background.png";
import logoBgImg from "../assets/Asset_LogoBg.png";
import groupIcon from "../assets/GroupIcon.png";
import pairIcon from "../assets/PairIcon.png";
import singleIcon from "../assets/Single.png";
import cartIconPng from "../assets/Cart.png";

export default function Menu() {
  const nav = useNavigate();

  const { dispatch, list, total } = useCart();

  const [status, setStatus] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [items, setItems] = useState([]);

  const balance = status?.balance ?? 0;
  const remaining = balance - total;

  useEffect(() => {
    let socket;

    (async () => {
      const s = await getKioskStatus();
      setStatus(s);

      const cats = await getCategories();
      setCategories(cats);

      const first = cats[0]?.id ?? null;
      setActiveCat(first);

      if (first) {
        setItems(await getItems(first));
      }

      socket = connectSocket(setStatus);
    })();

    return () => socket?.disconnect();
  }, []);

  useEffect(() => {
    (async () => {
      if (activeCat) {
        setItems(await getItems(activeCat));
      }
    })();
  }, [activeCat]);

  const cartCount = useMemo(
    () => list.reduce((s, x) => s + x.qty, 0),
    [list]
  );

  if (!status) {
    return (
      <div className="kiosk-page" style={{ backgroundImage: `url(${backgroundImg})`, backgroundSize: "cover", backgroundColor: "#000" }}>
        <div className="welcome-loading-text" style={{ margin: "auto" }}>Loading...</div>
      </div>
    );
  }

  const modeIconSrc = status?.mode?.toLowerCase() === 'individual' ? singleIcon :
    status?.mode?.toLowerCase() === 'pair' ? pairIcon :
      status?.mode?.toLowerCase() === 'group' ? groupIcon : null;

  const displayMode = status.mode ? status.mode.toUpperCase() : "";

  return (
    <div className="kiosk-page menu-page" style={{ height: "100vh", maxHeight: "100vh", overflow: "hidden", backgroundImage: `url(${backgroundImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundColor: "#000" }}>
      {/* TOP SPOTLIGHT GLOW */}
      <div className="menu-spotlight" />

      <div className="kiosk-container" style={{ height: "100%", overflow: "hidden" }}>
        {/* HEADER */}
        <div className="kiosk-header" style={{ marginBottom: "0.5rem" }}>
          <div className="header-left-col">
            <button className="kiosk-back-btn" onClick={() => nav("/mode")} style={{ background: "none", border: "none", padding: 0 }}>
              <img src={backArrowIcon} alt="Back" className="header-back-icon" />
            </button>
          </div>
          <div className="kiosk-header-title" style={{ fontSize: "2rem" }}></div>
          <div className="header-right-col">
            {modeIconSrc && <img src={modeIconSrc} alt={status.mode} className="header-mode-icon" />}
          </div>
        </div>

        {/* BALANCE CARD — using Asset_LogoBg */}
        <div className="menu-balance-card" style={{ backgroundImage: `url(${logoBgImg})`, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat", backgroundColor: "transparent", border: "none", boxShadow: "none" }}>
          {status.mode?.toLowerCase() === "group" ? (
            <div className="menu-balance-mode">{displayMode}</div>
          ) : (
            <>
              <ProfileAvatars entityName={status.entityName} photos={status.photos} mode={status.mode} />
              <div className="menu-balance-entity">{status.entityName}</div>
            </>
          )}
          <div className="menu-balance-label">LOCKUPP MONEY</div>
          <div className="menu-balance-amount">₹{Math.max(0, remaining)}</div>
        </div>

        {/* CATEGORY TABS */}
        <div className="kiosk-tabs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`kiosk-tab-btn ${activeCat === c.id ? "active" : ""}`}
            >
              {c.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* FOOD LIST */}
        <div className="menu-food-list" style={{ flex: 1, overflowY: "auto", paddingBottom: "130px" }}>
          {items.map((it) => {
            const cartItem = list.find((x) => x.item.id === it.id);
            const qty = cartItem?.qty || 0;

            return (
              <div key={it.id} className="menu-food-card">
                {/* IMAGE */}
                {status.showItemImages !== false && (
                  <div className="menu-food-image">
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="menu-food-image-placeholder">🍽️</div>
                    )}
                  </div>
                )}

                {/* DETAILS */}
                <div className="menu-food-info">
                  <div className="menu-food-name">{it.name}</div>
                  <div className="menu-food-desc">
                    {it.description || "Fresh & delicious food item"}
                  </div>
                  <div className="menu-food-price">₹ {it.pricePoints}</div>
                </div>

                {/* ADD / QTY */}
                <div className="menu-food-action">
                  {qty === 0 ? (
                    <button
                      className="menu-add-btn"
                      disabled={it.pricePoints > remaining}
                      onClick={() => dispatch({ type: "ADD", item: it })}
                    >
                      +ADD
                    </button>
                  ) : (
                    <div className="menu-qty-wrap">
                      <button
                        className="menu-qty-btn"
                        onClick={() => dispatch({ type: "DEC", itemId: it.id })}
                      >
                        −
                      </button>
                      <div className="menu-qty-text">{qty}</div>
                      <button
                        className="menu-qty-btn"
                        disabled={it.pricePoints > remaining}
                        onClick={() => dispatch({ type: "ADD", item: it })}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* VIEW CART BAR */}
        <div className="kiosk-cart-wrapper">
          <button
            className="kiosk-cart-btn"
            onClick={() => nav("/cart")}
          >
            <div className="kiosk-cart-left">
              <div className="kiosk-cart-icon">
                <img src={cartIconPng} alt="Cart" style={{ height: "1em", width: "auto" }} />
              </div>
              {cartCount > 0 && (
                <div className="kiosk-cart-badge">{cartCount}</div>
              )}
            </div>
            <div className="kiosk-cart-center">VIEW CART</div>
            <div className="kiosk-cart-right">₹{total}</div>
          </button>
        </div>
      </div>
    </div>
  );
}