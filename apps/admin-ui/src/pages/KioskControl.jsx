import React, { useEffect, useState } from "react";
import { api } from "../lib/adminApi";
import { s, colors } from "../lib/adminStyles";

// ─── Avatar helpers ───────────────────────────────────────────────────────────
function Avatar({ src, name, size = 36, emoji = "👤" }) {
  if (src) {
    return (
      <img src={src} alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
    );
  }
  const initials = name
    ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : emoji;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg,#ff1f1f,#920000)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 900, color: "#fff",
    }}>
      {initials}
    </div>
  );
}

function StackedAvatars({ users, size = 30 }) {
  const slots = users.filter(Boolean).slice(0, 3);
  return (
    <div style={{ position: "relative", width: size + (slots.length - 1) * (size * 0.55), height: size, flexShrink: 0 }}>
      {slots.map((u, i) => (
        <div key={i} style={{ position: "absolute", left: i * (size * 0.55), top: 0, zIndex: 3 - i }}>
          <Avatar src={u?.photoUrl} name={u?.name} size={size} />
        </div>
      ))}
    </div>
  );
}

// ─── Selection card grid ──────────────────────────────────────────────────────
function EntityCard({ id, label, sub, avatarEl, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 14,
        border: selected
          ? "2px solid rgba(255,0,0,0.8)"
          : "1px solid rgba(255,255,255,0.1)",
        background: selected
          ? "linear-gradient(135deg,rgba(255,30,30,0.2),rgba(255,30,30,0.05))"
          : "rgba(255,255,255,0.03)",
        cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: selected ? "0 0 16px rgba(255,0,0,0.2)" : "none",
        position: "relative",
      }}
    >
      {avatarEl}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{sub}</div>
        )}
      </div>
      {selected && (
        <div style={{
          width: 20, height: 20, borderRadius: "50%",
          background: "#ff1f1f", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0,
        }}>✓</div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function KioskControl() {
  const [status, setStatus]   = useState(null);
  const [mode, setMode]       = useState("INDIVIDUAL");
  const [isActive, setIsActive] = useState(true);
  const [refId, setRefId]     = useState("");
  const [msg, setMsg]         = useState("");

  // Entity lists
  const [users, setUsers]   = useState([]);
  const [pairs, setPairs]   = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    (async () => {
      const [{ data: kiosk }, { data: u }, { data: p }, { data: g }] = await Promise.all([
        api.get("/api/kiosk/status"),
        api.get("/api/users"),
        api.get("/api/pairs"),
        api.get("/api/groups"),
      ]);
      setStatus(kiosk);
      setMode(kiosk.mode);
      setIsActive(kiosk.isActive);
      setRefId(kiosk.refId != null ? String(kiosk.refId) : "");
      setUsers(u);
      setPairs(p);
      setGroups(g);
    })();
  }, []);

  // When mode changes, clear selection
  function handleModeChange(m) {
    setMode(m);
    setRefId("");
    setMsg("");
  }

  async function apply() {
    setMsg("");
    await api.post("/api/kiosk/setMode", {
      isActive,
      mode,
      refId: refId === "" ? null : Number(refId),
    });
    const { data } = await api.get("/api/kiosk/status");
    setStatus(data);
    setMsg("Applied successfully.");
  }

  // Bonus / Penalty
  const [notifyPoints, setNotifyPoints] = useState(100);
  const [notifyMsg, setNotifyMsg] = useState(null);
  const [notifySending, setNotifySending] = useState(false);

  async function sendNotify(type) {
    if (!notifyPoints || notifyPoints <= 0) return;
    setNotifySending(true);
    setNotifyMsg(null);
    try {
      const { data } = await api.post("/api/kiosk/notify", {
        type,
        points: Number(notifyPoints),
      });
      const { data: fresh } = await api.get("/api/kiosk/status");
      setStatus(fresh);
      setNotifyMsg({ type, newBalance: data.newBalance, entityName: data.entityName });
      setTimeout(() => setNotifyMsg(null), 5000);
    } finally {
      setNotifySending(false);
    }
  }

  if (!status) return <div style={s.page}><div style={{ color: colors.muted }}>Loading…</div></div>;

  // Build entity list for current mode
  const entityCards = (() => {
    if (mode === "INDIVIDUAL") {
      return users.map(u => ({
        id: String(u.id),
        label: u.name,
        sub: `₹ ${u.individualPoints}`,
        avatar: <Avatar src={u.photoUrl} name={u.name} size={36} />,
      }));
    }
    if (mode === "PAIR") {
      return pairs.map(p => ({
        id: String(p.id),
        label: `${p.user1.name} + ${p.user2.name}`,
        sub: `₹ ${p.pairPoints} · ID: ${p.id}`,
        avatar: <StackedAvatars users={[p.user1, p.user2]} size={28} />,
      }));
    }
    if (mode === "GROUP") {
      return groups.map(g => ({
        id: String(g.id),
        label: g.name,
        sub: `₹ ${g.groupPoints} · ${g.members?.length ?? 0} members`,
        avatar: <StackedAvatars users={(g.members || []).map(m => m.user)} size={28} />,
      }));
    }
    return [];
  })();

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Kiosk Control</div>

      {/* STATUS BADGES */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={s.badge(status.isActive ? colors.green : colors.danger)}>
          {status.isActive ? "● ACTIVE" : "● OFFLINE"}
        </div>
        <div style={s.badge(colors.gold)}>{status.mode}</div>
        {status.entityName && <div style={s.badge(colors.muted)}>{status.entityName}</div>}
        <div style={s.badge(colors.gold)}>₹ {status.balance}</div>
      </div>

      {/* CONFIGURE CARD */}
      <div style={s.card}>
        <div style={s.sectionTitle}>Configure Kiosk</div>

        {/* Active toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div
            onClick={() => setIsActive(!isActive)}
            style={{
              width: 52, height: 28, borderRadius: 99, position: "relative",
              cursor: "pointer", border: "1px solid rgba(255,255,255,0.15)",
              background: isActive ? "linear-gradient(90deg,#ff1f1f,#920000)" : "rgba(255,255,255,0.1)",
              transition: "background 0.2s",
            }}
          >
            <div style={{
              position: "absolute", top: 3, width: 20, height: 20,
              borderRadius: "50%", background: "#fff", transition: "left 0.2s",
              left: isActive ? 26 : 3,
            }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700 }}>
            Kiosk Active{" "}
            {isActive
              ? <span style={{ color: colors.green }}>ON</span>
              : <span style={{ color: colors.muted }}>OFF</span>}
          </span>
        </div>

        {/* Mode segmented buttons */}
        <div style={{ marginBottom: 24 }}>
          <div style={labelStyle}>Mode</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["INDIVIDUAL", "PAIR", "GROUP"].map(m => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                style={{
                  padding: "10px 24px", borderRadius: 10, fontSize: 13,
                  fontWeight: 700, cursor: "pointer", letterSpacing: 0.5,
                  border: mode === m ? "1px solid rgba(255,0,0,0.7)" : "1px solid rgba(255,255,255,0.12)",
                  background: mode === m ? "linear-gradient(180deg,#ff1f1f,#920000)" : "rgba(255,255,255,0.04)",
                  color: "#fff",
                }}
              >
                {m === "INDIVIDUAL" ? "👤" : m === "PAIR" ? "👫" : "👥"} {m}
              </button>
            ))}
          </div>
        </div>

        {/* Entity card picker */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={labelStyle}>
              Assign {mode === "INDIVIDUAL" ? "User" : mode === "PAIR" ? "Pair" : "Group"}
            </div>
            {refId && (
              <button
                onClick={() => setRefId("")}
                style={{ fontSize: 12, color: colors.muted, background: "none", border: "none", cursor: "pointer" }}
              >
                ✕ Clear selection
              </button>
            )}
          </div>

          {entityCards.length === 0 ? (
            <div style={{ color: colors.muted, fontSize: 14, padding: "12px 0" }}>
              No {mode.toLowerCase()}s found. Add some first.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 10,
              maxHeight: 320,
              overflowY: "auto",
              paddingRight: 4,
            }}>
              {entityCards.map(card => (
                <EntityCard
                  key={card.id}
                  {...card}
                  selected={refId === card.id}
                  onClick={() => setRefId(refId === card.id ? "" : card.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Apply */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <button onClick={apply} style={s.btn}>✓ Apply Settings</button>
          {msg && <div style={s.msg}>✓ {msg}</div>}
        </div>
      </div>

      {/* BONUS / PENALTY PANEL */}
      <div style={s.card}>
        <div style={s.sectionTitle}>Bonus &amp; Penalty</div>

        {!status.refId ? (
          <div style={s.errMsg}>No entity assigned. Apply a mode + entity above first.</div>
        ) : (
          <div style={{ fontSize: 13, color: colors.muted, marginBottom: 16 }}>
            Sending to: <span style={{ color: "#fff", fontWeight: 700 }}>{status.entityName}</span>
            {" · Current balance: "}
            <span style={{ color: colors.gold, fontWeight: 700 }}>Rs. {status.balance}</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          {/* Amount input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={labelStyle}>Amount (Rs.)</div>
            <input
              type="number"
              min="1"
              value={notifyPoints}
              onChange={(e) => setNotifyPoints(e.target.value)}
              style={{ ...s.input, width: 120, marginRight: 0 }}
            />
          </div>

          {/* Quick presets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={labelStyle}>Quick pick</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[100, 250, 500, 1000].map(v => (
                <button key={v} onClick={() => setNotifyPoints(v)} style={{
                  padding: "9px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  border: notifyPoints == v ? "1px solid rgba(255,0,0,0.7)" : "1px solid rgba(255,255,255,0.12)",
                  background: notifyPoints == v ? "linear-gradient(180deg,#ff1f1f,#920000)" : "rgba(255,255,255,0.04)",
                  color: "#fff",
                }}>{v}</button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={labelStyle}>Action</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                disabled={!status.refId || notifySending}
                onClick={() => sendNotify("BONUS")}
                style={{
                  padding: "12px 28px", borderRadius: 12, fontSize: 15, fontWeight: 900,
                  cursor: !status.refId || notifySending ? "not-allowed" : "pointer",
                  opacity: !status.refId || notifySending ? 0.4 : 1,
                  border: "1px solid rgba(0,200,80,0.7)",
                  background: "linear-gradient(180deg,#00b347,#005522)",
                  color: "#fff", letterSpacing: 0.5,
                  boxShadow: "0 0 16px rgba(0,180,70,0.3)",
                }}
              >
                {notifySending ? "..." : "BONUS"}
              </button>
              <button
                disabled={!status.refId || notifySending}
                onClick={() => sendNotify("PENALTY")}
                style={{
                  padding: "12px 28px", borderRadius: 12, fontSize: 15, fontWeight: 900,
                  cursor: !status.refId || notifySending ? "not-allowed" : "pointer",
                  opacity: !status.refId || notifySending ? 0.4 : 1,
                  border: "1px solid rgba(255,0,0,0.7)",
                  background: "linear-gradient(180deg,#ff1f1f,#920000)",
                  color: "#fff", letterSpacing: 0.5,
                  boxShadow: "0 0 16px rgba(255,0,0,0.3)",
                }}
              >
                {notifySending ? "..." : "PENALTY"}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {notifyMsg && (
          <div style={{
            marginTop: 16, padding: "12px 18px", borderRadius: 12,
            background: notifyMsg.type === "BONUS" ? "rgba(0,180,70,0.12)" : "rgba(255,30,30,0.12)",
            border: notifyMsg.type === "BONUS" ? "1px solid rgba(0,200,80,0.4)" : "1px solid rgba(255,30,30,0.4)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{notifyMsg.type === "BONUS" ? "BONUS" : "PENALTY"}</span>
            <div>
              <div style={{ fontWeight: 700, color: notifyMsg.type === "BONUS" ? colors.green : colors.danger }}>
                {notifyMsg.type === "BONUS" ? `+Rs.${notifyPoints}` : `-Rs.${notifyPoints}`}
                {notifyMsg.entityName ? ` sent to ${notifyMsg.entityName}` : ""}
              </div>
              <div style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>
                New balance: <span style={{ color: colors.gold, fontWeight: 700 }}>Rs. {notifyMsg.newBalance}</span>
                {" - Kiosk screen notified"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LIVE STATUS */}
      <div style={s.card}>
        <div style={s.sectionTitle}>Live Status JSON</div>
        <pre style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: 16,
          fontSize: 13, color: colors.gold,
          margin: 0, overflowX: "auto",
        }}>
          {JSON.stringify(status, null, 2)}
        </pre>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 12, fontWeight: 700, letterSpacing: 1,
  color: colors.muted, textTransform: "uppercase", marginBottom: 8,
};
