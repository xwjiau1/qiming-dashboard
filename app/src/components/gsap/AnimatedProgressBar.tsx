import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedProgressBarProps {
  progress: number;
  gradient?: string;
  height?: number;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * AnimatedProgressBar — GSAP-powered progress bar with scroll-triggered fill
 * The bar animates from 0% to target when scrolled into view
 */
export default function AnimatedProgressBar({
  progress,
  gradient = 'linear-gradient(90deg, #0A84FF, #38BDF8, #D4A574)',
  height = 6,
  delay = 0.3,
  duration = 0.8,
  className = '',
}: AnimatedProgressBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!fillRef.current || !containerRef.current) return;

      // Set initial state
      gsap.set(fillRef.current, { width: '0%' });

      // Animate to target when scrolled into view
      gsap.to(fillRef.current, {
        width: `${progress}%`,
        duration,
        ease: 'power2.out',
        delay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
          once: true,
        },
      });
    },
    { scope: containerRef, dependencies: [progress] }
  );

  return (
    <div
      ref={containerRef}
      className={`h-[${height}px] bg-surface-tertiary rounded-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <div
        ref={fillRef}
        className="h-full rounded-full"
        style={{ background: gradient, width: '0%' }}
      />
    </div>
  );
}
