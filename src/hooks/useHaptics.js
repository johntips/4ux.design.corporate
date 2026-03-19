/**
 * useHaptics — web-haptics ラッパーフック
 *
 * SP のタッチイベントやバリエーション切替時に振動フィードバック
 * デスクトップでは何も起きない（Vibration API がないため）
 *
 * 使い方:
 *   const haptics = useHaptics()
 *   haptics.nudge()    // 軽くぷるっ
 *   haptics.success()  // 成功の振動
 *   haptics.tap()      // 短いタップ
 */
import { useRef, useEffect, useCallback } from 'react'

let hapticsInstance = null
let hapticsReady = false

// 動的 import で web-haptics を読み込み（SSR セーフ）
async function getHaptics() {
  if (hapticsInstance) return hapticsInstance
  try {
    const { WebHaptics } = await import('web-haptics')
    hapticsInstance = new WebHaptics()
    hapticsReady = true
    return hapticsInstance
  } catch {
    return null
  }
}

export function useHaptics() {
  const ready = useRef(false)

  useEffect(() => {
    getHaptics().then((h) => {
      if (h) ready.current = true
    })
  }, [])

  const trigger = useCallback((preset) => {
    if (ready.current && hapticsInstance) {
      hapticsInstance.trigger(preset)
    }
  }, [])

  return {
    nudge: () => trigger('nudge'),
    success: () => trigger('success'),
    error: () => trigger('error'),
    buzz: () => trigger('buzz'),
    tap: () => trigger(30),             // 30ms の短い振動
    pulse: () => trigger([20, 40, 20]), // ぷるぷるっ
  }
}
