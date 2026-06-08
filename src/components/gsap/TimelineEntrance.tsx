import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

interface TimelineEntranceProps {
  children: React.ReactNode;
  className?: string;
  isActive: boolean;
  stagger?: number;
  y?: number;
  duration?: number;
  ease?: string;
  childSelector?: string;
}

/**
 * TimelineEntrance — GSAP Timeline-powered entrance sequence
 * Follows gsap-timeline skill: timeline with position parameter, labels, defaults
 *
 * When isActive becomes true, children animate in a choreographed sequence.
 * Perfect for modal/drawer content entrance.
 */
export default function TimelineEntrance({
  children,
  className = '',
  isActive,
  stagger = 0.06,
  y = 16,
  duration = 0.4,
  ease = 'power2.out',
  childSelector = '.tl-item',
}: TimelineEntranceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !isActive) return;

      const items = containerRef.current.querySelectorAll(childSelector);
      if (items.length === 0) return;

      // Create a master timeline following gsap-timeline skill
      const tl = gsap.timeline({
        defaults: { duration, ease },
      });

      // Add label for clean sequencing
      tl.addLabel('start', 0);

      // Stagger children from the label position
      tl.from(
        items,
        {
          y,
          opacity: 0,
          stagger,
        },
        'start'
      );

      // Auto-kill on completion to free memory
      tl.eventCallback('onComplete', () => {
        tl.kill();
      });
    },
    {
      scope: containerRef,
      dependencies: [isActive],
      revertOnUpdate: true,
    }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
