import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
   Zap, ArrowLeft, Edit3, Trash2, Package, Layers, Tag,
   DollarSign, ChevronLeft, ChevronRight, AlertTriangle,
   Clock, BarChart2, Image as ImageIcon, Shield,
} from "lucide-react";
import axiosClient from "../../API/axiosClient";
import LoadingPage from "../../components/LoadingPage";


/* ── Helpers ── */
const isValidUrl = (str) => {
   try { 
      return Boolean(new URL(str)); 
   } catch {
      return false; 
   }
};

const formatDate = (iso) =>
   new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const formatTime = (iso) =>
   new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

/* ── Stars ── */
function Stars({ rating }) {
   const filled = Math.round(rating);
   return (
      <div style={{ display: "flex", gap: 2 }}>
         {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} style={{ fontSize: 13, color: n <= filled ? "#f59e0b" : "rgba(255,255,255,0.12)" }}>★</span>
         ))}
      </div>
   );
}

/* ── Info Row ── */
function InfoRow({ icon, label, value, valueStyle }) {
   return (
      <div className="pv-info-row">
         <div className="pv-info-icon">{icon}</div>
         <div className="pv-info-body">
            <span className="pv-info-label">{label}</span>
            <span className="pv-info-value" style={valueStyle}>{value}</span>
         </div>
      </div>
   );
}

/* ── Image Slide ── */
function ImageSlide({ src, alt }) {
   const [broken, setBroken] = useState(!isValidUrl(src));
   if (broken) {
      return (
         <div className="pv-img-placeholder">
            <ImageIcon size={32} color="rgba(255,255,255,0.12)" />
            <span className="pv-img-placeholder-label">{src}</span>
         </div>
      );
   }
   return (
      <img
         src={src}
         alt={alt}
         style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
         onError={() => setBroken(true)}
      />
   );
}

