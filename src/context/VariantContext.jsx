/**
 * VariantContext — シンボルバリエーション + デザインパラメータ管理
 *
 * 2D: tileSize, tileGap, strokeW, opacity
 * 3D: rotX, rotY, perspective
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useHaptics } from '../hooks/useHaptics'

const VariantContext = createContext(null)

export const VARIANT_COUNT = 30

const DEFAULT_PARAMS = {
  variant: 0,
  tileSize: 384,
  tileGap: -188,
  strokeW: 10,
  opacity: 0.06,
  rotX: 0,       // X軸回転 (-60 ~ 60)
  rotY: 0,       // Y軸回転 (-60 ~ 60)
  perspective: 0, // 遠近感 (0=なし, 200~2000)
}

export function VariantProvider({ children }) {
  const [state, setState] = useState(DEFAULT_PARAMS)
  const haptics = useHaptics()

  const nextVariant = useCallback(() => {
    setState((s) => ({ ...s, variant: (s.variant + 1) % VARIANT_COUNT }))
    haptics.nudge()
  }, [haptics])

  const prevVariant = useCallback(() => {
    setState((s) => ({ ...s, variant: (s.variant - 1 + VARIANT_COUNT) % VARIANT_COUNT }))
    haptics.nudge()
  }, [haptics])

  const setParam = useCallback((key, value) => {
    setState((s) => {
      const next = { ...s, [key]: value }
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
    <VariantContext.Provider value={{ ...state, setParam, nextVariant, prevVariant }}>
      {children}
    </VariantContext.Provider>
  )
}

export function useVariant() {
  return useContext(VariantContext).variant
}

export function useDesignParams() {
  return useContext(VariantContext)
}
