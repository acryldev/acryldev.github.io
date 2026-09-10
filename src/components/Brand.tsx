import { Link } from 'react-router-dom'

export function Brand({ compact = false }: { readonly compact?: boolean }) {
  return (
    <Link className="brand" to="/" aria-label="ACRYL home">
      <img className="brand-logo" src="/acryl-logo.png" alt="" aria-hidden="true" />
      {!compact && <span className="brand-word">ACRYL</span>}
    </Link>
  )
}
