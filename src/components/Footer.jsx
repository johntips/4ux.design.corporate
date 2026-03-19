/**
 * Footer.jsx — ミニロゴ + コピーライト + バリエーション表示
 */
import { VariantU, VariantX } from './SymbolVariants'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="logo-mark">
        <VariantU />
        <VariantU style={{ transform: 'rotate(90deg)' }} />
        <VariantU style={{ transform: 'rotate(180deg)' }} />
        <VariantX style={{ transform: 'rotate(45deg)' }} />
      </div>
      <p>uuuux.design</p>
      <p style={{ marginTop: '1rem', fontSize: '0.7rem', opacity: 0.3 }}>
        &copy; 2026 uuuux.design All rights reserved.
      </p>
    </footer>
  )
}
