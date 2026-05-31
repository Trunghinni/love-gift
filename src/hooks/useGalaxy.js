import { useEffect, useRef } from "react";

export function useGalaxy(canvasRef, active) {
  const animRef = useRef(null);
  const starsRef = useRef([]);
  const heartsRef = useRef([]);
  const auroraRef = useRef({ t: 0 });
  const petalRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // ── Star ─────────────────────────────────────────────
    class Star {
      constructor(init = false) {
        this.reset(init);
      }
      reset(init = false) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : -8;
        this.r = Math.random() * 2.2 + 0.2;
        this.speed = Math.random() * 0.6 + 0.06;
        this.baseAlpha = Math.random() * 0.8 + 0.2;
        this.phase = Math.random() * Math.PI * 2;
        this.phaseSpeed = Math.random() * 0.025 + 0.006;
        const hue = 240 + Math.random() * 100;
        const sat = 55 + Math.random() * 45;
        const lit = 65 + Math.random() * 30;
        this.color = `hsl(${hue},${sat}%,${lit}%)`;
        this.trail = [];
      }
      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 6) this.trail.shift();
        this.y += this.speed;
        this.phase += this.phaseSpeed;
        if (this.y > H + 8) this.reset();
      }
      draw() {
        const a = this.baseAlpha * (0.4 + 0.6 * Math.sin(this.phase));
        // Trail glow
        if (this.speed > 0.35 && this.trail.length > 2) {
          ctx.save();
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.r * 0.5;
          ctx.globalAlpha = a * 0.25;
          ctx.beginPath();
          this.trail.forEach((p, i) =>
            i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y),
          );
          ctx.stroke();
          ctx.restore();
        }
        ctx.save();
        ctx.globalAlpha = a;
        ctx.shadowBlur = this.r * 9;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // ── Petal (sakura-like) ───────────────────────────────
    class Petal {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H * 0.4 - H * 0.1;
        this.size = Math.random() * 6 + 3;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = Math.random() * 0.5 + 0.2;
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.04;
        this.alpha = Math.random() * 0.4 + 0.1;
        this.hue = 310 + Math.random() * 50;
        this.sway = Math.random() * Math.PI * 2;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
      }
      update() {
        this.sway += this.swaySpeed;
        this.x += this.vx + Math.sin(this.sway) * 0.4;
        this.y += this.vy;
        this.rot += this.rotSpeed;
        if (this.y > H + 20) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = `hsl(${this.hue},70%,75%)`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = `hsl(${this.hue},80%,80%)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // ── FloatHeart ────────────────────────────────────────
    class FloatHeart {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 22 + 8;
        this.vx = (Math.random() - 0.5) * 2.2;
        this.vy = -(Math.random() * 2.5 + 1.0);
        this.alpha = 1.0;
        this.rot = (Math.random() - 0.5) * 0.6;
        this.hue = 315 + Math.random() * 45;
        this.wobble = Math.random() * Math.PI * 2;
      }
      alive() {
        return this.alpha > 0.01;
      }
      update() {
        this.wobble += 0.08;
        this.x += this.vx + Math.sin(this.wobble) * 0.3;
        this.y += this.vy;
        this.vy *= 0.992;
        this.alpha -= 0.009;
      }
      draw() {
        const s = this.size / 18;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.scale(s, s);
        ctx.shadowBlur = 14;
        ctx.shadowColor = `hsl(${this.hue},85%,72%)`;
        ctx.fillStyle = `hsl(${this.hue},78%,68%)`;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.bezierCurveTo(11, -16, 22, -5, 0, 12);
        ctx.bezierCurveTo(-22, -5, -11, -16, 0, -6);
        ctx.fill();
        ctx.restore();
      }
    }

    // Init particles
    starsRef.current = Array.from({ length: 700 }, () => new Star(true));
    petalRef.current = Array.from({ length: 30 }, () => new Petal());

    // Expose spawn function globally
    window.__spawnHearts = (x, y, count = 22) => {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const cx = x ?? W / 2 + (Math.random() - 0.5) * 160;
          const cy = y ?? H * 0.55 + (Math.random() - 0.5) * 80;
          heartsRef.current.push(new FloatHeart(cx, cy));
        }, i * 40);
      }
    };

    // Cinematic nebula with aurora waves
    function drawNebula(t) {
      // Main nebula blobs
      const blobs = [
        {
          x: W * 0.5,
          y: H * 0.38,
          r: W * 0.45,
          c1: "rgba(180,40,130,0.14)",
          c2: "transparent",
        },
        {
          x: W * 0.25,
          y: H * 0.65,
          r: W * 0.3,
          c1: "rgba(140,20,110,0.10)",
          c2: "transparent",
        },
        {
          x: W * 0.75,
          y: H * 0.32,
          r: W * 0.27,
          c1: "rgba(100,30,160,0.09)",
          c2: "transparent",
        },
        {
          x: W * 0.5,
          y: H * 0.85,
          r: W * 0.35,
          c1: "rgba(200,60,150,0.07)",
          c2: "transparent",
        },
      ];
      blobs.forEach(({ x, y, r, c1, c2 }) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // Aurora horizontal waves
      const waves = [
        { y: H * 0.3, amp: 18, freq: 0.006, speed: 0.8, hue: 280, alpha: 0.06 },
        { y: H * 0.5, amp: 12, freq: 0.008, speed: 1.2, hue: 320, alpha: 0.05 },
        { y: H * 0.7, amp: 22, freq: 0.004, speed: 0.5, hue: 260, alpha: 0.04 },
      ];
      waves.forEach(({ y, amp, freq, speed, hue, alpha }) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        const g = ctx.createLinearGradient(0, y - amp * 4, 0, y + amp * 4);
        g.addColorStop(0, "transparent");
        g.addColorStop(0.5, `hsl(${hue},70%,60%)`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= W; x += 4) {
          const dy =
            Math.sin(x * freq + t * speed) * amp +
            Math.sin(x * freq * 1.7 + t * speed * 1.3) * amp * 0.5;
          ctx.lineTo(x, y + dy);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
    }

    let t = 0;
    function loop() {
      animRef.current = requestAnimationFrame(loop);
      t += 0.016;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "#0a000e";
      ctx.fillRect(0, 0, W, H);

      if (active) {
        drawNebula(t);
        starsRef.current.forEach((s) => {
          s.draw();
          s.update();
        });
        petalRef.current.forEach((p) => {
          p.draw();
          p.update();
        });
      } else {
        ctx.fillStyle = "#08000c";
        ctx.fillRect(0, 0, W, H);
        starsRef.current.slice(0, 180).forEach((s) => {
          s.draw();
          s.update();
        });
      }

      heartsRef.current = heartsRef.current.filter((h) => {
        h.draw();
        h.update();
        return h.alive();
      });
    }

    loop();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      delete window.__spawnHearts;
    };
  }, [active]);
}
