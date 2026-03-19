/**
 * Hero.jsx — ファーストビュー (ロゴ + タイトルのみ)
 *
 * SP: ロゴとタイトルだけで1画面。ポエムは Poem.jsx に分離。
 * PC: 同じくシンプルなファーストビュー。
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
      gsap.from(logoRef.current.children, {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        delay: 0.3,
      })

      gsap.from(textRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 1,
      })

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

  const handleTileHover = (e) => {
    gsap.to(e.currentTarget, {
      rotation: '+=90',
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  return (
    <section className="hero">
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

      <h1 ref={textRef}>uuuux.design</h1>

      <div className="scroll-indicator" ref={scrollRef}>
        <span>scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}
