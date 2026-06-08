import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { memo } from 'react';

// Register ScrollTrigger for reveal animations
gsap.registerPlugin(ScrollTrigger);

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  index?: number;
  hoverEffect?: 'lift' | 'glow' | 'scale';
  onClick?: () => void;
}

/**
 * AnimatedCard — GSAP-powered card with:
 * - ScrollTrigger reveal animation (staggered fade + slide in)
 * - GSAP hover effect (elastic lift/glow/scale)
 * - Follows gsap-skills: useGSAP, scope, cleanup
 */
const AnimatedCard = memo(function AnimatedCard({
  children,
  className = '',
  delay = 0,
  index = 0,
  hoverEffect = 'lift',
  onClick,
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cardRef.current) return;

      const card = cardRef.current;

      // Entry animation — fade in + slide up with stagger
      gsap.from(card, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: delay + index * 0.08,
        scrollTrigger: {
          trigger: card,
          start: 'top 92%',
          toggleActions: 'play none none none',
          once: true,
        },
      });

      // Hover animation — GSAP for smoother, elastic feel
      if (hoverEffect === 'lift') {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -4,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            duration: 0.25,
            ease: 'power2.inOut',
            overwrite: 'auto',
          });
        });
      } else if (hoverEffect === 'glow') {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            boxShadow: '0 8px 32px rgba(10,132,255,0.12), 0 4px 16px rgba(0,0,0,0.3)',
            borderColor: 'rgba(10,132,255,0.25)',
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            boxShadow: 'none',
            borderColor: 'rgba(30,30,36,1)',
            duration: 0.25,
            ease: 'power2.inOut',
            overwrite: 'auto',
          });
        });
      } else if (hoverEffect === 'scale') {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            scale: 1.02,
            duration: 0.3,
            ease: 'back.out(1.5)',
            overwrite: 'auto',
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            duration: 0.25,
            ease: 'power2.inOut',
            overwrite: 'auto',
          });
        });
      }
    },
    { scope: cardRef }
  );

  return (
    <div ref={cardRef} className={className} onClick={onClick}>
      {children}
    </div>
  );
});

export default AnimatedCard;
