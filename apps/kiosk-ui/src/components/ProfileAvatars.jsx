import React from "react";


/**
 * ProfileAvatars — renders a horizontal row of circular avatars + name tags.
 * Works for Individual (1 person), Pair (2) and Group (N members).
 *
 * Props:
 *   entityName  – "John + Neha" or "Alice + Bob + Charlie"
 *   photos      – array of photoUrls aligned by index to each name segment
 *   mode        – kiosk mode string ("individual" | "pair" | "group")
 *                 When mode is "group", profile photos are hidden.
 */
export default function ProfileAvatars({ entityName, photos, mode }) {
  const isGroup = mode?.toLowerCase() === "group";
  const names = entityName
    ? entityName.split("+").map((n) => n.trim())
    : [];

  if (names.length === 0) {
    return (
      <div className="profile-avatars-row">
        <div className="profile-avatar-item">
          <div className="profile-avatar-circle profile-avatar-fallback">
            👤
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-avatars-row">
      {names.map((name, i) => {
        const photoUrl = !isGroup && photos && photos[i];
        return (
          <div key={i} className="profile-avatar-item">
            {!isGroup && (
              <div className="profile-avatar-wrapper" style={{ position: "relative", width: "150px", height: "150px" }}>

                <div className="profile-avatar-inner" style={{ position: "absolute", top: "8%", left: "8%", width: "84%", height: "84%", borderRadius: "50%", overflow: "hidden", zIndex: 1, background: "#1a0000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span className="profile-avatar-initial" style={{ fontSize: "3rem", fontWeight: "bold", color: "#000", background: "var(--accent-gold)", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
