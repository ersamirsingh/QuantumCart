import React, { useState } from "react";
import {
   Zap, Store, ArrowRight, CheckCircle, AlertTriangle,
   TrendingUp, Package, Star, Shield, X, ChevronRight,
   Trash2, BarChart2, DollarSign, Users
} from "lucide-react";

/* ─── Mock: swap these with real Redux dispatch / API calls ─── */
const mockRegister = (data) =>
   new Promise((res, rej) =>
      setTimeout(() => (data.storeName ? res({ id: "s_1", ...data }) : rej(new Error("Store name required"))), 1400)
   );
   
const mockRemove = () =>
   new Promise((res) => setTimeout(res, 1400));

/* ─── Tiny atoms ─── */
function Perk({ icon, title, desc }) {
   return (
      <div className="sp-perk">
         <div className="sp-perk-ico">{icon}</div>
         <div>
            <div className="sp-perk-title">{title}</div>
            <div className="sp-perk-desc">{desc}</div>
         </div>
      </div>
   );
}

function StatBadge({ value, label, color }) {
   return (
      <div className="sp-stat" style={{ borderColor: color + "22" }}>
         <span className="sp-stat-val" style={{ color }}>{value}</span>
         <span className="sp-stat-label">{label}</span>
      </div>
   );
}

/* ─── Remove Confirm Modal ─── */
function RemoveModal({ onClose, onConfirm, loading }) {
   const [typed, setTyped] = useState("");
   const confirmed = typed === "REMOVE";

   return (
      <div className="sp-modal-bg" onClick={onClose}>
         <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-icon">
               <AlertTriangle size={26} color="#f87171" />
            </div>
            <h3 className="sp-modal-title">Remove Seller Account?</h3>
            <p className="sp-modal-sub">
               This will permanently delete your store, listings, and analytics.
               Your account will be downgraded to <strong>Customer</strong>. This cannot be undone.
            </p>

            <div className="sp-modal-consequences">
               {[
                  "All active product listings will be removed",
                  "Store page will be immediately taken offline",
                  "Pending earnings will still be processed",
                  "Your buyer history and reviews are retained",
               ].map((t) => (
                  <div className="sp-modal-con" key={t}>
                     <span style={{ color: "#f87171", fontSize: 12 }}>✕</span> {t}
                  </div>
               ))}
            </div>

            <label className="sp-modal-label">
               Type <strong style={{ color: "#f87171" }}>REMOVE</strong> to confirm
            </label>
            <input
               className={`sp-modal-input ${confirmed ? "ok" : ""}`}
               value={typed}
               onChange={(e) => setTyped(e.target.value.toUpperCase())}
               placeholder="Type REMOVE here"
               autoFocus
            />

            <div className="sp-modal-actions">
               <button className="sp-modal-cancel" onClick={onClose}>Cancel</button>
               <button
                  className="sp-modal-confirm"
                  disabled={!confirmed || loading}
                  onClick={onConfirm}
               >
                  {loading ? (
                     <><div className="sp-spinner" style={{ borderTopColor: "#fff" }} />Removing...</>
                  ) : (
                     <><Trash2 size={14} /> Remove Seller Account</>
                  )}
               </button>
            </div>
         </div>
      </div>
   );
}

