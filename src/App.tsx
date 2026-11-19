import MarketingSite from './components/marketing'
import { ApplicationScreen } from './components/application'

type AppRoute = 'dashboard' | 'invoices' | 'create-invoice'

function resolveRoute(pathname: string): AppRoute | null {
  if (pathname === '/app/dashboard' || pathname === '/app/overview') return 'dashboard'
  if (pathname === '/app/invoices') return 'invoices'
  if (pathname === '/app/create-invoice' || pathname === '/app/create') return 'create-invoice'
  return null
}

export default function App() {
  const appRoute = resolveRoute(window.location.pathname)
  if (appRoute) return <ApplicationScreen view={appRoute} />
  return <MarketingSite />
}
