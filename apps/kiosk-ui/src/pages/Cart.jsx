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
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => nav("/menu")}>←</button>
        <div style={styles.headerTitle}>YOUR CART</div>
        <div style={styles.headerIcon}>🛒</div>
      </div>

      {/* BALANCE SUMMARY */}
      <div style={styles.balanceCard}>
        <div style={styles.balanceRow}>
          <span style={styles.balanceLabel}>Total</span>
          <span style={styles.balanceValue}>₹ {total}</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.balanceRow}>
          <span style={styles.balanceLabel}>Wallet</span>
          <span style={styles.balanceValue}>₹ {balance}</span>
        </div>
        <div style={styles.balanceRow}>
          <span style={styles.balanceLabel}>Remaining</span>
          <span style={{ ...styles.balanceValue, color: remaining < 0 ? "#ff4444" : "#ffcc00" }}>
            ₹ {Math.max(0, remaining)}
          </span>
        </div>
        {total > balance && (
          <div style={styles.warningText}>
            ⚠ Insufficient balance. Remove items to proceed.
          </div>
        )}
      </div>

      {/* ITEM LIST */}
      {list.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🛒</div>
          <div style={styles.emptyText}>Your cart is empty</div>
          <button style={styles.emptyBtn} onClick={() => nav("/menu")}>
            Browse Menu
          </button>
        </div>
      ) : (
        <div style={styles.itemList}>
          {list.map(({ item, qty }) => (
            <div key={item.id} style={styles.itemCard}>
              <div style={styles.itemInfo}>
                <div style={styles.itemName}>{item.name}</div>
                <div style={styles.itemPrice}>
                  ₹ {item.pricePoints} × {qty} = <span style={styles.itemTotal}>₹ {item.pricePoints * qty}</span>
                </div>
              </div>

              {/* QTY STEPPER */}
              <div style={styles.qtyWrap}>
                <button
                  style={styles.qtyBtn}
                  onClick={() => dispatch({ type: "DEC", itemId: item.id })}
                >
                  −
                </button>
                <div style={styles.qtyText}>{qty}</div>
                <button
                  style={styles.qtyBtn}
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
      <div style={styles.actions}>
        <button
          style={styles.clearBtn}
          disabled={list.length === 0}
          onClick={() => dispatch({ type: "CLEAR" })}
        >
          🗑 CLEAR
        </button>
        <button
          style={{
            ...styles.proceedBtn,
            ...(canProceed ? {} : styles.proceedDisabled),
          }}
          disabled={!canProceed}
          onClick={() => nav("/confirm")}
        >
          PROCEED →
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #2b0000, #000)",
    padding: 18,
    paddingBottom: 140,
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 48,
    cursor: "pointer",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: 1,
  },
  headerIcon: {
    fontSize: 34,
  },
  balanceCard: {
    border: "2px solid rgba(255,0,0,0.5)",
    background: "linear-gradient(180deg, #3d0000, #170000)",
    borderRadius: 24,
    padding: "20px 28px",
    marginBottom: 18,
    boxShadow: "0 0 30px rgba(255,0,0,0.2)",
  },
  balanceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    paddingTop: 8,
  },
  balanceLabel: {
    fontSize: 20,
    fontWeight: 600,
    opacity: 0.8,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 900,
    color: "#ffcc00",
  },
  divider: {
    height: 1,
    background: "rgba(255,0,0,0.3)",
    margin: "4px 0",
  },
  warningText: {
    color: "#ff4444",
    fontSize: 18,
    fontWeight: 700,
    marginTop: 10,
    textAlign: "center",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
  },
  emptyIcon: { fontSize: 70, marginBottom: 16 },
  emptyText: { fontSize: 26, fontWeight: 700, opacity: 0.7, marginBottom: 24 },
  emptyBtn: {
    padding: "16px 40px",
    borderRadius: 16,
    border: "none",
    background: "linear-gradient(180deg, #ff1f1f, #920000)",
    color: "#fff",
    fontSize: 22,
    fontWeight: 800,
    cursor: "pointer",
  },
  itemList: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginBottom: 24,
  },
  itemCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(90deg, #2b0000, #160000)",
    border: "1px solid rgba(255,0,0,0.35)",
    borderRadius: 18,
    padding: "16px 18px",
    gap: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 18,
    opacity: 0.8,
  },
  itemTotal: {
    color: "#ffcc00",
    fontWeight: 900,
  },
  qtyWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: 148,
    height: 56,
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid rgba(255,0,0,0.7)",
    background: "linear-gradient(180deg, #ff1f1f, #920000)",
    boxShadow: "0 0 12px rgba(255,0,0,0.3)",
    flexShrink: 0,
  },
  qtyBtn: {
    width: 48,
    height: "100%",
    border: "none",
    background: "transparent",
    color: "#fff",
    fontSize: 30,
    fontWeight: 900,
    cursor: "pointer",
  },
  qtyText: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 22,
    fontWeight: 900,
  },
  actions: {
    position: "fixed",
    bottom: 16,
    left: 18,
    right: 18,
    display: "flex",
    gap: 14,
  },
  clearBtn: {
    flex: 1,
    height: 90,
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 26,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: 1,
  },
  proceedBtn: {
    flex: 2,
    height: 90,
    borderRadius: 22,
    border: "1px solid rgba(255,0,0,0.7)",
    background: "linear-gradient(90deg, #420000, #ff1f1f)",
    color: "#fff",
    fontSize: 30,
    fontWeight: 900,
    cursor: "pointer",
    letterSpacing: 1,
    boxShadow: "0 0 20px rgba(255,0,0,0.3)",
  },
  proceedDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
};
