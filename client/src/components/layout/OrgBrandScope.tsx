import { useEffect, type ReactNode } from 'react'

type Branding = {
  logoUrl?: string | null
  primaryColor?: string | null
}

function adjustColor(hex: string, amount: number): string {
  const raw = hex.replace('#', '')
  if (raw.length !== 6) return hex
  const num = parseInt(raw, 16)
  let r = (num >> 16) + amount
  let g = ((num >> 8) & 0xff) + amount
  let b = (num & 0xff) + amount
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

type Props = {
  branding?: Branding | null
  children: ReactNode
  className?: string
}

/** Applies organization primary color to CSS variables while mounted. */
export function OrgBrandScope({ branding, children, className }: Props) {
  const color = branding?.primaryColor || null

  useEffect(() => {
    if (!color) return
    const root = document.documentElement
    const prev = {
      primary: root.style.getPropertyValue('--color-primary'),
      hover: root.style.getPropertyValue('--color-primary-hover'),
      muted: root.style.getPropertyValue('--color-primary-muted'),
      ring: root.style.getPropertyValue('--color-ring'),
    }
    root.style.setProperty('--color-primary', color)
    root.style.setProperty('--color-primary-hover', adjustColor(color, -20))
    root.style.setProperty('--color-primary-muted', adjustColor(color, 180))
    root.style.setProperty('--color-ring', color)
    return () => {
      root.style.setProperty('--color-primary', prev.primary)
      root.style.setProperty('--color-primary-hover', prev.hover)
      root.style.setProperty('--color-primary-muted', prev.muted)
      root.style.setProperty('--color-ring', prev.ring)
    }
  }, [color])

  return <div className={className}>{children}</div>
}
