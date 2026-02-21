import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Animated particle grid background
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

    const dots = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 90, 60, ${d.alpha})`;
        ctx.fill();
      });

      // Draw faint connecting lines
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(255, 90, 60, ${0.07 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .nfp-root {
          position: relative;
          min-height: 100vh;
          background: #0c0c0e;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: 'DM Mono', monospace;
        }

        .nfp-canvas {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* Big glowing 404 behind content */
        .nfp-ghost {
          position: absolute;
          font-family: 'Syne', sans-serif;
          font-size: clamp(180px, 30vw, 400px);
          font-weight: 800;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255, 90, 60, 0.08);
          letter-spacing: -0.04em;
          user-select: none;
          pointer-events: none;
          white-space: nowrap;
          animation: ghostPulse 4s ease-in-out infinite;
        }

        @keyframes ghostPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.02); }
        }

        .nfp-content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 2rem;
        }

        .nfp-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #ff5a3c;
          border: 1px solid rgba(255, 90, 60, 0.35);
          padding: 6px 14px;
          border-radius: 2px;
          margin-bottom: 2rem;
          animation: fadeUp 0.6s ease both;
        }

        .nfp-code {
          font-family: 'Syne', sans-serif;
          font-size: clamp(64px, 14vw, 130px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          color: #fff;
          animation: fadeUp 0.6s 0.1s ease both;
        }

        .nfp-code span {
          color: #ff5a3c;
        }

        .nfp-divider {
          width: 48px;
          height: 2px;
          background: #ff5a3c;
          margin: 1.5rem auto;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        .nfp-message {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.05em;
          max-width: 320px;
          margin: 0 auto 2.5rem;
          line-height: 1.8;
          animation: fadeUp 0.6s 0.3s ease both;
        }

        .nfp-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeUp 0.6s 0.4s ease both;
        }

        .nfp-btn {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 14px 28px;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .nfp-btn-primary {
          background: #ff5a3c;
          color: #fff;
        }
        .nfp-btn-primary:hover {
          background: #ff7a5c;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 90, 60, 0.35);
        }

        .nfp-btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .nfp-btn-ghost:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.35);
          transform: translateY(-2px);
        }

        .nfp-footer {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: rgba(255,255,255,0.15);
          letter-spacing: 0.15em;
          white-space: nowrap;
          animation: fadeUp 0.6s 0.6s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="nfp-root">
        <canvas ref={canvasRef} className="nfp-canvas" />

        <div className="nfp-ghost">404</div>

        <div className="nfp-content">
          <div className="nfp-tag">Error 404</div>

          <div className="nfp-code">
            Page <span>Not</span> Found
          </div>

          <div className="nfp-divider" />

          <p className="nfp-message">
            The page you're looking for doesn't exist, was moved, or never existed in the first place.
          </p>

          <div className="nfp-actions">
            <button className="nfp-btn nfp-btn-primary" onClick={() => navigate('/')}>
              Go Home
            </button>
            <button className="nfp-btn nfp-btn-ghost" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>

        <div className="nfp-footer">// route not matched — falling through to 404</div>
      </div>
    </>
  );
};

export default NotFoundPage;