/**
 * useHaptics — 振動フィードバック
 *
 * web-haptics ライブラリ + navigator.vibrate フォールバック
 * スライダー操作中の連続発火にも対応（tick はスロットル付き）
 */
import { useRef, useEffect, useCallback } from 'react'

let hapticsInstance = null

async function getHaptics() {
  if (hapticsInstance) return hapticsInstance
  try {
    const { WebHaptics } = await import('web-haptics')
    hapticsInstance = new WebHaptics()
    return hapticsInstance
  } catch {
    return null
  }
}

/** navigator.vibrate を直接叩くフォールバック */
function vibrateRaw(ms) {
  try {
    navigator?.vibrate?.(ms)
  } catch { /* noop */ }
}

export function useHaptics() {
  const ready = useRef(false)
  const lastTick = useRef(0)

  useEffect(() => {
    getHaptics().then((h) => { if (h) ready.current = true })
  }, [])

  const trigger = useCallback((preset) => {
    if (ready.current && hapticsInstance) {
      hapticsInstance.trigger(preset)
    }
    // フォールバック: web-haptics が効かない場合も navigator.vibrate で試す
    if (typeof preset === 'number') vibrateRaw(preset)
  }, [])

  /**
   * tick — スライダー用スロットル付き振動
   * 最小間隔 40ms で発火（25fps 相当）。連打しても詰まらない。
   */
  const tick = useCallback(() => {
    const now = performance.now()
    if (now - lastTick.current < 40) return  // 40ms 以内はスキップ
    lastTick.current = now
    vibrateRaw(8)  // 8ms の極短バイブ
    if (ready.current && hapticsInstance) {
      hapticsInstance.trigger(8)
    }
  }, [])

  return {
    nudge:   () => trigger('nudge'),
    success: () => trigger('success'),
    error:   () => trigger('error'),
    buzz:    () => trigger('buzz'),
    tap:     () => { trigger(15); vibrateRaw(15) },
    pulse:   () => trigger([20, 40, 20]),
    tick,    // スライダー用
  }
}
