import { useRef, memo } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ShimmerCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  shimmerColor?: string;
  onClick?: () => void;
}

/**
 * ShimmerCard — GSAP-powered card with:
 * - ScrollTrigger reveal (fade + slide up)
 * - HOVER: Blue-gold gradient shimmer sweep across the card
 * - This creates a "light passing over" effect that's unmistakably GSAP
 */
const ShimmerCard = memo(function ShimmerCard({
  children,
  className = '',
  delay = 0,
  shimmerColor = 'linear-gradient(90deg, transparent, rgba(10,132,255,0.15), rgba(212,165,116,0.12), transparent)',
  onClick,
}: ShimmerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cardRef.current || !shimmerRef.current) return;

      const card = cardRef.current;
      const shimmer = shimmerRef.current;

      // Entry animation
      gsap.from(card, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay,
        scrollTrigger: {
          trigger: card,
          start: 'top 92%',
          toggleActions: 'play none none none',
          once: true,
        },
      });

      // SHIMMER SWEEP on hover — the signature visual effect
      // Position shimmer off-screen to the left initially
      gsap.set(shimmer, {
        x: '-120%',
        opacity: 0,
      });

      let shimmerTl: gsap.core.Timeline | null = null;

      const onMouseEnter = () => {
        // Kill any running shimmer
        if (shimmerTl) shimmerTl.kill();

        shimmerTl = gsap.timeline();
        shimmerTl
          .set(shimmer, { opacity: 1 })
          .fromTo(
            card,
            { y: 0 },
            { y: -4, duration: 0.3, ease: 'power2.out' }
          )
          .fromTo(
            shimmer,
            { x: '-120%' },
            { x: '120%', duration: 0.8, ease: 'power2.inOut' },
            '<'
          )
          .to(shimmer, { opacity: 0, duration: 0.2 }, '-=0.1');
      };

      const onMouseLeave = () => {
        if (shimmerTl) shimmerTl.kill();
        gsap.to(card, { y: 0, duration: 0.25, ease: 'power2.inOut', overwrite: true });
        gsap.to(shimmer, { opacity: 0, duration: 0.2, overwrite: true });
      };

      card.addEventListener('mouseenter', onMouseEnter);
      card.addEventListener('mouseleave', onMouseLeave);

      return () => {
        card.removeEventListener('mouseenter', onMouseEnter);
        card.removeEventListener('mouseleave', onMouseLeave);
      };
    },
    { scope: cardRef }
  );

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
      {/* Shimmer overlay — absolutely positioned, sweeps across on hover */}
      <div
        ref={shimmerRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: shimmerColor,
          width: '60%',
          transform: 'skewX(-15deg)',
        }}
      />
    </div>
  );
});

export default ShimmerCard;
