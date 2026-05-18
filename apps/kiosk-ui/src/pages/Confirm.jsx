import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKioskStatus, placeOrder } from "../lib/kioskApi";
import { useCart } from "../state/cart.jsx";

export default function Confirm() {
  const nav = useNavigate();
  const { list, total, dispatch } = useCart();
  const [balance, setBalance] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getKioskStatus();
      setBalance(s.balance);
    })();
  }, []);

  const remaining = balance - total;

  async function submit() {
    setBusy(true);
    try {
      const payload = list.map((x) => ({ itemId: x.item.id, quantity: x.qty }));
      const result = await placeOrder(payload);
      dispatch({ type: "CLEAR" });
      nav("/success", { state: { remaining, orderId: result.orderId } });
    } catch (e) {
      const err = e?.response?.data?.error || "SERVER_ERROR";
      const balanceServer = e?.response?.data?.balance;
      nav("/error", { state: { error: err, balance: balanceServer } });
    } finally {
      setBusy(false);
    }
  }

  if (list.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>🛒</div>
          <div style={styles.emptyText}>No items in cart.</div>
          <button style={styles.emptyBtn} onClick={() => nav("/menu")}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => nav("/cart")}>←</button>
        <div style={styles.headerTitle}>CONFIRM ORDER</div>
        <div style={styles.headerIcon}>✅</div>
      </div>

      {/* ORDER SUMMARY */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryTitle}>ORDER SUMMARY</div>
        <div style={styles.itemList}>
          {list.map(({ item, qty }) => (
            <div key={item.id} style={styles.itemRow}>
              <div style={styles.itemName}>{item.name}</div>
              <div style={styles.itemQty}>× {qty}</div>
              <div style={styles.itemPrice}>₹ {item.pricePoints * qty}</div>
            </div>
          ))}
        </div>
        <div style={styles.divider} />
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>TOTAL</span>
          <span style={styles.totalAmount}>₹ {total}</span>
        </div>
      </div>

      {/* BALANCE CARD */}
      <div style={styles.balanceCard}>
        <div style={styles.balRow}>
          <span style={styles.balLabel}>Wallet Balance</span>
          <span style={styles.balValue}>₹ {balance}</span>
        </div>
        <div style={styles.balRow}>
          <span style={styles.balLabel}>Order Total</span>
          <span style={{ ...styles.balValue, color: "#ff4444" }}>− ₹ {total}</span>
        </div>
        <div style={styles.thinDivider} />
        <div style={styles.balRow}>
          <span style={styles.balLabel}>Remaining</span>
          <span style={{ ...styles.balValue, color: remaining < 0 ? "#ff4444" : "#ffcc00" }}>
            ₹ {Math.max(0, remaining)}
          </span>
        </div>
      </div>

      {/* ACTIONS */}
      <div style={styles.actions}>
        <button style={styles.cancelBtn} disabled={busy} onClick={() => nav("/cart")}>
          ✕ CANCEL
        </button>
        <button
          style={{
            ...styles.placeBtn,
            ...(busy || total > balance ? styles.placeBtnDisabled : {}),
          }}
          disabled={busy || total > balance}
          onClick={submit}
        >
          {busy ? "⏳ PROCESSING…" : "✓ PLACE ORDER"}
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
  summaryCard: {
    border: "2px solid rgba(255,0,0,0.5)",
    background: "linear-gradient(180deg, #3d0000, #170000)",
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    boxShadow: "0 0 30px rgba(255,0,0,0.2)",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 2,
    opacity: 0.7,
    marginBottom: 16,
  },
  itemList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 20,
    fontWeight: 700,
  },
  itemQty: {
    fontSize: 18,
    opacity: 0.7,
    minWidth: 40,
    textAlign: "center",
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: 900,
    color: "#ffcc00",
    minWidth: 80,
    textAlign: "right",
  },
  divider: {
    height: 1,
    background: "rgba(255,0,0,0.3)",
    margin: "16px 0",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: 2,
  },
  totalAmount: {
    fontSize: 34,
    fontWeight: 900,
    color: "#ffcc00",
  },
  balanceCard: {
    border: "1px solid rgba(255,0,0,0.35)",
    background: "linear-gradient(90deg, #2b0000, #160000)",
    borderRadius: 18,
    padding: "16px 24px",
    marginBottom: 16,
  },
  balRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  balLabel: {
    fontSize: 18,
    opacity: 0.8,
  },
  balValue: {
    fontSize: 22,
    fontWeight: 900,
    color: "#ffcc00",
  },
  thinDivider: {
    height: 1,
    background: "rgba(255,255,255,0.1)",
  },
  actions: {
    position: "fixed",
    bottom: 16,
    left: 18,
    right: 18,
    display: "flex",
    gap: 14,
  },
  cancelBtn: {
    flex: 1,
    height: 90,
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 24,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: 1,
  },
  placeBtn: {
    flex: 2,
    height: 90,
    borderRadius: 22,
    border: "1px solid rgba(255,0,0,0.7)",
    background: "linear-gradient(90deg, #420000, #ff1f1f)",
    color: "#fff",
    fontSize: 28,
    fontWeight: 900,
    cursor: "pointer",
    letterSpacing: 1,
    boxShadow: "0 0 20px rgba(255,0,0,0.3)",
  },
  placeBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  emptyCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyText: { fontSize: 28, fontWeight: 700, opacity: 0.7, marginBottom: 24 },
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
};
