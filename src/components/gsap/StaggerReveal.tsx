import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  childSelector?: string;
}

/**
 * StaggerReveal — GSAP-powered container that animates its children
 * in a staggered sequence when scrolled into view.
 *
 * Follows gsap-skills: ScrollTrigger.batch() pattern for batch triggering
 */
export default function StaggerReveal({
  children,
  className = '',
  stagger = 0.08,
  y = 20,
  duration = 0.5,
  delay = 0,
  ease = 'power2.out',
  childSelector = '.stagger-item',
}: StaggerRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const items = containerRef.current.querySelectorAll(childSelector);
      if (items.length === 0) return;

      // Use ScrollTrigger.batch for efficient batch animation
      // Following gsap-scrolltrigger skill pattern
      ScrollTrigger.batch(items, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          gsap.from(batch, {
            y,
            opacity: 0,
            duration,
            ease,
            delay,
            stagger,
            overwrite: true,
          });
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
