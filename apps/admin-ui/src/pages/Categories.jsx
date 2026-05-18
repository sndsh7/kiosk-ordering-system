import React, { useEffect, useState } from "react";
import { api } from "../lib/adminApi";
import { s, colors } from "../lib/adminStyles";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  async function refresh() {
    const { data } = await api.get("/api/categories", { params: { showInactive: true } });
    setCategories(data);
  }

  useEffect(() => { refresh(); }, []);

  async function add() {
    await api.post("/api/categories", { name, active: true });
    setName("");
    refresh();
  }

  async function toggle(cat) {
    await api.put(`/api/categories/${cat.id}`, { active: !cat.active });
    refresh();
  }

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Categories</div>

      <div style={s.card}>
        <div style={s.sectionTitle}>Add Category</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={formLabel}>Category Name</label>
            <input
              placeholder="e.g. Starters"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ ...s.input, marginRight: 0 }}
              onKeyDown={(e) => e.key === "Enter" && name && add()}
            />
          </div>
          <button onClick={add} style={s.btn} disabled={!name}>+ Add</button>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.sectionTitle}>All Categories ({categories.length})</div>
        {categories.length === 0 ? (
          <div style={{ color: colors.muted, padding: "12px 0" }}>No categories yet.</div>
        ) : categories.map(c => (
          <div key={c.id} style={s.row}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
              <span style={s.badge(c.active ? colors.green : colors.muted)}>
                {c.active ? "Active" : "Inactive"}
              </span>
              <span style={{ fontSize: 12, color: colors.muted }}>ID: {c.id}</span>
            </div>
            <button onClick={() => toggle(c)} style={c.active ? s.btnDanger : s.btnSuccess}>
              {c.active ? "Deactivate" : "Activate"}
            </button>
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
