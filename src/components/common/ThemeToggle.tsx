import { useEffect, useState } from 'react'

/**
 * ThemeToggle
 * - Chuyển dark/light theme bằng DaisyUI
 */
export const ThemeToggle = () => {
  const [theme, setTheme] = useState<string>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <button className="btn btn-circle" onClick={toggle} aria-label="Toggle theme">
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