/* ─── Main Page ─── */
export default function SellerPage() {
   /* In a real app: const { user } = useSelector(s => s.auth) */
   const [isSeller, setIsSeller] = useState(false);  // flip to true to preview seller dashboard view

   /* Register form */
   const [storeName, setStoreName] = useState("");
   const [storeDescription, setStoreDescription] = useState("");
   const [nameErr, setNameErr] = useState("");
   const [descErr, setDescErr] = useState("");
   const [regLoading, setRegLoading] = useState(false);
   const [regSuccess, setRegSuccess] = useState(false);
   const [regError, setRegError] = useState("");

   /* Remove */
   const [showModal, setShowModal] = useState(false);
   const [removeLoading, setRemoveLoading] = useState(false);
   const [removeSuccess, setRemoveSuccess] = useState(false);

   const validate = () => {
      let ok = true;
      if (!storeName.trim()) { setNameErr("Store name is required"); ok = false; }
      else if (storeName.length < 3) { setNameErr("Must be at least 3 characters"); ok = false; }
      else setNameErr("");

      if (storeDescription.length > 200) { setDescErr("Max 200 characters"); ok = false; }
      else setDescErr("");
      return ok;
   };

   const handleRegister = async () => {
      if (!validate()) return;
      setRegLoading(true); 
      setRegError("");

      try {
         await mockRegister({ storeName, storeDescription });
         setRegSuccess(true);
         setTimeout(() => setIsSeller(true), 1800);
      } catch (e) {
         setRegError(e.message || "Something went wrong");
      } finally {
         setRegLoading(false);
      }
   };

   const handleRemove = async () => {
      setRemoveLoading(true);
      try {
         await mockRemove();
         setShowModal(false);
         setRemoveSuccess(true);
         setTimeout(() => setIsSeller(false), 1800);
      } finally {
         setRemoveLoading(false);
      }
   };

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sp-root {
          min-height: 100vh;
          background: #020408;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          position: relative; overflow: hidden;
        }

        /* ── Background ── */
        .sp-grid {
          position: fixed; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(0,198,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,198,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .sp-orb-a {
          position: fixed; width: 600px; height: 600px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(0,198,255,0.09) 0%, transparent 65%);
          top: -220px; left: -180px;
        }
        .sp-orb-b {
          position: fixed; width: 500px; height: 500px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 65%);
          bottom: -160px; right: -140px;
        }

        /* ── Nav ── */
        .sp-nav {
          position: sticky; top: 0; z-index: 50;
          display: flex; align-items: center; gap: 10px;
          padding: 0 28px; height: 60px;
          background: rgba(2,4,8,0.88); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sp-nav-logo {
          display: flex; align-items: center; gap: 9px; text-decoration: none;
        }
        .sp-nav-logo-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          display: flex; align-items: center; justify-content: center;
        }
        .sp-nav-logo-text {
          font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800;
          background: linear-gradient(135deg, #fff 40%, #00c6ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .sp-nav-sep { color: rgba(255,255,255,0.15); font-size: 18px; margin: 0 4px; }
        .sp-nav-page {
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.45);
        }
        .sp-nav-spacer { flex: 1; }
        .sp-nav-role {
          display: flex; align-items: center; gap: 7px;
          padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
        }
        .sp-nav-role.customer {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
        }
        .sp-nav-role.seller {
          background: rgba(0,198,255,0.1); border: 1px solid rgba(0,198,255,0.25);
          color: #00c6ff;
        }
        .sp-nav-role-dot {
          width: 6px; height: 6px; border-radius: 50%;
        }

        /* ── Page wrapper ── */
        .sp-page {
          position: relative; z-index: 1;
          max-width: 1100px; margin: 0 auto;
          padding: 60px 24px 100px;
          animation: sp-fadein 0.5s ease forwards;
        }
        @keyframes sp-fadein {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Breadcrumb ── */
        .sp-crumb {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: rgba(255,255,255,0.3);
          margin-bottom: 40px; font-weight: 500;
        }
        .sp-crumb a { color: rgba(255,255,255,0.3); text-decoration: none; }
        .sp-crumb a:hover { color: rgba(255,255,255,0.6); }

        /* ── Section badge ── */
        .sp-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 14px; border-radius: 20px;
          font-size: 11px; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; margin-bottom: 16px;
        }
        .sp-badge.cyan {
          background: rgba(0,198,255,0.1); border: 1px solid rgba(0,198,255,0.2);
          color: #00c6ff;
        }
        .sp-badge.red {
          background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2);
          color: #f87171;
        }

        /* ── Hero headline ── */
        .sp-headline {
          font-family: 'Syne', sans-serif;
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 800; line-height: 1.08; letter-spacing: -1.5px;
          color: #fff; margin-bottom: 14px;
        }
        .sp-headline span {
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .sp-headline-sub {
          font-size: 16px; line-height: 1.7;
          color: rgba(255,255,255,0.42); max-width: 520px;
          margin-bottom: 0;
        }

        /* ── Stats row ── */
        .sp-stats {
          display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px;
        }
        .sp-stat {
          padding: 12px 18px; border-radius: 14px;
          border: 1px solid; /* color set inline */
          background: rgba(255,255,255,0.025);
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          min-width: 90px;
        }
        .sp-stat-val {
          font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800;
        }
        .sp-stat-label { font-size: 11px; color: rgba(255,255,255,0.35); font-weight: 600; }

        /* ── Two-col layout ── */
        .sp-cols {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px; margin-top: 52px; align-items: start;
        }
        @media(max-width: 820px){
          .sp-cols { grid-template-columns: 1fr; }
        }

        /* ── Form card ── */
        .sp-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; padding: 36px;
          backdrop-filter: blur(16px);
        }
        .sp-card-title {
          font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800;
          color: #fff; margin-bottom: 6px; letter-spacing: -0.4px;
        }
        .sp-card-sub {
          font-size: 13px; color: rgba(255,255,255,0.38); margin-bottom: 28px;
          line-height: 1.6;
        }

        /* form fields */
        .sp-field { margin-bottom: 20px; }
        .sp-label {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 11px; font-weight: 700; letter-spacing: 0.8px;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
          margin-bottom: 8px;
        }
        .sp-char { font-size: 11px; color: rgba(255,255,255,0.25); font-weight: 500; letter-spacing: 0; text-transform: none; }
        .sp-char.warn { color: #f87171; }
        .sp-input {
          width: 100%; padding: 13px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 13px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          resize: none;
        }
        .sp-input::placeholder { color: rgba(255,255,255,0.2); }
        .sp-input:focus {
          border-color: rgba(0,198,255,0.45);
          background: rgba(0,198,255,0.04);
          box-shadow: 0 0 0 3px rgba(0,198,255,0.07);
        }
        .sp-input.error {
          border-color: rgba(248,113,113,0.5);
          box-shadow: 0 0 0 3px rgba(248,113,113,0.07);
        }
        .sp-field-err {
          color: #f87171; font-size: 11px; font-weight: 500;
          margin-top: 5px; display: flex; align-items: center; gap: 4px;
        }

        /* server error */
        .sp-server-err {
          background: rgba(248,113,113,0.07);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 12px; padding: 12px 16px;
          color: #f87171; font-size: 13px; text-align: center;
          margin-bottom: 18px;
        }

        /* success banner */
        .sp-success {
          background: rgba(34,197,94,0.07);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 12px; padding: 14px 18px;
          color: #22c55e; font-size: 13px; font-weight: 600;
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 20px;
        }

        /* submit button */
        .sp-btn {
          width: 100%; padding: 14px;
          border-radius: 13px; border: none; cursor: pointer;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
          color: #020408;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          position: relative; overflow: hidden;
        }
        .sp-btn::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(255,255,255,0.12); opacity: 0; transition: opacity 0.2s;
        }
        .sp-btn:hover::before { opacity: 1; }
        .sp-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(0,198,255,0.28); }
        .sp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .sp-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(2,4,8,0.25); border-top-color: #020408;
          animation: sp-spin 0.7s linear infinite;
        }
        @keyframes sp-spin { to { transform: rotate(360deg); } }

        /* ── Perks sidebar ── */
        .sp-perks-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px; padding: 32px;
        }
        .sp-perks-title {
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800;
          color: #fff; margin-bottom: 20px; letter-spacing: -0.3px;
        }
        .sp-perk {
          display: flex; align-items: flex-start; gap: 13px;
          padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sp-perk:last-child { border-bottom: none; }
        .sp-perk-ico {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
        }
        .sp-perk-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 3px; }
        .sp-perk-desc  { font-size: 12px; color: rgba(255,255,255,0.38); line-height: 1.5; }

        /* Trust note */
        .sp-trust {
          margin-top: 20px; padding: 14px;
          background: rgba(0,198,255,0.05);
          border: 1px solid rgba(0,198,255,0.12);
          border-radius: 14px;
          font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.6; text-align: center;
        }
        .sp-trust strong { color: rgba(0,198,255,0.8); }

        /* ═══════════ SELLER DASHBOARD VIEW ═══════════ */
        .sp-seller-hero {
          display: flex; align-items: center; gap: 18px; margin-bottom: 10px;
        }
        .sp-seller-avatar {
          width: 58px; height: 58px; border-radius: 16px; flex-shrink: 0;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
        }
        .sp-seller-role-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(0,198,255,0.1); border: 1px solid rgba(0,198,255,0.25);
          border-radius: 20px; padding: 4px 12px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
          color: #00c6ff; margin-bottom: 8px;
        }

        /* Seller stats grid */
        .sp-seller-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 14px; margin-top: 36px;
        }
        .sp-sstat {
          padding: 22px 20px; border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          transition: transform 0.2s, border-color 0.2s;
        }
        .sp-sstat:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.12); }
        .sp-sstat-icon {
          width: 38px; height: 38px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }
        .sp-sstat-val {
          font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800;
          color: #fff; line-height: 1; margin-bottom: 4px;
        }
        .sp-sstat-label { font-size: 12px; color: rgba(255,255,255,0.38); font-weight: 500; }

        /* Quick actions */
        .sp-actions {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px; margin-top: 28px;
        }
        .sp-action {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 18px; border-radius: 15px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          cursor: pointer; text-align: left;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .sp-action:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.13);
          transform: translateY(-2px);
        }
        .sp-action-ico {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .sp-action-label { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px; }
        .sp-action-sub   { font-size: 11px; color: rgba(255,255,255,0.35); }

        /* Danger zone */
        .sp-danger-zone {
          margin-top: 52px;
          border: 1px solid rgba(248,113,113,0.15);
          border-radius: 22px; overflow: hidden;
        }
        .sp-danger-header {
          padding: 20px 28px;
          background: rgba(248,113,113,0.05);
          border-bottom: 1px solid rgba(248,113,113,0.12);
          display: flex; align-items: center; gap: 10px;
        }
        .sp-danger-title {
          font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800;
          color: #f87171;
        }
        .sp-danger-body { padding: 24px 28px; }
        .sp-danger-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
        }
        .sp-danger-info { max-width: 500px; }
        .sp-danger-info h4 { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .sp-danger-info p { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.6; }
        .sp-danger-btn {
          padding: 12px 22px; border-radius: 12px; border: 1px solid rgba(248,113,113,0.35);
          background: rgba(248,113,113,0.07); cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
          color: #f87171; white-space: nowrap;
          display: flex; align-items: center; gap: 8px;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .sp-danger-btn:hover {
          background: rgba(248,113,113,0.14);
          border-color: rgba(248,113,113,0.5);
          transform: translateY(-1px);
        }

        /* ═══════════ MODAL ═══════════ */
        .sp-modal-bg {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(2,4,8,0.85); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
          animation: sp-fadein 0.2s ease;
        }
        .sp-modal {
          width: 100%; max-width: 460px;
          background: #0b0f1a;
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 24px; padding: 36px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.6);
          animation: sp-modal-in 0.25s cubic-bezier(0.34,1.3,0.64,1) forwards;
        }
        @keyframes sp-modal-in {
          from { opacity: 0; transform: scale(0.9) translateY(12px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
        .sp-modal-icon {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.25);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
        }
        .sp-modal-title {
          font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800;
          color: #fff; margin-bottom: 10px; letter-spacing: -0.5px;
        }
        .sp-modal-sub {
          font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.65;
          margin-bottom: 22px;
        }
        .sp-modal-sub strong { color: rgba(255,255,255,0.7); }
        .sp-modal-consequences {
          background: rgba(248,113,113,0.05);
          border: 1px solid rgba(248,113,113,0.12);
          border-radius: 12px; padding: 14px 16px;
          display: flex; flex-direction: column; gap: 8px;
          margin-bottom: 22px;
        }
        .sp-modal-con {
          font-size: 12px; color: rgba(255,255,255,0.5);
          display: flex; align-items: center; gap: 8px;
        }
        .sp-modal-label {
          display: block; font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.45); letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .sp-modal-input {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(248,113,113,0.25);
          border-radius: 12px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          letter-spacing: 2px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 22px;
        }
        .sp-modal-input::placeholder { letter-spacing: 0; font-weight: 400; color: rgba(255,255,255,0.2); }
        .sp-modal-input:focus  { border-color: rgba(248,113,113,0.5); box-shadow: 0 0 0 3px rgba(248,113,113,0.08); }
        .sp-modal-input.ok     { border-color: rgba(34,197,94,0.5);   box-shadow: 0 0 0 3px rgba(34,197,94,0.08); }
        .sp-modal-actions { display: flex; gap: 10px; }
        .sp-modal-cancel {
          flex: 1; padding: 13px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.6); transition: background 0.2s, color 0.2s;
        }
        .sp-modal-cancel:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .sp-modal-confirm {
          flex: 1.6; padding: 13px; border-radius: 12px; border: none; cursor: pointer;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
          background: linear-gradient(135deg, #dc2626, #f87171);
          color: #fff; display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: opacity 0.2s, transform 0.2s;
        }
        .sp-modal-confirm:hover:not(:disabled) { transform: translateY(-1px); }
        .sp-modal-confirm:disabled { opacity: 0.45; cursor: not-allowed; }
      `}</style>

         <div className="sp-root">
            <div className="sp-grid" />
            <div className="sp-orb-a" />
            <div className="sp-orb-b" />

            {/* ── Nav ── */}
            <nav className="sp-nav">
               <a href="/" className="sp-nav-logo">
                  <div className="sp-nav-logo-icon">
                     <Zap size={16} color="#020408" strokeWidth={2.5} />
                  </div>
                  <span className="sp-nav-logo-text">QuantumCart</span>
               </a>
               <span className="sp-nav-sep">/</span>
               <span className="sp-nav-page">Seller Hub</span>
               <div className="sp-nav-spacer" />
               <div className={`sp-nav-role ${isSeller ? "seller" : "customer"}`}>
                  <div className="sp-nav-role-dot" style={{ background: isSeller ? "#00c6ff" : "rgba(255,255,255,0.3)" }} />
                  {isSeller ? "Seller Account" : "Customer Account"}
               </div>
            </nav>

            {/* ══════════════ BECOME SELLER VIEW ══════════════ */}
            {!isSeller && (
               <div className="sp-page">
                  {/* Breadcrumb */}
                  <div className="sp-crumb">
                     <a href="/">Home</a>
                     <ChevronRight size={13} />
                     <span style={{ color: "rgba(255,255,255,0.6)" }}>Become a Seller</span>
                  </div>

                  {/* Headline */}
                  <div className="sp-badge cyan"><Store size={11} /> Seller Program</div>
                  <h1 className="sp-headline">Turn your passion<br />into a <span>thriving store.</span></h1>
                  <p className="sp-headline-sub">
                     Join 80,000+ sellers on QuantumCart. List your products, reach millions of shoppers,
                     and grow your business with powerful tools — all in one place.
                  </p>

                  {/* Platform stats */}
                  <div className="sp-stats">
                     <StatBadge value="2M+" label="Monthly Buyers" color="#00c6ff" />
                     <StatBadge value="80K+" label="Active Sellers" color="#a855f7" />
                     <StatBadge value="₹0" label="Setup Cost" color="#22c55e" />
                     <StatBadge value="4.8★" label="Seller Rating" color="#f59e0b" />
                  </div>

                  {/* Two-col */}
                  <div className="sp-cols">
                     {/* ── Registration form ── */}
                     <div className="sp-card">
                        <h2 className="sp-card-title">Register your store</h2>
                        <p className="sp-card-sub">
                           Fill in your store details. You can update them any time from your seller dashboard.
                        </p>

                        {regSuccess && (
                           <div className="sp-success">
                              <CheckCircle size={16} />
                              Store created! Redirecting to your dashboard…
                           </div>
                        )}
                        {regError && <div className="sp-server-err">⚠ {regError}</div>}

                        {/* Store Name */}
                        <div className="sp-field">
                           <label className="sp-label">
                              Store Name
                              <span className="sp-char">{storeName.length}/60</span>
                           </label>
                           <input
                              className={`sp-input ${nameErr ? "error" : ""}`}
                              placeholder="e.g. Quantum Gadget Hub"
                              value={storeName}
                              maxLength={60}
                              onChange={(e) => { setStoreName(e.target.value); if (nameErr) setNameErr(""); }}
                           />
                           {nameErr && <p className="sp-field-err">⚠ {nameErr}</p>}
                        </div>

                        {/* Store Description */}
                        <div className="sp-field">
                           <label className="sp-label">
                              Store Description
                              <span className={`sp-char ${storeDescription.length > 180 ? "warn" : ""}`}>
                                 {storeDescription.length}/200
                              </span>
                           </label>
                           <textarea
                              className={`sp-input ${descErr ? "error" : ""}`}
                              placeholder="Tell shoppers what your store is about…"
                              rows={4}
                              value={storeDescription}
                              maxLength={200}
                              onChange={(e) => { setStoreDescription(e.target.value); if (descErr) setDescErr(""); }}
                           />
                           {descErr && <p className="sp-field-err">⚠ {descErr}</p>}
                        </div>

                        <button
                           className="sp-btn"
                           onClick={handleRegister}
                           disabled={regLoading || regSuccess}
                        >
                           {regLoading ? (
                              <><div className="sp-spinner" /> Creating your store…</>
                           ) : (
                              <>Launch My Store <ArrowRight size={15} /></>
                           )}
                        </button>
                     </div>

                     {/* ── Perks sidebar ── */}
                     <div>
                        <div className="sp-perks-card">
                           <p className="sp-perks-title">Why sell on QuantumCart?</p>
                           <Perk
                              icon={<span style={{ background: "rgba(0,198,255,0.12)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#00c6ff" }}><TrendingUp size={17} /></span>}
                              title="Massive Reach"
                              desc="Get in front of 2M+ active shoppers every month across India."
                           />
                           <Perk
                              icon={<span style={{ background: "rgba(168,85,247,0.12)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#a855f7" }}><BarChart2 size={17} /></span>}
                              title="Smart Analytics"
                              desc="Real-time sales data, conversion tracking, and AI-powered insights."
                           />
                           <Perk
                              icon={<span style={{ background: "rgba(245,158,11,0.12)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}><DollarSign size={17} /></span>}
                              title="Fast Payouts"
                              desc="Weekly settlements directly to your bank. Lowest fees in the industry."
                           />
                           <Perk
                              icon={<span style={{ background: "rgba(34,197,94,0.12)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e" }}><Shield size={17} /></span>}
                              title="Seller Protection"
                              desc="Fraud prevention, dispute resolution, and 24/7 dedicated support."
                           />
                        </div>
                        <div className="sp-trust">
                           <strong>🔒 Verified & Secure</strong><br />
                           Your KYC details are encrypted and never shared with third parties.
                           Managed under India's Digital Personal Data Protection Act, 2023.
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* ══════════════ SELLER DASHBOARD VIEW ══════════════ */}
            {isSeller && (
               <div className="sp-page">
                  {/* Breadcrumb */}
                  <div className="sp-crumb">
                     <a href="/">Home</a>
                     <ChevronRight size={13} />
                     <span style={{ color: "rgba(255,255,255,0.6)" }}>Seller Dashboard</span>
                  </div>

                  {/* Seller identity */}
                  <div className="sp-seller-hero">
                     <div className="sp-seller-avatar">🏪</div>
                     <div>
                        <div className="sp-seller-role-tag">
                           <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00c6ff", display: "inline-block" }} />
                           Active Seller
                        </div>
                        <h1 className="sp-headline" style={{ fontSize: "clamp(26px, 4vw, 38px)", marginBottom: 6 }}>
                           Welcome back, <span>{storeName || "My Store"}</span>
                        </h1>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
                           {storeDescription || "Your store is live and visible to shoppers."}&nbsp;
                           <a href="#" style={{ color: "#00c6ff", fontWeight: 600, textDecoration: "none" }}>Edit store →</a>
                        </p>
                     </div>
                  </div>

                  {removeSuccess && (
                     <div className="sp-success" style={{ marginTop: 24 }}>
                        <CheckCircle size={16} />
                        Seller account removed. Redirecting…
                     </div>
                  )}

                  {/* Stats cards */}
                  <div className="sp-seller-stats">
                     {[
                        { icon: "📦", label: "Total Products", val: "0", color: "#00c6ff", bg: "rgba(0,198,255,0.1)" },
                        { icon: "💰", label: "Total Sales", val: "₹0", color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
                        { icon: "⭐", label: "Store Rating", val: "—", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                        { icon: "👥", label: "Followers", val: "0", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
                     ].map((s) => (
                        <div className="sp-sstat" key={s.label}>
                           <div className="sp-sstat-icon" style={{ background: s.bg, color: s.color, fontSize: 18 }}>
                              {s.icon}
                           </div>
                           <div className="sp-sstat-val">{s.val}</div>
                           <div className="sp-sstat-label">{s.label}</div>
                        </div>
                     ))}
                  </div>

                  {/* Quick actions */}
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: 36, marginBottom: 14 }}>
                     Quick Actions
                  </p>
                  <div className="sp-actions">
                     {[
                        { icon: "➕", label: "Add Product", sub: "List a new item", bg: "rgba(0,198,255,0.1)", color: "#00c6ff" },
                        { icon: "📊", label: "Analytics", sub: "View sales data", bg: "rgba(168,85,247,0.1)", color: "#a855f7" },
                        { icon: "📦", label: "Manage Orders", sub: "Fulfill & track orders", bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
                        { icon: "⚙️", label: "Store Settings", sub: "Update store profile", bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
                     ].map((a) => (
                        <button className="sp-action" key={a.label} onClick={() => alert(`Navigate to ${a.label}`)}>
                           <div className="sp-action-ico" style={{ background: a.bg, color: a.color, fontSize: 19 }}>{a.icon}</div>
                           <div>
                              <div className="sp-action-label">{a.label}</div>
                              <div className="sp-action-sub">{a.sub}</div>
                           </div>
                           <ChevronRight size={14} style={{ marginLeft: "auto", color: "rgba(255,255,255,0.2)" }} />
                        </button>
                     ))}
                  </div>

                  {/* ── Danger Zone ── */}
                  <div className="sp-danger-zone">
                     <div className="sp-danger-header">
                        <AlertTriangle size={16} color="#f87171" />
                        <span className="sp-danger-title">Danger Zone</span>
                     </div>
                     <div className="sp-danger-body">
                        <div className="sp-danger-row">
                           <div className="sp-danger-info">
                              <h4>Remove Seller Account</h4>
                              <p>
                                 Permanently deletes your store, all product listings, and seller analytics.
                                 Your account will be downgraded to a Customer. Pending payouts are still processed.
                                 This action is irreversible.
                              </p>
                           </div>
                           <button className="sp-danger-btn" onClick={() => setShowModal(true)}>
                              <Trash2 size={14} /> Remove Seller Account
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* ── Confirm Modal ── */}
            {showModal && (
               <RemoveModal
                  onClose={() => !removeLoading && setShowModal(false)}
                  onConfirm={handleRemove}
                  loading={removeLoading}
               />
            )}
         </div>
      </>
   );
}