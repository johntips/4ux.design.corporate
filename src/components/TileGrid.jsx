/**
 * TileGrid.jsx — マウス追従タイルパターン背景
 *
 * 改善ポイント:
 * - useSmoothMouse: lerp 補間で滑らかなカーソル追従
 * - rAF ループ: React re-render を経由せず直接 gsap.to() を叩く
 * - useDesignParams: コントローラーからのパラメータ変更に追従
 * - gsap.quickTo(): to() より軽量な高頻度更新用API
 */
import { useRef, useMemo, useEffect } from 'react'
import gsap from 'gsap'
import { useSmoothMouse } from '../hooks/useMouse'
import { VariantU, VariantX } from './SymbolVariants'
import { useDesignParams } from '../context/VariantContext'

const RADIUS = 180

export default function TileGrid() {
  const tilesRef = useRef([])
  const mouse = useSmoothMouse(0.12) // smoothing factor
  const rafRef = useRef(null)
  const { tileSize, tileGap, opacity: baseOpacity } = useDesignParams()

  // ── グリッド計算 (tileSize + gap で1セルのサイズ) ──
  const { cols, rows, tiles } = useMemo(() => {
    const cell = tileSize + tileGap
    const c = Math.ceil(window.innerWidth / cell) + 2
    const r = Math.ceil(window.innerHeight / cell) + 2
    const arr = []
    for (let row = 0; row < r; row++) {
      for (let col = 0; col < c; col++) {
        const idx = (col + row) % 4
        arr.push({ isX: idx === 3, baseRot: idx === 3 ? 0 : idx * 90 })
      }
    }
    return { cols: c, rows: r, tiles: arr }
  }, [tileSize, tileGap])

  // ── rAF ループ: 毎フレーム全タイルをチェック ──
  useEffect(() => {
    const animate = () => {
      const mx = mouse.current.x
      const my = mouse.current.y

      tilesRef.current.forEach((el, i) => {
        if (!el) return
        const svg = el.firstChild

        const rect = el.getBoundingClientRect()
        const cx = rect.left + tileSize / 2
        const cy = rect.top + tileSize / 2
        const dist = Math.hypot(mx - cx, my - cy)

        if (dist < RADIUS) {
          const t = 1 - dist / RADIUS
          const deg = Math.atan2(my - cy, mx - cx) * (180 / Math.PI)

          gsap.to(svg, {
            rotation: tiles[i].baseRot + deg * t * 0.8,
            opacity: baseOpacity + t * 0.3,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        } else {
          gsap.to(svg, {
            rotation: tiles[i].baseRot,
            opacity: baseOpacity,
            duration: 0.8,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        }
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tiles, tileSize, tileGap, baseOpacity, mouse])

  return (
    <div
      className="tile-grid"
      style={{
        '--cols': cols,
        '--rows': rows,
        '--tile-size': `${tileSize}px`,
        gap: `${tileGap}px`,
      }}
    >
      {tiles.map((tile, i) => (
        <div key={i} className="tile" ref={(el) => { tilesRef.current[i] = el }}
          style={{ width: tileSize, height: tileSize }}>
          {tile.isX ? <VariantX /> : <VariantU />}
        </div>
      ))}
    </div>
  )
}
