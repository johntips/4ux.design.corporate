/**
 * App.jsx — uuuux.design コーポレートLP
 *
 * variant 0-29:  SVG TileGrid
 * variant 30-39: WebGL TileGrid3D
 * クロスフェードで自然に切り替わる
 */
import { lazy, Suspense } from 'react'
import TileGrid from './components/TileGrid'
import Hero from './components/Hero'
import Poem from './components/Poem'
import PatternStrip from './components/PatternStrip'
import Philosophy from './components/Philosophy'
import Footer from './components/Footer'
import Controller from './components/Controller'
import { useDesignParams } from './context/VariantContext'
import './App.css'

// WebGL は重いので lazy load
const TileGrid3D = lazy(() => import('./components/TileGrid3D'))

export default function App() {
  const { variant } = useDesignParams()
  const is3D = variant >= 30

  return (
    <>
      {/* SVG grid: 3D モード時はフェードアウト */}
      <div className={`grid-layer ${is3D ? 'grid-hidden' : 'grid-visible'}`}>
        <TileGrid />
      </div>

      {/* WebGL grid: 3D モード時のみ表示 */}
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
