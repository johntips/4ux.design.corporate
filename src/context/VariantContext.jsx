/**
 * VariantContext — シンボルバリエーション + デザインパラメータ管理
 *
 * state:
 *   variant    — 0-9 のパターン番号
 *   tileSize   — タイルサイズ px (16-400)
 *   tileGap    — タイル間隔 px (-20 to 80) ※マイナス=重なる
 *   strokeW    — stroke 太さ (1-14)
 *   opacity    — タイル不透明度 (0.02-0.4)
 *
 * 操作:
 *   Shift+F  → variant 切り替え
 *   SP: ダブルタップ → variant 切り替え
 *   左下コントローラーで全パラメータ調整可
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useHaptics } from '../hooks/useHaptics'

const VariantContext = createContext(null)

export const VARIANT_COUNT = 10

const DEFAULT_PARAMS = {
  variant: 0,
  tileSize: 384,
  tileGap: -188,
  strokeW: 10,
  opacity: 0.06,
}

export function VariantProvider({ children }) {
  const [state, setState] = useState(DEFAULT_PARAMS)
  const haptics = useHaptics()

  const nextVariant = useCallback(() => {
    setState((s) => ({ ...s, variant: (s.variant + 1) % VARIANT_COUNT }))
    haptics.nudge()
  }, [haptics])

  const setParam = useCallback((key, value) => {
    setState((s) => {
      const next = { ...s, [key]: value }
      // SIZE 変更時、GAP が新しい範囲外ならクランプ
      if (key === 'tileSize') {
        const minGap = -(value - 4)
        if (next.tileGap < minGap) next.tileGap = minGap
      }
      return next
    })
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.shiftKey && e.key === 'F') nextVariant()
    }

    let lastTap = 0
    const onTouch = () => {
      const now = Date.now()
      if (now - lastTap < 300) nextVariant()
      lastTap = now
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('touchend', onTouch)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchend', onTouch)
    }
  }, [nextVariant])

  return (
    <VariantContext.Provider value={{ ...state, setParam, nextVariant }}>
      {children}
    </VariantContext.Provider>
  )
}

export function useVariant() {
  const ctx = useContext(VariantContext)
  return ctx.variant
}

export function useDesignParams() {
  return useContext(VariantContext)
}
