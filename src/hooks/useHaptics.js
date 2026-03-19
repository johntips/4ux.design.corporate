/**
 * useHaptics — 振動フィードバック
 *
 * slide(ratio) — スライダー用。値に応じた強さで振動
 * grab() — スライダーを握った瞬間の振動
 *
 * 戦略: touchstart で vibrate を起動し「ユーザージェスチャ」コンテキストを確保。
 * スライド中は setInterval で振動パターンを繰り返し更新。
 * ratio が変わるとインターバル内の振動時間が変わる。
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

function vibrateRaw(pattern) {
  try { navigator?.vibrate?.(pattern) } catch { /* noop */ }
}

export function useHaptics() {
  const ready = useRef(false)
  const slideRatio = useRef(0)    // 現在のスライド値 (0→1)
  const slideActive = useRef(false)
  const intervalRef = useRef(null)

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
   * slide(ratio) — スライド中の値を更新
   * 実際の振動は slideLoop 内で ratio に基づいて発生
   */
  const slide = useCallback((ratio) => {
    slideRatio.current = Math.max(0, Math.min(1, ratio))
  }, [])

  /**
   * grab() — スライダーに触れた瞬間
   * ここで vibrate を最初に呼ぶことでユーザージェスチャコンテキストを確立
   * + インターバルで振動を継続
   */
  const grab = useCallback(() => {
    // 初回の vibrate でコンテキスト確立
    vibrateRaw(15)
    if (ready.current && hapticsInstance) {
      hapticsInstance.trigger('nudge')
    }

    slideActive.current = true

    // 既存のインターバルをクリア
    if (intervalRef.current) clearInterval(intervalRef.current)

    // 60ms ごとに ratio に応じた振動を繰り返す
    intervalRef.current = setInterval(() => {
      if (!slideActive.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        return
      }
      const r = slideRatio.current
      const ms = Math.round(5 + r * 50) // 5ms → 55ms
      vibrateRaw([ms, 60 - ms])  // vibrate パターン: ON, OFF
    }, 70)
  }, [])

  /**
   * release() — スライダーから指を離した
   */
  const release = useCallback(() => {
    slideActive.current = false
    vibrateRaw(0) // 振動停止
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  return {
    nudge:   () => trigger('nudge'),
    success: () => trigger('success'),
    error:   () => trigger('error'),
    buzz:    () => trigger('buzz'),
    tap:     () => { trigger(15); vibrateRaw(15) },
    pulse:   () => trigger([20, 40, 20]),
    slide,
    grab,
    release,
  }
}
