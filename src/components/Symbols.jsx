/**
 * Symbols.jsx — uuuux.design のコアシンボル定義
 *
 * 2種類のSVGシンボルを提供:
 *   UShape: 半円アーチ型 (U の文字を図形化)
 *   XShape: クロス型 (回転で X にも + にも見える)
 *
 * viewBox 48x48 で統一。stroke ベースのミニマルな線画。
 */

/**
 * UShape — 半円/アーチ
 *
 * SVGパス: 上端(8,8)から下端(40,8)へ向かうU字カーブ
 * ・ベジェではなく、Cコマンドで滑らかな半円を描画
 * ・strokeLinecap: round で端を丸くし、幾何学的な柔らかさを出す
 * ・回転して使うことで 0°/90°/180°/270° の4方向バリエーションになる
 */
export function UShape({ color = '#1a1a1a', ...props }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8 8 C8 8 8 40 24 40 C40 40 40 8 40 8"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/**
 * XShape — クロス/プラス
 *
 * 2本の対角線が中心(24,24)で交差する形状
 * ・回転 0° → X (バツ)
 * ・回転 45° → + (プラス)
 * ・この回転の曖昧さが uuuux.design のアイデンティティ
 */
export function XShape({ color = '#1a1a1a', ...props }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <line x1="10" y1="10" x2="38" y2="38" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="38" y1="10" x2="10" y2="38" stroke={color} strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}
