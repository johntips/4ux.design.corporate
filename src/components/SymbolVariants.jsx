/**
 * SymbolVariants.jsx — 30パターンのシンボルバリエーション
 *
 * 0-9:   基本 (太さ × 開口角)
 * 10-19: 構造変化 (二重線、点線、セグメント等)
 * 20-29: 未来的 (グリッチ、ネオン、ステンシル等)
 *
 * viewBox 48x48、中心(24,24)、基本半径16
 */
import { useVariant, useDesignParams } from '../context/VariantContext'

// ── ヘルパー ──

/** ランドルト環パス (gap=切れ目角度, r=半径) */
function lPath(gap, r = 16) {
  const cx = 24, cy = 24, toRad = (d) => (d * Math.PI) / 180
  const a1 = toRad(-90 + gap / 2), a2 = toRad(-90 - gap / 2)
  const sx = (cx + r * Math.cos(a1)).toFixed(1), sy = (cy + r * Math.sin(a1)).toFixed(1)
  const ex = (cx + r * Math.cos(a2)).toFixed(1), ey = (cy + r * Math.sin(a2)).toFixed(1)
  const large = gap < 180 ? 1 : 0
  return `M${sx},${sy} A${r},${r} 0 ${large},1 ${ex},${ey}`
}

/** クロスヘア */
function xh(c, sw, g = 5, d = 3) {
  const i = 24 - g, o = 24 + g
  return (<>
    <line x1="8" y1="24" x2={i} y2="24" stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <line x1={o} y1="24" x2="40" y2="24" stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <line x1="24" y1="8" x2="24" y2={i} stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <line x1="24" y1={o} x2="24" y2="40" stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <circle cx="24" cy="24" r={d} fill={c} />
  </>)
}

/** クロスヘア (ドットなし) */
function xhNoDot(c, sw, g = 5) {
  const i = 24 - g, o = 24 + g
  return (<>
    <line x1="8" y1="24" x2={i} y2="24" stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <line x1={o} y1="24" x2="40" y2="24" stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <line x1="24" y1="8" x2="24" y2={i} stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <line x1="24" y1={o} x2="24" y2="40" stroke={c} strokeWidth={sw} strokeLinecap="butt" />
  </>)
}

/** フル十字 (隙間なし) */
function xFull(c, sw) {
  return (<>
    <line x1="8" y1="24" x2="40" y2="24" stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <line x1="24" y1="8" x2="24" y2="40" stroke={c} strokeWidth={sw} strokeLinecap="butt" />
  </>)
}

// ── 30 バリエーション ──

