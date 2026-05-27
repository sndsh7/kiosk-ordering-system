import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKioskStatus, connectSocket } from "../lib/kioskApi";

import backgroundImg from "../assets/Background.png";
import boxBg from "../assets/Box.png";
import logoImg from "../assets/Asset_Logo.png";

export default function Welcome() {
  const nav = useNavigate();
  const [inactive, setInactive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let socket;
    (async () => {
      try {
        const status = await getKioskStatus();
        setInactive(!status.isActive);
      } finally {
        setLoading(false);
      }
      socket = connectSocket((s) => setInactive(!s.isActive));
    })();
    return () => socket?.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="kiosk-page" style={{ backgroundImage: `url(${backgroundImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#000" }}>
        <div className="welcome-loading-text" style={{ margin: "auto" }}>Loading…</div>
      </div>
    );
  }

  if (inactive) {
    return (
      <div className="kiosk-page" style={{ backgroundImage: `url(${backgroundImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#000" }}>
        <div className="kiosk-card">
          <div className="welcome-error-icon">🚫</div>
          <div className="welcome-title">OUT OF SERVICE</div>
          <div className="welcome-subtitle">Please contact staff.</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="welcome-screen"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#000",
      }}
      onClick={() => nav("/mode")}
    >
      {/* Top spotlight */}
      <div className="menu-spotlight" />

      {/* Central Box frame with logo inside */}
      <div className="welcome-box-frame" style={{ backgroundImage: `url(${boxBg})`, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}>
        {/* LOCK UPP Logo */}
        <img src={logoImg} alt="LOCK UPP" className="welcome-logo-img" />

        {/* Fingerprint scan area */}
        <div className="welcome-fingerprint-wrap">
          <div className="welcome-fingerprint-ring" />
          <div className="welcome-fingerprint-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="welcome-fingerprint-svg">
              {/* Fingerprint SVG paths */}
              <circle cx="32" cy="32" r="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <path d="M32 20c6.627 0 12 5.373 12 12" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M32 14c9.941 0 18 8.059 18 18" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M32 8c13.255 0 24 10.745 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M20 32c0-6.627 5.373-12 12-12" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M14 32C14 22.059 22.059 14 32 14" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 32C8 18.745 18.745 8 32 8" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M32 26c3.314 0 6 2.686 6 6 0 3.314-2.686 6-6 6" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M38 38c0 3.314-2.686 6-6 6s-6-2.686-6-6V32" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
              {/* Corner scan brackets */}
              <rect x="20" y="20" width="8" height="2" fill="rgba(255,255,255,0.4)"/>
              <rect x="20" y="20" width="2" height="8" fill="rgba(255,255,255,0.4)"/>
              <rect x="36" y="20" width="8" height="2" fill="rgba(255,255,255,0.4)"/>
              <rect x="42" y="20" width="2" height="8" fill="rgba(255,255,255,0.4)"/>
              <rect x="20" y="42" width="8" height="2" fill="rgba(255,255,255,0.4)"/>
              <rect x="20" y="36" width="2" height="8" fill="rgba(255,255,255,0.4)"/>
              <rect x="36" y="42" width="8" height="2" fill="rgba(255,255,255,0.4)"/>
              <rect x="42" y="36" width="2" height="8" fill="rgba(255,255,255,0.4)"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
