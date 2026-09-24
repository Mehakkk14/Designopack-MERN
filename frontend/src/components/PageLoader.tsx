import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PageLoader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isLoading ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: prefersReducedMotion ? 1 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          {prefersReducedMotion ? (
            <div
              className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#7A0C0C] animate-spin"
            />
          ) : (
            <motion.div
              className="w-12 h-12 rounded-full border-4 border-gray-200"
              style={{ borderTopColor: '#7A0C0C' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
