import { Link } from 'react-router-dom'

export function Brand({ compact = false }: { readonly compact?: boolean }) {
  return (
    <Link className="brand" to="/" aria-label="ACRYL home">
      <span className="brand-glyph" aria-hidden="true">
        <span>A</span><span>C</span><span>R</span><span>Y</span><span>L</span>
      </span>
      {!compact && <span className="brand-word">ACRYL</span>}
    </Link>
  )
}
