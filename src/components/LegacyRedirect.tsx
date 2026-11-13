import { Navigate, useLocation } from 'react-router-dom'

/** Sends an old address to its new home, keeping the rest of the path, the query and the fragment, so shared links keep working. */
export function LegacyRedirect({ from, to }: { readonly from: string; readonly to: string }) {
  const { pathname, search, hash } = useLocation()
  return <Navigate replace to={`${to}${pathname.slice(from.length)}${search}${hash}`} />
}
