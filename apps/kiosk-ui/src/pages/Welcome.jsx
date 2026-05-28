import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKioskStatus, connectSocket } from "../lib/kioskApi";

import backgroundImg from "../assets/Background.png";
import logoBgImg from "../assets/Asset_LogoBg.png";
import logoImg from "../assets/Asset_Logo.png";
import thumbImg from "../assets/Asset_Thumb.png";

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

      {/* Central frame with logo background */}
      <div className="welcome-box-frame" style={{ backgroundImage: `url(${logoBgImg})`, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}>
        {/* LOCK UPP Logo */}
        <img src={logoImg} alt="LOCK UPP" className="welcome-logo-img" />

        {/* Fingerprint scan area */}
        <div className="welcome-fingerprint-wrap">
          <div className="welcome-fingerprint-ring" />
          <div className="welcome-fingerprint-icon">
            <img src={thumbImg} alt="Scan Fingerprint" className="welcome-fingerprint-svg" style={{ width: "100%", height: "100%", objectFit: "contain", marginBottom: "100px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
