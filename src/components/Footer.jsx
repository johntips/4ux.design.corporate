/**
 * Footer.jsx — ミニロゴ + コピーライト + バリエーション表示
 */
import { VariantU, VariantX } from './SymbolVariants'
import variants from './SymbolVariants'
import { useVariant } from '../context/VariantContext'

export default function Footer() {
  const v = useVariant()

  return (
    <footer className="footer">
      <div className="logo-mark">
        <VariantU />
        <VariantU style={{ transform: 'rotate(90deg)' }} />
        <VariantU style={{ transform: 'rotate(180deg)' }} />
        <VariantX style={{ transform: 'rotate(45deg)' }} />
      </div>
      <p>uuuux.design — 4 dimensions of You, for You.</p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', opacity: 0.4 }}>
        Shift+F to switch — variant {v}: {variants[v].name}
      </p>
    </footer>
  )
}
