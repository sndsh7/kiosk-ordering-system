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
          <div className="profile-avatar-name-tag">User</div>
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
            <div className="profile-avatar-circle">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span className="profile-avatar-initial">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="profile-avatar-name-tag">{name}</div>
          </div>
        );
      })}
    </div>
  );
}
