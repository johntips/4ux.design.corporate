/**
 * Controller.jsx — DAW / ハードウェアシンセ風コントローラー
 *
 * 左下固定。デザインパラメータをフェーダースライダーで調整:
 *   - variant: パターン切替 (0-9 ステップシーケンサー風)
 *   - SIZE:  タイルサイズ (24-240px)
 *   - GAP:   タイル間隔 (0-20px)
 *   - STRK:  stroke 太さ (1-14)
 *   - OPAC:  タイル不透明度 (2%-40%)
 */
import { useDesignParams, VARIANT_COUNT } from '../context/VariantContext'
import variants from './SymbolVariants'

export default function Controller() {
  const { variant, tileSize, tileGap, strokeW, opacity, setParam, nextVariant } = useDesignParams()

  return (
    <div className="controller">
      {/* ── パターン表示 ── */}
      <div className="ctrl-header" onClick={nextVariant}>
        <span className="ctrl-ptn-num">{variant}</span>
        <span className="ctrl-ptn-name">{variants[variant].name}</span>
      </div>

      {/* ── ステップシーケンサー (0-9) ── */}
      <div className="ctrl-steps">
        {Array.from({ length: VARIANT_COUNT }, (_, i) => (
          <button
            key={i}
            className={`ctrl-step ${i === variant ? 'active' : ''}`}
            onClick={() => setParam('variant', i)}
          >
            {i}
          </button>
        ))}
      </div>

      <div className="ctrl-sep" />

      {/* ── フェーダー群 ── */}
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
  )
}

/** フェーダースライダー — DAW のチャンネルフェーダー風 */
function Fader({ label, value, min, max, step, display, onChange }) {
  return (
    <div className="fader">
      <span className="fader-label">{label}</span>
      <div className="fader-track">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="fader-input"
        />
      </div>
      <span className="fader-value">{display}</span>
    </div>
  )
}
