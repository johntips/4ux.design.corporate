/**
 * MouseStalker.jsx — 二重円マウスストーカー
 *
 * 参考: yuto-takahashi.com
 * - 小円 (8px): マウス位置に即追従
 * - 大円 (40px): lerp で遅延追従 (慣性感)
 * - mix-blend-mode: difference で背景と反転合成
 * - SP では非表示
 */
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export default function MouseStalker() {
  const smallRef = useRef(null)
  const largeRef = useRef(null)

  useEffect(() => {
    const small = smallRef.current
    const large = largeRef.current
    if (!small || !large) return

    // gsap.quickTo: 高頻度更新用の軽量API
    const xSmall = gsap.quickTo(small, 'x', { duration: 0.1, ease: 'power2.out' })
    const ySmall = gsap.quickTo(small, 'y', { duration: 0.1, ease: 'power2.out' })
    const xLarge = gsap.quickTo(large, 'x', { duration: 0.5, ease: 'power3.out' })
    const yLarge = gsap.quickTo(large, 'y', { duration: 0.5, ease: 'power3.out' })

    const onMove = (e) => {
      xSmall(e.clientX)
      ySmall(e.clientY)
      xLarge(e.clientX)
      yLarge(e.clientY)
    }

    // ホバー対象にクラスを付与
    const onEnterLink = () => large.classList.add('is-hovering')
    const onLeaveLink = () => large.classList.remove('is-hovering')

    window.addEventListener('mousemove', onMove)

    // a, button 要素にホバーリスナー
    const interactives = document.querySelectorAll('a, button, .hero-tile, .ctrl-toggle, .ctrl-nav-btn')
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', onEnterLink)
      el.addEventListener('mouseleave', onLeaveLink)
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onEnterLink)
        el.removeEventListener('mouseleave', onLeaveLink)
      })
    }
  }, [])

  return (
    <>
      <div ref={smallRef} className="stalker stalker-small" />
      <div ref={largeRef} className="stalker stalker-large" />
    </>
  )
}
