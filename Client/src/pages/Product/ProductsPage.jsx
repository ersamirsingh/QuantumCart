import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
   Zap, Search, ShoppingCart, Heart, Star, SlidersHorizontal,
   X, Package, AlertTriangle, RefreshCw, Filter, ChevronDown, Grid3x3, List
} from "lucide-react";
import {
   getProducts,
   selectFilteredProducts,
   selectCategories,
   selectProductStats,
   setSearchFilter,
   setCategoryFilter,
   setStatusFilter,
   setPriceRangeFilter,
   setSortBy,
   resetFilters,
} from "../../store/slices/product.slice";
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
function Stars({ rating }) {
   return (
      <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
         {[1, 2, 3, 4, 5].map((n) => (
            <span
               key={n}
               style={{
                  color: n <= Math.round(rating) ? "#f59e0b" : "rgba(255,255,255,0.15)",
                  fontSize: 11,
               }}
            >
               ★
            </span>
         ))}
      </div>
   );
}

/* ── Product Card Component ── */
function ProductCard({ product, onAddToCart }) {
   const navigate = useNavigate();
   const [wished, setWished] = useState(false);
   const [imgBroken, setImgBroken] = useState(!isValidUrl(product.images?.[0]));

   const handleAddToCart = (e) => {
      e.stopPropagation();
      onAddToCart(product._id);
   };

   return (
      <div className="prod-card" onClick={() => navigate(`/product/${product._id}`)}>
         <div className="prod-img-wrap">
            {!imgBroken && product.images?.[0] ? (
               <img
                  src={product.images[0]}
                  alt={product.name}
                  className="prod-img"
                  onError={() => setImgBroken(true)}
               />
            ) : (
               <div className="prod-img-empty">
                  <Package size={32} color="rgba(255,255,255,0.15)" />
               </div>
            )}

            <div className="prod-overlay">
               <button className="prod-cart-btn" onClick={handleAddToCart}>
                  <ShoppingCart size={16} /> Add to Cart
               </button>
            </div>

            <button
               className="prod-wish"
               onClick={(e) => {
                  e.stopPropagation();
                  setWished(!wished);
               }}
            >
               <Heart size={15} fill={wished ? "#ec4899" : "none"} color={wished ? "#ec4899" : "rgba(255,255,255,0.5)"} />
            </button>

            {product.discount > 0 && (
               <span className="prod-disc">-{product.discount}%</span>
            )}

            {product.stock === 0 && (
               <span className="prod-out-badge">Out of Stock</span>
            )}
         </div>

         <div className="prod-body">
            <h4 className="prod-name">{product.name}</h4>
            {product.description && (
               <p className="prod-desc">{product.description}</p>
            )}

            <div className="prod-rating-wrap">
               <Stars rating={product.rating} />
               {product.rating > 0 && (
                  <span className="prod-rating-val">({product.rating})</span>
               )}
            </div>

            <div className="prod-price-wrap">
               <span className="prod-price-now">{formatPrice(product.finalPrice)}</span>
               {product.discount > 0 && (
                  <span className="prod-price-was">{formatPrice(product.price)}</span>
               )}
            </div>

            {product.stock > 0 && product.stock <= 10 && (
               <span className="prod-low-stock">Only {product.stock} left</span>
            )}
         </div>
      </div>
   );
}

