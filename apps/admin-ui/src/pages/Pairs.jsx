import React, { useEffect, useState } from "react";
import { api } from "../lib/adminApi";
import { s, colors } from "../lib/adminStyles";

// ─── Stacked pair avatars ─────────────────────────────────────────────────────
function PairAvatar({ user1, user2 }) {
  function UserDot({ user, offset, zIndex }) {
    return user.photoUrl ? (
      <img src={user.photoUrl} alt={user.name} title={user.name}
        style={{ position: "absolute", left: offset, top: 0, width: 34, height: 34,
          borderRadius: "50%", objectFit: "cover", border: "2px solid #1a0000", zIndex }} />
    ) : (
      <div title={user.name} style={{
        position: "absolute", left: offset, top: 0, width: 34, height: 34,
        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        background: zIndex === 2 ? "#ff1f1f" : "#920000",
        border: "2px solid #1a0000", zIndex,
        color: "#fff", fontWeight: 900, fontSize: 13,
      }}>
        {user.name?.[0]?.toUpperCase()}
      </div>
    );
  }
  return (
    <div style={{ position: "relative", width: 52, height: 34, flexShrink: 0 }}>
      <UserDot user={user1} offset={0} zIndex={2} />
      <UserDot user={user2} offset={18} zIndex={1} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Pairs() {
  const [pairs, setPairs]         = useState([]);
  const [users, setUsers]         = useState([]);
  const [user1Id, setUser1Id]     = useState("");
  const [user2Id, setUser2Id]     = useState("");
  const [pairPoints, setPairPoints] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [err, setErr]             = useState("");

  async function refresh() {
    const { data: u } = await api.get("/api/users");
    setUsers(u);
    const { data: p } = await api.get("/api/pairs");
    setPairs(p);
  }

  useEffect(() => { refresh(); }, []);

  async function savePair() {
    setErr("");
    try {
      if (editingId) {
        // Edit: only pairPoints can be changed (users are the unique key)
        await api.put(`/api/pairs/${editingId}`, { pairPoints: Number(pairPoints) });
      } else {
        await api.post("/api/pairs", {
          user1Id: Number(user1Id),
          user2Id: Number(user2Id),
          pairPoints: Number(pairPoints),
        });
      }
      resetForm();
      refresh();
    } catch (e) {
      setErr(e?.response?.data?.error || "Error");
    }
  }

  async function deletePair(id) {
    if (!window.confirm("Delete this pair?")) return;
    await api.delete(`/api/pairs/${id}`);
    refresh();
  }

  function startEdit(p) {
    setEditingId(p.id);
    setUser1Id(String(p.user1Id));
    setUser2Id(String(p.user2Id));
    setPairPoints(p.pairPoints);
  }

  function resetForm() {
    setEditingId(null);
    setUser1Id("");
    setUser2Id("");
    setPairPoints(0);
    setErr("");
  }

  const userById = (id) => users.find(u => String(u.id) === String(id));

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Pairs</div>

      {/* ── FORM ── */}
      <div style={s.card}>
        <div style={s.sectionTitle}>{editingId ? "Edit Pair" : "Create Pair"}</div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 0 }}>

          {/* User 1 */}
          <div style={fieldWrap}>
            <label style={formLabel}>User 1</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {user1Id && userById(user1Id)?.photoUrl && (
                <img src={userById(user1Id).photoUrl} alt=""
                  style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
              )}
              <select value={user1Id} onChange={(e) => setUser1Id(e.target.value)}
                style={s.select} disabled={!!editingId}>
                <option value="">Select user…</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          {/* User 2 */}
          <div style={fieldWrap}>
            <label style={formLabel}>User 2</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {user2Id && userById(user2Id)?.photoUrl && (
                <img src={userById(user2Id).photoUrl} alt=""
                  style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
              )}
              <select value={user2Id} onChange={(e) => setUser2Id(e.target.value)}
                style={s.select} disabled={!!editingId}>
                <option value="">Select user…</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          {/* Points */}
          <div style={fieldWrap}>
            <label style={formLabel}>Pair Points (₹)</label>
            <input type="number" value={pairPoints}
              onChange={(e) => setPairPoints(e.target.value)} style={s.input} />
          </div>

          <div style={{ marginBottom: 10, display: "flex", gap: 10 }}>
            <button onClick={savePair} style={s.btn}
              disabled={!editingId && (!user1Id || !user2Id)}>
              {editingId ? "✓ Update" : "+ Create"}
            </button>
            {editingId && (
              <button onClick={resetForm} style={s.btnGhost}>Cancel</button>
            )}
          </div>
        </div>

        {editingId && (
          <div style={{ fontSize: 12, color: colors.muted, marginTop: -4 }}>
            ℹ️ Users cannot be changed after creation. Only points can be updated.
          </div>
        )}
        {err && <div style={{ ...s.errMsg, marginTop: 8 }}>{err}</div>}
      </div>

      {/* ── LIST ── */}
      <div style={s.card}>
        <div style={s.sectionTitle}>All Pairs ({pairs.length})</div>
        {pairs.length === 0 ? (
          <div style={{ color: colors.muted, padding: "12px 0" }}>No pairs yet.</div>
        ) : pairs.map(p => (
          <div key={p.id} style={{ ...s.row, gap: 16 }}>
            <PairAvatar user1={p.user1} user2={p.user2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {p.user1.name} <span style={{ color: colors.muted }}>+</span> {p.user2.name}
              </div>
              <div style={{ fontSize: 13, color: colors.gold, marginTop: 2 }}>
                ₹ {p.pairPoints} · ID: {p.id}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => startEdit(p)} style={s.btnGhost}>Edit</button>
              <button onClick={() => deletePair(p.id)} style={s.btnDanger}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const formLabel = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1,
  color: "rgba(255,255,255,0.45)", textTransform: "uppercase",
};
const fieldWrap = {
  display: "flex", flexDirection: "column", gap: 6,
  marginRight: 10, marginBottom: 10,
};
