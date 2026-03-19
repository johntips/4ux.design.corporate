/**
 * Controller.jsx — 開閉式 DAW コントローラー
 *
 * 閉じた状態: 44x44px のダークグレー正方形
 * 開いた状態: フルパネル (ステップシーケンサー + フェーダー群)
 *
 * 修正: パネルは常にDOMに存在。visibility + opacity + scale で GSAP 制御。
 * 条件レンダリングだと ref が null で開けないバグがあった。
 */
import { useRef, useCallback } from 'react'
import gsap from 'gsap'
import { useDesignParams, VARIANT_COUNT } from '../context/VariantContext'
import { useHaptics } from '../hooks/useHaptics'
import variants from './SymbolVariants'

export default function Controller() {
  const { variant, tileSize, tileGap, strokeW, opacity, setParam, nextVariant } = useDesignParams()
  const haptics = useHaptics()
  const openRef = useRef(false)       // re-render なしで開閉状態を管理
  const panelRef = useRef(null)
  const toggleRef = useRef(null)
  const iconRef = useRef(null)

  const toggle = useCallback(() => {
    const panel = panelRef.current
    const btn = toggleRef.current
    const icon = iconRef.current
    if (!panel || !btn) return

    haptics.nudge()

    if (!openRef.current) {
      // ── 閉 → 開 ──
      openRef.current = true
      gsap.to(panel, {
        autoAlpha: 1,          // opacity + visibility を同時制御
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.4)',
      })
      gsap.to(btn, { scale: 0.85, duration: 0.3 })
      if (icon) icon.setAttribute('data-state', 'open')
    } else {
      // ── 開 → 閉 ──
      openRef.current = false
      gsap.to(panel, {
        autoAlpha: 0,          // opacity:0 + visibility:hidden
        scale: 0.3,
        duration: 0.3,
        ease: 'power2.in',
      })
      gsap.to(btn, { scale: 1, duration: 0.3 })
      if (icon) icon.setAttribute('data-state', 'closed')
    }
  }, [haptics])

  return (
    <div className="controller-wrap">
      {/* ── トグルボタン: 44x44 正方形 ── */}
      <button
        ref={toggleRef}
        className="ctrl-toggle"
        onClick={toggle}
        aria-label="Toggle controller"
      >
        <svg ref={iconRef} data-state="closed" viewBox="0 0 48 48" fill="none" width="20" height="20">
          {/* フェーダーアイコン (常に表示、data-state で CSS 切替も可) */}
          <line x1="12" y1="16" x2="36" y2="16" stroke="#999" strokeWidth="3" strokeLinecap="round" />
          <line x1="12" y1="24" x2="36" y2="24" stroke="#999" strokeWidth="3" strokeLinecap="round" />
          <line x1="12" y1="32" x2="36" y2="32" stroke="#999" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="16" r="3" fill="#ccc" />
          <circle cx="30" cy="24" r="3" fill="#ccc" />
          <circle cx="16" cy="32" r="3" fill="#ccc" />
        </svg>
      </button>

      {/* ── パネル本体 (常にDOMに存在、初期非表示) ── */}
      <div
        ref={panelRef}
        className="ctrl-panel"
        style={{ visibility: 'hidden', opacity: 0, transform: 'scale(0.3)' }}
      >
        <div className="ctrl-header" onClick={nextVariant}>
          <span className="ctrl-ptn-num">{variant}</span>
          <span className="ctrl-ptn-name">{variants[variant].name}</span>
        </div>

        <div className="ctrl-steps">
          {Array.from({ length: VARIANT_COUNT }, (_, i) => (
            <button
              key={i}
              className={`ctrl-step ${i === variant ? 'active' : ''}`}
              onClick={() => { setParam('variant', i); haptics.tap() }}
            >
              {i}
            </button>
          ))}
        </div>

        <div className="ctrl-sep" />

        <Fader label="SIZE" value={tileSize} min={16} max={400} step={4}
          display={`${tileSize}`} onChange={(v) => setParam('tileSize', v)} />
        <Fader label="GAP" value={tileGap} min={-20} max={80} step={2}
          display={`${tileGap}`} onChange={(v) => setParam('tileGap', v)} />
        <Fader label="STRK" value={strokeW} min={1} max={14} step={1}
          display={`${strokeW}`} onChange={(v) => setParam('strokeW', v)} />
        <Fader label="OPAC" value={opacity} min={0.02} max={0.5} step={0.02}
          display={`${(opacity * 100).toFixed(0)}%`} onChange={(v) => setParam('opacity', v)} />

        <div className="ctrl-footer">shift+f</div>
      </div>
    </div>
  )
}

function Fader({ label, value, min, max, step, display, onChange }) {
  return (
    <div className="fader">
      <span className="fader-label">{label}</span>
      <div className="fader-track">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="fader-input"
        />
      </div>
      <span className="fader-value">{display}</span>
    </div>
  )
}
