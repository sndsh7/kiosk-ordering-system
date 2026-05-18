// ─── Admin Design System ───────────────────────────────────────────────────
// Mirrors the kiosk dark-red radial gradient aesthetic

export const colors = {
  bg: "radial-gradient(circle at top left, #1a0000, #000)",
  sidebar: "linear-gradient(180deg, #1e0000 0%, #0a0000 100%)",
  card: "linear-gradient(135deg, #2a0000 0%, #150000 100%)",
  cardAlt: "linear-gradient(135deg, #200000 0%, #100000 100%)",
  border: "rgba(255,0,0,0.25)",
  borderHover: "rgba(255,0,0,0.55)",
  red: "#ff1f1f",
  redDark: "#920000",
  gold: "#ffcc00",
  green: "#00e676",
  white: "#ffffff",
  muted: "rgba(255,255,255,0.55)",
  danger: "#ff4444",
  inputBg: "rgba(255,255,255,0.04)",
  inputBorder: "rgba(255,255,255,0.12)",
};

export const s = {
  // Layout
  page: {
    flex: 1,
    padding: "28px 32px",
    color: "#fff",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    overflowY: "auto",
  },

  // Typography
  pageTitle: {
    fontSize: 30,
    fontWeight: 900,
    letterSpacing: 1,
    marginBottom: 24,
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 2,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 16,
  },

  // Cards
  card: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    padding: "20px 24px",
    marginBottom: 18,
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
  },

  // Table
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: colors.muted,
    textTransform: "uppercase",
    borderBottom: `1px solid ${colors.border}`,
  },
  td: {
    padding: "14px 16px",
    fontSize: 15,
    borderBottom: `1px solid rgba(255,0,0,0.1)`,
    color: "#fff",
    verticalAlign: "middle",
  },

  // Inputs
  input: {
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 15,
    color: "#fff",
    outline: "none",
    marginRight: 10,
    marginBottom: 10,
  },
  select: {
    background: "#1a0000",
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 15,
    color: "#fff",
    outline: "none",
    marginRight: 10,
    marginBottom: 10,
    cursor: "pointer",
  },

  // Buttons
  btn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: `1px solid rgba(255,0,0,0.6)`,
    background: "linear-gradient(180deg, #ff1f1f, #920000)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.5,
    boxShadow: "0 0 12px rgba(255,0,0,0.25)",
    transition: "opacity 0.15s",
  },
  btnSm: {
    padding: "6px 14px",
    borderRadius: 8,
    border: `1px solid rgba(255,0,0,0.5)`,
    background: "linear-gradient(180deg, #ff1f1f, #920000)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  btnGhost: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    marginLeft: 8,
  },
  btnDanger: {
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,50,50,0.6)",
    background: "rgba(200,0,0,0.3)",
    color: "#ff6666",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  btnSuccess: {
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid rgba(0,200,100,0.5)",
    background: "rgba(0,150,70,0.25)",
    color: "#00e676",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },

  // Row
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,0,0,0.1)",
  },

  // Badges
  badge: (color = colors.red) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 700,
    background: `${color}22`,
    color: color,
    border: `1px solid ${color}44`,
    letterSpacing: 0.5,
  }),

  // Misc
  divider: {
    height: 1,
    background: colors.border,
    margin: "16px 0",
  },
  msg: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 10,
    padding: "8px 14px",
    borderRadius: 8,
    background: "rgba(0,200,100,0.1)",
    color: colors.green,
    border: "1px solid rgba(0,200,100,0.3)",
    display: "inline-block",
  },
  errMsg: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 10,
    padding: "8px 14px",
    borderRadius: 8,
    background: "rgba(255,50,50,0.1)",
    color: "#ff6666",
    border: "1px solid rgba(255,50,50,0.3)",
    display: "inline-block",
  },
};
