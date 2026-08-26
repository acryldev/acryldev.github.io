import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('acryl-theme', theme)
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0b0d0e' : '#f4f4ef')
  }, [theme])

  const next = theme === 'light' ? 'dark' : 'light'
  return (
    <button className="icon-button" type="button" onClick={() => setTheme(next)} aria-label={`Use ${next} theme`}>
      {theme === 'light' ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
    </button>
  )
}
