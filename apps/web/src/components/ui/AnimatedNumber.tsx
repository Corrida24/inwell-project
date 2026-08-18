import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const defaultFormat = (n: number) => Math.round(n).toLocaleString('ru-RU');

interface CountUpProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  as?: 'span' | 'div';
}

/**
 * Counts up from 0 to `value` once the element scrolls into view.
 * Used for headline stats that should feel "measured" as they appear.
 */
export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 1200,
  format = defaultFormat,
  className,
  as = 'span',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let raf = 0;
    let start: number | null = null;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplay(value * easeOutCubic(progress));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, duration]);

  const Tag = as;
  return (
    <Tag ref={ref as never} className={className}>
      {format(display)}
    </Tag>
  );
};

interface LiveNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

/**
 * Smoothly tweens the displayed text from its previous value to a new one
 * whenever `value` changes — e.g. as someone drags a calculator slider.
 */
export const LiveNumber: React.FC<LiveNumberProps> = ({
  value,
  duration = 500,
  format = defaultFormat,
  className,
}) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;

    let raf = 0;
    let start: number | null = null;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        prevRef.current = to;
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
};
