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
  { symbol: 'u', rot: 0,   title: 'Universal',  desc: '排除しない引力。壁を磁力で溶かし、あらゆる存在が自然に並ぶ場をつくる。' },
  { symbol: 'u', rot: 90,  title: 'Unified',     desc: '散らばった極が揃う瞬間。断片が同じ方向を向いたとき、体験は一本の線になる。' },
  { symbol: 'u', rot: 180, title: 'Unique',       desc: '反発が輪郭を生む。同調しないことで初めて、あなたの磁場が可視化される。' },
  { symbol: 'u', rot: 270, title: 'Unknown',      desc: 'まだ磁化されていない鉄。触れてみるまで、N極かS極かは誰にもわからない。' },
  { symbol: 'x', rot: 0,   title: 'eXperience',  desc: '4つの磁場が交差する点。斥力と引力が拮抗する場所に、体験の座標が生まれる。' },
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
      <h2>4つの磁極、1つの交点</h2>
      <p>
        同じ極は退け合い、異なる極は惹き合う。<br />
        その力学の中心に、X という座標が浮かび上がる。
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
