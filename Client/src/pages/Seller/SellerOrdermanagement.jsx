import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
   Zap, Search, Filter, ShoppingBag, Eye, MoreVertical,
   CheckCircle, XCircle, Truck, Clock, Package, ChevronDown,
   Download, RefreshCw, Calendar, MapPin, User, Mail, Phone
} from "lucide-react";
import axiosClient from "../../API/axiosClient";
import LoadingPage from "../../components/LoadingPage";


const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;
const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", {
   day: "numeric",
   month: "short",
   year: "numeric",
   hour: "2-digit",
   minute: "2-digit"
});

const ORDER_STATUS_META = {
   PLACED: { label: "Placed", color: "#06b6d4", bg: "rgba(6,182,212,0.1)", icon: Clock },
   CONFIRMED: { label: "Confirmed", color: "#00c6ff", bg: "rgba(0,198,255,0.1)", icon: CheckCircle },
   SHIPPED: { label: "Shipped", color: "#a855f7", bg: "rgba(168,85,247,0.1)", icon: Truck },
   DELIVERED: { label: "Delivered", color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: Package },
   CANCELLED: { label: "Cancelled", color: "#f87171", bg: "rgba(248,113,113,0.1)", icon: XCircle },
};

function OrderRow({ order, onConfirm, onCancel, onShip, onViewDetails }) {
   const [menuOpen, setMenuOpen] = useState(false);
   const meta = ORDER_STATUS_META[order.orderStatus] || ORDER_STATUS_META.PLACED;
   const Icon = meta.icon;

   return (
      <div className="som-order-row">
         <div className="som-order-cell som-order-id">
            <span className="som-order-num">#{order._id.slice(-8).toUpperCase()}</span>
            <span className="som-order-date">{formatDate(order.createdAt)}</span>
         </div>

         <div className="som-order-cell som-order-customer">
            <div className="som-customer-avatar">
               {order.userId?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
               <div className="som-customer-name">{order.userId?.name || "Unknown"}</div>
               <div className="som-customer-email">{order.userId?.email || "N/A"}</div>
            </div>
         </div>

         <div className="som-order-cell som-order-items">
            <span className="som-items-badge">{order.items?.length || 0} items</span>
         </div>

         <div className="som-order-cell som-order-amount">
            <span className="som-amount-value">{formatPrice(order.totalAmount)}</span>
         </div>

         <div className="som-order-cell som-order-payment">
            <span className={`som-payment-badge ${order.paymentStatus?.toLowerCase()}`}>
               {order.paymentStatus || "PENDING"}
            </span>
         </div>

         <div className="som-order-cell som-order-status">
            <span className="som-status-badge" style={{ background: meta.bg, color: meta.color }}>
               <Icon size={12} />
               {meta.label}
            </span>
         </div>

         <div className="som-order-cell som-order-actions">
            <button className="som-action-btn" onClick={() => onViewDetails(order)} title="View Details">
               <Eye size={14} />
            </button>

            <div className="som-action-menu-wrap">
               <button className="som-action-btn" onClick={() => setMenuOpen(!menuOpen)} title="More Actions">
                  <MoreVertical size={14} />
               </button>

               {menuOpen && (
                  <>
                     <div className="som-menu-backdrop" onClick={() => setMenuOpen(false)} />
                     <div className="z-10 som-action-menu">
                        {order.orderStatus === "PLACED" && (
                           <>
                              <button
                                 onClick={() => {
                                    onConfirm(order._id);
                                    setMenuOpen(false);
                                 }}
                              >
                                 <CheckCircle size={14} /> Confirm Order
                              </button>
                              <button
                                 onClick={() => {
                                    onCancel(order._id);
                                    setMenuOpen(false);
                                 }}
                                 className="danger"
                              >
                                 <XCircle size={14} /> Cancel Order
                              </button>
                           </>
                        )}
                        {order.orderStatus === "CONFIRMED" && (
                           <button
                              onClick={() => {
                                 onShip(order._id);
                                 setMenuOpen(false);
                              }}
                           >
                              <Truck size={14} /> Ship Order
                           </button>
                        )}
                        {(order.orderStatus === "SHIPPED" || order.orderStatus === "DELIVERED" || order.orderStatus === "CANCELLED") && (
                           <button onClick={() => setMenuOpen(false)} disabled>
                              No actions available
                           </button>
                        )}
                     </div>
                  </>
               )}
            </div>
         </div>
      </div>
   );
}

function OrderDetailsModal({ order, onClose }) {
   if (!order) return null;

   const meta = ORDER_STATUS_META[order.orderStatus] || ORDER_STATUS_META.PLACED;

   return (
      <div className="som-modal-bg" onClick={onClose}>
         <div className="som-modal" onClick={(e) => e.stopPropagation()}>
            <div className="som-modal-header">
               <div>
                  <h3>Order Details</h3>
                  <span className="som-modal-order-id">#{order._id}</span>
               </div>
               <button className="som-modal-close" onClick={onClose}>×</button>
            </div>

            <div className="som-modal-body">
               <div className="som-detail-section">
                  <div className="som-detail-label">Order Status</div>
                  <span className="som-status-badge-lg" style={{ background: meta.bg, color: meta.color }}>
                     <meta.icon size={16} />
                     {meta.label}
                  </span>
               </div>

               <div className="som-detail-section">
                  <div className="som-detail-label">Customer Information</div>
                  <div className="som-info-grid">
                     <div className="som-info-item">
                        <User size={14} />
                        <span>{order.userId?.name || order.shippingAddress?.fullName || "N/A"}</span>
                     </div>
                     <div className="som-info-item">
                        <Mail size={14} />
                        <span>{order.userId?.email || "N/A"}</span>
                     </div>
                     {(order.userId?.phone || order.shippingAddress?.phone) && (
                        <div className="som-info-item">
                           <Phone size={14} />
                           <span>{order.userId?.phone || order.shippingAddress?.phone}</span>
                        </div>
                     )}
                  </div>
               </div>

               <div className="som-detail-section">
                  <div className="som-detail-label">Order Items ({order.items?.length || 0})</div>
                  <div className="som-items-list">
                     {order.items?.map((item, index) => (
                        <div key={index} className="som-item-row">
                           <div className="som-item-img">
                              {item.productId?.images?.[0] ? (
                                 <img src={item.productId.images[0]} alt="" />
                              ) : (
                                 <Package size={16} color="rgba(255,255,255,0.2)" />
                              )}
                           </div>
                           <div className="som-item-info">
                              <div className="som-item-name">{item.productId?.name || "Product"}</div>
                              <div className="som-item-meta">
                                 Qty: {item.quantity} × {formatPrice(item.price)}
                              </div>
                           </div>
                           <div className="som-item-total">{formatPrice(item.price * item.quantity)}</div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="som-detail-section">
                  <div className="som-detail-label">
                     <MapPin size={14} />
                     Shipping Address
                  </div>
                  <div className="som-address">
                     {order.shippingAddress ? (
                        <>
                           {order.shippingAddress.fullName && (
                              <div><strong>{order.shippingAddress.fullName}</strong></div>
                           )}
                           {order.shippingAddress.phone && (
                              <div>Phone: {order.shippingAddress.phone}</div>
                           )}
                           {order.shippingAddress.addressLine1 && (
                              <div>{order.shippingAddress.addressLine1}</div>
                           )}
                           {order.shippingAddress.addressLine2 && (
                              <div>{order.shippingAddress.addressLine2}</div>
                           )}
                           {(order.shippingAddress.city || order.shippingAddress.state) && (
                              <div>
                                 {order.shippingAddress.city}
                                 {order.shippingAddress.city && order.shippingAddress.state && ", "}
                                 {order.shippingAddress.state}
                              </div>
                           )}
                           {order.shippingAddress.postalCode && (
                              <div>PIN: {order.shippingAddress.postalCode}</div>
                           )}
                           {order.shippingAddress.country && (
                              <div>{order.shippingAddress.country}</div>
                           )}
                        </>
                     ) : (
                        <div>No shipping address available</div>
                     )}
                  </div>
               </div>

               <div className="som-detail-section">
                  <div className="som-payment-info">
                     <div className="som-payment-row">
                        <span>Payment Status</span>
                        <span className={`som-payment-badge ${order.paymentStatus?.toLowerCase()}`}>
                           {order.paymentStatus || "PENDING"}
                        </span>
                     </div>
                     {order.sellerTotal && (
                        <div className="som-payment-row">
                           <span>Your Items Total</span>
                           <span>{formatPrice(order.sellerTotal)}</span>
                        </div>
                     )}
                     <div className="som-payment-row total">
                        <span>Order Total</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function ShipOrderModal({ orderId, onClose, onSubmit }) {
   const [weight, setWeight] = useState("");
   const [loading, setLoading] = useState(false);

   const handleSubmit = async () => {
      if (!weight || weight <= 0) {
         alert("Please enter valid weight");
         return;
      }
      setLoading(true);
      await onSubmit(orderId, parseFloat(weight));
      setLoading(false);
      onClose();
   };

   return (
      <div className="som-modal-bg" onClick={onClose}>
         <div className="som-modal som-modal-ship" onClick={(e) => e.stopPropagation()}>
            <div className="som-modal-header">
               <h3>Ship Order</h3>
               <button className="som-modal-close" onClick={onClose}>×</button>
            </div>

            <div className="som-modal-body">
               <div className="som-form-group">
                  <label>Package Weight (kg)</label>
                  <input
                     type="number"
                     step="0.1"
                     min="0"
                     value={weight}
                     onChange={(e) => setWeight(e.target.value)}
                     placeholder="Enter weight in kilograms"
                     className="som-input"
                  />
                  <div className="som-form-hint">
                     <strong>Courier will be auto-assigned:</strong>
                     <div>• &lt;2kg → Delhivery</div>
                     <div>• 2-5kg → DTDC</div>
                     <div>• ≥5kg → FedEx</div>
                  </div>
               </div>

               <div className="som-modal-actions">
                  <button className="som-btn-secondary" onClick={onClose} disabled={loading}>
                     Cancel
                  </button>
                  <button className="som-btn-primary" onClick={handleSubmit} disabled={loading}>
                     {loading ? (
                        <>
                           <div className="som-spinner-sm" /> Shipping...
                        </>
                     ) : (
                        <>
                           <Truck size={14} /> Ship Order
                        </>
                     )}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}



export default function SellerOrderManagement() {

   const navigate = useNavigate();
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [orderFilter, setOrderFilter] = useState("ALL");
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [shipModalOrder, setShipModalOrder] = useState(null);
   const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, shipped: 0 });

   useEffect(() => {
      fetchOrders();
   }, []);

   const fetchOrders = async () => {
      try {
         setLoading(true);

         const response = await axiosClient.get('/seller/orders');
         const fetchedOrders = response.data.orders || [];
         setOrders(fetchedOrders);

         const newStats = {
            total: fetchedOrders.length,
            pending: fetchedOrders.filter(o => o.orderStatus === "PLACED").length,
            confirmed: fetchedOrders.filter(o => o.orderStatus === "CONFIRMED").length,
            shipped: fetchedOrders.filter(o => o.orderStatus === "SHIPPED").length,
         };
         setStats(newStats);

         setLoading(false);
      } catch (error) {
         alert(error.message)
         setLoading(false);
      }
   };

   const handleConfirmOrder = async (orderId) => {
      try {
         await axiosClient.post(`/order/confirm/${orderId}`);
         fetchOrders();
         alert("Order confirmed successfully!");
      } catch (error) {
         alert(`Failed to confirm order: ${error.response?.data?.message || error.message}`);
      }
   };

   const handleCancelOrder = async (orderId) => {
      if (!confirm("Are you sure you want to cancel this order?")) return;

      try {
         await axiosClient.post(`/order/cancel/${orderId}`);
         fetchOrders();
         alert("Order cancelled successfully");
      } catch (error) {
         alert(`Failed to cancel order: ${error.response?.data?.message || error.message}`);
      }
   };

   const handleShipOrder = async (orderId, weight) => {
      try {
         await axiosClient.post("/order/ship", { orderId, orderWeight: weight });
         fetchOrders();
         alert("Order shipped successfully!");
      } catch (error) {
         alert(`Failed to ship order: ${error.response?.data?.message || error.message}`);
      }
   };

   const filteredOrders = orders.filter((order) => {
      const matchesFilter = orderFilter === "ALL" || order.orderStatus === orderFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
         order._id.toLowerCase().includes(searchLower) ||
         order.userId?.name?.toLowerCase().includes(searchLower) ||
         order.userId?.email?.toLowerCase().includes(searchLower);
      return matchesFilter && matchesSearch;
   });

   if (loading) return <LoadingPage />

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .som-root{min-height:100vh;background:#020408;font-family:'DM Sans',sans-serif;color:#fff;}
        .som-bg{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,198,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,198,255,0.03) 1px,transparent 1px);background-size:60px 60px;}
        .som-orb1{position:fixed;width:500px;height:500px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(0,198,255,0.08) 0%,transparent 68%);top:-200px;left:-160px;}
        .som-orb2{position:fixed;width:400px;height:400px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 68%);bottom:-120px;right:-110px;}

        /* NAV */
        .som-nav{position:sticky;top:0;z-index:100;height:60px;padding:0 28px;display:flex;align-items:center;gap:10px;background:rgba(2,4,8,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);}
        .som-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;cursor:pointer;}
        .som-nav-logo-box{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#00c6ff,#a855f7);display:flex;align-items:center;justify-content:center;}
        .som-nav-logo-text{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;background:linear-gradient(135deg,#fff 40%,#00c6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .som-nav-sep{color:rgba(255,255,255,0.15);margin:0 2px;}
        .som-nav-page{font-size:13px;color:rgba(255,255,255,0.38);}
        .som-nav-spacer{flex:1;}
        .som-nav-link{padding:8px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);transition:all 0.18s;text-decoration:none;display:inline-block;}
        .som-nav-link:hover{background:rgba(255,255,255,0.08);color:#fff;}

        /* PAGE */
        .som-page{position:relative;z-index:1;max-width:1400px;margin:0 auto;padding:36px 24px 100px;}

        /* LOADING */
        .som-loading{display:flex;align-items:center;justify-content:center;min-height:100vh;gap:12px;color:rgba(255,255,255,0.4);font-size:14px;}
        .som-spinner{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,0.1);border-top-color:#00c6ff;animation:spin 0.8s linear infinite;}
        .som-spinner-sm{width:14px;height:14px;border-radius:50%;border:2px solid rgba(2,4,8,0.2);border-top-color:#020408;animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        /* HEADER */
        .som-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;flex-wrap:wrap;gap:16px;}
        .som-header-left{}
        .som-title{font-family:'Syne',sans-serif;font-size:clamp(26px,3.5vw,36px);font-weight:800;color:#fff;letter-spacing:-1px;margin-bottom:6px;}
        .som-title span{background:linear-gradient(135deg,#00c6ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .som-subtitle{font-size:14px;color:rgba(255,255,255,0.38);line-height:1.6;}

        .som-header-right{display:flex;gap:10px;}
        .som-refresh-btn{padding:10px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);display:flex;align-items:center;gap:8px;transition:all 0.18s;}
        .som-refresh-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}

        /* STATS */
        .som-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:28px;}
        .som-stat-card{padding:16px;border-radius:14px;background:rgba(255,255,255,0.028);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px);}
        .som-stat-label{font-size:11px;font-weight:600;color:rgba(255,255,255,0.45);margin-bottom:8px;letter-spacing:0.5px;}
        .som-stat-value{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:#fff;}

        /* CONTROLS */
        .som-controls{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;align-items:center;}
        .som-search-wrap{flex:1;min-width:280px;position:relative;}
        .som-search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.28);pointer-events:none;}
        .som-search{width:100%;padding:11px 14px 11px 42px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .som-search::placeholder{color:rgba(255,255,255,0.2);}
        .som-search:focus{border-color:rgba(0,198,255,0.45);box-shadow:0 0 0 3px rgba(0,198,255,0.07);}

        .som-filter-group{display:flex;gap:6px;flex-wrap:wrap;}
        .som-filter-btn{padding:9px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;color:rgba(255,255,255,0.42);transition:all 0.18s;white-space:nowrap;}
        .som-filter-btn:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.8);}
        .som-filter-btn.active{background:rgba(0,198,255,0.1);border-color:rgba(0,198,255,0.3);color:#00c6ff;}

        /* ORDERS TABLE */
        .som-orders-table{border-radius:16px;background:rgba(255,255,255,0.018);border:1px solid rgba(255,255,255,0.06);overflow:hidden;}
        .som-table-header{display:grid;grid-template-columns:160px 220px 100px 130px 120px 140px 100px;gap:16px;padding:14px 20px;background:rgba(255,255,255,0.02);border-bottom:1px solid rgba(255,255,255,0.06);}
        .som-header-cell{font-size:10px;font-weight:700;letter-spacing:0.9px;text-transform:uppercase;color:rgba(255,255,255,0.35);}
        @media(max-width:1100px){.som-table-header{display:none;}}

        .som-table-body{}
        .som-order-row{display:grid;grid-template-columns:160px 220px 100px 130px 120px 140px 100px;gap:16px;align-items:center;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s;}
        .som-order-row:hover{background:rgba(255,255,255,0.025);}
        .som-order-row:last-child{border-bottom:none;}
        @media(max-width:1100px){.som-order-row{grid-template-columns:1fr;gap:12px;padding:20px;}}

        .som-order-cell{}
        .som-order-id{}
        .som-order-num{font-family:'Syne',sans-serif;font-size:13px;font-weight:800;color:#00c6ff;display:block;margin-bottom:3px;}
        .som-order-date{font-size:11px;color:rgba(255,255,255,0.32);}

        .som-order-customer{display:flex;align-items:center;gap:10px;}
        .som-customer-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#00c6ff,#a855f7);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#020408;flex-shrink:0;}
        .som-customer-name{font-size:13px;font-weight:600;color:#fff;margin-bottom:2px;}
        .som-customer-email{font-size:11px;color:rgba(255,255,255,0.35);}

        .som-order-items{}
        .som-items-badge{display:inline-block;padding:4px 10px;border-radius:12px;background:rgba(255,255,255,0.06);font-size:11px;font-weight:700;color:rgba(255,255,255,0.55);}

        .som-order-amount{}
        .som-amount-value{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:#fff;}

        .som-order-payment{}
        .som-payment-badge{display:inline-block;padding:4px 10px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;}
        .som-payment-badge.pending{background:rgba(245,158,11,0.1);color:#f59e0b;}
        .som-payment-badge.completed{background:rgba(34,197,94,0.1);color:#22c55e;}
        .som-payment-badge.failed{background:rgba(248,113,113,0.1);color:#f87171;}

        .som-order-status{}
        .som-status-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;}

        .som-order-actions{display:flex;gap:6px;justify-content:flex-end;}
        .som-action-btn{width:34px;height:34px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.45);transition:all 0.15s;}
        .som-action-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}

        .som-action-menu-wrap{position:relative;}
        .som-menu-backdrop{position:fixed;inset:0;z-index:9;}
        .som-action-menu{position:absolute;top:calc(100% + 6px);right:0;min-width:180px;background:rgba(10,14,22,0.97);border:1px solid rgba(255,255,255,0.1);border-radius:12px;backdrop-filter:blur(24px);box-shadow:0 20px 60px rgba(0,0,0,0.6);overflow:hidden;z-index:10;animation:som-menu-in 0.2s ease;}
        @keyframes som-menu-in{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
        .som-action-menu button{width:100%;padding:10px 14px;border:none;background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);text-align:left;display:flex;align-items:center;gap:8px;transition:all 0.15s;}
        .som-action-menu button:hover:not(:disabled){background:rgba(255,255,255,0.06);color:#fff;}
        .som-action-menu button:disabled{opacity:0.4;cursor:not-allowed;}
        .som-action-menu button.danger{color:rgba(248,113,113,0.75);}
        .som-action-menu button.danger:hover{background:rgba(248,113,113,0.08);color:#f87171;}

        /* MODAL */
        .som-modal-bg{position:fixed;inset:0;z-index:200;background:rgba(2,4,8,0.88);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:24px;animation:som-fadein 0.2s ease;}
        @keyframes som-fadein{from{opacity:0;}to{opacity:1;}}
        .som-modal{width:100%;max-width:600px;background:#0c1018;border:1px solid rgba(255,255,255,0.1);border-radius:20px;box-shadow:0 28px 70px rgba(0,0,0,0.6);animation:som-modal-in 0.22s cubic-bezier(0.34,1.3,0.64,1);max-height:85vh;overflow-y:auto;}
        @keyframes som-modal-in{from{opacity:0;transform:scale(0.9) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);}}
        .som-modal-header{padding:24px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;}
        .som-modal-header h3{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#fff;margin-bottom:4px;}
        .som-modal-order-id{font-size:12px;color:rgba(255,255,255,0.4);}
        .som-modal-close{width:32px;height:32px;border-radius:8px;border:none;background:rgba(255,255,255,0.06);cursor:pointer;font-size:24px;color:rgba(255,255,255,0.6);transition:all 0.18s;}
        .som-modal-close:hover{background:rgba(255,255,255,0.12);color:#fff;}
        .som-modal-body{padding:24px;}

        .som-detail-section{margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,0.06);}
        .som-detail-section:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
        .som-detail-label{font-size:11px;font-weight:700;color:rgba(255,255,255,0.45);margin-bottom:12px;letter-spacing:0.5px;display:flex;align-items:center;gap:6px;}
        .som-status-badge-lg{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:24px;font-size:13px;font-weight:700;}

        .som-info-grid{display:grid;gap:10px;}
        .som-info-item{display:flex;align-items:center;gap:10px;padding:10px;border-radius:10px;background:rgba(255,255,255,0.03);font-size:13px;color:rgba(255,255,255,0.7);}
        .som-info-item svg{color:rgba(255,255,255,0.4);flex-shrink:0;}

        .som-items-list{display:flex;flex-direction:column;gap:12px;}
        .som-item-row{display:flex;gap:12px;align-items:center;padding:12px;border-radius:12px;background:rgba(255,255,255,0.03);}
        .som-item-img{width:48px;height:48px;border-radius:8px;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;}
        .som-item-img img{width:100%;height:100%;object-fit:cover;}
        .som-item-info{flex:1;min-width:0;}
        .som-item-name{font-size:13px;font-weight:600;color:#fff;margin-bottom:4px;}
        .som-item-meta{font-size:11px;color:rgba(255,255,255,0.4);}
        .som-item-total{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;}

        .som-address{font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;padding:12px;border-radius:10px;background:rgba(255,255,255,0.03);}
        .som-address strong{color:rgba(255,255,255,0.9);font-weight:600;}

        .som-payment-info{display:flex;flex-direction:column;gap:12px;}
        .som-payment-row{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-radius:10px;background:rgba(255,255,255,0.03);font-size:14px;}
        .som-payment-row.total{background:rgba(0,198,255,0.08);border:1px solid rgba(0,198,255,0.2);}
        .som-payment-row.total span{font-family:'Syne',sans-serif;font-weight:800;color:#00c6ff;}

        .som-form-group{margin-bottom:20px;}
        .som-form-group label{display:block;font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);margin-bottom:8px;letter-spacing:0.5px;}
        .som-input{width:100%;padding:12px 16px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .som-input:focus{border-color:rgba(0,198,255,0.45);box-shadow:0 0 0 3px rgba(0,198,255,0.07);}
        .som-form-hint{font-size:11px;color:rgba(255,255,255,0.35);margin-top:8px;line-height:1.6;}
        .som-form-hint strong{display:block;margin-bottom:4px;color:rgba(255,255,255,0.5);}

        .som-modal-actions{display:flex;gap:10px;margin-top:24px;}
        .som-btn-secondary{flex:1;padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);transition:all 0.18s;}
        .som-btn-secondary:hover:not(:disabled){background:rgba(255,255,255,0.08);color:#fff;}
        .som-btn-secondary:disabled{opacity:0.4;cursor:not-allowed;}
        .som-btn-primary{flex:1;padding:12px;border-radius:10px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;background:linear-gradient(135deg,#00c6ff,#a855f7);color:#020408;transition:opacity 0.18s,transform 0.18s;display:flex;align-items:center;justify-content:center;gap:8px;}
        .som-btn-primary:hover:not(:disabled){transform:translateY(-1px);}
        .som-btn-primary:disabled{opacity:0.4;cursor:not-allowed;}

        /* EMPTY STATE */
        .som-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:16px;text-align:center;padding:40px;}
        .som-empty-icon{width:64px;height:64px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;}
        .som-empty-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#fff;}
        .som-empty-sub{font-size:13px;color:rgba(255,255,255,0.35);max-width:280px;line-height:1.6;}
      `}</style>

         <div className="som-root">
            <div className="som-bg" />
            <div className="som-orb1" />
            <div className="som-orb2" />

            <nav className="som-nav">
               <div className="som-nav-logo" onClick={() => navigate("/")}>
                  <div className="som-nav-logo-box">
                     <Zap size={16} color="#020408" strokeWidth={2.5} />
                  </div>
                  <span className="som-nav-logo-text">QuantumCart</span>
               </div>
               <span className="som-nav-sep">/</span>
               <span className="som-nav-page">Order Management</span>
               <div className="som-nav-spacer" />
               <a href="/seller/analytics" className="som-nav-link">
                  ← View Analytics
               </a>
            </nav>

            <div className="som-page">
               <div className="som-header">
                  <div className="som-header-left">
                     <h1 className="som-title">
                        Order <span>Management</span>
                     </h1>
                     <p className="som-subtitle">Process and track all your customer orders</p>
                  </div>
                  <div className="som-header-right">
                     <button className="som-refresh-btn" onClick={fetchOrders}>
                        <RefreshCw size={14} />
                        Refresh
                     </button>
                  </div>
               </div>

               <div className="som-stats">
                  <div className="som-stat-card">
                     <div className="som-stat-label">TOTAL ORDERS</div>
                     <div className="som-stat-value">{stats.total}</div>
                  </div>
                  <div className="som-stat-card">
                     <div className="som-stat-label">PENDING</div>
                     <div className="som-stat-value">{stats.pending}</div>
                  </div>
                  <div className="som-stat-card">
                     <div className="som-stat-label">CONFIRMED</div>
                     <div className="som-stat-value">{stats.confirmed}</div>
                  </div>
                  <div className="som-stat-card">
                     <div className="som-stat-label">SHIPPED</div>
                     <div className="som-stat-value">{stats.shipped}</div>
                  </div>
               </div>

               <div className="som-controls">
                  <div className="som-search-wrap">
                     <Search size={14} className="som-search-icon" />
                     <input
                        type="search"
                        className="som-search"
                        placeholder="Search by order ID, customer name, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>

                  <div className="som-filter-group">
                     {["ALL", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
                        <button
                           key={status}
                           className={`som-filter-btn ${orderFilter === status ? "active" : ""}`}
                           onClick={() => setOrderFilter(status)}
                        >
                           {status}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="som-orders-table">
                  <div className="som-table-header">
                     <div className="som-header-cell">Order ID</div>
                     <div className="som-header-cell">Customer</div>
                     <div className="som-header-cell">Items</div>
                     <div className="som-header-cell">Amount</div>
                     <div className="som-header-cell">Payment</div>
                     <div className="som-header-cell">Status</div>
                     <div className="som-header-cell">Actions</div>
                  </div>

                  <div className="som-table-body">
                     {filteredOrders.length === 0 ? (
                        <div className="som-empty">
                           <div className="som-empty-icon">
                              <ShoppingBag size={28} color="rgba(255,255,255,0.15)" />
                           </div>
                           <h3 className="som-empty-title">No orders found</h3>
                           <p className="som-empty-sub">
                              {searchQuery
                                 ? `No orders match "${searchQuery}"`
                                 : "Orders will appear here once customers make purchases"}
                           </p>
                        </div>
                     ) : (
                        filteredOrders.map((order) => (
                           <OrderRow
                              key={order._id}
                              order={order}
                              onConfirm={handleConfirmOrder}
                              onCancel={handleCancelOrder}
                              onShip={(id) => setShipModalOrder(id)}
                              onViewDetails={setSelectedOrder}
                           />
                        ))
                     )}
                  </div>
               </div>
            </div>

            {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}

            {shipModalOrder && (
               <ShipOrderModal
                  orderId={shipModalOrder}
                  onClose={() => setShipModalOrder(null)}
                  onSubmit={handleShipOrder}
               />
            )}
         </div>
      </>
   );
}