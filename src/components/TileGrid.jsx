/**
 * TileGrid.jsx — マウス追従するタイルパターン背景
 *
 * 仕組み:
 * 1. 画面サイズから必要なタイル数を計算
 * 2. U と X を「U U U X」のパターンで並べる
 * 3. マウス座標の変化で、近くのタイルだけ gsap.to() で回転
 *
 * パフォーマンス:
 * - gsap.to() の overwrite:'auto' で重複アニメーションを自動管理
 * - rAF は使わず、mouseイベント時に直接 gsap を叩く（GSAPが内部でrAF管理）
 */
import { useRef, useMemo, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { useMouse } from '../hooks/useMouse'

const SIZE = 72        // タイル1辺のpx
const RADIUS = 180     // マウス影響範囲(px)

export default function TileGrid() {
  const tilesRef = useRef([])  // DOM要素の配列
  const mouse = useMouse()

  // ── グリッド定義（リサイズ時は再マウントで対応） ──
  const { cols, rows, tiles } = useMemo(() => {
    const c = Math.ceil(window.innerWidth / SIZE) + 2
    const r = Math.ceil(window.innerHeight / SIZE) + 2
    const arr = []

    for (let row = 0; row < r; row++) {
      for (let col = 0; col < c; col++) {
        // パターン: U(0°) U(90°) U(180°) X を繰り返し、行ごとにオフセット
        const idx = (col + row) % 4
        arr.push({
          isX: idx === 3,
          baseRot: idx === 3 ? 0 : idx * 90,
        })
      }
    }
    return { cols: c, rows: r, tiles: arr }
  }, [])

  // ── マウス追従アニメーション ──
  // mouse が変わるたびに全タイルの距離を計算し、近いものだけ回転
  const animateTiles = useCallback(() => {
    tilesRef.current.forEach((el, i) => {
      if (!el) return
      const svg = el.firstChild  // 内部の <svg>

      // タイル中心とマウスの距離を算出
      const rect = el.getBoundingClientRect()
      const cx = rect.left + SIZE / 2
      const cy = rect.top + SIZE / 2
      const dist = Math.hypot(mouse.x - cx, mouse.y - cy)

      if (dist < RADIUS) {
        // 影響圏内: 距離に応じて回転・不透明度を変化
        const t = 1 - dist / RADIUS                             // 0→1 (遠→近)
        const angle = Math.atan2(mouse.y - cy, mouse.x - cx)   // マウス方向(rad)
        const deg = angle * (180 / Math.PI)

        gsap.to(svg, {
          rotation: tiles[i].baseRot + deg * t * 0.8, // ベース回転 + マウス方向の影響
          opacity: 0.06 + t * 0.3,                    // 近いほど濃く
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',  // 前のアニメを自動キャンセル
        })
      } else {
        // 影響圏外: ベース状態へ戻す
        gsap.to(svg, {
          rotation: tiles[i].baseRot,
          opacity: 0.06,
          duration: 1,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }
    })
  }, [mouse.x, mouse.y, tiles])

  // mouse が動くたびに発火
  useEffect(animateTiles, [animateTiles])

  return (
    <div
      className="tile-grid"
      style={{ '--cols': cols, '--rows': rows }}
    >
      {tiles.map((tile, i) => (
        <div
          key={i}
          className="tile"
          ref={(el) => { tilesRef.current[i] = el }}
        >
          {tile.isX ? <XTile /> : <UTile />}
        </div>
      ))}
    </div>
  )
}

// ── インライン SVG コンポーネント (軽量版) ──

/** U — 半円アーチ */
function UTile() {
  return (
    <svg viewBox="0 0 48 48" fill="none">
      <path
        d="M8 8 C8 8 8 40 24 40 C40 40 40 8 40 8"
        stroke="#1a1a1a"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** X — クロス (回転で + にもなる) */
function XTile() {
  return (
    <svg viewBox="0 0 48 48" fill="none">
      <line x1="10" y1="10" x2="38" y2="38" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
      <line x1="38" y1="10" x2="10" y2="38" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
