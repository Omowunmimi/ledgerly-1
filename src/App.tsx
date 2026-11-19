import { useEffect, useState } from 'react'
import MarketingSite from './components/marketing'
import { ApplicationScreen, type AppView } from './components/application'

type AppRoute = 'dashboard' | 'invoices' | 'create-invoice'

function resolveRoute(pathname: string): AppRoute | null {
  if (pathname === '/app/dashboard' || pathname === '/app/overview') return 'dashboard'
  if (pathname === '/app/invoices') return 'invoices'
  if (pathname === '/app/create-invoice' || pathname === '/app/create') return 'create-invoice'
  return null
}

export default function App() {
  const [appLocation, setAppLocation] = useState(() => `${window.location.pathname}${window.location.search}`)

  useEffect(() => {
    const syncLocation = () => setAppLocation(`${window.location.pathname}${window.location.search}`)
    window.addEventListener('popstate', syncLocation)
    return () => window.removeEventListener('popstate', syncLocation)
  }, [])

  const appRoute = resolveRoute(new URL(appLocation, window.location.origin).pathname)

  function navigate(next: AppView, href?: string) {
    const destination = href ?? `/app/${next}`
    if (`${window.location.pathname}${window.location.search}` !== destination) window.history.pushState({}, '', destination)
    setAppLocation(destination)
  }

  if (appRoute) return <ApplicationScreen key={appLocation} view={appRoute} onNavigate={navigate} />
  return <MarketingSite />
}
