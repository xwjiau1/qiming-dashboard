import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

/**
 * GSAP-powered animated number counter
 * Follows gsap-skills: useGSAP hook, scope, cleanup pattern
 */
export function useAnimatedNumber(
  targetValue: number,
  options: {
    duration?: number;
    ease?: string;
    delay?: number;
    decimals?: number;
  } = {}
) {
  const { duration = 1.2, ease = 'power2.out', delay = 0, decimals = 0 } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState(0);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // Create a proxy object to animate
      const proxy = { value: 0 };

      gsap.to(proxy, {
        value: targetValue,
        duration,
        ease,
        delay,
        onUpdate: () => {
          setDisplayValue(
            decimals > 0
              ? parseFloat(proxy.value.toFixed(decimals))
              : Math.round(proxy.value)
          );
        },
      });
    },
    {
      scope: containerRef,
      dependencies: [targetValue],
      revertOnUpdate: true,
    }
  );

  return { ref: containerRef, value: displayValue };
}
