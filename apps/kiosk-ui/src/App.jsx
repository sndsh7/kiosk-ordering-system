import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { connectSocket } from "./lib/kioskApi";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ProfileAvatars from "./components/ProfileAvatars";
import { useCart } from "./state/cart";

import backgroundImg from "./assets/Background.png";
import bonusBoxImg from "./assets/Asset_congratulationsBox_Green.png";
import penaltyBoxImg from "./assets/Asset_congratulationsBox_Red.png";
import continueShoppingImg from "./assets/Asset_continue-shopping.png";
import awardIcon from "./assets/Asset_Awward.png";
import penaltyIcon from "./assets/Asset_PENALTY_Icon.png";
import correctIcon from "./assets/Asset_Correct.png";

import Welcome from "./pages/Welcome.jsx";
import ModeInfo from "./pages/ModeInfo.jsx";
import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import Confirm from "./pages/Confirm.jsx";
import Success from "./pages/Success.jsx";
import ErrorScreen from "./pages/ErrorScreen.jsx";

export default function App() {
  const [flash, setFlash] = useState(null);
  const { dispatch } = useCart();
  const nav = useNavigate();

  // Global socket — always connected so flash works on every page
  useEffect(() => {
    const socket = connectSocket(
      () => {
        // Admin applied new settings → reset kiosk to welcome
        dispatch({ type: "CLEAR" });
        nav("/");
      },
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
          className="flash-overlay"
          style={{
            backgroundImage: `url(${backgroundImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#000",
          }}
        >
          {/* Spotlight */}
          <div className="menu-spotlight" />

          {/* Card */}
          <div
            className="flash-card"
            style={{
              backgroundImage: `url(${flash.type === "BONUS" ? bonusBoxImg : penaltyBoxImg})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              backgroundColor: "transparent",
              border: "none",
              boxShadow: "none",
            }}
          >
            {/* Mode name */}
            {flash.entityName && (
              <div className="flash-mode-name">
                {flash.mode ? flash.mode.toUpperCase() : flash.entityName.toUpperCase()}
              </div>
            )}

            {flash.type === "BONUS" ? (
              <>
                <div className="flash-title flash-title-bonus">CONGRATULATIONS</div>
                <img src={awardIcon} alt="Award" className="flash-icon-img" />
                <div className="flash-task-won">TASK WON!</div>

                <div className="flash-bonus-label">BONUS ADDED</div>
                <div className="flash-points flash-points-bonus">+₹{flash.points}</div>

                <div className="flash-balance-box">
                  <div className="flash-balance-title">BONUS ADDED</div>
                  <div className="flash-balance-amount flash-balance-bonus">₹{flash.newBalance}</div>
                </div>

                <button
                  onClick={() => setFlash(null)}
                  className="action-btn-proceed"
                  style={{ marginTop: "1.5rem", width: "100%", padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', boxShadow: 'none' }}
                >
                  <img src={continueShoppingImg} alt="Continue Shopping" style={{ height: "100%", width: "100%", objectFit: "contain" }} />
                </button>
              </>
            ) : (
              <>
                <div className="flash-title flash-title-penalty">RULE VIOLATION!</div>
                <img src={penaltyIcon} alt="Penalty" className="flash-icon-img" />

                <div className="flash-bonus-label" style={{ color: "rgba(255,255,255,0.7)" }}>PENALTY DEDUCTED</div>
                <div className="flash-points flash-points-penalty">−₹{flash.points}</div>

                <div className="flash-balance-box flash-balance-box-penalty">
                  <div className="flash-balance-title">NEW BALANCE</div>
                  <div className="flash-balance-amount flash-balance-penalty">₹{flash.newBalance}</div>
                </div>

                <button
                  onClick={() => setFlash(null)}
                  className="action-btn-proceed"
                  style={{ marginTop: "1.5rem", width: "100%", letterSpacing: "3px" }}
                >
                  OK, GOT IT
                </button>
              </>
            )}
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
