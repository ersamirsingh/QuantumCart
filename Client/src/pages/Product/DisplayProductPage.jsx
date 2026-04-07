import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
   Zap, ShoppingCart, Heart, Star, Truck, Shield, RotateCcw,
   ChevronLeft, ChevronRight, Package, Minus, Plus, AlertTriangle,
   Check, X, Share2, MessageCircle
} from "lucide-react";
import { getProductById, getProducts } from "../../store/slices/product.slice";
import { addToCart } from "../../store/slices/cart.slice";

/* ── Helpers ── */
const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;

const isValidUrl = (str) => {
   try {
      return Boolean(new URL(str));
   } catch {
      return false;
   }
};

/* ── Stars Component ── */
function Stars({ rating, size = 11, showValue = false }) {
   return (
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
         {[1, 2, 3, 4, 5].map((n) => (
            <span
               key={n}
               style={{
                  color: n <= Math.round(rating) ? "#f59e0b" : "rgba(255,255,255,0.15)",
                  fontSize: size,
               }}
            >
               ★
            </span>
         ))}
         {showValue && rating > 0 && (
            <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, marginLeft: 4 }}>
               {rating.toFixed(1)}
            </span>
         )}
      </div>
   );
}

/* ── Image Gallery Component ── */
function ImageGallery({ images }) {
   const [activeIndex, setActiveIndex] = useState(0);
   const [imgErrors, setImgErrors] = useState({});

   const validImages = images.filter((img) => img && isValidUrl(img));
   const hasImages = validImages.length > 0;

   const handlePrev = () => {
      setActiveIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
   };

   const handleNext = () => {
      setActiveIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
   };

   if (!hasImages) {
      return (
         <div className="pv-gallery-empty">
            <Package size={64} color="rgba(255,255,255,0.15)" />
            <p>No images available</p>
         </div>
      );
   }

   return (
      <div className="pv-gallery">
         <div className="pv-gallery-main">
            {!imgErrors[activeIndex] ? (
               <img
                  src={validImages[activeIndex]}
                  alt={`Product ${activeIndex + 1}`}
                  className="pv-gallery-img"
                  onError={() => setImgErrors({ ...imgErrors, [activeIndex]: true })}
               />
            ) : (
               <div className="pv-gallery-img-error">
                  <Package size={48} color="rgba(255,255,255,0.15)" />
               </div>
            )}

            {validImages.length > 1 && (
               <>
                  <button className="pv-gallery-arrow left" onClick={handlePrev}>
                     <ChevronLeft size={20} />
                  </button>
                  <button className="pv-gallery-arrow right" onClick={handleNext}>
                     <ChevronRight size={20} />
                  </button>
               </>
            )}

            <div className="pv-gallery-counter">
               {activeIndex + 1} / {validImages.length}
            </div>
         </div>

         {validImages.length > 1 && (
            <div className="pv-gallery-thumbs">
               {validImages.map((img, index) => (
                  <button
                     key={index}
                     className={`pv-gallery-thumb ${index === activeIndex ? "active" : ""}`}
                     onClick={() => setActiveIndex(index)}
                  >
                     {!imgErrors[`thumb-${index}`] ? (
                        <img
                           src={img}
                           alt={`Thumb ${index + 1}`}
                           onError={() => setImgErrors({ ...imgErrors, [`thumb-${index}`]: true })}
                        />
                     ) : (
                        <Package size={16} color="rgba(255,255,255,0.2)" />
                     )}
                  </button>
               ))}
            </div>
         )}
      </div>
   );
}

