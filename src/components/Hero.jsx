/**
 * Hero.jsx — ファーストビュー
 *
 * ロゴ: U U U U X (5タイル)
 *   - 全Uは初期状態で「上に欠け部分」= 回転0°
 *   - カーソルが通過すると個別に回転 (gsap)
 *   - タッチでも反応
 *
 * GSAPアニメーション:
 *   1. ロゴ: stagger フェードイン
 *   2. テキスト: 下からスライド
 *   3. スクロールインジケーター: 脈動
 */
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { VariantU, VariantX } from './SymbolVariants'

export default function Hero() {
  const logoRef = useRef(null)
  const textRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── ロゴ stagger フェードイン ──
      gsap.from(logoRef.current.children, {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        delay: 0.3,
      })

      // ── テキスト スライドイン ──
      gsap.from(textRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 1,
      })

      // ── スクロール脈動 ──
      gsap.to(scrollRef.current, {
        opacity: 0.3,
        y: 5,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    })
    return () => ctx.revert()
  }, [])

  // ── カーソル hover でロゴタイル回転 ──
  const handleTileHover = (e) => {
    gsap.to(e.currentTarget, {
      rotation: '+=90',   // 現在角度 + 90°
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  return (
    <section className="hero">
      {/* ロゴ: U U U U X = uuuux
          全U は回転0° = 欠けが上向き
          hover で各タイルが90°ずつ回転 */}
      <div className="hero-logo" ref={logoRef}>
        <div className="hero-tile" onMouseEnter={handleTileHover} onTouchStart={handleTileHover}>
          <VariantU />
        </div>
        <div className="hero-tile" onMouseEnter={handleTileHover} onTouchStart={handleTileHover}>
          <VariantU />
        </div>
        <div className="hero-tile" onMouseEnter={handleTileHover} onTouchStart={handleTileHover}>
          <VariantU />
        </div>
        <div className="hero-tile" onMouseEnter={handleTileHover} onTouchStart={handleTileHover}>
          <VariantU />
        </div>
        <div className="hero-tile" onMouseEnter={handleTileHover} onTouchStart={handleTileHover}>
          <VariantX />
        </div>
      </div>

      <div ref={textRef}>
        <h1>uuuux.design</h1>
        <p className="subtitle poem">
          4 dimensions of You — for You.<br />
          あなたという存在を、4つの次元で分解する。<br />
          <br />
          Universal — すべての人に届く形を。<br />
          Unified — 断片を繋ぎ、ひとつの体験へ。<br />
          Unique — あなただけの輪郭を見つける。<br />
          Unknown — まだ名前のない可能性を拓く。<br />
          <br />
          U は、You。<br />
          4つの U が交差する場所に、X が生まれる。<br />
          それは体験であり、未知であり、変容の記号。<br />
          <br />
          私たちは、あなたのためにデザインする。<br />
          あらゆる次元から、あなたを再定義するために。
        </p>
      </div>

      <div className="scroll-indicator" ref={scrollRef}>
        <span>scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}
