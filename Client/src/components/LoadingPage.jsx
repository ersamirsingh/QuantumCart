import React, { useEffect, useState, useRef } from 'react';

const LoadingPage = () => {
   const [progress, setProgress] = useState(0);
   const [phase, setPhase] = useState(0);
   const canvasRef = useRef(null);

   const phases = ['Connecting to server', 'Fetching your data', 'Almost ready'];

   // Progress simulation
   useEffect(() => {
      const interval = setInterval(() => {
         setProgress((prev) => {
            if (prev >= 100) { clearInterval(interval); return 100; }
            const inc = prev < 60 ? Math.random() * 3.5 + 1.5 : Math.random() * 1.2 + 0.3;
            return Math.min(prev + inc, 100);
         });
      }, 90);
      return () => clearInterval(interval);
   }, []);

   useEffect(() => {
      if (progress > 30) setPhase(1);
      if (progress > 70) setPhase(2);
   }, [progress]);

   // Grid + floating particle canvas
   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let animId;

      const resize = () => {
         canvas.width = window.innerWidth;
         canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      const dots = Array.from({ length: 60 }, () => ({
         x: Math.random() * window.innerWidth,
         y: Math.random() * window.innerHeight,
         r: Math.random() * 1.2 + 0.3,
         vx: (Math.random() - 0.5) * 0.25,
         vy: (Math.random() - 0.5) * 0.25,
         alpha: Math.random() * 0.4 + 0.1,
      }));

      const draw = () => {
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         // Grid lines
         ctx.strokeStyle = 'rgba(0,198,255,0.03)';
         ctx.lineWidth = 1;
         const gs = 60;
         for (let x = 0; x < canvas.width; x += gs) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
         }
         for (let y = 0; y < canvas.height; y += gs) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
         }
         // Particles + connections
         dots.forEach((d) => {
            d.x += d.vx; d.y += d.vy;
            if (d.x < 0) d.x = canvas.width;
            if (d.x > canvas.width) d.x = 0;
            if (d.y < 0) d.y = canvas.height;
            if (d.y > canvas.height) d.y = 0;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,198,255,${d.alpha})`;
            ctx.fill();
         });
         for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
               const dx = dots[i].x - dots[j].x;
               const dy = dots[i].y - dots[j].y;
               const dist = Math.sqrt(dx * dx + dy * dy);
               if (dist < 120) {
                  ctx.beginPath();
                  ctx.moveTo(dots[i].x, dots[i].y);
                  ctx.lineTo(dots[j].x, dots[j].y);
                  ctx.strokeStyle = `rgba(0,198,255,${0.06 * (1 - dist / 120)})`;
                  ctx.lineWidth = 0.5;
                  ctx.stroke();
               }
            }
         }
         animId = requestAnimationFrame(draw);
      };
      draw();

      return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
   }, []);

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          min-height: 100vh;
          background: #020408;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          overflow: hidden;
          position: relative;
        }

        .lp-canvas {
          position: absolute; inset: 0; pointer-events: none;
        }

        /* Same glow blobs as hero */
        .lp-glow {
          position: absolute; border-radius: 50%;
          pointer-events: none; filter: blur(90px);
        }
        .lp-glow-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(0,198,255,0.1) 0%, transparent 65%);
          top: -150px; left: -150px;
          animation: glowDrift 6s ease-in-out infinite alternate;
        }
        .lp-glow-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 65%);
          bottom: -100px; right: -100px;
          animation: glowDrift 8s ease-in-out infinite alternate-reverse;
        }
        @keyframes glowDrift {
          from { transform: translate(0,0); }
          to   { transform: translate(30px,20px); }
        }

        /* Card — same border/bg style as .qch-pcard */
        .lp-card {
          position: relative; z-index: 10;
          display: flex; flex-direction: column;
          align-items: center; gap: 32px;
          padding: 52px 48px;
          border-radius: 28px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,198,255,0.05);
          min-width: 340px;
          animation: cardIn 0.6s cubic-bezier(0.34,1.2,0.64,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Logo — mirrors .qch-nav-logo */
        .lp-logo {
          display: flex; align-items: center; gap: 10px;
          animation: fadeUp 0.5s 0.1s ease both;
        }
        .lp-logo-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          display: flex; align-items: center; justify-content: center;
        }
        .lp-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 800; letter-spacing: -0.5px;
          background: linear-gradient(135deg, #fff 40%, #00c6ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* Triple-ring spinner */
        .lp-spinner-wrap {
          position: relative; width: 100px; height: 100px;
          animation: fadeUp 0.5s 0.15s ease both;
        }
        .lp-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid transparent;
        }
        .lp-ring-a {
          border-top-color: #00c6ff;
          border-right-color: rgba(0,198,255,0.12);
          animation: spin 1.4s linear infinite;
        }
        .lp-ring-b {
          inset: 12px;
          border-bottom-color: #a855f7;
          border-left-color: rgba(168,85,247,0.12);
          animation: spin 0.9s linear infinite reverse;
        }
        .lp-ring-c {
          inset: 26px;
          border-top-color: rgba(0,198,255,0.4);
          animation: spin 2s linear infinite;
        }
        .lp-spinner-center {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          box-shadow: 0 0 14px rgba(0,198,255,0.6), 0 0 28px rgba(0,198,255,0.2);
          animation: dotPulse 1.4s ease-in-out infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dotPulse {
          0%,100% { transform: scale(1); box-shadow: 0 0 14px rgba(0,198,255,0.6); }
          50%     { transform: scale(1.4); box-shadow: 0 0 24px rgba(0,198,255,0.9), 0 0 40px rgba(168,85,247,0.3); }
        }

        /* Progress */
        .lp-progress-wrap {
          width: 100%;
          animation: fadeUp 0.5s 0.2s ease both;
        }
        .lp-progress-top {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 10px;
        }
        .lp-phase-text {
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.35);
        }
        .lp-pct {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 800;
          background: linear-gradient(135deg, #00c6ff, #a855f7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .lp-bar-track {
          width: 100%; height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 99px; overflow: visible;
          position: relative;
        }
        .lp-bar-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #00c6ff, #a855f7);
          box-shadow: 0 0 12px rgba(0,198,255,0.5);
          transition: width 0.12s ease-out;
          position: relative;
          overflow: hidden;
        }
        .lp-bar-fill::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
          animation: shimmer 1.5s linear infinite;
        }
        .lp-bar-fill::after {
          content: '';
          position: absolute; right: -1px; top: -3px;
          width: 9px; height: 9px; border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 8px #00c6ff, 0 0 16px rgba(0,198,255,0.5);
        }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to   { transform: translateX(400%); }
        }

        /* Steps */
        .lp-steps {
          width: 100%; display: flex; flex-direction: column; gap: 8px;
          animation: fadeUp 0.5s 0.25s ease both;
        }
        .lp-step {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.04);
          transition: all 0.4s ease;
        }
        .lp-step.active {
          background: rgba(0,198,255,0.05);
          border-color: rgba(0,198,255,0.18);
        }
        .lp-step.done {
          background: rgba(255,255,255,0.018);
          border-color: rgba(255,255,255,0.05);
        }
        .lp-step-icon {
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 11px; flex-shrink: 0;
          transition: all 0.4s;
        }
        .lp-step.done .lp-step-icon {
          background: rgba(0,198,255,0.12);
          border-color: rgba(0,198,255,0.4);
          color: #00c6ff;
        }
        .lp-step.active .lp-step-icon {
          border-color: rgba(0,198,255,0.3);
          animation: stepPing 1s ease-in-out infinite;
        }
        @keyframes stepPing {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,198,255,0.3); }
          50%     { box-shadow: 0 0 0 6px rgba(0,198,255,0); }
        }
        .lp-step-label {
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.2);
          transition: color 0.4s; letter-spacing: 0.02em;
        }
        .lp-step.active .lp-step-label { color: rgba(255,255,255,0.8); }
        .lp-step.done  .lp-step-label { color: rgba(255,255,255,0.4); }
        .lp-step-spin {
          margin-left: auto; width: 14px; height: 14px;
          border-radius: 50%; flex-shrink: 0;
          border: 2px solid rgba(0,198,255,0.15);
          border-top-color: #00c6ff;
          animation: spin 0.8s linear infinite;
        }

        /* Footer */
        .lp-footer {
          position: absolute; bottom: 28px;
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; color: rgba(255,255,255,0.12);
          letter-spacing: 0.12em;
          animation: fadeUp 0.6s 0.5s ease both;
        }
        .lp-footer-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: rgba(0,198,255,0.3);
          animation: dotPulse 1.4s ease-in-out infinite;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

         <div className="lp-root">
            <canvas ref={canvasRef} className="lp-canvas" />
            <div className="lp-glow lp-glow-1" />
            <div className="lp-glow lp-glow-2" />

            <div className="lp-card">

               {/* Logo */}
               <div className="lp-logo">
                  <div className="lp-logo-icon">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                           stroke="#020408" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                  </div>
                  <span className="lp-logo-text">QuantumCart</span>
               </div>

               {/* Spinner */}
               <div className="lp-spinner-wrap">
                  <div className="lp-ring lp-ring-a" />
                  <div className="lp-ring lp-ring-b" />
                  <div className="lp-ring lp-ring-c" />
                  <div className="lp-spinner-center">
                     <div className="lp-dot" />
                  </div>
               </div>

               {/* Progress */}
               <div className="lp-progress-wrap">
                  <div className="lp-progress-top">
                     <span className="lp-phase-text">{phases[phase]}</span>
                     <span className="lp-pct">{Math.round(progress)}%</span>
                  </div>
                  <div className="lp-bar-track">
                     <div className="lp-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
               </div>

               {/* Steps */}
               <div className="lp-steps">
                  {phases.map((p, i) => {
                     const isDone = phase > i;
                     const isActive = phase === i;
                     return (
                        <div key={p} className={`lp-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                           <div className="lp-step-icon">
                              {isDone ? '✓' : isActive ? '·' : ''}
                           </div>
                           <span className="lp-step-label">{p}</span>
                           {isActive && <div className="lp-step-spin" />}
                        </div>
                     );
                  })}
               </div>

            </div>

            <div className="lp-footer">
               <div className="lp-footer-dot" />
               initialising application
               <div className="lp-footer-dot" />
            </div>
         </div>
      </>
   );
};

export default LoadingPage;