const variants = [

  // ════════ 0-9: 基本 (太さ × 開口角) ════════

  { name: 'Landolt',
    U: (c, s) => <path d={lPath(90)} stroke={c} strokeWidth={s} strokeLinecap="butt" fill="none" />,
    X: (c, s) => xh(c, s * 0.75, 5, s * 0.35) },

  { name: 'Hairline',
    U: (c, s) => <path d={lPath(90)} stroke={c} strokeWidth={s * 0.3} strokeLinecap="butt" fill="none" />,
    X: (c, s) => xh(c, s * 0.25, 5, s * 0.15) },

  { name: 'Bold',
    U: (c, s) => <path d={lPath(90)} stroke={c} strokeWidth={s * 1.3} strokeLinecap="butt" fill="none" />,
    X: (c, s) => xh(c, s * 1.1, 5, s * 0.45) },

  { name: 'Ultra',
    U: (c, s) => <path d={lPath(90)} stroke={c} strokeWidth={s * 1.6} strokeLinecap="butt" fill="none" />,
    X: (c, s) => xh(c, s * 1.4, 5, s * 0.55) },

  { name: 'Narrow',
    U: (c, s) => <path d={lPath(35)} stroke={c} strokeWidth={s} strokeLinecap="butt" fill="none" />,
    X: (c, s) => xh(c, s * 0.75, 3, s * 0.25) },

  { name: 'Wide',
    U: (c, s) => <path d={lPath(140)} stroke={c} strokeWidth={s} strokeLinecap="butt" fill="none" />,
    X: (c, s) => xh(c, s * 0.75, 7, s * 0.35) },

  { name: 'Light Wide',
    U: (c, s) => <path d={lPath(130)} stroke={c} strokeWidth={s * 0.5} strokeLinecap="butt" fill="none" />,
    X: (c, s) => xh(c, s * 0.4, 6, s * 0.2) },

  { name: 'Bold Narrow',
    U: (c, s) => <path d={lPath(45)} stroke={c} strokeWidth={s * 1.3} strokeLinecap="butt" fill="none" />,
    X: (c, s) => xh(c, s * 1.1, 3, s * 0.45) },

  { name: 'Medium',
    U: (c, s) => <path d={lPath(65)} stroke={c} strokeWidth={s * 0.7} strokeLinecap="butt" fill="none" />,
    X: (c, s) => xh(c, s * 0.6, 4, s * 0.28) },

  { name: 'Extreme',
    U: (c, s) => <path d={lPath(160)} stroke={c} strokeWidth={s * 1.6} strokeLinecap="butt" fill="none" />,
    X: (c, s) => xh(c, s * 1.4, 8, s * 0.55) },

  // ════════ 10-19: 構造変化 ════════

  // 10: Round — 端が丸い
  { name: 'Round',
    U: (c, s) => <path d={lPath(90)} stroke={c} strokeWidth={s} strokeLinecap="round" fill="none" />,
    X: (c, s) => (<>
      <line x1="8" y1="24" x2="40" y2="24" stroke={c} strokeWidth={s * 0.75} strokeLinecap="round" />
      <line x1="24" y1="8" x2="24" y2="40" stroke={c} strokeWidth={s * 0.75} strokeLinecap="round" />
    </>) },

  // 11: Double — 二重線
  { name: 'Double',
    U: (c, s) => (<>
      <path d={lPath(90, 18)} stroke={c} strokeWidth={s * 0.4} strokeLinecap="butt" fill="none" />
      <path d={lPath(90, 12)} stroke={c} strokeWidth={s * 0.4} strokeLinecap="butt" fill="none" />
    </>),
    X: (c, s) => (<>
      {xhNoDot(c, s * 0.3, 5)}
      <circle cx="24" cy="24" r="8" stroke={c} strokeWidth={s * 0.3} fill="none" />
    </>) },

  // 12: Dashed — 破線
  { name: 'Dashed',
    U: (c, s) => <path d={lPath(90)} stroke={c} strokeWidth={s} strokeLinecap="butt" strokeDasharray={`${s * 1.2} ${s * 0.6}`} fill="none" />,
    X: (c, s) => (<>
      <line x1="8" y1="24" x2="40" y2="24" stroke={c} strokeWidth={s * 0.75} strokeDasharray={`${s * 1.2} ${s * 0.6}`} />
      <line x1="24" y1="8" x2="24" y2="40" stroke={c} strokeWidth={s * 0.75} strokeDasharray={`${s * 1.2} ${s * 0.6}`} />
    </>) },

  // 13: Dotted — 点線 (円形ドット)
  { name: 'Dotted',
    U: (c, s) => <path d={lPath(90)} stroke={c} strokeWidth={s * 0.8} strokeLinecap="round" strokeDasharray={`0.1 ${s * 1.1}`} fill="none" />,
    X: (c, s) => (<>
      <line x1="8" y1="24" x2="40" y2="24" stroke={c} strokeWidth={s * 0.6} strokeLinecap="round" strokeDasharray={`0.1 ${s * 1.1}`} />
      <line x1="24" y1="8" x2="24" y2="40" stroke={c} strokeWidth={s * 0.6} strokeLinecap="round" strokeDasharray={`0.1 ${s * 1.1}`} />
    </>) },

  // 14: Outline — アウトラインのみ (二重線で中抜き)
  { name: 'Outline',
    U: (c, s) => (<>
      <path d={lPath(90)} stroke={c} strokeWidth={s * 1.2} strokeLinecap="butt" fill="none" />
      <path d={lPath(90)} stroke="#f5f5f5" strokeWidth={s * 0.5} strokeLinecap="butt" fill="none" />
    </>),
    X: (c, s) => (<>
      {xFull(c, s * 1.0)}
      <line x1="8" y1="24" x2="40" y2="24" stroke="#f5f5f5" strokeWidth={s * 0.4} />
      <line x1="24" y1="8" x2="24" y2="40" stroke="#f5f5f5" strokeWidth={s * 0.4} />
    </>) },

  // 15: Triple — 三重同心弧
  { name: 'Triple',
    U: (c, s) => (<>
      <path d={lPath(90, 20)} stroke={c} strokeWidth={s * 0.3} strokeLinecap="butt" fill="none" />
      <path d={lPath(90, 16)} stroke={c} strokeWidth={s * 0.3} strokeLinecap="butt" fill="none" />
      <path d={lPath(90, 12)} stroke={c} strokeWidth={s * 0.3} strokeLinecap="butt" fill="none" />
    </>),
    X: (c, s) => (<>
      <circle cx="24" cy="24" r="18" stroke={c} strokeWidth={s * 0.2} fill="none" />
      <circle cx="24" cy="24" r="12" stroke={c} strokeWidth={s * 0.2} fill="none" />
      {xhNoDot(c, s * 0.25, 5)}
    </>) },

  // 16: Segment — 分断された弧 (4セグメント)
  { name: 'Segment',
    U: (c, s) => <path d={lPath(90)} stroke={c} strokeWidth={s} strokeLinecap="butt" strokeDasharray={`${s * 3} ${s * 1.5}`} fill="none" />,
    X: (c, s) => (<>
      <line x1="8" y1="24" x2="18" y2="24" stroke={c} strokeWidth={s * 0.75} />
      <line x1="30" y1="24" x2="40" y2="24" stroke={c} strokeWidth={s * 0.75} />
      <line x1="24" y1="8" x2="24" y2="18" stroke={c} strokeWidth={s * 0.75} />
      <line x1="24" y1="30" x2="24" y2="40" stroke={c} strokeWidth={s * 0.75} />
    </>) },

  // 17: Shadow — 影付き立体
  { name: 'Shadow',
    U: (c, s) => (<>
      <path d={lPath(90)} stroke={c} strokeWidth={s} strokeLinecap="butt" fill="none"
        transform="translate(1.5,1.5)" opacity="0.15" />
      <path d={lPath(90)} stroke={c} strokeWidth={s} strokeLinecap="butt" fill="none" />
    </>),
    X: (c, s) => (<>
      <g transform="translate(1.5,1.5)" opacity="0.15">{xFull(c, s * 0.75)}</g>
      {xh(c, s * 0.75, 5, s * 0.35)}
    </>) },

  // 18: Bracket — 角張った U (円弧ではなく直線の U)
  { name: 'Bracket',
    U: (c, s) => (
      <path d="M8,8 V36 H40 V8" stroke={c} strokeWidth={s * 0.8} strokeLinecap="butt" strokeLinejoin="miter" fill="none" />
    ),
    X: (c, s) => (<>
      {xFull(c, s * 0.8)}
      <rect x="18" y="18" width="12" height="12" stroke={c} strokeWidth={s * 0.3} fill="none" />
    </>) },

  // 19: Notch — ノッチ付き (弧の端にティックマーク)
  { name: 'Notch',
    U: (c, s) => (<>
      <path d={lPath(90)} stroke={c} strokeWidth={s} strokeLinecap="butt" fill="none" />
      {/* 切れ目の端に短いティック */}
      <line x1="35.3" y1="8.7" x2="35.3" y2="16.7" stroke={c} strokeWidth={s * 0.35} />
      <line x1="12.7" y1="8.7" x2="12.7" y2="16.7" stroke={c} strokeWidth={s * 0.35} />
    </>),
    X: (c, s) => (<>
      {xh(c, s * 0.75, 5, s * 0.35)}
      {/* 四隅にティック */}
      <line x1="8" y1="8" x2="14" y2="8" stroke={c} strokeWidth={s * 0.3} />
      <line x1="8" y1="8" x2="8" y2="14" stroke={c} strokeWidth={s * 0.3} />
      <line x1="40" y1="8" x2="34" y2="8" stroke={c} strokeWidth={s * 0.3} />
      <line x1="40" y1="8" x2="40" y2="14" stroke={c} strokeWidth={s * 0.3} />
      <line x1="8" y1="40" x2="14" y2="40" stroke={c} strokeWidth={s * 0.3} />
      <line x1="8" y1="40" x2="8" y2="34" stroke={c} strokeWidth={s * 0.3} />
      <line x1="40" y1="40" x2="34" y2="40" stroke={c} strokeWidth={s * 0.3} />
      <line x1="40" y1="40" x2="40" y2="34" stroke={c} strokeWidth={s * 0.3} />
    </>) },

  // ════════ 20-29: 未来的 ════════

  // 20: Neon — グロー (二重で発光感)
  { name: 'Neon',
    U: (c, s) => (<>
      <path d={lPath(90)} stroke={c} strokeWidth={s * 1.8} strokeLinecap="round" fill="none" opacity="0.08" />
      <path d={lPath(90)} stroke={c} strokeWidth={s * 0.5} strokeLinecap="round" fill="none" />
    </>),
    X: (c, s) => (<>
      <g opacity="0.08">{xFull(c, s * 1.5)}</g>
      {xFull(c, s * 0.4)}
      <circle cx="24" cy="24" r={s * 0.3} fill={c} />
    </>) },

  // 21: Glitch — ずれた二重像
  { name: 'Glitch',
    U: (c, s) => (<>
      <path d={lPath(90)} stroke={c} strokeWidth={s * 0.6} strokeLinecap="butt" fill="none"
        transform="translate(-2, -1)" opacity="0.3" />
      <path d={lPath(90)} stroke={c} strokeWidth={s * 0.6} strokeLinecap="butt" fill="none"
        transform="translate(2, 1)" opacity="0.3" />
      <path d={lPath(90)} stroke={c} strokeWidth={s * 0.6} strokeLinecap="butt" fill="none" />
    </>),
    X: (c, s) => (<>
      <g transform="translate(-2,-1)" opacity="0.3">{xFull(c, s * 0.5)}</g>
      <g transform="translate(2,1)" opacity="0.3">{xFull(c, s * 0.5)}</g>
      {xh(c, s * 0.5, 5, s * 0.25)}
    </>) },

  // 22: Stencil — ステンシル切り抜き風 (途切れた太弧)
  { name: 'Stencil',
    U: (c, s) => (
      <path d={lPath(90)} stroke={c} strokeWidth={s * 1.4} strokeLinecap="butt"
        strokeDasharray={`${s * 2.5} ${s * 0.8}`} fill="none" />
    ),
    X: (c, s) => (<>
      <line x1="8" y1="24" x2="40" y2="24" stroke={c} strokeWidth={s * 1.2}
        strokeDasharray={`${s * 2.5} ${s * 0.8}`} />
      <line x1="24" y1="8" x2="24" y2="40" stroke={c} strokeWidth={s * 1.2}
        strokeDasharray={`${s * 2.5} ${s * 0.8}`} />
    </>) },

  // 23: Scan — スキャンライン (水平線で描画)
  { name: 'Scan',
    U: (c, s) => (<>
      <path d={lPath(90)} stroke={c} strokeWidth={s * 0.5} strokeLinecap="butt" fill="none" />
      {[14, 20, 26, 32, 38].map(y => (
        <line key={y} x1="4" y1={y} x2="44" y2={y} stroke={c} strokeWidth="0.5" opacity="0.12" />
      ))}
    </>),
    X: (c, s) => (<>
      {xh(c, s * 0.5, 5, s * 0.2)}
      {[14, 20, 26, 32, 38].map(y => (
        <line key={y} x1="4" y1={y} x2="44" y2={y} stroke={c} strokeWidth="0.5" opacity="0.12" />
      ))}
    </>) },

  // 24: Mono — 等幅ピクセル風 (角張った弧)
  { name: 'Mono',
    U: (c, s) => (
      <path d="M10,8 V28 Q10,40 24,40 Q38,40 38,28 V8"
        stroke={c} strokeWidth={s * 0.7} strokeLinecap="butt" strokeLinejoin="miter" fill="none" />
    ),
    X: (c, s) => (<>
      {xFull(c, s * 0.7)}
    </>) },

  // 25: Concentric — 同心リング + 弧
  { name: 'Concentric',
    U: (c, s) => (<>
      <path d={lPath(80, 20)} stroke={c} strokeWidth={s * 0.35} strokeLinecap="butt" fill="none" />
      <path d={lPath(90, 16)} stroke={c} strokeWidth={s * 0.7} strokeLinecap="butt" fill="none" />
      <path d={lPath(100, 12)} stroke={c} strokeWidth={s * 0.35} strokeLinecap="butt" fill="none" />
    </>),
    X: (c, s) => (<>
      <circle cx="24" cy="24" r="20" stroke={c} strokeWidth={s * 0.15} fill="none" />
      <circle cx="24" cy="24" r="14" stroke={c} strokeWidth={s * 0.15} fill="none" />
      {xh(c, s * 0.4, 5, s * 0.2)}
    </>) },

  // 26: Half — 上下非対称 (太い下半分 + 細い上半分)
  { name: 'Half',
    U: (c, s) => (<>
      <path d={lPath(90)} stroke={c} strokeWidth={s * 1.2} strokeLinecap="butt" fill="none" />
      {/* 上の開口部に細い延長 */}
      <line x1="35.3" y1="12.7" x2="35.3" y2="6" stroke={c} strokeWidth={s * 0.25} />
      <line x1="12.7" y1="12.7" x2="12.7" y2="6" stroke={c} strokeWidth={s * 0.25} />
    </>),
    X: (c, s) => (<>
      <line x1="8" y1="24" x2="40" y2="24" stroke={c} strokeWidth={s * 1.0} />
      <line x1="24" y1="8" x2="24" y2="40" stroke={c} strokeWidth={s * 0.3} />
    </>) },

  // 27: Target — ターゲットスコープ風
  { name: 'Target',
    U: (c, s) => (<>
      <path d={lPath(90)} stroke={c} strokeWidth={s * 0.6} strokeLinecap="butt" fill="none" />
      <circle cx="24" cy="24" r="6" stroke={c} strokeWidth={s * 0.3} fill="none" />
      <circle cx="24" cy="24" r={s * 0.15} fill={c} />
    </>),
    X: (c, s) => (<>
      <circle cx="24" cy="24" r="16" stroke={c} strokeWidth={s * 0.2} fill="none" />
      <circle cx="24" cy="24" r="8" stroke={c} strokeWidth={s * 0.2} fill="none" />
      {xhNoDot(c, s * 0.35, 4)}
      <circle cx="24" cy="24" r={s * 0.2} fill={c} />
    </>) },

  // 28: Eroded — 侵食された (不規則な dasharray)
  { name: 'Eroded',
    U: (c, s) => (
      <path d={lPath(90)} stroke={c} strokeWidth={s * 0.9} strokeLinecap="butt"
        strokeDasharray={`${s*2} ${s*0.3} ${s*0.5} ${s*0.3} ${s*3} ${s*0.5}`} fill="none" />
    ),
    X: (c, s) => (<>
      <line x1="8" y1="24" x2="40" y2="24" stroke={c} strokeWidth={s * 0.7}
        strokeDasharray={`${s*3} ${s*0.4} ${s*1} ${s*0.4}`} />
      <line x1="24" y1="8" x2="24" y2="40" stroke={c} strokeWidth={s * 0.7}
        strokeDasharray={`${s*2} ${s*0.5} ${s*1.5} ${s*0.3}`} />
    </>) },

  // 29: Blueprint — 設計図風 (細線 + 寸法線風ティック)
  { name: 'Blueprint',
    U: (c, s) => (<>
      <path d={lPath(90)} stroke={c} strokeWidth={s * 0.35} strokeLinecap="butt" fill="none" />
      {/* 寸法線風の小さなティック */}
      <line x1="8" y1="22" x2="8" y2="26" stroke={c} strokeWidth={s * 0.2} />
      <line x1="40" y1="22" x2="40" y2="26" stroke={c} strokeWidth={s * 0.2} />
      <line x1="22" y1="40" x2="26" y2="40" stroke={c} strokeWidth={s * 0.2} />
      <circle cx="24" cy="24" r="2" stroke={c} strokeWidth={s * 0.15} fill="none" />
    </>),
    X: (c, s) => (<>
      {xhNoDot(c, s * 0.3, 6)}
      <rect x="10" y="10" width="28" height="28" stroke={c} strokeWidth={s * 0.12} fill="none" />
      <circle cx="24" cy="24" r="1.5" fill={c} />
    </>) },
  // ════════ 30-39: WebGL 3D (TileGrid3D で描画) ════════
  // SVG は使わないが、name と fallback 用の U/X を定義
  ...['Glass', 'Chrome', 'Wireframe', 'Neon 3D', 'Matte', 'Holo', 'Voxel', 'Clay', 'Deep', 'Minimal 3D']
    .map(name => ({
      name: `3D: ${name}`,
      U: (c, s) => <path d={lPath(90)} stroke={c} strokeWidth={s} strokeLinecap="butt" fill="none" />,
      X: (c, s) => xh(c, s * 0.75, 5, s * 0.35),
    })),
]

