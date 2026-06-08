import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

interface SplitTextRevealProps {
  text: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  type?: 'chars' | 'words';
  stagger?: number;
  duration?: number;
  delay?: number;
  y?: number;
  rotateX?: number;
}

/**
 * SplitTextReveal — GSAP-powered text split animation
 * Splits text into individual characters or words and animates them in with 3D perspective.
 * This is a visual effect that CSS alone cannot achieve.
 */
export default function SplitTextReveal({
  text,
  className = '',
  tag: Tag = 'h2',
  type = 'chars',
  stagger = 0.03,
  duration = 0.6,
  delay = 0,
  y = 30,
  rotateX = -80,
}: SplitTextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // Set perspective on container for 3D effect
      gsap.set(containerRef.current, { perspective: 600 });

      const items = containerRef.current.querySelectorAll('.split-item');

      // Initial state: hidden, translated, and rotated
      gsap.set(items, {
        opacity: 0,
        y,
        rotateX,
        transformOrigin: '50% 50% -20',
      });

      // Animate in with stagger — the signature GSAP 3D text reveal
      gsap.to(items, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration,
        ease: 'back.out(1.4)',
        stagger,
        delay,
      });
    },
    { scope: containerRef }
  );

  // Split text into individual characters or words
  const items =
    type === 'chars'
      ? text.split('').map((char, i) => (
          <span
            key={i}
            className="split-item inline-block"
            style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))
      : text.split(' ').map((word, i) => (
          <span key={i} className="split-item inline-block mr-[0.3em]">
            {word}
          </span>
        ));

  return (
    <div ref={containerRef} className="overflow-hidden">
      <Tag className={className}>{items}</Tag>
    </div>
  );
}
