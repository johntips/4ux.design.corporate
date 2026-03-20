/**
 * Controller.jsx — 開閉式 DAW コントローラー
 *
 * パターン選択: < n / m > ナビゲーション (ボタン列は廃止)
 * 2D: SIZE, GAP, STRK, OPAC
 * 3D: RX, RY, PRSP (perspective)
 */
import { useRef, useCallback } from 'react'
import gsap from 'gsap'
import { useDesignParams, VARIANT_COUNT } from '../context/VariantContext'
import { useHaptics } from '../hooks/useHaptics'
import variants from './SymbolVariants'

export default function Controller() {
  const {
    variant, tileSize, tileGap, strokeW, opacity,
    rotX, rotY, perspective,
    setParam, nextVariant, prevVariant,
  } = useDesignParams()
  const haptics = useHaptics()
  const openRef = useRef(false)
  const panelRef = useRef(null)
  const toggleRef = useRef(null)

  const toggle = useCallback(() => {
    const panel = panelRef.current
    const btn = toggleRef.current
    if (!panel || !btn) return
    haptics.nudge()

    if (!openRef.current) {
      openRef.current = true
      gsap.to(panel, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.4)' })
      gsap.to(btn, { scale: 0.85, duration: 0.3 })
    } else {
      openRef.current = false
      gsap.to(panel, { autoAlpha: 0, scale: 0.3, duration: 0.3, ease: 'power2.in' })
      gsap.to(btn, { scale: 1, duration: 0.3 })
    }
  }, [haptics])

  return (
    <div className="controller-wrap">
      <button ref={toggleRef} className="ctrl-toggle" onClick={toggle} aria-label="Toggle controller">
        <svg viewBox="0 0 48 48" fill="none" width="20" height="20">
          <line x1="12" y1="16" x2="36" y2="16" stroke="#999" strokeWidth="3" strokeLinecap="round" />
          <line x1="12" y1="24" x2="36" y2="24" stroke="#999" strokeWidth="3" strokeLinecap="round" />
          <line x1="12" y1="32" x2="36" y2="32" stroke="#999" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="16" r="3" fill="#ccc" />
          <circle cx="30" cy="24" r="3" fill="#ccc" />
          <circle cx="16" cy="32" r="3" fill="#ccc" />
        </svg>
      </button>

      <div ref={panelRef} className="ctrl-panel"
        style={{ visibility: 'hidden', opacity: 0, transform: 'scale(0.3)' }}>

        {/* ── パターン: < n / m > ── */}
        <div className="ctrl-nav">
          <button className="ctrl-nav-btn" onClick={() => { prevVariant(); haptics.tap() }}>&lt;</button>
          <div className="ctrl-nav-display">
            <span className="ctrl-nav-num">{variant}</span>
            <span className="ctrl-nav-slash">/</span>
            <span className="ctrl-nav-total">{VARIANT_COUNT}</span>
          </div>
          <button className="ctrl-nav-btn" onClick={() => { nextVariant(); haptics.tap() }}>&gt;</button>
        </div>
        <div className="ctrl-nav-name">{variants[variant]?.name}</div>

        <div className="ctrl-sep" />

        {/* ── 2D ── */}
        <Fader label="SIZE" value={tileSize} min={16} max={600} step={4}
          display={`${tileSize}`} onChange={(v) => setParam('tileSize', v)} haptics={haptics} />
        <Fader label="GAP" value={tileGap} min={-(tileSize - 4)} max={tileSize} step={1}
          display={`${tileGap}`} onChange={(v) => setParam('tileGap', v)} haptics={haptics} />
        <Fader label="STRK" value={strokeW} min={1} max={14} step={1}
          display={`${strokeW}`} onChange={(v) => setParam('strokeW', v)} haptics={haptics} />
        <Fader label="OPAC" value={opacity} min={0.02} max={0.5} step={0.02}
          display={`${(opacity * 100).toFixed(0)}%`} onChange={(v) => setParam('opacity', v)} haptics={haptics} />

        <div className="ctrl-sep" />

        {/* ── 3D ── */}
        <Fader label="RX" value={rotX} min={-60} max={60} step={1}
          display={`${rotX}°`} onChange={(v) => setParam('rotX', v)} haptics={haptics} />
        <Fader label="RY" value={rotY} min={-60} max={60} step={1}
          display={`${rotY}°`} onChange={(v) => setParam('rotY', v)} haptics={haptics} />
        <Fader label="PRSP" value={perspective} min={0} max={2000} step={50}
          display={perspective === 0 ? 'OFF' : `${perspective}`} onChange={(v) => setParam('perspective', v)} haptics={haptics} />

        <div className="ctrl-footer">shift+f</div>
      </div>
    </div>
  )
}

function Fader({ label, value, min, max, step, display, onChange, haptics }) {
  const clamp = (v) => Math.min(max, Math.max(min, v))
  const range = max - min || 1

  const handleChange = (newVal) => {
    const ratio = (newVal - min) / range
    haptics.slide(ratio)
    onChange(newVal)
  }

  const handleGrab = () => haptics.grab()
  const handleRelease = () => haptics.release()

  const nudge = (dir, fine) => {
    const amount = fine ? step : step * 10
    handleChange(clamp(value + dir * amount))
  }

  const onWheel = (e) => {
    e.preventDefault()
    nudge(e.deltaY < 0 ? 1 : -1, !e.shiftKey)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); nudge(1, !e.shiftKey) }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1, !e.shiftKey) }
  }

  return (
    <div className="fader" onWheel={onWheel}>
      <span className="fader-label">{label}</span>
      <div className="fader-track">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => handleChange(parseFloat(e.target.value))}
          onTouchStart={handleGrab} onTouchEnd={handleRelease}
          onMouseDown={handleGrab} onMouseUp={handleRelease}
          onKeyDown={onKeyDown} className="fader-input" />
      </div>
      <span className="fader-value">{display}</span>
    </div>
  )
}
