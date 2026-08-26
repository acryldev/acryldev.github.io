import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/600.css'
import '@fontsource-variable/space-grotesk'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import './styles.css'

const redirectedPath = sessionStorage.getItem('acryl-redirect')
if (redirectedPath) {
  sessionStorage.removeItem('acryl-redirect')
  history.replaceState(null, '', redirectedPath)
}

const basename = location.hostname === 'acryldev.github.io' ? '/acryldev' : undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
