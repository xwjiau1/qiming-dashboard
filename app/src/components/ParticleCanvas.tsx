import { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  glow: boolean;
}

interface LightTrail {
  points: { x: number; y: number }[];
  progress: number;
  speed: number;
  colorStart: string;
  colorEnd: string;
  width: number;
}

/**
 * Enhanced Particle Canvas with mouse interaction
 * Particles are attracted to mouse cursor when nearby, creating a magnetic field effect
 */
export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const trailsRef = useRef<LightTrail[]>([]);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const blueColors = ['#0A84FF', '#38BDF8', '#0070E5', '#5CC8FF'];
    const goldColors = ['#D4A574', '#F0C674', '#A67B51', '#E8B87A'];

    const initParticles = () => {
      const particles: Particle[] = [];
      const count = 180;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      for (let i = 0; i < count; i++) {
        const isBlue = Math.random() > 0.3;
        const colors = isBlue ? blueColors : goldColors;
        const x = Math.random() * w;
        const y = Math.random() * h;
        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.8 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.6 + 0.2,
          life: Math.random() * 500,
          maxLife: 500 + Math.random() * 300,
          glow: Math.random() > 0.65,
        });
      }
      return particles;
    };

    particlesRef.current = initParticles();

    const initTrails = () => {
      const trails: LightTrail[] = [];
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      for (let i = 0; i < 4; i++) {
        const points: { x: number; y: number }[] = [];
        const segments = 5 + Math.floor(Math.random() * 3);
        for (let j = 0; j <= segments; j++) {
          points.push({
            x: (w / segments) * j + (Math.random() - 0.5) * 100,
            y: h * 0.2 + Math.random() * h * 0.6,
          });
        }
        trails.push({
          points,
          progress: Math.random(),
          speed: 0.0003 + Math.random() * 0.0004,
          colorStart: blueColors[Math.floor(Math.random() * blueColors.length)],
          colorEnd: goldColors[Math.floor(Math.random() * goldColors.length)],
          width: 2 + Math.random() * 2,
        });
      }
      return trails;
    };

    trailsRef.current = initTrails();

    const getBezierPoint = (points: { x: number; y: number }[], t: number) => {
      const n = points.length - 1;
      let x = 0, y = 0;
      for (let i = 0; i <= n; i++) {
        const binom = (() => {
          let res = 1;
          for (let j = 0; j < i; j++) res = res * (n - j) / (j + 1);
          return res;
        })();
        const pow = binom * Math.pow(1 - t, n - i) * Math.pow(t, i);
        x += points[i].x * pow;
        y += points[i].y * pow;
      }
      return { x, y };
    };

    const lerpColor = (a: string, b: string, t: number) => {
      const ah = parseInt(a.replace('#', ''), 16);
      const bh = parseInt(b.replace('#', ''), 16);
      const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
      const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
      return `rgb(${Math.round(ar + (br - ar) * t)},${Math.round(ag + (bg - ag) * t)},${Math.round(ab + (bb - ab) * t)})`;
    };

    const animate = () => {
      timeRef.current += 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      // Background gradients
      const bgGrad = ctx.createRadialGradient(w * 0.3, h * 0.5, 0, w * 0.3, h * 0.5, w * 0.7);
      bgGrad.addColorStop(0, 'rgba(10,132,255,0.05)');
      bgGrad.addColorStop(0.5, 'rgba(10,132,255,0.01)');
      bgGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const bgGrad2 = ctx.createRadialGradient(w * 0.7, h * 0.5, 0, w * 0.7, h * 0.5, w * 0.6);
      bgGrad2.addColorStop(0, 'rgba(212,165,116,0.03)');
      bgGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad2;
      ctx.fillRect(0, 0, w, h);

      // Mouse glow effect — particles near cursor glow brighter
      if (mouse.active) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
        mouseGlow.addColorStop(0, 'rgba(10,132,255,0.08)');
        mouseGlow.addColorStop(0.5, 'rgba(212,165,116,0.03)');
        mouseGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
        ctx.fill();
      }

      // Light trails
      trailsRef.current.forEach((trail) => {
        trail.progress += trail.speed;
        if (trail.progress > 1) trail.progress = 0;

        const pathPoints: { x: number; y: number }[] = [];
        const steps = 100;
        for (let i = 0; i <= steps; i++) {
          pathPoints.push(getBezierPoint(trail.points, i / steps));
        }

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 1; i < pathPoints.length; i++) {
          const t = i / pathPoints.length;
          const distFromHead = Math.abs(t - trail.progress);
          if (distFromHead > 0.15) continue;
          const alpha = Math.max(0, 1 - distFromHead / 0.15) * 0.3;
          const color = lerpColor(trail.colorStart, trail.colorEnd, t);
          ctx.beginPath();
          ctx.moveTo(pathPoints[i - 1].x, pathPoints[i - 1].y);
          ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
          ctx.strokeStyle = color.replace('rgb', 'rgba').replace(')', `,${alpha})`);
          ctx.lineWidth = trail.width * 3;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 1; i < pathPoints.length; i++) {
          const t = i / pathPoints.length;
          const distFromHead = Math.abs(t - trail.progress);
          if (distFromHead > 0.08) continue;
          const alpha = Math.max(0, 1 - distFromHead / 0.08) * 0.6;
          const color = lerpColor(trail.colorStart, trail.colorEnd, t);
          ctx.beginPath();
          ctx.moveTo(pathPoints[i - 1].x, pathPoints[i - 1].y);
          ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
          ctx.strokeStyle = color.replace('rgb', 'rgba').replace(')', `,${alpha})`);
          ctx.lineWidth = trail.width;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        ctx.restore();

        const headPoint = getBezierPoint(trail.points, trail.progress);
        const headColor = lerpColor(trail.colorStart, trail.colorEnd, trail.progress);
        const headGlow = ctx.createRadialGradient(headPoint.x, headPoint.y, 0, headPoint.x, headPoint.y, 20);
        headGlow.addColorStop(0, headColor.replace('rgb', 'rgba').replace(')', ',0.4)'));
        headGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(headPoint.x, headPoint.y, 20, 0, Math.PI * 2);
        ctx.fill();
      });

      // Particles with MOUSE INTERACTION
      particlesRef.current.forEach((p) => {
        p.life += 1;

        // MOUSE ATTRACTION — particles are pulled toward cursor when nearby
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const attractRadius = 150;

          if (dist < attractRadius && dist > 5) {
            const force = (1 - dist / attractRadius) * 0.8;
            p.vx += (dx / dist) * force * 0.15;
            p.vy += (dy / dist) * force * 0.15;
          }
        }

        // Apply velocity with damping
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        // Gentle return to base position
        p.vx += (p.baseX - p.x) * 0.002;
        p.vy += (p.baseY - p.y) * 0.002;

        // Wrap around
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const lifeRatio = p.life / p.maxLife;
        const fadeAlpha = lifeRatio < 0.1
          ? lifeRatio / 0.1
          : lifeRatio > 0.9
            ? (1 - lifeRatio) / 0.1
            : 1;
        let finalAlpha = p.alpha * fadeAlpha;

        // Boost alpha near mouse
        if (mouse.active) {
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 100) {
            finalAlpha = Math.min(1, finalAlpha + (1 - mDist / 100) * 0.4);
          }
        }

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        if (p.glow) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          const rgb = p.color.replace('#', '');
          const r = parseInt(rgb.slice(0, 2), 16);
          const g = parseInt(rgb.slice(2, 4), 16);
          const b = parseInt(rgb.slice(4, 6), 16);
          glow.addColorStop(0, `rgba(${r},${g},${b},${finalAlpha * 0.5})`);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        const rgb = p.color.replace('#', '');
        const r = parseInt(rgb.slice(0, 2), 16);
        const g = parseInt(rgb.slice(2, 4), 16);
        const b = parseInt(rgb.slice(4, 6), 16);

        // Brighter near mouse
        const brightness = mouse.active ? (() => {
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          return mDist < 80 ? 1.3 : 1;
        })() : 1;

        ctx.fillStyle = `rgba(${Math.min(255, r * brightness)},${Math.min(255, g * brightness)},${Math.min(255, b * brightness)},${finalAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (p.life >= p.maxLife) {
          p.life = 0;
          p.x = Math.random() * w;
          p.y = Math.random() * h;
          p.baseX = p.x;
          p.baseY = p.y;
        }
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto', // CHANGED: enable mouse events for interaction
        zIndex: 0,
      }}
    />
  );
}
