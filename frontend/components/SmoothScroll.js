'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Intercept internal anchors to scroll smoothly via Lenis
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href*="#"]');
      if (anchor) {
        const hrefAttr = anchor.getAttribute('href');
        
        // Handle standard hash links like '#faq' or '/#faq'
        const hashIndex = hrefAttr.indexOf('#');
        if (hashIndex !== -1) {
          const hash = hrefAttr.substring(hashIndex);
          const path = hrefAttr.substring(0, hashIndex);
          
          // Only smooth scroll if we are on the same page
          if (path === '' || path === window.location.pathname) {
            e.preventDefault();
            const targetEl = document.querySelector(hash);
            if (targetEl) {
              lenis.scrollTo(targetEl, { offset: -80, duration: 1.2 });
            }
          }
        }
      }
    };
    
    document.addEventListener('click', handleAnchorClick);
    window.lenis = lenis;

    return () => {
      lenis.destroy();
      document.removeEventListener('click', handleAnchorClick);
      window.lenis = null;
    };
  }, []);

  return <>{children}</>;
}
