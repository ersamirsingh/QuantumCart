import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Zap, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { registerUser } from "../store/slices/authSlice";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number included", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["#f87171", "#f59e0b", "#00c6ff", "#22c55e"];
  const labels = ["", "Weak", "Fair", "Strong"];
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 4,
              background: i < score ? colors[score] : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12 }}>
          {checks.map((c) => (
            <span
              key={c.label}
              style={{
                fontSize: 11, display: "flex", alignItems: "center", gap: 4,
                color: c.ok ? "#22c55e" : "rgba(255,255,255,0.3)",
                transition: "color 0.3s",
              }}
            >
              <span style={{ fontSize: 10 }}>{c.ok ? "✓" : "○"}</span>
              {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: colors[score] }}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
}

function Particle({ style }) {
  return <div className="qcs-particle" style={style} />;
}

function ParticleField() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
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
    <div className="qcs-particle-field">
      {particles.map((p) => <Particle key={p.id} style={p.style} />)}
    </div>
  );
}

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [watchedPassword, setWatchedPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((s) => s.auth);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const passwordValue = watch("password", "");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setWatchedPassword(passwordValue); }, [passwordValue]);
  useEffect(() => { if (isAuthenticated) navigate("/"); }, [isAuthenticated, navigate]);

  const onSubmit = (data) => dispatch(registerUser(data));
  const handleGoogle = () => alert("Mock: Launch Google OAuth flow");

  const perks = [
    "Free shipping on orders over $49",
    "Exclusive member-only deals",
    "Early access to new arrivals",
    "Priority 24/7 support",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .qcs-root {
          min-height: 100vh;
          background: #020408;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .qcs-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(168,85,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px);
          background-size: 60px 60px; pointer-events: none;
        }
        .qcs-orb1 {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%);
          top: -150px; right: -150px; pointer-events: none;
        }
        .qcs-orb2 {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,198,255,0.09) 0%, transparent 70%);
          bottom: -100px; left: -100px; pointer-events: none;
        }
        .qcs-particle-field { position: absolute; inset: 0; pointer-events: none; }
        .qcs-particle {
          position: absolute; border-radius: 50%;
          background: rgba(168,85,247,0.6);
          animation: qcs-float linear infinite;
        }
        @keyframes qcs-float {
          0%   { opacity: 0; transform: translateY(0) scale(1); }
          10%  { opacity: 1; }
          90%  { opacity: 0.5; }
          100% { opacity: 0; transform: translateY(-100px) scale(0.3); }
        }

        /* ── Left ── */
        .qcs-left {
          display: none;
          flex: 1; flex-direction: column; justify-content: center;
          padding: 60px; position: relative; z-index: 1;
        }
        @media(min-width:1024px){ .qcs-left { display: flex; } }

        .qcs-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 60px; }
        .qcs-logo-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          display: flex; align-items: center; justify-content: center;
        }
        .qcs-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800; letter-spacing: -0.5px;
          background: linear-gradient(135deg, #fff 40%, #a855f7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .qcs-headline {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 800; line-height: 1.1;
          color: #fff; margin-bottom: 18px; letter-spacing: -1.5px;
        }
        .qcs-headline span {
          background: linear-gradient(135deg, #a855f7, #00c6ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .qcs-sub {
          color: rgba(255,255,255,0.4); font-size: 15px;
          line-height: 1.7; max-width: 360px; margin-bottom: 44px;
        }
        .qcs-perks-label {
          font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(255,255,255,0.3); font-weight: 600; margin-bottom: 16px;
        }
        .qcs-perks { display: flex; flex-direction: column; gap: 12px; }
        .qcs-perk {
          display: flex; align-items: center; gap: 12px;
          color: rgba(255,255,255,0.65); font-size: 14px;
        }
        .qcs-perk-dot {
          width: 20px; height: 20px; border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #00c6ff);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 10px;
        }

        /* Decorative card */
        .qcs-deco-card {
          margin-top: 50px; padding: 24px;
          background: rgba(168,85,247,0.06);
          border: 1px solid rgba(168,85,247,0.15);
          border-radius: 20px; max-width: 340px;
        }
        .qcs-deco-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.25);
          border-radius: 20px; padding: 4px 12px;
          font-size: 11px; color: #a855f7; font-weight: 600; letter-spacing: 0.5px;
          margin-bottom: 14px;
        }
        .qcs-deco-quote {
          font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.55);
          font-style: italic;
        }
        .qcs-deco-author {
          margin-top: 12px; font-size: 12px; color: rgba(255,255,255,0.3);
          font-weight: 600;
        }

        /* ── Right ── */
        .qcs-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 24px; position: relative; z-index: 1;
        }
        .qcs-card {
          width: 100%; max-width: 440px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px; padding: 40px;
          backdrop-filter: blur(24px);
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .qcs-card.mounted { opacity: 1; transform: translateY(0); }

        .qcs-mobile-logo {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 24px; justify-content: center;
        }
        @media(min-width:1024px){ .qcs-mobile-logo { display: none; } }

        .qcs-steps {
          display: flex; align-items: center; gap: 0; margin-bottom: 28px;
        }
        .qcs-step {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
          color: rgba(255,255,255,0.3);
        }
        .qcs-step.active { color: #a855f7; }
        .qcs-step.done   { color: #22c55e; }
        .qcs-step-num {
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; border: 1.5px solid rgba(255,255,255,0.1);
        }
        .qcs-step.active .qcs-step-num {
          background: linear-gradient(135deg, #a855f7, #00c6ff);
          border-color: transparent; color: #fff;
        }
        .qcs-step-line {
          flex: 1; height: 1px; background: rgba(255,255,255,0.07); margin: 0 6px;
        }

        .qcs-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800; color: #fff;
          letter-spacing: -0.8px; margin-bottom: 6px;
        }
        .qcs-card-sub { color: rgba(255,255,255,0.4); font-size: 14px; margin-bottom: 28px; }

        .qcs-field { margin-bottom: 18px; }
        .qcs-label {
          display: block; font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.55); letter-spacing: 0.8px;
          text-transform: uppercase; margin-bottom: 7px;
        }
        .qcs-input-wrap { position: relative; }
        .qcs-input-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.25); pointer-events: none;
          display: flex; align-items: center;
        }
        .qcs-input {
          width: 100%; padding: 13px 16px 13px 46px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 13px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .qcs-input::placeholder { color: rgba(255,255,255,0.2); }
        .qcs-input:focus {
          border-color: rgba(168,85,247,0.5);
          background: rgba(168,85,247,0.04);
          box-shadow: 0 0 0 3px rgba(168,85,247,0.08);
        }
        .qcs-input.error {
          border-color: rgba(248,113,113,0.5);
          box-shadow: 0 0 0 3px rgba(248,113,113,0.07);
        }
        .qcs-error {
          color: #f87171; font-size: 11px; font-weight: 500; margin-top: 5px;
          display: flex; align-items: center; gap: 4px;
        }
        .qcs-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.3); padding: 4px;
          display: flex; align-items: center; transition: color 0.2s;
        }
        .qcs-eye:hover { color: rgba(255,255,255,0.7); }

        .qcs-row {
          display: flex; gap: 14px;
        }
        .qcs-row .qcs-field { flex: 1; }

        .qcs-server-error {
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 12px; padding: 12px 16px;
          color: #f87171; font-size: 13px; margin-bottom: 18px; text-align: center;
        }

        .qcs-terms-check {
          display: flex; align-items: flex-start; gap: 10px;
          margin-bottom: 20px;
        }
        .qcs-terms-check input {
          margin-top: 2px; accent-color: #a855f7; width: 14px; height: 14px; cursor: pointer;
        }
        .qcs-terms-check label {
          font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5; cursor: pointer;
        }
        .qcs-terms-check a {
          color: #a855f7; text-decoration: none; font-weight: 600;
        }

        .qcs-btn {
          width: 100%; padding: 14px;
          border-radius: 14px; border: none; cursor: pointer;
          font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
          color: #020408;
          background: linear-gradient(135deg, #a855f7 0%, #00c6ff 100%);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          position: relative; overflow: hidden;
        }
        .qcs-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .qcs-btn:hover::before { opacity: 1; }
        .qcs-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(168,85,247,0.3); }
        .qcs-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .qcs-spinner {
          width: 17px; height: 17px; border-radius: 50%;
          border: 2px solid rgba(2,4,8,0.3); border-top-color: #020408;
          animation: qcs-spin 0.7s linear infinite;
        }
        @keyframes qcs-spin { to { transform: rotate(360deg); } }

        .qcs-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 20px 0; color: rgba(255,255,255,0.2); font-size: 12px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 1px;
        }
        .qcs-divider::before, .qcs-divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08);
        }
        .qcs-google {
          width: 100%; padding: 13px;
          border-radius: 13px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.8);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .qcs-google:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }
        .qcs-footer {
          text-align: center; margin-top: 22px;
          font-size: 14px; color: rgba(255,255,255,0.35);
        }
        .qcs-footer a {
          font-weight: 700;
          background: linear-gradient(135deg, #a855f7, #00c6ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          text-decoration: none; margin-left: 4px;
        }
      `}</style>

      <div className="qcs-root">
        <div className="qcs-grid" />
        <div className="qcs-orb1" />
        <div className="qcs-orb2" />
        <ParticleField />

        {/* ── Left Panel ── */}
        <div className="qcs-left">
          <div className="qcs-logo">
            <div className="qcs-logo-icon">
              <Zap size={22} color="#020408" strokeWidth={2.5} />
            </div>
            <span className="qcs-logo-text">QuantumCart</span>
          </div>

          <h1 className="qcs-headline">
            Your universe<br />
            of <span>products awaits.</span>
          </h1>
          <p className="qcs-sub">
            Join over 2 million shoppers experiencing the future of commerce.
            Create your account in under 60 seconds.
          </p>

          <p className="qcs-perks-label">Member benefits</p>
          <div className="qcs-perks">
            {perks.map((p) => (
              <div className="qcs-perk" key={p}>
                <div className="qcs-perk-dot">✓</div>
                {p}
              </div>
            ))}
          </div>

          <div className="qcs-deco-card">
            <div className="qcs-deco-tag">
              <span style={{ fontSize: 12 }}>★</span> Trusted Review
            </div>
            <p className="qcs-deco-quote">
              "QuantumCart changed how I shop. Same-day delivery, phenomenal deals,
              and the best UX I've ever experienced."
            </p>
            <p className="qcs-deco-author">— Sarah K., verified buyer · ★★★★★</p>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="qcs-right">
          <div className={`qcs-card ${mounted ? "mounted" : ""}`}>

            <div className="qcs-mobile-logo">
              <div className="qcs-logo-icon">
                <Zap size={20} color="#020408" strokeWidth={2.5} />
              </div>
              <span className="qcs-logo-text">QuantumCart</span>
            </div>

            <div className="qcs-steps">
              <div className="qcs-step active">
                <div className="qcs-step-num">1</div>
                <span>Account</span>
              </div>
              <div className="qcs-step-line" />
              <div className="qcs-step">
                <div className="qcs-step-num">2</div>
                <span>Verify</span>
              </div>
              <div className="qcs-step-line" />
              <div className="qcs-step">
                <div className="qcs-step-num">3</div>
                <span>Explore</span>
              </div>
            </div>

            <h2 className="qcs-card-title">Create your account</h2>
            <p className="qcs-card-sub">Start shopping in the quantum dimension</p>

            {error && <div className="qcs-server-error">⚠ {error}</div>}

            {/* Name */}
            <div className="qcs-field">
              <label className="qcs-label">Full Name</label>
              <div className="qcs-input-wrap">
                <span className="qcs-input-icon"><User size={15} /></span>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  className={`qcs-input ${errors.name ? "error" : ""}`}
                  {...register("name")}
                />
              </div>
              {errors.name && <p className="qcs-error">⚠ {errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="qcs-field">
              <label className="qcs-label">Email Address</label>
              <div className="qcs-input-wrap">
                <span className="qcs-input-icon"><Mail size={15} /></span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`qcs-input ${errors.email ? "error" : ""}`}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="qcs-error">⚠ {errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="qcs-field">
              <label className="qcs-label">Password</label>
              <div className="qcs-input-wrap">
                <span className="qcs-input-icon"><Lock size={15} /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className={`qcs-input ${errors.password ? "error" : ""}`}
                  {...register("password")}
                />
                <button type="button" className="qcs-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="qcs-error">⚠ {errors.password.message}</p>}
              {watchedPassword.length > 0 && <PasswordStrength password={watchedPassword} />}
            </div>

            {/* Confirm */}
            <div className="qcs-field">
              <label className="qcs-label">Confirm Password</label>
              <div className="qcs-input-wrap">
                <span className="qcs-input-icon"><Lock size={15} /></span>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  className={`qcs-input ${errors.confirm ? "error" : ""}`}
                  {...register("confirm")}
                />
                <button type="button" className="qcs-eye" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirm && <p className="qcs-error">⚠ {errors.confirm.message}</p>}
            </div>

            <div className="qcs-terms-check">
              <input type="checkbox" id="terms" />
              <label htmlFor="terms">
                I agree to the <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>. I'm 18+ years old.
              </label>
            </div>

            <button className="qcs-btn" onClick={handleSubmit(onSubmit)} disabled={loading}>
              {loading ? (
                <><div className="qcs-spinner" />Creating account...</>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>

            <div className="qcs-divider">or</div>

            <button className="qcs-google" onClick={handleGoogle}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={17} height={17} />
              Sign up with Google
            </button>

            <div className="qcs-footer">
              Already have an account?
              <NavLink to="/login">Sign in</NavLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}