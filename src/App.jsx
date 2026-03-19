/**
 * App.jsx — uuuux.design コーポレートLP
 *
 * 構成:
 *   TileGrid      — fixed背景。マウス/タッチ追従で回転するタイルパターン
 *   Controller     — 左下のAbleton風パラメータコントローラー
 *   Content        — スクロール可能なメインコンテンツ
 */
import TileGrid from './components/TileGrid'
import Hero from './components/Hero'
import Poem from './components/Poem'
import PatternStrip from './components/PatternStrip'
import Philosophy from './components/Philosophy'
import Footer from './components/Footer'
import Controller from './components/Controller'
import './App.css'

export default function App() {
  return (
    <>
      <TileGrid />
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
