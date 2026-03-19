/**
 * useHaptics — 振動フィードバック
 *
 * slide(ratio) — スライダー用。0→1 で振動が 5ms→80ms に比例
 *   握った瞬間に nudge、スライド中は値に応じた buzz 強度
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

function vibrateRaw(ms) {
  try { navigator?.vibrate?.(ms) } catch { /* noop */ }
}

export function useHaptics() {
  const ready = useRef(false)
  const lastSlide = useRef(0)

  useEffect(() => {
    getHaptics().then((h) => { if (h) ready.current = true })
  }, [])

  const trigger = useCallback((preset) => {
    if (ready.current && hapticsInstance) {
      hapticsInstance.trigger(preset)
    }
    if (typeof preset === 'number') vibrateRaw(preset)
  }, [])

  /**
   * slide(ratio) — スライダースワイプ用
   *
   * @param {number} ratio - 0→1 正規化された値 (min→max)
   *
   * 振動の長さ: 5ms + ratio * 75ms = 5ms〜80ms
   * スロットル: 50ms 間隔 (値が高いほど振動が長い = buzz 感が増す)
   */
  const slide = useCallback((ratio) => {
    const now = performance.now()
    if (now - lastSlide.current < 50) return
    lastSlide.current = now

    const clamped = Math.max(0, Math.min(1, ratio))
    const duration = Math.round(5 + clamped * 75) // 5ms → 80ms

    vibrateRaw(duration)
    if (ready.current && hapticsInstance) {
      hapticsInstance.trigger(duration)
    }
  }, [])

  /**
   * grab — スライダーを握った瞬間
   */
  const grab = useCallback(() => {
    trigger('nudge')
    vibrateRaw(20)
  }, [trigger])

  return {
    nudge:   () => trigger('nudge'),
    success: () => trigger('success'),
    error:   () => trigger('error'),
    buzz:    () => trigger('buzz'),
    tap:     () => { trigger(15); vibrateRaw(15) },
    pulse:   () => trigger([20, 40, 20]),
    slide,   // スライダースワイプ用 (ratio: 0→1)
    grab,    // スライダー握り始め
  }
}
