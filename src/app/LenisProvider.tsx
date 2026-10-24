import { useEffect, type PropsWithChildren } from 'react';
import Lenis from 'lenis';

// Smooth scrolling via Lenis — but NEVER at the cost of being able to
// scroll at all. Lenis's stop() freezes wheel scrolling entirely, so for
// visitors whose OS/browser reports "reduce motion" (common on Windows
// with animation effects off, and on phones with animations removed) we
// simply do not create Lenis: native scrolling, no animation, and the
// page can never get stuck. If the preference flips while the page is
// open, Lenis is destroyed / recreated rather than stopped.
export function LenisProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;

    const notifyMotion = () => window.dispatchEvent(new Event('scroll'));

    const create = () => {
      if (lenis) return;
      lenis = new Lenis({ autoRaf: true, smoothWheel: true, syncTouch: false, anchors: true });
      lenis.on('scroll', notifyMotion);
    };
    const destroy = () => {
      if (!lenis) return;
      lenis.off('scroll', notifyMotion);
      lenis.destroy();
      lenis = null;
    };
    const apply = () => (media.matches ? destroy() : create());
    const onPreference = () => apply();

    apply();
    media.addEventListener('change', onPreference);
    return () => {
      media.removeEventListener('change', onPreference);
      destroy();
    };
  }, []);
  return children;
}
