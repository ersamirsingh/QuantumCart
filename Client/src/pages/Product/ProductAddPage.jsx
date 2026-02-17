import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
   Zap, ArrowLeft, Plus, X, Save, Package,
   DollarSign, Tag, Layers, CheckCircle, AlertTriangle,
} from "lucide-react";
import axiosClient from "../../API/axiosClient";


/* ── Status options ── */
const STATUS_OPTIONS = [
   { value: "ACTIVE", label: "Active", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
   { value: "OUT_OF_STOCK", label: "Out of Stock", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
   { value: "BLOCKED", label: "Blocked", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
];

/* ── Auto-calculate finalPrice ── */
const calcFinal = (price, discount) => {
   const p = parseFloat(price) || 0;
   const d = parseFloat(discount) || 0;
   if (p <= 0) return "0.00";
   return Math.max(0, p - (p * d) / 100).toFixed(2);
};

/* ── Image URL Input ── */
function ImageInput({ images, onChange }) {
   const [url, setUrl] = useState("");

   const add = () => {
      const trimmed = url.trim();
      if (!trimmed || images.includes(trimmed)) return;
      onChange([...images, trimmed]);
      setUrl("");
   };

   const remove = (index) => onChange(images.filter((_, i) => i !== index));

   return (
      <div>
         <div className="ap-img-row">
            <input
               className="ap-input"
               style={{ flex: 1 }}
               placeholder="Paste image URL and press Add"
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            />
            <button type="button" className="ap-img-add-btn" onClick={add}>
               <Plus size={14} /> Add
            </button>
         </div>

         {images.length > 0 && (
            <div className="ap-img-list">
               {images.map((img, i) => (
                  <div className="ap-img-item" key={i}>
                     <img
                        src={img}
                        alt=""
                        className="ap-img-thumb"
                        onError={(e) => { e.target.style.display = "none"; }}
                     />
                     <span className="ap-img-url">{img}</span>
                     <button className="ap-img-remove" onClick={() => remove(i)}>
                        <X size={12} />
                     </button>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}

/* ── Field wrapper ── */
function Field({ label, error, hint, char, children }) {
   return (
      <div className="ap-field">
         <div className="ap-field-top">
            <label className="ap-label">{label}</label>
            {char !== undefined && (
               <span className={`ap-char ${char.warn ? "warn" : ""}`}>{char.current}/{char.max}</span>
            )}
         </div>
         {children}
         {hint && !error && <span className="ap-hint">{hint}</span>}
         {error && <span className="ap-err"><AlertTriangle size={11} /> {error}</span>}
      </div>
   );
}

/* ── Main Page ── */
export default function ProductAddPage() {
   const navigate = useNavigate();

   const [form, setForm] = useState({
      name: "",
      description: "",
      price: "",
      discount: "0",
      stock: "",
      status: "ACTIVE",
      images: [],
   });

   const [errors, setErrors] = useState({});

   const [product, setProduct] = useState(null);
   const [success, setSuccess] = useState(false);
   const [apiError, setApiError] = useState("");
   const [loading, setLoading] = useState(false);

   const set = (key, val) => {
      setForm((f) => ({ ...f, [key]: val }));
      if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
   };

   const finalPrice = calcFinal(form.price, form.discount);

   const validate = () => {
      const e = {};
      if (!form.name.trim()) e.name = "Product name is required";
      if (!form.price || isNaN(form.price) || +form.price <= 0) e.price = "Enter a valid price";
      if (isNaN(form.discount) || +form.discount < 0 || +form.discount > 100) e.discount = "Must be 0 – 100";
      if (!form.stock || isNaN(form.stock) || +form.stock < 0) e.stock = "Enter a valid stock quantity";
      setErrors(e);
      return Object.keys(e).length === 0;
   };

   const handleSubmit = async () => {
      if (!validate()) return;
      setApiError("");
      const payload = {
         name: form.name.trim(),
         description: form.description.trim(),
         price: +form.price,
         discount: +form.discount,
         finalPrice: +finalPrice,
         stock: +form.stock,
         status: form.status,
         images: form.images,
      };
      setLoading(true);
      try {
         const res = await axiosClient.post('/product/add', payload);
         console.log(res.data)
         setProduct(res.data);
         setSuccess(true);
         navigate(`/product/${product._id}`);
      } catch (e) {
         setApiError(e.message);
         alert(e.message);
      } finally {
         setLoading(false);
      }
   };

   const handleReset = () => {
      setForm({ name: "", description: "", price: "", discount: "0", stock: "", status: "ACTIVE", images: [] });
      setProduct(null);
      setErrors({});
      setApiError("");
      setSuccess(false);
   };

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ap-root { min-height: 100vh; background: #020408; font-family: 'DM Sans', sans-serif; color: #fff; overflow-x: hidden; }

        /* BG */
        .ap-bg  { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(0,198,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,198,255,0.03) 1px, transparent 1px); background-size: 60px 60px; }
        .ap-orb1 { position: fixed; width: 520px; height: 520px; border-radius: 50%; pointer-events: none; background: radial-gradient(circle, rgba(0,198,255,0.09) 0%, transparent 68%); top: -210px; left: -170px; }
        .ap-orb2 { position: fixed; width: 420px; height: 420px; border-radius: 50%; pointer-events: none; background: radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 68%); bottom: -130px; right: -110px; }

        /* NAV */
        .ap-nav { position: sticky; top: 0; z-index: 100; height: 60px; padding: 0 28px; display: flex; align-items: center; gap: 10px; background: rgba(2,4,8,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .ap-nav-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .ap-nav-logo-box { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, #00c6ff, #a855f7); display: flex; align-items: center; justify-content: center; }
        .ap-nav-logo-text { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800; background: linear-gradient(135deg, #fff 40%, #00c6ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ap-nav-sep   { color: rgba(255,255,255,0.15); margin: 0 2px; }
        .ap-nav-page  { font-size: 13px; color: rgba(255,255,255,0.38); }
        .ap-spacer    { flex: 1; }

        /* PAGE */
        .ap-page { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; padding: 36px 24px 100px; animation: ap-in 0.35s ease; }
        @keyframes ap-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

        /* BACK */
        .ap-back { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 26px; transition: all 0.18s; }
        .ap-back:hover { background: rgba(255,255,255,0.07); color: #fff; border-color: rgba(255,255,255,0.2); }

        /* HEADER */
        .ap-header { margin-bottom: 28px; }
        .ap-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; background: rgba(0,198,255,0.08); border: 1px solid rgba(0,198,255,0.18); color: #00c6ff; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 10px; }
        .ap-title { font-family: 'Syne', sans-serif; font-size: clamp(22px, 3.5vw, 32px); font-weight: 800; color: #fff; letter-spacing: -0.8px; margin-bottom: 5px; }
        .ap-title span { background: linear-gradient(135deg, #00c6ff, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ap-sub { font-size: 13px; color: rgba(255,255,255,0.38); line-height: 1.6; }
        .ap-sub code { color: rgba(0,198,255,0.7); font-size: 12px; background: rgba(0,198,255,0.07); padding: 1px 7px; border-radius: 5px; }

        /* SUCCESS BANNER */
        .ap-success { display: flex; align-items: center; gap: 10px; padding: 13px 16px; border-radius: 13px; background: rgba(34,197,94,0.07); border: 1px solid rgba(34,197,94,0.2); color: #22c55e; font-size: 13px; font-weight: 600; margin-bottom: 20px; }

        /* API ERROR */
        .ap-api-err { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 13px; background: rgba(248,113,113,0.07); border: 1px solid rgba(248,113,113,0.2); color: #f87171; font-size: 13px; font-weight: 600; margin-bottom: 20px; }

        /* FORM CARD */
        .ap-card { background: rgba(255,255,255,0.028); border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; padding: 30px 32px; backdrop-filter: blur(12px); margin-bottom: 16px; }
        .ap-card-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 10px; margin-bottom: 22px; letter-spacing: -0.2px; }
        .ap-card-title-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }

        /* GRID */
        .ap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .ap-full  { grid-column: 1 / -1; }
        @media(max-width: 580px) { .ap-grid { grid-template-columns: 1fr; } .ap-full { grid-column: 1; } }

        /* FIELD */
        .ap-field { display: flex; flex-direction: column; gap: 7px; }
        .ap-field-top { display: flex; align-items: center; justify-content: space-between; }
        .ap-label { font-size: 10px; font-weight: 700; letter-spacing: 0.9px; text-transform: uppercase; color: rgba(255,255,255,0.4); }
        .ap-char  { font-size: 10px; color: rgba(255,255,255,0.25); font-weight: 500; }
        .ap-char.warn { color: #f87171; }
        .ap-hint  { font-size: 11px; color: rgba(255,255,255,0.25); }
        .ap-err   { font-size: 11px; color: #f87171; font-weight: 600; display: flex; align-items: center; gap: 4px; }

        /* INPUT */
        .ap-input { width: 100%; padding: 12px 14px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; resize: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .ap-input::placeholder { color: rgba(255,255,255,0.2); }
        .ap-input:focus { border-color: rgba(0,198,255,0.45); box-shadow: 0 0 0 3px rgba(0,198,255,0.07); }
        .ap-input.err { border-color: rgba(248,113,113,0.5); box-shadow: 0 0 0 3px rgba(248,113,113,0.06); }

        /* PREFIX INPUT */
        .ap-prefix-wrap { position: relative; }
        .ap-prefix { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.3); pointer-events: none; }
        .ap-with-prefix { padding-left: 30px; }

        /* FINAL PRICE */
        .ap-final-box { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 12px; background: rgba(0,198,255,0.04); border: 1px solid rgba(0,198,255,0.15); }
        .ap-final-val { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #00c6ff; }
        .ap-final-disc { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: rgba(0,198,255,0.12); border: 1px solid rgba(0,198,255,0.2); color: #00c6ff; }

        /* STATUS */
        .ap-status-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .ap-status-btn { display: flex; align-items: center; gap: 7px; padding: 9px 16px; border-radius: 11px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.42); transition: all 0.18s; }
        .ap-status-btn:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.75); }
        .ap-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; transition: background 0.18s; }

        /* IMAGE SECTION */
        .ap-img-row { display: flex; gap: 8px; }
        .ap-img-add-btn { display: inline-flex; align-items: center; gap: 6px; padding: 12px 16px; border-radius: 12px; border: none; background: rgba(0,198,255,0.1); color: #00c6ff; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; white-space: nowrap; transition: background 0.18s; }
        .ap-img-add-btn:hover { background: rgba(0,198,255,0.18); }
        .ap-img-list { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
        .ap-img-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); }
        .ap-img-thumb { width: 36px; height: 36px; border-radius: 7px; object-fit: cover; flex-shrink: 0; background: rgba(255,255,255,0.05); }
        .ap-img-url { flex: 1; font-size: 12px; color: rgba(255,255,255,0.38); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ap-img-remove { width: 24px; height: 24px; border-radius: 6px; border: none; background: rgba(248,113,113,0.1); color: #f87171; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.15s; }
        .ap-img-remove:hover { background: rgba(248,113,113,0.22); }

        /* ACTIONS */
        .ap-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; flex-wrap: wrap; }
        .ap-btn-reset { padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: transparent; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.45); display: inline-flex; align-items: center; gap: 7px; transition: background 0.18s, color 0.18s; }
        .ap-btn-reset:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
        .ap-btn-submit { padding: 13px 28px; border-radius: 12px; border: none; cursor: pointer; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800; color: #020408; background: linear-gradient(135deg, #00c6ff, #a855f7); display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s; position: relative; overflow: hidden; }
        .ap-btn-submit::before { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.12); opacity: 0; transition: opacity 0.2s; }
        .ap-btn-submit:hover:not(:disabled)::before { opacity: 1; }
        .ap-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(0,198,255,0.28); }
        .ap-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* SPINNER */
        .ap-spin { width: 15px; height: 15px; border-radius: 50%; border: 2px solid rgba(2,4,8,0.2); border-top-color: #020408; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

         <div className="ap-root">
            <div className="ap-bg" /><div className="ap-orb1" /><div className="ap-orb2" />

            {/* NAV */}
            <nav className="ap-nav">
               <a href="/" className="ap-nav-logo">
                  <div className="ap-nav-logo-box"><Zap size={16} color="#020408" strokeWidth={2.5} /></div>
                  <span className="ap-nav-logo-text">QuantumCart</span>
               </a>
               <span className="ap-nav-sep">/</span>
               <span className="ap-nav-page">Add Product</span>
               <div className="ap-spacer" />
            </nav>

            <div className="ap-page">

               {/* BACK */}
               <button className="ap-back" onClick={() => navigate(-1)}>
                  <ArrowLeft size={14} /> Back
               </button>

               {/* HEADER */}
               <div className="ap-header">
                  <div className="ap-badge"><Package size={10} /> New Listing</div>
                  <h1 className="ap-title">Add a <span>New Product</span></h1>
                  <p className="ap-sub">
                     Fill in the details below. Sends <code>POST /product/add</code> on submit.
                  </p>
               </div>

               {/* ALERTS */}
               {success && (
                  <div className="ap-success">
                     <CheckCircle size={15} /> Product added! Redirecting to your listings…
                  </div>
               )}
               {apiError && (
                  <div className="ap-api-err">
                     <AlertTriangle size={15} /> {apiError}
                  </div>
               )}

               {/* ── CARD 1: Basic Info ── */}
               <div className="ap-card">
                  <div className="ap-card-title">
                     Basic Info <div className="ap-card-title-line" />
                  </div>

                  <div className="ap-grid">
                     {/* Name */}
                     <div className="ap-full">
                        <Field label="Product Name" error={errors?.name}>
                           <input
                              className={`ap-input ${errors?.name ? "err" : ""}`}
                              placeholder="e.g. Quantum Pro Earbuds X"
                              value={form.name}
                              onChange={(e) => set("name", e.target.value)}
                           />
                        </Field>
                     </div>

                     {/* Description */}
                     <div className="ap-full">
                        <Field
                           label="Description"
                           char={{ current: form.description.length, max: 1000, warn: form.description.length > 950 }}
                        >
                           <textarea
                              className="ap-input"
                              rows={4}
                              maxLength={1000}
                              placeholder="Describe your product — features, materials, dimensions…"
                              value={form.description}
                              onChange={(e) => set("description", e.target.value)}
                           />
                        </Field>
                     </div>
                  </div>
               </div>

               {/* ── CARD 2: Pricing & Stock ── */}
               <div className="ap-card">
                  <div className="ap-card-title">
                     Pricing &amp; Stock <div className="ap-card-title-line" />
                  </div>

                  <div className="ap-grid">
                     {/* Price */}
                     <Field label="Price (₹)" error={errors.price}>
                        <div className="ap-prefix-wrap">
                           <span className="ap-prefix">₹</span>
                           <input
                              className={`ap-input ap-with-prefix ${errors.price ? "err" : ""}`}
                              type="number" min={0} step="0.01"
                              placeholder="0.00"
                              value={form.price}
                              onChange={(e) => set("price", e.target.value)}
                           />
                        </div>
                     </Field>

                     {/* Discount */}
                     <Field label="Discount (%)" error={errors.discount} hint="Enter 0 for no discount">
                        <div className="ap-prefix-wrap">
                           <span className="ap-prefix">%</span>
                           <input
                              className={`ap-input ap-with-prefix ${errors.discount ? "err" : ""}`}
                              type="number" min={0} max={100}
                              placeholder="0"
                              value={form.discount}
                              onChange={(e) => set("discount", e.target.value)}
                           />
                        </div>
                     </Field>

                     {/* Final Price — read-only, auto-calculated */}
                     <Field label="Final Price (auto-calculated)" hint="Updates as you type price & discount">
                        <div className="ap-final-box">
                           <span className="ap-final-val">₹{finalPrice}</span>
                           {+form.discount > 0 && (
                              <span className="ap-final-disc">-{form.discount}% OFF</span>
                           )}
                        </div>
                     </Field>

                     {/* Stock */}
                     <Field label="Stock Quantity" error={errors.stock}>
                        <input
                           className={`ap-input ${errors.stock ? "err" : ""}`}
                           type="number" min={0}
                           placeholder="e.g. 100"
                           value={form.stock}
                           onChange={(e) => set("stock", e.target.value)}
                        />
                     </Field>
                  </div>
               </div>

               {/* ── CARD 3: Status ── */}
               <div className="ap-card">
                  <div className="ap-card-title">
                     Status <div className="ap-card-title-line" />
                  </div>

                  <div className="ap-status-group">
                     {STATUS_OPTIONS.map((s) => {
                        const active = form.status === s.value;
                        return (
                           <button
                              key={s.value}
                              type="button"
                              className="ap-status-btn"
                              style={active ? {
                                 borderColor: s.border,
                                 background: s.bg,
                                 color: s.color,
                              } : {}}
                              onClick={() => set("status", s.value)}
                           >
                              <span
                                 className="ap-status-dot"
                                 style={{ background: active ? s.color : "rgba(255,255,255,0.18)" }}
                              />
                              {s.label}
                           </button>
                        );
                     })}
                  </div>
               </div>

               {/* ── CARD 4: Images ── */}
               <div className="ap-card">
                  <div className="ap-card-title">
                     Product Images <div className="ap-card-title-line" />
                  </div>

                  <ImageInput
                     images={form.images}
                     onChange={(v) => set("images", v)}
                  />

                  {form.images.length === 0 && (
                     <p className="ap-hint" style={{ marginTop: 8 }}>
                        No images added yet. Paste a URL above and click Add.
                     </p>
                  )}
               </div>

               {/* ── ACTIONS ── */}
               <div className="ap-actions">
                  <button className="ap-btn-reset" onClick={handleReset} disabled={loading}>
                     <X size={13} /> Reset
                  </button>
                  <button className="ap-btn-submit" onClick={handleSubmit} disabled={loading || success}>
                     {loading
                        ? <><div className="ap-spin" /> Adding Product…</>
                        : <><Save size={14} /> Add Product</>}
                  </button>
               </div>

            </div>
         </div>
      </>
   );
}