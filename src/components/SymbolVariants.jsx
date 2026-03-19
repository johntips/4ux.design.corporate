/**
 * SymbolVariants.jsx — ランドルト環ベースの10バリエーション
 *
 * すべて viewBox 48x48、中心(24,24)、半径16 の円弧ベース
 *
 * U = ランドルト環 (上に切れ目のある円弧)
 *   変数: strokeWidth (太さ) × gap angle (切れ目の広さ)
 *
 * X = クロスヘア (中心に隙間のある十字 + 中心ドット)
 *   変数: strokeWidth は U に合わせて統一
 *
 * 弧の座標計算:
 *   gap angle G° を上部 (270°) に中心を置き、
 *   start = (-90 + G/2)° → 円弧の右端
 *   end   = (-90 - G/2)° → 円弧の左端
 *   A16,16 0 1,1 → 大弧を時計回りで描画
 */
import { useVariant } from '../context/VariantContext'

/**
 * ランドルト環のパス生成ヘルパー
 * @param {number} gap - 切れ目の角度 (degrees)
 * @returns {string} SVG path d 属性
 */
function landoltPath(gap) {
  const r = 16
  const cx = 24, cy = 24
  const toRad = (deg) => (deg * Math.PI) / 180

  // 右端: -90 + gap/2
  const a1 = toRad(-90 + gap / 2)
  const sx = (cx + r * Math.cos(a1)).toFixed(1)
  const sy = (cy + r * Math.sin(a1)).toFixed(1)

  // 左端: -90 - gap/2
  const a2 = toRad(-90 - gap / 2)
  const ex = (cx + r * Math.cos(a2)).toFixed(1)
  const ey = (cy + r * Math.sin(a2)).toFixed(1)

  return `M${sx},${sy} A16,16 0 1,1 ${ex},${ey}`
}

/**
 * クロスヘアの SVG 要素生成
 * @param {string} c - color
 * @param {number} sw - strokeWidth
 * @param {number} gapR - 中心の隙間半径 (px)
 * @param {number} dotR - 中心ドットの半径
 */
function crosshair(c, sw, gapR = 5, dotR = 3) {
  const inner = 24 - gapR
  const outer = 24 + gapR
  return (<>
    <line x1="8"     y1="24" x2={inner} y2="24" stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <line x1={outer}  y1="24" x2="40"   y2="24" stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <line x1="24" y1="8"     x2="24" y2={inner} stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <line x1="24" y1={outer}  x2="24" y2="40"   stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <circle cx="24" cy="24" r={dotR} fill={c} />
  </>)
}

// ── 10バリエーション定義 ──
// 軸1: strokeWidth (線の太さ)  3 → 12
// 軸2: gap angle (切れ目の広さ) 30° → 150°

const variants = [
  // 0: Landolt — ★合格★ ベースライン
  //    sw=8, gap=90°, 中庸なバランス
  {
    name: 'Landolt',
    U: (c) => (
      <path d={landoltPath(90)} stroke={c} strokeWidth="8" strokeLinecap="butt" fill="none" />
    ),
    X: (c) => crosshair(c, 6, 5, 3),
  },

  // 1: Hairline — 極細、同じ開口
  //    sw=2.5, gap=90°
  {
    name: 'Hairline',
    U: (c) => (
      <path d={landoltPath(90)} stroke={c} strokeWidth="2.5" strokeLinecap="butt" fill="none" />
    ),
    X: (c) => crosshair(c, 2, 5, 1.5),
  },

  // 2: Bold — 太い
  //    sw=11, gap=90°
  {
    name: 'Bold',
    U: (c) => (
      <path d={landoltPath(90)} stroke={c} strokeWidth="11" strokeLinecap="butt" fill="none" />
    ),
    X: (c) => crosshair(c, 9, 5, 4),
  },

  // 3: Ultra — 極太
  //    sw=14, gap=90°, ほぼベタ塗り感
  {
    name: 'Ultra',
    U: (c) => (
      <path d={landoltPath(90)} stroke={c} strokeWidth="14" strokeLinecap="butt" fill="none" />
    ),
    X: (c) => crosshair(c, 12, 5, 5),
  },

  // 4: Narrow — 切れ目が狭い（ほぼ閉じた環）
  //    sw=8, gap=35°
  {
    name: 'Narrow',
    U: (c) => (
      <path d={landoltPath(35)} stroke={c} strokeWidth="8" strokeLinecap="butt" fill="none" />
    ),
    X: (c) => crosshair(c, 6, 3, 2),
  },

  // 5: Wide — 切れ目が広い
  //    sw=8, gap=140°
  {
    name: 'Wide',
    U: (c) => (
      <path d={landoltPath(140)} stroke={c} strokeWidth="8" strokeLinecap="butt" fill="none" />
    ),
    X: (c) => crosshair(c, 6, 7, 3),
  },

  // 6: Light Wide — 細線 + 広開口
  //    sw=4, gap=130°
  {
    name: 'Light Wide',
    U: (c) => (
      <path d={landoltPath(130)} stroke={c} strokeWidth="4" strokeLinecap="butt" fill="none" />
    ),
    X: (c) => crosshair(c, 3, 6, 2),
  },

  // 7: Bold Narrow — 太線 + 狭開口
  //    sw=11, gap=45°
  {
    name: 'Bold Narrow',
    U: (c) => (
      <path d={landoltPath(45)} stroke={c} strokeWidth="11" strokeLinecap="butt" fill="none" />
    ),
    X: (c) => crosshair(c, 9, 3, 4),
  },

  // 8: Medium — 中間の太さ + やや狭い
  //    sw=6, gap=65°
  {
    name: 'Medium',
    U: (c) => (
      <path d={landoltPath(65)} stroke={c} strokeWidth="6" strokeLinecap="butt" fill="none" />
    ),
    X: (c) => crosshair(c, 5, 4, 2.5),
  },

  // 9: Extreme — 極太 + 超広開口
  //    sw=14, gap=160°, ほぼ半円
  {
    name: 'Extreme',
    U: (c) => (
      <path d={landoltPath(160)} stroke={c} strokeWidth="14" strokeLinecap="butt" fill="none" />
    ),
    X: (c) => crosshair(c, 12, 8, 5),
  },
]

export default variants

/**
 * VariantU — 現在バリエーションの U シンボル (ランドルト環)
 */
export function VariantU({ color = '#1a1a1a', ...props }) {
  const v = useVariant()
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {variants[v].U(color)}
    </svg>
  )
}

/**
 * VariantX — 現在バリエーションの X シンボル (クロスヘア)
 */
export function VariantX({ color = '#1a1a1a', ...props }) {
  const v = useVariant()
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {variants[v].X(color)}
    </svg>
  )
}
