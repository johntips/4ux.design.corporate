/**
 * Poem.jsx — ポエムセクション (Hero の下、スクロールで段階的に現れる)
 *
 * SP: スクロールすると行ごとに stagger でフェードイン
 * PC: 同じく ScrollTrigger で表示
 */
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STANZAS = [
  '同じ極は退け合い、異なる極は引き寄せる。\nあなたと世界のあいだにも、その力が流れている。',
  'U は You。あなたという磁場。\n近づけば反発し、離れれば渇望する——\nその振動の正体を、私たちは「体験」と呼ぶ。',
  'Universal — 排除しない引力。万人を包む磁界。\nUnified — 散らばった断片が、ひとつの極に揃う瞬間。\nUnique — 反発こそが輪郭になる。同調しないから、あなたになる。\nUnknown — まだ磁化されていない鉄。触れるまで、極はわからない。',
  '4つの U が近づくとき、斥力と引力のはざまに X が立ち上がる。\nそれは交差であり、未知であり、あなたのための座標。',
  'For You — この設計思想に、宛先がある。\n私たちはあなたの磁場を読み、\n反発を恐れず、同調を強いず、\nただ、最も自然な配列を探す。',
]

export default function Poem() {
  const sectionRef = useRef(null)
  const stanzaRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      stanzaRefs.current.forEach((el) => {
        if (!el) return
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="poem-section" ref={sectionRef}>
      {STANZAS.map((text, i) => (
        <p
          key={i}
          className="stanza"
          ref={(el) => { stanzaRefs.current[i] = el }}
        >
          {text.split('\n').map((line, j) => (
            <span key={j}>
              {line}
              {j < text.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </section>
  )
}
