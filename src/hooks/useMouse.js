import { useState, useEffect } from 'react'

/**
 * useMouse — マウス座標をリアルタイムで追跡するカスタムフック
 *
 * 返り値: { x, y } — clientX/clientY ベースのビューポート座標
 * 初期値は画面外(-1000)にしておき、タイルが初期状態で反応しないようにする
 */
export function useMouse() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 })

  useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, []) // deps空 = マウント時に1回だけリスナー登録

  return pos
}
