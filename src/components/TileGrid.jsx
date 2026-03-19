/**
 * TileGrid.jsx — 高パフォーマンスなマウス追従タイル背景
 *
 * パフォーマンス最適化:
 * 1. グリッド座標で粗く絞り込み → マウス周辺のタイルだけ処理
 *    (全タイルの getBoundingClientRect を毎フレーム呼ばない)
 * 2. 「前フレームで影響圏内だったか」を記録し、
 *    圏外→圏外のタイルは完全スキップ（リセット済み）
 * 3. gsap.to() の呼び出し回数を最小限に抑制
 * 4. タイル上限キャップでDOM爆発を防止
 */
import { useRef, useMemo, useEffect } from 'react'
import gsap from 'gsap'
import { useSmoothMouse } from '../hooks/useMouse'
import { VariantU, VariantX } from './SymbolVariants'
import { useDesignParams } from '../context/VariantContext'

const RADIUS = 180
const MAX_TILES = 2000 // DOM爆発防止の上限

export default function TileGrid() {
  const tilesRef = useRef([])
  const mouse = useSmoothMouse(0.12)
  const rafRef = useRef(null)
  const activeSet = useRef(new Set()) // 前フレームで影響圏内だったタイルindex
  const { tileSize, tileGap, opacity: baseOpacity } = useDesignParams()

  const cellSize = Math.max(tileSize + tileGap, 4)

  // ── グリッド計算 ──
  const { cols, rows, tiles } = useMemo(() => {
    const c = Math.min(Math.ceil(window.innerWidth / cellSize) + 2, 80)
    const r = Math.min(Math.ceil(window.innerHeight / cellSize) + 2, 60)
    // タイル数をキャップ
    const total = Math.min(c * r, MAX_TILES)
    const actualRows = Math.min(r, Math.ceil(total / c))
    const arr = []
    for (let row = 0; row < actualRows; row++) {
      for (let col = 0; col < c; col++) {
        if (arr.length >= MAX_TILES) break
        const idx = (col + row) % 4
        arr.push({
          isX: idx === 3,
          baseRot: idx === 3 ? 0 : idx * 90,
          col,
          row,
        })
      }
    }
    return { cols: c, rows: actualRows, tiles: arr }
  }, [cellSize])

  // ── rAF ループ: グリッド座標で粗く絞ってから処理 ──
  useEffect(() => {
    // グリッドの左上のオフセットを計算
    const getGridOffset = () => {
      const gridW = cols * cellSize
      const gridH = rows * cellSize
      return {
        ox: (window.innerWidth - gridW) / 2,
        oy: (window.innerHeight - gridH) / 2,
      }
    }

    const animate = () => {
      const mx = mouse.current.x
      const my = mouse.current.y
      const { ox, oy } = getGridOffset()

      // マウスのグリッド座標を算出
      const mCol = (mx - ox) / cellSize
      const mRow = (my - oy) / cellSize
      // 影響圏をグリッド単位に変換（余裕を持たせる）
      const rCells = Math.ceil(RADIUS / cellSize) + 1

      // 今フレームで影響圏内のインデックスを収集
      const nowActive = new Set()

      // マウス周辺のセルだけループ
      const colMin = Math.max(0, Math.floor(mCol - rCells))
      const colMax = Math.min(cols - 1, Math.ceil(mCol + rCells))
      const rowMin = Math.max(0, Math.floor(mRow - rCells))
      const rowMax = Math.min(rows - 1, Math.ceil(mRow + rCells))

      for (let row = rowMin; row <= rowMax; row++) {
        for (let col = colMin; col <= colMax; col++) {
          const i = row * cols + col
          const el = tilesRef.current[i]
          if (!el) continue
          const svg = el.firstChild
          if (!svg) continue

          // タイル中心のビューポート座標 (getBoundingRect 不要)
          const cx = ox + col * cellSize + cellSize / 2
          const cy = oy + row * cellSize + cellSize / 2
          const dist = Math.hypot(mx - cx, my - cy)

          if (dist < RADIUS) {
            nowActive.add(i)
            const t = 1 - dist / RADIUS
            const deg = Math.atan2(my - cy, mx - cx) * (180 / Math.PI)
            const tile = tiles[i]
            if (!tile) continue

            gsap.to(svg, {
              rotation: tile.baseRot + deg * t * 0.8,
              opacity: baseOpacity + t * 0.3,
              duration: 0.4,
              ease: 'power2.out',
              overwrite: 'auto',
            })
          }
        }
      }

      // 前フレームで active だったが今は圏外 → リセット
      for (const i of activeSet.current) {
        if (!nowActive.has(i)) {
          const el = tilesRef.current[i]
          if (!el) continue
          const svg = el.firstChild
          if (!svg) continue
          const tile = tiles[i]
          if (!tile) continue

          gsap.to(svg, {
            rotation: tile.baseRot,
            opacity: baseOpacity,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        }
      }

      activeSet.current = nowActive
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tiles, cols, rows, cellSize, baseOpacity, mouse])

  return (
    <div
      className="tile-grid"
      style={{
        '--cols': cols,
        '--rows': rows,
        '--tile-size': `${cellSize}px`,
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