/* ── Main Products Page ── */
export default function ProductsPage() {
   const navigate = useNavigate();
   const dispatch = useDispatch();

   // Redux state
   const { loading, error, filters } = useSelector((state) => state.products);
   const filteredProducts = useSelector(selectFilteredProducts);
   const categories = useSelector(selectCategories);
   const stats = useSelector(selectProductStats);
   const { user } = useSelector((state) => state.auth);

   // Local state
   const [filterOpen, setFilterOpen] = useState(false);
   const [viewMode, setViewMode] = useState("grid"); // grid or list

   // Fetch products on mount
   useEffect(() => {
      dispatch(getProducts());
   }, [dispatch]);

   // Handlers
   const handleSearch = (e) => {
      dispatch(setSearchFilter(e.target.value));
   };

   const handleCategoryFilter = (category) => {
      dispatch(setCategoryFilter(category));
   };

   const handleStatusFilter = (status) => {
      dispatch(setStatusFilter(status));
   };

   const handleSortChange = (e) => {
      dispatch(setSortBy(e.target.value));
   };

   const handlePriceRange = (e) => {
      const value = parseInt(e.target.value);
      dispatch(setPriceRangeFilter([0, value]));
   };

   const handleResetFilters = () => {
      dispatch(resetFilters());
   };

   const handleAddToCart = (productId) => {
      if (!user) {
         navigate("/login");
         return;
      }
      dispatch(addToCart({ productId, quantity: 1 }));
   };

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .prod-root{min-height:100vh;background:#020408;font-family:'DM Sans',sans-serif;color:#fff;}
        .prod-bg{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,198,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,198,255,0.03) 1px,transparent 1px);background-size:60px 60px;}
        .prod-orb1{position:fixed;width:500px;height:500px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(0,198,255,0.08) 0%,transparent 68%);top:-200px;left:-160px;}
        .prod-orb2{position:fixed;width:400px;height:400px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 68%);bottom:-120px;right:-110px;}

        /* NAV */
        .prod-nav{position:sticky;top:0;z-index:100;height:60px;padding:0 28px;display:flex;align-items:center;gap:10px;background:rgba(2,4,8,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);}
        .prod-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;cursor:pointer;}
        .prod-nav-logo-box{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#00c6ff,#a855f7);display:flex;align-items:center;justify-content:center;}
        .prod-nav-logo-text{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;background:linear-gradient(135deg,#fff 40%,#00c6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .prod-nav-sep{color:rgba(255,255,255,0.15);margin:0 2px;}
        .prod-nav-page{font-size:13px;color:rgba(255,255,255,0.38);}
        .prod-nav-spacer{flex:1;}
        .prod-back-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);transition:all 0.18s;}
        .prod-back-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}

        /* PAGE */
        .prod-page{position:relative;z-index:1;max-width:1400px;margin:0 auto;padding:36px 24px 100px;}

        /* HEADER */
        .prod-header{margin-bottom:32px;}
        .prod-title{font-family:'Syne',sans-serif;font-size:clamp(26px,3.5vw,36px);font-weight:800;color:#fff;letter-spacing:-1px;margin-bottom:6px;}
        .prod-title span{background:linear-gradient(135deg,#00c6ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .prod-subtitle{font-size:14px;color:rgba(255,255,255,0.38);line-height:1.6;}

        /* STATS BAR */
        .prod-stats{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;}
        .prod-stat{padding:12px 18px;border-radius:13px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.025);display:flex;flex-direction:column;gap:2px;min-width:80px;}
        .prod-stat-val{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#00c6ff;}
        .prod-stat-lbl{font-size:10px;color:rgba(255,255,255,0.32);font-weight:600;letter-spacing:0.5px;}

        /* ERROR */
        .prod-error{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:13px;background:rgba(248,113,113,0.07);border:1px solid rgba(248,113,113,0.2);color:#f87171;font-size:13px;font-weight:600;margin-bottom:20px;}

        /* LOADING */
        .prod-loading{display:flex;align-items:center;justify-content:center;min-height:400px;gap:12px;color:rgba(255,255,255,0.4);font-size:14px;}
        .prod-spin{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,0.1);border-top-color:#00c6ff;animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        /* CONTROLS BAR */
        .prod-controls{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;align-items:center;}
        .prod-search-wrap{flex:1;min-width:240px;position:relative;}
        .prod-search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.28);pointer-events:none;}
        .prod-search{width:100%;padding:11px 14px 11px 42px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .prod-search::placeholder{color:rgba(255,255,255,0.2);}
        .prod-search:focus{border-color:rgba(0,198,255,0.45);box-shadow:0 0 0 3px rgba(0,198,255,0.07);}

        .prod-filter-btn{display:flex;align-items:center;gap:6px;padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);transition:all 0.18s;}
        .prod-filter-btn:hover{background:rgba(255,255,255,0.07);color:#fff;}
        .prod-filter-btn.active{background:rgba(0,198,255,0.1);border-color:rgba(0,198,255,0.3);color:#00c6ff;}

        .prod-sort-select{padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;outline:none;cursor:pointer;}

        .prod-view-toggle{display:flex;gap:4px;}
        .prod-view-btn{width:38px;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.45);transition:all 0.18s;}
        .prod-view-btn:hover{background:rgba(255,255,255,0.07);color:#fff;}
        .prod-view-btn.active{background:rgba(0,198,255,0.1);border-color:rgba(0,198,255,0.3);color:#00c6ff;}

        /* CATEGORY TABS */
        .prod-cats{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;overflow-x:auto;padding-bottom:8px;}
        .prod-cat-tab{padding:9px 18px;border-radius:50px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;color:rgba(255,255,255,0.45);transition:all 0.18s;white-space:nowrap;}
        .prod-cat-tab:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.8);}
        .prod-cat-tab.active{background:linear-gradient(135deg,#00c6ff,#a855f7);border-color:transparent;color:#020408;}

        /* FILTER PANEL */
        .prod-filter-panel{position:fixed;top:0;right:0;bottom:0;width:320px;background:rgba(10,14,22,0.97);backdrop-filter:blur(24px);border-left:1px solid rgba(255,255,255,0.1);z-index:200;padding:24px;overflow-y:auto;transform:translateX(100%);transition:transform 0.3s;}
        .prod-filter-panel.open{transform:translateX(0);}
        .prod-filter-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
        .prod-filter-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#fff;}
        .prod-filter-close{width:32px;height:32px;border-radius:8px;border:none;background:rgba(255,255,255,0.06);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);transition:all 0.18s;}
        .prod-filter-close:hover{background:rgba(255,255,255,0.12);color:#fff;}

        .prod-filter-section{margin-bottom:24px;}
        .prod-filter-label{font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);margin-bottom:12px;letter-spacing:0.5px;}
        .prod-filter-options{display:flex;flex-direction:column;gap:8px;}
        .prod-filter-option{padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);transition:all 0.18s;}
        .prod-filter-option:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.8);}
        .prod-filter-option.active{background:rgba(0,198,255,0.1);border-color:rgba(0,198,255,0.3);color:#00c6ff;}

        .prod-price-slider{width:100%;height:6px;border-radius:3px;background:rgba(255,255,255,0.1);outline:none;-webkit-appearance:none;}
        .prod-price-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#00c6ff,#a855f7);cursor:pointer;}
        .prod-price-value{font-size:14px;font-weight:700;color:#00c6ff;margin-top:8px;}

        .prod-reset-btn{width:100%;padding:11px;border-radius:10px;border:1px solid rgba(248,113,113,0.2);background:rgba(248,113,113,0.05);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#f87171;transition:all 0.18s;}
        .prod-reset-btn:hover{background:rgba(248,113,113,0.12);border-color:rgba(248,113,113,0.35);}

        /* RESULT COUNT */
        .prod-result-count{font-size:13px;color:rgba(255,255,255,0.35);margin-bottom:16px;font-weight:500;}
        .prod-result-count strong{color:rgba(255,255,255,0.7);}

        /* PRODUCT GRID */
        .prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;}
        @media(max-width:600px){.prod-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;}}

        .prod-card{border-radius:18px;background:rgba(255,255,255,0.028);border:1px solid rgba(255,255,255,0.07);overflow:hidden;cursor:pointer;transition:transform 0.25s,border-color 0.25s,box-shadow 0.25s;animation:prod-card-in 0.3s ease both;}
        @keyframes prod-card-in{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .prod-card:hover{transform:translateY(-6px);border-color:rgba(255,255,255,0.14);box-shadow:0 20px 60px rgba(0,0,0,0.4);}

        .prod-img-wrap{position:relative;aspect-ratio:1;overflow:hidden;background:rgba(255,255,255,0.02);}
        .prod-img{width:100%;height:100%;object-fit:cover;transition:transform 0.4s;}
        .prod-card:hover .prod-img{transform:scale(1.08);}
        .prod-img-empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;}

        .prod-overlay{position:absolute;inset:0;background:rgba(2,4,8,0.65);display:flex;align-items:flex-end;justify-content:center;padding-bottom:16px;opacity:0;transition:opacity 0.3s;}
        .prod-card:hover .prod-overlay{opacity:1;}
        .prod-cart-btn{padding:10px 20px;border-radius:50px;border:none;cursor:pointer;background:linear-gradient(135deg,#00c6ff,#a855f7);color:#020408;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px;transition:transform 0.2s;}
        .prod-cart-btn:hover{transform:scale(1.05);}

        .prod-wish{position:absolute;top:10px;right:10px;width:32px;height:32px;border-radius:50%;background:rgba(2,4,8,0.75);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);transition:transform 0.2s;}
        .prod-wish:hover{transform:scale(1.1);}

        .prod-disc{position:absolute;bottom:10px;left:10px;background:#dc2626;color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:800;}

        .prod-out-badge{position:absolute;top:10px;left:10px;background:rgba(248,113,113,0.9);color:#fff;padding:4px 10px;border-radius:6px;font-size:10px;font-weight:800;backdrop-filter:blur(6px);}

        .prod-body{padding:14px;}
        .prod-name{font-size:14px;font-weight:700;color:#fff;margin-bottom:4px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .prod-desc{font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}

        .prod-rating-wrap{display:flex;align-items:center;gap:4px;margin-bottom:10px;}
        .prod-rating-val{font-size:11px;color:rgba(255,255,255,0.35);}

        .prod-price-wrap{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
        .prod-price-now{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#fff;}
        .prod-price-was{font-size:12px;color:rgba(255,255,255,0.25);text-decoration:line-through;}

        .prod-low-stock{font-size:10px;color:#f59e0b;font-weight:600;}

        /* EMPTY STATE */
        .prod-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;text-align:center;}
        .prod-empty-icon{width:72px;height:72px;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;}
        .prod-empty-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#fff;}
        .prod-empty-sub{font-size:14px;color:rgba(255,255,255,0.36);max-width:300px;line-height:1.6;}
      `}</style>

         <div className="prod-root">
            <div className="prod-bg" />
            <div className="prod-orb1" />
            <div className="prod-orb2" />

            {/* NAV */}
            <nav className="prod-nav">
               <div className="prod-nav-logo" onClick={() => navigate("/")}>
                  <div className="prod-nav-logo-box">
                     <Zap size={16} color="#020408" strokeWidth={2.5} />
                  </div>
                  <span className="prod-nav-logo-text">QuantumCart</span>
               </div>
               <span className="prod-nav-sep">/</span>
               <span className="prod-nav-page">Products</span>
               <div className="prod-nav-spacer" />
               <button className="prod-back-btn" onClick={() => navigate("/")}>
                  ← Back to Home
               </button>
            </nav>

            <div className="prod-page">
               {/* HEADER */}
               <div className="prod-header">
                  <h1 className="prod-title">
                     Explore <span>Products</span>
                  </h1>
                  <p className="prod-subtitle">
                     Discover our curated collection of premium products
                  </p>
               </div>

               {/* STATS */}
               <div className="prod-stats">
                  <div className="prod-stat">
                     <span className="prod-stat-val">{stats.total}</span>
                     <span className="prod-stat-lbl">TOTAL PRODUCTS</span>
                  </div>
                  <div className="prod-stat">
                     <span className="prod-stat-val">{stats.active}</span>
                     <span className="prod-stat-lbl">ACTIVE</span>
                  </div>
                  <div className="prod-stat">
                     <span className="prod-stat-val">{stats.avgDiscount}%</span>
                     <span className="prod-stat-lbl">AVG DISCOUNT</span>
                  </div>
               </div>

               {/* ERROR */}
               {error && (
                  <div className="prod-error">
                     <AlertTriangle size={15} /> {error}
                  </div>
               )}

               {/* CONTROLS */}
               <div className="prod-controls">
                  <div className="prod-search-wrap">
                     <Search size={14} className="prod-search-icon" />
                     <input
                        type="search"
                        className="prod-search"
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={handleSearch}
                     />
                  </div>

                  <button
                     className={`prod-filter-btn ${filterOpen ? "active" : ""}`}
                     onClick={() => setFilterOpen(!filterOpen)}
                  >
                     <SlidersHorizontal size={16} /> Filters
                  </button>

                  <select className="prod-sort-select" value={filters.sortBy} onChange={handleSortChange}>
                     <option value="newest">Newest First</option>
                     <option value="price-low">Price: Low to High</option>
                     <option value="price-high">Price: High to Low</option>
                     <option value="rating">Highest Rated</option>
                     <option value="discount">Best Discount</option>
                  </select>

                  <div className="prod-view-toggle">
                     <button
                        className={`prod-view-btn ${viewMode === "grid" ? "active" : ""}`}
                        onClick={() => setViewMode("grid")}
                     >
                        <Grid3x3 size={16} />
                     </button>
                     <button
                        className={`prod-view-btn ${viewMode === "list" ? "active" : ""}`}
                        onClick={() => setViewMode("list")}
                     >
                        <List size={16} />
                     </button>
                  </div>
               </div>

               {/* CATEGORY TABS */}
               <div className="prod-cats">
                  <button
                     className={`prod-cat-tab ${filters.category === "ALL" ? "active" : ""}`}
                     onClick={() => handleCategoryFilter("ALL")}
                  >
                     All Products
                  </button>
                  {categories.map((cat) => (
                     <button
                        key={cat}
                        className={`prod-cat-tab ${filters.category === cat ? "active" : ""}`}
                        onClick={() => handleCategoryFilter(cat)}
                     >
                        {cat}
                     </button>
                  ))}
               </div>

               {/* LOADING */}
               {loading && (
                  <div className="prod-loading">
                     <div className="prod-spin" /> Loading products…
                  </div>
               )}

               {/* CONTENT */}
               {!loading && (
                  <>
                     <p className="prod-result-count">
                        Showing <strong>{filteredProducts.length}</strong> product
                        {filteredProducts.length !== 1 ? "s" : ""}
                        {filters.search && (
                           <>
                              {" "}
                              matching "<strong>{filters.search}</strong>"
                           </>
                        )}
                     </p>

                     {filteredProducts.length === 0 ? (
                        <div className="prod-empty">
                           <div className="prod-empty-icon">
                              <Package size={32} color="rgba(255,255,255,0.15)" />
                           </div>
                           <h2 className="prod-empty-title">No products found</h2>
                           <p className="prod-empty-sub">
                              Try adjusting your filters or search query to find what you're looking
                              for.
                           </p>
                           <button className="prod-reset-btn" onClick={handleResetFilters}>
                              Reset Filters
                           </button>
                        </div>
                     ) : (
                        <div className="prod-grid">
                           {filteredProducts.map((product, index) => (
                              <ProductCard
                                 key={product._id}
                                 product={product}
                                 onAddToCart={handleAddToCart}
                              />
                           ))}
                        </div>
                     )}
                  </>
               )}
            </div>

            {/* FILTER PANEL */}
            <div className={`prod-filter-panel ${filterOpen ? "open" : ""}`}>
               <div className="prod-filter-header">
                  <h2 className="prod-filter-title">Filters</h2>
                  <button className="prod-filter-close" onClick={() => setFilterOpen(false)}>
                     <X size={16} />
                  </button>
               </div>

               {/* Status Filter */}
               <div className="prod-filter-section">
                  <div className="prod-filter-label">STATUS</div>
                  <div className="prod-filter-options">
                     {["ALL", "ACTIVE", "OUT_OF_STOCK"].map((status) => (
                        <button
                           key={status}
                           className={`prod-filter-option ${
                              filters.status === status ? "active" : ""
                           }`}
                           onClick={() => handleStatusFilter(status)}
                        >
                           {status === "ALL"
                              ? "All Products"
                              : status === "OUT_OF_STOCK"
                              ? "Out of Stock"
                              : "In Stock"}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Price Range */}
               <div className="prod-filter-section">
                  <div className="prod-filter-label">PRICE RANGE</div>
                  <input
                     type="range"
                     className="prod-price-slider"
                     min="0"
                     max="200000"
                     step="1000"
                     value={filters.priceRange[1]}
                     onChange={handlePriceRange}
                  />
                  <div className="prod-price-value">
                     Up to {formatPrice(filters.priceRange[1])}
                  </div>
               </div>

               {/* Reset Button */}
               <button className="prod-reset-btn" onClick={handleResetFilters}>
                  <RefreshCw size={14} /> Reset All Filters
               </button>
            </div>
         </div>
      </>
   );
}