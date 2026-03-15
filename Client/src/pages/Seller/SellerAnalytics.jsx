import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
   Zap, TrendingUp, DollarSign, ShoppingBag, Package,
   AlertTriangle, CheckCircle, XCircle, Users, Eye,
   ArrowUp, ArrowDown, Calendar, Download, RefreshCw,
   Percent, Star, TrendingDown
} from "lucide-react";
// import axiosClient from "../../API/axiosClient";

/* ── Helpers ── */
const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;
const formatNumber = (num) => Number(num).toLocaleString("en-IN");

/* ── Stat Card Component ── */
function StatCard({ title, value, change, icon: Icon, color, delay, suffix = "" }) {
   return (
      <div className="sa-stat" style={{ animationDelay: `${delay}ms` }}>
         <div className="sa-stat-header">
            <span className="sa-stat-title">{title}</span>
            <div className="sa-stat-icon" style={{ background: color + "15", color }}>
               <Icon size={18} />
            </div>
         </div>
         <div className="sa-stat-value">
            {value}{suffix}
         </div>
         {change !== undefined && (
            <div className={`sa-stat-change ${change >= 0 ? "positive" : "negative"}`}>
               {change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
               {Math.abs(change)}% from last period
            </div>
         )}
      </div>
   );
}

/* ── Top Product Card ── */
function TopProductCard({ product, rank }) {
   const getRankColor = (rank) => {
      if (rank === 1) return "#f59e0b";
      if (rank === 2) return "#a855f7";
      if (rank === 3) return "#00c6ff";
      return "rgba(255,255,255,0.15)";
   };

   return (
      <div className="sa-product-card">
         <div className="sa-product-rank" style={{ background: getRankColor(rank) + "25", color: getRankColor(rank) }}>
            #{rank}
         </div>
         <div className="sa-product-img">
            {product.image ? (
               <img src={product.image} alt={product.name} />
            ) : (
               <Package size={24} color="rgba(255,255,255,0.15)" />
            )}
         </div>
         <div className="sa-product-info">
            <div className="sa-product-name">{product.name}</div>
            <div className="sa-product-stats">
               <span>{product.soldUnits} sold</span>
               <span>•</span>
               <span>{formatPrice(product.revenue)}</span>
            </div>
         </div>
         <div className="sa-product-rating">
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            {product.rating}
         </div>
      </div>
   );
}

/* ── Chart Component (Simplified Bar Chart) ── */
function RevenueChart({ data }) {
   const maxRevenue = Math.max(...data.map(d => d.revenue));

   return (
      <div className="sa-chart">
         <div className="sa-chart-header">
            <h3 className="sa-chart-title">Revenue Overview</h3>
            <span className="sa-chart-subtitle">Last 7 days</span>
         </div>
         <div className="sa-chart-bars">
            {data.map((item, index) => (
               <div key={index} className="sa-bar-wrap">
                  <div className="sa-bar-label">{item.label}</div>
                  <div className="sa-bar-container">
                     <div
                        className="sa-bar"
                        style={{
                           height: `${(item.revenue / maxRevenue) * 100}%`,
                           background: `linear-gradient(180deg, #00c6ff, #a855f7)`,
                           animationDelay: `${index * 50}ms`
                        }}
                     >
                        <div className="sa-bar-tooltip">{formatPrice(item.revenue)}</div>
                     </div>
                  </div>
                  <div className="sa-bar-value">{formatPrice(item.revenue)}</div>
               </div>
            ))}
         </div>
      </div>
   );
}

/* ── Order Status Distribution ── */
function OrderDistribution({ stats }) {
   const total = stats.totalOrders || 1;
   const distribution = [
      { label: "Delivered", value: stats.deliveredOrders, color: "#22c55e", icon: CheckCircle },
      { label: "Shipped", value: stats.shippedOrders, color: "#a855f7", icon: Package },
      { label: "Confirmed", value: stats.confirmedOrders, color: "#00c6ff", icon: CheckCircle },
      { label: "Pending", value: stats.pendingOrders, color: "#f59e0b", icon: AlertTriangle },
      { label: "Cancelled", value: stats.cancelledOrders, color: "#f87171", icon: XCircle },
   ];

   return (
      <div className="sa-distribution">
         <div className="sa-dist-header">
            <h3 className="sa-dist-title">Order Distribution</h3>
            <span className="sa-dist-total">{total} total orders</span>
         </div>
         <div className="sa-dist-items">
            {distribution.map((item, index) => {
               const Icon = item.icon;
               const percentage = ((item.value / total) * 100).toFixed(1);
               
               return (
                  <div key={index} className="sa-dist-item" style={{ animationDelay: `${index * 80}ms` }}>
                     <div className="sa-dist-item-header">
                        <div className="sa-dist-item-label">
                           <div className="sa-dist-icon" style={{ background: item.color + "20", color: item.color }}>
                              <Icon size={14} />
                           </div>
                           {item.label}
                        </div>
                        <span className="sa-dist-item-value">{item.value}</span>
                     </div>
                     <div className="sa-dist-bar-bg">
                        <div
                           className="sa-dist-bar"
                           style={{
                              width: `${percentage}%`,
                              background: item.color,
                              animationDelay: `${index * 80 + 200}ms`
                           }}
                        />
                     </div>
                     <div className="sa-dist-percentage">{percentage}%</div>
                  </div>
               );
            })}
         </div>
      </div>
   );
}

/* ── Main Seller Analytics Page ── */
export default function SellerAnalytics() {
   const navigate = useNavigate();

   // State
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const [dateRange, setDateRange] = useState("30days"); // 7days, 30days, 90days, all
   const [topProducts, setTopProducts] = useState([]);
   const [revenueData, setRevenueData] = useState([]);

   // Fetch analytics data
   useEffect(() => {
      fetchAnalytics();
   }, [dateRange]);

   const fetchAnalytics = async () => {
      try {
         setLoading(true);

         // Mock data - replace with actual API call
         // const response = await axiosClient.get(`/seller/dashboard?range=${dateRange}`);
         
         const mockStats = {
            totalOrders: 156,
            totalRevenue: 458900,
            pendingOrders: 12,
            confirmedOrders: 8,
            shippedOrders: 23,
            deliveredOrders: 98,
            cancelledOrders: 15,
            totalProducts: 45,
            lowStockProducts: 7,
            outOfStockProducts: 3,
            avgOrderValue: 2941,
            totalCustomers: 128,
            conversionRate: 3.2,
         };

         const mockTopProducts = [
            { name: "Premium Wireless Headphones", soldUnits: 45, revenue: 67500, rating: 4.8, image: null },
            { name: "Smart Fitness Watch", soldUnits: 38, revenue: 57000, rating: 4.6, image: null },
            { name: "Portable Bluetooth Speaker", soldUnits: 32, revenue: 48000, rating: 4.7, image: null },
            { name: "Laptop Stand Adjustable", soldUnits: 28, revenue: 42000, rating: 4.5, image: null },
            { name: "USB-C Hub 7-in-1", soldUnits: 25, revenue: 37500, rating: 4.4, image: null },
         ];

         const mockRevenueData = [
            { label: "Mon", revenue: 52000 },
            { label: "Tue", revenue: 68000 },
            { label: "Wed", revenue: 45000 },
            { label: "Thu", revenue: 78000 },
            { label: "Fri", revenue: 92000 },
            { label: "Sat", revenue: 85000 },
            { label: "Sun", revenue: 71000 },
         ];

         setStats(mockStats);
         setTopProducts(mockTopProducts);
         setRevenueData(mockRevenueData);
         setLoading(false);
      } catch (error) {
         setLoading(false);
      }
   };

   if (loading) {
      return (
         <div className="sa-loading">
            <div className="sa-spinner" />
            Loading analytics...
         </div>
      );
   }

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .sa-root{min-height:100vh;background:#020408;font-family:'DM Sans',sans-serif;color:#fff;}
        .sa-bg{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,198,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,198,255,0.03) 1px,transparent 1px);background-size:60px 60px;}
        .sa-orb1{position:fixed;width:500px;height:500px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(0,198,255,0.08) 0%,transparent 68%);top:-200px;left:-160px;}
        .sa-orb2{position:fixed;width:400px;height:400px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 68%);bottom:-120px;right:-110px;}

        /* NAV */
        .sa-nav{position:sticky;top:0;z-index:100;height:60px;padding:0 28px;display:flex;align-items:center;gap:10px;background:rgba(2,4,8,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);}
        .sa-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;cursor:pointer;}
        .sa-nav-logo-box{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#00c6ff,#a855f7);display:flex;align-items:center;justify-content:center;}
        .sa-nav-logo-text{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;background:linear-gradient(135deg,#fff 40%,#00c6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .sa-nav-sep{color:rgba(255,255,255,0.15);margin:0 2px;}
        .sa-nav-page{font-size:13px;color:rgba(255,255,255,0.38);}
        .sa-nav-spacer{flex:1;}
        .sa-nav-link{padding:8px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);transition:all 0.18s;text-decoration:none;display:inline-block;}
        .sa-nav-link:hover{background:rgba(255,255,255,0.08);color:#fff;}

        /* PAGE */
        .sa-page{position:relative;z-index:1;max-width:1400px;margin:0 auto;padding:36px 24px 100px;}

        /* LOADING */
        .sa-loading{display:flex;align-items:center;justify-content:center;min-height:100vh;gap:12px;color:rgba(255,255,255,0.4);font-size:14px;}
        .sa-spinner{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,0.1);border-top-color:#00c6ff;animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        /* HEADER */
        .sa-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;flex-wrap:wrap;gap:16px;}
        .sa-header-left{}
        .sa-title{font-family:'Syne',sans-serif;font-size:clamp(26px,3.5vw,36px);font-weight:800;color:#fff;letter-spacing:-1px;margin-bottom:6px;}
        .sa-title span{background:linear-gradient(135deg,#00c6ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .sa-subtitle{font-size:14px;color:rgba(255,255,255,0.38);line-height:1.6;}

        .sa-header-right{display:flex;gap:10px;align-items:center;}
        .sa-date-select{padding:10px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);outline:none;transition:all 0.18s;}
        .sa-date-select:hover{background:rgba(255,255,255,0.08);color:#fff;}
        .sa-refresh-btn{width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);transition:all 0.18s;}
        .sa-refresh-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}

        /* STATS GRID */
        .sa-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-bottom:32px;}
        .sa-stat{padding:20px;border-radius:16px;background:rgba(255,255,255,0.028);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px);animation:sa-stat-in 0.3s ease both;}
        @keyframes sa-stat-in{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .sa-stat-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
        .sa-stat-title{font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:0.5px;}
        .sa-stat-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;}
        .sa-stat-value{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#fff;margin-bottom:8px;}
        .sa-stat-change{font-size:11px;font-weight:600;display:flex;align-items:center;gap:4px;}
        .sa-stat-change.positive{color:#22c55e;}
        .sa-stat-change.negative{color:#f87171;}

        /* GRID LAYOUT */
        .sa-grid{display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-bottom:32px;}
        @media(max-width:1000px){.sa-grid{grid-template-columns:1fr;}}

        /* CHART */
        .sa-chart{padding:24px;border-radius:18px;background:rgba(255,255,255,0.028);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px);}
        .sa-chart-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;}
        .sa-chart-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#fff;}
        .sa-chart-subtitle{font-size:12px;color:rgba(255,255,255,0.4);}
        .sa-chart-bars{display:flex;gap:12px;justify-content:space-between;align-items:flex-end;height:200px;}
        .sa-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;}
        .sa-bar-label{font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);margin-bottom:8px;}
        .sa-bar-container{flex:1;width:100%;display:flex;align-items:flex-end;justify-content:center;position:relative;}
        .sa-bar{width:100%;max-width:50px;border-radius:8px 8px 0 0;position:relative;animation:sa-bar-grow 0.6s ease both;cursor:pointer;}
        @keyframes sa-bar-grow{from{transform:scaleY(0);transform-origin:bottom;}to{transform:scaleY(1);}}
        .sa-bar-tooltip{position:absolute;top:-32px;left:50%;transform:translateX(-50%);background:rgba(2,4,8,0.95);padding:4px 8px;border-radius:6px;font-size:10px;font-weight:700;white-space:nowrap;opacity:0;transition:opacity 0.2s;}
        .sa-bar:hover .sa-bar-tooltip{opacity:1;}
        .sa-bar-value{font-size:10px;font-weight:600;color:rgba(255,255,255,0.3);margin-top:6px;}

        /* DISTRIBUTION */
        .sa-distribution{padding:24px;border-radius:18px;background:rgba(255,255,255,0.028);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px);}
        .sa-dist-header{margin-bottom:24px;}
        .sa-dist-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#fff;margin-bottom:4px;}
        .sa-dist-total{font-size:12px;color:rgba(255,255,255,0.4);}
        .sa-dist-items{display:flex;flex-direction:column;gap:16px;}
        .sa-dist-item{animation:sa-dist-in 0.3s ease both;}
        @keyframes sa-dist-in{from{opacity:0;transform:translateX(-12px);}to{opacity:1;transform:translateX(0);}}
        .sa-dist-item-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
        .sa-dist-item-label{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);}
        .sa-dist-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;}
        .sa-dist-item-value{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#fff;}
        .sa-dist-bar-bg{height:8px;background:rgba(255,255,255,0.05);border-radius:4px;overflow:hidden;margin-bottom:4px;}
        .sa-dist-bar{height:100%;border-radius:4px;animation:sa-dist-bar-grow 0.8s ease both;}
        @keyframes sa-dist-bar-grow{from{width:0;}to{width:var(--width);}}
        .sa-dist-percentage{font-size:11px;color:rgba(255,255,255,0.35);text-align:right;}

        /* TOP PRODUCTS */
        .sa-products-section{margin-top:32px;}
        .sa-section-header{margin-bottom:20px;}
        .sa-section-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#fff;margin-bottom:4px;}
        .sa-section-title span{background:linear-gradient(135deg,#00c6ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .sa-section-subtitle{font-size:13px;color:rgba(255,255,255,0.4);}

        .sa-products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}
        .sa-product-card{padding:16px;border-radius:14px;background:rgba(255,255,255,0.028);border:1px solid rgba(255,255,255,0.07);display:flex;gap:12px;align-items:center;transition:all 0.2s;}
        .sa-product-card:hover{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.12);}
        .sa-product-rank{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;flex-shrink:0;}
        .sa-product-img{width:56px;height:56px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;}
        .sa-product-img img{width:100%;height:100%;object-fit:cover;}
        .sa-product-info{flex:1;min-width:0;}
        .sa-product-name{font-size:13px;font-weight:600;color:#fff;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sa-product-stats{font-size:11px;color:rgba(255,255,255,0.4);display:flex;gap:6px;}
        .sa-product-rating{display:flex;align-items:center;gap:4px;font-size:13px;font-weight:700;color:#f59e0b;}
      `}</style>

         <div className="sa-root">
            <div className="sa-bg" />
            <div className="sa-orb1" />
            <div className="sa-orb2" />

            {/* NAV */}
            <nav className="sa-nav">
               <div className="sa-nav-logo" onClick={() => navigate("/")}>
                  <div className="sa-nav-logo-box">
                     <Zap size={16} color="#020408" strokeWidth={2.5} />
                  </div>
                  <span className="sa-nav-logo-text">QuantumCart</span>
               </div>
               <span className="sa-nav-sep">/</span>
               <span className="sa-nav-page">Analytics</span>
               <div className="sa-nav-spacer" />
               <a href="/seller/orders" className="sa-nav-link">
                  Manage Orders →
               </a>
            </nav>

            <div className="sa-page">
               {/* HEADER */}
               <div className="sa-header">
                  <div className="sa-header-left">
                     <h1 className="sa-title">
                        Business <span>Analytics</span>
                     </h1>
                     <p className="sa-subtitle">Track your performance and growth insights</p>
                  </div>
                  <div className="sa-header-right">
                     <select className="sa-date-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="7days">Last 7 days</option>
                        <option value="30days">Last 30 days</option>
                        <option value="90days">Last 90 days</option>
                        <option value="all">All time</option>
                     </select>
                     <button className="sa-refresh-btn" onClick={fetchAnalytics}>
                        <RefreshCw size={16} />
                     </button>
                  </div>
               </div>

               {/* PRIMARY STATS */}
               {stats && (
                  <>
                     <div className="sa-stats">
                        <StatCard
                           title="TOTAL REVENUE"
                           value={formatPrice(stats.totalRevenue)}
                           change={12.5}
                           icon={DollarSign}
                           color="#00c6ff"
                           delay={0}
                        />
                        <StatCard
                           title="TOTAL ORDERS"
                           value={formatNumber(stats.totalOrders)}
                           change={8.3}
                           icon={ShoppingBag}
                           color="#a855f7"
                           delay={50}
                        />
                        <StatCard
                           title="AVG ORDER VALUE"
                           value={formatPrice(stats.avgOrderValue)}
                           change={5.2}
                           icon={TrendingUp}
                           color="#22c55e"
                           delay={100}
                        />
                        <StatCard
                           title="TOTAL CUSTOMERS"
                           value={formatNumber(stats.totalCustomers)}
                           change={15.8}
                           icon={Users}
                           color="#f59e0b"
                           delay={150}
                        />
                     </div>

                     {/* SECONDARY STATS */}
                     <div className="sa-stats">
                        <StatCard
                           title="CONVERSION RATE"
                           value={stats.conversionRate}
                           suffix="%"
                           change={2.3}
                           icon={Percent}
                           color="#06b6d4"
                           delay={200}
                        />
                        <StatCard
                           title="TOTAL PRODUCTS"
                           value={formatNumber(stats.totalProducts)}
                           change={4.1}
                           icon={Package}
                           color="#a855f7"
                           delay={250}
                        />
                        <StatCard
                           title="LOW STOCK ALERT"
                           value={formatNumber(stats.lowStockProducts)}
                           change={-12.5}
                           icon={AlertTriangle}
                           color="#f59e0b"
                           delay={300}
                        />
                        <StatCard
                           title="OUT OF STOCK"
                           value={formatNumber(stats.outOfStockProducts)}
                           change={-8.7}
                           icon={XCircle}
                           color="#f87171"
                           delay={350}
                        />
                     </div>

                     {/* CHART & DISTRIBUTION */}
                     <div className="sa-grid">
                        <RevenueChart data={revenueData} />
                        <OrderDistribution stats={stats} />
                     </div>

                     {/* TOP PRODUCTS */}
                     <div className="sa-products-section">
                        <div className="sa-section-header">
                           <h2 className="sa-section-title">
                              Top <span>Performing</span> Products
                           </h2>
                           <p className="sa-section-subtitle">Best sellers by revenue</p>
                        </div>
                        <div className="sa-products-grid">
                           {topProducts.map((product, index) => (
                              <TopProductCard key={index} product={product} rank={index + 1} />
                           ))}
                        </div>
                     </div>
                  </>
               )}
            </div>
         </div>
      </>
   );
}