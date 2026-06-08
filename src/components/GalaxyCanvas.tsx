import { useRef, useEffect } from 'react';
import { animate } from 'animejs';

// ========== 粒子接口 ==========
interface DiskParticle {
  angle: number;
  radius: number;
  size: number;
  speed: number;
  glowSize: number;
  brightness: number;
  fallBrightness: number;
  life: number;
  maxLife: number;
}

export default function GalaxyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let W = 0, H = 0;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const cx = () => W / 2;
    const cy = () => H / 2;

    // ========== 鼠标 ==========
    const mouse = { x: -9999, y: -9999, active: false };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    // ========== 吸积盘粒子（沿椭圆轨道向内螺旋）==========
    const COUNT = 1400;
    const aMax = 320; // 椭圆半长轴
    const aMin = 55;  // 内边缘
    const tilt = 0.32; // 盘面倾斜（扁度）
    const diskAngle = Math.PI * 0.15; // 盘面整体旋转角度（从左下到右上）

    const cosDA = Math.cos(diskAngle);
    const sinDA = Math.sin(diskAngle);

    const particles: DiskParticle[] = [];
    for (let i = 0; i < COUNT; i++) {
      const rNorm = Math.random(); // 0=外, 1=内
      // 让粒子更多分布在中层和内层
      const rBias = rNorm * rNorm * 0.7 + rNorm * 0.3;
      const a = aMin + (aMax - aMin) * (1 - rBias);
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: a,
        size: 0.5 + (1 - rBias) * 2.0, // 内层更细，外层更粗
        speed: (0.003 + Math.random() * 0.004) * (aMax / a), // 越近越快
        glowSize: 2 + (1 - rBias) * 8,
        brightness: 0,
        fallBrightness: 0.1 + rBias * 0.6, // 内层更亮
        life: 0,
        maxLife: 200 + Math.random() * 400,
      });
    }

    // anime.js 驱动 brightness 闪烁
    const ctrls: ReturnType<typeof animate>[] = [];
    particles.forEach((p, i) => {
      const c = animate(p, {
        brightness: [p.fallBrightness * 0.6, Math.min(1, p.fallBrightness * 1.5)],
        duration: 1500 + Math.random() * 2500,
        ease: 'inOutSine',
        loop: true,
        alternate: true,
        delay: i * 5,
      });
      if (c) ctrls.push(c);
    });

    // ========== 背景星星 ==========
    const stars: { x: number; y: number; s: number; a: number }[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        s: Math.random() * 0.8 + 0.1,
        a: Math.random() * 0.3 + 0.05,
      });
    }

    // ========== 渲染循环 ==========
    let frameId = 0;
    const EH = 42; // 事件视界半径

    const toScreen = (a: number, theta: number) => {
      // 椭圆轨道: x = a*cos, y = a*sin*tilt
      const ex = a * Math.cos(theta);
      const ey = a * Math.sin(theta) * tilt;
      // 旋转 diskAngle
      return {
        x: cx() + ex * cosDA - ey * sinDA,
        y: cy() + ex * sinDA + ey * cosDA,
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // ---- 深蓝黑背景 ----
      ctx.fillStyle = '#020205';
      ctx.fillRect(0, 0, W, H);

      // 微妙径向暗晕
      const bgGlow = ctx.createRadialGradient(cx(), cy(), EH * 2, cx(), cy(), Math.max(W, H));
      bgGlow.addColorStop(0, 'rgba(8, 12, 30, 0.4)');
      bgGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, W, H);

      // ---- 星星 ----
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 255, ${s.a})`;
        ctx.fill();
      }

      // ---- 更新 & 绘制粒子（后层 = 远离观察者的盘 = 上方弯曲部分）----
      // 先画 "后层"（被引力透镜弯到上方的盘，且被黑洞遮挡的部分不画）
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (const p of particles) {
        p.angle += p.speed;
        p.life++;

        // 向内缓慢螺旋
        p.radius -= 0.02;
        if (p.radius < aMin + 5) {
          p.radius = aMax - Math.random() * 40;
          p.life = 0;
        }

        const { x, y } = toScreen(p.radius, p.angle);

        // 判断这是盘面的"前侧"还是"后侧"
        // sin(theta) > 0 是后层（被弯到上方），sin < 0 是前层
        const sinTheta = Math.sin(p.angle);
        const isBackLayer = sinTheta > 0;

        // 鼠标靠近的粒子变亮
        if (mouse.active) {
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120 && d > 3) {
            const f = (1 - d / 120) * 0.2;
            p.brightness = Math.min(1, p.brightness + f * 0.1);
          }
        }

        // 计算到黑洞中心的距离（屏幕坐标）
        const dx = x - cx();
        const dy = y - cy();
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);

        // 被事件视界遮挡的不画（盘面进入黑洞阴影区）
        if (distFromCenter < EH * 0.9) continue;

        // 半径归一化 (0=内, 1=外)
        const rNorm = (p.radius - aMin) / (aMax - aMin);

        // 颜色：内层白/蓝白 → 中层金/橙 → 外层暗红
        let r: number, g: number, b: number;
        if (rNorm < 0.25) {
          // 内层：白到淡蓝白
          const t = rNorm / 0.25;
          r = 200 + t * 10;
          g = 220 + t * 20;
          b = 255;
        } else if (rNorm < 0.6) {
          // 中层：淡蓝白到金橙
          const t = (rNorm - 0.25) / 0.35;
          r = 210 + (255 - 210) * t;
          g = 240 + (180 - 240) * t;
          b = 255 + (80 - 255) * t;
        } else {
          // 外层：金橙到暗红
          const t = (rNorm - 0.6) / 0.4;
          r = 255 - t * 100;
          g = 180 - t * 120;
          b = 80 - t * 60;
        }

        // Doppler beaming: 上方（后层靠近光环处）更亮
        // 靠近事件视界的也亮
        const proximityBoost = Math.max(0, 1 - (distFromCenter - EH) / 80);
        const beamBoost = isBackLayer ? 0.3 : 0; // 后层（上方环）更亮
        const finalAlpha = Math.min(1, p.brightness * (1 + proximityBoost * 1.5 + beamBoost));

        // 发光
        const gs = p.glowSize * (1 + proximityBoost);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, gs);
        glow.addColorStop(0, `rgba(${r | 0},${g | 0},${b | 0},${finalAlpha * 0.35})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, gs, 0, Math.PI * 2);
        ctx.fill();

        // 核心
        const sz = p.size * (1 + proximityBoost * 0.5);
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${finalAlpha})`;
        ctx.fill();
      }

      ctx.restore();

      // ---- 爱因斯坦环（极亮的内环） ----
      // 这是 Gargantua 最标志性的视觉效果
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // 主光环 - 白色/极淡蓝白
      const ringGlow = ctx.createRadialGradient(cx(), cy(), EH * 0.85, cx(), cy(), EH * 1.5);
      ringGlow.addColorStop(0, 'rgba(255, 255, 255, 0)');
      ringGlow.addColorStop(0.7, 'rgba(220, 235, 255, 0.25)');
      ringGlow.addColorStop(0.85, 'rgba(255, 250, 240, 0.35)');
      ringGlow.addColorStop(0.95, 'rgba(255, 240, 220, 0.2)');
      ringGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = ringGlow;
      ctx.beginPath();
      ctx.arc(cx(), cy(), EH * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 窄环核心 - 最亮处
      const ringCore = ctx.createRadialGradient(cx(), cy(), EH * 0.9, cx(), cy(), EH * 1.15);
      ringCore.addColorStop(0, 'transparent');
      ringCore.addColorStop(0.8, 'rgba(255, 255, 255, 0.5)');
      ringCore.addColorStop(0.9, 'rgba(240, 248, 255, 0.7)');
      ringCore.addColorStop(0.95, 'rgba(255, 245, 230, 0.5)');
      ringCore.addColorStop(1, 'transparent');
      ctx.fillStyle = ringCore;
      ctx.beginPath();
      ctx.arc(cx(), cy(), EH * 1.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ---- 事件视界（纯黑圆） ----
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx(), cy(), EH, 0, Math.PI * 2);
      ctx.fill();

      // 事件视界边缘微妙的光子环折射
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const ehEdge = ctx.createRadialGradient(cx(), cy(), EH * 0.92, cx(), cy(), EH * 1.02);
      ehEdge.addColorStop(0, 'transparent');
      ehEdge.addColorStop(0.6, 'rgba(200, 230, 255, 0.15)');
      ehEdge.addColorStop(0.8, 'rgba(255, 240, 220, 0.25)');
      ehEdge.addColorStop(1, 'transparent');
      ctx.fillStyle = ehEdge;
      ctx.beginPath();
      ctx.arc(cx(), cy(), EH * 1.02, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ---- 鼠标靠近时的光晕扰动 ----
      if (mouse.active) {
        const mdx = mouse.x - cx();
        const mdy = mouse.y - cy();
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 250) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const mGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
          mGlow.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
          mGlow.addColorStop(0.5, 'rgba(200, 220, 255, 0.03)');
          mGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = mGlow;
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      frameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => { resize(); };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      ctrls.forEach((c) => { if (c?.pause) c.pause(); });
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
        zIndex: 0,
      }}
    />
  );
}
