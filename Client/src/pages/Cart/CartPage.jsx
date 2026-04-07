import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
   Zap, ShoppingCart, Plus, Minus, Trash2, X, Package,
   AlertTriangle, ShoppingBag, ArrowRight, CheckCircle,
} from "lucide-react";
import {
   fetchCart,
   addToCart,
   removeFromCart,
   clearCart,
   clearSuccessMessage,
   removeItemCompletely,
} from "../../store/slices/cart.slice";
import LoadingPage from "../../components/LoadingPage";

const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;

const isValidUrl = (str) => {
   try { 
      return Boolean(new URL(str));
   } catch { 
      return false; 
   }
};



function CartItem({ item, updating }) {

   const product = item.productId;
   const quantity = item.quantity;
   const dispatch = useDispatch();

   const [imgBroken, setImgBroken] = React.useState(
      !isValidUrl(product?.images?.[0])
   );

   if (!product) return null;

   const subtotal = product.price * quantity;

   return (
      <div className="cart-item">
         <div className="cart-item-img-wrap">
            {!imgBroken && product.images?.[0] ? (
               <img
                  src={product.images[0]}
                  alt={product.name}
                  className="cart-item-img"
                  onError={() => setImgBroken(true)}
               />
            ) : (
               <div className="cart-item-img-empty">
                  <Package size={24} color="rgba(255,255,255,0.15)" />
               </div>
            )}
         </div>

         <div className="cart-item-info">
            <h3 className="cart-item-name">{product.name}</h3>
            <div className="cart-item-meta">
               <span className="cart-item-price">{formatPrice(product.price)}</span>
               <span className="cart-item-per">per unit</span>
            </div>
            <span className="cart-item-id">SKU: {product._id.slice(-8).toUpperCase()}</span>
         </div>

         <div className="cart-item-qty">
            <button
               className="cart-qty-btn"
               onClick={() => dispatch(removeFromCart(product._id))}
               disabled={updating || quantity <= 1}
               title="Decrease"
            >
               <Minus size={14} />
            </button>
            <span className="cart-qty-val">{quantity}</span>
            <button
               className="cart-qty-btn"
               onClick={() => dispatch(addToCart({ productId: product._id, quantity: 1 }))}
               disabled={updating}
               title="Increase"
            >
               <Plus size={14} />
            </button>
         </div>

         <div className="cart-item-subtotal">
            <span className="cart-subtotal-val">{formatPrice(subtotal)}</span>
            <span className="cart-subtotal-units">{quantity} × {formatPrice(product.price)}</span>
         </div>

         <button
            className="cart-item-remove"
            onClick={() => { dispatch(removeItemCompletely(product._id)) }}
            disabled={updating}
            title="Remove from cart"
         >
            <X size={16} />
         </button>
      </div>
   );
}



