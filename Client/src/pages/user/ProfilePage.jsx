import React, { useState} from "react";
import {
   Zap, User, Mail, Shield, Store, ArrowRight, CheckCircle,
   AlertTriangle, Edit3, Save, X, Trash2, Package, BarChart2,
   DollarSign, TrendingUp, ChevronRight, Star, Eye, EyeOff,
   Copy, Check, Settings, LogOut, Bell, Lock
} from "lucide-react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {logoutUser} from "../../store/slices/authSlice";
import { updateUser } from "../../store/slices/userSlice";
import { registerSeller, removeSeller } from "../../store/slices/sellerSlice";




/* ─────────────────────────────────────────────────────────
   TINY ATOMS
───────────────────────────────────────────────────────── */
function Avatar({ name, size = 72 }) {
   const initials = name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
   return (
      <div
         style={{
            width: size, height: size, borderRadius: size * 0.28,
            background: "linear-gradient(135deg,#00c6ff,#a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Syne',sans-serif",
            fontSize: size * 0.34, fontWeight: 800, color: "#020408",
            flexShrink: 0, letterSpacing: -1,
         }}
      >
         {initials}
      </div>
   );
}

function RoleBadge({ role }) {
   const map = {
      SELLER: { label: "Seller", color: "#00c6ff", bg: "rgba(0,198,255,0.1)", border: "rgba(0,198,255,0.25)" },
      CUSTOMER: { label: "Customer", color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.25)" },
      ADMIN: { label: "Admin", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
   };
   const s = map[role] || map.CUSTOMER;
   return (
      <span style={{
         display: "inline-flex", alignItems: "center", gap: 6,
         padding: "4px 12px", borderRadius: 20,
         background: s.bg, border: `1px solid ${s.border}`,
         fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: 0.6,
      }}>
         <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
         {s.label}
      </span>
   );
}

function InfoRow({ icon, label, value, mono }) {
   const [copied, setCopied] = useState(false);
   const copy = () => {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
   };
   return (
      <div className="pf-info-row">
         <div className="pf-info-icon">{icon}</div>
         <div className="pf-info-body">
            <span className="pf-info-label">{label}</span>
            <span className="pf-info-value" style={mono ? { fontFamily: "monospace", fontSize: 12, letterSpacing: 0.5 } : {}}>
               {value}
            </span>
         </div>
         <button className="pf-copy-btn" onClick={copy} title="Copy">
            {copied ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
         </button>
      </div>
   );
}

function StatCard({ icon, label, value, color, bg }) {
   return (
      <div className="pf-stat">
         <div className="pf-stat-icon" style={{ background: bg, color }}>{icon}</div>
         <div className="pf-stat-val">{value}</div>
         <div className="pf-stat-label">{label}</div>
      </div>
   );
}

/* ─────────────────────────────────────────────────────────
   REMOVE MODAL
───────────────────────────────────────────────────────── */
function RemoveModal({ onClose, onConfirm, loading }) {
   const [typed, setTyped] = useState("");
   const confirmed = typed === "REMOVE";
   return (
      <div className="pf-modal-bg" onClick={() => !loading && onClose()}>
         <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pf-modal-icon-wrap">
               <AlertTriangle size={24} color="#f87171" />
            </div>
            <h3 className="pf-modal-title">Remove Seller Account?</h3>
            <p className="pf-modal-sub">
               Your store, listings, and analytics will be <strong>permanently deleted</strong>.
               Your account reverts to <strong>Customer</strong>. Pending payouts still process.
            </p>
            <div className="pf-modal-cons">
               {[
                  "All product listings removed immediately",
                  "Store page taken offline",
                  "Seller analytics permanently deleted",
                  "Buyer history & reviews retained",
               ].map((t) => (
                  <div className="pf-modal-con" key={t}>
                     <span style={{ color: "#f87171", fontSize: 11 }}>✕</span> {t}
                  </div>
               ))}
            </div>
            <label className="pf-modal-lbl">
               Type <strong style={{ color: "#f87171" }}>REMOVE</strong> to confirm
            </label>
            <input
               className={`pf-modal-input ${confirmed ? "ok" : ""}`}
               value={typed}
               onChange={(e) => setTyped(e.target.value.toUpperCase())}
               placeholder="Type REMOVE here"
               autoFocus
            />
            <div className="pf-modal-row">
               <button className="pf-modal-cancel" onClick={onClose} disabled={loading}>Cancel</button>
               <button className="pf-modal-confirm" disabled={!confirmed || loading} onClick={onConfirm}>
                  {loading
                     ? <><div className="pf-spin" style={{ borderTopColor: "#fff" }} /> Removing…</>
                     : <><Trash2 size={13} /> Remove Seller</>}
               </button>
            </div>
         </div>
      </div>
   );
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
export default function ProfilePage() {

   const INITIAL_USER = useSelector(state=>state.auth.user)
   const [user, setUser] = useState(INITIAL_USER);
   const INITIAL_SELLER = user.role === "SELLER" ? user : null;
   const [seller, setSeller] = useState(
      INITIAL_USER.role === "SELLER" ? INITIAL_SELLER : null
   );
   const dispatch = useDispatch()

   const [tab, setTab] = useState(
      INITIAL_USER.role === "SELLER" ? "seller-dashboard" : "profile"
   );

   /* profile edit */
   const [editing, setEditing] = useState(false);
   const [editName, setEditName] = useState(user.name);
   const [editEmail, setEditEmail] = useState(user.email);
   const [editSaving, setEditSaving] = useState(false);

   /* seller register */
   const [storeName, setStoreName] = useState("");
   const [storeDesc, setStoreDesc] = useState("");
   const [storeNameErr, setStoreNameErr] = useState("");
   const [regLoading, setRegLoading] = useState(false);
   const [regSuccess, setRegSuccess] = useState(false);

   /* seller remove */
   const [showRemove, setShowRemove] = useState(false);
   const [removeLoading, setRemoveLoading] = useState(false);

   /* verification resend */
   const [verifyLoading, setVerifyLoading] = useState(false);
   const [verifySent, setVerifySent] = useState(false);

   const handleSaveProfile = async () => {
      if (!editName.trim()) return;
      setEditSaving(true);
      dispatch(updateUser({ name: editName.trim(), email: editEmail.trim() }))
      setUser((u) => ({ ...u, name: editName.trim(), email: editEmail.trim() }));
      setEditing(false);
      setEditSaving(false);
   };

   const handleSellerRegister = async () => {
      if (!storeName.trim()) { setStoreNameErr("Store name is required"); return; }
      if (storeName.length < 3) { setStoreNameErr("Minimum 3 characters"); return; }
      setStoreNameErr(""); setRegLoading(true);
      dispatch(registerSeller({storeName, storeDescription: storeDesc}))
      setSeller({ storeName: storeName.trim(), storeDescription: storeDesc.trim(), rating: 0, totalSales: 0, products: 0 });
      setUser((u) => ({ ...u, role: "SELLER" }));
      setRegSuccess(true);
      setTimeout(() => { setRegSuccess(false); setTab("seller-dashboard"); }, 1600);
      setRegLoading(false);
   };

   const handleRemoveSeller = async () => {
      setRemoveLoading(true);
      dispatch(removeSeller())
      setUser((u) => ({ ...u, role: "CUSTOMER" }));
      setSeller(null);
      setShowRemove(false);
      setRemoveLoading(false);
      setTab("profile");
   };

   const handleResendVerification = async () => {
      setVerifyLoading(true);
      await new Promise((r) => setTimeout(r, 1200));
      setVerifySent(true);
      setVerifyLoading(false);
      setTimeout(() => setVerifySent(false), 4000);
   };

   /* ── sidebar nav items ── */
   const navItems = [
      { id: "profile", icon: <User size={15} />, label: "My Profile" },
      user.role === "SELLER"
         ? { id: "seller-dashboard", icon: <Store size={15} />, label: "Seller Dashboard" }
         : { id: "seller-register", icon: <Store size={15} />, label: "Become a Seller" },
      { id: "orders", icon: <Package size={15} />, label: "My Orders" },
      { id: "settings", icon: <Settings size={15} />, label: "Settings" },
   ];

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

        .pf-root {
          min-height:100vh; background:#020408;
          font-family:'DM Sans',sans-serif; color:#fff;
          position:relative; overflow-x:hidden;
        }
        .pf-grid {
          position:fixed; inset:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(0,198,255,0.028) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,198,255,0.028) 1px,transparent 1px);
          background-size:60px 60px;
        }
        .pf-orb1 {
          position:fixed; width:560px; height:560px; border-radius:50%; pointer-events:none;
          background:radial-gradient(circle,rgba(0,198,255,0.09) 0%,transparent 68%);
          top:-200px; left:-180px;
        }
        .pf-orb2 {
          position:fixed; width:440px; height:440px; border-radius:50%; pointer-events:none;
          background:radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 68%);
          bottom:-140px; right:-120px;
        }

        /* ── NAVBAR ── */
        .pf-nav {
          position:sticky; top:0; z-index:100;
          height:60px; padding:0 28px;
          display:flex; align-items:center; gap:10px;
          background:rgba(2,4,8,0.88); backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(255,255,255,0.06);
        }
        .pf-nav-logo { display:flex; align-items:center; gap:9px; text-decoration:none; }
        .pf-nav-logo-icon {
          width:32px; height:32px; border-radius:9px;
          background:linear-gradient(135deg,#00c6ff,#a855f7);
          display:flex; align-items:center; justify-content:center;
        }
        .pf-nav-logo-text {
          font-family:'Syne',sans-serif; font-size:17px; font-weight:800;
          background:linear-gradient(135deg,#fff 40%,#00c6ff);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .pf-nav-sep { color:rgba(255,255,255,0.15); font-size:18px; margin:0 2px; }
        .pf-nav-crumb { font-size:13px; color:rgba(255,255,255,0.4); font-weight:500; }
        .pf-nav-spacer { flex:1; }
        .pf-nav-user {
          display:flex; align-items:center; gap:10px;
          padding:6px 14px 6px 8px; border-radius:50px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          cursor:pointer; transition:background 0.2s;
        }
        .pf-nav-user:hover { background:rgba(255,255,255,0.07); }
        .pf-nav-uname { font-size:13px; font-weight:600; color:rgba(255,255,255,0.8); }
        .pf-nav-logout {
          width:34px; height:34px; border-radius:9px; border:none;
          background:rgba(248,113,113,0.08); color:#f87171;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:background 0.2s;
        }
        .pf-nav-logout:hover { background:rgba(248,113,113,0.15); }

        /* ── LAYOUT ── */
        .pf-layout {
          position:relative; z-index:1;
          max-width:1140px; margin:0 auto;
          padding:40px 24px 100px;
          display:grid;
          grid-template-columns:240px 1fr;
          gap:28px; align-items:start;
        }
        @media(max-width:780px){ .pf-layout{ grid-template-columns:1fr; } }

        /* ── SIDEBAR ── */
        .pf-sidebar {
          display:flex; flex-direction:column; gap:6px;
          position:sticky; top:80px;
        }
        .pf-sidebar-card {
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:20px; padding:22px 16px;
          margin-bottom:10px;
          display:flex; flex-direction:column; align-items:center; gap:12px;
          text-align:center;
        }
        .pf-sidebar-name {
          font-family:'Syne',sans-serif; font-size:16px; font-weight:800;
          color:#fff; letter-spacing:-0.3px;
        }
        .pf-sidebar-email { font-size:12px; color:rgba(255,255,255,0.35); margin-top:2px; }
        .pf-sidebar-badges { display:flex; gap:6px; flex-wrap:wrap; justify-content:center; margin-top:4px; }

        .pf-nav-item {
          display:flex; align-items:center; gap:11px;
          padding:11px 14px; border-radius:13px; border:none;
          background:transparent; cursor:pointer; text-align:left; width:100%;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
          color:rgba(255,255,255,0.45);
          transition:background 0.15s, color 0.15s;
        }
        .pf-nav-item:hover { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.8); }
        .pf-nav-item.active {
          background:rgba(0,198,255,0.08);
          border:1px solid rgba(0,198,255,0.18);
          color:#00c6ff;
        }
        .pf-nav-item.active svg { color:#00c6ff; }
        .pf-nav-dot {
          width:6px; height:6px; border-radius:50%;
          background:linear-gradient(135deg,#00c6ff,#a855f7);
          margin-left:auto; flex-shrink:0;
        }

        .pf-sidebar-divider { height:1px; background:rgba(255,255,255,0.07); margin:4px 0; }

        /* ── MAIN PANEL ── */
        .pf-panel {
          animation:pf-in 0.35s ease forwards;
        }
        @keyframes pf-in {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* section heading */
        .pf-section-head { margin-bottom:24px; }
        .pf-section-badge {
          display:inline-flex; align-items:center; gap:6px;
          padding:4px 12px; border-radius:20px;
          font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;
          margin-bottom:10px;
        }
        .pf-section-title {
          font-family:'Syne',sans-serif; font-size:clamp(22px,3vw,30px);
          font-weight:800; color:#fff; letter-spacing:-0.8px; line-height:1.15;
        }
        .pf-section-title span {
          background:linear-gradient(135deg,#00c6ff,#a855f7);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .pf-section-sub { font-size:14px; color:rgba(255,255,255,0.38); margin-top:6px; line-height:1.6; }

        /* ── VERIFICATION BANNER ── */
        .pf-verify-banner {
          display:flex; align-items:center; gap:14px; flex-wrap:wrap;
          padding:14px 18px; border-radius:15px; margin-bottom:22px;
          background:rgba(245,158,11,0.07);
          border:1px solid rgba(245,158,11,0.2);
        }
        .pf-verify-icon {
          width:36px; height:36px; border-radius:50%; flex-shrink:0;
          background:rgba(245,158,11,0.12);
          display:flex; align-items:center; justify-content:center;
        }
        .pf-verify-text { flex:1; }
        .pf-verify-title { font-size:13px; font-weight:700; color:#f59e0b; margin-bottom:2px; }
        .pf-verify-sub   { font-size:12px; color:rgba(245,158,11,0.6); }
        .pf-verify-btn {
          padding:8px 16px; border-radius:10px; border:1px solid rgba(245,158,11,0.3);
          background:rgba(245,158,11,0.1); cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:12px; font-weight:700; color:#f59e0b;
          white-space:nowrap; transition:background 0.2s;
          display:flex; align-items:center; gap:6px;
        }
        .pf-verify-btn:hover { background:rgba(245,158,11,0.18); }
        .pf-verify-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .pf-verify-success {
          padding:14px 18px; border-radius:15px; margin-bottom:22px;
          background:rgba(34,197,94,0.07); border:1px solid rgba(34,197,94,0.2);
          color:#22c55e; font-size:13px; font-weight:600;
          display:flex; align-items:center; gap:10px;
        }

        /* ── PROFILE CARD ── */
        .pf-card {
          background:rgba(255,255,255,0.028);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:22px; padding:32px;
          backdrop-filter:blur(14px);
          margin-bottom:20px;
        }
        .pf-card-title {
          font-family:'Syne',sans-serif; font-size:15px; font-weight:800;
          color:#fff; margin-bottom:20px; letter-spacing:-0.2px;
          display:flex; align-items:center; gap:10px;
        }
        .pf-card-title-line {
          flex:1; height:1px; background:rgba(255,255,255,0.07);
        }

        /* info rows */
        .pf-info-row {
          display:flex; align-items:center; gap:14px;
          padding:13px 0;
          border-bottom:1px solid rgba(255,255,255,0.05);
        }
        .pf-info-row:last-child { border-bottom:none; }
        .pf-info-icon {
          width:36px; height:36px; border-radius:10px; flex-shrink:0;
          background:rgba(255,255,255,0.04);
          display:flex; align-items:center; justify-content:center;
          color:rgba(255,255,255,0.35);
        }
        .pf-info-body { flex:1; display:flex; flex-direction:column; gap:2px; min-width:0; }
        .pf-info-label { font-size:10px; font-weight:700; letter-spacing:0.9px; text-transform:uppercase; color:rgba(255,255,255,0.3); }
        .pf-info-value { font-size:14px; font-weight:600; color:rgba(255,255,255,0.85); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .pf-copy-btn {
          width:28px; height:28px; border-radius:7px; border:none;
          background:rgba(255,255,255,0.04); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          color:rgba(255,255,255,0.3); transition:background 0.15s, color 0.15s;
          flex-shrink:0;
        }
        .pf-copy-btn:hover { background:rgba(255,255,255,0.08); color:#fff; }

        /* edit form */
        .pf-edit-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:560px){ .pf-edit-grid{ grid-template-columns:1fr; } }
        .pf-field { display:flex; flex-direction:column; gap:7px; }
        .pf-label {
          font-size:10px; font-weight:700; letter-spacing:0.9px;
          text-transform:uppercase; color:rgba(255,255,255,0.4);
        }
        .pf-input {
          padding:12px 14px; border-radius:12px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1); color:#fff;
          font-family:'DM Sans',sans-serif; font-size:14px; outline:none;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .pf-input:focus {
          border-color:rgba(0,198,255,0.45);
          box-shadow:0 0 0 3px rgba(0,198,255,0.07);
        }
        .pf-input::placeholder { color:rgba(255,255,255,0.2); }
        .pf-edit-actions { display:flex; gap:10px; margin-top:18px; }
        .pf-btn-save {
          padding:11px 22px; border-radius:11px; border:none; cursor:pointer;
          font-family:'Syne',sans-serif; font-size:13px; font-weight:700;
          color:#020408; background:linear-gradient(135deg,#00c6ff,#a855f7);
          display:flex; align-items:center; gap:7px;
          transition:transform 0.2s, box-shadow 0.2s, opacity 0.2s;
        }
        .pf-btn-save:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 24px rgba(0,198,255,0.25); }
        .pf-btn-save:disabled { opacity:0.5; cursor:not-allowed; }
        .pf-btn-cancel {
          padding:11px 18px; border-radius:11px;
          border:1px solid rgba(255,255,255,0.1);
          background:transparent; cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
          color:rgba(255,255,255,0.5); transition:background 0.2s, color 0.2s;
        }
        .pf-btn-cancel:hover { background:rgba(255,255,255,0.06); color:#fff; }

        .pf-edit-trigger {
          display:flex; align-items:center; gap:7px;
          padding:9px 16px; border-radius:11px;
          border:1px solid rgba(255,255,255,0.1);
          background:rgba(255,255,255,0.03); cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
          color:rgba(255,255,255,0.55); margin-left:auto;
          transition:background 0.2s, color 0.2s, border-color 0.2s;
        }
        .pf-edit-trigger:hover { background:rgba(255,255,255,0.07); color:#fff; border-color:rgba(255,255,255,0.2); }

        /* ── BECOME SELLER CTA ── */
        .pf-seller-cta {
          border-radius:22px; overflow:hidden;
          position:relative;
          background:linear-gradient(135deg,rgba(0,198,255,0.06) 0%,rgba(168,85,247,0.06) 100%);
          border:1px solid rgba(255,255,255,0.08);
          padding:32px;
          margin-bottom:20px;
        }
        .pf-seller-cta::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(ellipse at 10% 50%,rgba(0,198,255,0.1) 0%,transparent 55%),
            radial-gradient(ellipse at 90% 50%,rgba(168,85,247,0.08) 0%,transparent 55%);
        }
        .pf-seller-cta-inner { position:relative; z-index:1; display:flex; align-items:center; gap:20px; flex-wrap:wrap; }
        .pf-seller-cta-icon {
          width:56px; height:56px; border-radius:16px; flex-shrink:0;
          background:linear-gradient(135deg,rgba(0,198,255,0.15),rgba(168,85,247,0.15));
          border:1px solid rgba(255,255,255,0.1);
          display:flex; align-items:center; justify-content:center; font-size:26px;
        }
        .pf-seller-cta-body { flex:1; min-width:200px; }
        .pf-seller-cta-title {
          font-family:'Syne',sans-serif; font-size:18px; font-weight:800;
          color:#fff; letter-spacing:-0.4px; margin-bottom:5px;
        }
        .pf-seller-cta-sub { font-size:13px; color:rgba(255,255,255,0.4); line-height:1.6; }
        .pf-seller-cta-btn {
          padding:12px 22px; border-radius:13px; border:none; cursor:pointer;
          font-family:'Syne',sans-serif; font-size:13px; font-weight:700;
          color:#020408; background:linear-gradient(135deg,#00c6ff,#a855f7);
          display:flex; align-items:center; gap:8px; white-space:nowrap;
          transition:transform 0.2s, box-shadow 0.2s;
        }
        .pf-seller-cta-btn:hover { transform:translateY(-1px); box-shadow:0 8px 28px rgba(0,198,255,0.25); }

        /* ── SELLER REGISTER FORM ── */
        .pf-reg-field { margin-bottom:18px; }
        .pf-reg-label {
          display:flex; justify-content:space-between;
          font-size:10px; font-weight:700; letter-spacing:0.9px;
          text-transform:uppercase; color:rgba(255,255,255,0.4);
          margin-bottom:8px;
        }
        .pf-reg-char { font-size:10px; color:rgba(255,255,255,0.25); text-transform:none; letter-spacing:0; font-weight:500; }
        .pf-reg-char.warn { color:#f87171; }
        .pf-reg-input {
          width:100%; padding:13px 16px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1); border-radius:13px;
          color:#fff; font-family:'DM Sans',sans-serif; font-size:14px;
          outline:none; resize:none;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .pf-reg-input::placeholder { color:rgba(255,255,255,0.2); }
        .pf-reg-input:focus {
          border-color:rgba(0,198,255,0.45);
          box-shadow:0 0 0 3px rgba(0,198,255,0.07);
        }
        .pf-reg-input.error { border-color:rgba(248,113,113,0.5); }
        .pf-reg-err { color:#f87171; font-size:11px; font-weight:500; margin-top:5px; }
        .pf-reg-success {
          background:rgba(34,197,94,0.07); border:1px solid rgba(34,197,94,0.2);
          border-radius:12px; padding:12px 16px; color:#22c55e;
          font-size:13px; font-weight:600; margin-bottom:18px;
          display:flex; align-items:center; gap:8px;
        }
        .pf-reg-btn {
          width:100%; padding:14px; border-radius:13px; border:none; cursor:pointer;
          font-family:'Syne',sans-serif; font-size:14px; font-weight:700;
          color:#020408; background:linear-gradient(135deg,#00c6ff,#a855f7);
          display:flex; align-items:center; justify-content:center; gap:8px;
          position:relative; overflow:hidden;
          transition:transform 0.2s, box-shadow 0.2s, opacity 0.2s;
        }
        .pf-reg-btn::before {
          content:''; position:absolute; inset:0;
          background:rgba(255,255,255,0.12); opacity:0; transition:opacity 0.2s;
        }
        .pf-reg-btn:hover::before { opacity:1; }
        .pf-reg-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 28px rgba(0,198,255,0.28); }
        .pf-reg-btn:disabled { opacity:0.5; cursor:not-allowed; }

        /* perks */
        .pf-perks { display:flex; flex-direction:column; gap:0; }
        .pf-perk {
          display:flex; align-items:flex-start; gap:12px;
          padding:13px 0; border-bottom:1px solid rgba(255,255,255,0.05);
        }
        .pf-perk:last-child { border-bottom:none; }
        .pf-perk-ico {
          width:34px; height:34px; border-radius:9px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .pf-perk-title { font-size:13px; font-weight:700; color:#fff; margin-bottom:2px; }
        .pf-perk-desc  { font-size:12px; color:rgba(255,255,255,0.36); line-height:1.5; }

        /* ── SELLER DASHBOARD ── */
        .pf-store-header {
          display:flex; align-items:center; gap:16px; margin-bottom:6px;
          flex-wrap:wrap;
        }
        .pf-store-avatar {
          width:56px; height:56px; border-radius:15px; flex-shrink:0;
          background:linear-gradient(135deg,#00c6ff,#a855f7);
          display:flex; align-items:center; justify-content:center; font-size:24px;
        }
        .pf-store-name {
          font-family:'Syne',sans-serif; font-size:22px; font-weight:800;
          color:#fff; letter-spacing:-0.5px; margin-bottom:4px;
        }
        .pf-store-desc { font-size:13px; color:rgba(255,255,255,0.38); max-width:480px; line-height:1.5; }

        .pf-dash-stats {
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(160px,1fr));
          gap:14px; margin-top:28px;
        }
        .pf-stat {
          padding:20px 18px; border-radius:17px;
          border:1px solid rgba(255,255,255,0.07);
          background:rgba(255,255,255,0.025);
          transition:transform 0.2s, border-color 0.2s;
        }
        .pf-stat:hover { transform:translateY(-3px); border-color:rgba(255,255,255,0.12); }
        .pf-stat-icon {
          width:36px; height:36px; border-radius:10px;
          display:flex; align-items:center; justify-content:center;
          margin-bottom:12px;
        }
        .pf-stat-val {
          font-family:'Syne',sans-serif; font-size:24px; font-weight:800;
          color:#fff; line-height:1; margin-bottom:4px;
        }
        .pf-stat-label { font-size:11px; color:rgba(255,255,255,0.35); font-weight:500; }

        /* quick actions */
        .pf-qactions {
          display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr));
          gap:12px; margin-top:24px;
        }
        .pf-qaction {
          display:flex; align-items:center; gap:12px;
          padding:14px 16px; border-radius:14px;
          border:1px solid rgba(255,255,255,0.07);
          background:rgba(255,255,255,0.025); cursor:pointer;
          transition:background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .pf-qaction:hover { background:rgba(255,255,255,0.055); border-color:rgba(255,255,255,0.13); transform:translateY(-2px); }
        .pf-qaction-ico {
          width:36px; height:36px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; font-size:17px;
        }
        .pf-qaction-label { font-size:13px; font-weight:700; color:#fff; margin-bottom:1px; }
        .pf-qaction-sub   { font-size:11px; color:rgba(255,255,255,0.3); }

        /* danger zone */
        .pf-danger {
          margin-top:32px;
          border:1px solid rgba(248,113,113,0.15);
          border-radius:20px; overflow:hidden;
        }
        .pf-danger-head {
          padding:16px 24px; background:rgba(248,113,113,0.05);
          border-bottom:1px solid rgba(248,113,113,0.1);
          display:flex; align-items:center; gap:9px;
        }
        .pf-danger-head-title {
          font-family:'Syne',sans-serif; font-size:14px; font-weight:800; color:#f87171;
        }
        .pf-danger-body { padding:22px 24px; }
        .pf-danger-row {
          display:flex; align-items:center; justify-content:space-between;
          gap:20px; flex-wrap:wrap;
        }
        .pf-danger-info h4 { font-size:14px; font-weight:700; color:#fff; margin-bottom:5px; }
        .pf-danger-info p  { font-size:13px; color:rgba(255,255,255,0.38); line-height:1.55; max-width:440px; }
        .pf-danger-btn {
          padding:11px 20px; border-radius:11px;
          border:1px solid rgba(248,113,113,0.3);
          background:rgba(248,113,113,0.07); cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700;
          color:#f87171; white-space:nowrap;
          display:flex; align-items:center; gap:7px;
          transition:background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .pf-danger-btn:hover { background:rgba(248,113,113,0.13); border-color:rgba(248,113,113,0.45); transform:translateY(-1px); }

        /* ── MODAL ── */
        .pf-modal-bg {
          position:fixed; inset:0; z-index:200;
          background:rgba(2,4,8,0.88); backdrop-filter:blur(8px);
          display:flex; align-items:center; justify-content:center; padding:24px;
          animation:pf-in 0.2s ease;
        }
        .pf-modal {
          width:100%; max-width:450px;
          background:#0b0f1a;
          border:1px solid rgba(248,113,113,0.2);
          border-radius:22px; padding:34px;
          box-shadow:0 30px 80px rgba(0,0,0,0.6);
          animation:pf-modal-in 0.25s cubic-bezier(0.34,1.3,0.64,1);
        }
        @keyframes pf-modal-in {
          from { opacity:0; transform:scale(0.9) translateY(12px); }
          to   { opacity:1; transform:scale(1)   translateY(0);    }
        }
        .pf-modal-icon-wrap {
          width:50px; height:50px; border-radius:50%;
          background:rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.2);
          display:flex; align-items:center; justify-content:center; margin-bottom:16px;
        }
        .pf-modal-title {
          font-family:'Syne',sans-serif; font-size:21px; font-weight:800;
          color:#fff; margin-bottom:9px; letter-spacing:-0.4px;
        }
        .pf-modal-sub {
          font-size:13px; color:rgba(255,255,255,0.42); line-height:1.65; margin-bottom:20px;
        }
        .pf-modal-sub strong { color:rgba(255,255,255,0.7); }
        .pf-modal-cons {
          background:rgba(248,113,113,0.05); border:1px solid rgba(248,113,113,0.12);
          border-radius:11px; padding:13px 15px;
          display:flex; flex-direction:column; gap:7px; margin-bottom:20px;
        }
        .pf-modal-con { font-size:12px; color:rgba(255,255,255,0.45); display:flex; align-items:center; gap:7px; }
        .pf-modal-lbl {
          display:block; font-size:11px; font-weight:600;
          color:rgba(255,255,255,0.4); margin-bottom:7px;
        }
        .pf-modal-input {
          width:100%; padding:12px 14px; border-radius:11px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(248,113,113,0.25); color:#fff;
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
          letter-spacing:2px; outline:none; margin-bottom:20px;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .pf-modal-input::placeholder { letter-spacing:0; font-weight:400; color:rgba(255,255,255,0.2); }
        .pf-modal-input:focus  { border-color:rgba(248,113,113,0.5); box-shadow:0 0 0 3px rgba(248,113,113,0.08); }
        .pf-modal-input.ok     { border-color:rgba(34,197,94,0.5);   box-shadow:0 0 0 3px rgba(34,197,94,0.08); }
        .pf-modal-row { display:flex; gap:10px; }
        .pf-modal-cancel {
          flex:1; padding:12px; border-radius:11px;
          border:1px solid rgba(255,255,255,0.1);
          background:rgba(255,255,255,0.04); cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
          color:rgba(255,255,255,0.55); transition:background 0.2s, color 0.2s;
        }
        .pf-modal-cancel:hover { background:rgba(255,255,255,0.08); color:#fff; }
        .pf-modal-cancel:disabled { opacity:0.4; cursor:not-allowed; }
        .pf-modal-confirm {
          flex:1.6; padding:12px; border-radius:11px; border:none; cursor:pointer;
          font-family:'Syne',sans-serif; font-size:13px; font-weight:700;
          background:linear-gradient(135deg,#dc2626,#f87171); color:#fff;
          display:flex; align-items:center; justify-content:center; gap:7px;
          transition:opacity 0.2s, transform 0.2s;
        }
        .pf-modal-confirm:hover:not(:disabled) { transform:translateY(-1px); }
        .pf-modal-confirm:disabled { opacity:0.4; cursor:not-allowed; }

        /* spinner */
        .pf-spin {
          width:15px; height:15px; border-radius:50%;
          border:2px solid rgba(2,4,8,0.2); border-top-color:#020408;
          animation:pf-spin-anim 0.7s linear infinite;
        }
        @keyframes pf-spin-anim { to { transform:rotate(360deg); } }
        .pf-spin.white { border-color:rgba(255,255,255,0.2); border-top-color:#fff; }
      `}</style>

         <div className="pf-root">
            <div className="pf-grid" />
            <div className="pf-orb1" />
            <div className="pf-orb2" />

            {/* ── NAV ── */}
            <nav className="pf-nav">
               <a href="/" className="pf-nav-logo">
                  <div className="pf-nav-logo-icon">
                     <Zap size={16} color="#020408" strokeWidth={2.5} />
                  </div>
                  <span className="pf-nav-logo-text">QuantumCart</span>
               </a>
               <span className="pf-nav-sep">/</span>
               <span className="pf-nav-crumb">My Account</span>
               <div className="pf-nav-spacer" />
               <div className="pf-nav-user">
                  <Avatar name={user?.name} size={28} />
                  <span className="pf-nav-uname">{user?.name}</span>
               </div>
               <button className="pf-nav-logout" title="Logout" onClick={() => dispatch(logoutUser())}>
                  <LogOut size={15} />
               </button>
            </nav>

            {/* ── LAYOUT ── */}
            <div className="pf-layout">

               {/* ── SIDEBAR ── */}
               <aside className="pf-sidebar">
                  {/* User card */}
                  <div className="pf-sidebar-card">
                     <Avatar name={user.name} size={62} />
                     <div>
                        <div className="pf-sidebar-name">{user.name}</div>
                        <div className="pf-sidebar-email">{user.email}</div>
                     </div>
                     <div className="pf-sidebar-badges">
                        <RoleBadge role={user.role} />
                        {!user.isVerified && (
                           <span style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              padding: "4px 10px", borderRadius: 20,
                              background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
                              fontSize: 10, fontWeight: 700, color: "#f59e0b", letterSpacing: 0.5,
                           }}>⚠ Unverified</span>
                        )}
                     </div>
                  </div>

                  {/* Nav */}
                  {navItems.map((item) => (
                     <button
                        key={item.id}
                        className={`pf-nav-item ${tab === item.id ? "active" : ""}`}
                        onClick={() => setTab(item.id)}
                     >
                        {item.icon}
                        {item.label}
                        {tab === item.id && <div className="pf-nav-dot" />}
                     </button>
                  ))}

                  <div className="pf-sidebar-divider" />

                  <button
                     className="pf-nav-item"
                     style={{ color: "rgba(248,113,113,0.7)" }}
                     onClick={() => dispatch(logoutUser())}
                  >
                     <LogOut size={15} color="#f87171" /> Logout
                  </button>
               </aside>

               {/* ── MAIN PANEL ── */}
               <main className="pf-panel" key={tab}>

                  {/* ════════════ PROFILE TAB ════════════ */}
                  {tab === "profile" && (
                     <>
                        <div className="pf-section-head">
                           <div className="pf-section-badge" style={{ background: "rgba(0,198,255,0.08)", border: "1px solid rgba(0,198,255,0.18)", color: "#00c6ff" }}>
                              <User size={10} /> Account
                           </div>
                           <h1 className="pf-section-title">My <span>Profile</span></h1>
                           <p className="pf-section-sub">Manage your personal information and account settings.</p>
                        </div>

                        {/* Verification banner */}
                        {!user.isVerified && !verifySent && (
                           <div className="pf-verify-banner">
                              <div className="pf-verify-icon"><AlertTriangle size={17} color="#f59e0b" /></div>
                              <div className="pf-verify-text">
                                 <div className="pf-verify-title">Email not verified</div>
                                 <div className="pf-verify-sub">Verify your email to unlock all features and secure your account.</div>
                              </div>
                              <button
                                 className="pf-verify-btn"
                                 onClick={handleResendVerification}
                                 disabled={verifyLoading}
                              >
                                 {verifyLoading ? <><div className="pf-spin" style={{ borderColor: "rgba(245,158,11,0.2)", borderTopColor: "#f59e0b" }} /> Sending…</> : <><Bell size={11} /> Resend Email</>}
                              </button>
                           </div>
                        )}
                        {verifySent && (
                           <div className="pf-verify-success">
                              <CheckCircle size={15} /> Verification email sent! Check your inbox.
                           </div>
                        )}

                        {/* Account Info card */}
                        <div className="pf-card">
                           <div className="pf-card-title">
                              Account Information
                              <div className="pf-card-title-line" />
                              {!editing && (
                                 <button className="pf-edit-trigger" onClick={() => { setEditing(true); setEditName(user.name); setEditEmail(user.email); }}>
                                    <Edit3 size={13} /> Edit
                                 </button>
                              )}
                           </div>

                           {!editing ? (
                              <>
                                 <InfoRow icon={<User size={15} />} label="Full Name" value={user.name} />
                                 <InfoRow icon={<Mail size={15} />} label="Email" value={user.email} />
                                 <InfoRow icon={<Shield size={15} />} label="User ID" value={user._id} mono />
                                 <InfoRow icon={<Star size={15} />} label="Role" value={user.role} />
                                 <InfoRow
                                    icon={<CheckCircle size={15} />}
                                    label="Verification"
                                    value={user.isVerified ? "Verified ✓" : "Not Verified"}
                                 />
                              </>
                           ) : (
                              <>
                                 <div className="pf-edit-grid">
                                    <div className="pf-field">
                                       <label className="pf-label">Full Name</label>
                                       <input
                                          className="pf-input"
                                          value={editName}
                                          onChange={(e) => setEditName(e.target.value)}
                                          placeholder="Your name"
                                       />
                                    </div>
                                    <div className="pf-field">
                                       <label className="pf-label">Email Address</label>
                                       <input
                                          className="pf-input"
                                          type="email"
                                          value={editEmail}
                                          onChange={(e) => setEditEmail(e.target.value)}
                                          placeholder="your@email.com"
                                       />
                                    </div>
                                 </div>
                                 <div className="pf-field" style={{ marginTop: 14 }}>
                                    <label className="pf-label">User ID (read-only)</label>
                                    <input className="pf-input" value={user._id} readOnly style={{ opacity: 0.4, cursor: "not-allowed" }} />
                                 </div>
                                 <div className="pf-edit-actions">
                                    <button className="pf-btn-save" onClick={handleSaveProfile} disabled={editSaving}>
                                       {editSaving ? <><div className="pf-spin" /> Saving…</> : <><Save size={13} /> Save Changes</>}
                                    </button>
                                    <button className="pf-btn-cancel" onClick={() => setEditing(false)}>
                                       <X size={13} /> Cancel
                                    </button>
                                 </div>
                              </>
                           )}
                        </div>

                        {/* Security card */}
                        <div className="pf-card">
                           <div className="pf-card-title">Security <div className="pf-card-title-line" /></div>
                           <InfoRow icon={<Lock size={15} />} label="Password" value="••••••••••••" />
                           <div style={{ marginTop: 16 }}>
                              <button className="pf-edit-trigger" style={{ marginLeft: 0 }}>
                                 <Lock size={12} /> Change Password
                              </button>
                           </div>
                        </div>

                        {/* Become Seller CTA — only for CUSTOMER role */}
                        {user.role === "CUSTOMER" && (
                           <div className="pf-seller-cta">
                              <div className="pf-seller-cta-inner">
                                 <div className="pf-seller-cta-icon">🏪</div>
                                 <div className="pf-seller-cta-body">
                                    <div className="pf-seller-cta-title">Start Selling on QuantumCart</div>
                                    <div className="pf-seller-cta-sub">
                                       Join 80,000+ sellers. List products, reach 2M+ buyers, and grow your business.
                                    </div>
                                 </div>
                                 <button className="pf-seller-cta-btn" onClick={() => setTab("seller-register")}>
                                    <Store size={14} /> Become a Seller <ArrowRight size={13} />
                                 </button>
                              </div>
                           </div>
                        )}
                     </>
                  )}

                  {/* ════════════ SELLER REGISTER TAB ════════════ */}
                  {tab === "seller-register" && (
                     <>
                        <div className="pf-section-head">
                           <div className="pf-section-badge" style={{ background: "rgba(0,198,255,0.08)", border: "1px solid rgba(0,198,255,0.18)", color: "#00c6ff" }}>
                              <Store size={10} /> Seller Program
                           </div>
                           <h1 className="pf-section-title">Become a <span>Seller</span></h1>
                           <p className="pf-section-sub">Set up your store in under 60 seconds and start selling today.</p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
                           <div>
                              {/* Register form */}
                              <div className="pf-card">
                                 <div className="pf-card-title">Store Details <div className="pf-card-title-line" /></div>

                                 {regSuccess && (
                                    <div className="pf-reg-success">
                                       <CheckCircle size={15} /> Store created! Taking you to your dashboard…
                                    </div>
                                 )}

                                 <div className="pf-reg-field">
                                    <label className="pf-reg-label">
                                       Store Name
                                       <span className="pf-reg-char">{storeName.length}/60</span>
                                    </label>
                                    <input
                                       className={`pf-reg-input ${storeNameErr ? "error" : ""}`}
                                       placeholder="e.g. Sumant Tech Hub"
                                       value={storeName}
                                       maxLength={60}
                                       onChange={(e) => { setStoreName(e.target.value); setStoreNameErr(""); }}
                                    />
                                    {storeNameErr && <p className="pf-reg-err">⚠ {storeNameErr}</p>}
                                 </div>

                                 <div className="pf-reg-field">
                                    <label className="pf-reg-label">
                                       Store Description
                                       <span className={`pf-reg-char ${storeDesc.length > 180 ? "warn" : ""}`}>
                                          {storeDesc.length}/200
                                       </span>
                                    </label>
                                    <textarea
                                       className="pf-reg-input"
                                       placeholder="Tell shoppers what your store is about…"
                                       rows={4}
                                       value={storeDesc}
                                       maxLength={200}
                                       onChange={(e) => setStoreDesc(e.target.value)}
                                    />
                                 </div>

                                 <button className="pf-reg-btn" onClick={handleSellerRegister} disabled={regLoading || regSuccess}>
                                    {regLoading
                                       ? <><div className="pf-spin" /> Creating your store…</>
                                       : <><Store size={15} /> Launch My Store <ArrowRight size={14} /></>}
                                 </button>
                              </div>

                              {/* Platform stats */}
                              <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                                 {[
                                    { val: "2M+", label: "Monthly Buyers", color: "#00c6ff", bg: "rgba(0,198,255,0.09)" },
                                    { val: "₹0", label: "Setup Cost", color: "#22c55e", bg: "rgba(34,197,94,0.09)" },
                                    { val: "80K+", label: "Active Sellers", color: "#a855f7", bg: "rgba(168,85,247,0.09)" },
                                    { val: "4.8★", label: "Avg Seller Score", color: "#f59e0b", bg: "rgba(245,158,11,0.09)" },
                                 ].map((s) => (
                                    <div key={s.label} style={{
                                       flex: 1, minWidth: 100,
                                       padding: "14px 16px", borderRadius: 14,
                                       border: `1px solid ${s.color}20`, background: s.bg,
                                       display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                                    }}>
                                       <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</span>
                                       <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>{s.label}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           {/* Perks */}
                           <div className="pf-card" style={{ marginBottom: 0 }}>
                              <div className="pf-card-title" style={{ fontSize: 14 }}>Why sell here? <div className="pf-card-title-line" /></div>
                              <div className="pf-perks">
                                 {[
                                    { ico: "⚡", bg: "rgba(0,198,255,0.1)", color: "#00c6ff", title: "Massive Reach", desc: "2M+ active shoppers every month across India." },
                                    { ico: "📊", bg: "rgba(168,85,247,0.1)", color: "#a855f7", title: "Smart Analytics", desc: "Real-time sales data and AI-powered insights." },
                                    { ico: "💸", bg: "rgba(34,197,94,0.1)", color: "#22c55e", title: "Fast Payouts", desc: "Weekly settlements to your bank. Low fees." },
                                    { ico: "🛡", bg: "rgba(245,158,11,0.1)", color: "#f59e0b", title: "Seller Shield", desc: "Fraud prevention and 24/7 dedicated support." },
                                 ].map((p) => (
                                    <div className="pf-perk" key={p.title}>
                                       <div className="pf-perk-ico" style={{ background: p.bg, color: p.color }}>{p.ico}</div>
                                       <div>
                                          <div className="pf-perk-title">{p.title}</div>
                                          <div className="pf-perk-desc">{p.desc}</div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </>
                  )}

                  {/* ════════════ SELLER DASHBOARD TAB ════════════ */}
                  {tab === "seller-dashboard" && seller && (
                     <>
                        <div className="pf-section-head">
                           <div className="pf-section-badge" style={{ background: "rgba(0,198,255,0.08)", border: "1px solid rgba(0,198,255,0.18)", color: "#00c6ff" }}>
                              <Store size={10} /> Seller Hub
                           </div>
                           <div className="pf-store-header">
                              <div className="pf-store-avatar">🏪</div>
                              <div>
                                 <h1 className="pf-section-title" style={{ fontSize: "clamp(20px,3vw,28px)", marginBottom: 4 }}>
                                    {seller.storeName}
                                 </h1>
                                 <p className="pf-store-desc">{seller.storeDescription}</p>
                              </div>
                           </div>
                        </div>

                        {/* Seller stats */}
                        <div className="pf-dash-stats">
                           <StatCard icon={<Package size={17} />} label="Products" value={seller.products} color="#00c6ff" bg="rgba(0,198,255,0.1)" />
                           <StatCard icon={<DollarSign size={17} />} label="Total Sales" value={`₹${(seller.totalSales * 1200).toLocaleString()}`} color="#a855f7" bg="rgba(168,85,247,0.1)" />
                           <StatCard icon={<Star size={17} />} label="Store Rating" value={`${seller.rating}★`} color="#f59e0b" bg="rgba(245,158,11,0.1)" />
                           <StatCard icon={<TrendingUp size={17} />} label="Orders" value={seller.totalSales} color="#22c55e" bg="rgba(34,197,94,0.1)" />
                        </div>

                        {/* Quick actions */}
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: 28, marginBottom: 12 }}>
                           Quick Actions
                        </p>
                        <div className="pf-qactions">
                           {[
                              { ico: "➕", label: "Add Product", sub: "List a new item", bg: "rgba(0,198,255,0.09)", color: "#00c6ff" },
                              { ico: "📊", label: "Analytics", sub: "View sales & traffic", bg: "rgba(168,85,247,0.09)", color: "#a855f7" },
                              { ico: "📦", label: "Manage Orders", sub: "Fulfill & track orders", bg: "rgba(245,158,11,0.09)", color: "#f59e0b" },
                              { ico: "⚙️", label: "Store Settings", sub: "Edit profile & policies", bg: "rgba(34,197,94,0.09)", color: "#22c55e" },
                           ].map((a) => (
                              <button className="pf-qaction" key={a.label} onClick={() => alert(`Navigate to: ${a.label}`)}>
                                 <div className="pf-qaction-ico" style={{ background: a.bg, color: a.color }}>{a.ico}</div>
                                 <div>
                                    <div className="pf-qaction-label">{a.label}</div>
                                    <div className="pf-qaction-sub">{a.sub}</div>
                                 </div>
                                 <ChevronRight size={13} style={{ marginLeft: "auto", color: "rgba(255,255,255,0.18)" }} />
                              </button>
                           ))}
                        </div>

                        {/* Danger zone */}
                        <div className="pf-danger">
                           <div className="pf-danger-head">
                              <AlertTriangle size={14} color="#f87171" />
                              <span className="pf-danger-head-title">Danger Zone</span>
                           </div>
                           <div className="pf-danger-body">
                              <div className="pf-danger-row">
                                 <div className="pf-danger-info">
                                    <h4>Remove Seller Account</h4>
                                    <p>
                                       Permanently deletes your store, listings, and analytics. Your account reverts to Customer.
                                       Pending payouts are still processed. This cannot be undone.
                                    </p>
                                 </div>
                                 <button className="pf-danger-btn" onClick={() => setShowRemove(true)}>
                                    <Trash2 size={13} /> Remove Seller
                                 </button>
                              </div>
                           </div>
                        </div>
                     </>
                  )}

                  {/* ════════════ ORDERS / SETTINGS PLACEHOLDER ════════════ */}
                  {(tab === "orders" || tab === "settings") && (
                     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, flexDirection: "column", gap: 16 }}>
                        <div style={{ fontSize: 52 }}>{tab === "orders" ? "📦" : "⚙️"}</div>
                        <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff" }}>
                           {tab === "orders" ? "My Orders" : "Settings"}
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Coming soon — wire to your API endpoint.</p>
                     </div>
                  )}

               </main>
            </div>

            {/* ── Remove Seller Modal ── */}
            {showRemove && (
               <RemoveModal
                  onClose={() => !removeLoading && setShowRemove(false)}
                  onConfirm={handleRemoveSeller}
                  loading={removeLoading}
               />
            )}
         </div>
      </>
   );
}