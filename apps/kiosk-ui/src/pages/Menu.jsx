import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  connectSocket,
  getCategories,
  getItems,
  getKioskStatus
} from "../lib/kioskApi";

import { useCart } from "../state/cart.jsx";

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
      <div style={styles.loading}>
        Loading...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <button
          style={styles.backBtn}
          onClick={() => nav("/mode")}
        >
          ←
        </button>

        <div style={styles.mode}>
          {status.mode?.toUpperCase()} MODE
        </div>

        <div style={styles.icon}>
          👥
        </div>
      </div>

      {/* BALANCE */}
      <div style={styles.balanceCard}>
        <div style={styles.walletText}>
          GROUP WALLET BALANCE
        </div>

        <div style={styles.balanceAmount}>
          ₹ {Math.max(0, remaining)}
        </div>

        <div style={styles.available}>
          Available Balance
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div style={styles.tabs}>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            style={{
              ...styles.tabBtn,
              ...(activeCat === c.id
                ? styles.activeTab
                : {})
            }}
          >
            {c.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* FOOD LIST */}
      <div style={styles.foodList}>
        {items.map((it) => (
          <div key={it.id} style={styles.foodCard}>
            {/* IMAGE */}
            <div style={styles.foodImage}>
              {it.imageUrl ? (
                <img
                  src={it.imageUrl}
                  alt={it.name}
                  style={styles.img}
                />
              ) : (
                <div style={styles.placeholder}>
                  🍽️
                </div>
              )}
            </div>

            {/* DETAILS */}
            <div style={styles.foodInfo}>
              <div style={styles.foodName}>
                {it.name}
              </div>

              <div style={styles.foodDesc}>
                {it.description ||
                  "Fresh & delicious food item"}
              </div>

              <div style={styles.foodPrice}>
                ₹ {it.pricePoints}
              </div>
            </div>

            {/* BUTTON */}
            {/* <button
              style={styles.addBtn}
              disabled={
                it.pricePoints > remaining
              }
              onClick={() =>
                dispatch({
                  type: "ADD",
                  item: it
                })
              }
            >
              + ADD
            </button> */}
            {(() => {
              const cartItem = list.find(
                (x) => x.item.id === it.id
              );

              const qty = cartItem?.qty || 0;

              // SHOW ADD BUTTON
              if (qty === 0) {
                return (
                  <button
                    style={styles.addBtn}
                    disabled={
                      it.pricePoints > remaining
                    }
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
                <div style={styles.qtyWrap}>
                  <button
                    style={styles.qtyBtn}
                    onClick={() =>
                      dispatch({
                        type: "DEC",
                        itemId: it.id
                      })
                    }
                  >
                    -
                  </button>

                  <div style={styles.qtyText}>
                    {qty}
                  </div>

                  <button
                    style={styles.qtyBtn}
                    disabled={
                      it.pricePoints > remaining
                    }
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
        ))}
      </div>

      {/* CART */}
      <div style={styles.cartWrapper}>
        <button
          style={styles.cartBtn}
          onClick={() => nav("/cart")}
        >
          <div style={styles.cartLeft}>
            <div style={styles.cartIcon}>
              🛒
            </div>

            {cartCount > 0 && (
              <div style={styles.badge}>
                {cartCount}
              </div>
            )}
          </div>

          <div style={styles.cartCenter}>
            VIEW CART
          </div>

          <div style={styles.cartRight}>
            ₹ {total}
          </div>
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #2b0000, #000)",
    padding: 18,
    paddingBottom: 120,
    color: "#fff",
    fontFamily: "Arial, sans-serif"
  },

  loading: {
    minHeight: "100vh",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff"
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20
  },

  backBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 48,
    cursor: "pointer"
  },

  mode: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: 1
  },

  icon: {
    fontSize: 34
  },

  balanceCard: {
    border:
      "2px solid rgba(255,0,0,0.5)",
    background:
      "linear-gradient(180deg, #3d0000, #170000)",
    borderRadius: 24,
    padding: 28,
    marginBottom: 18,
    boxShadow:
      "0 0 30px rgba(255,0,0,0.2)"
  },

  walletText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: 700,
    opacity: 0.9
  },

  balanceAmount: {
    textAlign: "center",
    fontSize: 78,
    fontWeight: 900,
    color: "#ffcc00",
    marginTop: 10,
    lineHeight: 1
  },

  available: {
    textAlign: "center",
    fontSize: 20,
    marginTop: 8
  },

  tabs: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    marginBottom: 16,
    overflow: "hidden",
    borderRadius: 16,
    background: "#050505"
  },

  tabBtn: {
    border: "none",
    background: "transparent",
    color: "#fff",
    padding: "18px 10px",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer"
  },

  activeTab: {
    background:
      "linear-gradient(180deg, #ff0000, #770000)",
    boxShadow:
      "inset 0 -4px 0 #ff2e2e"
  },

  foodList: {
    display: "flex",
    flexDirection: "column",
    gap: 14
  },

  foodCard: {
    display: "flex",
    alignItems: "center",
    background:
      "linear-gradient(90deg, #2b0000, #160000)",
    border:
      "1px solid rgba(255,0,0,0.35)",
    borderRadius: 18,
    padding: 12,
    gap: 16
  },

  foodImage: {
    width: 160,
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
    flexShrink: 0,
    background: "#111"
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  placeholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40
  },

  foodInfo: {
    flex: 1
  },

  foodName: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 8
  },

  foodDesc: {
    fontSize: 15,
    opacity: 0.8,
    lineHeight: 1.4,
    marginBottom: 10,
    maxWidth: 260
  },

  foodPrice: {
    fontSize: 20,
    fontWeight: 900,
    color: "#ffcc00"
  },

  addBtn: {
    minWidth: 170,
    height: 62,
    borderRadius: 16,
    border:
      "1px solid rgba(255,0,0,0.7)",
    background:
      "linear-gradient(180deg, #ff1f1f, #920000)",
    color: "#fff",
    fontSize: 20,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow:
      "0 0 15px rgba(255,0,0,0.3)"
  },

  cartWrapper: {
    position: "fixed",
    bottom: 16,
    left: 18,
    right: 18
  },

  cartBtn: {
    width: "100%",
    height: 90,
    borderRadius: 22,
    border:
      "1px solid rgba(255,0,0,0.5)",
    background:
      "linear-gradient(90deg, #420000, #1a0000)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    color: "#fff",
    cursor: "pointer"
  },

  cartLeft: {
    position: "relative",
    width: 80
  },

  cartIcon: {
    fontSize: 42
  },

  badge: {
    position: "absolute",
    top: -8,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#ff1f1f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 900
  },

  cartCenter: {
    fontSize: 34,
    fontWeight: 900,
    letterSpacing: 1
  },

  cartRight: {
    fontSize: 42,
    fontWeight: 900,
    color: "#ffcc00"
  },
  qtyWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 170,
    height: 62,
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(255,0,0,0.7)",
    background:
      "linear-gradient(180deg, #ff1f1f, #920000)",
    boxShadow:
      "0 0 15px rgba(255,0,0,0.3)"
  },

  qtyBtn: {
    width: 54,
    height: "100%",
    border: "none",
    background: "transparent",
    color: "#fff",
    fontSize: 34,
    fontWeight: 900,
    cursor: "pointer"
  },

  qtyText: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 24,
    fontWeight: 900
  }
};