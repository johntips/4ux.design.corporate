# 4ux.design Corporate LP — Design Document

## Brand Identity

- **Name**: uuuux.design (also styled as 4ux.design)
- **Meaning**: 4つの U と X — Universal eXperience Design
- **Core Symbol**: U (半円/アーチ) と X/+ (回転で変化)

## Visual Language

### Tile System
- U と X の2種類のSVGシンボルがタイル状に敷き詰められる
- X は回転することで + にも X にも見える（45° rotation）
- U は半円アーチ型で、0°/90°/180°/270° の4方向に回転
- タイルサイズ: 72px

### Interaction
- **マウスカーソル追従**: カーソル周辺のタイルが回転角度を変える
- カーソルからの距離に応じて回転量が変化（近い = 大きく回転）
- GSAP で滑らかに補間

### Material / Color
- **Base**: #f5f5f5 (ウォームグレー)
- **Foreground**: #1a1a1a
- **Muted**: #999
- **Glass**: rgba(255,255,255,0.6) + backdrop-filter: blur(20px)
- **Tile opacity**: 通常 0.12 → カーソル近接時 0.35
- クリアガラス質感: glassmorphism でコンテンツカードを浮かせる

### Typography
- **Font**: Space Grotesk — 幾何学的なグロテスク体
- **Headline**: 700, letter-spacing -0.04em
- **Body**: 300, letter-spacing 0.02em
- 図形・記号的な印象を重視

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
│  └────────────────────────────┘   │
└─────────────────────────────────┘
```

## Component Architecture

```
App
├── TileGrid          // fixed背景、マウス追従回転
│   └── Tile          // 個別タイル（U or X SVG）
├── Content           // z-index: 1 のスクロールコンテンツ
│   ├── Hero          // ロゴ + タイトル + サブタイトル
│   ├── PatternStrip  // 横スクロールするタイル帯
│   ├── Philosophy    // 4つのU解説 (glass cards)
│   ├── PatternStrip
│   └── Footer
└── useMouse (hook)   // マウス座標をトラッキング
```

## SVG Definitions

### U Shape (半円アーチ)
- 上半分が開いた半円
- stroke-linecap: round
- stroke-width: 適度な太さ

### X Shape (クロス/プラス)
- 2本の線が交差
- 回転 0° = X、回転 45° = +
- stroke-linecap: round

## Animation Spec

| Element | Trigger | Animation | Duration |
|---------|---------|-----------|----------|
| Tile rotation | Mouse move | 距離に応じた角度変化 | 0.6s ease |
| Tile opacity | Mouse proximity | 0.12 → 0.35 | 0.3s |
| Hero logo | Page load | stagger fade-in + rotate | 1.2s |
| Pattern strip | Scroll | translateX loop | infinite |
| Value cards | Scroll into view | fade-up + stagger | 0.8s |

## Tech Stack
- Vite + React
- GSAP (ScrollTrigger, gsap.to)
- CSS: glassmorphism, CSS Grid
- No external UI library
