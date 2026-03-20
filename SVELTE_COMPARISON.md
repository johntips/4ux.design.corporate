# React → Svelte (SvelteKit) 書き直しの比較

## パフォーマンス

| 項目 | React (現状) | Svelte |
|------|-------------|--------|
| バンドルサイズ | ~334KB (本体) + ~927KB (Three.js chunk) | 本体が **60-70% 削減** 見込み。Svelte はランタイムなし (コンパイル済み) |
| 初回ロード | React ランタイム ~40KB + reconciler | ランタイム 0KB。コンパイル時に最適化された vanilla JS を出力 |
| re-render | Virtual DOM diff → 全コンポーネントツリーを走査 | リアクティブ代入 (`$:`) で **変更した変数だけ** DOM 更新。差分計算なし |
| タイルグリッド | `useMemo` + `useCallback` + `useRef` で最適化が必要 | `$:` ブロックで自動最適化。ボイラープレート大幅削減 |
| GSAP 連携 | `useEffect` + `useRef` + cleanup | `onMount` / `onDestroy` でシンプル。`use:action` ディレクティブで宣言的に |

## DX (開発体験)

| 項目 | React | Svelte |
|------|-------|--------|
| ファイルサイズ | JSX + CSS 別ファイル or CSS-in-JS | `.svelte` 1ファイルに HTML/CSS/JS がまとまる |
| ステート管理 | Context + useState + useCallback のボイラープレート | `$state` / `$derived` (Svelte 5 Runes) or `writable` store |
| コントローラー | ~180行 (Controller.jsx) | 推定 **~100行** (テンプレート直書き + リアクティブバインド) |
| 3D 連携 | @react-three/fiber (独自の React renderer) | `threlte` (Svelte 向け Three.js ラッパー) or 生の Three.js を `onMount` で |
| CSS スコープ | 別ファイル or CSS Modules | `.svelte` 内の `<style>` が **自動スコープ** |
| アニメーション | GSAP (外部ライブラリ) | `svelte/transition` + `svelte/animate` 組み込み。GSAP も併用可 |

## 具体的に良くなるポイント

### 1. タイルグリッドの reactivity
```svelte
<!-- React: useMemo + useCallback + useRef のチェーン -->
<!-- Svelte: リアクティブ宣言だけ -->
<script>
  let { tileSize, tileGap } = $props()
  let cellSize = $derived(Math.max(tileSize + tileGap, 4))
  let cols = $derived(Math.ceil(window.innerWidth / cellSize) + 2)
</script>
```

### 2. コントローラーのフェーダー
```svelte
<!-- React: onChange + handleChange + haptics.slide(ratio) -->
<!-- Svelte: bind:value + reactive -->
<input type="range" bind:value={tileSize} min={16} max={600}
  on:input={() => haptics.slide((tileSize - 16) / 584)} />
```

### 3. GSAP アニメーション
```svelte
<!-- React: useRef + useEffect + cleanup -->
<!-- Svelte: use:action -->
<div use:gsapFrom={{ y: 30, opacity: 0, duration: 0.8 }}>
```

### 4. CSS スコープ
```svelte
<!-- グローバル CSS ファイル不要。各コンポーネント内で完結 -->
<style>
  .fader { display: flex; gap: 8px; }
  /* 自動的に .fader.svelte-xxxx にスコープされる */
</style>
```

## トレードオフ / 注意点

| | 詳細 |
|---|------|
| **Three.js エコシステム** | `threlte` は R3F ほど成熟していない。複雑な3Dは生の Three.js で書くことになる場合も |
| **学習コスト** | Svelte 5 (Runes) は新しく、ドキュメント・事例がまだ少ない |
| **ライブラリ互換** | `web-haptics/react` は使えない → `web-haptics` 本体を直接使う (問題なし) |
| **チーム採用** | React エンジニアの方が見つけやすい |
| **SSR/SSG** | SvelteKit は SSR/SSG がファーストクラス。LP なら SSG で完全静的サイト化も容易 |

## 書き直すべきか？

**書き直す価値がある場合:**
- バンドルサイズを極限まで削りたい (LP なのでファーストインプレッションが命)
- コードの簡潔さを重視 (保守コスト削減)
- SSG で完全静的サイトにしたい

**現状のままで良い場合:**
- 3D パターンの拡張を続ける予定 (R3F エコシステムの恩恵)
- React の知見があるチームで運用
- 現状のパフォーマンスで十分

## 推定工数

| 項目 | 時間 |
|------|------|
| SvelteKit セットアップ + 基本移植 | 2-3h |
| タイルグリッド (SVG) | 1-2h |
| コントローラー | 1h |
| GSAP アニメーション移植 | 1h |
| Three.js 3D パターン (threlte or 生) | 2-3h |
| haptics + レスポンシブ | 1h |
| **合計** | **~10h** |
