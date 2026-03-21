/**
 * App.jsx — uuuux.design コーポレートLP
 *
 * 演出 (yuto-takahashi.com 参考):
 *   - ノイズオーバーレイ (CSS, 5% opacity)
 *   - マウスストーカー (mix-blend-mode: difference)
 *   - scaleY 圧縮エントリー (Hero, Poem)
 */
import { lazy, Suspense } from 'react'
import TileGrid from './components/TileGrid'
import Hero from './components/Hero'
import Poem from './components/Poem'
import PatternStrip from './components/PatternStrip'
import Philosophy from './components/Philosophy'
import Footer from './components/Footer'
import Controller from './components/Controller'
import MouseStalker from './components/MouseStalker'
import { useDesignParams } from './context/VariantContext'
import './App.css'

const TileGrid3D = lazy(() => import('./components/TileGrid3D'))

export default function App() {
  const { variant } = useDesignParams()
  const is3D = variant >= 30

  return (
    <>
      {/* ノイズオーバーレイ — フィルム質感 */}
      <div className="noise-overlay" />

      {/* マウスストーカー — PC only (CSS で SP 非表示) */}
      <MouseStalker />

      <div className={`grid-layer ${is3D ? 'grid-hidden' : 'grid-visible'}`}>
        <TileGrid />
      </div>

      <div className={`grid-layer ${is3D ? 'grid-visible' : 'grid-hidden'}`}>
        <Suspense fallback={null}>
          {is3D && <TileGrid3D />}
        </Suspense>
      </div>

      <Controller />
      <div className="content">
        <Hero />
        <Poem />
        <PatternStrip direction="left" />
        <Philosophy />
        <PatternStrip direction="right" />
        <Footer />
      </div>
    </>
  )
}
