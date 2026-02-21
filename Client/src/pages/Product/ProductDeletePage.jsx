import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Zap, ArrowLeft, Trash2, AlertTriangle, Package,
  X, CheckCircle, Layers, DollarSign, Tag, Image,
  ShieldOff, BarChart2,
} from "lucide-react";
import axiosClient from "../../API/axiosClient";
import LoadingPage from "../../components/LoadingPage";

/* ── Status meta ── */
const STATUS_META = {
  ACTIVE: { label: "Active", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
  OUT_OF_STOCK: { label: "Out of Stock", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  BLOCKED: { label: "Blocked", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
};



const CONSEQUENCES = [
  { icon: <Package size={14} />, text: "Product listing removed from your store immediately" },
  { icon: <Image size={14} />, text: "All product images and media permanently deleted" },
  { icon: <BarChart2 size={14} />, text: "Sales analytics and performance data erased" },
  { icon: <ShieldOff size={14} />, text: "Active customer wishlists containing this item updated" },
  { icon: <Layers size={14} />, text: "Inventory record for this SKU will be lost" },
];

export default function ProductDeletePage() {
  
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosClient.get(`/product/${id}`, { credentials:"include" });
        setProduct(res.data);
        setSuccess(true);
      } catch (e) {
        alert(e.message || "Failed to load product");
        setFetchError(e.message || "Product not found");
      } finally {
        setLoading(false);
      }
    };
    if(!success) load();
  }, [id, success]);

  const handleDelete = async () => {

    if (typed !== "DELETE") 
      return;
    setDeleting(true);
    setDeleteError("");

    try {
      await axiosClient.delete(`/product/${product._id}`);
      setDeleted(true);
      setSuccess(true)
      setTimeout(() => navigate("/seller/products"), 1000);
    } catch (e) {
      setDeleteError(e.message);
      setDeleting(false);
    }
  };

  const confirmed = typed === "DELETE";
  const statusMeta = STATUS_META[product?.status] || STATUS_META.ACTIVE;

  if(loading) return <LoadingPage/>

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .del-root{min-height:100vh;background:#020408;font-family:'DM Sans',sans-serif;color:#fff;overflow-x:hidden;}

        /* BG */
        .del-bg{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(248,113,113,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(248,113,113,0.025) 1px,transparent 1px);background-size:60px 60px;}
        .del-orb1{position:fixed;width:500px;height:500px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(220,38,38,0.08) 0%,transparent 68%);top:-200px;right:-160px;}
        .del-orb2{position:fixed;width:380px;height:380px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(248,113,113,0.05) 0%,transparent 68%);bottom:-120px;left:-100px;}

        /* NAV */
        .del-nav{position:sticky;top:0;z-index:100;height:60px;padding:0 28px;display:flex;align-items:center;gap:10px;background:rgba(2,4,8,0.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(248,113,113,0.1);}
        .del-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;}
        .del-nav-logo-box{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#dc2626,#f87171);display:flex;align-items:center;justify-content:center;}
        .del-nav-logo-text{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;background:linear-gradient(135deg,#fff 40%,#f87171);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .del-nav-sep{color:rgba(255,255,255,0.15);margin:0 2px;}
        .del-nav-page{font-size:13px;color:rgba(248,113,113,0.6);font-weight:600;}
        .del-nav-spacer{flex:1;}

        /* PAGE */
        .del-page{position:relative;z-index:1;max-width:780px;margin:0 auto;padding:36px 24px 100px;animation:del-in 0.35s ease;}
        @keyframes del-in{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}

        .del-back{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);margin-bottom:28px;transition:all 0.18s;}
        .del-back:hover{background:rgba(255,255,255,0.07);color:#fff;border-color:rgba(255,255,255,0.18);}

        /* LOADING */
        .del-loading{display:flex;align-items:center;justify-content:center;min-height:380px;gap:12px;color:rgba(255,255,255,0.4);font-size:14px;}
        .del-spin{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,0.1);border-top-color:#f87171;animation:spin 0.8s linear infinite;flex-shrink:0;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .del-spin.white{border-color:rgba(255,255,255,0.2);border-top-color:#fff;}

        /* ERROR */
        .del-fetch-err{display:flex;flex-direction:column;align-items:center;gap:14px;min-height:380px;justify-content:center;text-align:center;}
        .del-fetch-err h2{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#fff;}
        .del-fetch-err p{font-size:13px;color:rgba(255,255,255,0.38);}

        /* WARNING HEADER */
        .del-warn-header{display:flex;align-items:center;gap:14px;padding:18px 22px;border-radius:16px;background:rgba(220,38,38,0.07);border:1px solid rgba(220,38,38,0.2);margin-bottom:24px;}
        .del-warn-icon{width:44px;height:44px;border-radius:50%;background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .del-warn-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#f87171;margin-bottom:3px;}
        .del-warn-sub{font-size:13px;color:rgba(248,113,113,0.6);line-height:1.5;}

        /* PRODUCT PREVIEW CARD */
        .del-preview{display:flex;gap:16px;align-items:flex-start;padding:20px;border-radius:18px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);margin-bottom:22px;}
        .del-preview-img{width:80px;height:80px;border-radius:12px;overflow:hidden;flex-shrink:0;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);}
        .del-preview-img img{width:100%;height:100%;object-fit:cover;}
        .del-preview-no-img{width:100%;height:100%;display:flex;align-items:center;justify-content:center;}
        .del-preview-info{flex:1;min-width:0;}
        .del-preview-name{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#fff;margin-bottom:6px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .del-preview-desc{font-size:12px;color:rgba(255,255,255,0.35);line-height:1.5;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .del-preview-meta{display:flex;gap:10px;flex-wrap:wrap;align-items:center;}
        .del-meta-chip{display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.55);}
        .del-status-chip{padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;}

        /* CONSEQUENCES */
        .del-consequences{border-radius:18px;overflow:hidden;margin-bottom:26px;}
        .del-cons-head{padding:14px 20px;background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.18);border-bottom:none;border-radius:18px 18px 0 0;display:flex;align-items:center;gap:9px;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;color:#f87171;}
        .del-cons-list{border:1px solid rgba(220,38,38,0.15);border-top:none;border-radius:0 0 18px 18px;background:rgba(255,255,255,0.018);}
        .del-con-item{display:flex;align-items:center;gap:12px;padding:13px 20px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:rgba(255,255,255,0.5);transition:background 0.15s;}
        .del-con-item:last-child{border-bottom:none;}
        .del-con-item:hover{background:rgba(248,113,113,0.03);}
        .del-con-icon{width:28px;height:28px;border-radius:7px;flex-shrink:0;background:rgba(248,113,113,0.08);display:flex;align-items:center;justify-content:center;color:#f87171;}
        .del-con-x{color:#f87171;font-size:11px;font-weight:800;flex-shrink:0;}

        /* CONFIRM INPUT SECTION */
        .del-confirm-card{background:rgba(255,255,255,0.025);border:1px solid rgba(248,113,113,0.15);border-radius:18px;padding:24px;margin-bottom:22px;}
        .del-confirm-label{font-size:13px;color:rgba(255,255,255,0.55);line-height:1.6;margin-bottom:16px;}
        .del-confirm-label strong{color:#fff;}
        .del-confirm-label code{background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);padding:2px 8px;border-radius:6px;color:#f87171;font-size:13px;font-family:'DM Sans',monospace;font-weight:700;letter-spacing:1px;}
        .del-input{width:100%;padding:13px 16px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(248,113,113,0.25);color:#fff;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;letter-spacing:3px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .del-input::placeholder{letter-spacing:0;font-weight:400;font-size:14px;color:rgba(255,255,255,0.2);}
        .del-input:focus{border-color:rgba(248,113,113,0.55);box-shadow:0 0 0 3px rgba(248,113,113,0.08);}
        .del-input.ready{border-color:rgba(220,38,38,0.6);box-shadow:0 0 0 3px rgba(220,38,38,0.1);}
        .del-input-hint{display:flex;justify-content:flex-end;font-size:11px;margin-top:7px;color:rgba(255,255,255,0.25);}
        .del-input-hint.ready{color:#f87171;font-weight:700;}

        /* DELETE ERROR */
        .del-error-banner{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;background:rgba(248,113,113,0.07);border:1px solid rgba(248,113,113,0.2);color:#f87171;font-size:13px;font-weight:600;margin-bottom:16px;}

        /* ACTION BUTTONS */
        .del-actions{display:flex;gap:10px;flex-wrap:wrap;}
        .del-btn-cancel{flex:1;min-width:120px;padding:14px 20px;border-radius:13px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:rgba(255,255,255,0.55);display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.18s,color 0.18s;}
        .del-btn-cancel:hover{background:rgba(255,255,255,0.08);color:#fff;}
        .del-btn-delete{flex:1.8;min-width:160px;padding:14px 20px;border-radius:13px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;background:linear-gradient(135deg,#7f1d1d,#dc2626);display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;position:relative;overflow:hidden;}
        .del-btn-delete::before{content:'';position:absolute;inset:0;background:rgba(255,255,255,0.1);opacity:0;transition:opacity 0.2s;}
        .del-btn-delete:hover:not(:disabled)::before{opacity:1;}
        .del-btn-delete:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 28px rgba(220,38,38,0.4);}
        .del-btn-delete:disabled{opacity:0.35;cursor:not-allowed;}
        .del-btn-delete.ready{background:linear-gradient(135deg,#dc2626,#f87171);}

        /* SUCCESS STATE */
        .del-success{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:420px;gap:18px;text-align:center;animation:del-in 0.4s ease;}
        .del-success-ring{width:80px;height:80px;border-radius:50%;background:rgba(34,197,94,0.1);border:2px solid rgba(34,197,94,0.3);display:flex;align-items:center;justify-content:center;animation:del-ping 0.5s ease;}
        @keyframes del-ping{0%{transform:scale(0.8);opacity:0;}100%{transform:scale(1);opacity:1;}}
        .del-success-title{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:#fff;}
        .del-success-sub{font-size:14px;color:rgba(255,255,255,0.4);max-width:300px;line-height:1.6;}
        .del-success-redirect{font-size:12px;color:rgba(255,255,255,0.25);display:flex;align-items:center;gap:6px;}
        .del-redirect-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:blink 1s ease infinite;}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.3;}}
      `}</style>

      <div className="del-root">
        <div className="del-bg" /><div className="del-orb1" /><div className="del-orb2" />

        {/* NAV */}
        <nav className="del-nav">
          <a href="/" className="del-nav-logo">
            <div className="del-nav-logo-box"><Zap size={16} color="#fff" strokeWidth={2.5} /></div>
            <span className="del-nav-logo-text">QuantumCart</span>
          </a>
          <span className="del-nav-sep">/</span>
          <span className="del-nav-page">Delete Product</span>
          <div className="del-nav-spacer" />
        </nav>

        <div className="del-page">

          {!deleted && (
            <button className="del-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Back
            </button>
          )}

          {/* LOADING */}
          {loading && (
            <div className="del-loading">
              <div className="del-spin" /> Loading product…
            </div>
          )}

          {/* FETCH ERROR */}
          {!loading && fetchError && (
            <div className="del-fetch-err">
              <div className="del-warn-icon" style={{ width: 60, height: 60 }}>
                <AlertTriangle size={26} color="#f87171" />
              </div>
              <h2>Product Not Found</h2>
              <p>{fetchError}</p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {deleted && (
            <div className="del-success">
              <div className="del-success-ring">
                <CheckCircle size={36} color="#22c55e" />
              </div>
              <h2 className="del-success-title">Product Deleted</h2>
              <p className="del-success-sub">
                <strong style={{ color: "#fff" }}>{product?.name}</strong> has been permanently removed from your store.
              </p>
              <div className="del-success-redirect">
                <div className="del-redirect-dot" />
                Redirecting to your products…
              </div>
            </div>
          )}

          {/* DELETE FORM */}
          {!loading && !fetchError && !deleted && product && (
            <>
              {/* Warning header */}
              <div className="del-warn-header">
                <div className="del-warn-icon">
                  <AlertTriangle size={20} color="#f87171" />
                </div>
                <div>
                  <div className="del-warn-title">Permanent Action — Cannot Be Undone</div>
                  <div className="del-warn-sub">
                    You are about to permanently delete this product from your store. All associated data will be lost.
                  </div>
                </div>
              </div>

              {/* Product preview */}
              <div className="del-preview">
                <div className="del-preview-img">
                  {product.images?.[0]
                    ? <img src={product.images[0]} alt={product.name} />
                    : <div className="del-preview-no-img"><Package size={24} color="rgba(255,255,255,0.2)" /></div>}
                </div>
                <div className="del-preview-info">
                  <div className="del-preview-name">{product.name}</div>
                  {product.description && (
                    <div className="del-preview-desc">{product.description}</div>
                  )}
                  <div className="del-preview-meta">
                    <div className="del-meta-chip">
                      <DollarSign size={10} />
                      ₹{Number(product.finalPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="del-meta-chip">
                      <Layers size={10} />
                      {product.stock} in stock
                    </div>
                    {product.discount > 0 && (
                      <div className="del-meta-chip" style={{ color: "#00c6ff", borderColor: "rgba(0,198,255,0.15)", background: "rgba(0,198,255,0.06)" }}>
                        <Tag size={10} />
                        -{product.discount}%
                      </div>
                    )}
                    <div
                      className="del-status-chip"
                      style={{ background: statusMeta.bg, border: `1px solid ${statusMeta.border}`, color: statusMeta.color }}
                    >
                      {statusMeta.label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Consequences */}
              <div className="del-consequences">
                <div className="del-cons-head">
                  <AlertTriangle size={14} /> What will be deleted
                </div>
                <div className="del-cons-list">
                  {CONSEQUENCES.map((c, i) => (
                    <div className="del-con-item" key={i}>
                      <div className="del-con-icon">{c.icon}</div>
                      <span>{c.text}</span>
                      <span className="del-con-x" style={{ marginLeft: "auto" }}>✕</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm input */}
              <div className="del-confirm-card">
                <div className="del-confirm-label">
                  To confirm deletion of <strong>{product.name}</strong>, type{" "}
                  <code>DELETE</code> in the field below:
                </div>
                <input
                  className={`del-input ${confirmed ? "ready" : ""}`}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value.toUpperCase())}
                  placeholder="Type DELETE to confirm"
                  disabled={deleting}
                  autoFocus
                />
                <div className={`del-input-hint ${confirmed ? "ready" : ""}`}>
                  {confirmed ? "✓ Confirmed — you may now delete" : `${typed.length} / 6 characters`}
                </div>
              </div>

              {/* Delete error */}
              {deleteError && (
                <div className="del-error-banner">
                  <AlertTriangle size={15} /> {deleteError}
                </div>
              )}

              {/* Action buttons */}
              <div className="del-actions">
                <button className="del-btn-cancel" onClick={() => navigate(-1)} disabled={deleting}>
                  <X size={14} /> Keep Product
                </button>
                <button
                  className={`del-btn-delete ${confirmed ? "ready" : ""}`}
                  disabled={!confirmed || deleting}
                  onClick={handleDelete}
                >
                  {deleting
                    ? <><div className="del-spin white" /> Deleting…</>
                    : <><Trash2 size={15} /> Delete Permanently</>}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}