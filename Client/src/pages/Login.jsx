import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { loginUser } from "../store/slices/authSlice";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/* ─── Animated background particles ─── */
function Particle({ style }) {
  return <div className="qc-particle" style={style} />;
}

function ParticleField() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${2 + Math.random() * 3}px`,
      height: `${2 + Math.random() * 3}px`,
      animationDelay: `${Math.random() * 6}s`,
      animationDuration: `${4 + Math.random() * 6}s`,
    },
  }));
  return (
    <div className="qc-particle-field">
      {particles.map((p) => <Particle key={p.id} style={p.style} />)}
    </div>
  );
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((s) => s.auth);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (isAuthenticated) navigate("/"); }, [isAuthenticated, navigate]);

  const onSubmit = (data) => dispatch(loginUser(data));
  const handleGoogle = () => alert("Mock: Launch Google OAuth flow");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .qc-root {
          min-height: 100vh;
          background: #020408;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ── Grid bg ── */
        .qc-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,198,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,198,255,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* ── Glow orbs ── */
        .qc-orb1 {
          position: absolute; width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,198,255,0.12) 0%, transparent 70%);
          top: -200px; left: -200px; pointer-events: none;
        }
        .qc-orb2 {
          position: absolute; width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%);
          bottom: -100px; right: -100px; pointer-events: none;
        }

        /* ── Particles ── */
        .qc-particle-field { position: absolute; inset: 0; pointer-events: none; }
        .qc-particle {
          position: absolute; border-radius: 50%;
          background: rgba(0,198,255,0.6);
          animation: float linear infinite;
        }
        @keyframes float {
          0%   { opacity: 0; transform: translateY(0) scale(1); }
          10%  { opacity: 1; }
          90%  { opacity: 0.5; }
          100% { opacity: 0; transform: translateY(-120px) scale(0.3); }
        }

        /* ── Left panel ── */
        .qc-left {
          display: none;
          flex: 1; flex-direction: column; justify-content: center;
          padding: 60px; position: relative; z-index: 1;
        }
        @media(min-width:1024px){ .qc-left { display: flex; } }

        .qc-logo {
          display: flex; align-items: center; gap: 10px; margin-bottom: 60px;
        }
        .qc-logo-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          display: flex; align-items: center; justify-content: center;
        }
        .qc-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800; letter-spacing: -0.5px;
          background: linear-gradient(135deg, #fff 40%, #00c6ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .qc-headline {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 4vw, 54px);
          font-weight: 800; line-height: 1.1;
          color: #fff; margin-bottom: 20px; letter-spacing: -1.5px;
        }
        .qc-headline span {
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .qc-sub {
          color: rgba(255,255,255,0.45); font-size: 16px;
          line-height: 1.7; max-width: 380px; margin-bottom: 50px;
        }

        .qc-features { display: flex; flex-direction: column; gap: 16px; }
        .qc-feat {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 20px; border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(8px);
          transition: border-color 0.3s, background 0.3s;
        }
        .qc-feat:hover {
          border-color: rgba(0,198,255,0.25);
          background: rgba(0,198,255,0.04);
        }
        .qc-feat-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .qc-feat-title { font-weight: 600; color: #fff; font-size: 14px; }
        .qc-feat-desc  { color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 2px; }

        /* ── Right panel ── */
        .qc-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 24px; position: relative; z-index: 1;
        }

        .qc-card {
          width: 100%; max-width: 440px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: 40px;
          backdrop-filter: blur(24px);
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .qc-card.mounted { opacity: 1; transform: translateY(0); }

        /* Mobile logo */
        .qc-mobile-logo {
          display: flex; align-items: center; gap: 10px; margin-bottom: 28px;
          justify-content: center;
        }
        @media(min-width:1024px){ .qc-mobile-logo { display: none; } }

        .qc-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800; color: #fff;
          letter-spacing: -0.8px; margin-bottom: 6px;
        }
        .qc-card-sub {
          color: rgba(255,255,255,0.4); font-size: 14px; margin-bottom: 32px;
        }

        /* Form */
        .qc-field { margin-bottom: 20px; }
        .qc-label {
          display: block; font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.6); letter-spacing: 0.8px;
          text-transform: uppercase; margin-bottom: 8px;
        }
        .qc-input-wrap { position: relative; }
        .qc-input-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.25); pointer-events: none;
          display: flex; align-items: center;
        }
        .qc-input {
          width: 100%; padding: 14px 16px 14px 48px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 15px;
          outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .qc-input::placeholder { color: rgba(255,255,255,0.2); }
        .qc-input:focus {
          border-color: rgba(0,198,255,0.5);
          background: rgba(0,198,255,0.04);
          box-shadow: 0 0 0 3px rgba(0,198,255,0.08);
        }
        .qc-input.error {
          border-color: rgba(248,113,113,0.6);
          box-shadow: 0 0 0 3px rgba(248,113,113,0.08);
        }
        .qc-error {
          color: #f87171; font-size: 12px; font-weight: 500;
          margin-top: 6px; display: flex; align-items: center; gap-5px; gap: 4px;
        }
        .qc-eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.3); padding: 4px;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .qc-eye-btn:hover { color: rgba(255,255,255,0.7); }

        .qc-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px; margin-top: -4px;
        }
        .qc-remember {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: rgba(255,255,255,0.5); cursor: pointer;
        }
        .qc-remember input[type="checkbox"] {
          width: 15px; height: 15px; accent-color: #00c6ff; cursor: pointer;
        }
        .qc-forgot {
          background: none; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          font-family: 'DM Sans', sans-serif;
        }

        /* Server error */
        .qc-server-error {
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 12px; padding: 12px 16px;
          color: #f87171; font-size: 13px; margin-bottom: 20px;
          text-align: center;
        }

        /* Submit btn */
        .qc-btn {
          width: 100%; padding: 15px;
          border-radius: 14px; border: none; cursor: pointer;
          font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
          letter-spacing: 0.3px; color: #020408;
          background: linear-gradient(135deg, #00c6ff 0%, #a855f7 100%);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          position: relative; overflow: hidden;
        }
        .qc-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .qc-btn:hover::before { opacity: 1; }
        .qc-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(0,198,255,0.3); }
        .qc-btn:active:not(:disabled) { transform: translateY(0); }
        .qc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .qc-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(2,4,8,0.3); border-top-color: #020408;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .qc-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0; color: rgba(255,255,255,0.2); font-size: 12px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 1px;
        }
        .qc-divider::before, .qc-divider::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(255,255,255,0.08);
        }

        /* Google btn */
        .qc-google {
          width: 100%; padding: 14px;
          border-radius: 14px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.8);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .qc-google:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }

        /* Footer */
        .qc-footer {
          text-align: center; margin-top: 24px;
          font-size: 14px; color: rgba(255,255,255,0.35);
        }
        .qc-footer a {
          font-weight: 700;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          text-decoration: none; margin-left: 4px;
        }
        .qc-footer a:hover { opacity: 0.8; }

        .qc-terms {
          text-align: center; margin-top: 16px;
          font-size: 11px; color: rgba(255,255,255,0.2);
        }
      `}</style>

      <div className="qc-root">
        <div className="qc-grid" />
        <div className="qc-orb1" />
        <div className="qc-orb2" />
        <ParticleField />

        {/* ── Left Panel ── */}
        <div className="qc-left">
          <div className="qc-logo">
            <div className="qc-logo-icon">
              <Zap size={22} color="#020408" strokeWidth={2.5} />
            </div>
            <span className="qc-logo-text">QuantumCart</span>
          </div>

          <h1 className="qc-headline">
            Shop at the<br />
            <span>speed of light.</span>
          </h1>
          <p className="qc-sub">
            The next-generation commerce experience. Discover millions of products
            with AI-curated recommendations, quantum-fast delivery, and zero-friction checkout.
          </p>

          <div className="qc-features">
            {[
              { color: "#00c6ff", bg: "rgba(0,198,255,0.12)", icon: "⚡", title: "Instant Delivery", desc: "Same-day and next-hour delivery available" },
              { color: "#a855f7", bg: "rgba(168,85,247,0.12)", icon: "🛡", title: "Quantum Security", desc: "256-bit encrypted transactions" },
              { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "✦", title: "5M+ Products", desc: "Curated marketplace of premium goods" },
            ].map((f) => (
              <div className="qc-feat" key={f.title}>
                <div className="qc-feat-icon" style={{ background: f.bg, color: f.color, fontSize: 18 }}>
                  {f.icon}
                </div>
                <div>
                  <div className="qc-feat-title">{f.title}</div>
                  <div className="qc-feat-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="qc-right">
          <div className={`qc-card ${mounted ? "mounted" : ""}`}>

            {/* Mobile logo */}
            <div className="qc-mobile-logo">
              <div className="qc-logo-icon">
                <Zap size={20} color="#020408" strokeWidth={2.5} />
              </div>
              <span className="qc-logo-text">QuantumCart</span>
            </div>

            <h2 className="qc-card-title">Welcome back</h2>
            <p className="qc-card-sub">Sign in to your QuantumCart account</p>

            {error && <div className="qc-server-error">⚠ {error}</div>}

            {/* Email */}
            <div className="qc-field">
              <label className="qc-label">Email Address</label>
              <div className="qc-input-wrap">
                <span className="qc-input-icon"><Mail size={16} /></span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`qc-input ${errors.email ? "error" : ""}`}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="qc-error">⚠ {errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="qc-field">
              <label className="qc-label">Password</label>
              <div className="qc-input-wrap">
                <span className="qc-input-icon"><Lock size={16} /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`qc-input ${errors.password ? "error" : ""}`}
                  {...register("password")}
                />
                <button type="button" className="qc-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="qc-error">⚠ {errors.password.message}</p>}
            </div>

            <div className="qc-row">
              <label className="qc-remember">
                <input type="checkbox" />
                Remember me
              </label>
              <button type="button" className="qc-forgot">Forgot password?</button>
            </div>

            <button className="qc-btn" onClick={handleSubmit(onSubmit)} disabled={loading}>
              {loading ? (
                <><div className="qc-spinner" />Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>

            <div className="qc-divider">or</div>

            <button className="qc-google" onClick={handleGoogle}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={18} height={18} />
              Continue with Google
            </button>

            <div className="qc-footer">
              Don't have an account?
              <NavLink to="/signup">Create one</NavLink>
            </div>

            <p className="qc-terms">
              By continuing, you agree to our Terms of Service &amp; Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </>
  );
}