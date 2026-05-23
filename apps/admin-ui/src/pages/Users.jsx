import React, { useEffect, useRef, useState } from "react";
import { api } from "../lib/adminApi";
import { s, colors } from "../lib/adminStyles";

// ─── Avatar component ────────────────────────────────────────────────────────
function Avatar({ src, name, size = 48 }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid rgba(255,0,0,0.4)",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ff1f1f, #920000)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 900,
        color: "#fff",
        flexShrink: 0,
        border: "2px solid rgba(255,0,0,0.4)",
      }}
    >
      {initials}
    </div>
  );
}

// ─── Photo upload picker ──────────────────────────────────────────────────────
function PhotoPicker({ value, onChange }) {
  const inputRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result); // base64 data URL
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {/* Preview */}
      <div
        onClick={() => inputRef.current.click()}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: "2px dashed rgba(255,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          overflow: "hidden",
          background: "rgba(255,255,255,0.03)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {value ? (
          <img src={value} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 28 }}>📷</span>
        )}
        {/* hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0, transition: "opacity 0.2s",
          borderRadius: "50%",
          fontSize: 20,
        }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
        >✏️</div>
      </div>
      <span style={{ fontSize: 11, color: colors.muted }}>Click to upload</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Users() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [points, setPoints] = useState(0);
  const [photo, setPhoto] = useState(null); // base64 or URL
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(null); // userId being uploaded inline
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function refresh() {
    try {
      const { data } = await api.get("/api/users");
      setUsers(data);
    } catch (err) {
      setError("Failed to load users.");
    }
  }

  useEffect(() => { refresh(); }, []);

  async function addOrUpdate() {
    if (!name.trim()) return;
    try {
      setError("");
      setSuccess("");
      const payload = { name: name.trim(), individualPoints: Number(points) };
      if (photo !== null) payload.photoUrl = photo; // can be base64 or cleared null
      if (editingId) {
        await api.put(`/api/users/${editingId}`, payload);
        setSuccess("User updated successfully!");
      } else {
        await api.post("/api/users", payload);
        setSuccess("User added successfully!");
      }
      resetForm();
      refresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save user.");
    }
  }

  async function deleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      setError("");
      setSuccess("");
      await api.delete(`/api/users/${id}`);
      setSuccess("User deleted successfully!");
      refresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete user.");
    }
  }

  async function applyPoints(id, type) {
    const amountStr = window.prompt(`Enter amount to ${type} (in ₹):`);
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return alert("Please enter a valid positive number.");
    
    const delta = type === "bonus" ? amount : -amount;
    
    try {
      setError("");
      setSuccess("");
      await api.put(`/api/users/${id}/points`, { delta });
      setSuccess(`${type === "bonus" ? "Bonus" : "Penalty"} applied successfully!`);
      refresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to apply ${type}.`);
    }
  }

  function editUser(user) {
    setEditingId(user.id);
    setName(user.name);
    setPoints(user.individualPoints);
    setPhoto(user.photoUrl || null);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setPoints(0);
    setPhoto(null);
  }

  // Inline photo update for existing user row
  async function handleInlinePhoto(userId, dataUrl) {
    try {
      setError("");
      setSuccess("");
      setUploading(userId);
      await api.put(`/api/users/${userId}`, { photoUrl: dataUrl });
      setSuccess("Photo updated successfully!");
      await refresh();
      setUploading(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update photo.");
      setUploading(null);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Users</div>

      {/* SUCCESS / ERROR ALERTS */}
      {error && <div style={{ ...s.errMsg, marginBottom: 18, display: "block" }}>{error}</div>}
      {success && <div style={{ ...s.msg, marginBottom: 18, display: "block" }}>{success}</div>}

      {/* ── ADD / EDIT FORM ── */}
      <div style={s.card}>
        <div style={s.sectionTitle}>{editingId ? "Edit User" : "Add User"}</div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 20 }}>

          {/* Photo picker */}
          <PhotoPicker value={photo} onChange={setPhoto} />

          {/* Fields */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 0, flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginRight: 10, marginBottom: 10 }}>
              <label style={formLabel}>Name</label>
              <input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={s.input}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginRight: 10, marginBottom: 10 }}>
              <label style={formLabel}>Points (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                style={s.input}
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button onClick={addOrUpdate} style={s.btn} disabled={!name}>
                {editingId ? "✓ Update" : "+ Add"}
              </button>
              {editingId && (
                <button onClick={resetForm} style={s.btnGhost}>Cancel</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── USER LIST ── */}
      <div style={s.card}>
        <div style={s.sectionTitle}>All Users ({users.length})</div>
        {users.length === 0 ? (
          <div style={{ color: colors.muted, padding: "12px 0" }}>No users yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {users.map((u) => (
              <div key={u.id} style={{ ...s.row, gap: 16 }}>

                {/* Avatar + inline upload */}
                <InlinePhotoUpload
                  user={u}
                  loading={uploading === u.id}
                  onUpload={(dataUrl) => handleInlinePhoto(u.id, dataUrl)}
                />

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{u.name}</div>
                  <div style={{ fontSize: 13, color: colors.gold, marginTop: 2 }}>₹ {u.individualPoints}</div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => applyPoints(u.id, 'bonus')} style={{ ...s.btnGhost, background: "rgba(0,255,136,0.1)", color: "#00ff88", margin: 0, padding: "6px 14px", fontSize: 13, border: "1px solid rgba(0,255,136,0.3)" }}>+ Bonus</button>
                  <button onClick={() => applyPoints(u.id, 'penalty')} style={{ ...s.btnGhost, background: "rgba(255,204,0,0.1)", color: colors.gold, margin: 0, padding: "6px 14px", fontSize: 13, border: "1px solid rgba(255,204,0,0.3)" }}>- Penalty</button>
                  <button onClick={() => editUser(u)} style={{ ...s.btnGhost, margin: 0, padding: "6px 14px", fontSize: 13 }}>Edit</button>
                  <button onClick={() => deleteUser(u.id)} style={s.btnDanger}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Inline photo upload on each row ─────────────────────────────────────────
function InlinePhotoUpload({ user, loading, onUpload }) {
  const inputRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpload(ev.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <div
      style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}
      onClick={() => !loading && inputRef.current.click()}
      title="Click to change photo"
    >
      <Avatar src={user.photoUrl} name={user.name} size={48} />

      {/* Overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: loading ? 1 : 0,
        transition: "opacity 0.2s",
        fontSize: 16,
      }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => !loading && (e.currentTarget.style.opacity = 0)}
      >
        {loading ? "⏳" : "📷"}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
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