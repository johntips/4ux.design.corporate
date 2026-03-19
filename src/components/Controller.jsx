/**
 * Controller.jsx — 開閉式 DAW コントローラー
 *
 * 閉じた状態: 44x44px のダークグレー正方形 (タップしやすいサイズ)
 * 開いた状態: フルパネル (ステップシーケンサー + フェーダー群)
 *
 * クリック/タップで開閉。GSAP でみよーんとアニメーション。
 * 開閉時に haptics フィードバック発動。
 */
import { useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { useDesignParams, VARIANT_COUNT } from '../context/VariantContext'
import { useHaptics } from '../hooks/useHaptics'
import variants from './SymbolVariants'

export default function Controller() {
  const { variant, tileSize, tileGap, strokeW, opacity, setParam, nextVariant } = useDesignParams()
  const haptics = useHaptics()
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const toggleRef = useRef(null)

  // ── 開閉トグル ──
  const toggle = useCallback(() => {
    const panel = panelRef.current
    const btn = toggleRef.current
    if (!panel || !btn) return

    haptics.nudge()

    if (!open) {
      // 閉 → 開: 正方形からパネルがみよーんと展開
      setOpen(true)
      gsap.fromTo(panel, {
        opacity: 0,
        scale: 0.3,
        transformOrigin: 'bottom left',
      }, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.4)',
      })
      // トグルボタンを小さく
      gsap.to(btn, {
        scale: 0.8,
        opacity: 0.6,
        duration: 0.3,
      })
    } else {
      // 開 → 閉: パネルが正方形に吸い込まれる
      gsap.to(panel, {
        opacity: 0,
        scale: 0.3,
        transformOrigin: 'bottom left',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => setOpen(false),
      })
      // トグルボタン戻す
      gsap.to(btn, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
      })
    }
  }, [open, haptics])

  return (
    <div className="controller-wrap">
      {/* ── トグルボタン: 44x44 ダークグレー正方形 ── */}
      <button
        ref={toggleRef}
        className="ctrl-toggle"
        onClick={toggle}
        aria-label={open ? 'Close controller' : 'Open controller'}
      >
        <svg viewBox="0 0 48 48" fill="none" width="20" height="20">
          {open ? (
            // 閉じる: × アイコン
            <>
              <line x1="12" y1="12" x2="36" y2="36" stroke="#999" strokeWidth="4" strokeLinecap="round" />
              <line x1="36" y1="12" x2="12" y2="36" stroke="#999" strokeWidth="4" strokeLinecap="round" />
            </>
          ) : (
            // 開く: フェーダーアイコン (3本線)
            <>
              <line x1="12" y1="16" x2="36" y2="16" stroke="#999" strokeWidth="3" strokeLinecap="round" />
              <line x1="12" y1="24" x2="36" y2="24" stroke="#999" strokeWidth="3" strokeLinecap="round" />
              <line x1="12" y1="32" x2="36" y2="32" stroke="#999" strokeWidth="3" strokeLinecap="round" />
              <circle cx="20" cy="16" r="3" fill="#ccc" />
              <circle cx="30" cy="24" r="3" fill="#ccc" />
              <circle cx="16" cy="32" r="3" fill="#ccc" />
            </>
          )}
        </svg>
      </button>

      {/* ── パネル本体 ── */}
      {open && (
        <div ref={panelRef} className="ctrl-panel">
          {/* パターン表示 */}
          <div className="ctrl-header" onClick={nextVariant}>
            <span className="ctrl-ptn-num">{variant}</span>
            <span className="ctrl-ptn-name">{variants[variant].name}</span>
          </div>

          {/* ステップシーケンサー (0-9) */}
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

          {/* フェーダー群 */}
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
      )}
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
