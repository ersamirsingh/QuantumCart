import React, { useState, useEffect, useRef } from "react";
import {
  Zap, Search, ShoppingCart, Heart, Star, ArrowRight,
  ChevronLeft, ChevronRight, TruckIcon, Shield, RotateCcw,
  Headphones, Bell, User, Menu, X, Sparkles, TrendingUp
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/slices/authSlice";



const NAV_LINKS = ["Home", "Shop", "Deals", "Categories", "About"];

const HERO_SLIDES = [
  {
    tag: "New Collection",
    title: "Next-Gen\nElectronics",
    sub: "Explore cutting-edge technology designed for the future. Unmatched performance, unbeatable prices.",
    cta: "Shop Electronics",
    accent: "#00c6ff",
    badge: "Up to 40% OFF",
    img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
  },
  {
    tag: "Limited Drop",
    title: "Premium\nFashion",
    sub: "Curated styles from global designers. Express yourself in quantum threads.",
    cta: "Explore Fashion",
    accent: "#a855f7",
    badge: "Free Shipping",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    tag: "Flash Sale",
    title: "Home &\nLiving",
    sub: "Transform your space with artisanal home décor and smart home essentials.",
    cta: "Shop Home",
    accent: "#f59e0b",
    badge: "From ₹999",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  },
];

const CATEGORIES = [
  { name: "Electronics", icon: "💻", count: "12,500+", color: "#00c6ff", bg: "rgba(0,198,255,0.08)" },
  { name: "Fashion",     icon: "👗", count: "45,000+", color: "#a855f7", bg: "rgba(168,85,247,0.08)" },
  { name: "Home Decor",  icon: "🏠", count: "8,200+",  color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  { name: "Sports",      icon: "⚽", count: "6,800+",  color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  { name: "Beauty",      icon: "✨", count: "18,400+", color: "#ec4899", bg: "rgba(236,72,153,0.08)" },
  { name: "Books",       icon: "📚", count: "90,000+", color: "#06b6d4", bg: "rgba(6,182,212,0.08)" },
  { name: "Toys",        icon: "🎮", count: "5,300+",  color: "#f97316", bg: "rgba(249,115,22,0.08)" },
  { name: "Health",      icon: "💊", count: "11,100+", color: "#84cc16", bg: "rgba(132,204,22,0.08)" },
];

const FEATURED_PRODUCTS = [
  {
    id: 1, name: "Quantum Pro Earbuds X", price: 4299, original: 6999,
    rating: 4.8, reviews: 2341, tag: "Best Seller",
    tagColor: "#00c6ff", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
  },
  {
    id: 2, name: "Smart Watch Series 7", price: 12999, original: 18500,
    rating: 4.9, reviews: 856, tag: "New",
    tagColor: "#a855f7", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
  },
  {
    id: 3, name: "Minimal Desk Lamp Pro", price: 1599, original: 2499,
    rating: 4.6, reviews: 1203, tag: "Hot Deal",
    tagColor: "#f59e0b", img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80",
  },
  {
    id: 4, name: "Ergonomic Chair Max", price: 18999, original: 29999,
    rating: 4.7, reviews: 574, tag: "Premium",
    tagColor: "#22c55e", img: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&q=80",
  },
  {
    id: 5, name: "4K Webcam UltraClear", price: 3499, original: 4999,
    rating: 4.5, reviews: 981, tag: "Top Rated",
    tagColor: "#ec4899", img: "https://images.unsplash.com/photo-1587927659979-7fa6ff25d0e7?w=400&q=80",
  },
  {
    id: 6, name: "Mechanical Keyboard Z", price: 5799, original: 7999,
    rating: 4.9, reviews: 3120, tag: "Fan Fav",
    tagColor: "#06b6d4", img: "https://images.unsplash.com/photo-1561112078-7d24e04c3407?w=400&q=80",
  },
];

const TRENDING = [
  { name: "Wireless Charger", price: 1299, img: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=200&q=80", rise: "+340%" },
  { name: "Portable SSD 1TB", price: 4999, img: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=200&q=80", rise: "+280%" },
  { name: "LED Strip Lights", price: 799, img: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=200&q=80", rise: "+195%" },
  { name: "Standing Desk Mat", price: 1099, img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80", rise: "+167%" },
];


function Stars({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1,2,3,4,5].map((n) => (
        <span key={n} style={{ color: n <= Math.round(rating) ? "#f59e0b" : "rgba(255,255,255,0.15)", fontSize: 11 }}>★</span>
      ))}
    </div>
  );
}

function ProductCard({ product }) {
  const [wished, setWished] = useState(false);
  const disc = Math.round((1 - product.price / product.original) * 100);
  return (
    <div className="qch-pcard">
      <div className="qch-pcard-img-wrap">
        <img src={product.img} alt={product.name} className="qch-pcard-img" />
        <div className="qch-pcard-overlay">
          <button className="qch-pcard-cart">
            <ShoppingCart size={16} /> Add to Cart
          </button>
        </div>
        <button className="qch-wish" onClick={() => setWished(!wished)} aria-label="Wishlist">
          <Heart size={15} fill={wished ? "#ec4899" : "none"} color={wished ? "#ec4899" : "rgba(255,255,255,0.5)"} />
        </button>
        <span
          className="qch-ptag"
          style={{ background: product.tagColor + "22", color: product.tagColor, border: `1px solid ${product.tagColor}44` }}
        >
          {product.tag}
        </span>
        <span className="qch-disc">-{disc}%</span>
      </div>
      <div className="qch-pcard-body">
        <h4 className="qch-pname">{product.name}</h4>
        <div className="qch-prating">
          <Stars rating={product.rating} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>({product.reviews.toLocaleString()})</span>
        </div>
        <div className="qch-pprice">
          <span className="qch-price-now">₹{product.price.toLocaleString()}</span>
          <span className="qch-price-was">₹{product.original.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}


export default function LandingPage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cartCount] = useState(3);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const timerRef = useRef(null);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {user} = useSelector(state=>state.auth);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const slide = HERO_SLIDES[heroIndex];

  useEffect(() => {
    setMounted(true);
    timerRef.current = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const goSlide = (n) => {
    clearInterval(timerRef.current);
    setHeroIndex((heroIndex + n + HERO_SLIDES.length) % HERO_SLIDES.length);
    timerRef.current = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length), 5000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        .qch-root {
          min-height: 100vh;
          background: #020408;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          overflow-x: hidden;
        }

        /* ── NAVBAR ── */
        .qch-nav {
          position: sticky; top: 0; z-index: 100;
          padding: 0 24px;
          background: rgba(2,4,8,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; height: 64px; gap: 0;
        }
        .qch-nav-logo {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; flex-shrink: 0;
        }
        .qch-nav-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          display: flex; align-items: center; justify-content: center;
        }
        .qch-nav-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 800; letter-spacing: -0.5px;
          background: linear-gradient(135deg, #fff 40%, #00c6ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .qch-nav-links {
          display: none; list-style: none; gap: 0; margin-left: 32px;
        }
        @media(min-width:768px){ .qch-nav-links { display: flex; } }
        .qch-nav-links li a {
          padding: 8px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 600; text-decoration: none;
          color: rgba(255,255,255,0.5); transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .qch-nav-links li a:hover {
          color: #fff; background: rgba(255,255,255,0.06);
        }

        /* Search bar */
        .qch-search-bar {
          flex: 1; margin: 0 20px; max-width: 480px;
          display: none; position: relative;
        }
        @media(min-width:640px){ .qch-search-bar { display: flex; align-items: center; } }
        .qch-search-input {
          width: 100%; padding: 9px 16px 9px 40px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 50px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .qch-search-input::placeholder { color: rgba(255,255,255,0.25); }
        .qch-search-input:focus {
          border-color: rgba(0,198,255,0.35);
          box-shadow: 0 0 0 3px rgba(0,198,255,0.07);
        }
        .qch-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.3); pointer-events: none;
          display: flex; align-items: center;
        }

        .qch-nav-spacer { flex: 1; }

        /* Nav actions */
        .qch-nav-actions {
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }
        .qch-nav-btn {
          width: 38px; height: 38px; border-radius: 10px;
          border: none; background: transparent; cursor: pointer;
          color: rgba(255,255,255,0.55);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, color 0.2s; position: relative;
        }
        .qch-nav-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }
        .qch-cart-badge {
          position: absolute; top: 5px; right: 5px;
          width: 16px; height: 16px; border-radius: 50%;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          font-size: 9px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          color: #020408;
        }
        .qch-nav-menu {
          display: flex;
        }
        @media(min-width:768px){ .qch-nav-menu { display: none; } }

        /* Mobile menu */
        .qch-mobile-menu {
          position: fixed; inset: 0; z-index: 200;
          background: #020408;
          padding: 24px;
          display: flex; flex-direction: column; gap: 12px;
          transform: translateX(100%); transition: transform 0.3s;
        }
        .qch-mobile-menu.open { transform: translateX(0); }
        .qch-mobile-menu-close {
          background: none; border: none; color: #fff;
          cursor: pointer; align-self: flex-end; margin-bottom: 12px;
        }
        .qch-mobile-menu a {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 700; color: rgba(255,255,255,0.7);
          text-decoration: none; padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          transition: color 0.2s;
        }
        .qch-mobile-menu a:hover { color: #fff; }

        /* ── HERO ── */
        .qch-hero {
          position: relative; overflow: hidden;
          min-height: 82vh; display: flex; align-items: center;
          background: #020408;
        }
        .qch-hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,198,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,198,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px; pointer-events: none;
        }
        .qch-hero-glow {
          position: absolute; width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,198,255,0.1) 0%, transparent 65%);
          top: -200px; left: -200px; pointer-events: none;
          transition: background 0.8s;
        }
        .qch-hero-inner {
          position: relative; z-index: 1; width: 100%;
          max-width: 1280px; margin: 0 auto;
          padding: 80px 24px;
          display: flex; align-items: center; gap: 60px;
          flex-wrap: wrap;
        }
        .qch-hero-content { flex: 1; min-width: 280px; }
        .qch-hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.8px;
          margin-bottom: 22px;
          transition: all 0.4s;
        }
        .qch-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(44px, 6vw, 80px);
          font-weight: 800; line-height: 1.0; letter-spacing: -2px;
          color: #fff; white-space: pre-line;
          margin-bottom: 20px; transition: all 0.4s;
        }
        .qch-hero-sub {
          font-size: 16px; line-height: 1.7;
          color: rgba(255,255,255,0.45); max-width: 420px;
          margin-bottom: 36px; transition: all 0.4s;
        }
        .qch-hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; }
        .qch-hero-cta-primary {
          padding: 14px 28px; border-radius: 14px; border: none;
          cursor: pointer;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
          color: #020408; letter-spacing: 0.2px;
          display: flex; align-items: center; gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .qch-hero-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(0,198,255,0.3); }
        .qch-hero-cta-secondary {
          padding: 14px 24px; border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.7);
          display: flex; align-items: center; gap: 8px;
          transition: background 0.2s, color 0.2s;
        }
        .qch-hero-cta-secondary:hover { background: rgba(255,255,255,0.07); color: #fff; }

        /* Hero image */
        .qch-hero-img-wrap {
          flex: 0 0 auto; width: clamp(280px, 40%, 500px);
          position: relative;
        }
        .qch-hero-img {
          width: 100%; border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.07);
          aspect-ratio: 4/3; object-fit: cover;
          transition: opacity 0.5s;
        }
        .qch-hero-badge {
          position: absolute; bottom: -16px; left: 50%; transform: translateX(-50%);
          background: rgba(2,4,8,0.9); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px; padding: 10px 20px;
          font-size: 13px; font-weight: 700; color: #fff;
          backdrop-filter: blur(10px); white-space: nowrap;
        }

        /* Hero nav dots */
        .qch-hero-dots {
          position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 8px; z-index: 2;
        }
        .qch-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.2); cursor: pointer;
          transition: background 0.3s, width 0.3s; border: none;
        }
        .qch-dot.active { background: #00c6ff; width: 24px; border-radius: 4px; }
        .qch-hero-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 2; width: 42px; height: 42px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(8px); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.6); transition: background 0.2s, color 0.2s;
        }
        .qch-hero-arrow:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .qch-hero-arrow.left  { left: 16px; }
        .qch-hero-arrow.right { right: 16px; }

        /* ── STATS TICKER ── */
        .qch-ticker {
          background: rgba(0,198,255,0.06);
          border-top: 1px solid rgba(0,198,255,0.1);
          border-bottom: 1px solid rgba(0,198,255,0.1);
          padding: 12px 0; overflow: hidden;
        }
        .qch-ticker-inner {
          display: flex; gap: 60px; animation: ticker-scroll 20s linear infinite;
          width: max-content;
        }
        @keyframes ticker-scroll { 0%{ transform: translateX(0); } 100%{ transform: translateX(-50%); } }
        .qch-ticker-item {
          display: flex; align-items: center; gap: 8px; white-space: nowrap;
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); letter-spacing: 0.3px;
        }
        .qch-ticker-item span { color: #00c6ff; }

        /* ── SECTION COMMONS ── */
        .qch-section { padding: 80px 24px; max-width: 1280px; margin: 0 auto; }
        .qch-section-header { margin-bottom: 40px; }
        .qch-section-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; margin-bottom: 12px;
        }
        .qch-section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(26px, 3vw, 38px); font-weight: 800;
          color: #fff; letter-spacing: -1px; line-height: 1.15;
        }
        .qch-section-title span {
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .qch-section-sub {
          color: rgba(255,255,255,0.4); font-size: 15px;
          margin-top: 10px; max-width: 500px;
        }
        .qch-see-all {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 700;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          text-decoration: none; cursor: pointer; background-clip: text;
          border: none; font-family: 'DM Sans', sans-serif;
          padding: 0;
        }
        .qch-section-top {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }

        /* ── CATEGORIES ── */
        .qch-cats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 14px;
        }
        .qch-cat {
          padding: 20px 16px; border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer; text-align: center;
          transition: transform 0.2s, border-color 0.2s, background 0.2s;
          text-decoration: none;
        }
        .qch-cat:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.15); }
        .qch-cat-emoji { font-size: 30px; margin-bottom: 10px; display: block; }
        .qch-cat-name { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .qch-cat-count { font-size: 11px; color: rgba(255,255,255,0.35); }

        /* ── PRODUCTS GRID ── */
        .qch-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        .qch-pcard {
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
          transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
        }
        .qch-pcard:hover {
          transform: translateY(-5px);
          border-color: rgba(255,255,255,0.14);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .qch-pcard-img-wrap {
          position: relative; aspect-ratio: 1; overflow: hidden;
        }
        .qch-pcard-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s;
        }
        .qch-pcard:hover .qch-pcard-img { transform: scale(1.06); }
        .qch-pcard-overlay {
          position: absolute; inset: 0;
          background: rgba(2,4,8,0.6);
          display: flex; align-items: flex-end; justify-content: center;
          padding-bottom: 16px; opacity: 0; transition: opacity 0.3s;
        }
        .qch-pcard:hover .qch-pcard-overlay { opacity: 1; }
        .qch-pcard-cart {
          padding: 10px 20px; border-radius: 50px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          color: #020408; font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700;
          display: flex; align-items: center; gap: 6px;
          transition: transform 0.2s;
        }
        .qch-pcard-cart:hover { transform: scale(1.05); }
        .qch-wish {
          position: absolute; top: 10px; right: 10px;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(2,4,8,0.7); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(6px); transition: transform 0.2s;
        }
        .qch-wish:hover { transform: scale(1.1); }
        .qch-ptag {
          position: absolute; top: 10px; left: 10px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.3px;
        }
        .qch-disc {
          position: absolute; bottom: 10px; left: 10px;
          background: #dc2626; color: #fff;
          padding: 3px 8px; border-radius: 6px;
          font-size: 11px; font-weight: 800;
        }
        .qch-pcard-body { padding: 16px; }
        .qch-pname {
          font-size: 13px; font-weight: 700; color: #fff;
          margin-bottom: 6px; line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .qch-prating { display: flex; align-items: center; margin-bottom: 10px; }
        .qch-pprice { display: flex; align-items: center; gap: 8px; }
        .qch-price-now { font-size: 17px; font-weight: 800; color: #fff; font-family: 'Syne', sans-serif; }
        .qch-price-was { font-size: 12px; color: rgba(255,255,255,0.25); text-decoration: line-through; }

        /* ── TRENDING ── */
        .qch-trending-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .qch-trend-card {
          display: flex; align-items: center; gap: 14px;
          padding: 14px; border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .qch-trend-card:hover {
          border-color: rgba(255,255,255,0.13);
          background: rgba(255,255,255,0.05);
          transform: translateY(-2px);
        }
        .qch-trend-img {
          width: 50px; height: 50px; border-radius: 12px;
          object-fit: cover; flex-shrink: 0;
        }
        .qch-trend-name { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 4px; }
        .qch-trend-price { font-size: 12px; color: rgba(255,255,255,0.5); }
        .qch-trend-rise {
          font-size: 11px; font-weight: 700; color: #22c55e;
          display: flex; align-items: center; gap: 3px;
        }
        .qch-trend-right { margin-left: auto; text-align: right; }

        /* ── BANNER ── */
        .qch-banner {
          margin: 0 24px 80px;
          border-radius: 28px; overflow: hidden; position: relative;
          background: linear-gradient(135deg, #0a0f1a 0%, #100520 50%, #041020 100%);
          border: 1px solid rgba(255,255,255,0.07);
          padding: 60px 48px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 32px;
        }
        .qch-banner::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 20% 50%, rgba(0,198,255,0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 50%, rgba(168,85,247,0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        .qch-banner-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.25);
          border-radius: 20px; padding: 5px 14px;
          font-size: 11px; font-weight: 700; letter-spacing: 1px;
          color: #f59e0b; text-transform: uppercase; margin-bottom: 16px;
        }
        .qch-banner-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 3vw, 44px);
          font-weight: 800; color: #fff; letter-spacing: -1px;
          line-height: 1.15; margin-bottom: 14px; position: relative; z-index: 1;
        }
        .qch-banner-title span {
          background: linear-gradient(135deg, #f59e0b, #00c6ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .qch-banner-sub {
          color: rgba(255,255,255,0.45); font-size: 15px;
          max-width: 400px; line-height: 1.6; position: relative; z-index: 1;
          margin-bottom: 28px;
        }
        .qch-banner-cta {
          padding: 14px 30px; border-radius: 14px; border: none; cursor: pointer;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
          background: linear-gradient(135deg, #f59e0b, #ff6b35);
          color: #020408; position: relative; z-index: 1;
          display: flex; align-items: center; gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .qch-banner-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(245,158,11,0.3); }
        .qch-banner-counter {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 24px 32px;
          display: flex; gap: 32px; backdrop-filter: blur(10px);
        }
        .qch-timer-block { text-align: center; }
        .qch-timer-num {
          font-family: 'Syne', sans-serif;
          font-size: 36px; font-weight: 800; color: #fff; line-height: 1;
          display: block;
        }
        .qch-timer-label { font-size: 11px; color: rgba(255,255,255,0.35); font-weight: 600; letter-spacing: 0.8px; margin-top: 4px; display: block; }
        .qch-timer-colon { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: rgba(255,255,255,0.3); line-height: 1; align-self: flex-start; margin-top: 2px; }

        /* ── FEATURES ── */
        .qch-features {
          padding: 0 24px 80px; max-width: 1280px; margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }
        .qch-feat {
          padding: 28px 24px; border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          transition: transform 0.2s, border-color 0.2s;
        }
        .qch-feat:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.13); }
        .qch-feat-ico {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .qch-feat-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .qch-feat-desc { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.5; }

        /* ── NEWSLETTER ── */
        .qch-newsletter {
          margin: 0 24px 80px;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(0,198,255,0.08) 0%, rgba(168,85,247,0.08) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 60px 48px; text-align: center;
        }
        .qch-nl-icon {
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
        .qch-nl-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(24px, 3vw, 36px); font-weight: 800;
          color: #fff; letter-spacing: -0.8px; margin-bottom: 10px;
        }
        .qch-nl-sub { color: rgba(255,255,255,0.45); font-size: 15px; margin-bottom: 28px; }
        .qch-nl-form {
          display: flex; max-width: 440px; margin: 0 auto; gap: 10px;
          flex-wrap: wrap;
        }
        .qch-nl-input {
          flex: 1; min-width: 200px; padding: 13px 20px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; transition: border-color 0.2s;
        }
        .qch-nl-input::placeholder { color: rgba(255,255,255,0.25); }
        .qch-nl-input:focus { border-color: rgba(0,198,255,0.4); }
        .qch-nl-btn {
          padding: 13px 24px; border-radius: 50px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          color: #020408; font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .qch-nl-btn:hover { transform: scale(1.03); box-shadow: 0 8px 30px rgba(0,198,255,0.25); }
        .qch-nl-note { font-size: 11px; color: rgba(255,255,255,0.2); margin-top: 14px; }

        /* ── PROFILE DROPDOWN ── */
        .qch-profile-wrap {
          position: relative;
        }
        .qch-profile-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 800;
          color: #020408; flex-shrink: 0;
        }
        .qch-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 210px; z-index: 200;
          background: rgba(10,14,22,0.97);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px;
          backdrop-filter: blur(24px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,198,255,0.06);
          overflow: hidden;
          animation: qch-dropdown-in 0.18s cubic-bezier(0.34,1.56,0.64,1) forwards;
          transform-origin: top right;
        }
        @keyframes qch-dropdown-in {
          from { opacity: 0; transform: scale(0.92) translateY(-6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);     }
        }
        .qch-dropdown-header {
          padding: 16px 16px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; gap: 10px;
        }
        .qch-dropdown-name {
          font-size: 13px; font-weight: 700; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .qch-dropdown-email {
          font-size: 11px; color: rgba(255,255,255,0.35);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .qch-dropdown-items { padding: 6px; }
        .qch-dropdown-item {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px; border: none;
          background: transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.6); text-align: left;
          transition: background 0.15s, color 0.15s;
        }
        .qch-dropdown-item:hover {
          background: rgba(255,255,255,0.06); color: #fff;
        }
        .qch-dropdown-item .qch-dropdown-icon {
          font-size: 15px; width: 18px; text-align: center; flex-shrink: 0;
        }
        .qch-dropdown-divider {
          height: 1px; background: rgba(255,255,255,0.07); margin: 4px 6px;
        }
        .qch-dropdown-item.danger { color: rgba(248,113,113,0.75); }
        .qch-dropdown-item.danger:hover {
          background: rgba(248,113,113,0.08); color: #f87171;
        }

        /* ── FOOTER ── */
        .qch-footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 40px 24px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 20px; max-width: 1280px; margin: 0 auto;
        }
        .qch-footer-logo { display: flex; align-items: center; gap: 9px; }
        .qch-footer-copy { font-size: 13px; color: rgba(255,255,255,0.25); }
        .qch-footer-links { display: flex; gap: 24px; }
        .qch-footer-links a {
          font-size: 13px; color: rgba(255,255,255,0.35);
          text-decoration: none; transition: color 0.2s;
        }
        .qch-footer-links a:hover { color: rgba(255,255,255,0.7); }
      `}</style>

      <div className="qch-root">

        {/* ── NAVBAR ── */}
        <nav className="qch-nav">
          <NavLink to="/" className="qch-nav-logo">
            <div className="qch-nav-logo-icon">
              <Zap size={18} color="#020408" strokeWidth={2.5} />
            </div>
            <span className="qch-nav-logo-text">QuantumCart</span>
          </NavLink>

          <ul className="qch-nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>

          <div className="qch-nav-spacer" />

          <div className="qch-search-bar">
            <span className="qch-search-icon"><Search size={14} /></span>
            <input type="search" className="qch-search-input" placeholder="Search 5 million+ products..." />
          </div>

          <div className="qch-nav-actions">
            <button className="qch-nav-btn" aria-label="Wishlist"><Heart size={18} /></button>
            <button className="qch-nav-btn" aria-label="Notifications"><Bell size={18} /></button>
            <button className="qch-nav-btn" aria-label="Cart" style={{ position: "relative" }}>
              <ShoppingCart size={18} />
              <span className="qch-cart-badge">{cartCount}</span>
            </button>
            <div className="qch-profile-wrap" ref={profileRef}>
              <button
                className="qch-nav-btn"
                aria-label="Profile"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((o) => !o)}
                style={profileOpen ? { background: "rgba(0,198,255,0.1)", color: "#00c6ff" } : {}}
              >
                <User size={18} />
              </button>

              {profileOpen && (
                <div className="qch-dropdown" role="menu">
                  {/* User info header */}
                  <div className="qch-dropdown-header">
                    <div className="qch-profile-avatar overflow-hidden"><User size={18}/></div>
                    <div style={{ overflow: "hidden" }}>
                      <div className="qch-dropdown-name">{user?.name}</div>
                      <div className="qch-dropdown-email">{user?.email}</div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="qch-dropdown-items">
                    <button className="qch-dropdown-item" role="menuitem" onClick={() => {
                      navigate("/user/profile");
                      setProfileOpen(false);
                    }}>
                      <span className="qch-dropdown-icon">👤</span> My Profile
                    </button>
                    <button className="qch-dropdown-item" role="menuitem" onClick={() => setProfileOpen(false)}>
                      <span className="qch-dropdown-icon">📦</span> My Orders
                    </button>
                    <button className="qch-dropdown-item" role="menuitem" onClick={() => setProfileOpen(false)}>
                      <span className="qch-dropdown-icon">❤️</span> Wishlist
                    </button>
                    <button className="qch-dropdown-item" role="menuitem" onClick={() => setProfileOpen(false)}>
                      <span className="qch-dropdown-icon">⚙️</span> Settings
                    </button>

                    <div className="qch-dropdown-divider" />

                    <button
                      className="qch-dropdown-item danger"
                      role="menuitem"
                      onClick={() => {
                        dispatch(logoutUser());
                        setProfileOpen(false)
                      }}
                    >
                      <span className="qch-dropdown-icon">🚪</span> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button className="qch-nav-btn qch-nav-menu" onClick={() => setMenuOpen(true)}><Menu size={18} /></button>
          </div>
        </nav>

        {/* ── MOBILE MENU ── */}
        <div className={`qch-mobile-menu ${menuOpen ? "open" : ""}`}>
          <button className="qch-mobile-menu-close" onClick={() => setMenuOpen(false)}>
            <X size={26} />
          </button>
          {NAV_LINKS.map((l) => <a href="#" key={l} onClick={() => setMenuOpen(false)}>{l}</a>)}
        </div>

        {/* ── HERO ── */}
        <section className="qch-hero">
          <div className="qch-hero-grid" />
          <div className="qch-hero-glow" style={{ background: `radial-gradient(circle, ${slide.accent}18 0%, transparent 65%)` }} />

          <div className="qch-hero-inner">
            <div className="qch-hero-content">
              <div
                className="qch-hero-tag"
                style={{ background: `${slide.accent}15`, border: `1px solid ${slide.accent}30`, color: slide.accent }}
              >
                <Sparkles size={12} /> {slide.tag}
              </div>
              <h1 className="qch-hero-title">{slide.title}</h1>
              <p className="qch-hero-sub">{slide.sub}</p>
              <div className="qch-hero-ctas">
                <button
                  className="qch-hero-cta-primary"
                  style={{ background: `linear-gradient(135deg, ${slide.accent}, #a855f7)` }}
                >
                  {slide.cta} <ArrowRight size={16} />
                </button>
                <button className="qch-hero-cta-secondary">
                  <TruckIcon size={14} /> Today's Deals
                </button>
              </div>
            </div>

            <div className="qch-hero-img-wrap">
              <img src={slide.img} alt={slide.title} className="qch-hero-img" />
              <div className="qch-hero-badge">🎁 {slide.badge}</div>
            </div>
          </div>

          <button className="qch-hero-arrow left" onClick={() => goSlide(-1)}><ChevronLeft size={18} /></button>
          <button className="qch-hero-arrow right" onClick={() => goSlide(1)}><ChevronRight size={18} /></button>

          <div className="qch-hero-dots">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} className={`qch-dot ${i === heroIndex ? "active" : ""}`} onClick={() => { clearInterval(timerRef.current); setHeroIndex(i); }} />
            ))}
          </div>
        </section>

        {/* ── TICKER ── */}
        <div className="qch-ticker">
          <div className="qch-ticker-inner">
            {[...Array(2)].flatMap(() => [
              { icon: "⚡", text: "Flash Sale Active", val: "40% OFF" },
              { icon: "🚀", text: "Orders Today", val: "42,819" },
              { icon: "📦", text: "Free Shipping", val: "Orders ₹499+" },
              { icon: "⭐", text: "Avg Rating", val: "4.8/5.0" },
              { icon: "🌍", text: "Cities Served", val: "500+" },
              { icon: "🔒", text: "Secure Checkout", val: "SSL Encrypted" },
              { icon: "🎁", text: "New Members", val: "Extra 10% off" },
            ]).map((item, i) => (
              <div className="qch-ticker-item" key={i}>
                <span>{item.icon}</span>
                {item.text}: <span>{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CATEGORIES ── */}
        <div className="qch-section">
          <div className="qch-section-top">
            <div className="qch-section-header" style={{ marginBottom: 0 }}>
              <div className="qch-section-badge" style={{ color: "#00c6ff" }}>
                <span style={{ fontSize: 14 }}>⬡</span> Browse
              </div>
              <h2 className="qch-section-title">Shop by <span>Category</span></h2>
            </div>
            <button className="qch-see-all">View all categories <ArrowRight size={13} /></button>
          </div>
          <div style={{ height: 28 }} />
          <div className="qch-cats-grid">
            {CATEGORIES.map((c) => (
              <a
                key={c.name} href="#" className="qch-cat"
                style={{ background: c.bg, borderColor: c.color + "30" }}
              >
                <span className="qch-cat-emoji">{c.icon}</span>
                <div className="qch-cat-name" style={{ color: c.color }}>{c.name}</div>
                <div className="qch-cat-count">{c.count} items</div>
              </a>
            ))}
          </div>
        </div>

        {/* ── FEATURED PRODUCTS ── */}
        <div className="qch-section" style={{ paddingTop: 0 }}>
          <div className="qch-section-top">
            <div className="qch-section-header" style={{ marginBottom: 0 }}>
              <div className="qch-section-badge" style={{ color: "#a855f7" }}>
                <Star size={11} /> Featured
              </div>
              <h2 className="qch-section-title">Handpicked <span>For You</span></h2>
              <p className="qch-section-sub">Curated by our AI engine based on what's trending right now.</p>
            </div>
            <button className="qch-see-all">See all products <ArrowRight size={13} /></button>
          </div>
          <div style={{ height: 28 }} />
          <div className="qch-products-grid">
            {FEATURED_PRODUCTS.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>

        {/* ── FLASH SALE BANNER ── */}
        <div className="qch-banner">
          <div>
            <div className="qch-banner-tag">⚡ Limited Time</div>
            <h2 className="qch-banner-title">Mega Flash Sale<br /><span>Ends Tonight!</span></h2>
            <p className="qch-banner-sub">
              Jaw-dropping deals on 10,000+ products. Don't miss out — once it's gone, it's gone forever.
            </p>
            <button className="qch-banner-cta">Grab the Deals <ArrowRight size={16} /></button>
          </div>
          <div className="qch-banner-counter">
            {[["08", "HRS"], ["34", "MIN"], ["22", "SEC"]].map(([n, l], i) => (
              <React.Fragment key={l}>
                {i > 0 && <div className="qch-timer-colon">:</div>}
                <div className="qch-timer-block">
                  <span className="qch-timer-num">{n}</span>
                  <span className="qch-timer-label">{l}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── TRENDING ── */}
        <div className="qch-section" style={{ paddingTop: 0 }}>
          <div className="qch-section-top">
            <div className="qch-section-header" style={{ marginBottom: 0 }}>
              <div className="qch-section-badge" style={{ color: "#f59e0b" }}>
                <TrendingUp size={11} /> Trending
              </div>
              <h2 className="qch-section-title">🔥 <span>Trending</span> Now</h2>
            </div>
            <button className="qch-see-all">See all <ArrowRight size={13} /></button>
          </div>
          <div style={{ height: 24 }} />
          <div className="qch-trending-grid">
            {TRENDING.map((t) => (
              <div className="qch-trend-card" key={t.name}>
                <img src={t.img} alt={t.name} className="qch-trend-img" />
                <div>
                  <div className="qch-trend-name">{t.name}</div>
                  <div className="qch-trend-price">₹{t.price.toLocaleString()}</div>
                </div>
                <div className="qch-trend-right">
                  <div className="qch-trend-rise"><TrendingUp size={10} /> {t.rise}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TRUST FEATURES ── */}
        <div className="qch-features">
          {[
            { icon: <TruckIcon size={22} />, color: "#00c6ff", bg: "rgba(0,198,255,0.1)", title: "Quantum-Fast Delivery", desc: "Same-day delivery available in 500+ cities. Express shipping from ₹49." },
            { icon: <Shield size={22} />, color: "#a855f7", bg: "rgba(168,85,247,0.1)", title: "Secure & Protected", desc: "256-bit encryption on every transaction. 100% buyer protection guaranteed." },
            { icon: <RotateCcw size={22} />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", title: "Easy Returns", desc: "30-day hassle-free returns. No questions asked refund policy." },
            { icon: <Headphones size={22} />, color: "#22c55e", bg: "rgba(34,197,94,0.1)", title: "24/7 Support", desc: "Round-the-clock customer support via chat, email, and call." },
          ].map((f) => (
            <div className="qch-feat" key={f.title}>
              <div className="qch-feat-ico" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
              <h3 className="qch-feat-title">{f.title}</h3>
              <p className="qch-feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ── NEWSLETTER ── */}
        <div className="qch-newsletter">
          <div className="qch-nl-icon"><Bell size={22} color="#020408" /></div>
          <h2 className="qch-nl-title">Never Miss a Deal Again</h2>
          <p className="qch-nl-sub">Subscribe for exclusive offers, early access drops, and personalized picks delivered to your inbox.</p>
          <div className="qch-nl-form">
            <input type="email" className="qch-nl-input" placeholder="Enter your email..." />
            <button className="qch-nl-btn">Subscribe</button>
          </div>
          <p className="qch-nl-note">No spam. Unsubscribe at any time. We respect your privacy.</p>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="qch-footer">
            <div className="qch-footer-logo">
              <div className="qch-nav-logo-icon" style={{ width: 30, height: 30, borderRadius: 8 }}>
                <Zap size={15} color="#020408" strokeWidth={2.5} />
              </div>
              <span className="qch-nav-logo-text" style={{ fontSize: 16 }}>QuantumCart</span>
            </div>
            <p className="qch-footer-copy">© 2026 QuantumCart. All rights reserved.</p>
            <div className="qch-footer-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Support</a>
              <a href="#">Careers</a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}