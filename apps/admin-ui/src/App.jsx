import React from "react";
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import KioskControl from "./pages/KioskControl.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import Users from "./pages/Users.jsx";
import Pairs from "./pages/Pairs.jsx";
import Groups from "./pages/Groups.jsx";
import Categories from "./pages/Categories.jsx";
import Items from "./pages/Items.jsx";
import { getToken, clearToken } from "./lib/adminApi.js";
import { colors } from "./lib/adminStyles.js";

const navLinks = [
  { group: "Overview", items: [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/kiosk",     label: "Kiosk Control", icon: "🖥️" },
    { to: "/orders",    label: "Orders", icon: "🧾" },
  ]},
  { group: "People", items: [
    { to: "/users",  label: "Users",  icon: "👤" },
    { to: "/pairs",  label: "Pairs",  icon: "👫" },
    { to: "/groups", label: "Groups", icon: "👥" },
  ]},
  { group: "Menu", items: [
    { to: "/categories", label: "Categories", icon: "📁" },
    { to: "/items",      label: "Items",      icon: "🍽️" },
  ]},
];

function NavLink({ to, label, icon }) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        textDecoration: "none",
        fontSize: 14,
        fontWeight: active ? 800 : 500,
        color: active ? "#fff" : "rgba(255,255,255,0.55)",
        background: active
          ? "linear-gradient(90deg, rgba(255,30,30,0.25), rgba(255,30,30,0.08))"
          : "transparent",
        borderLeft: active ? "3px solid #ff1f1f" : "3px solid transparent",
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </Link>
  );
}

function Layout({ children }) {
  const nav = useNavigate();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "radial-gradient(circle at top left, #1a0000, #000)", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: colors.sidebar,
        borderRight: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "24px 12px 16px",
      }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 28, padding: "0 4px" }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🏷️</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#ffcc00", letterSpacing: 1.5 }}>IDEAZZZZ 360</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1, marginTop: 2 }}>ADMIN PANEL</div>
        </div>

        {/* Nav groups */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {navLinks.map(group => (
            <div key={group.group}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", padding: "0 14px", marginBottom: 6 }}>
                {group.group}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {group.items.map(link => <NavLink key={link.to} {...link} />)}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => { clearToken(); nav("/login"); }}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.5)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: "auto", color: "#fff" }}>
        {children}
      </main>
    </div>
  );
}

function Protected({ element }) {
  return getToken() ? element : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard"    element={<Protected element={<Layout><Dashboard /></Layout>} />} />
      <Route path="/kiosk"        element={<Protected element={<Layout><KioskControl /></Layout>} />} />
      <Route path="/orders"       element={<Protected element={<Layout><Orders /></Layout>} />} />
      <Route path="/orders/:id"   element={<Protected element={<Layout><OrderDetail /></Layout>} />} />
      <Route path="/users"        element={<Protected element={<Layout><Users /></Layout>} />} />
      <Route path="/pairs"        element={<Protected element={<Layout><Pairs /></Layout>} />} />
      <Route path="/groups"       element={<Protected element={<Layout><Groups /></Layout>} />} />
      <Route path="/categories"   element={<Protected element={<Layout><Categories /></Layout>} />} />
      <Route path="/items"        element={<Protected element={<Layout><Items /></Layout>} />} />
      <Route path="/"             element={<Navigate to={getToken() ? "/dashboard" : "/login"} replace />} />
      <Route path="*"             element={<Navigate to="/" replace />} />
    </Routes>
  );
}
