import { Route, Routes } from 'react-router-dom'
import { LegacyRedirect } from './components/LegacyRedirect'
import { Shell } from './components/Shell'
import { BlendsPage } from './pages/BlendsPage'
import { BootcampPage } from './pages/BootcampPage'
import { DocsPage } from './pages/DocsPage'
import { FrameworkDocsPage } from './pages/FrameworkDocsPage'
import { EventsPage } from './pages/EventsPage'
import { HomePage } from './pages/HomePage'
import { PackagePage } from './pages/PackagePage'
import { PackagesPage } from './pages/PackagesPage'
import { RebasedPage } from './pages/RebasedPage'
import { QrPage } from './pages/QrPage'
import { UiPage } from './pages/UiPage'
import { UpdatesPage } from './pages/UpdatesPage'
import { EcosystemPage } from './pages/EcosystemPage'
import { GuidePage } from './pages/GuidePage'
import { build, concepts, reference, start, vision } from './lib/guides'

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<HomePage />} />
        <Route path="start" element={<GuidePage guide={start} />} />
        <Route path="concepts" element={<GuidePage guide={concepts} />} />
        <Route path="build" element={<GuidePage guide={build} />} />
        <Route path="reference" element={<GuidePage guide={reference} />} />
        <Route path="vision" element={<GuidePage guide={vision} />} />
        <Route path="ecosystem" element={<EcosystemPage />} />
        <Route path="blends" element={<BlendsPage />} />
        <Route path="ecosystem/plugins" element={<PackagesPage />} />
        <Route path="ecosystem/plugins/:owner/*" element={<PackagePage />} />
        <Route path="packages/*" element={<LegacyRedirect from="/packages" to="/ecosystem/plugins" />} />
        <Route path="ui" element={<UiPage />} />
        <Route path="docs/platform" element={<DocsPage />} />
        <Route path="docs" element={<FrameworkDocsPage />} />
        <Route path="docs/*" element={<FrameworkDocsPage />} />
        <Route path="qr" element={<QrPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/acrylbootcamp" element={<BootcampPage />} />
        <Route path="events/rebaseddotwtf" element={<RebasedPage />} />
        <Route path="updates" element={<UpdatesPage />} />
        <Route path="*" element={<div className="not-found page-width"><span>404</span><h1>Page not found.</h1></div>} />
      </Route>
    </Routes>
  )
}
