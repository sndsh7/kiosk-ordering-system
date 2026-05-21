import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { connectSocket } from "./lib/kioskApi";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ProfileAvatars from "./components/ProfileAvatars";

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
      {/* ── GLOBAL SPEED INSIGHTS ────────────────────────────────────────── */}
      <SpeedInsights />

      {/* ── GLOBAL FLASH OVERLAY ─────────────────────────────────────────── */}
      {flash && (
        <div
          className={`flash-overlay ${
            flash.type === "BONUS" ? "flash-overlay-bonus" : "flash-overlay-penalty"
          }`}
        >
          <div
            className={`flash-card ${
              flash.type === "BONUS" ? "flash-card-bonus" : "flash-card-penalty"
            }`}
          >
            {/* PROFILE AVATARS */}
            {flash.entityName && flash.mode?.toLowerCase() !== "group" && (
              <div style={{ width: "100%", marginBottom: "0.5rem" }}>
                <ProfileAvatars entityName={flash.entityName} photos={flash.photos || []} mode={flash.mode} />
              </div>
            )}

            {flash.type === "BONUS" ? (
              <>
                <div className="flash-title flash-title-bonus">
                  CONGRATULATIONS!
                </div>
                <div style={{ fontSize: "5rem", lineHeight: 1.1 }}>🏆</div>
                <div
                  className="flash-title flash-title-bonus"
                  style={{ fontSize: "1.8rem", marginTop: "0.6rem" }}
                >
                  TASK WON!
                </div>
                <div className="flash-subtitle">
                  Bonus Added To
                  <br />
                  <strong style={{ color: "#fff" }}>{flash.entityName || "Wallet"}</strong>
                </div>
                <div className="flash-points flash-points-bonus">
                  + ₹ {flash.points}
                </div>
              </>
            ) : (
              <>
                <div className="flash-title flash-title-penalty">
                  RULE VIOLATION!
                </div>
                <div style={{ fontSize: "5rem", lineHeight: 1.1 }}>⚠️</div>
                <div className="flash-subtitle">
                  Penalty Deducted From
                  <br />
                  <strong style={{ color: "#fff" }}>{flash.entityName || "Wallet"}</strong>
                </div>
                <div className="flash-points flash-points-penalty">
                  − ₹ {flash.points}
                </div>
              </>
            )}

            {/* New balance box */}
            <div className="flash-balance-box">
              <div className="flash-balance-title">
                NEW BALANCE
              </div>
              <div className="flash-balance-amount">
                ₹ {flash.newBalance}
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => setFlash(null)}
              className={`flash-btn ${
                flash.type === "BONUS" ? "flash-btn-bonus" : "flash-btn-penalty"
              }`}
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
