import React, { useEffect, useRef, useState } from "react";
import { api } from "../lib/adminApi";
import { s, colors } from "../lib/adminStyles";

// ─── Item image thumbnail ─────────────────────────────────────────────────────
function ItemImage({ src, name, size = 52 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          objectFit: "cover",
          border: "1px solid rgba(255,255,255,0.12)",
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
        borderRadius: 10,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        flexShrink: 0,
      }}
    >
      🍽️
    </div>
  );
}

// ─── Photo picker (square, for food images) ───────────────────────────────────
function PhotoPicker({ value, onChange, size = 80 }) {
  const inputRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div
        onClick={() => inputRef.current.click()}
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          border: "2px dashed rgba(255,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          overflow: "hidden",
          background: "rgba(255,255,255,0.03)",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {value ? (
          <img
            src={value}
            alt="preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 28 }}>📷</span>
        )}
        {/* Hover overlay */}
        <div
          style={{
            position: "absolute", inset: 0, borderRadius: 10,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity 0.18s", fontSize: 18,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
        >
          ✏️
        </div>
      </div>
      <span style={{ fontSize: 10, color: colors.muted, letterSpacing: 0.5 }}>Item photo</span>
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Items() {
  const [items, setItems]             = useState([]);
  const [categories, setCategories]   = useState([]);

  // Form state
  const [name, setName]               = useState("");
  const [categoryId, setCategoryId]   = useState("");
  const [pricePoints, setPricePoints] = useState(0);
  const [description, setDescription] = useState("");
  const [photo, setPhoto]             = useState(null);
  const [editingId, setEditingId]     = useState(null);

  // List filter
  const [filterCat, setFilterCat]     = useState("");

  async function loadItems(cat) {
    const params = { showUnavailable: true };
    if (cat) params.categoryId = Number(cat);
    const { data } = await api.get("/api/items", { params });
    setItems(data);
  }

  async function refreshCats() {
    const { data: cats } = await api.get("/api/categories", {
      params: { showInactive: true },
    });
    setCategories(cats);
    // Start with All selected — load all items immediately
    await loadItems("");
  }

  useEffect(() => { refreshCats(); }, []);
  useEffect(() => { loadItems(filterCat); }, [filterCat]);

  // ── Save (add or update) ──────────────────────────────────────────────────
  async function save() {
    if (!name || !categoryId) return;
    const payload = {
      name,
      categoryId: Number(categoryId),
      pricePoints: Number(pricePoints),
      description: description || null,
      ...(editingId ? {} : { available: true }), // only set on create
    };
    if (photo !== null) payload.imageUrl = photo;

    if (editingId) {
      await api.put(`/api/items/${editingId}`, payload);
    } else {
      await api.post("/api/items", payload);
    }
    resetForm();
    loadItems(filterCat);
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function deleteItem(id) {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    await api.delete(`/api/items/${id}`);
    loadItems(filterCat);
  }

  // ── Toggle availability ───────────────────────────────────────────────────
  async function toggle(it) {
    await api.put(`/api/items/${it.id}`, { available: !it.available });
    loadItems(filterCat);
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  function startEdit(it) {
    setEditingId(it.id);
    setName(it.name);
    setCategoryId(String(it.categoryId));
    setPricePoints(it.pricePoints);
    setDescription(it.description || "");
    setPhoto(it.imageUrl || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setPricePoints(0);
    setDescription("");
    setPhoto(null);
  }

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Items</div>

      {/* ── ADD / EDIT FORM ── */}
      <div style={s.card}>
        <div style={s.sectionTitle}>{editingId ? "Edit Item" : "Add Item"}</div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 20 }}>

          {/* Photo picker */}
          <PhotoPicker value={photo} onChange={setPhoto} size={84} />

          {/* Fields */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", flex: 1, gap: 0 }}>
            <div style={fieldWrap}>
              <label style={formLabel}>Item Name</label>
              <input
                placeholder="e.g. Paneer Tikka"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={s.input}
              />
            </div>
            <div style={fieldWrap}>
              <label style={formLabel}>Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={s.select}
              >
                <option value="">Select…</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div style={fieldWrap}>
              <label style={formLabel}>Price (₹)</label>
              <input
                type="number"
                value={pricePoints}
                onChange={(e) => setPricePoints(e.target.value)}
                style={s.input}
              />
            </div>
            {/* Description — full width row */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", marginBottom: 10 }}>
              <label style={formLabel}>Description (optional)</label>
              <textarea
                placeholder="e.g. Grilled paneer with spices…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                style={{
                  ...s.input,
                  width: "100%",
                  resize: "vertical",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                  marginRight: 0,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <button
                onClick={save}
                style={s.btn}
                disabled={!name || !categoryId}
              >
                {editingId ? "✓ Update" : "+ Add"}
              </button>
              {editingId && (
                <button onClick={resetForm} style={s.btnGhost}>Cancel</button>
              )}
            </div>
          </div>
        </div>

        {/* Photo clear option when editing */}
        {editingId && photo && (
          <button
            onClick={() => setPhoto(null)}
            style={{
              marginTop: 8,
              fontSize: 12,
              color: colors.muted,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✕ Remove photo
          </button>
        )}
      </div>

      {/* ── ITEM LIST ── */}
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={s.sectionTitle}>Items ({items.length})</div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            style={{ ...s.select, marginBottom: 0 }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {items.length === 0 ? (
          <div style={{ color: colors.muted, padding: "12px 0" }}>
            {filterCat ? "No items in this category." : "No items found."}
          </div>
        ) : (
          items.map(it => (
            <div key={it.id} style={{ ...s.row, gap: 14 }}>
              {/* Thumbnail */}
              <ItemImage src={it.imageUrl} name={it.name} size={52} />

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{it.name}</span>
                  <span style={s.badge(it.available ? colors.green : colors.danger)}>
                    {it.available ? "Available" : "Sold Out"}
                  </span>
                </div>
                {it.description && (
                  <div style={{ fontSize: 12, color: colors.muted, marginTop: 3, maxWidth: 320, lineHeight: 1.4 }}>
                    {it.description}
                  </div>
                )}
                <div style={{ fontSize: 13, color: colors.gold, marginTop: 3 }}>
                  ₹ {it.pricePoints} · ID: {it.id}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => toggle(it)}
                  style={it.available ? s.btnSm : s.btnSuccess}
                >
                  {it.available ? "Sold Out" : "Available"}
                </button>
                <button onClick={() => startEdit(it)} style={s.btnGhost}>
                  Edit
                </button>
                <button onClick={() => deleteItem(it.id)} style={s.btnDanger}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}

        <div style={{ fontSize: 12, color: colors.muted, marginTop: 12 }}>
          Admin view includes unavailable items and inactive categories.
        </div>
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