/* ── Product Card Component ── */
function RelatedProductCard({ product }) {
   const navigate = useNavigate();
   const [wished, setWished] = useState(false);
   const [imgBroken, setImgBroken] = useState(!product.images?.[0]);

   return (
      <div className="pv-related-card" onClick={() => navigate(`/product/${product._id}`)}>
         <div className="pv-related-img-wrap">
            {!imgBroken && product.images?.[0] && isValidUrl(product.images[0]) ? (
               <img
                  src={product.images[0]}
                  alt={product.name}
                  className="pv-related-img"
                  onError={() => setImgBroken(true)}
               />
            ) : (
               <div className="pv-related-img-empty">
                  <Package size={24} color="rgba(255,255,255,0.15)" />
               </div>
            )}
            <button
               className="pv-related-wish"
               onClick={(e) => {
                  e.stopPropagation();
                  setWished(!wished);
               }}
            >
               <Heart size={12} fill={wished ? "#ec4899" : "none"} color={wished ? "#ec4899" : "rgba(255,255,255,0.5)"} />
            </button>
            {product.discount > 0 && (
               <span className="pv-related-disc">-{product.discount}%</span>
            )}
         </div>
         <div className="pv-related-body">
            <h4 className="pv-related-name">{product.name}</h4>
            <Stars rating={product.rating || 0} size={9} />
            <div className="pv-related-price">
               <span className="pv-related-price-now">{formatPrice(product.finalPrice)}</span>
               {product.discount > 0 && (
                  <span className="pv-related-price-was">{formatPrice(product.price)}</span>
               )}
            </div>
         </div>
      </div>
   );
}

