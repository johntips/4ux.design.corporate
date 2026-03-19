import { useRef, useEffect, useCallback } from 'react'

/**
 * useSmoothMouse — 滑らかなマウス/タッチ座標追跡
 *
 * 生の座標を lerp (線形補間) で滑らかにする
 * rAF ループで毎フレーム補間 → カクつかない
 *
 * 返り値: { current } ref — { x, y } を直接参照 (re-render なし)
 */
export function useSmoothMouse(smoothing = 0.15) {
  const raw = useRef({ x: -1000, y: -1000 })      // 生の入力座標
  const smooth = useRef({ x: -1000, y: -1000 })    // 補間済み座標
  const raf = useRef(null)

  // lerp: a から b に t の割合で近づく
  const lerp = (a, b, t) => a + (b - a) * t

  const loop = useCallback(() => {
    smooth.current.x = lerp(smooth.current.x, raw.current.x, smoothing)
    smooth.current.y = lerp(smooth.current.y, raw.current.y, smoothing)
    raf.current = requestAnimationFrame(loop)
  }, [smoothing])

  useEffect(() => {
    const onMouse = (e) => { raw.current = { x: e.clientX, y: e.clientY } }
    const onTouch = (e) => {
      const t = e.touches[0]
      if (t) raw.current = { x: t.clientX, y: t.clientY }
    }
    const onTouchEnd = () => { raw.current = { x: -1000, y: -1000 } }

    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    raf.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', onTouchEnd)
      cancelAnimationFrame(raf.current)
    }
  }, [loop])

  return smooth // .current.x / .current.y で直接読む
}
