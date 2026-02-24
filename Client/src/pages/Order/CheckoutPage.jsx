import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
   Zap, MapPin, CreditCard, ShoppingBag, ArrowRight,
   Plus, CheckCircle, AlertTriangle, Package, ChevronRight,
   Truck, Shield, Tag, X,
} from "lucide-react";
import { fetchCart } from "../../store/slices/cartSlice";
import {
   fetchAddresses, addAddress, placeOrder, clearSuccessMessage,
} from "../../store/slices/orderSlice";
import LoadingPage from "../../components/LoadingPage";

const formatPrice = (p) => `₹${Number(p).toLocaleString("en-IN")}`;
const isValidUrl = (s) => { try { return Boolean(new URL(s)); } catch { return false; } };

const PAYMENT_METHODS = [
   { id: "COD", label: "Cash on Delivery", icon: "💵", desc: "Pay when your order arrives" },
   { id: "UPI", label: "UPI", icon: "📱", desc: "GPay, PhonePe, Paytm & more" },
   { id: "CARD", label: "Credit / Debit Card", icon: "💳", desc: "Visa, Mastercard, RuPay" },
   { id: "NETBANKING", label: "Net Banking", icon: "🏦", desc: "All major banks supported" },
];

const STEPS = ["Cart", "Address", "Payment", "Review"];


function AddressForm({ onSave, onCancel, saving }) {
   const [form, setForm] = useState({
      fullName: "", phone: "", line1: "", line2: "",
      city: "", state: "", pincode: "", country: "India",
   });
   const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

   const handleSubmit = (e) => {
      e.preventDefault();
      onSave(form);
   };

   return (
      <form className="addr-form" onSubmit={handleSubmit}>
         <div className="addr-form-grid2">
            <div className="addr-field">
               <label className="addr-label">Full Name *</label>
               <input className="addr-input" value={form.fullName} onChange={set("fullName")} required placeholder="John Doe" />
            </div>
            <div className="addr-field">
               <label className="addr-label">Phone *</label>
               <input className="addr-input" value={form.phone} onChange={set("phone")} required placeholder="9876543210" maxLength={10} />
            </div>
         </div>
         <div className="addr-field">
            <label className="addr-label">Address Line 1 *</label>
            <input className="addr-input" value={form.line1} onChange={set("line1")} required placeholder="House no, Street, Area" />
         </div>
         <div className="addr-field">
            <label className="addr-label">Address Line 2</label>
            <input className="addr-input" value={form.line2} onChange={set("line2")} placeholder="Landmark (optional)" />
         </div>
         <div className="addr-form-grid3">
            <div className="addr-field">
               <label className="addr-label">City *</label>
               <input className="addr-input" value={form.city} onChange={set("city")} required placeholder="Mumbai" />
            </div>
            <div className="addr-field">
               <label className="addr-label">State *</label>
               <input className="addr-input" value={form.state} onChange={set("state")} required placeholder="Maharashtra" />
            </div>
            <div className="addr-field">
               <label className="addr-label">Pincode *</label>
               <input className="addr-input" value={form.pincode} onChange={set("pincode")} required placeholder="400001" maxLength={6} />
            </div>
         </div>
         <div className="addr-form-actions">
            <button type="button" className="addr-cancel-btn" onClick={onCancel}>Cancel</button>
            <button type="submit" className="addr-save-btn" disabled={saving}>
               {saving ? "Saving…" : "Save Address"}
            </button>
         </div>
      </form>
   );
}



