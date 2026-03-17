import { useEffect, useRef, useState, useCallback } from "react";

interface ParallaxOptions {
  speed?: number; // 0 = no effect, 0.5 = half speed, negative = reverse
  clamp?: number; // max px offset
}

export function useParallax({ speed = 0.3, clamp = 120 }: ParallaxOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const ticking = useRef(false);

  const update = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const vh = window.innerHeight;
    // How far the element center is from viewport center, normalized
    const center = rect.top + rect.height / 2;
    const raw = (center - vh / 2) * speed;
    setOffset(Math.max(-clamp, Math.min(clamp, raw)));
    ticking.current = false;
  }, [speed, clamp]);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial
    return () => window.removeEventListener("scroll", onScroll);
  }, [update]);

  return { ref, offset };
}
