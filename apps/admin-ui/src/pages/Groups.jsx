import React, { useEffect, useState } from "react";
import { api } from "../lib/adminApi";
import { s, colors } from "../lib/adminStyles";

// ─── Stacked avatars ──────────────────────────────────────────────────────────
function GroupAvatar({ members }) {
  const slots = members.slice(0, 3);
  if (slots.length === 0) {
    return (
      <div style={circle(48, "#ff1f1f")}>👥</div>
    );
  }
  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
      {slots.map((m, i) =>
        m.user.photoUrl ? (
          <img key={i} src={m.user.photoUrl} alt={m.user.name}
            style={{ position: "absolute", left: i * 13, top: 0, width: 32, height: 32,
              borderRadius: "50%", objectFit: "cover", border: "2px solid #1a0000", zIndex: 3 - i }} />
        ) : (
          <div key={i} style={{ ...circle(32, i === 0 ? "#ff1f1f" : "#920000"),
            position: "absolute", left: i * 13, top: 0, zIndex: 3 - i,
            border: "2px solid #1a0000", fontSize: 12 }}>
            {m.user.name?.[0]?.toUpperCase()}
          </div>
        )
      )}
    </div>
  );
}

function circle(size, bg) {
  return {
    width: size, height: size, borderRadius: "50%", background: bg, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 900, fontSize: size * 0.38,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Groups() {
  const [groups, setGroups]       = useState([]);
  const [users, setUsers]         = useState([]);
  const [name, setName]           = useState("");
  const [groupPoints, setGroupPoints] = useState(0);
  const [selected, setSelected]   = useState([]);
  const [editingId, setEditingId] = useState(null);

  async function refresh() {
    const { data: u } = await api.get("/api/users");
    setUsers(u);
    const { data: g } = await api.get("/api/groups");
    setGroups(g);
  }

  useEffect(() => { refresh(); }, []);

  async function saveGroup() {
    if (!name) return;
    if (editingId) {
      await api.put(`/api/groups/${editingId}`, {
        name,
        groupPoints: Number(groupPoints),
        userIds: selected.map(Number),
      });
    } else {
      await api.post("/api/groups", {
        name,
        groupPoints: Number(groupPoints),
        userIds: selected.map(Number),
      });
    }
    resetForm();
    refresh();
  }

  async function deleteGroup(id) {
    if (!window.confirm("Delete this group and all its members?")) return;
    await api.delete(`/api/groups/${id}`);
    refresh();
  }

  function startEdit(g) {
    setEditingId(g.id);
    setName(g.name);
    setGroupPoints(g.groupPoints);
    setSelected(g.members.map((m) => String(m.user.id)));
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setGroupPoints(0);
    setSelected([]);
  }

  function toggleUser(id) {
    const sid = String(id);
    setSelected(prev =>
      prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]
    );
  }

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Groups</div>

      {/* ── FORM ── */}
      <div style={s.card}>
        <div style={s.sectionTitle}>{editingId ? "Edit Group" : "Create Group"}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
          <div style={fieldWrap}>
            <label style={formLabel}>Group Name</label>
            <input placeholder="e.g. Team Alpha" value={name}
              onChange={(e) => setName(e.target.value)} style={s.input} />
          </div>
          <div style={fieldWrap}>
            <label style={formLabel}>Group Points (₹)</label>
            <input type="number" value={groupPoints}
              onChange={(e) => setGroupPoints(e.target.value)} style={s.input} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ ...formLabel, display: "block", marginBottom: 10 }}>Members</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {users.map(u => {
              const active = selected.includes(String(u.id));
              return (
                <button key={u.id} onClick={() => toggleUser(u.id)} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 14px", borderRadius: 99, cursor: "pointer",
                  border: active ? "1px solid rgba(255,0,0,0.7)" : "1px solid rgba(255,255,255,0.15)",
                  background: active ? "linear-gradient(180deg,#ff1f1f,#920000)" : "rgba(255,255,255,0.04)",
                  color: "#fff", fontSize: 13, fontWeight: active ? 700 : 500,
                }}>
                  {u.photoUrl
                    ? <img src={u.photoUrl} alt={u.name} style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
                    : <div style={{ ...circle(20, "#ffffff33"), fontSize: 10 }}>{u.name?.[0]?.toUpperCase()}</div>
                  }
                  {active ? "✓ " : ""}{u.name}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={saveGroup} style={s.btn} disabled={!name}>
            {editingId ? "✓ Update Group" : "+ Create Group"}
          </button>
          {editingId && (
            <button onClick={resetForm} style={s.btnGhost}>Cancel</button>
          )}
        </div>
      </div>

      {/* ── LIST ── */}
      <div style={s.card}>
        <div style={s.sectionTitle}>All Groups ({groups.length})</div>
        {groups.length === 0 ? (
          <div style={{ color: colors.muted, padding: "12px 0" }}>No groups yet.</div>
        ) : groups.map(g => (
          <div key={g.id} style={{ ...s.row, gap: 16 }}>
            <GroupAvatar members={g.members} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{g.name}</div>
              <div style={{ fontSize: 13, color: colors.gold, marginTop: 2 }}>
                ₹ {g.groupPoints} · ID: {g.id}
              </div>
              <div style={{ fontSize: 12, color: colors.muted, marginTop: 3 }}>
                {g.members.length > 0
                  ? g.members.map(m => m.user.name).join(", ")
                  : "No members"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => startEdit(g)} style={s.btnGhost}>Edit</button>
              <button onClick={() => deleteGroup(g.id)} style={s.btnDanger}>Delete</button>
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
