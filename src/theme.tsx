import { useState } from 'react'
import { flushSync } from 'react-dom'

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Theme lives on <html data-theme>; index.html sets it before first paint. */
export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'light')
  const dark = theme === 'dark'
  const toggle = (e: React.MouseEvent) => {
    const next = dark ? 'light' : 'dark'
    const apply = () => {
      document.documentElement.dataset.theme = next
      try { localStorage.setItem('theme', next) } catch { /* private mode */ }
      flushSync(() => setTheme(next))
    }
    // circular reveal grows from the click point
    document.documentElement.style.setProperty('--vx', `${e.clientX}px`)
    document.documentElement.style.setProperty('--vy', `${e.clientY}px`)
    if (document.startViewTransition && !reduceMotion()) document.startViewTransition(apply)
    else apply()
  }
  return { dark, toggle }
}

export function ThemeToggle({ dark, toggle, label = true }: { dark: boolean, toggle: (e: React.MouseEvent) => void, label?: boolean }) {
  return (
    <button type="button" className={`btn toggle${label ? '' : ' square'}`} onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <span className="toggle-dot" />{label && (dark ? 'Light' : 'Dark')}
    </button>
  )
}
