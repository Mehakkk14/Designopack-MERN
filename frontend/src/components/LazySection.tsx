import React, { useState, useEffect, useRef } from "react";

interface LazySectionProps {
  children: React.ReactNode;
  minHeight?: string | number;
  className?: string;
  rootMargin?: string;
}

export const LazySection: React.FC<LazySectionProps> = ({
  children,
  minHeight = "200px",
  className = "",
  rootMargin = "300px 0px",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If IntersectionObserver is not supported, fall back immediately
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        minHeight: isVisible ? undefined : minHeight,
      }}
    >
      {isVisible ? children : null}
    </div>
  );
};