/* ── Main Product View Page ── */
export default function DisplayProductPage() {
   const { id } = useParams();
   const navigate = useNavigate();
   const dispatch = useDispatch();

   // Redux state
   const { currentProduct, productLoading, error, products } = useSelector((state) => state.products);
   const { user } = useSelector((state) => state.auth);
   const { adding, successMessage } = useSelector((state) => state.cart);

   // Local state
   const [quantity, setQuantity] = useState(1);
   const [activeTab, setActiveTab] = useState("description"); // description, reviews, shipping

   // Fetch product on mount
   useEffect(() => {
      dispatch(getProductById(id));
      // Fetch all products for related products
      dispatch(getProducts());
   }, [id, dispatch]);

   // Reset quantity when product changes
   useEffect(() => {
      setQuantity(1);
   }, [currentProduct]);

   // Handlers
   const handleQuantityChange = (delta) => {
      const newQty = quantity + delta;
      if (newQty >= 1 && newQty <= (currentProduct?.stock || 1)) {
         setQuantity(newQty);
      }
   };

   const handleAddToCart = () => {
      if (!user) {
         navigate("/login");
         return;
      }
      dispatch(addToCart({ productId: id, quantity }));
   };

   // Get related products (exclude current, show max 4)
   const relatedProducts = products
      .filter((p) => p._id !== id && p.status === "ACTIVE")
      .slice(0, 4);

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .pv-root{min-height:100vh;background:#020408;font-family:'DM Sans',sans-serif;color:#fff;}
        .pv-bg{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,198,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,198,255,0.03) 1px,transparent 1px);background-size:60px 60px;}
        .pv-orb1{position:fixed;width:500px;height:500px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(0,198,255,0.08) 0%,transparent 68%);top:-200px;left:-160px;}
        .pv-orb2{position:fixed;width:400px;height:400px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 68%);bottom:-120px;right:-110px;}

        /* NAV */
        .pv-nav{position:sticky;top:0;z-index:100;height:60px;padding:0 28px;display:flex;align-items:center;gap:10px;background:rgba(2,4,8,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);}
        .pv-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;cursor:pointer;}
        .pv-nav-logo-box{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#00c6ff,#a855f7);display:flex;align-items:center;justify-content:center;}
        .pv-nav-logo-text{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;background:linear-gradient(135deg,#fff 40%,#00c6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .pv-nav-sep{color:rgba(255,255,255,0.15);margin:0 2px;}
        .pv-nav-page{font-size:13px;color:rgba(255,255,255,0.38);}
        .pv-nav-spacer{flex:1;}
        .pv-back-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);transition:all 0.18s;}
        .pv-back-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}

        /* PAGE */
        .pv-page{position:relative;z-index:1;max-width:1280px;margin:0 auto;padding:36px 24px 100px;}

        /* LOADING */
        .pv-loading{display:flex;align-items:center;justify-content:center;min-height:500px;gap:12px;color:rgba(255,255,255,0.4);font-size:14px;}
        .pv-spin{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,0.1);border-top-color:#00c6ff;animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        /* ERROR */
        .pv-error{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;text-align:center;}
        .pv-error-icon{width:64px;height:64px;border-radius:20px;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);display:flex;align-items:center;justify-content:center;}
        .pv-error-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#fff;}
        .pv-error-sub{font-size:14px;color:rgba(255,255,255,0.36);max-width:300px;}

        /* SUCCESS MESSAGE */
        .pv-success{display:flex;align-items:center;gap:10px;padding:13px 16px;border-radius:13px;background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.2);color:#22c55e;font-size:13px;font-weight:600;margin-bottom:20px;animation:pv-slide-in 0.3s ease;}
        @keyframes pv-slide-in{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}

        /* PRODUCT LAYOUT */
        .pv-product{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:60px;}
        @media(max-width:900px){.pv-product{grid-template-columns:1fr;gap:32px;}}

        /* IMAGE GALLERY */
        .pv-gallery{}
        .pv-gallery-main{position:relative;aspect-ratio:1;border-radius:20px;overflow:hidden;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;}
        .pv-gallery-img{width:100%;height:100%;object-fit:cover;}
        .pv-gallery-img-error{width:100%;height:100%;display:flex;align-items:center;justify-content:center;}
        .pv-gallery-empty{width:100%;aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:rgba(255,255,255,0.3);font-size:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;}

        .pv-gallery-arrow{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,0.1);background:rgba(2,4,8,0.8);backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);transition:all 0.2s;z-index:2;}
        .pv-gallery-arrow:hover{background:rgba(255,255,255,0.12);color:#fff;}
        .pv-gallery-arrow.left{left:12px;}
        .pv-gallery-arrow.right{right:12px;}

        .pv-gallery-counter{position:absolute;bottom:12px;right:12px;background:rgba(2,4,8,0.8);backdrop-filter:blur(8px);padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.1);}

        .pv-gallery-thumbs{display:flex;gap:8px;margin-top:12px;overflow-x:auto;padding-bottom:4px;}
        .pv-gallery-thumb{width:80px;height:80px;border-radius:12px;overflow:hidden;border:2px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
        .pv-gallery-thumb:hover{border-color:rgba(255,255,255,0.2);}
        .pv-gallery-thumb.active{border-color:rgba(0,198,255,0.5);box-shadow:0 0 0 2px rgba(0,198,255,0.15);}
        .pv-gallery-thumb img{width:100%;height:100%;object-fit:cover;}

        /* PRODUCT INFO */
        .pv-info{}
        .pv-info-header{margin-bottom:20px;}
        .pv-status-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;margin-bottom:12px;}
        .pv-status-badge.active{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);color:#22c55e;}
        .pv-status-badge.out{background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.25);color:#f87171;}

        .pv-title{font-family:'Syne',sans-serif;font-size:clamp(24px,3vw,32px);font-weight:800;color:#fff;letter-spacing:-0.8px;margin-bottom:12px;line-height:1.2;}

        .pv-rating-wrap{display:flex;align-items:center;gap:12px;margin-bottom:20px;}
        .pv-reviews-link{font-size:12px;color:rgba(255,255,255,0.45);text-decoration:none;transition:color 0.2s;}
        .pv-reviews-link:hover{color:#00c6ff;}

        .pv-price-section{padding:20px 0;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:24px;}
        .pv-price-main{font-family:'Syne',sans-serif;font-size:36px;font-weight:800;color:#00c6ff;margin-bottom:8px;}
        .pv-price-details{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
        .pv-price-original{font-size:18px;color:rgba(255,255,255,0.3);text-decoration:line-through;}
        .pv-price-save{font-size:14px;font-weight:700;color:#22c55e;padding:4px 10px;border-radius:6px;background:rgba(34,197,94,0.1);}

        .pv-stock-info{display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);font-size:13px;font-weight:600;color:#f59e0b;margin-bottom:24px;}

        .pv-desc{font-size:14px;line-height:1.7;color:rgba(255,255,255,0.5);margin-bottom:24px;}

        /* QUANTITY SELECTOR */
        .pv-qty-section{margin-bottom:24px;}
        .pv-qty-label{font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);margin-bottom:10px;letter-spacing:0.5px;}
        .pv-qty-control{display:inline-flex;align-items:center;gap:0;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);overflow:hidden;}
        .pv-qty-btn{width:42px;height:42px;border:none;background:rgba(255,255,255,0.04);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);transition:all 0.15s;}
        .pv-qty-btn:hover:not(:disabled){background:rgba(0,198,255,0.12);color:#00c6ff;}
        .pv-qty-btn:disabled{opacity:0.3;cursor:not-allowed;}
        .pv-qty-val{min-width:60px;text-align:center;font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#fff;}

        /* ACTION BUTTONS */
        .pv-actions{display:flex;gap:12px;margin-bottom:32px;flex-wrap:wrap;}
        .pv-add-cart-btn{flex:1;min-width:200px;padding:16px 28px;border-radius:14px;border:none;background:linear-gradient(135deg,#00c6ff,#a855f7);cursor:pointer;font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:#020408;display:flex;align-items:center;justify-content:center;gap:10px;transition:transform 0.2s,box-shadow 0.2s;}
        .pv-add-cart-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,198,255,0.3);}
        .pv-add-cart-btn:disabled{opacity:0.5;cursor:not-allowed;}

        .pv-wish-btn{width:54px;height:54px;border-radius:14px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.04);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);transition:all 0.2s;}
        .pv-wish-btn:hover{background:rgba(255,255,255,0.08);color:#ec4899;}
        .pv-share-btn{width:54px;height:54px;border-radius:14px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.04);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);transition:all 0.2s;}
        .pv-share-btn:hover{background:rgba(255,255,255,0.08);color:#00c6ff;}

        /* FEATURES */
        .pv-features{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:40px;}
        .pv-feature{padding:16px;border-radius:14px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.025);display:flex;align-items:center;gap:12px;}
        .pv-feature-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;}
        .pv-feature-text{flex:1;}
        .pv-feature-title{font-size:12px;font-weight:700;color:#fff;margin-bottom:2px;}
        .pv-feature-desc{font-size:11px;color:rgba(255,255,255,0.4);}

        /* TABS */
        .pv-tabs{margin-bottom:32px;}
        .pv-tabs-nav{display:flex;gap:8px;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:24px;}
        .pv-tab-btn{padding:12px 20px;border:none;background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:rgba(255,255,255,0.4);position:relative;transition:color 0.2s;}
        .pv-tab-btn:hover{color:rgba(255,255,255,0.7);}
        .pv-tab-btn.active{color:#00c6ff;}
        .pv-tab-btn.active::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(135deg,#00c6ff,#a855f7);}

        .pv-tab-content{font-size:14px;line-height:1.8;color:rgba(255,255,255,0.5);}

        /* RELATED PRODUCTS */
        .pv-related{margin-top:60px;}
        .pv-related-header{margin-bottom:24px;}
        .pv-related-title{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:#fff;margin-bottom:6px;}
        .pv-related-title span{background:linear-gradient(135deg,#00c6ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .pv-related-sub{font-size:13px;color:rgba(255,255,255,0.4);}

        .pv-related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;}

        .pv-related-card{border-radius:16px;background:rgba(255,255,255,0.028);border:1px solid rgba(255,255,255,0.07);overflow:hidden;cursor:pointer;transition:transform 0.25s,border-color 0.25s,box-shadow 0.25s;}
        .pv-related-card:hover{transform:translateY(-4px);border-color:rgba(255,255,255,0.14);box-shadow:0 16px 50px rgba(0,0,0,0.4);}

        .pv-related-img-wrap{position:relative;aspect-ratio:1;overflow:hidden;background:rgba(255,255,255,0.02);}
        .pv-related-img{width:100%;height:100%;object-fit:cover;transition:transform 0.4s;}
        .pv-related-card:hover .pv-related-img{transform:scale(1.06);}
        .pv-related-img-empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;}

        .pv-related-wish{position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:50%;background:rgba(2,4,8,0.75);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);transition:transform 0.2s;}
        .pv-related-wish:hover{transform:scale(1.1);}

        .pv-related-disc{position:absolute;bottom:8px;left:8px;background:#dc2626;color:#fff;padding:3px 7px;border-radius:5px;font-size:10px;font-weight:800;}

        .pv-related-body{padding:12px;}
        .pv-related-name{font-size:13px;font-weight:700;color:#fff;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}

        .pv-related-price{display:flex;align-items:center;gap:6px;margin-top:8px;}
        .pv-related-price-now{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;}
        .pv-related-price-was{font-size:11px;color:rgba(255,255,255,0.25);text-decoration:line-through;}
      `}</style>

         <div className="pv-root">
            <div className="pv-bg" />
            <div className="pv-orb1" />
            <div className="pv-orb2" />

            {/* NAV */}
            <nav className="pv-nav">
               <div className="pv-nav-logo" onClick={() => navigate("/")}>
                  <div className="pv-nav-logo-box">
                     <Zap size={16} color="#020408" strokeWidth={2.5} />
                  </div>
                  <span className="pv-nav-logo-text">QuantumCart</span>
               </div>
               <span className="pv-nav-sep">/</span>
               <span className="pv-nav-page">Product Details</span>
               <div className="pv-nav-spacer" />
               <button className="pv-back-btn" onClick={() => navigate("/products")}>
                  ← Back to Products
               </button>
            </nav>

            <div className="pv-page">
               {/* SUCCESS MESSAGE */}
               {successMessage && (
                  <div className="pv-success">
                     <Check size={15} /> {successMessage}
                  </div>
               )}

               {/* LOADING */}
               {productLoading && (
                  <div className="pv-loading">
                     <div className="pv-spin" /> Loading product details…
                  </div>
               )}

               {/* ERROR */}
               {!productLoading && error && (
                  <div className="pv-error">
                     <div className="pv-error-icon">
                        <AlertTriangle size={28} color="#f87171" />
                     </div>
                     <h2 className="pv-error-title">Product Not Found</h2>
                     <p className="pv-error-sub">{error}</p>
                     <button className="pv-back-btn" onClick={() => navigate("/products")}>
                        ← Browse All Products
                     </button>
                  </div>
               )}

               {/* PRODUCT CONTENT */}
               {!productLoading && !error && currentProduct && (
                  <>
                     <div className="pv-product">
                        {/* IMAGE GALLERY */}
                        <ImageGallery images={currentProduct.images || []} />

                        {/* PRODUCT INFO */}
                        <div className="pv-info">
                           <div className="pv-info-header">
                              <div
                                 className={`pv-status-badge ${
                                    currentProduct.status === "ACTIVE" ? "active" : "out"
                                 }`}
                              >
                                 {currentProduct.status === "ACTIVE" ? (
                                    <>
                                       <Check size={12} /> In Stock
                                    </>
                                 ) : (
                                    <>
                                       <X size={12} /> Out of Stock
                                    </>
                                 )}
                              </div>

                              <h1 className="pv-title">{currentProduct.name}</h1>

                              <div className="pv-rating-wrap">
                                 <Stars rating={currentProduct.rating || 0} size={14} showValue />
                                 <a href="#reviews" className="pv-reviews-link">
                                    View Reviews
                                 </a>
                              </div>
                           </div>

                           {/* PRICE */}
                           <div className="pv-price-section">
                              <div className="pv-price-main">{formatPrice(currentProduct.finalPrice)}</div>
                              {currentProduct.discount > 0 && (
                                 <div className="pv-price-details">
                                    <span className="pv-price-original">
                                       {formatPrice(currentProduct.price)}
                                    </span>
                                    <span className="pv-price-save">
                                       Save {currentProduct.discount}%
                                    </span>
                                 </div>
                              )}
                           </div>

                           {/* STOCK WARNING */}
                           {currentProduct.status === "ACTIVE" && currentProduct.stock <= 10 && (
                              <div className="pv-stock-info">
                                 <AlertTriangle size={16} />
                                 Only {currentProduct.stock} left in stock - order soon!
                              </div>
                           )}

                           {/* DESCRIPTION */}
                           {currentProduct.description && (
                              <p className="pv-desc">{currentProduct.description}</p>
                           )}

                           {/* QUANTITY */}
                           {currentProduct.status === "ACTIVE" && (
                              <div className="pv-qty-section">
                                 <div className="pv-qty-label">QUANTITY</div>
                                 <div className="pv-qty-control">
                                    <button
                                       className="pv-qty-btn"
                                       onClick={() => handleQuantityChange(-1)}
                                       disabled={quantity <= 1}
                                    >
                                       <Minus size={16} />
                                    </button>
                                    <div className="pv-qty-val">{quantity}</div>
                                    <button
                                       className="pv-qty-btn"
                                       onClick={() => handleQuantityChange(1)}
                                       disabled={quantity >= currentProduct.stock}
                                    >
                                       <Plus size={16} />
                                    </button>
                                 </div>
                              </div>
                           )}

                           {/* ACTIONS */}
                           <div className="pv-actions">
                              <button
                                 className="pv-add-cart-btn"
                                 onClick={handleAddToCart}
                                 disabled={currentProduct.status !== "ACTIVE" || adding}
                              >
                                 {adding ? (
                                    <>
                                       <div className="pv-spin" style={{ width: 16, height: 16 }} />
                                       Adding...
                                    </>
                                 ) : (
                                    <>
                                       <ShoppingCart size={18} />
                                       Add to Cart
                                    </>
                                 )}
                              </button>
                              <button className="pv-wish-btn">
                                 <Heart size={20} />
                              </button>
                              <button className="pv-share-btn">
                                 <Share2 size={18} />
                              </button>
                           </div>

                           {/* FEATURES */}
                           <div className="pv-features">
                              <div className="pv-feature">
                                 <div
                                    className="pv-feature-icon"
                                    style={{ background: "rgba(0,198,255,0.1)", color: "#00c6ff" }}
                                 >
                                    <Truck size={18} />
                                 </div>
                                 <div className="pv-feature-text">
                                    <div className="pv-feature-title">Free Delivery</div>
                                    <div className="pv-feature-desc">Orders over ₹499</div>
                                 </div>
                              </div>

                              <div className="pv-feature">
                                 <div
                                    className="pv-feature-icon"
                                    style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}
                                 >
                                    <Shield size={18} />
                                 </div>
                                 <div className="pv-feature-text">
                                    <div className="pv-feature-title">Secure Payment</div>
                                    <div className="pv-feature-desc">100% Protected</div>
                                 </div>
                              </div>

                              <div className="pv-feature">
                                 <div
                                    className="pv-feature-icon"
                                    style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}
                                 >
                                    <RotateCcw size={18} />
                                 </div>
                                 <div className="pv-feature-text">
                                    <div className="pv-feature-title">Easy Returns</div>
                                    <div className="pv-feature-desc">30-day policy</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* TABS */}
                     <div className="pv-tabs">
                        <div className="pv-tabs-nav">
                           <button
                              className={`pv-tab-btn ${activeTab === "description" ? "active" : ""}`}
                              onClick={() => setActiveTab("description")}
                           >
                              Description
                           </button>
                           <button
                              className={`pv-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
                              onClick={() => setActiveTab("reviews")}
                           >
                              Reviews
                           </button>
                           <button
                              className={`pv-tab-btn ${activeTab === "shipping" ? "active" : ""}`}
                              onClick={() => setActiveTab("shipping")}
                           >
                              Shipping & Returns
                           </button>
                        </div>

                        <div className="pv-tab-content">
                           {activeTab === "description" && (
                              <div>
                                 <p>
                                    {currentProduct.description ||
                                       "Detailed product description coming soon."}
                                 </p>
                              </div>
                           )}

                           {activeTab === "reviews" && (
                              <div id="reviews">
                                 <p>Customer reviews will appear here. Be the first to review this product!</p>
                              </div>
                           )}

                           {activeTab === "shipping" && (
                              <div>
                                 <p>
                                    <strong>Free Shipping:</strong> Orders over ₹499
                                    <br />
                                    <strong>Standard Delivery:</strong> 3-5 business days
                                    <br />
                                    <strong>Returns:</strong> 30-day return policy
                                    <br />
                                    <strong>Warranty:</strong> Manufacturer warranty included
                                 </p>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* RELATED PRODUCTS */}
                     {relatedProducts.length > 0 && (
                        <div className="pv-related">
                           <div className="pv-related-header">
                              <h2 className="pv-related-title">
                                 You May Also <span>Like</span>
                              </h2>
                              <p className="pv-related-sub">Similar products that might interest you</p>
                           </div>

                           <div className="pv-related-grid">
                              {relatedProducts.map((product) => (
                                 <RelatedProductCard key={product._id} product={product} />
                              ))}
                           </div>
                        </div>
                     )}
                  </>
               )}
            </div>
         </div>
      </>
   );
}