import { useState, useEffect } from 'react'


export function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  useEffect(() => {
    function onResize() {
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (width >= 1024) return 'desktop'
  if (width >= 640) return 'tablet'
  return 'mobile'
}

// Kleine Hilfsfunktion: wählt die passende Breite für den aktuellen Breakpoint,
// z.B. widthFor(bp, { mobile: 360, tablet: 480, desktop: 560 }).
export function widthFor(breakpoint, { mobile, tablet, desktop }) {
  if (breakpoint === 'desktop') return desktop
  if (breakpoint === 'tablet') return tablet
  return mobile
}