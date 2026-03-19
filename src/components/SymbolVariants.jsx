/**
 * SymbolVariants.jsx — ランドルト環ベースの10バリエーション
 *
 * U(c, sw) / X(c, sw) — sw はコントローラーの STRK スライダー値
 * 各バリエーション固有の太さ比率 × sw でスケーリング
 *
 * viewBox 48x48、中心(24,24)、半径16 の円弧ベース
 */
import { useVariant, useDesignParams } from '../context/VariantContext'

/** ランドルト環パス生成 */
function landoltPath(gap) {
  const r = 16, cx = 24, cy = 24
  const toRad = (deg) => (deg * Math.PI) / 180
  const a1 = toRad(-90 + gap / 2)
  const a2 = toRad(-90 - gap / 2)
  const sx = (cx + r * Math.cos(a1)).toFixed(1)
  const sy = (cy + r * Math.sin(a1)).toFixed(1)
  const ex = (cx + r * Math.cos(a2)).toFixed(1)
  const ey = (cy + r * Math.sin(a2)).toFixed(1)
  return `M${sx},${sy} A16,16 0 1,1 ${ex},${ey}`
}

/** クロスヘア生成。swRatio でスライダー値を反映 */
function crosshair(c, sw, gapR = 5, dotR = 3) {
  const inner = 24 - gapR
  const outer = 24 + gapR
  return (<>
    <line x1="8"    y1="24" x2={inner} y2="24" stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <line x1={outer} y1="24" x2="40"   y2="24" stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <line x1="24" y1="8"    x2="24" y2={inner} stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <line x1="24" y1={outer} x2="24" y2="40"   stroke={c} strokeWidth={sw} strokeLinecap="butt" />
    <circle cx="24" cy="24" r={dotR} fill={c} />
  </>)
}

/**
 * 各バリエーション定義
 * U(c, sw) / X(c, sw) — sw = コントローラーの STRK 値 (1-14)
 * バリエーション固有の太さ比率をベースに sw を直接使用
 * gap angle はバリエーション固有 (切り替えで変化するパラメータ)
 */
const variants = [
  // 0: Landolt — ベースライン, gap=90°
  {
    name: 'Landolt',
    gap: 90,
    U: (c, sw) => (
      <path d={landoltPath(90)} stroke={c} strokeWidth={sw} strokeLinecap="butt" fill="none" />
    ),
    X: (c, sw) => crosshair(c, sw * 0.75, 5, sw * 0.35),
  },
  // 1: Hairline — gap=90°, 細め比率
  {
    name: 'Hairline',
    gap: 90,
    U: (c, sw) => (
      <path d={landoltPath(90)} stroke={c} strokeWidth={sw * 0.3} strokeLinecap="butt" fill="none" />
    ),
    X: (c, sw) => crosshair(c, sw * 0.25, 5, sw * 0.15),
  },
  // 2: Bold — gap=90°, 太め比率
  {
    name: 'Bold',
    gap: 90,
    U: (c, sw) => (
      <path d={landoltPath(90)} stroke={c} strokeWidth={sw * 1.3} strokeLinecap="butt" fill="none" />
    ),
    X: (c, sw) => crosshair(c, sw * 1.1, 5, sw * 0.45),
  },
  // 3: Ultra — gap=90°, 極太
  {
    name: 'Ultra',
    gap: 90,
    U: (c, sw) => (
      <path d={landoltPath(90)} stroke={c} strokeWidth={sw * 1.6} strokeLinecap="butt" fill="none" />
    ),
    X: (c, sw) => crosshair(c, sw * 1.4, 5, sw * 0.55),
  },
  // 4: Narrow — gap=35°
  {
    name: 'Narrow',
    gap: 35,
    U: (c, sw) => (
      <path d={landoltPath(35)} stroke={c} strokeWidth={sw} strokeLinecap="butt" fill="none" />
    ),
    X: (c, sw) => crosshair(c, sw * 0.75, 3, sw * 0.25),
  },
  // 5: Wide — gap=140°
  {
    name: 'Wide',
    gap: 140,
    U: (c, sw) => (
      <path d={landoltPath(140)} stroke={c} strokeWidth={sw} strokeLinecap="butt" fill="none" />
    ),
    X: (c, sw) => crosshair(c, sw * 0.75, 7, sw * 0.35),
  },
  // 6: Light Wide — gap=130°, 細め
  {
    name: 'Light Wide',
    gap: 130,
    U: (c, sw) => (
      <path d={landoltPath(130)} stroke={c} strokeWidth={sw * 0.5} strokeLinecap="butt" fill="none" />
    ),
    X: (c, sw) => crosshair(c, sw * 0.4, 6, sw * 0.2),
  },
  // 7: Bold Narrow — gap=45°, 太め
  {
    name: 'Bold Narrow',
    gap: 45,
    U: (c, sw) => (
      <path d={landoltPath(45)} stroke={c} strokeWidth={sw * 1.3} strokeLinecap="butt" fill="none" />
    ),
    X: (c, sw) => crosshair(c, sw * 1.1, 3, sw * 0.45),
  },
  // 8: Medium — gap=65°
  {
    name: 'Medium',
    gap: 65,
    U: (c, sw) => (
      <path d={landoltPath(65)} stroke={c} strokeWidth={sw * 0.7} strokeLinecap="butt" fill="none" />
    ),
    X: (c, sw) => crosshair(c, sw * 0.6, 4, sw * 0.28),
  },
  // 9: Extreme — gap=160°, 極太
  {
    name: 'Extreme',
    gap: 160,
    U: (c, sw) => (
      <path d={landoltPath(160)} stroke={c} strokeWidth={sw * 1.6} strokeLinecap="butt" fill="none" />
    ),
    X: (c, sw) => crosshair(c, sw * 1.4, 8, sw * 0.55),
  },
]

export default variants

/** VariantU — コントローラーの strokeW を反映 */
export function VariantU({ color = '#1a1a1a', ...props }) {
  const v = useVariant()
  const { strokeW } = useDesignParams()
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {variants[v].U(color, strokeW)}
    </svg>
  )
}

/** VariantX — コントローラーの strokeW を反映 */
export function VariantX({ color = '#1a1a1a', ...props }) {
  const v = useVariant()
  const { strokeW } = useDesignParams()
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {variants[v].X(color, strokeW)}
    </svg>
  )
}
