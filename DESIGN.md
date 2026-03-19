# 4ux.design Corporate LP — Design Document

## Brand Identity

- **Name**: uuuux.design (also styled as 4ux.design)
- **Meaning**: 4つの U と X — Universal eXperience Design
- **Core Symbol**: U (真円半円) と X/+ (十字/クロス)

## Visual Language

### Tile System
- U と X の2種類のSVGシンボルがタイル状に敷き詰められる
- X は回転することで + にも × にも見える（45° rotation）
- U は真円の半円、0°/90°/180°/270° の4方向に回転
- タイルサイズ: 72px

### Symbol Variants (Shift+F で切り替え)

10種類のバリエーション。すべて viewBox 48x48、中心(24,24) 基準。

| # | Name | U | X | Description |
|---|------|---|---|-------------|
| 0 | **Solid** | 太いU字 stroke=10 butt | 太い十字 stroke=10 butt | デフォルト。太く機械的 |
| 1 | **Landolt** | ランドルト環 (視力検査のC) | クロスヘア (中心に隙間) | 視力検査の幾何学 |
| 2 | **Ring** | ドーナツリングの上部カット | 同心円 + 十字 | 環状 |
| 3 | **Filled** | 塗りつぶしU字 (fill) | 塗りつぶし十字 (fill) | ソリッド面 |
| 4 | **Target** | 3重同心U字 | 3重同心円 + 十字 | ターゲット |
| 5 | **Slit** | 3本の平行弧 | 3本×2の平行線十字 | スリット/平行線 |
| 6 | **Dot Matrix** | ドットで描くU字 | ドットで描く十字 | ドットマトリクス |
| 7 | **Shadow** | U字 + 影 (offset) | 十字 + 影 | 立体感 |
| 8 | **Broken** | 4断片のU字 | 4断片の十字 | フラグメント |
| 9 | **Minimal** | 1/4弧のみ | 1本線のみ | 最小限 |

### Interaction
- **マウスカーソル追従**: カーソル周辺のタイルが回転角度を変える
- カーソルからの距離に応じて回転量が変化（近い = 大きく回転）
- GSAP で滑らかに補間
- **Shift+F**: シンボルバリエーション切り替え (0-9)

### Material / Color
- **Base**: #f5f5f5 (ウォームグレー)
- **Foreground**: #1a1a1a
- **Muted**: #999
- **Glass**: rgba(255,255,255,0.6) + backdrop-filter: blur(20px)
- **Tile opacity**: 通常 0.06 → カーソル近接時 0.36
- クリアガラス質感: glassmorphism でコンテンツカードを浮かせる

### Typography
- **Font**: Space Grotesk — 幾何学的なグロテスク体
- **Headline**: 700, letter-spacing -0.04em
- **Body**: 300, letter-spacing 0.02em

## Page Structure

```
┌─────────────────────────────────┐
│  [Tile Grid - fixed, full screen] │
│                                   │
│  ┌─ Hero ────────────────────┐   │
│  │  Logo: U U U X (4 tiles)  │   │
│  │  "uuuux.design"           │   │
│  │  Subtitle                  │   │
│  │  ↓ scroll                  │   │
│  └────────────────────────────┘   │
│                                   │
│  ── Pattern Strip (横スクロール) ── │
│                                   │
│  ┌─ Philosophy ──────────────┐   │
│  │  4つのU = 4 Universals     │   │
│  │  Glass cards × 4           │   │
│  └────────────────────────────┘   │
│                                   │
│  ── Pattern Strip ──────────── │
│                                   │
│  ┌─ Footer ──────────────────┐   │
│  │  Mini logo + copyright     │   │
│  │  Variant indicator (0-9)   │   │
│  └────────────────────────────┘   │
└─────────────────────────────────┘
```

## Component Architecture

```
App
├── VariantProvider (Context) // 現在のバリエーション番号を管理
│   ├── useVariant()         // バリエーション番号を取得
│   └── Shift+F リスナー     // キーで切り替え
├── TileGrid                 // fixed背景、マウス追従回転
├── Content
│   ├── Hero
│   ├── PatternStrip
│   ├── Philosophy
│   ├── PatternStrip
│   └── Footer
└── useMouse (hook)
```

## SVG Definitions (v2 — 真円ベース)

### U Shape
- 真円 (r=16) の下半分をアーク描画
- `M8,24 A16,16 0 0,1 40,24`
- strokeWidth: バリエーションにより変動
- strokeLinecap: butt (デフォルト) or round

### X Shape (十字/+)
- 水平線 (8,24)→(40,24) + 垂直線 (24,8)→(24,40)
- U と同じ strokeWidth で太さ統一
- 回転 0° = +、回転 45° = ×

## Animation Spec

| Element | Trigger | Animation | Duration |
|---------|---------|-----------|----------|
| Tile rotation | Mouse move | 距離に応じた角度変化 | 0.5s ease |
| Tile opacity | Mouse proximity | 0.06 → 0.36 | 0.3s |
| Hero logo | Page load | stagger fade-in + rotate | 1.2s |
| Pattern strip | Scroll | translateX loop | infinite 30s |
| Value cards | Scroll into view | fade-up + stagger | 0.8s |
| Variant switch | Shift+F | シンボルSVG切り替え | instant |

## Tech Stack
- Vite + React
- GSAP (ScrollTrigger, gsap.to)
- CSS: glassmorphism, CSS Grid
- React Context (variant state)
- No external UI library
