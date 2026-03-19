/**
 * App.jsx — uuuux.design コーポレートLP ルートコンポーネント
 *
 * 構成:
 *   TileGrid      — fixed背景。マウス追従で回転するタイルパターン
 *   Content        — z-index:1 のスクロール可能なメインコンテンツ
 *     ├ Hero         — ファーストビュー (ロゴ + タイトル)
 *     ├ PatternStrip — 横スクロールするタイル帯
 *     ├ Philosophy   — 4つのU + Xの解説
 *     ├ PatternStrip — 逆方向のタイル帯
 *     └ Footer       — ミニロゴ + コピーライト
 */
import TileGrid from './components/TileGrid'
import Hero from './components/Hero'
import PatternStrip from './components/PatternStrip'
import Philosophy from './components/Philosophy'
import Footer from './components/Footer'
import './App.css'

export default function App() {
  return (
    <>
      <TileGrid />
      <div className="content">
        <Hero />
        <PatternStrip direction="left" />
        <Philosophy />
        <PatternStrip direction="right" />
        <Footer />
      </div>
    </>
  )
}
