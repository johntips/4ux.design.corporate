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
        <div className="hero-tile" onMouseEnter={handleTileHover} onTouchStart={handleTileHover}
          style={{ transform: 'rotate(45deg)' }}>
          <VariantX />
        </div>
      </div>

      <div ref={textRef}>
        <h1>uuuux.design</h1>
        <p className="subtitle poem">
          同じ極は退け合い、異なる極は引き寄せる。<br />
          あなたと世界のあいだにも、その力が流れている。<br />
          <br />
          U は You。あなたという磁場。<br />
          近づけば反発し、離れれば渇望する——<br />
          その振動の正体を、私たちは「体験」と呼ぶ。<br />
          <br />
          Universal — 排除しない引力。万人を包む磁界。<br />
          Unified — 散らばった断片が、ひとつの極に揃う瞬間。<br />
          Unique — 反発こそが輪郭になる。同調しないから、あなたになる。<br />
          Unknown — まだ磁化されていない鉄。触れるまで、極はわからない。<br />
          <br />
          4つの U が近づくとき、斥力と引力のはざまに X が立ち上がる。<br />
          それは交差であり、未知であり、あなたのための座標。<br />
          <br />
          For You — この設計思想に、宛先がある。<br />
          私たちはあなたの磁場を読み、<br />
          反発を恐れず、同調を強いず、<br />
          ただ、最も自然な配列を探す。
        </p>
      </div>

      <div className="scroll-indicator" ref={scrollRef}>
        <span>scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}
