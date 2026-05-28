import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import backgroundImg from "../assets/Background.png";
import logoBgImg from "../assets/Asset_LogoBg.png";
import correctIcon from "../assets/Asset_Correct.png";

export default function Success() {
  const nav = useNavigate();
  const { state } = useLocation();
  const remaining = state?.remaining ?? 0;

  useEffect(() => {
    const t = setTimeout(() => nav("/", { replace: true }), 7000);
    return () => clearTimeout(t);
  }, [nav]);

  return (
    <div
      className="welcome-screen"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#000",
        cursor: "default",
      }}
    >
      {/* Spotlight */}
      <div className="menu-spotlight" />

      {/* Box card — same as ModeInfo */}
      <div
        className="modeinfo-box-card"
        style={{
          backgroundImage: `url(${logoBgImg})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          width: "100%",
          aspectRatio: "2037 / 2040",
          margin: "0 auto",
          padding: "10% 2rem",
        }}
      >
        {/* Checkmark icon */}
        <img src={correctIcon} alt="Success" className="success-check-img" />

        <div className="success-title">ORDER PLACED!</div>
        <div className="success-subtitle">YOUR ORDER HAS BEEN RECEIVED.</div>

        <div className="success-balance-label">REMAINING BALANCE</div>
        <div className="success-balance-amount">₹{Math.max(0, remaining)}</div>

        {/* Return message + progress bar */}
        <div className="success-return-wrap">
          <div className="success-return-msg">RETURNING TO HOME IN A MOMENT...</div>
          <div className="success-progress-track">
            <div className="success-progress-bar" style={{ animationDuration: "7s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
