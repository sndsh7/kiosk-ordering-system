import React, { useEffect, useState } from "react";
import { api } from "../lib/adminApi";
import { s, colors } from "../lib/adminStyles";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function refresh() {
    try {
      const { data } = await api.get("/api/categories", { params: { showInactive: true } });
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories.");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function add() {
    if (!name.trim()) return;
    try {
      setError("");
      setSuccess("");
      await api.post("/api/categories", { name: name.trim(), active: true });
      setName("");
      setSuccess("Category added successfully!");
      refresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to add category.");
    }
  }

  async function toggle(cat) {
    try {
      setError("");
      setSuccess("");
      await api.put(`/api/categories/${cat.id}`, { active: !cat.active });
      setSuccess(`Category ${!cat.active ? "activated" : "deactivated"} successfully!`);
      refresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to toggle status.");
    }
  }

  async function saveEdit(id) {
    if (!editingName.trim()) return;
    try {
      setError("");
      setSuccess("");
      await api.put(`/api/categories/${id}`, { name: editingName.trim() });
      setEditingId(null);
      setEditingName("");
      setSuccess("Category name updated successfully!");
      refresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update category name.");
    }
  }

  async function remove(id) {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) return;
    try {
      setError("");
      setSuccess("");
      await api.delete(`/api/categories/${id}`);
      setSuccess("Category deleted successfully!");
      refresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || "";
      if (
        msg.toLowerCase().includes("foreign key") || 
        err.message?.includes("500") || 
        err.response?.status === 500
      ) {
        setError("Cannot delete category because it contains active food items. Please delete or reassign those items first.");
      } else {
        setError("Failed to delete category.");
      }
    }
  }

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Categories</div>

      {/* SUCCESS / ERROR ALERTS */}
      {error && <div style={{ ...s.errMsg, marginBottom: 18, display: "block" }}>{error}</div>}
      {success && <div style={{ ...s.msg, marginBottom: 18, display: "block" }}>{success}</div>}

      {/* ADD CATEGORY */}
      <div style={s.card}>
        <div style={s.sectionTitle}>Add Category</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={formLabel}>Category Name</label>
            <input
              placeholder="e.g. Starters"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ ...s.input, marginRight: 0, marginBottom: 0 }}
              onKeyDown={(e) => e.key === "Enter" && name && add()}
            />
          </div>
          <button onClick={add} style={{ ...s.btn, height: 44 }} disabled={!name}>+ Add</button>
        </div>
      </div>

      {/* ALL CATEGORIES */}
      <div style={s.card}>
        <div style={s.sectionTitle}>All Categories ({categories.length})</div>
        {categories.length === 0 ? (
          <div style={{ color: colors.muted, padding: "12px 0" }}>No categories yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {categories.map((c) => (
              <div key={c.id} style={s.row}>
                {editingId === c.id ? (
                  /* INLINE EDIT MODE */
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, flexWrap: "wrap" }}>
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      style={{ ...s.input, margin: 0 }}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(c.id)}
                      autoFocus
                    />
                    <button onClick={() => saveEdit(c.id)} style={s.btnSuccess}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ ...s.btnGhost, margin: 0, padding: "6px 14px" }}>Cancel</button>
                  </div>
                ) : (
                  /* STANDARD LIST MODE */
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                      <span style={s.badge(c.active ? colors.green : colors.muted)}>
                        {c.active ? "Active" : "Inactive"}
                      </span>
                      <span style={{ fontSize: 12, color: colors.muted }}>ID: {c.id}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditingName(c.name);
                        }}
                        style={{ ...s.btnGhost, margin: 0, padding: "6px 14px", fontSize: 13 }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => toggle(c)} 
                        style={c.active ? s.btnDanger : s.btnSuccess}
                      >
                        {c.active ? "Deactivate" : "Activate"}
                      </button>
                      <button 
                        onClick={() => remove(c.id)} 
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          border: "1px solid rgba(255, 50, 50, 0.4)",
                          background: "rgba(255, 0, 0, 0.1)",
                          color: "#ff6666",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const formLabel = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1,
  color: "rgba(255,255,255,0.45)",
  textTransform: "uppercase",
};
