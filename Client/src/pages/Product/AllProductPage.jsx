import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
   Zap, Package, Search, Eye, Edit3,
   AlertTriangle, Image as ImageIcon, RefreshCw,
} from "lucide-react";
import axiosClient from "../../API/axiosClient";
import LoadingPage from "../../components/LoadingPage";

/* ── Status meta ── */
const STATUS_META = {
   ACTIVE: { label: "Active", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
   OUT_OF_STOCK: { label: "Out of Stock", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
   BLOCKED: { label: "Blocked", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
};


/* ── Helpers ── */
const isValidUrl = (str) => {
   try { return Boolean(new URL(str)); } catch { return false; }
};

const formatDate = (iso) =>
   new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/* ── Thumb ── */
function Thumb({ images }) {
   const src = images?.[0];
   const [broken, setBroken] = useState(!isValidUrl(src));

   if (!src || broken) {
      return (
         <div className="ap-thumb-empty">
            <Package size={20} color="rgba(255,255,255,0.13)" />
         </div>
      );
   }
   return (
      <img
         src={src}
         alt=""
         className="ap-thumb-img"
         onError={() => setBroken(true)}
      />
   );
}

/* ── Product Row ── */
function ProductRow({ product, index, onView, onEdit }) {
   const meta = STATUS_META[product.status] || STATUS_META.ACTIVE;

   return (
      <div className="ap-row" style={{ animationDelay: `${index * 0.045}s` }}>

         {/* Serial number */}
         <div className="ap-row-serial">
            <span className="ap-serial-num">{String(index + 1).padStart(2, "0")}</span>
         </div>

         {/* Thumbnail */}
         <div className="ap-row-thumb">
            <Thumb images={product.images} />
            {product.images.length > 1 && (
               <span className="ap-thumb-extra">+{product.images.length - 1}</span>
            )}
         </div>

         {/* Name + Description */}
         <div className="ap-row-info">
            <h3 className="ap-row-name">{product.name}</h3>
            <p className="ap-row-desc">{product.description || "—"}</p>
            <span className="ap-row-date">Added {formatDate(product.createdAt)}</span>
         </div>

         {/* Price */}
         <div className="ap-row-price">
            <span className="ap-final">₹{Number(product.finalPrice).toLocaleString("en-IN")}</span>
            {product.discount > 0 && (
               <>
                  <span className="ap-original">₹{Number(product.price).toLocaleString("en-IN")}</span>
                  <span className="ap-disc">-{product.discount}%</span>
               </>
            )}
         </div>

         {/* Stock */}
         <div className="ap-row-stock">
            <span
               className="ap-stock-num"
               style={{
                  color: product.stock === 0 ? "#f87171"
                     : product.stock <= 5 ? "#f59e0b"
                        : "rgba(255,255,255,0.8)",
               }}
            >
               {product.stock}
            </span>
            <span className="ap-stock-lbl">units</span>
            {product.stock <= 5 && product.stock > 0 && (
               <span className="ap-low-stock">Low</span>
            )}
            {product.stock === 0 && (
               <span className="ap-out-stock">Out</span>
            )}
         </div>

         {/* Status */}
         <div className="ap-row-status">
            <span
               className="ap-status-pill"
               style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}
            >
               <span className="ap-status-dot" style={{ background: meta.color }} />
               {meta.label}
            </span>
         </div>

         {/* Rating */}
         <div className="ap-row-rating">
            {product.rating > 0 ? (
               <>
                  <span style={{ color: "#f59e0b", fontSize: 13 }}>★</span>
                  <span className="ap-rating-val">{product.rating}</span>
               </>
            ) : (
               <span className="ap-no-rating">—</span>
            )}
         </div>

         {/* Actions */}
         <div className="ap-row-actions">
            <button className="ap-action-btn view" onClick={() => onView(product._id)} title="View">
               <Eye size={14} />
            </button>
            <button className="ap-action-btn edit" onClick={() => onEdit(product._id)} title="Edit">
               <Edit3 size={14} />
            </button>
         </div>
      </div>
   );
}

/* ── Main Page ── */
export default function AllProductsPage() {
   const navigate = useNavigate();

   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [search, setSearch] = useState("");
   const [filterStatus, setFilterStatus] = useState("ALL");

   /* ── Fetch products ── */
   const fetchProducts = async () => {
      setLoading(true); 
      setError("");
      try {
         const res = await axiosClient.get("/product/all");
         setProducts(res.data);
      } catch (e) {
         setError(e.message || "Something went wrong");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { 
      fetchProducts(); 
   }, []);


   /* ── Filter ── */
   const filtered = products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
         p.description?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "ALL" || p.status === filterStatus;
      return matchSearch && matchStatus;
   });

   /* ── Stats ── */
   const stats = {
      total: products.length,
      active: products.filter((p) => p.status === "ACTIVE").length,
      outStock: products.filter((p) => p.status === "OUT_OF_STOCK").length,
      blocked: products.filter((p) => p.status === "BLOCKED").length,
   };

   if(loading) return <LoadingPage/>

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .ap-root{min-height:100vh;background:#020408;font-family:'DM Sans',sans-serif;color:#fff;overflow-x:hidden;}
        .ap-bg{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,198,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,198,255,0.03) 1px,transparent 1px);background-size:60px 60px;}
        .ap-orb1{position:fixed;width:500px;height:500px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(0,198,255,0.08) 0%,transparent 68%);top:-200px;left:-160px;}
        .ap-orb2{position:fixed;width:400px;height:400px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 68%);bottom:-120px;right:-110px;}

        /* NAV */
        .ap-nav{position:sticky;top:0;z-index:100;height:60px;padding:0 28px;display:flex;align-items:center;gap:10px;background:rgba(2,4,8,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);}
        .ap-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;}
        .ap-nav-logo-box{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#00c6ff,#a855f7);display:flex;align-items:center;justify-content:center;}
        .ap-nav-logo-text{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;background:linear-gradient(135deg,#fff 40%,#00c6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .ap-nav-sep{color:rgba(255,255,255,0.15);margin:0 2px;}
        .ap-nav-page{font-size:13px;color:rgba(255,255,255,0.38);}
        .ap-nav-spacer{flex:1;}
        .ap-btn-add{display:flex;align-items:center;gap:7px;padding:8px 18px;border-radius:10px;border:none;background:linear-gradient(135deg,#00c6ff,#a855f7);cursor:pointer;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#020408;transition:transform 0.2s,box-shadow 0.2s;}
        .ap-btn-add:hover{transform:translateY(-1px);box-shadow:0 5px 18px rgba(0,198,255,0.25);}

        /* PAGE */
        .ap-page{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:36px 24px 100px;}

        /* HEADER */
        .ap-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:28px;}
        .ap-title{font-family:'Syne',sans-serif;font-size:clamp(22px,3vw,30px);font-weight:800;color:#fff;letter-spacing:-0.7px;}
        .ap-title span{background:linear-gradient(135deg,#00c6ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .ap-sub{font-size:13px;color:rgba(255,255,255,0.36);margin-top:4px;}

        /* STATS */
        .ap-stats{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;}
        .ap-stat{padding:14px 20px;border-radius:15px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.025);display:flex;flex-direction:column;gap:3px;min-width:90px;cursor:pointer;transition:border-color 0.18s,background 0.18s;}
        .ap-stat:hover{border-color:rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);}
        .ap-stat.active-filter{border-color:rgba(0,198,255,0.35);background:rgba(0,198,255,0.07);}
        .ap-stat-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;}
        .ap-stat-lbl{font-size:11px;color:rgba(255,255,255,0.34);font-weight:500;}

        /* SEARCH + FILTER BAR */
        .ap-controls{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;align-items:center;}
        .ap-search-wrap{flex:1;min-width:220px;position:relative;}
        .ap-search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.28);pointer-events:none;}
        .ap-search{width:100%;padding:11px 14px 11px 38px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .ap-search::placeholder{color:rgba(255,255,255,0.2);}
        .ap-search:focus{border-color:rgba(0,198,255,0.45);box-shadow:0 0 0 3px rgba(0,198,255,0.07);}
        .ap-filter-group{display:flex;gap:6px;flex-wrap:wrap;}
        .ap-filter-btn{padding:9px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;color:rgba(255,255,255,0.42);transition:all 0.18s;white-space:nowrap;}
        .ap-filter-btn:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.8);}
        .ap-filter-btn.active{background:rgba(0,198,255,0.1);border-color:rgba(0,198,255,0.3);color:#00c6ff;}
        .ap-refresh-btn{width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);transition:background 0.18s,color 0.18s;}
        .ap-refresh-btn:hover{background:rgba(255,255,255,0.07);color:#fff;}

        /* RESULT COUNT */
        .ap-result-count{font-size:12px;color:rgba(255,255,255,0.3);margin-bottom:14px;font-weight:500;}
        .ap-result-count strong{color:rgba(255,255,255,0.6);}

        /* TABLE HEADER */
        .ap-table-head{display:grid;grid-template-columns:48px 60px 1fr 140px 80px 120px 60px 100px;gap:12px;align-items:center;padding:9px 16px;margin-bottom:6px;}
        .ap-th{font-size:10px;font-weight:700;letter-spacing:0.9px;text-transform:uppercase;color:rgba(255,255,255,0.28);}
        @media(max-width:900px){
          .ap-table-head{display:none;}
        }

        /* ROW */
        .ap-row{display:grid;grid-template-columns:48px 60px 1fr 140px 80px 120px 60px 100px;gap:12px;align-items:center;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;animation:ap-row-in 0.3s ease both;transition:background 0.18s,border-color 0.18s,transform 0.18s;}
        .ap-row:hover{background:rgba(255,255,255,0.045);border-color:rgba(255,255,255,0.12);transform:translateX(3px);}
        @keyframes ap-row-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @media(max-width:900px){
          .ap-row{grid-template-columns:40px 50px 1fr;grid-template-rows:auto auto auto;gap:8px 10px;padding:14px;}
          .ap-row-price,.ap-row-stock,.ap-row-status,.ap-row-rating{display:none;}
          .ap-row-actions{grid-column:3;justify-content:flex-end;}
        }

        /* SERIAL */
        .ap-row-serial{display:flex;align-items:center;justify-content:center;}
        .ap-serial-num{font-family:'Syne',sans-serif;font-size:13px;font-weight:800;color:rgba(255,255,255,0.2);}

        /* THUMB */
        .ap-row-thumb{position:relative;width:52px;height:52px;border-radius:10px;overflow:hidden;flex-shrink:0;}
        .ap-thumb-empty{width:100%;height:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;display:flex;align-items:center;justify-content:center;}
        .ap-thumb-img{width:100%;height:100%;object-fit:cover;display:block;border-radius:10px;}
        .ap-thumb-extra{position:absolute;bottom:2px;right:2px;background:rgba(2,4,8,0.8);color:rgba(255,255,255,0.7);font-size:9px;font-weight:700;padding:1px 5px;border-radius:5px;}

        /* INFO */
        .ap-row-info{min-width:0;}
        .ap-row-name{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;}
        .ap-row-desc{font-size:12px;color:rgba(255,255,255,0.35);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;}
        .ap-row-date{font-size:11px;color:rgba(255,255,255,0.2);}

        /* PRICE */
        .ap-row-price{display:flex;flex-direction:column;gap:2px;}
        .ap-final{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;}
        .ap-original{font-size:11px;color:rgba(255,255,255,0.28);text-decoration:line-through;}
        .ap-disc{font-size:10px;font-weight:700;color:#00c6ff;}

        /* STOCK */
        .ap-row-stock{display:flex;flex-direction:column;align-items:flex-start;gap:2px;}
        .ap-stock-num{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;}
        .ap-stock-lbl{font-size:10px;color:rgba(255,255,255,0.3);}
        .ap-low-stock{font-size:9px;font-weight:700;color:#f59e0b;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);padding:1px 6px;border-radius:5px;}
        .ap-out-stock{font-size:9px;font-weight:700;color:#f87171;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.25);padding:1px 6px;border-radius:5px;}

        /* STATUS */
        .ap-row-status{}
        .ap-status-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:0.4px;white-space:nowrap;}
        .ap-status-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}

        /* RATING */
        .ap-row-rating{display:flex;align-items:center;gap:4px;}
        .ap-rating-val{font-size:13px;font-weight:700;color:#f59e0b;}
        .ap-no-rating{font-size:13px;color:rgba(255,255,255,0.2);}

        /* ACTIONS */
        .ap-row-actions{display:flex;gap:6px;align-items:center;justify-content:flex-end;}
        .ap-action-btn{width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
        .ap-action-btn.view{color:rgba(255,255,255,0.45);}
        .ap-action-btn.view:hover{background:rgba(0,198,255,0.1);border-color:rgba(0,198,255,0.3);color:#00c6ff;}
        .ap-action-btn.edit{color:rgba(255,255,255,0.45);}
        .ap-action-btn.edit:hover{background:rgba(168,85,247,0.1);border-color:rgba(168,85,247,0.3);color:#a855f7;}
        .ap-action-btn.del{color:rgba(255,255,255,0.35);}
        .ap-action-btn.del:hover{background:rgba(248,113,113,0.1);border-color:rgba(248,113,113,0.3);color:#f87171;}

        /* LOADING */
        .ap-loading{display:flex;align-items:center;justify-content:center;min-height:320px;gap:12px;color:rgba(255,255,255,0.38);font-size:14px;}
        .ap-load-spin{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,0.1);border-top-color:#00c6ff;animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        /* ERROR */
        .ap-error{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:320px;gap:14px;text-align:center;}
        .ap-error-icon{width:56px;height:56px;border-radius:50%;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);display:flex;align-items:center;justify-content:center;}
        .ap-error-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#fff;}
        .ap-error-sub{font-size:13px;color:rgba(255,255,255,0.36);}
        .ap-retry-btn{display:flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);transition:all 0.18s;}
        .ap-retry-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}

        /* EMPTY */
        .ap-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:280px;gap:14px;text-align:center;}
        .ap-empty-icon{width:64px;height:64px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;}
        .ap-empty-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#fff;}
        .ap-empty-sub{font-size:13px;color:rgba(255,255,255,0.35);max-width:280px;line-height:1.6;}

        /* MODAL */
        .ap-modal-bg{position:fixed;inset:0;z-index:200;background:rgba(2,4,8,0.88);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:24px;animation:ap-fadein 0.2s ease;}
        @keyframes ap-fadein{from{opacity:0;}to{opacity:1;}}
        .ap-modal{width:100%;max-width:380px;background:#0c1018;border:1px solid rgba(248,113,113,0.2);border-radius:20px;padding:28px;box-shadow:0 28px 70px rgba(0,0,0,0.6);animation:ap-modal-in 0.22s cubic-bezier(0.34,1.3,0.64,1);}
        @keyframes ap-modal-in{from{opacity:0;transform:scale(0.9) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);}}
        .ap-modal-ico{width:44px;height:44px;border-radius:50%;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);display:flex;align-items:center;justify-content:center;margin-bottom:13px;}
        .ap-modal-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#fff;margin-bottom:8px;}
        .ap-modal-sub{font-size:13px;color:rgba(255,255,255,0.4);line-height:1.6;margin-bottom:20px;}
        .ap-modal-actions{display:flex;gap:9px;}
        .ap-modal-cancel{flex:1;padding:11px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);transition:background 0.18s,color 0.18s;}
        .ap-modal-cancel:hover{background:rgba(255,255,255,0.08);color:#fff;}
        .ap-modal-cancel:disabled{opacity:0.4;cursor:not-allowed;}
        .ap-modal-confirm{flex:1.4;padding:11px;border-radius:10px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;background:linear-gradient(135deg,#dc2626,#f87171);color:#fff;display:flex;align-items:center;justify-content:center;gap:6px;transition:opacity 0.18s,transform 0.18s;}
        .ap-modal-confirm:hover:not(:disabled){transform:translateY(-1px);}
        .ap-modal-confirm:disabled{opacity:0.4;cursor:not-allowed;}

        /* SPIN */
        .ap-spin{width:14px;height:14px;border-radius:50%;border:2px solid rgba(2,4,8,0.2);border-top-color:#020408;animation:spin 0.7s linear infinite;flex-shrink:0;}
        .ap-spin.white{border-color:rgba(255,255,255,0.2);border-top-color:#fff;}
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
               <span className="ap-nav-page">All Products</span>
               <div className="ap-nav-spacer" />
               <button className="ap-btn-add" onClick={() => navigate("/product/add")}>
                  + Add Product
               </button>
            </nav>

            <div className="ap-page">

               {/* HEADER */}
               <div className="ap-header">
                  <div>
                     <h1 className="ap-title">All <span>Products</span></h1>
                     <p className="ap-sub">Serial view of your complete store inventory.</p>
                  </div>
               </div>

               {/* STATS PILLS — clickable filters */}
               <div className="ap-stats">
                  {[
                     { key: "ALL", label: "Total", val: stats.total, color: "#fff" },
                     { key: "ACTIVE", label: "Active", val: stats.active, color: "#22c55e" },
                     { key: "OUT_OF_STOCK", label: "Out of Stock", val: stats.outStock, color: "#f59e0b" },
                     { key: "BLOCKED", label: "Blocked", val: stats.blocked, color: "#f87171" },
                  ].map((s) => (
                     <div
                        key={s.key}
                        className={`ap-stat ${filterStatus === s.key ? "active-filter" : ""}`}
                        onClick={() => setFilterStatus(s.key)}
                     >
                        <span className="ap-stat-val" style={{ color: s.color }}>{s.val}</span>
                        <span className="ap-stat-lbl">{s.label}</span>
                     </div>
                  ))}
               </div>

               {/* CONTROLS */}
               <div className="ap-controls">
                  <div className="ap-search-wrap">
                     <Search size={14} className="ap-search-icon" />
                     <input
                        className="ap-search"
                        placeholder="Search by name or description…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                     />
                  </div>
                  <div className="ap-filter-group">
                     {["ALL", "ACTIVE", "OUT_OF_STOCK", "BLOCKED"].map((s) => (
                        <button
                           key={s}
                           className={`ap-filter-btn ${filterStatus === s ? "active" : ""}`}
                           onClick={() => setFilterStatus(s)}
                        >
                           {s === "ALL" ? "All" : s === "OUT_OF_STOCK" ? "Out of Stock" : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                     ))}
                  </div>
                  <button className="ap-refresh-btn" onClick={fetchProducts} title="Refresh">
                     <RefreshCw size={15} />
                  </button>
               </div>

               {/* LOADING */}
               {loading && (
                  <div className="ap-loading">
                     <div className="ap-load-spin" /> Fetching products…
                  </div>
               )}

               {/* ERROR */}
               {!loading && error && (
                  <div className="ap-error">
                     <div className="ap-error-icon"><AlertTriangle size={22} color="#f87171" /></div>
                     <h2 className="ap-error-title">Failed to Load</h2>
                     <p className="ap-error-sub">{error}</p>
                     <button className="ap-retry-btn" onClick={fetchProducts}>
                        <RefreshCw size={13} /> Retry
                     </button>
                  </div>
               )}

               {/* LIST */}
               {!loading && !error && (
                  <>
                     <p className="ap-result-count">
                        Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong> product{products.length !== 1 ? "s" : ""}
                        {search && <> matching "<strong>{search}</strong>"</>}
                     </p>

                     {/* TABLE HEADER */}
                     {filtered.length > 0 && (
                        <div className="ap-table-head">
                           <div className="ap-th">#</div>
                           <div className="ap-th">Image</div>
                           <div className="ap-th">Product</div>
                           <div className="ap-th">Price</div>
                           <div className="ap-th">Stock</div>
                           <div className="ap-th">Status</div>
                           <div className="ap-th">Rating</div>
                           <div className="ap-th" style={{ textAlign: "right" }}>Actions</div>
                        </div>
                     )}

                     {/* PRODUCT ROWS (using .map) */}
                     {filtered.length > 0 ? (
                        filtered.map((product, index) => (
                           <ProductRow
                              key={product._id}
                              product={product}
                              index={index}
                              onView={(id) => navigate(`/product/${id}`)}
                              onEdit={(id) => navigate(`/product/edit/${id}`)}
                              onDelete={(id) => navigate(`/product/delete/${id}`)}
                           />
                        ))
                     ) : (
                        <div className="ap-empty">
                           <div className="ap-empty-icon"><Package size={28} color="rgba(255,255,255,0.15)" /></div>
                           <h2 className="ap-empty-title">
                              {search ? "No matches found" : "No products yet"}
                           </h2>
                           <p className="ap-empty-sub">
                              {search
                                 ? `No products match "${search}". Try a different keyword.`
                                 : "Add your first product to start selling."}
                           </p>
                           {!search && (
                              <button className="ap-btn-add" onClick={() => navigate("/product/add")}>
                                 + Add Product
                              </button>
                           )}
                        </div>
                     )}
                  </>
               )}
            </div>
         </div>
      </>
   );
}