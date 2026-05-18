import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { connectSocket } from "./lib/kioskApi";

import Welcome from "./pages/Welcome.jsx";
import ModeInfo from "./pages/ModeInfo.jsx";
import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import Confirm from "./pages/Confirm.jsx";
import Success from "./pages/Success.jsx";
import ErrorScreen from "./pages/ErrorScreen.jsx";

export default function App() {
  const [flash, setFlash] = useState(null);

  // Global socket — always connected so flash works on every page
  useEffect(() => {
    const socket = connectSocket(
      () => {}, // kiosk:update handled per-page
      (data) => {
        setFlash(data);
        setTimeout(() => setFlash(null), 8000);
      }
    );
    return () => socket.disconnect();
  }, []);

  return (
    <>
      {/* ── GLOBAL FLASH OVERLAY ─────────────────────────────────────────── */}
      {flash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              flash.type === "BONUS"
                ? "radial-gradient(circle at center, #003300 0%, #000 100%)"
                : "radial-gradient(circle at center, #2b0000 0%, #000 100%)",
            animation: "kFlashIn 0.35s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              background:
                flash.type === "BONUS"
                  ? "linear-gradient(180deg,#004d00,#001a00)"
                  : "linear-gradient(180deg,#3d0000,#0a0000)",
              border:
                flash.type === "BONUS"
                  ? "2px solid rgba(0,200,0,0.6)"
                  : "2px solid rgba(255,0,0,0.7)",
              borderRadius: 32,
              padding: "52px 44px 40px",
              maxWidth: 400,
              width: "88%",
              boxShadow:
                flash.type === "BONUS"
                  ? "0 0 100px rgba(0,200,0,0.35)"
                  : "0 0 100px rgba(255,0,0,0.35)",
            }}
          >
            {flash.type === "BONUS" ? (
              <>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#ffdd00",
                    letterSpacing: 3,
                    marginBottom: 6,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  CONGRATULATIONS!
                </div>
                <div style={{ fontSize: 96, lineHeight: 1.1 }}>🏆</div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 900,
                    color: "#ffdd00",
                    marginTop: 10,
                    letterSpacing: 2,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  TASK WON!
                </div>
                <div
                  style={{
                    fontSize: 17,
                    color: "#ccc",
                    marginTop: 12,
                    lineHeight: 1.6,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  Bonus Added To
                  <br />
                  <strong style={{ color: "#fff" }}>{flash.entityName || "Wallet"}</strong>
                </div>
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 900,
                    color: "#00e676",
                    marginTop: 16,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  + ₹ {flash.points}
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#ff4444",
                    letterSpacing: 3,
                    marginBottom: 6,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  RULE VIOLATION!
                </div>
                <div style={{ fontSize: 96, lineHeight: 1.1 }}>⚠️</div>
                <div
                  style={{
                    fontSize: 17,
                    color: "#ccc",
                    marginTop: 14,
                    lineHeight: 1.6,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  Penalty Deducted From
                  <br />
                  <strong style={{ color: "#fff" }}>{flash.entityName || "Wallet"}</strong>
                </div>
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 900,
                    color: "#ff4444",
                    marginTop: 16,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  − ₹ {flash.points}
                </div>
              </>
            )}

            {/* New balance box */}
            <div
              style={{
                marginTop: 24,
                background: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: "16px 28px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 3,
                  color: "rgba(255,255,255,0.45)",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                NEW BALANCE
              </div>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  color: "#ffcc00",
                  marginTop: 4,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                ₹ {flash.newBalance}
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => setFlash(null)}
              style={{
                marginTop: 22,
                width: "100%",
                padding: "18px",
                borderRadius: 16,
                border: "none",
                background:
                  flash.type === "BONUS"
                    ? "linear-gradient(180deg,#00aa44,#005522)"
                    : "linear-gradient(180deg,#cc2200,#660000)",
                color: "#fff",
                fontSize: 18,
                fontWeight: 900,
                cursor: "pointer",
                letterSpacing: 1.5,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {flash.type === "BONUS" ? "CONTINUE SHOPPING" : "OK, GOT IT"}
            </button>
          </div>

          <style>{`
            @keyframes kFlashIn {
              from { opacity: 0; transform: scale(0.9); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* ── ROUTES ──────────────────────────────────────────────────────── */}
      <Routes>
        <Route path="/"        element={<Welcome />} />
        <Route path="/mode"    element={<ModeInfo />} />
        <Route path="/menu"    element={<Menu />} />
        <Route path="/cart"    element={<Cart />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/success" element={<Success />} />
        <Route path="/error"   element={<ErrorScreen />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
