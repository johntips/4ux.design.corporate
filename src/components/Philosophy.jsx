/**
 * Philosophy.jsx — 4つの U + X の意味を解説するセクション
 *
 * ScrollTrigger: 画面内に入るとカード群が stagger で浮かび上がる
 */
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { VariantU, VariantX } from './SymbolVariants'

gsap.registerPlugin(ScrollTrigger)

const VALUES = [
  { symbol: 'u', rot: 0,   title: 'Universal',  desc: 'すべての人に届くデザイン。境界を溶かし、誰もが触れられる形を。' },
  { symbol: 'u', rot: 90,  title: 'Unified',     desc: '断片をひとつに。プラットフォームを横断する一貫した体験。' },
  { symbol: 'u', rot: 180, title: 'Unique',       desc: 'あなただけの輪郭。記憶に残る、替えのきかないアイデンティティ。' },
  { symbol: 'u', rot: 270, title: 'Unknown',      desc: 'まだ名前のない可能性。見えない次元を拓く、第四のU。' },
  { symbol: 'x', rot: 0,   title: 'eXperience',  desc: '4つの U が交差する場所。体験という名の、未知の座標。' },
]

export default function Philosophy() {
  const sectionRef = useRef(null)
  const cardsRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current.children, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="section" ref={sectionRef}>
      <h2>4つの U、1つの X</h2>
      <p>
        U は You。あなたという存在を4つの軸で捉え、<br />
        その交差点に X — eXperience が生まれる。
      </p>

      <div className="values-grid" ref={cardsRef}>
        {VALUES.map((v, i) => (
          <div key={i} className="value-card glass">
            {v.symbol === 'u'
              ? <VariantU style={{ transform: `rotate(${v.rot}deg)` }} />
              : <VariantX />
            }
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
