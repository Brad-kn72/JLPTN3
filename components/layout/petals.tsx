"use client";
import { useEffect, useState } from "react";

/**
 * 배경의 떨어지는 사쿠라 꽃잎. 가벼운 장식용.
 */
export function Petals({ count = 14 }: { count?: number }) {
  const [petals, setPetals] = useState<{ left: number; delay: number; dur: number; size: number }[]>(
    []
  );
  useEffect(() => {
    const arr = Array.from({ length: count }).map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 10,
      dur: 8 + Math.random() * 10,
      size: 8 + Math.random() * 10,
    }));
    setPetals(arr);
  }, [count]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${p.left}vw`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.dur}s`,
            animationDelay: `-${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
