import { Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { BlendsPage } from './pages/BlendsPage'
import { BootcampPage } from './pages/BootcampPage'
import { DocsPage } from './pages/DocsPage'
import { EventsPage } from './pages/EventsPage'
import { HomePage } from './pages/HomePage'
import { PackagePage } from './pages/PackagePage'
import { PackagesPage } from './pages/PackagesPage'
import { QrPage } from './pages/QrPage'
import { UiPage } from './pages/UiPage'
import { UpdatesPage } from './pages/UpdatesPage'

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<HomePage />} />
        <Route path="blends" element={<BlendsPage />} />
        <Route path="packages" element={<PackagesPage />} />
        <Route path="packages/:owner/*" element={<PackagePage />} />
        <Route path="ui" element={<UiPage />} />
        <Route path="docs" element={<DocsPage />} />
        <Route path="qr" element={<QrPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/acrylbootcamp" element={<BootcampPage />} />
        <Route path="updates" element={<UpdatesPage />} />
        <Route path="*" element={<div className="not-found page-width"><span>404</span><h1>Page not found.</h1></div>} />
      </Route>
    </Routes>
  )
}
