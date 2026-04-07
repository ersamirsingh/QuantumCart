import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Zap, Package, ChevronRight, X, AlertTriangle, ShoppingBag,
  CheckCircle, Clock, Truck, XCircle, RefreshCw, MapPin,
  CreditCard, Calendar, Hash, RotateCcw, User, Mail,
} from "lucide-react";
import {
  fetchOrders, cancelOrder, clearSuccessMessage,
} from "../../store/slices/order.slice";
import LoadingPage from "../../components/LoadingPage";

const formatPrice = (p) => `₹${Number(p).toLocaleString("en-IN")}`;
const formatDate  = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });


const STATUS = {
  PLACED:     { label: "Placed",     icon: Clock,       color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
  PENDING:    { label: "Pending",    icon: Clock,       color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
  CONFIRMED:  { label: "Confirmed",  icon: CheckCircle, color: "#00c6ff", bg: "rgba(0,198,255,0.08)",  border: "rgba(0,198,255,0.2)"    },
  PROCESSING: { label: "Processing", icon: RefreshCw,   color: "#a855f7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)"   },
  SHIPPED:    { label: "Shipped",    icon: Truck,       color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)"   },
  DELIVERED:  { label: "Delivered",  icon: CheckCircle, color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)"    },
  CANCELLED:  { label: "Cancelled",  icon: XCircle,     color: "#f87171", bg: "rgba(248,113,113,0.08)",border: "rgba(248,113,113,0.2)"  },
};


const normalise = (order) => ({
  ...order,
  _status:  order.orderStatus  ?? order.status   ?? "PLACED",
  _total:   order.totalAmount  ?? order.totalPrice ?? 0,
  _address: order.shippingAddress?.addresses?.[0] ?? null,
  _user:    typeof order.userId === "object" ? order.userId : null,
});



function StatusBadge({ status }) {
  const cfg  = STATUS[status] || STATUS.PLACED;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 20,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.color, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}


function OrderDetail({ order: rawOrder, onClose }) {
  const dispatch = useDispatch();
  const { cancelling, cancelError } = useSelector((s) => s.orders);
  const order = normalise(rawOrder);

  const canCancel = ["PLACED", "PENDING", "CONFIRMED"].includes(order._status);

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      dispatch(cancelOrder(order._id));
    }
  };

  // Item subtotal (productId is a string, use item.price)
  const itemsSubtotal = (order.items || []).reduce(
    (s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0
  );

  return (
    <div className="ord-drawer-overlay" onClick={onClose}>
      <div className="ord-drawer" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="ord-drawer-header">
          <div>
            <div className="ord-drawer-title">Order Details</div>
            <div className="ord-drawer-id">#{order._id?.slice(-10).toUpperCase()}</div>
          </div>
          <button className="ord-drawer-close" onClick={onClose}><X size={18} /></button>
        </div>

        {cancelError && (
          <div className="ord-error" style={{ margin: "12px 20px 0" }}>
            <AlertTriangle size={14} /> {cancelError}
          </div>
        )}

        <div className="ord-drawer-body">

          {/* Status + Date */}
          <div className="ord-detail-row">
            <StatusBadge status={order._status} />
            <span className="ord-detail-date">
              <Calendar size={12} /> {formatDate(order.createdAt)}
            </span>
          </div>

          {/* Customer — userId is populated object */}
          {order._user && (
            <div className="ord-detail-section">
              <div className="ord-detail-section-title"><User size={12} /> Customer</div>
              <div className="ord-detail-meta-row">
                <span className="ord-detail-meta-label">Name</span>
                <span className="ord-detail-meta-value">{order._user.name}</span>
              </div>
              <div className="ord-detail-meta-row">
                <span className="ord-detail-meta-label">Email</span>
                <span className="ord-detail-meta-value" style={{ fontSize: 12 }}>{order._user.email}</span>
              </div>
              <div className="ord-detail-meta-row">
                <span className="ord-detail-meta-label">Role</span>
                <span className="ord-detail-meta-value">{order._user.role}</span>
              </div>
            </div>
          )}

          {/* Items — productId is a string (not populated) */}
          <div className="ord-detail-section">
            <div className="ord-detail-section-title"><Package size={12} /> Items Ordered</div>
            {(order.items || []).map((item, idx) => {
              const isPopulated = typeof item.productId === "object" && item.productId !== null;
              const name  = isPopulated ? item.productId.name  : `Product #${String(item.productId).slice(-6).toUpperCase()}`;
              const price = isPopulated ? item.productId.price : (item.price ?? 0);
              const imgs  = isPopulated ? (item.productId.images ?? []) : [];

              return (
                <div key={item._id ?? idx} className="ord-detail-item">
                  <div className="ord-detail-img-wrap">
                    {imgs[0]
                      ? <img src={imgs[0]} alt={name} className="ord-detail-img"
                             onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      : <div className="ord-detail-img-empty">
                          <Package size={16} color="rgba(0,198,255,0.5)" />
                        </div>
                    }
                  </div>
                  <div className="ord-detail-item-info">
                    <div className="ord-detail-item-name">{name}</div>
                    <div className="ord-detail-item-meta">
                      Qty: {item.quantity} × {formatPrice(price)}
                    </div>
                  </div>
                  <div className="ord-detail-item-price">
                    {formatPrice(price * item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shipping address — shippingAddress.addresses[0] */}
          {order._address && (
            <div className="ord-detail-section">
              <div className="ord-detail-section-title"><MapPin size={12} /> Delivery Address</div>
              <div className="ord-detail-meta-text">
                <strong style={{ color: "#fff" }}>{order._address.fullName}</strong>{" "}
                · {order._address.phone}<br />
                {order._address.line1}
                {order._address.line2 ? `, ${order._address.line2}` : ""}<br />
                {order._address.city}, {order._address.state} — {order._address.pincode}
                {order._address.country && (
                  <><br /><span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{order._address.country}</span></>
                )}
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="ord-detail-section">
            <div className="ord-detail-section-title"><CreditCard size={12} /> Payment</div>
            <div className="ord-detail-meta-row">
              <span className="ord-detail-meta-label">Method</span>
              <span className="ord-detail-meta-value">{order.paymentMethod ?? "COD"}</span>
            </div>
            <div className="ord-detail-meta-row">
              <span className="ord-detail-meta-label">Status</span>
              <span className="ord-detail-meta-value" style={{
                color: order.paymentStatus === "PAID" ? "#22c55e" : "#f59e0b",
              }}>
                {order.paymentStatus ?? "PENDING"}
              </span>
            </div>
          </div>

          {/* Price breakdown — totalAmount from API */}
          <div className="ord-detail-section">
            <div className="ord-detail-section-title">Price Breakdown</div>
            <div className="ord-detail-meta-row">
              <span className="ord-detail-meta-label">
                Items ({order.items?.length ?? 0})
              </span>
              <span className="ord-detail-meta-value">{formatPrice(itemsSubtotal)}</span>
            </div>
            {order._total !== itemsSubtotal && (
              <div className="ord-detail-meta-row">
                <span className="ord-detail-meta-label">Other charges</span>
                <span className="ord-detail-meta-value">
                  {formatPrice(order._total - itemsSubtotal)}
                </span>
              </div>
            )}
            <div className="ord-detail-meta-row ord-detail-total-row">
              <span className="ord-detail-total-label">Total</span>
              <span className="ord-detail-total-value">{formatPrice(order._total)}</span>
            </div>
          </div>

          {/* Tracking (future) */}
          {order._status === "SHIPPED" && order.trackingId && (
            <div className="ord-detail-section ord-tracking">
              <div className="ord-detail-section-title"><Truck size={12} /> Tracking</div>
              <div className="ord-tracking-id"><Hash size={11} /> {order.trackingId}</div>
            </div>
          )}

          {/* Cancel */}
          {canCancel && (
            <button className="ord-cancel-btn" onClick={handleCancel} disabled={cancelling}>
              {cancelling
                ? <><div className="ord-spin" style={{ width: 14, height: 14 }} /> Cancelling…</>
                : <><RotateCcw size={14} /> Cancel Order</>
              }
            </button>
          )}

        </div>
      </div>
    </div>
  );
}



const FILTERS = ["ALL", "PLACED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orders, ordersLoading, ordersError, successMessage } = useSelector((s) => s.orders);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => dispatch(clearSuccessMessage()), 2500);
      return () => clearTimeout(t);
    }
  }, [successMessage, dispatch]);

  const normalisedOrders = (orders ?? []).map(normalise);
  const filtered = filter === "ALL"
    ? normalisedOrders
    : normalisedOrders.filter((o) => o._status === filter);

  if (ordersLoading) return <LoadingPage />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .ord-root{min-height:100vh;background:#020408;font-family:'DM Sans',sans-serif;color:#fff;overflow-x:hidden;}
        .ord-bg{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,198,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,198,255,0.03) 1px,transparent 1px);background-size:60px 60px;}
        .ord-orb1{position:fixed;width:500px;height:500px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(0,198,255,0.09) 0%,transparent 68%);top:-180px;left:-150px;}
        .ord-orb2{position:fixed;width:380px;height:380px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 68%);bottom:-120px;right:-100px;}

        .ord-nav{position:sticky;top:0;z-index:100;height:60px;padding:0 28px;display:flex;align-items:center;gap:10px;background:rgba(2,4,8,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);}
        .ord-nav-logo{display:flex;align-items:center;gap:8px;cursor:pointer;}
        .ord-nav-logo-box{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#00c6ff,#a855f7);display:flex;align-items:center;justify-content:center;}
        .ord-nav-logo-text{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;background:linear-gradient(135deg,#fff 40%,#00c6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .ord-nav-sep{color:rgba(255,255,255,0.15);margin:0 4px;}
        .ord-nav-page{font-size:13px;color:rgba(255,255,255,0.38);}
        .ord-nav-spacer{flex:1;}
        .ord-nav-back{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:transparent;cursor:pointer;font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);transition:all 0.18s;}
        .ord-nav-back:hover{background:rgba(255,255,255,0.05);color:#fff;}

        .ord-page{position:relative;z-index:1;max-width:880px;margin:0 auto;padding:36px 24px 100px;}
        .ord-header{margin-bottom:28px;}
        .ord-title{font-family:'Syne',sans-serif;font-size:clamp(24px,3.5vw,32px);font-weight:800;letter-spacing:-0.8px;margin-bottom:6px;}
        .ord-title span{background:linear-gradient(135deg,#00c6ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .ord-subtitle{font-size:14px;color:rgba(255,255,255,0.38);}

        .ord-success{display:flex;align-items:center;gap:10px;padding:13px 16px;border-radius:13px;background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.2);color:#22c55e;font-size:13px;font-weight:600;margin-bottom:18px;animation:ord-slide-in 0.3s ease;}
        @keyframes ord-slide-in{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
        .ord-error{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:13px;background:rgba(248,113,113,0.07);border:1px solid rgba(248,113,113,0.2);color:#f87171;font-size:13px;font-weight:600;margin-bottom:18px;}

        .ord-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;}
        .ord-filter-btn{padding:7px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:rgba(255,255,255,0.4);transition:all 0.18s;white-space:nowrap;}
        .ord-filter-btn:hover{border-color:rgba(255,255,255,0.18);color:rgba(255,255,255,0.7);}
        .ord-filter-btn.active{background:rgba(0,198,255,0.1);border-color:rgba(0,198,255,0.35);color:#00c6ff;}

        .ord-list{display:flex;flex-direction:column;gap:14px;}
        .ord-card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:22px;cursor:pointer;transition:all 0.22s;animation:ord-card-in 0.3s ease both;}
        @keyframes ord-card-in{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .ord-card:hover{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.14);transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.3);}
        .ord-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px;}
        .ord-card-id{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;}
        .ord-card-id span{color:rgba(255,255,255,0.3);font-weight:400;font-size:12px;margin-left:4px;}
        .ord-card-date{font-size:12px;color:rgba(255,255,255,0.3);display:flex;align-items:center;gap:5px;margin-top:4px;flex-wrap:wrap;}

        /* Item pills (no images since productId is unpopulated string) */
        .ord-card-items{display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;}
        .ord-item-pill{display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);}
        .ord-item-pill-dot{width:22px;height:22px;border-radius:6px;background:rgba(0,198,255,0.07);border:1px solid rgba(0,198,255,0.13);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .ord-item-pill-name{font-size:11px;color:rgba(255,255,255,0.5);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .ord-item-pill-qty{font-size:11px;font-weight:800;color:#00c6ff;flex-shrink:0;}
        .ord-card-more{font-size:12px;color:rgba(255,255,255,0.28);white-space:nowrap;}

        .ord-card-bottom{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;}
        .ord-card-total{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;background:linear-gradient(135deg,#00c6ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .ord-card-meta{font-size:12px;color:rgba(255,255,255,0.28);margin-top:3px;}
        .ord-card-arrow{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:rgba(0,198,255,0.65);}

        .ord-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:360px;gap:16px;text-align:center;}
        .ord-empty-icon{width:72px;height:72px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;}
        .ord-empty-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;}
        .ord-empty-sub{font-size:14px;color:rgba(255,255,255,0.36);max-width:280px;line-height:1.6;}
        .ord-empty-btn{display:flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#00c6ff,#a855f7);cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#020408;transition:transform 0.2s;}
        .ord-empty-btn:hover{transform:translateY(-1px);}

        /* DRAWER */
        .ord-drawer-overlay{position:fixed;inset:0;z-index:200;background:rgba(2,4,8,0.75);backdrop-filter:blur(8px);display:flex;align-items:stretch;justify-content:flex-end;animation:overlay-in 0.2s ease;}
        @keyframes overlay-in{from{opacity:0;}to{opacity:1;}}
        .ord-drawer{width:100%;max-width:500px;height:100%;background:#080d16;border-left:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;overflow:hidden;animation:drawer-in 0.3s cubic-bezier(0.34,1.1,0.64,1);}
        @keyframes drawer-in{from{transform:translateX(60px);opacity:0;}to{transform:translateX(0);opacity:1;}}
        @media(max-width:540px){.ord-drawer{max-width:100%;}}

        .ord-drawer-header{display:flex;align-items:flex-start;justify-content:space-between;padding:24px 24px 16px;border-bottom:1px solid rgba(255,255,255,0.07);flex-shrink:0;}
        .ord-drawer-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;margin-bottom:4px;}
        .ord-drawer-id{font-size:11px;color:rgba(255,255,255,0.25);letter-spacing:0.08em;}
        .ord-drawer-close{width:34px;height:34px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.5);transition:all 0.15s;flex-shrink:0;}
        .ord-drawer-close:hover{background:rgba(255,255,255,0.07);color:#fff;}

        .ord-drawer-body{flex:1;overflow-y:auto;padding:20px 24px 32px;}
        .ord-drawer-body::-webkit-scrollbar{width:3px;}
        .ord-drawer-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px;}

        .ord-detail-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:8px;}
        .ord-detail-date{display:flex;align-items:center;gap:5px;font-size:12px;color:rgba(255,255,255,0.3);}

        .ord-detail-section{margin-bottom:14px;padding:16px;border-radius:14px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);}
        .ord-detail-section-title{font-size:10px;font-weight:700;color:rgba(255,255,255,0.28);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:6px;}
        .ord-detail-item{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
        .ord-detail-item:last-child{border-bottom:none;padding-bottom:0;}
        .ord-detail-img-wrap{width:44px;height:44px;border-radius:10px;overflow:hidden;flex-shrink:0;}
        .ord-detail-img{width:100%;height:100%;object-fit:cover;}
        .ord-detail-img-empty{width:100%;height:100%;background:rgba(0,198,255,0.05);border:1px solid rgba(0,198,255,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;}
        .ord-detail-item-info{flex:1;min-width:0;}
        .ord-detail-item-name{font-size:13px;font-weight:700;color:#fff;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .ord-detail-item-meta{font-size:11px;color:rgba(255,255,255,0.3);}
        .ord-detail-item-price{font-family:'Syne',sans-serif;font-size:13px;font-weight:800;color:#fff;white-space:nowrap;}

        .ord-detail-meta-text{font-size:13px;color:rgba(255,255,255,0.55);line-height:1.8;}
        .ord-detail-meta-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
        .ord-detail-meta-row:last-child{border-bottom:none;}
        .ord-detail-meta-label{font-size:12px;color:rgba(255,255,255,0.32);}
        .ord-detail-meta-value{font-size:13px;font-weight:700;color:rgba(255,255,255,0.75);}
        .ord-detail-total-row{padding-top:10px !important;border-top:1px solid rgba(255,255,255,0.08)!important;margin-top:4px;}
        .ord-detail-total-label{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;}
        .ord-detail-total-value{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;background:linear-gradient(135deg,#00c6ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}

        .ord-tracking{background:rgba(59,130,246,0.05);border-color:rgba(59,130,246,0.18);}
        .ord-tracking-id{font-size:13px;color:#3b82f6;font-weight:700;display:flex;align-items:center;gap:6px;}

        .ord-cancel-btn{width:100%;margin-top:8px;padding:13px;border-radius:12px;border:1px solid rgba(248,113,113,0.25);background:rgba(248,113,113,0.06);cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#f87171;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.18s;}
        .ord-cancel-btn:hover:not(:disabled){background:rgba(248,113,113,0.12);border-color:rgba(248,113,113,0.4);}
        .ord-cancel-btn:disabled{opacity:0.4;cursor:not-allowed;}

        .ord-spin{border-radius:50%;border:2px solid rgba(255,255,255,0.1);border-top-color:#00c6ff;animation:spin 0.8s linear infinite;flex-shrink:0;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      <div className="ord-root">
        <div className="ord-bg" /><div className="ord-orb1" /><div className="ord-orb2" />

        <nav className="ord-nav">
          <div className="ord-nav-logo" onClick={() => navigate("/")}>
            <div className="ord-nav-logo-box">
              <Zap size={16} color="#020408" strokeWidth={2.5} />
            </div>
            <span className="ord-nav-logo-text">myShop</span>
          </div>
          <span className="ord-nav-sep">/</span>
          <span className="ord-nav-page">My Orders</span>
          <div className="ord-nav-spacer" />
          <button className="ord-nav-back" onClick={() => navigate("/products")}>
            <ShoppingBag size={14} /> Shop More
          </button>
        </nav>

        <div className="ord-page">
          <div className="ord-header">
            <h1 className="ord-title">My <span>Orders</span></h1>
            <p className="ord-subtitle">
              {normalisedOrders.length} order{normalisedOrders.length !== 1 ? "s" : ""} placed
            </p>
          </div>

          {successMessage && <div className="ord-success"><CheckCircle size={15} /> {successMessage}</div>}
          {ordersError    && <div className="ord-error"><AlertTriangle size={15} /> {ordersError}</div>}

          {/* FILTERS */}
          <div className="ord-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`ord-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "ALL" ? "All Orders" : STATUS[f]?.label ?? f}
                {f !== "ALL" && (
                  <span style={{ marginLeft: 4, opacity: 0.5 }}>
                    ({normalisedOrders.filter((o) => o._status === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* LIST */}
          {filtered.length === 0 ? (
            <div className="ord-empty">
              <div className="ord-empty-icon"><Package size={32} color="rgba(255,255,255,0.15)" /></div>
              <h2 className="ord-empty-title">No orders yet</h2>
              <p className="ord-empty-sub">
                {filter === "ALL"
                  ? "You haven't placed any orders. Start shopping!"
                  : `No ${STATUS[filter]?.label?.toLowerCase()} orders found.`}
              </p>
              <button className="ord-empty-btn" onClick={() => navigate("/products")}>
                <ShoppingBag size={15} /> Browse Products
              </button>
            </div>
          ) : (
            <div className="ord-list">
              {filtered.map((order, oi) => {
                const items      = order.items || [];
                const showItems  = items.slice(0, 3);
                const extraCount = items.length - showItems.length;
                const city       = order._address?.city;

                return (
                  <div
                    key={order._id}
                    className="ord-card"
                    style={{ animationDelay: `${oi * 0.05}s` }}
                    onClick={() => setSelectedOrder(order)}
                  >
                    {/* Top */}
                    <div className="ord-card-top">
                      <div>
                        <div className="ord-card-id">
                          Order <span>#{order._id?.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="ord-card-date">
                          <Calendar size={11} /> {formatDate(order.createdAt)}
                          {city && <span style={{ color: "rgba(255,255,255,0.2)" }}>· 📍 {city}</span>}
                        </div>
                      </div>
                      <StatusBadge status={order._status} />
                    </div>

                    {/* Item pills */}
                    <div className="ord-card-items">
                      {showItems.map((item, ii) => {
                        const isObj  = typeof item.productId === "object" && item.productId !== null;
                        const label  = isObj
                          ? item.productId.name
                          : `#${String(item.productId).slice(-5).toUpperCase()}`;
                        return (
                          <div key={item._id ?? ii} className="ord-item-pill">
                            <div className="ord-item-pill-dot">
                              <Package size={11} color="#00c6ff" />
                            </div>
                            <span className="ord-item-pill-name">{label}</span>
                            <span className="ord-item-pill-qty">×{item.quantity}</span>
                          </div>
                        );
                      })}
                      {extraCount > 0 && <span className="ord-card-more">+{extraCount} more</span>}
                    </div>

                    {/* Bottom */}
                    <div className="ord-card-bottom">
                      <div>
                        <div className="ord-card-total">{formatPrice(order._total)}</div>
                        <div className="ord-card-meta">
                          {items.length} item{items.length !== 1 ? "s" : ""}
                          {order.paymentStatus && ` · Payment: ${order.paymentStatus}`}
                        </div>
                      </div>
                      <div className="ord-card-arrow">
                        View Details <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
}