/**
 * Footer.jsx — ミニロゴ + コピーライト
 * アニメーションなし、静的コンポーネント
 */
import { UShape, XShape } from './Symbols'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="logo-mark">
        <UShape />
        <UShape style={{ transform: 'rotate(90deg)' }} />
        <UShape style={{ transform: 'rotate(180deg)' }} />
        <XShape style={{ transform: 'rotate(45deg)' }} />
      </div>
      <p>uuuux.design — Universal eXperience Design Studio</p>
    </footer>
  )
}