export default function CartPage() {
   const navigate = useNavigate();
   const dispatch = useDispatch();

   const {
      cart, loading, error,
      adding, removing, clearing, successMessage,
   } = useSelector((state) => state.cart);

   useEffect(() => {
      if (!cart) dispatch(fetchCart());
   }, [dispatch, cart]);

   useEffect(() => {
      if (successMessage) {
         const t = setTimeout(() => dispatch(clearSuccessMessage()), 2500);
         return () => clearTimeout(t);
      }
   }, [successMessage, dispatch]);


   const handleClearCart = () => dispatch(clearCart());

   const validItems = cart?.items?.filter((item) => {
      return item.productId
   });

   const backendTotal = cart?.totalPrice ?? 0;

   const subtotal = validItems?.reduce(
      (sum, item) => sum + (item.productId?.price ?? 0) * item.quantity,
      0
   );
   const shipping = subtotal > 500 ? 0 : 50;
   const tax = Math.round(backendTotal - subtotal - shipping);

   const isUpdating = adding || removing;

   if (loading) return <LoadingPage />;

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        /* ROOT */
        .cart-root{min-height:100vh;background:#020408;font-family:'DM Sans',sans-serif;color:#fff;overflow-x:hidden;}
        .cart-bg{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,198,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,198,255,0.03) 1px,transparent 1px);background-size:60px 60px;}
        .cart-orb1{position:fixed;width:520px;height:520px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(0,198,255,0.09) 0%,transparent 68%);top:-210px;left:-170px;}
        .cart-orb2{position:fixed;width:420px;height:420px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 68%);bottom:-130px;right:-110px;}

        /* NAV */
        .cart-nav{position:sticky;top:0;z-index:100;height:60px;padding:0 28px;display:flex;align-items:center;gap:10px;background:rgba(2,4,8,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);}
        .cart-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;}
        .cart-nav-logo-box{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#00c6ff,#a855f7);display:flex;align-items:center;justify-content:center;}
        .cart-nav-logo-text{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;background:linear-gradient(135deg,#fff 40%,#00c6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .cart-nav-sep{color:rgba(255,255,255,0.15);margin:0 4px;}
        .cart-nav-page{font-size:13px;color:rgba(255,255,255,0.38);}
        .cart-nav-spacer{flex:1;}
        .cart-nav-badge{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;background:rgba(0,198,255,0.08);border:1px solid rgba(0,198,255,0.18);color:#00c6ff;font-size:11px;font-weight:700;}
        .cart-nav-badge-num{font-family:'Syne',sans-serif;font-size:13px;font-weight:800;}

        /* PAGE WRAPPER */
        .cart-page{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:36px 24px 100px;}

        /* HEADER */
        .cart-header{margin-bottom:28px;}
        .cart-title{font-family:'Syne',sans-serif;font-size:clamp(24px,3.5vw,32px);font-weight:800;letter-spacing:-0.8px;margin-bottom:6px;}
        .cart-title span{background:linear-gradient(135deg,#00c6ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .cart-subtitle{font-size:14px;color:rgba(255,255,255,0.38);}

        /* BANNERS */
        .cart-success{display:flex;align-items:center;gap:10px;padding:13px 16px;border-radius:13px;background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.2);color:#22c55e;font-size:13px;font-weight:600;margin-bottom:18px;animation:slide-in 0.3s ease;}
        .cart-error{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:13px;background:rgba(248,113,113,0.07);border:1px solid rgba(248,113,113,0.2);color:#f87171;font-size:13px;font-weight:600;margin-bottom:18px;}
        @keyframes slide-in{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}

        /* LAYOUT */
        .cart-layout{display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start;}
        @media(max-width:880px){.cart-layout{grid-template-columns:1fr;}}

        /* ITEMS PANEL */
        .cart-items-section{background:rgba(255,255,255,0.028);border:1px solid rgba(255,255,255,0.08);border-radius:22px;padding:28px;backdrop-filter:blur(12px);}
        .cart-items-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;flex-wrap:wrap;gap:12px;}
        .cart-items-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;display:flex;align-items:center;gap:8px;}
        .cart-items-count{font-size:12px;color:rgba(255,255,255,0.35);margin-top:2px;}
        .cart-clear-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;border:1px solid rgba(248,113,113,0.2);background:rgba(248,113,113,0.05);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;color:#f87171;transition:all 0.18s;}
        .cart-clear-btn:hover:not(:disabled){background:rgba(248,113,113,0.12);border-color:rgba(248,113,113,0.35);}
        .cart-clear-btn:disabled{opacity:0.4;cursor:not-allowed;}

        /* CART ITEM ROW */
        .cart-item{display:grid;grid-template-columns:76px 1fr auto 110px 36px;gap:16px;align-items:center;padding:16px;border-radius:16px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);margin-bottom:10px;transition:background 0.18s,border-color 0.18s;animation:item-in 0.3s ease both;}
        @keyframes item-in{from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);}}
        .cart-item:last-child{margin-bottom:0;}
        .cart-item:hover{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.1);}
        @media(max-width:680px){
          .cart-item{grid-template-columns:60px 1fr 36px;grid-template-rows:auto auto auto;}
          .cart-item-qty{grid-column:1/3;}
          .cart-item-subtotal{grid-column:1/3;}
          .cart-item-remove{grid-column:3;grid-row:1;}
        }

        /* Image */
        .cart-item-img-wrap{width:76px;height:76px;border-radius:12px;overflow:hidden;flex-shrink:0;}
        .cart-item-img{width:100%;height:100%;object-fit:cover;}
        .cart-item-img-empty{width:100%;height:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;display:flex;align-items:center;justify-content:center;}

        /* Info */
        .cart-item-info{min-width:0;}
        .cart-item-name{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;margin-bottom:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .cart-item-meta{display:flex;align-items:center;gap:8px;margin-bottom:4px;}
        .cart-item-price{font-size:13px;font-weight:700;color:#fff;}
        .cart-item-per{font-size:11px;color:rgba(255,255,255,0.28);}
        .cart-item-id{font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:0.05em;font-family:'DM Sans',monospace;}

        /* Quantity */
        .cart-item-qty{display:flex;align-items:center;gap:8px;padding:5px 7px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);width:fit-content;}
        .cart-qty-btn{width:28px;height:28px;border-radius:7px;border:none;background:rgba(255,255,255,0.06);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);transition:all 0.15s;}
        .cart-qty-btn:hover:not(:disabled){background:rgba(0,198,255,0.12);color:#00c6ff;}
        .cart-qty-btn:disabled{opacity:0.3;cursor:not-allowed;}
        .cart-qty-val{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;min-width:28px;text-align:center;}

        /* Subtotal */
        .cart-item-subtotal{text-align:right;}
        .cart-subtotal-val{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#fff;display:block;}
        .cart-subtotal-units{font-size:10px;color:rgba(255,255,255,0.25);display:block;margin-top:2px;}

        /* Remove */
        .cart-item-remove{width:34px;height:34px;border-radius:8px;border:1px solid rgba(248,113,113,0.15);background:rgba(248,113,113,0.05);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#f87171;transition:all 0.15s;flex-shrink:0;}
        .cart-item-remove:hover:not(:disabled){background:rgba(248,113,113,0.12);border-color:rgba(248,113,113,0.3);}
        .cart-item-remove:disabled{opacity:0.4;cursor:not-allowed;}

        /* EMPTY */
        .cart-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:340px;gap:16px;text-align:center;}
        .cart-empty-icon{width:70px;height:70px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;}
        .cart-empty-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;}
        .cart-empty-sub{font-size:14px;color:rgba(255,255,255,0.36);max-width:300px;line-height:1.6;}
        .cart-empty-btn{display:flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#00c6ff,#a855f7);cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#020408;transition:transform 0.2s,box-shadow 0.2s;}
        .cart-empty-btn:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,198,255,0.28);}

        /* SUMMARY */
        .cart-summary{position:sticky;top:76px;background:rgba(255,255,255,0.028);border:1px solid rgba(255,255,255,0.08);border-radius:22px;padding:26px;backdrop-filter:blur(12px);}
        .cart-summary-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;margin-bottom:20px;}

        /* Summary meta from API */
        .cart-summary-meta{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;}
        .cart-summary-meta-tag{font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;background:rgba(0,198,255,0.07);border:1px solid rgba(0,198,255,0.15);color:#00c6ff;}

        .cart-summary-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
        .cart-summary-row:last-of-type{border-bottom:none;}
        .cart-summary-label{font-size:13px;color:rgba(255,255,255,0.42);font-weight:500;}
        .cart-summary-value{font-size:13px;color:rgba(255,255,255,0.8);font-weight:700;}
        .cart-summary-value.free{color:#22c55e;}
        .cart-summary-divider{height:1px;background:rgba(255,255,255,0.08);margin:12px 0;}
        .cart-summary-total{display:flex;justify-content:space-between;align-items:center;padding:14px 0 0;}
        .cart-summary-total-label{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;}
        .cart-summary-total-value{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;background:linear-gradient(135deg,#00c6ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}

        /* Shipping nudge */
        .cart-shipping-note{font-size:11px;color:rgba(255,255,255,0.3);margin-top:12px;padding:10px 12px;border-radius:8px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.05);line-height:1.5;}
        .cart-shipping-note b{color:#00c6ff;}

        /* Buttons */
        .cart-checkout-btn{width:100%;margin-top:18px;padding:14px;border-radius:13px;border:none;background:linear-gradient(135deg,#00c6ff,#a855f7);cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#020408;display:flex;align-items:center;justify-content:center;gap:8px;transition:transform 0.2s,box-shadow 0.2s;position:relative;overflow:hidden;}
        .cart-checkout-btn::before{content:'';position:absolute;inset:0;background:rgba(255,255,255,0.1);opacity:0;transition:opacity 0.2s;}
        .cart-checkout-btn:hover::before{opacity:1;}
        .cart-checkout-btn:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,198,255,0.28);}
        .cart-continue-btn{width:100%;margin-top:10px;padding:12px;border-radius:13px;border:1px solid rgba(255,255,255,0.08);background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.45);transition:all 0.18s;}
        .cart-continue-btn:hover{background:rgba(255,255,255,0.04);color:#fff;}

        /* Spinner */
        .cart-spin{border-radius:50%;border:2px solid rgba(255,255,255,0.1);border-top-color:#00c6ff;animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

         <div className="cart-root">
            <div className="cart-bg" />
            <div className="cart-orb1" />
            <div className="cart-orb2" />

            {/* ── NAV ── */}
            <nav className="cart-nav">
               <a href="/" className="cart-nav-logo">
                  <div className="cart-nav-logo-box">
                     <Zap size={16} color="#020408" strokeWidth={2.5} />
                  </div>
                  <span className="cart-nav-logo-text">myShop</span>
               </a>
               <span className="cart-nav-sep">/</span>
               <span className="cart-nav-page">Shopping Cart</span>
               <div className="cart-nav-spacer" />
               {cart && (
                  <div className="cart-nav-badge">
                     <ShoppingCart size={13} />
                     <span className="cart-nav-badge-num">{validItems.length}</span>
                     {validItems.length === 1 ? "item" : "items"}
                  </div>
               )}
            </nav>

            <div className="cart-page">

               <div className="cart-header">
                  <h1 className="cart-title">Shopping <span>Cart</span></h1>
                  <p className="cart-subtitle">Review your items and proceed to checkout.</p>
               </div>

               {successMessage && (
                  <div className="cart-success">
                     <CheckCircle size={15} /> {successMessage}
                  </div>
               )}

               {error && (
                  <div className="cart-error">
                     <AlertTriangle size={15} /> {error}
                  </div>
               )}

               {/* ── CONTENT ── */}
               {cart && (
                  validItems.length === 0 ? (
                     <div className="cart-items-section">
                        <div className="cart-empty">
                           <div className="cart-empty-icon">
                              <ShoppingBag size={32} color="rgba(255,255,255,0.15)" />
                           </div>
                           <h2 className="cart-empty-title">Your cart is empty</h2>
                           <p className="cart-empty-sub">
                              Browse our collection and add items to get started.
                           </p>
                           <button className="cart-empty-btn" onClick={() => navigate("/products")}>
                              <ShoppingBag size={15} /> Browse Products
                           </button>
                        </div>
                     </div>
                  ) : (
                     <div className="cart-layout">

                        {/* ── LEFT: ITEMS ── */}
                        <div className="cart-items-section">
                           <div className="cart-items-header">
                              <div>
                                 <div className="cart-items-title">
                                    <ShoppingCart size={16} /> Cart Items
                                 </div>
                                 <div className="cart-items-count">
                                    {validItems.length} item{validItems.length !== 1 ? "s" : ""} in your cart
                                 </div>
                              </div>
                              <button
                                 className="cart-clear-btn"
                                 onClick={handleClearCart}
                                 disabled={clearing || isUpdating}
                              >
                                 {clearing
                                    ? <><div className="cart-spin" style={{ width: 12, height: 12 }} /> Clearing…</>
                                    : <><Trash2 size={13} /> Clear Cart</>
                                 }
                              </button>
                           </div>

                           {/* Render items — using item.productId as the product object */}
                           {validItems.map((item) => (
                              <CartItem
                                 key={item._id}
                                 item={item}
                                 updating={isUpdating}
                              />
                           ))}
                        </div>

                        {/* ── RIGHT: SUMMARY ── */}
                        <div className="cart-summary">
                           <div className="cart-summary-title">Order Summary</div>

                           {/* API-level cart metadata tags */}
                           <div className="cart-summary-meta">
                              <span className="cart-summary-meta-tag">
                                 {validItems.length} Products
                              </span>
                              <span className="cart-summary-meta-tag">
                                 {validItems.reduce((s, i) => s + i.quantity, 0)} Units
                              </span>
                           </div>

                           {/* Line items */}
                           <div className="cart-summary-row">
                              <span className="cart-summary-label">Subtotal</span>
                              <span className="cart-summary-value">{formatPrice(subtotal)}</span>
                           </div>
                           <div className="cart-summary-row">
                              <span className="cart-summary-label">Shipping</span>
                              <span className={`cart-summary-value ${shipping === 0 ? "free" : ""}`}>
                                 {shipping === 0 ? "FREE" : formatPrice(shipping)}
                              </span>
                           </div>
                           {tax > 0 && (
                              <div className="cart-summary-row">
                                 <span className="cart-summary-label">Tax & Fees</span>
                                 <span className="cart-summary-value">{formatPrice(tax)}</span>
                              </div>
                           )}

                           <div className="cart-summary-divider" />

                           {/* Total — from backend totalPrice */}
                           <div className="cart-summary-total">
                              <span className="cart-summary-total-label">Total</span>
                              <span className="cart-summary-total-value">{formatPrice(backendTotal)}</span>
                           </div>

                           {/* Free shipping nudge */}
                           {subtotal < 500 && (
                              <div className="cart-shipping-note">
                                 Add <b>{formatPrice(500 - subtotal)}</b> more for free shipping
                              </div>
                           )}

                           <button
                              className="cart-checkout-btn"
                              onClick={() => navigate("/checkout")}
                           >
                              Proceed to Checkout <ArrowRight size={16} />
                           </button>
                           <button
                              className="cart-continue-btn"
                              onClick={() => navigate("/products")}
                           >
                              Continue Shopping
                           </button>
                        </div>

                     </div>
                  )
               )}
            </div>
         </div>
      </>
   );
}