/* ── Main Page ── */
export default function ProductViewPage() {
   const { id } = useParams();
   const navigate = useNavigate();

   const [product, setProduct] = useState(null);
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(true);
   const [imgIndex, setImgIndex] = useState(0);

   useEffect(() => {
      const load = async () => {
         setLoading(true)
         try {
            const res = await axiosClient.get(`/seller/product/${id}`);
            setProduct(res.data);
            setImgIndex(0);
            setError(null);
         } catch (e) {
            setError(e.message || "Product not found");
            alert(e.message || "Failed to load product");
         }
         finally {
            setLoading(false);
         }
      };
      load();
   }, [id]);


   if (error) return (
      <Shell>
         <div className="pv-err-state">
            <div className="pv-err-icon"><AlertTriangle size={22} color="#f87171" /></div>
            <h2 className="pv-err-title">Product Not Found</h2>
            <p className="pv-err-sub">{error}</p>
            <button className="pv-back" onClick={() => navigate(-1)}>
               <ArrowLeft size={14} /> Go Back
            </button>
         </div>
      </Shell>
   );
   
   if(loading) return <LoadingPage/>

   const p = product;
   const meta = product?.status;
   const hasImages = p.images && p.images.length > 0;
   const prevImg = () => setImgIndex((i) => (i - 1 + p.images.length) % p.images.length);
   const nextImg = () => setImgIndex((i) => (i + 1) % p.images.length);


   return (
      <Shell product={p} navigate={navigate}>
         <div className="pv-page">

            {/* BACK */}
            <button className="pv-back" onClick={() => navigate(-1)}>
               <ArrowLeft size={14} /> Back to Products
            </button>

            <div className="pv-grid">

               {/* ── LEFT: Image Gallery ── */}
               <div className="pv-gallery">
                  <div className="pv-img-main">
                     {hasImages ? (
                        <>
                           <ImageSlide src={p.images[imgIndex]} alt={p.name} />
                           {p.images.length > 1 && (
                              <>
                                 <button className="pv-arrow left" onClick={prevImg}><ChevronLeft size={16} /></button>
                                 <button className="pv-arrow right" onClick={nextImg}><ChevronRight size={16} /></button>
                                 <div className="pv-dots">
                                    {p.images.map((_, i) => (
                                       <button key={i} className={`pv-dot ${i === imgIndex ? "active" : ""}`} onClick={() => setImgIndex(i)} />
                                    ))}
                                 </div>
                              </>
                           )}
                        </>
                     ) : (
                        <div className="pv-img-placeholder" style={{ height: "100%" }}>
                           <Package size={40} color="rgba(255,255,255,0.1)" />
                           <span className="pv-img-placeholder-label">No images uploaded</span>
                        </div>
                     )}

                     {/* Image count badge */}
                     {hasImages && (
                        <div className="pv-img-count-badge">
                           <ImageIcon size={10} /> {imgIndex + 1} / {p.images.length}
                        </div>
                     )}
                  </div>

                  {/* Thumbnails */}
                  {hasImages && p.images.length > 1 && (
                     <div className="pv-thumbs">
                        {p.images.map((img, i) => (
                           <button
                              key={i}
                              className={`pv-thumb ${i === imgIndex ? "active" : ""}`}
                              onClick={() => setImgIndex(i)}
                           >
                              {isValidUrl(img)
                                 ? <img src={img} alt="" onError={(e) => { e.target.style.display = "none"; }} />
                                 : <div className="pv-thumb-broken"><ImageIcon size={12} color="rgba(255,255,255,0.2)" /></div>}
                           </button>
                        ))}
                     </div>
                  )}
               </div>

               {/* ── RIGHT: Details ── */}
               <div className="pv-details">

                  {/* Status + Rating */}
                  <div className="pv-top-meta">
                     <span className="pv-status-badge" style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}>
                        <span className="pv-status-dot" style={{ background: meta.color }} />
                        {meta.label}
                     </span>
                     <div className="pv-rating">
                        <Stars rating={p.rating} />
                        <span className="pv-rating-num">
                           {p.rating > 0 ? p.rating.toFixed(1) : "No ratings yet"}
                        </span>
                     </div>
                  </div>

                  {/* Name */}
                  <h1 className="pv-name">{p.name}</h1>

                  {/* Price block */}
                  <div className="pv-price-block">
                     <span className="pv-final-price">
                        ₹{Number(p.finalPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                     </span>
                     {p.discount > 0 && (
                        <>
                           <span className="pv-original-price">₹{Number(p.price).toLocaleString("en-IN")}</span>
                           <span className="pv-disc-pill">-{p.discount}% OFF</span>
                        </>
                     )}
                  </div>

                  {/* Description */}
                  {p.description && (
                     <div className="pv-desc-block">
                        <div className="pv-desc-label">Description</div>
                        <p className="pv-desc">{p.description}</p>
                     </div>
                  )}

                  {/* Action buttons */}
                  <div className="pv-actions">
                     <button className="pv-btn-edit" onClick={() => navigate(`/product/edit/${p._id}`)}>
                        <Edit3 size={14} /> Edit Product
                     </button>
                     <button className="pv-btn-delete" onClick={() => navigate(`/product/delete/${p._id}`)}>
                        <Trash2 size={14} /> Delete
                     </button>
                  </div>

                  {/* Info card */}
                  <div className="pv-info-card">
                     <div className="pv-info-card-title">Product Details</div>

                     <InfoRow icon={<DollarSign size={13} />} label="Base Price"
                        value={`₹${Number(p.price).toLocaleString("en-IN")}`} />

                     <InfoRow icon={<Tag size={13} />} label="Discount"
                        value={p.discount > 0 ? `${p.discount}%` : "No discount"}
                        valueStyle={{ color: p.discount > 0 ? "#00c6ff" : "rgba(255,255,255,0.4)" }} />

                     <InfoRow icon={<DollarSign size={13} />} label="Final Price"
                        value={`₹${Number(p.finalPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                        valueStyle={{ color: "#22c55e", fontWeight: 700 }} />

                     {/* Stock with bar */}
                     <div className="pv-info-row">
                        <div className="pv-info-icon"><Layers size={13} /></div>
                        <div style={{ flex: 1 }}>
                           <span className="pv-info-label">Stock</span>
                           <span className="pv-info-value">{p.stock} units</span>
                           <div className="pv-stock-bar-bg">
                              <div
                                 className="pv-stock-bar-fill"
                                 style={{
                                    width: `${Math.min(100, (p.stock / 200) * 100)}%`,
                                    background: p.stock <= 5 ? "#f87171" : p.stock <= 20 ? "#f59e0b" : "linear-gradient(90deg,#00c6ff,#22c55e)",
                                 }}
                              />
                           </div>
                           <span className="pv-stock-note" style={{ color: p.stock === 0 ? "#f87171" : p.stock <= 5 ? "#f59e0b" : "rgba(255,255,255,0.28)" }}>
                              {p.stock === 0 ? "⚠ Out of stock" : p.stock <= 5 ? `⚡ Only ${p.stock} left` : "✓ In stock"}
                           </span>
                        </div>
                     </div>

                     <InfoRow icon={<BarChart2 size={13} />} label="Rating"
                        value={p.rating > 0 ? `${p.rating} / 5.0` : "Not rated yet"}
                        valueStyle={{ color: p.rating > 0 ? "#f59e0b" : "rgba(255,255,255,0.35)" }} />

                     <InfoRow icon={<ImageIcon size={13} />} label="Images"
                        value={p.images.length > 0 ? `${p.images.length} image${p.images.length > 1 ? "s" : ""}` : "No images"} />

                     <InfoRow icon={<Shield size={13} />} label="Seller ID"
                        value={p.sellerId}
                        valueStyle={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.4)" }} />
                  </div>

                  {/* Timestamps */}
                  <div className="pv-timestamps">
                     <div className="pv-ts">
                        <Clock size={10} />
                        Added {formatDate(p.createdAt)} at {formatTime(p.createdAt)}
                     </div>
                     {p.updatedAt !== p.createdAt && (
                        <>
                           <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                           <div className="pv-ts">
                              <Clock size={10} />
                              Updated {formatDate(p.updatedAt)}
                           </div>
                        </>
                     )}
                  </div>

               </div>
            </div>
         </div>
      </Shell>
   );
}

/* ── Shell (nav + bg) ── */
function Shell({ children, product, navigate }) {
   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .pv-root{min-height:100vh;background:#020408;font-family:'DM Sans',sans-serif;color:#fff;overflow-x:hidden;}
        .pv-bg{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,198,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,198,255,0.03) 1px,transparent 1px);background-size:60px 60px;}
        .pv-orb1{position:fixed;width:500px;height:500px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(0,198,255,0.09) 0%,transparent 68%);top:-200px;left:-160px;}
        .pv-orb2{position:fixed;width:400px;height:400px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 68%);bottom:-120px;right:-110px;}

        /* NAV */
        .pv-nav{position:sticky;top:0;z-index:100;height:60px;padding:0 28px;display:flex;align-items:center;gap:10px;background:rgba(2,4,8,0.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);}
        .pv-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;}
        .pv-nav-logo-box{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#00c6ff,#a855f7);display:flex;align-items:center;justify-content:center;}
        .pv-nav-logo-text{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;background:linear-gradient(135deg,#fff 40%,#00c6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .pv-nav-sep{color:rgba(255,255,255,0.15);margin:0 2px;}
        .pv-nav-page{font-size:13px;color:rgba(255,255,255,0.38);}
        .pv-nav-spacer{flex:1;}
        .pv-nav-actions{display:flex;gap:8px;}
        .pv-nav-btn-edit{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:none;background:linear-gradient(135deg,#00c6ff,#a855f7);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#020408;transition:opacity 0.2s;}
        .pv-nav-btn-edit:hover{opacity:0.9;}
        .pv-nav-btn-delete{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:1px solid rgba(248,113,113,0.3);background:rgba(248,113,113,0.08);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#f87171;transition:background 0.18s;}
        .pv-nav-btn-delete:hover{background:rgba(248,113,113,0.16);}

        /* PAGE */
        .pv-page{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:36px 24px 100px;animation:pv-in 0.35s ease;}
        @keyframes pv-in{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}

        /* BACK */
        .pv-back{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);margin-bottom:28px;transition:all 0.18s;}
        .pv-back:hover{background:rgba(255,255,255,0.07);color:#fff;border-color:rgba(255,255,255,0.18);}

        /* STATES */
        .pv-loading{display:flex;align-items:center;justify-content:center;min-height:420px;gap:12px;color:rgba(255,255,255,0.4);font-size:14px;}
        .pv-spin{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,0.1);border-top-color:#00c6ff;animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .pv-err-state{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:14px;text-align:center;}
        .pv-err-icon{width:58px;height:58px;border-radius:50%;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);display:flex;align-items:center;justify-content:center;}
        .pv-err-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:#fff;}
        .pv-err-sub{font-size:13px;color:rgba(255,255,255,0.38);}

        /* MAIN GRID */
        .pv-grid{display:grid;grid-template-columns:1fr 420px;gap:32px;align-items:start;}
        @media(max-width:820px){.pv-grid{grid-template-columns:1fr;}}

        /* GALLERY */
        .pv-gallery{position:sticky;top:80px;}
        .pv-img-main{position:relative;border-radius:20px;overflow:hidden;aspect-ratio:4/3;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:12px;}
        .pv-img-placeholder{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;}
        .pv-img-placeholder-label{font-size:12px;color:rgba(255,255,255,0.2);font-family:monospace;text-align:center;padding:0 16px;word-break:break-all;}
        .pv-arrow{position:absolute;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,0.14);background:rgba(2,4,8,0.72);backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.7);transition:background 0.18s,color 0.18s;}
        .pv-arrow:hover{background:rgba(255,255,255,0.12);color:#fff;}
        .pv-arrow.left{left:12px;}
        .pv-arrow.right{right:12px;}
        .pv-dots{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:5px;}
        .pv-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.3);border:none;cursor:pointer;transition:background 0.18s,width 0.18s;}
        .pv-dot.active{background:#00c6ff;width:18px;border-radius:3px;}
        .pv-img-count-badge{position:absolute;top:12px;right:12px;display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;background:rgba(2,4,8,0.7);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);font-size:11px;color:rgba(255,255,255,0.55);}
        .pv-thumbs{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;}
        .pv-thumbs::-webkit-scrollbar{height:3px;}
        .pv-thumbs::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.14);border-radius:2px;}
        .pv-thumb{width:64px;height:64px;border-radius:11px;overflow:hidden;flex-shrink:0;cursor:pointer;border:2px solid transparent;transition:border-color 0.18s,opacity 0.18s;opacity:0.5;background:rgba(255,255,255,0.04);}
        .pv-thumb.active{border-color:#00c6ff;opacity:1;}
        .pv-thumb:hover{opacity:0.8;}
        .pv-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
        .pv-thumb-broken{width:100%;height:100%;display:flex;align-items:center;justify-content:center;}

        /* DETAILS */
        .pv-top-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:14px;}
        .pv-status-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 13px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;}
        .pv-status-dot{width:7px;height:7px;border-radius:50%;}
        .pv-rating{display:flex;align-items:center;gap:7px;}
        .pv-rating-num{font-size:12px;color:rgba(255,255,255,0.35);font-weight:600;}

        .pv-name{font-family:'Syne',sans-serif;font-size:clamp(20px,3vw,28px);font-weight:800;color:#fff;letter-spacing:-0.7px;line-height:1.2;margin-bottom:16px;}

        .pv-price-block{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;margin-bottom:20px;}
        .pv-final-price{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;color:#fff;}
        .pv-original-price{font-size:16px;color:rgba(255,255,255,0.28);text-decoration:line-through;align-self:center;}
        .pv-disc-pill{padding:4px 11px;border-radius:20px;background:rgba(0,198,255,0.12);border:1px solid rgba(0,198,255,0.25);font-size:12px;font-weight:700;color:#00c6ff;align-self:center;}

        .pv-desc-block{margin-bottom:22px;}
        .pv-desc-label{font-size:10px;font-weight:700;letter-spacing:0.9px;text-transform:uppercase;color:rgba(255,255,255,0.32);margin-bottom:8px;}
        .pv-desc{font-size:14px;color:rgba(255,255,255,0.5);line-height:1.75;}

        .pv-actions{display:flex;gap:10px;margin-bottom:22px;flex-wrap:wrap;}
        .pv-btn-edit{flex:1;min-width:130px;padding:13px 20px;border-radius:13px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#020408;background:linear-gradient(135deg,#00c6ff,#a855f7);display:flex;align-items:center;justify-content:center;gap:8px;transition:transform 0.2s,box-shadow 0.2s;}
        .pv-btn-edit:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(0,198,255,0.28);}
        .pv-btn-delete{padding:13px 18px;border-radius:13px;border:1px solid rgba(248,113,113,0.28);background:rgba(248,113,113,0.07);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#f87171;display:flex;align-items:center;justify-content:center;gap:7px;transition:all 0.18s;}
        .pv-btn-delete:hover{background:rgba(248,113,113,0.14);border-color:rgba(248,113,113,0.45);transform:translateY(-1px);}

        /* INFO CARD */
        .pv-info-card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:18px;margin-bottom:18px;}
        .pv-info-card-title{font-size:10px;font-weight:700;letter-spacing:0.9px;text-transform:uppercase;color:rgba(255,255,255,0.28);margin-bottom:14px;}
        .pv-info-row{display:flex;align-items:flex-start;gap:11px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
        .pv-info-row:last-child{border-bottom:none;}
        .pv-info-icon{width:28px;height:28px;border-radius:8px;flex-shrink:0;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.28);margin-top:2px;}
        .pv-info-body{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0;}
        .pv-info-label{font-size:10px;font-weight:700;letter-spacing:0.7px;text-transform:uppercase;color:rgba(255,255,255,0.25);}
        .pv-info-value{font-size:13px;font-weight:600;color:rgba(255,255,255,0.8);word-break:break-all;}

        /* STOCK BAR */
        .pv-stock-bar-bg{height:3px;border-radius:2px;background:rgba(255,255,255,0.07);margin-top:7px;overflow:hidden;}
        .pv-stock-bar-fill{height:100%;border-radius:2px;transition:width 0.5s ease;}
        .pv-stock-note{font-size:11px;margin-top:5px;}

        /* TIMESTAMPS */
        .pv-timestamps{display:flex;gap:12px;flex-wrap:wrap;align-items:center;}
        .pv-ts{display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(255,255,255,0.22);}
      `}</style>

         <div className="pv-root">
            <div className="pv-bg" /><div className="pv-orb1" /><div className="pv-orb2" />

            <nav className="pv-nav">
               <a href="/" className="pv-nav-logo">
                  <div className="pv-nav-logo-box"><Zap size={16} color="#020408" strokeWidth={2.5} /></div>
                  <span className="pv-nav-logo-text">QuantumCart</span>
               </a>
               <span className="pv-nav-sep">/</span>
               <span className="pv-nav-page">{product ? product.name : "Product"}</span>
               <div className="pv-nav-spacer" />
               {product && navigate && (
                  <div className="pv-nav-actions">
                     <button className="pv-nav-btn-edit" onClick={() => navigate(`/product/edit/${product._id}`)}>
                        <Edit3 size={13} /> Edit
                     </button>
                     <button className="pv-nav-btn-delete" onClick={() => navigate(`/product/delete/${product._id}`)}>
                        <Trash2 size={13} /> Delete
                     </button>
                  </div>
               )}
            </nav>

            {children}
         </div>
      </>
   );
}