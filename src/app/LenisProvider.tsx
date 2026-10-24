import { useEffect, type PropsWithChildren } from 'react';
import Lenis from 'lenis';

export function LenisProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lenis = new Lenis({ autoRaf: true, smoothWheel: true, syncTouch: false, anchors: true });
    // Start stopped when reduced motion is preferred, and react to the
    // preference changing in either direction while the page is open.
    if (media.matches) lenis.stop();
    const notifyMotion = () => window.dispatchEvent(new Event('scroll'));
    lenis.on('scroll', notifyMotion);
    const onPreference = (event: MediaQueryListEvent) => {
      if (event.matches) lenis.stop();
      else lenis.start();
    };
    media.addEventListener('change', onPreference);
    return () => {
      media.removeEventListener('change', onPreference);
      lenis.off('scroll', notifyMotion);
      lenis.destroy();
    };
  }, []);
  return children;
}
