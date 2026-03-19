/**
 * Hero.jsx — ファーストビュー
 *
 * GSAPアニメーション:
 *   1. ロゴタイル4つが stagger で回転しながらフェードイン
 *   2. テキストが下からスライドイン
 *   3. スクロールインジケーターがゆっくり点滅
 *
 * gsap.context() でスコープを作り、return で revert → クリーンアップ完了
 */
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { UShape, XShape } from './Symbols'

export default function Hero() {
  const logoRef = useRef(null)
  const textRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── ロゴ: 4タイルが順番に回転しながら出現 ──
      gsap.from(logoRef.current.children, {
        scale: 0,            // 0 → 1 にスケールアップ
        rotation: -180,      // 半回転しながら登場
        opacity: 0,
        duration: 1,
        stagger: 0.15,       // 150ms ずつずらして順番に
        ease: 'back.out(1.7)', // 少しバウンドするイージング
        delay: 0.3,
      })

      // ── テキスト: 下から浮かび上がる ──
      gsap.from(textRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',  // 最初速く、後半ゆっくり減速
        delay: 1,
      })

      // ── スクロールインジケーター: 永続的に脈動 ──
      gsap.to(scrollRef.current, {
        opacity: 0.3,
        y: 5,
        duration: 1.5,
        repeat: -1,           // 無限リピート
        yoyo: true,           // 行って戻る
        ease: 'sine.inOut',
      })
    })

    return () => ctx.revert()  // アンマウント時にすべてのアニメーションを破棄
  }, [])

  return (
    <section className="hero">
      {/* ロゴ: U U U X の4タイル配置 */}
      <div className="hero-logo" ref={logoRef}>
        <UShape />
        <UShape style={{ transform: 'rotate(90deg)' }} />
        <UShape style={{ transform: 'rotate(180deg)' }} />
        <XShape />
      </div>

      <div ref={textRef}>
        <h1>uuuux.design</h1>
        <p className="subtitle">
          Universal eXperience Design Studio.
          <br />
          4つの U が、あらゆる体験を再定義する。
        </p>
      </div>

      <div className="scroll-indicator" ref={scrollRef}>
        <span>scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}
