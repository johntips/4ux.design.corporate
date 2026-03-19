/**
 * PatternStrip.jsx — 横スクロールするタイル帯
 *
 * direction="left" or "right" でスクロール方向を指定
 *
 * 仕組み:
 *   1. 24個のタイルを並べたコンテンツを2回繰り返す (HTMLコピー)
 *   2. gsap.fromTo() で translateX をループ
 *   3. 半分スクロールしたら最初に戻る → シームレスな無限スクロール
 */
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export default function PatternStrip({ direction = 'left' }) {
  const innerRef = useRef(null)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return

    // コンテンツを複製してシームレスループを作る
    el.innerHTML += el.innerHTML
    const half = el.scrollWidth / 2

    // left: 0 → -half, right: -half → 0
    const from = direction === 'left' ? 0 : -half
    const to = direction === 'left' ? -half : 0

    const tween = gsap.fromTo(el,
      { x: from },
      { x: to, duration: 30, ease: 'none', repeat: -1 }
    )

    return () => tween.kill()  // クリーンアップ
  }, [direction])

  return (
    <div className="pattern-strip">
      <div className="pattern-strip-inner" ref={innerRef}>
        {STRIP_ITEMS.map((item, i) => (
          <div key={i} style={{ transform: `rotate(${item.rot}deg)`, display: 'inline-flex' }}>
            {item.isX ? <XMini /> : <UMini />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── パターン定義 (U U U X の繰り返し) ──
const STRIP_ITEMS = Array.from({ length: 24 }, (_, i) => ({
  isX: i % 4 === 3,
  rot: i % 4 === 3
    ? (i % 2 === 0 ? 0 : 45)   // X は 0° か 45° (X or +)
    : (i % 3) * 90,              // U は 0°/90°/180°
}))

// ── ミニSVG ──

function UMini() {
  return (
    <svg viewBox="0 0 48 48" fill="none" style={{ width: 72, height: 72 }}>
      <path d="M8 8 C8 8 8 40 24 40 C40 40 40 8 40 8" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function XMini() {
  return (
    <svg viewBox="0 0 48 48" fill="none" style={{ width: 72, height: 72 }}>
      <line x1="10" y1="10" x2="38" y2="38" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
      <line x1="38" y1="10" x2="10" y2="38" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
