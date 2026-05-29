import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKioskStatus, connectSocket } from "../lib/kioskApi";
import ProfileAvatars from "../components/ProfileAvatars";
import { formatPoints } from "../lib/formatPoints";

import backArrowIcon from "../assets/Back_Arrow.png";
import backgroundImg from "../assets/Background.png";
import boxBg from "../assets/Box.png";
import groupIcon from "../assets/GroupIcon.png";
import pairIcon from "../assets/PairIcon.png";
import singleIcon from "../assets/Single.png";
import logoBgImg from "../assets/Asset_LogoBg.png";

export default function ModeInfo() {
  const nav = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let socket;
    (async () => {
      const s = await getKioskStatus();
      setStatus(s);
      socket = connectSocket(setStatus);
    })();
    return () => socket?.disconnect();
  }, []);

  if (!status) {
    return (
      <div className="kiosk-page" style={{ backgroundImage: `url(${backgroundImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#000" }}>
        <div className="welcome-loading-text" style={{ margin: "auto" }}>Loading…</div>
      </div>
    );
  }

  if (!status.isActive) {
    return (
      <div className="kiosk-page" style={{ backgroundImage: `url(${backgroundImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#000" }}>
        <div className="kiosk-card">
          <div className="welcome-error-icon">🚫</div>
          <div className="welcome-title">OUT OF SERVICE</div>
          <div className="welcome-subtitle">Kiosk is inactive. Please contact staff.</div>
          <button className="kiosk-btn" style={{ marginTop: "2rem" }} onClick={() => nav("/")}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const modeIconSrc = status.mode?.toLowerCase() === 'individual' ? singleIcon :
    status.mode?.toLowerCase() === 'pair' ? pairIcon :
      status.mode?.toLowerCase() === 'group' ? groupIcon : null;

  const displayMode = status.mode ? status.mode.toUpperCase() : "";

  return (
    <div className="kiosk-page menu-page" style={{ height: "100vh", maxHeight: "100vh", overflow: "hidden", backgroundImage: `url(${backgroundImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundColor: "#000" }}>
      {/* TOP SPOTLIGHT GLOW */}
      <div className="menu-spotlight" />

      <div className="kiosk-container" style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* HEADER */}
        <div className="kiosk-header" style={{ marginBottom: "1rem" }}>
          <div className="header-left-col">
            <button className="kiosk-back-btn" onClick={() => nav("/")} style={{ background: "none", border: "none", padding: 0 }}>
              <img src={backArrowIcon} alt="Back" className="header-back-icon" />
            </button>
          </div>
          <div className="kiosk-header-title" style={{ fontSize: "2rem" }}></div>
          <div className="header-right-col">
            {modeIconSrc && <img src={modeIconSrc} alt={status.mode} className="header-mode-icon" />}
          </div>
        </div>

        {/* TOP SPACER for centering */}
        <div style={{ flex: 1 }} />

        {/* CENTRAL BOX CARD */}
        <div className="modeinfo-box-card" style={{ backgroundImage: `url(${logoBgImg})`, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat", width: "100%", aspectRatio: "2037 / 2040", margin: "0 auto", padding: "10% 2rem" }}>
          <ProfileAvatars entityName={status.entityName} photos={status.photos} mode={status.mode} />
          <div className="modeinfo-entity">{status.entityName}</div>
          <div className="modeinfo-money-label">WEEKLY MONEY BANK</div>
          <div className="modeinfo-balance">{formatPoints(status.balance)}</div>
        </div>

        {/* START ORDERING BUTTON */}
        <div className="modeinfo-actions" style={{ marginTop: "2rem" }}>
          <button className="modeinfo-start-btn" onClick={() => nav("/menu")}>
            START ORDERING
          </button>
        </div>

        {/* BOTTOM SPACER */}
        <div style={{ flex: 1 }} />
      </div>
    </div>
  );
}
