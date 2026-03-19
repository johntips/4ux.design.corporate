/**
 * Symbols.jsx — uuuux.design コアシンボル
 *
 * viewBox 48x48 統一。stroke ベース。
 *
 * UShape: ドーナツ型の太い線で描くU字。半円 + 両脚の直線
 * XShape: U と同じ太さの十字 (+)。回転で × にも見える
 *
 * 共通:
 *   - strokeWidth: 10 → 太く機械的
 *   - strokeLinecap: butt → 端を直角カット
 *   - 中心: (24, 24)
 */

const SW = 10  // U と + で統一する stroke 幅

/**
 * UShape — U字型
 *
 * パス解説:
 *   M8,10         左上の脚の先端
 *   V24           下へ直線 (左脚)
 *   A16,16 0 0,1  半径16の真円弧を時計回り (=下向きのカーブ)
 *   40,24         右下の脚の付け根へ
 *   V10           上へ直線 (右脚)
 *
 * 形状イメージ:
 *   |         |    ← 脚 (y=10 → y=24)
 *   |         |
 *    ╲_______╱     ← 真円弧 (r=16)
 *
 * 回転: 0°=U, 90°=⊃, 180°=∩, 270°=⊂
 */
export function UShape({ color = '#1a1a1a', ...props }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8,10 V24 A16,16 0 0,1 40,24 V10"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="butt"
        fill="none"
      />
    </svg>
  )
}

/**
 * XShape — 十字 (+)
 *
 * 水平線 (8,24)→(40,24) と 垂直線 (24,8)→(24,40)
 * U と同じ strokeWidth=10 で太さ揃え
 *
 * 回転: 0°=+, 45°=×
 */
export function XShape({ color = '#1a1a1a', ...props }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <line x1="8" y1="24" x2="40" y2="24" stroke={color} strokeWidth={SW} strokeLinecap="butt" />
      <line x1="24" y1="8" x2="24" y2="40" stroke={color} strokeWidth={SW} strokeLinecap="butt" />
    </svg>
  )
}
