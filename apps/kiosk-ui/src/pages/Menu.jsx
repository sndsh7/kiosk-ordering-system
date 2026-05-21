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
      <div className="kiosk-page">
        <div className="welcome-loading-text" style={{ margin: "auto" }}>Loading...</div>
      </div>
    );
  }

  const displayMode = status.mode ? status.mode.charAt(0).toUpperCase() + status.mode.slice(1).toLowerCase() : "";

  return (
    <div className="kiosk-page">
      <div className="kiosk-container">
        {/* HEADER */}
        <div className="kiosk-header">
          <button className="kiosk-back-btn" onClick={() => nav("/mode")}>
            ←
          </button>
        </div>

        {/* BALANCE */}
        <div className="kiosk-balance-card" style={{ marginBottom: "1.5rem", padding: "3rem 2rem" }}>
          {/* PROFILE + MODE NAME */}
          <ProfileAvatars entityName={status.entityName} photos={status.photos} mode={status.mode} />
          <div className="mode-name" style={{ marginBottom: "1.5rem", color: "var(--accent-gold)", fontSize: "1.3rem", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase" }}>
            {displayMode} MODE
          </div>

          <div className="kiosk-wallet-text" style={{ opacity: 0.8, fontSize: "1.2rem", textTransform: "uppercase", letterSpacing: "2px" }}>
            LOCKUP MONEY
          </div>
          <div className="kiosk-balance-amount" style={{ marginTop: "1rem" }}>
            ₹ {Math.max(0, remaining)}
          </div>
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
        <div className="kiosk-list" style={{ paddingBottom: "130px" }}>
          {items.map((it) => (
            <div key={it.id} className="kiosk-food-card">
              {/* IMAGE */}
              <div className="kiosk-food-image">
                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    alt={it.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>
                    🍽️
                  </div>
                )}
              </div>

              {/* DETAILS */}
              <div className="kiosk-food-info">
                <div className="kiosk-food-name">
                  {it.name}
                </div>

                <div className="kiosk-food-desc">
                  {it.description || "Fresh & delicious food item"}
                </div>

                <div className="kiosk-food-price">
                  ₹ {it.pricePoints}
                </div>
              </div>

              {/* BUTTON */}
              <div className="kiosk-btn-wrap">
                {(() => {
                  const cartItem = list.find(
                    (x) => x.item.id === it.id
                  );

                  const qty = cartItem?.qty || 0;

                  // SHOW ADD BUTTON
                  if (qty === 0) {
                    return (
                      <button
                        className="kiosk-btn"
                        disabled={it.pricePoints > remaining}
                        onClick={() =>
                          dispatch({
                            type: "ADD",
                            item: it
                          })
                        }
                      >
                        + ADD
                      </button>
                    );
                  }

                  // SHOW QUANTITY CONTROLLER
                  return (
                    <div className="kiosk-qty-wrap">
                      <button
                        className="kiosk-qty-btn"
                        onClick={() =>
                          dispatch({
                            type: "DEC",
                            itemId: it.id
                          })
                        }
                      >
                        -
                      </button>

                      <div className="kiosk-qty-text">
                        {qty}
                      </div>

                      <button
                        className="kiosk-qty-btn"
                        disabled={it.pricePoints > remaining}
                        onClick={() =>
                          dispatch({
                            type: "ADD",
                            item: it
                          })
                        }
                      >
                        +
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* CART */}
        <div className="kiosk-cart-wrapper">
          <button
            className="kiosk-cart-btn"
            onClick={() => nav("/cart")}
          >
            <div className="kiosk-cart-left">
              <div className="kiosk-cart-icon">
                🛒
              </div>

              {cartCount > 0 && (
                <div className="kiosk-cart-badge">
                  {cartCount}
                </div>
              )}
            </div>

            <div className="kiosk-cart-center">
              VIEW CART
            </div>

            <div className="kiosk-cart-right">
              ₹ {total}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}