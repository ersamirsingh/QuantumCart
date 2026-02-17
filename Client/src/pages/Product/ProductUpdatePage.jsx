import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
   Zap, ArrowLeft, Save, X, Package, CheckCircle,
   AlertTriangle, Plus, Edit3, RefreshCw,
} from "lucide-react";
import axiosClient from "../../API/axiosClient";

/* ── Status options ── */
const STATUS_OPTIONS = [
   { value: "ACTIVE", label: "Active", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
   { value: "OUT_OF_STOCK", label: "Out of Stock", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
   { value: "BLOCKED", label: "Blocked", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
];

const calcFinal = (price, discount) => {
   const p = parseFloat(price) || 0;
   const d = parseFloat(discount) || 0;
   if (p <= 0) return "0.00";
   return Math.max(0, p - (p * d) / 100).toFixed(2);
};

/* ── Image Input ── */
function ImageInput({ images, onChange }) {
   const [url, setUrl] = useState("");
   const add = () => {
      const t = url.trim();
      if (!t || images.includes(t)) return;
      onChange([...images, t]);
      setUrl("");
   };
   const remove = (i) => onChange(images.filter((_, idx) => idx !== i));
   return (
      <div>
         <div className="up-img-row">
            <input
               className="up-input"
               style={{ flex: 1 }}
               placeholder="Paste image URL and press Add"
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            />
            <button type="button" className="up-img-add-btn" onClick={add}>
               <Plus size={14} /> Add
            </button>
         </div>
         {images.length > 0 && (
            <div className="up-img-list">
               {images.map((img, i) => (
                  <div className="up-img-item" key={i}>
                     <img
                        src={img} alt=""
                        className="up-img-thumb"
                        onError={(e) => { e.target.style.display = "none"; }}
                     />
                     <span className="up-img-url">{img}</span>
                     <button className="up-img-remove" onClick={() => remove(i)}>
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
      <div className="up-field">
         <div className="up-field-top">
            <label className="up-label">{label}</label>
            {char !== undefined && (
               <span className={`up-char ${char.warn ? "warn" : ""}`}>
                  {char.current}/{char.max}
               </span>
            )}
         </div>
         {children}
         {hint && !error && <span className="up-hint">{hint}</span>}
         {error && <span className="up-err"><AlertTriangle size={11} /> {error}</span>}
      </div>
   );
}

/* ── Main Page ── */
export default function ProductUpdatePage() {

   const { id } = useParams();
   const navigate = useNavigate();

   const [original, setOriginal] = useState(null);
   const [form, setForm] = useState(null);
   const [fetchLoading, setFetchLoading] = useState(true);
   const [fetchError, setFetchError] = useState("");

   const [errors, setErrors] = useState({});
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState(false);
   const [apiError, setApiError] = useState("");

   /* ── fetch product on mount ── */
   useEffect(() => {
      const load = async () => {
         setFetchLoading(true);
         try {
            const res = await axiosClient.get(`/product/${id}`);
            const data = res.data;
            setOriginal(data);
            setForm({
               name: data.name,
               description: data.description || "",
               price: data.price,
               discount: data.discount,
               stock: data.stock,
               status: data.status,
               images: data.images || [],
            });
         } catch (e) {
            alert(e.message || "Failed to load product");
            setFetchError(e.message || "Product not found");
         } finally {
            setFetchLoading(false);
         }
      };
      load();
   }, [id]);

   const set = (key, val) => {
      setForm((f) => ({ ...f, [key]: val }));
      if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
      setSuccess(false);
      setApiError("");
   };

   const finalPrice = form ? calcFinal(form.price, form.discount) : "0.00";

   const isDirty = form && original && (
      form.name !== original.name ||
      form.description !== (original.description || "") ||
      +form.price !== original.price ||
      +form.discount !== original.discount ||
      +form.stock !== original.stock ||
      form.status !== original.status ||
      JSON.stringify(form.images) !== JSON.stringify(original.images)
   );

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
      setLoading(true); 
      setApiError(""); 
      setSuccess(false);

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

      try {
         const res = await axiosClient.patch(`/product/${original._id}`, payload);
         console.log(res.data);
         setOriginal((prev) => ({ ...prev, ...payload }));
         setSuccess(true);
         setTimeout(() => {
            navigate(`/product/${res.data._id}`);
         }, 1000);
      } catch (e) {
         setApiError(e.response?.data?.message || e.message || "Failed to update product");
      } finally {
         setLoading(false);
      }
   };

   const handleReset = () => {
      if (!original) return;
      setForm({
         name: original.name,
         description: original.description || "",
         price: original.price,
         discount: original.discount,
         stock: original.stock,
         status: original.status,
         images: original.images || [],
      });
      setErrors({}); 
      setApiError(""); 
      setSuccess(false);
   };

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .up-root{min-height:100vh;background:#020408;font-family:'DM Sans',sans-serif;color:#fff;overflow-x:hidden;}
        .up-bg{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,198,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,198,255,0.03) 1px,transparent 1px);background-size:60px 60px;}
        .up-orb1{position:fixed;width:520px;height:520px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(0,198,255,0.09) 0%,transparent 68%);top:-200px;left:-160px;}
        .up-orb2{position:fixed;width:420px;height:420px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 68%);bottom:-130px;right:-110px;}

        /* NAV */
        .up-nav{position:sticky;top:0;z-index:100;height:60px;padding:0 28px;display:flex;align-items:center;gap:10px;background:rgba(2,4,8,0.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);}
        .up-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;}
        .up-nav-logo-box{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#00c6ff,#a855f7);display:flex;align-items:center;justify-content:center;}
        .up-nav-logo-text{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;background:linear-gradient(135deg,#fff 40%,#00c6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .up-nav-sep{color:rgba(255,255,255,0.15);margin:0 2px;}
        .up-nav-page{font-size:13px;color:rgba(255,255,255,0.38);}
        .up-spacer{flex:1;}

        /* DIRTY INDICATOR in nav */
        .up-dirty-pill{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);font-size:11px;font-weight:700;color:#f59e0b;}
        .up-dirty-dot{width:6px;height:6px;border-radius:50%;background:#f59e0b;animation:up-blink 1.2s ease infinite;}
        @keyframes up-blink{0%,100%{opacity:1;}50%{opacity:0.3;}}

        /* PAGE */
        .up-page{position:relative;z-index:1;max-width:860px;margin:0 auto;padding:36px 24px 100px;animation:up-in 0.35s ease;}
        @keyframes up-in{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}

        .up-back{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);margin-bottom:26px;transition:all 0.18s;}
        .up-back:hover{background:rgba(255,255,255,0.07);color:#fff;border-color:rgba(255,255,255,0.2);}

        /* HEADER */
        .up-header{margin-bottom:26px;}
        .up-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);color:#a855f7;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:10px;}
        .up-title{font-family:'Syne',sans-serif;font-size:clamp(22px,3.5vw,32px);font-weight:800;color:#fff;letter-spacing:-0.8px;margin-bottom:5px;}
        .up-title span{background:linear-gradient(135deg,#00c6ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .up-product-name-tag{display:inline-flex;align-items:center;gap:8px;padding:5px 13px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);font-size:13px;color:rgba(255,255,255,0.55);margin-top:8px;}
        .up-product-name-tag strong{color:rgba(255,255,255,0.85);font-weight:700;}
        .up-sub{font-size:13px;color:rgba(255,255,255,0.38);line-height:1.6;margin-top:6px;}
        .up-sub code{color:rgba(0,198,255,0.7);font-size:12px;background:rgba(0,198,255,0.07);padding:1px 7px;border-radius:5px;}

        /* ALERTS */
        .up-success{display:flex;align-items:center;gap:10px;padding:13px 16px;border-radius:13px;background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.2);color:#22c55e;font-size:13px;font-weight:600;margin-bottom:18px;}
        .up-api-err{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:13px;background:rgba(248,113,113,0.07);border:1px solid rgba(248,113,113,0.2);color:#f87171;font-size:13px;font-weight:600;margin-bottom:18px;}

        /* LOADING */
        .up-loading{display:flex;align-items:center;justify-content:center;min-height:400px;gap:12px;color:rgba(255,255,255,0.4);font-size:14px;}
        .up-load-spin{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,0.1);border-top-color:#00c6ff;animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        /* FETCH ERROR */
        .up-fetch-err{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:380px;gap:14px;text-align:center;}
        .up-fetch-err h2{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#fff;}
        .up-fetch-err p{font-size:13px;color:rgba(255,255,255,0.38);}

        /* CARD */
        .up-card{background:rgba(255,255,255,0.028);border:1px solid rgba(255,255,255,0.08);border-radius:22px;padding:28px 30px;backdrop-filter:blur(12px);margin-bottom:16px;}
        .up-card-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:800;color:#fff;display:flex;align-items:center;gap:10px;margin-bottom:22px;letter-spacing:-0.2px;}
        .up-card-line{flex:1;height:1px;background:rgba(255,255,255,0.07);}

        /* GRID */
        .up-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
        .up-full{grid-column:1/-1;}
        @media(max-width:580px){.up-grid{grid-template-columns:1fr;}.up-full{grid-column:1;}}

        /* FIELD */
        .up-field{display:flex;flex-direction:column;gap:7px;}
        .up-field-top{display:flex;align-items:center;justify-content:space-between;}
        .up-label{font-size:10px;font-weight:700;letter-spacing:0.9px;text-transform:uppercase;color:rgba(255,255,255,0.4);}
        .up-char{font-size:10px;color:rgba(255,255,255,0.25);font-weight:500;}
        .up-char.warn{color:#f87171;}
        .up-hint{font-size:11px;color:rgba(255,255,255,0.25);}
        .up-err{font-size:11px;color:#f87171;font-weight:600;display:flex;align-items:center;gap:4px;}

        /* INPUT */
        .up-input{width:100%;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;resize:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .up-input::placeholder{color:rgba(255,255,255,0.2);}
        .up-input:focus{border-color:rgba(0,198,255,0.45);box-shadow:0 0 0 3px rgba(0,198,255,0.07);}
        .up-input.err{border-color:rgba(248,113,113,0.5);box-shadow:0 0 0 3px rgba(248,113,113,0.06);}
        .up-input.changed{border-color:rgba(168,85,247,0.4);}

        /* PREFIX */
        .up-prefix-wrap{position:relative;}
        .up-prefix{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:13px;font-weight:700;color:rgba(255,255,255,0.3);pointer-events:none;}
        .up-with-prefix{padding-left:30px;}

        /* FINAL PRICE */
        .up-final-box{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:12px;background:rgba(0,198,255,0.04);border:1px solid rgba(0,198,255,0.15);}
        .up-final-val{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#00c6ff;}
        .up-final-disc{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(0,198,255,0.12);border:1px solid rgba(0,198,255,0.2);color:#00c6ff;}

        /* STATUS */
        .up-status-group{display:flex;gap:8px;flex-wrap:wrap;}
        .up-status-btn{display:flex;align-items:center;gap:7px;padding:9px 16px;border-radius:11px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.42);transition:all 0.18s;}
        .up-status-btn:hover{border-color:rgba(255,255,255,0.2);color:rgba(255,255,255,0.75);}
        .up-status-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;transition:background 0.18s;}

        /* IMAGES */
        .up-img-row{display:flex;gap:8px;}
        .up-img-add-btn{display:inline-flex;align-items:center;gap:6px;padding:12px 16px;border-radius:12px;border:none;background:rgba(0,198,255,0.1);color:#00c6ff;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;white-space:nowrap;transition:background 0.18s;}
        .up-img-add-btn:hover{background:rgba(0,198,255,0.18);}
        .up-img-list{display:flex;flex-direction:column;gap:8px;margin-top:10px;}
        .up-img-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);}
        .up-img-thumb{width:36px;height:36px;border-radius:7px;object-fit:cover;flex-shrink:0;background:rgba(255,255,255,0.05);}
        .up-img-url{flex:1;font-size:12px;color:rgba(255,255,255,0.38);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .up-img-remove{width:24px;height:24px;border-radius:6px;border:none;background:rgba(248,113,113,0.1);color:#f87171;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.15s;}
        .up-img-remove:hover{background:rgba(248,113,113,0.22);}

        /* DIFF BADGE */
        .up-changed-tag{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:#a855f7;letter-spacing:0.4px;}

        /* ACTIONS */
        .up-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:8px;flex-wrap:wrap;}
        .up-btn-reset{padding:12px 20px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.45);display:inline-flex;align-items:center;gap:7px;transition:background 0.18s,color 0.18s;}
        .up-btn-reset:hover:not(:disabled){background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.8);}
        .up-btn-reset:disabled{opacity:0.4;cursor:not-allowed;}
        .up-btn-submit{padding:13px 28px;border-radius:12px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#020408;background:linear-gradient(135deg,#00c6ff,#a855f7);display:inline-flex;align-items:center;gap:8px;transition:transform 0.2s,box-shadow 0.2s,opacity 0.2s;position:relative;overflow:hidden;}
        .up-btn-submit::before{content:'';position:absolute;inset:0;background:rgba(255,255,255,0.12);opacity:0;transition:opacity 0.2s;}
        .up-btn-submit:hover:not(:disabled)::before{opacity:1;}
        .up-btn-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,198,255,0.28);}
        .up-btn-submit:disabled{opacity:0.5;cursor:not-allowed;}

        /* SPINNER */
        .up-spin{width:15px;height:15px;border-radius:50%;border:2px solid rgba(2,4,8,0.2);border-top-color:#020408;animation:spin 0.7s linear infinite;flex-shrink:0;}
      `}</style>

         <div className="up-root">
            <div className="up-bg" /><div className="up-orb1" /><div className="up-orb2" />

            {/* NAV */}
            <nav className="up-nav">
               <a href="/" className="up-nav-logo">
                  <div className="up-nav-logo-box"><Zap size={16} color="#020408" strokeWidth={2.5} /></div>
                  <span className="up-nav-logo-text">QuantumCart</span>
               </a>
               <span className="up-nav-sep">/</span>
               <span className="up-nav-page">Update Product</span>
               <div className="up-spacer" />
               {isDirty && (
                  <div className="up-dirty-pill">
                     <div className="up-dirty-dot" /> Unsaved changes
                  </div>
               )}
            </nav>

            <div className="up-page">

               {/* BACK */}
               <button className="up-back" onClick={() => navigate(-1)}>
                  <ArrowLeft size={14} /> Back
               </button>

               {/* LOADING */}
               {fetchLoading && (
                  <div className="up-loading">
                     <div className="up-load-spin" /> Loading product…
                  </div>
               )}

               {/* FETCH ERROR */}
               {!fetchLoading && fetchError && (
                  <div className="up-fetch-err">
                     <AlertTriangle size={28} color="#f87171" />
                     <h2>Product Not Found</h2>
                     <p>{fetchError}</p>
                  </div>
               )}

               {/* FORM */}
               {!fetchLoading && form && (
                  <>
                     {/* HEADER */}
                     <div className="up-header">
                        <div className="up-badge"><Edit3 size={10} /> Editing Product</div>
                        <h1 className="up-title">Update <span>Product</span></h1>
                        <div className="up-product-name-tag">
                           <Package size={13} color="rgba(255,255,255,0.3)" />
                           <strong>{original.name}</strong>
                        </div>
                        <p className="up-sub">
                           Modifies the product via <code>PUT /product/{original._id}</code>
                        </p>
                     </div>

                     {/* ALERTS */}
                     {success && (
                        <div className="up-success">
                           <CheckCircle size={15} /> Product updated successfully!
                        </div>
                     )}
                     {apiError && (
                        <div className="up-api-err">
                           <AlertTriangle size={15} /> {apiError}
                        </div>
                     )}

                     {/* ── CARD 1: Basic Info ── */}
                     <div className="up-card">
                        <div className="up-card-title">
                           Basic Info <div className="up-card-line" />
                        </div>
                        <div className="up-grid">

                           <div className="up-full">
                              <Field label="Product Name" error={errors.name}>
                                 <input
                                    className={`up-input ${errors.name ? "err" : ""} ${form.name !== original.name ? "changed" : ""}`}
                                    placeholder="Product name"
                                    value={form.name}
                                    onChange={(e) => set("name", e.target.value)}
                                 />
                              </Field>
                           </div>

                           <div className="up-full">
                              <Field
                                 label="Description"
                                 char={{ current: form.description.length, max: 1000, warn: form.description.length > 950 }}
                              >
                                 <textarea
                                    className={`up-input ${form.description !== (original.description || "") ? "changed" : ""}`}
                                    rows={4}
                                    maxLength={1000}
                                    placeholder="Describe your product…"
                                    value={form.description}
                                    onChange={(e) => set("description", e.target.value)}
                                 />
                              </Field>
                           </div>

                        </div>
                     </div>

                     {/* ── CARD 2: Pricing & Stock ── */}
                     <div className="up-card">
                        <div className="up-card-title">
                           Pricing &amp; Stock <div className="up-card-line" />
                        </div>
                        <div className="up-grid">

                           <Field label="Price (₹)" error={errors.price}>
                              <div className="up-prefix-wrap">
                                 <span className="up-prefix">₹</span>
                                 <input
                                    className={`up-input up-with-prefix ${errors.price ? "err" : ""} ${+form.price !== original.price ? "changed" : ""}`}
                                    type="number" min={0} step="0.01"
                                    placeholder="0.00"
                                    value={form.price}
                                    onChange={(e) => set("price", e.target.value)}
                                 />
                              </div>
                           </Field>

                           <Field label="Discount (%)" error={errors.discount} hint="0 – 100">
                              <div className="up-prefix-wrap">
                                 <span className="up-prefix">%</span>
                                 <input
                                    className={`up-input up-with-prefix ${errors.discount ? "err" : ""} ${+form.discount !== original.discount ? "changed" : ""}`}
                                    type="number" min={0} max={100}
                                    placeholder="0"
                                    value={form.discount}
                                    onChange={(e) => set("discount", e.target.value)}
                                 />
                              </div>
                           </Field>

                           <Field label="Final Price (auto-calculated)" hint="Price after discount applied">
                              <div className="up-final-box">
                                 <span className="up-final-val">₹{finalPrice}</span>
                                 {+form.discount > 0 && (
                                    <span className="up-final-disc">-{form.discount}% OFF</span>
                                 )}
                              </div>
                           </Field>

                           <Field label="Stock Quantity" error={errors.stock}>
                              <input
                                 className={`up-input ${errors.stock ? "err" : ""} ${+form.stock !== original.stock ? "changed" : ""}`}
                                 type="number" min={0}
                                 placeholder="0"
                                 value={form.stock}
                                 onChange={(e) => set("stock", e.target.value)}
                              />
                           </Field>

                        </div>
                     </div>

                     {/* ── CARD 3: Status ── */}
                     <div className="up-card">
                        <div className="up-card-title">
                           Status <div className="up-card-line" />
                        </div>
                        <div className="up-status-group">
                           {STATUS_OPTIONS.map((s) => {
                              const active = form.status === s.value;
                              return (
                                 <button
                                    key={s.value}
                                    type="button"
                                    className="up-status-btn"
                                    style={active ? { borderColor: s.border, background: s.bg, color: s.color } : {}}
                                    onClick={() => set("status", s.value)}
                                 >
                                    <span
                                       className="up-status-dot"
                                       style={{ background: active ? s.color : "rgba(255,255,255,0.18)" }}
                                    />
                                    {s.label}
                                 </button>
                              );
                           })}
                        </div>
                     </div>

                     {/* ── CARD 4: Images ── */}
                     <div className="up-card">
                        <div className="up-card-title">
                           Product Images <div className="up-card-line" />
                        </div>
                        <ImageInput
                           images={form.images}
                           onChange={(v) => set("images", v)}
                        />
                        {form.images.length === 0 && (
                           <p className="up-hint" style={{ marginTop: 8 }}>
                              No images. Paste a URL above and click Add.
                           </p>
                        )}
                     </div>

                     {/* ── ACTIONS ── */}
                     <div className="up-actions">
                        <button
                           className="up-btn-reset"
                           onClick={handleReset}
                           disabled={loading || !isDirty}
                           title="Revert all changes"
                        >
                           <RefreshCw size={13} /> Revert Changes
                        </button>
                        <button
                           className="up-btn-submit"
                           onClick={handleSubmit}
                           disabled={loading || !isDirty}
                        >
                           {loading
                              ? <><div className="up-spin" /> Saving…</>
                              : <><Save size={14} /> Save Changes</>}
                        </button>
                     </div>
                  </>
               )}

            </div>
         </div>
      </>
   );
}