export default variants

/**
 * 3D押し出しレンダリング
 *
 * extrude > 0 のとき、背面から前面へ N 枚のレイヤーを重ねて立体感を出す
 * 各レイヤーは右下にオフセット + 段階的に明るくなる
 * 最前面が元の色、最背面が薄い色 → 押し出しの側面に見える
 */
function ExtrudedSvg({ children, extrude, color, ...props }) {
  if (!extrude || extrude <= 0) {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        {children}
      </svg>
    )
  }

  // 押し出しレイヤー数 (depth に応じて 3~12 枚)
  const layers = Math.min(Math.max(Math.round(extrude), 3), 12)
  // 1レイヤーあたりのオフセット量
  const step = extrude / layers

  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* 背面レイヤー (薄い色 → 側面) */}
      {Array.from({ length: layers }, (_, i) => {
        const offset = (layers - i) * step
        const alpha = 0.08 + (i / layers) * 0.15 // 0.08 → 0.23
        return (
          <g key={i} transform={`translate(${offset * 0.7}, ${offset})`} opacity={alpha}>
            {children}
          </g>
        )
      })}
      {/* 最前面 (元の色) */}
      {children}
    </svg>
  )
}

export function VariantU({ color = '#1a1a1a', ...props }) {
  const v = useVariant()
  const { strokeW, extrude } = useDesignParams()
  return (
    <ExtrudedSvg extrude={extrude} color={color} {...props}>
      {variants[v]?.U(color, strokeW)}
    </ExtrudedSvg>
  )
}

export function VariantX({ color = '#1a1a1a', ...props }) {
  const v = useVariant()
  const { strokeW, extrude } = useDesignParams()
  return (
    <ExtrudedSvg extrude={extrude} color={color} {...props}>
      {variants[v]?.X(color, strokeW)}
    </ExtrudedSvg>
  )
}
