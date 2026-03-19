/**
 * Philosophy.jsx — 4つの U + X の意味を解説するセクション
 *
 * GSAPアニメーション:
 *   - ScrollTrigger で画面内に入ったらカード群が stagger で浮かび上がる
 *   - toggleActions: 'play none none reverse' → スクロールバックで元に戻る
 */
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { UShape, XShape } from './Symbols'

gsap.registerPlugin(ScrollTrigger)

// ── コンテンツ定義 ──
const VALUES = [
  { symbol: 'u', rot: 0,   title: 'Universal',   desc: '誰もが使える、すべての人のためのデザイン。' },
  { symbol: 'u', rot: 90,  title: 'Unified',      desc: 'プラットフォームを横断する一貫した体験。' },
  { symbol: 'u', rot: 180, title: 'Unique',        desc: '記憶に残る、差別化されたアイデンティティ。' },
  { symbol: 'x', rot: 0,   title: 'eXperience',   desc: 'U × X が交差し、新しい価値を生む。' },
]

export default function Philosophy() {
  const sectionRef = useRef(null)
  const cardsRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current.children, {
        y: 60,               // 下から浮かび上がる
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,       // カードを順番に
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',  // セクション上端が画面70%位置に来たら発火
          toggleActions: 'play none none reverse',
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="section" ref={sectionRef}>
      <h2>4つの U、1つの X</h2>
      <p>Universal, Unified, Unique — 3つの U が交差する eXperience。</p>

      <div className="values-grid" ref={cardsRef}>
        {VALUES.map((v, i) => (
          <div key={i} className="value-card glass">
            {v.symbol === 'u'
              ? <UShape style={{ transform: `rotate(${v.rot}deg)` }} />
              : <XShape />
            }
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
