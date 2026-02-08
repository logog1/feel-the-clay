import { useEffect, useState, useRef } from "react";

export function useCountAnimation(end: number, duration: number = 2000, trigger: boolean = true) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!trigger) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, trigger]);

  return count;
}
