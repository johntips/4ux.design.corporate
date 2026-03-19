/**
 * PatternStrip.jsx — 横スクロールするタイル帯
 *
 * direction="left"|"right" でスクロール方向を指定
 * gsap.fromTo() で translateX を無限ループ
 *
 * ※ VariantU/VariantX を使うため、Shift+F でバリエーション切替に追従
 */
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { VariantU, VariantX } from './SymbolVariants'

export default function PatternStrip({ direction = 'left' }) {
  const innerRef = useRef(null)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return

    // コンテンツを複製してシームレスループ
    el.innerHTML += el.innerHTML
    const half = el.scrollWidth / 2

    const from = direction === 'left' ? 0 : -half
    const to = direction === 'left' ? -half : 0

    const tween = gsap.fromTo(el, { x: from }, { x: to, duration: 30, ease: 'none', repeat: -1 })
    return () => tween.kill()
  }, [direction])

  return (
    <div className="pattern-strip">
      <div className="pattern-strip-inner" ref={innerRef}>
        {STRIP_ITEMS.map((item, i) => (
          <div key={i} style={{ transform: `rotate(${item.rot}deg)`, display: 'inline-flex', width: 72, height: 72 }}>
            {item.isX ? <VariantX /> : <VariantU />}
          </div>
        ))}
      </div>
    </div>
  )
}

const STRIP_ITEMS = Array.from({ length: 24 }, (_, i) => ({
  isX: i % 4 === 3,
  rot: i % 4 === 3 ? (i % 2 === 0 ? 0 : 45) : (i % 3) * 90,
}))