export default function CheckoutPage() {
   const navigate = useNavigate();
   const dispatch = useDispatch();

   const { cart, loading: cartLoading } = useSelector((s) => s.cart);
   const {
      addresses, addressesLoading, addingAddress,
      placing, placeError, placedOrder,
   } = useSelector((s) => s.orders);

   // Wizard step: 0=Address 1=Payment 2=Review
   const [step, setStep] = useState(0);
   const [selectedAddress, setSelectedAddress] = useState(null);
   const [selectedPayment, setSelectedPayment] = useState("COD");
   const [showAddForm, setShowAddForm] = useState(false);
   const [coupon, setCoupon] = useState("");
   const [couponApplied, setCouponApplied] = useState(false);

   useEffect(() => { 
      dispatch(fetchCart()); 
   }, [dispatch]);

   useEffect(() => { 
      dispatch(fetchAddresses()); 
   }, [dispatch]);

   // Auto-select first address
   useEffect(() => {
      if (addresses.length && !selectedAddress) setSelectedAddress(addresses[0]._id);
   }, [selectedAddress, addresses]);

   // Redirect to success page or orders after placing
   useEffect(() => {
      if (placedOrder) {
         setTimeout(() => {
            dispatch(clearSuccessMessage());
            navigate("/orders");
         }, 2200);
      }
   }, [placedOrder, dispatch, navigate]);

   // Cart data (same shape as CartPage)
   const validItems = cart?.items?.filter((i) => i.productId) || [];
   const subtotal = validItems.reduce((s, i) => s + i.productId.price * i.quantity, 0);
   const shipping = subtotal > 500 ? 0 : 50;
   const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
   const total = cart?.totalPrice ?? (subtotal + shipping - discount);

   const handleSaveAddress = (formData) => {
      dispatch(addAddress(formData)).then((res) => {
         if (!res.error) {
            setShowAddForm(false);
            setSelectedAddress(res.payload?.address?._id ?? res.payload?._id);
         }
      });
   };

   const handlePlaceOrder = () => {
      if (!selectedAddress) return;
      dispatch(placeOrder({
         addressId: selectedAddress,
         paymentMethod: selectedPayment,
         items: validItems.map((i) => ({
            productId: i.productId._id,
            quantity: i.quantity,
            price: i.productId.price,
         })),
         totalPrice: total,
      }));
   };

   if (cartLoading) return <LoadingPage />;

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .co-root{min-height:100vh;background:#020408;font-family:'DM Sans',sans-serif;color:#fff;overflow-x:hidden;}
        .co-bg{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,198,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,198,255,0.03) 1px,transparent 1px);background-size:60px 60px;}
        .co-orb1{position:fixed;width:500px;height:500px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(0,198,255,0.09) 0%,transparent 68%);top:-180px;left:-150px;}
        .co-orb2{position:fixed;width:380px;height:380px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 68%);bottom:-120px;right:-100px;}

        /* NAV */
        .co-nav{position:sticky;top:0;z-index:100;height:60px;padding:0 28px;display:flex;align-items:center;gap:10px;background:rgba(2,4,8,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);}
        .co-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;cursor:pointer;}
        .co-nav-logo-box{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#00c6ff,#a855f7);display:flex;align-items:center;justify-content:center;}
        .co-nav-logo-text{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;background:linear-gradient(135deg,#fff 40%,#00c6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .co-nav-sep{color:rgba(255,255,255,0.15);margin:0 4px;}
        .co-nav-page{font-size:13px;color:rgba(255,255,255,0.38);}
        .co-nav-spacer{flex:1;}
        .co-nav-secure{display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(255,255,255,0.35);}

        /* STEPS BAR */
        .co-steps{display:flex;align-items:center;justify-content:center;gap:0;padding:24px 24px 0;position:relative;z-index:1;}
        .co-step-item{display:flex;align-items:center;gap:0;}
        .co-step-circle{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:12px;font-weight:800;border:2px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.3);transition:all 0.3s;flex-shrink:0;}
        .co-step-circle.active{border-color:#00c6ff;color:#00c6ff;box-shadow:0 0 16px rgba(0,198,255,0.25);}
        .co-step-circle.done{background:linear-gradient(135deg,#00c6ff,#a855f7);border-color:transparent;color:#020408;}
        .co-step-label{font-size:11px;color:rgba(255,255,255,0.3);margin-left:8px;font-weight:600;white-space:nowrap;transition:color 0.3s;}
        .co-step-label.active{color:#00c6ff;}
        .co-step-label.done{color:rgba(255,255,255,0.5);}
        .co-step-line{width:40px;height:1px;background:rgba(255,255,255,0.08);margin:0 8px;transition:background 0.3s;}
        .co-step-line.done{background:rgba(0,198,255,0.4);}
        @media(max-width:500px){.co-step-label{display:none;}.co-step-line{width:24px;}}

        /* LAYOUT */
        .co-page{position:relative;z-index:1;max-width:1060px;margin:0 auto;padding:32px 24px 100px;}
        .co-layout{display:grid;grid-template-columns:1fr 320px;gap:24px;align-items:start;margin-top:28px;}
        @media(max-width:860px){.co-layout{grid-template-columns:1fr;}}

        /* PANELS */
        .co-panel{background:rgba(255,255,255,0.028);border:1px solid rgba(255,255,255,0.08);border-radius:22px;padding:28px;backdrop-filter:blur(12px);}
        .co-panel-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;margin-bottom:20px;display:flex;align-items:center;gap:8px;}
        .co-panel-title-icon{width:32px;height:32px;border-radius:9px;background:rgba(0,198,255,0.1);border:1px solid rgba(0,198,255,0.2);display:flex;align-items:center;justify-content:center;}

        /* STEP ACTIONS */
        .co-step-actions{display:flex;gap:12px;margin-top:24px;justify-content:flex-end;}
        .co-btn-primary{display:flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#00c6ff,#a855f7);cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#020408;transition:transform 0.2s,box-shadow 0.2s;}
        .co-btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,198,255,0.28);}
        .co-btn-primary:disabled{opacity:0.5;cursor:not-allowed;}
        .co-btn-ghost{display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);transition:all 0.18s;}
        .co-btn-ghost:hover{background:rgba(255,255,255,0.05);color:#fff;}

        /* ADDRESS CARDS */
        .co-addr-list{display:flex;flex-direction:column;gap:12px;margin-bottom:16px;}
        .co-addr-card{display:flex;align-items:flex-start;gap:14px;padding:16px;border-radius:14px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.02);cursor:pointer;transition:all 0.2s;}
        .co-addr-card:hover{border-color:rgba(255,255,255,0.13);background:rgba(255,255,255,0.04);}
        .co-addr-card.selected{border-color:rgba(0,198,255,0.4);background:rgba(0,198,255,0.05);}
        .co-addr-radio{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;transition:border-color 0.2s;}
        .co-addr-card.selected .co-addr-radio{border-color:#00c6ff;}
        .co-addr-radio-dot{width:8px;height:8px;border-radius:50%;background:#00c6ff;display:none;}
        .co-addr-card.selected .co-addr-radio-dot{display:block;}
        .co-addr-name{font-size:14px;font-weight:700;color:#fff;margin-bottom:4px;}
        .co-addr-text{font-size:13px;color:rgba(255,255,255,0.45);line-height:1.6;}
        .co-addr-phone{font-size:12px;color:rgba(255,255,255,0.3);margin-top:4px;}
        .co-add-addr-btn{display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;border:1px dashed rgba(0,198,255,0.25);background:rgba(0,198,255,0.03);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(0,198,255,0.7);width:100%;transition:all 0.18s;}
        .co-add-addr-btn:hover{border-color:rgba(0,198,255,0.5);color:#00c6ff;background:rgba(0,198,255,0.06);}
        .co-addr-empty{text-align:center;padding:24px;color:rgba(255,255,255,0.3);font-size:14px;}

        /* ADDRESS FORM */
        .addr-form{margin-top:16px;}
        .addr-form-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .addr-form-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
        @media(max-width:600px){.addr-form-grid2,.addr-form-grid3{grid-template-columns:1fr;}}
        .addr-field{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}
        .addr-label{font-size:12px;font-weight:600;color:rgba(255,255,255,0.45);letter-spacing:0.03em;}
        .addr-input{padding:11px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#fff;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .addr-input::placeholder{color:rgba(255,255,255,0.2);}
        .addr-input:focus{border-color:rgba(0,198,255,0.4);box-shadow:0 0 0 3px rgba(0,198,255,0.07);}
        .addr-form-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:4px;}
        .addr-cancel-btn{padding:10px 18px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:transparent;cursor:pointer;font-size:13px;font-weight:600;color:rgba(255,255,255,0.45);transition:all 0.18s;}
        .addr-cancel-btn:hover{color:#fff;border-color:rgba(255,255,255,0.2);}
        .addr-save-btn{padding:10px 20px;border-radius:10px;border:none;background:linear-gradient(135deg,#00c6ff,#a855f7);cursor:pointer;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#020408;transition:transform 0.2s;}
        .addr-save-btn:hover:not(:disabled){transform:translateY(-1px);}
        .addr-save-btn:disabled{opacity:0.5;cursor:not-allowed;}

        /* PAYMENT METHODS */
        .co-pay-list{display:flex;flex-direction:column;gap:10px;}
        .co-pay-card{display:flex;align-items:center;gap:14px;padding:16px;border-radius:14px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.02);cursor:pointer;transition:all 0.2s;}
        .co-pay-card:hover{border-color:rgba(255,255,255,0.13);background:rgba(255,255,255,0.04);}
        .co-pay-card.selected{border-color:rgba(0,198,255,0.4);background:rgba(0,198,255,0.05);}
        .co-pay-icon{font-size:22px;width:42px;height:42px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);flex-shrink:0;}
        .co-pay-label{font-size:14px;font-weight:700;color:#fff;margin-bottom:2px;}
        .co-pay-desc{font-size:12px;color:rgba(255,255,255,0.35);}
        .co-pay-radio{margin-left:auto;width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:border-color 0.2s;}
        .co-pay-card.selected .co-pay-radio{border-color:#00c6ff;}
        .co-pay-radio-dot{width:8px;height:8px;border-radius:50%;background:#00c6ff;display:none;}
        .co-pay-card.selected .co-pay-radio-dot{display:block;}

        /* REVIEW */
        .co-review-items{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;}
        .co-review-item{display:flex;align-items:center;gap:14px;padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);}
        .co-review-img-wrap{width:54px;height:54px;border-radius:10px;overflow:hidden;flex-shrink:0;}
        .co-review-img{width:100%;height:100%;object-fit:cover;}
        .co-review-img-empty{width:100%;height:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;display:flex;align-items:center;justify-content:center;}
        .co-review-name{font-size:13px;font-weight:700;color:#fff;margin-bottom:3px;}
        .co-review-meta{font-size:12px;color:rgba(255,255,255,0.35);}
        .co-review-price{margin-left:auto;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;white-space:nowrap;}

        .co-review-section{padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);margin-bottom:12px;}
        .co-review-section-label{font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;}
        .co-review-section-value{font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;}

        /* COUPON */
        .co-coupon{display:flex;gap:10px;margin-bottom:16px;}
        .co-coupon-input{flex:1;padding:11px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#fff;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;transition:border-color 0.2s;}
        .co-coupon-input::placeholder{color:rgba(255,255,255,0.2);}
        .co-coupon-input:focus{border-color:rgba(0,198,255,0.35);}
        .co-coupon-btn{padding:11px 16px;border-radius:10px;border:1px solid rgba(0,198,255,0.25);background:rgba(0,198,255,0.06);cursor:pointer;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:#00c6ff;transition:all 0.18s;white-space:nowrap;}
        .co-coupon-btn:hover{background:rgba(0,198,255,0.12);border-color:rgba(0,198,255,0.4);}
        .co-coupon-applied{display:flex;align-items:center;gap:8px;font-size:12px;color:#22c55e;margin-top:-8px;margin-bottom:12px;}

        /* SUMMARY SIDEBAR */
        .co-summary{position:sticky;top:76px;background:rgba(255,255,255,0.028);border:1px solid rgba(255,255,255,0.08);border-radius:22px;padding:24px;backdrop-filter:blur(12px);}
        .co-summary-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;margin-bottom:18px;}
        .co-summary-items{margin-bottom:16px;display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto;}
        .co-summary-items::-webkit-scrollbar{width:3px;}
        .co-summary-items::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px;}
        .co-sum-item{display:flex;align-items:center;gap:10px;}
        .co-sum-img{width:36px;height:36px;border-radius:8px;object-fit:cover;border:1px solid rgba(255,255,255,0.07);}
        .co-sum-img-empty{width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;}
        .co-sum-name{font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .co-sum-qty{font-size:11px;color:rgba(255,255,255,0.25);}
        .co-sum-price{font-size:12px;font-weight:700;color:#fff;white-space:nowrap;}
        .co-sum-divider{height:1px;background:rgba(255,255,255,0.07);margin:12px 0;}
        .co-sum-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;}
        .co-sum-label{font-size:13px;color:rgba(255,255,255,0.4);}
        .co-sum-value{font-size:13px;font-weight:700;color:rgba(255,255,255,0.75);}
        .co-sum-value.free{color:#22c55e;}
        .co-sum-value.discount{color:#a855f7;}
        .co-sum-total-row{display:flex;justify-content:space-between;align-items:center;padding:14px 0 0;}
        .co-sum-total-label{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;}
        .co-sum-total-value{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;background:linear-gradient(135deg,#00c6ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .co-trust{display:flex;flex-direction:column;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);}
        .co-trust-item{display:flex;align-items:center;gap:8px;font-size:11px;color:rgba(255,255,255,0.3);}

        /* SUCCESS */
        .co-success-overlay{position:fixed;inset:0;z-index:200;background:#020408;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;animation:fade-in 0.4s ease;}
        @keyframes fade-in{from{opacity:0;}to{opacity:1;}}
        .co-success-icon{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,rgba(34,197,94,0.2),rgba(0,198,255,0.1));border:2px solid rgba(34,197,94,0.4);display:flex;align-items:center;justify-content:center;animation:pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;}
        @keyframes pop{from{transform:scale(0);}to{transform:scale(1);}}
        .co-success-title{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#fff;}
        .co-success-sub{font-size:15px;color:rgba(255,255,255,0.4);text-align:center;}

        /* ERROR */
        .co-error{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;background:rgba(248,113,113,0.07);border:1px solid rgba(248,113,113,0.2);color:#f87171;font-size:13px;font-weight:600;margin-bottom:16px;}

        /* SPIN */
        .co-spin{border-radius:50%;border:2px solid rgba(255,255,255,0.1);border-top-color:#020408;animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

         {/* Success overlay */}
         {placedOrder && (
            <div className="co-success-overlay">
               <div className="co-success-icon">
                  <CheckCircle size={36} color="#22c55e" />
               </div>
               <div className="co-success-title">Order Placed! 🎉</div>
               <div className="co-success-sub">
                  Redirecting you to your orders…
               </div>
            </div>
         )}

         <div className="co-root">
            <div className="co-bg" />
            <div className="co-orb1" />
            <div className="co-orb2" />

            {/* NAV */}
            <nav className="co-nav">
               <div className="co-nav-logo" onClick={() => navigate("/")}>
                  <div className="co-nav-logo-box">
                     <Zap size={16} color="#020408" strokeWidth={2.5} />
                  </div>
                  <span className="co-nav-logo-text">myShop</span>
               </div>
               <span className="co-nav-sep">/</span>
               <span className="co-nav-page">Checkout</span>
               <div className="co-nav-spacer" />
               <div className="co-nav-secure">
                  <Shield size={13} /> Secure Checkout
               </div>
            </nav>

            {/* STEP INDICATOR */}
            <div className="co-steps">
               {STEPS.map((s, i) => {
                  // step 0=Address,1=Payment,2=Review → display steps: Address,Payment,Review,Done
                  const displayStep = i; // 0-indexed matches our wizard
                  const isDone = step > displayStep;
                  const isActive = step === displayStep;
                  return (
                     <div className="co-step-item" key={s}>
                        <div className={`co-step-circle ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
                           {isDone ? "✓" : i + 1}
                        </div>
                        <span className={`co-step-label ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>{s}</span>
                        {i < STEPS.length - 1 && (
                           <div className={`co-step-line ${isDone ? "done" : ""}`} />
                        )}
                     </div>
                  );
               })}
            </div>

            <div className="co-page">
               <div className="co-layout">

                  {/* ── LEFT PANEL ── */}
                  <div>
                     {/* Error */}
                     {placeError && (
                        <div className="co-error">
                           <AlertTriangle size={15} /> {placeError}
                        </div>
                     )}

                     {/* ── STEP 0: ADDRESS ── */}
                     {step === 0 && (
                        <div className="co-panel">
                           <div className="co-panel-title">
                              <div className="co-panel-title-icon">
                                 <MapPin size={15} color="#00c6ff" />
                              </div>
                              Delivery Address
                           </div>

                           {addressesLoading ? (
                              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Loading addresses…</div>
                           ) : (
                              <>
                                 <div className="co-addr-list">
                                    {addresses.length === 0 && !showAddForm && (
                                       <div className="co-addr-empty">No saved addresses. Add one below.</div>
                                    )}
                                    {addresses.map((addr, index) => (
                                       <div
                                          key={index}
                                          className={`co-addr-card ${selectedAddress === addr._id ? "selected" : ""}`}
                                          onClick={() => setSelectedAddress(addr._id)}
                                       >
                                          <div className="co-addr-radio">
                                             <div className="co-addr-radio-dot" />
                                          </div>
                                          <div>
                                             <div className="co-addr-name">{addr.fullName}</div>
                                             <div className="co-addr-text">
                                                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                                                {addr.city}, {addr.state} — {addr.pincode}
                                             </div>
                                             <div className="co-addr-phone">📞 {addr.phone}</div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>

                                 {showAddForm ? (
                                    <AddressForm
                                       onSave={handleSaveAddress}
                                       onCancel={() => setShowAddForm(false)}
                                       saving={addingAddress}
                                    />
                                 ) : (
                                    <button className="co-add-addr-btn" onClick={() => setShowAddForm(true)}>
                                       <Plus size={15} /> Add New Address
                                    </button>
                                 )}
                              </>
                           )}

                           <div className="co-step-actions">
                              <button className="co-btn-ghost" onClick={() => navigate("/cart")}>
                                 Back to Cart
                              </button>
                              <button
                                 className="co-btn-primary"
                                 disabled={!selectedAddress}
                                 onClick={() => setStep(1)}
                              >
                                 Continue <ArrowRight size={16} />
                              </button>
                           </div>
                        </div>
                     )}

                     {/* ── STEP 1: PAYMENT ── */}
                     {step === 1 && (
                        <div className="co-panel">
                           <div className="co-panel-title">
                              <div className="co-panel-title-icon">
                                 <CreditCard size={15} color="#00c6ff" />
                              </div>
                              Payment Method
                           </div>

                           <div className="co-pay-list">
                              {PAYMENT_METHODS.map((pm) => (
                                 <div
                                    key={pm.id}
                                    className={`co-pay-card ${selectedPayment === pm.id ? "selected" : ""}`}
                                    onClick={() => setSelectedPayment(pm.id)}
                                 >
                                    <div className="co-pay-icon">{pm.icon}</div>
                                    <div>
                                       <div className="co-pay-label">{pm.label}</div>
                                       <div className="co-pay-desc">{pm.desc}</div>
                                    </div>
                                    <div className="co-pay-radio">
                                       <div className="co-pay-radio-dot" />
                                    </div>
                                 </div>
                              ))}
                           </div>

                           {/* Coupon */}
                           <div style={{ marginTop: 24 }}>
                              <div className="co-panel-title" style={{ marginBottom: 12, fontSize: 14 }}>
                                 <Tag size={14} color="#a855f7" /> Have a coupon?
                              </div>
                              <div className="co-coupon">
                                 <input
                                    className="co-coupon-input"
                                    placeholder="Enter coupon code"
                                    value={coupon}
                                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                                    disabled={couponApplied}
                                 />
                                 <button
                                    className="co-coupon-btn"
                                    onClick={() => { if (coupon) setCouponApplied(true); }}
                                    disabled={!coupon || couponApplied}
                                 >
                                    {couponApplied ? "Applied ✓" : "Apply"}
                                 </button>
                              </div>
                              {couponApplied && (
                                 <div className="co-coupon-applied">
                                    <CheckCircle size={13} /> 10% discount applied!
                                    <button
                                       style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", marginLeft: 4 }}
                                       onClick={() => { setCouponApplied(false); setCoupon(""); }}
                                    >
                                       <X size={13} />
                                    </button>
                                 </div>
                              )}
                           </div>

                           <div className="co-step-actions">
                              <button className="co-btn-ghost" onClick={() => setStep(0)}>Back</button>
                              <button className="co-btn-primary" onClick={() => setStep(2)}>
                                 Review Order <ArrowRight size={16} />
                              </button>
                           </div>
                        </div>
                     )}

                     {/* ── STEP 2: REVIEW ── */}
                     {step === 2 && (
                        <div className="co-panel">
                           <div className="co-panel-title">
                              <div className="co-panel-title-icon">
                                 <ShoppingBag size={15} color="#00c6ff" />
                              </div>
                              Review Your Order
                           </div>

                           {/* Items */}
                           <div className="co-review-items">
                              {validItems.map((item) => {
                                 const p = item.productId;
                                 const broken = !isValidUrl(p?.images?.[0]);
                                 return (
                                    <div key={item._id} className="co-review-item">
                                       <div className="co-review-img-wrap">
                                          {!broken && p.images?.[0] ? (
                                             <img src={p.images[0]} alt={p.name} className="co-review-img" />
                                          ) : (
                                             <div className="co-review-img-empty">
                                                <Package size={18} color="rgba(255,255,255,0.15)" />
                                             </div>
                                          )}
                                       </div>
                                       <div>
                                          <div className="co-review-name">{p.name}</div>
                                          <div className="co-review-meta">Qty: {item.quantity} × {formatPrice(p.price)}</div>
                                       </div>
                                       <div className="co-review-price">{formatPrice(p.price * item.quantity)}</div>
                                    </div>
                                 );
                              })}
                           </div>

                           {/* Delivery address summary */}
                           {(() => {
                              const addr = addresses.find((a) => a._id === selectedAddress);
                              return addr ? (
                                 <div className="co-review-section">
                                    <div className="co-review-section-label">Delivering to</div>
                                    <div className="co-review-section-value">
                                       <strong style={{ color: "#fff" }}>{addr.fullName}</strong> · {addr.phone}<br />
                                       {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.pincode}
                                    </div>
                                 </div>
                              ) : null;
                           })()}

                           {/* Payment summary */}
                           <div className="co-review-section">
                              <div className="co-review-section-label">Payment via</div>
                              <div className="co-review-section-value">
                                 {PAYMENT_METHODS.find((p) => p.id === selectedPayment)?.label}
                              </div>
                           </div>

                           <div className="co-step-actions">
                              <button className="co-btn-ghost" onClick={() => setStep(1)}>Back</button>
                              <button
                                 className="co-btn-primary"
                                 onClick={handlePlaceOrder}
                                 disabled={placing}
                                 style={{ minWidth: 160 }}
                              >
                                 {placing ? (
                                    <><div className="co-spin" style={{ width: 16, height: 16 }} /> Placing…</>
                                 ) : (
                                    <><CheckCircle size={16} /> Place Order</>
                                 )}
                              </button>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* ── RIGHT: ORDER SUMMARY ── */}
                  <div className="co-summary">
                     <div className="co-summary-title">Order Summary</div>

                     {/* Mini item list */}
                     <div className="co-summary-items">
                        {validItems.map((item) => {
                           const p = item.productId;
                           const broken = !isValidUrl(p?.images?.[0]);
                           return (
                              <div key={item._id} className="co-sum-item">
                                 {!broken && p.images?.[0]
                                    ? <img src={p.images[0]} alt={p.name} className="co-sum-img" onError={() => { }} />
                                    : <div className="co-sum-img-empty"><Package size={12} color="rgba(255,255,255,0.15)" /></div>
                                 }
                                 <span className="co-sum-name">{p.name}</span>
                                 <span className="co-sum-qty">×{item.quantity}</span>
                                 <span className="co-sum-price">{formatPrice(p.price * item.quantity)}</span>
                              </div>
                           );
                        })}
                     </div>

                     <div className="co-sum-divider" />

                     <div className="co-sum-row">
                        <span className="co-sum-label">Subtotal</span>
                        <span className="co-sum-value">{formatPrice(subtotal)}</span>
                     </div>
                     <div className="co-sum-row">
                        <span className="co-sum-label">Shipping</span>
                        <span className={`co-sum-value ${shipping === 0 ? "free" : ""}`}>
                           {shipping === 0 ? "FREE" : formatPrice(shipping)}
                        </span>
                     </div>
                     {discount > 0 && (
                        <div className="co-sum-row">
                           <span className="co-sum-label">Discount</span>
                           <span className="co-sum-value discount">− {formatPrice(discount)}</span>
                        </div>
                     )}

                     <div className="co-sum-divider" />

                     <div className="co-sum-total-row">
                        <span className="co-sum-total-label">Total</span>
                        <span className="co-sum-total-value">{formatPrice(total)}</span>
                     </div>

                     {/* Trust badges */}
                     <div className="co-trust">
                        <div className="co-trust-item"><Shield size={12} /> 100% Secure Payments</div>
                        <div className="co-trust-item"><Truck size={12} /> Free delivery above ₹500</div>
                        <div className="co-trust-item"><CheckCircle size={12} /> Easy 7-day returns</div>
                     </div>
                  </div>

               </div>
            </div>
         </div>
      </>
   );
}