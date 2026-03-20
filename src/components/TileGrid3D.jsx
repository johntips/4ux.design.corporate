/**
 * TileGrid3D.jsx — Three.js タイルグリッド (20バリエーション)
 *
 * 30-39: マテリアル変化 (共通U/X形状)
 * 40-49: 形状 + マテリアル変化 (各バリエーション固有のU/Xモデリング)
 */
import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDesignParams } from '../context/VariantContext'
import { useSmoothMouse } from '../hooks/useMouse'

const PX = 100
const RADIUS = 800

// ═══════════════════════════════════════════
//  U / X 形状ファクトリ
// ═══════════════════════════════════════════

/** 標準U: 丸底 + 両脚 */
function uStandard() {
  const s = new THREE.Shape()
  const ow = 0.42, iw = 0.22, legH = 0.4, bot = -0.42, iBot = -0.22
  s.moveTo(-ow, legH); s.lineTo(-ow, 0)
  s.quadraticCurveTo(-ow, bot, 0, bot)
  s.quadraticCurveTo(ow, bot, ow, 0); s.lineTo(ow, legH)
  s.lineTo(iw, legH); s.lineTo(iw, 0)
  s.quadraticCurveTo(iw, iBot, 0, iBot)
  s.quadraticCurveTo(-iw, iBot, -iw, 0); s.lineTo(-iw, legH)
  s.closePath(); return s
}

/** 標準X: 十字 */
function xStandard() {
  const s = new THREE.Shape(), a = 0.42, b = 0.1
  s.moveTo(-b,-a); s.lineTo(b,-a); s.lineTo(b,-b); s.lineTo(a,-b)
  s.lineTo(a,b); s.lineTo(b,b); s.lineTo(b,a); s.lineTo(-b,a)
  s.lineTo(-b,b); s.lineTo(-a,b); s.lineTo(-a,-b); s.lineTo(-b,-b)
  s.closePath(); return s
}

/** 角張ったU: 直角の溝 */
function uSquare() {
  const s = new THREE.Shape()
  const o = 0.42, i = 0.22, h = 0.4
  s.moveTo(-o, h); s.lineTo(-o, -o); s.lineTo(o, -o); s.lineTo(o, h)
  s.lineTo(i, h); s.lineTo(i, -i); s.lineTo(-i, -i); s.lineTo(-i, h)
  s.closePath(); return s
}

/** 斜めX: ×型 (対角線の棒) */
function xDiagonal() {
  const s = new THREE.Shape(), a = 0.4, b = 0.08
  // ＼ 棒
  s.moveTo(-a+b, -a); s.lineTo(-a, -a+b); s.lineTo(a-b, a); s.lineTo(a, a-b)
  s.closePath()
  return s
}

/** 斜め2本目 (／棒) — 別メッシュで合成 */
function xDiagonal2() {
  const s = new THREE.Shape(), a = 0.4, b = 0.08
  s.moveTo(a-b, -a); s.lineTo(a, -a+b); s.lineTo(-a+b, a); s.lineTo(-a, a-b)
  s.closePath(); return s
}

/** 太いU: 壁が厚い */
function uThick() {
  const s = new THREE.Shape()
  const o = 0.44, i = 0.14, h = 0.4, bot = -0.44, iBot = -0.14
  s.moveTo(-o, h); s.lineTo(-o, 0)
  s.quadraticCurveTo(-o, bot, 0, bot)
  s.quadraticCurveTo(o, bot, o, 0); s.lineTo(o, h)
  s.lineTo(i, h); s.lineTo(i, 0)
  s.quadraticCurveTo(i, iBot, 0, iBot)
  s.quadraticCurveTo(-i, iBot, -i, 0); s.lineTo(-i, h)
  s.closePath(); return s
}

/** 細いU: 壁が薄い */
function uThin() {
  const s = new THREE.Shape()
  const o = 0.40, i = 0.32, h = 0.45, bot = -0.40, iBot = -0.32
  s.moveTo(-o, h); s.lineTo(-o, 0)
  s.quadraticCurveTo(-o, bot, 0, bot)
  s.quadraticCurveTo(o, bot, o, 0); s.lineTo(o, h)
  s.lineTo(i, h); s.lineTo(i, 0)
  s.quadraticCurveTo(i, iBot, 0, iBot)
  s.quadraticCurveTo(-i, iBot, -i, 0); s.lineTo(-i, h)
  s.closePath(); return s
}

/** 太い十字 */
function xThick() {
  const s = new THREE.Shape(), a = 0.44, b = 0.16
  s.moveTo(-b,-a); s.lineTo(b,-a); s.lineTo(b,-b); s.lineTo(a,-b)
  s.lineTo(a,b); s.lineTo(b,b); s.lineTo(b,a); s.lineTo(-b,a)
  s.lineTo(-b,b); s.lineTo(-a,b); s.lineTo(-a,-b); s.lineTo(-b,-b)
  s.closePath(); return s
}

/** 細い十字 */
function xThin() {
  const s = new THREE.Shape(), a = 0.42, b = 0.04
  s.moveTo(-b,-a); s.lineTo(b,-a); s.lineTo(b,-b); s.lineTo(a,-b)
  s.lineTo(a,b); s.lineTo(b,b); s.lineTo(b,a); s.lineTo(-b,a)
  s.lineTo(-b,b); s.lineTo(-a,b); s.lineTo(-a,-b); s.lineTo(-b,-b)
  s.closePath(); return s
}

/** 浅いU: 底が浅い器 */
function uShallow() {
  const s = new THREE.Shape()
  const o = 0.44, i = 0.30, h = 0.15, bot = -0.25, iBot = -0.12
  s.moveTo(-o, h); s.lineTo(-o, 0)
  s.quadraticCurveTo(-o, bot, 0, bot)
  s.quadraticCurveTo(o, bot, o, 0); s.lineTo(o, h)
  s.lineTo(i, h); s.lineTo(i, 0)
  s.quadraticCurveTo(i, iBot, 0, iBot)
  s.quadraticCurveTo(-i, iBot, -i, 0); s.lineTo(-i, h)
  s.closePath(); return s
}

/** ダイヤモンド X: ◇ */
function xDiamond() {
  const s = new THREE.Shape(), a = 0.42, b = 0.12
  // 外ダイヤ
  s.moveTo(0, -a); s.lineTo(a, 0); s.lineTo(0, a); s.lineTo(-a, 0); s.closePath()
  return s
}

/** リングU: 開いた円環 */
function uRing() {
  const s = new THREE.Shape()
  const o = 0.42, i = 0.30, h = 0.2
  s.moveTo(-o, h); s.lineTo(-o, 0)
  s.quadraticCurveTo(-o, -o, 0, -o)
  s.quadraticCurveTo(o, -o, o, 0); s.lineTo(o, h)
  s.lineTo(i, h); s.lineTo(i, 0)
  s.quadraticCurveTo(i, -i, 0, -i)
  s.quadraticCurveTo(-i, -i, -i, 0); s.lineTo(-i, h)
  s.closePath(); return s
}

/** 星型X */
function xStar() {
  const s = new THREE.Shape(), R = 0.42, r = 0.15
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2
    const rad = i % 2 === 0 ? R : r
    if (i === 0) s.moveTo(rad * Math.cos(a), rad * Math.sin(a))
    else s.lineTo(rad * Math.cos(a), rad * Math.sin(a))
  }
  s.closePath(); return s
}

// ═══════════════════════════════════════════
//  20 バリエーション定義
// ═══════════════════════════════════════════

export const VARIANTS_3D = [
  // ── 30-39: マテリアル変化 (標準形状) ──
  { name: 'Glass',      depth: 0.06, bevel: 0.02, color: '#f0f0f0', metal: 0.1, rough: 0.02, opacity: 0.3, wire: false, emissive: '#000', emInt: 0,   makeU: uStandard, makeX: xStandard },
  { name: 'Chrome',     depth: 0.2,  bevel: 0.01, color: '#e0e0e0', metal: 1.0, rough: 0.05, opacity: 1,   wire: false, emissive: '#000', emInt: 0,   makeU: uStandard, makeX: xStandard },
  { name: 'Wireframe',  depth: 0.06, bevel: 0,    color: '#444',    metal: 0,   rough: 1,    opacity: 1,   wire: true,  emissive: '#000', emInt: 0,   makeU: uStandard, makeX: xStandard },
  { name: 'Neon 3D',    depth: 0.02, bevel: 0,    color: '#111',    metal: 0,   rough: 1,    opacity: 1,   wire: false, emissive: '#fff', emInt: 1.2, makeU: uStandard, makeX: xStandard },
  { name: 'Matte',      depth: 0.25, bevel: 0.04, color: '#f4f4f4', metal: 0,   rough: 0.95, opacity: 1,   wire: false, emissive: '#000', emInt: 0,   makeU: uStandard, makeX: xStandard },
  { name: 'Holo',       depth: 0.04, bevel: 0.02, color: '#e0e0ff', metal: 0.7, rough: 0.15, opacity: 0.45,wire: false, emissive: '#336', emInt: 0.4, makeU: uStandard, makeX: xStandard },
  { name: 'Voxel',      depth: 0.5,  bevel: 0,    color: '#ddd',    metal: 0.15,rough: 0.7,  opacity: 1,   wire: false, emissive: '#000', emInt: 0,   makeU: uSquare,   makeX: xStandard },
  { name: 'Clay',       depth: 0.3,  bevel: 0.03, color: '#e8ddd0', metal: 0,   rough: 1.0,  opacity: 1,   wire: false, emissive: '#000', emInt: 0,   makeU: uStandard, makeX: xStandard },
  { name: 'Deep',       depth: 0.7,  bevel: 0.01, color: '#bbb',    metal: 0.6, rough: 0.25, opacity: 1,   wire: false, emissive: '#000', emInt: 0,   makeU: uStandard, makeX: xStandard },
  { name: 'Minimal 3D', depth: 0.008,bevel: 0,    color: '#ccc',    metal: 0.2, rough: 0.5,  opacity: 1,   wire: false, emissive: '#000', emInt: 0,   makeU: uStandard, makeX: xStandard },

  // ── 40-49: 形状 + マテリアル変化 ──
  // 40: Cyber — 角張りU + 斜めX、発光シアン
  { name: 'Cyber',      depth: 0.08, bevel: 0,    color: '#0a0a0a', metal: 0.3, rough: 0.4,  opacity: 1,   wire: false, emissive: '#0ff', emInt: 0.8, makeU: uSquare,   makeX: xDiagonal },
  // 41: Brutalist — 極太 + 極厚
  { name: 'Brutalist',  depth: 0.6,  bevel: 0,    color: '#999',    metal: 0.1, rough: 0.9,  opacity: 1,   wire: false, emissive: '#000', emInt: 0,   makeU: uThick,    makeX: xThick },
  // 42: Hairline3D — 極細 + ワイヤー
  { name: 'Hairline3D', depth: 0.01, bevel: 0,    color: '#666',    metal: 0,   rough: 1,    opacity: 1,   wire: true,  emissive: '#000', emInt: 0,   makeU: uThin,     makeX: xThin },
  // 43: Gothic — 深い角U + 星型X、ダーク金属
  { name: 'Gothic',     depth: 0.35, bevel: 0.02, color: '#2a2a2a', metal: 0.8, rough: 0.3,  opacity: 1,   wire: false, emissive: '#111', emInt: 0.2, makeU: uSquare,   makeX: xStar },
  // 44: Porcelain — 浅い器U、白磁、丸ベベル
  { name: 'Porcelain',  depth: 0.15, bevel: 0.05, color: '#fafafa', metal: 0,   rough: 0.8,  opacity: 1,   wire: false, emissive: '#000', emInt: 0,   makeU: uShallow,  makeX: xStandard },
  // 45: Neon Wire — 細U + 細X、ワイヤー + 発光
  { name: 'Neon Wire',  depth: 0.03, bevel: 0,    color: '#111',    metal: 0,   rough: 1,    opacity: 1,   wire: true,  emissive: '#f0f', emInt: 1.0, makeU: uThin,     makeX: xThin },
  // 46: Monolith — リングU + ダイヤX、石碑感
  { name: 'Monolith',   depth: 0.4,  bevel: 0.01, color: '#888',    metal: 0.3, rough: 0.6,  opacity: 1,   wire: false, emissive: '#000', emInt: 0,   makeU: uRing,     makeX: xDiamond },
  // 47: Paper — 極薄 + 角U + 白
  { name: 'Paper',      depth: 0.005,bevel: 0,    color: '#f8f8f8', metal: 0,   rough: 1,    opacity: 0.9, wire: false, emissive: '#000', emInt: 0,   makeU: uSquare,   makeX: xStandard },
  // 48: Gold — 太い + 金属光沢ゴールド
  { name: 'Gold',       depth: 0.2,  bevel: 0.03, color: '#d4a843', metal: 1.0, rough: 0.2,  opacity: 1,   wire: false, emissive: '#000', emInt: 0,   makeU: uThick,    makeX: xThick },
  // 49: Silver — Gold と同じ形状、シルバー光沢
  { name: 'Silver',     depth: 0.2,  bevel: 0.03, color: '#d0d0d8', metal: 1.0, rough: 0.15, opacity: 1,   wire: false, emissive: '#000', emInt: 0,   makeU: uThick,    makeX: xThick },
]

// ═══════════════════════════════════════════
//  Scene
// ═══════════════════════════════════════════

function Scene() {
  const { tileSize, tileGap, opacity: baseOpacity, variant, strokeW } = useDesignParams()
  // STRK スライダーで depth をスケール (デフォルト10基準)
  const depthScale = strokeW / 10
  const mouse = useSmoothMouse(0.1)
  const uRef = useRef()
  const xRef = useRef()
  const uRots = useRef([])
  const xRots = useRef([])

  const varIdx = variant - 30
  const v = VARIANTS_3D[varIdx] || VARIANTS_3D[0]
  const cellSize = Math.max(tileSize + tileGap, 4)
  const symScale = (tileSize / PX) * 0.5

  const tiles = useMemo(() => {
    const w = window.innerWidth, h = window.innerHeight
    const cols = Math.min(Math.ceil(w / cellSize) + 2, 30)
    const rows = Math.min(Math.ceil(h / cellSize) + 2, 20)
    const arr = []
    const ox = -(cols * cellSize) / 2, oy = -(rows * cellSize) / 2
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (arr.length >= 600) break
        const idx = (col + row) % 4
        arr.push({
          px: (ox + col * cellSize + cellSize / 2) / PX,
          py: -(oy + row * cellSize + cellSize / 2) / PX,
          screenX: w / 2 + ox + col * cellSize + cellSize / 2,
          screenY: h / 2 + oy + row * cellSize + cellSize / 2,
          baseRot: idx === 3 ? Math.PI / 4 : (idx * Math.PI) / 2,
          isX: idx === 3,
        })
      }
    }
    return arr
  }, [cellSize])

  const uTiles = useMemo(() => tiles.filter(t => !t.isX), [tiles])
  const xTiles = useMemo(() => tiles.filter(t => t.isX), [tiles])

  // variant ごとに形状を切り替え
  // STRK スライダーで depth をリアルタイム変更
  const d = v.depth * depthScale
  const uGeo = useMemo(() => new THREE.ExtrudeGeometry(v.makeU(), {
    depth: d, bevelEnabled: v.bevel > 0,
    bevelThickness: v.bevel, bevelSize: v.bevel, bevelSegments: v.bevel > 0 ? 3 : 0,
  }), [v, d])

  const xGeo = useMemo(() => new THREE.ExtrudeGeometry(v.makeX(), {
    depth: d, bevelEnabled: v.bevel > 0,
    bevelThickness: v.bevel, bevelSize: v.bevel, bevelSegments: v.bevel > 0 ? 3 : 0,
  }), [v, d])

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: v.color, metalness: v.metal, roughness: v.rough,
    transparent: v.opacity < 1, opacity: Math.min(v.opacity, baseOpacity * 15),
    wireframe: v.wire, side: THREE.DoubleSide,
    emissive: new THREE.Color(v.emissive), emissiveIntensity: v.emInt,
  }), [v, baseOpacity])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const lerp = (a, b, t) => a + (b - a) * t

  useFrame(() => {
    const mx = mouse.current.x, my = mouse.current.y
    if (uRots.current.length !== uTiles.length)
      uRots.current = uTiles.map(t => ({ rx: 0, ry: 0, rz: t.baseRot }))
    if (xRots.current.length !== xTiles.length)
      xRots.current = xTiles.map(t => ({ rx: 0, ry: 0, rz: t.baseRot }))

    const update = (ref, arr, rots) => {
      if (!ref.current) return
      arr.forEach((t, i) => {
        const dx = mx - t.screenX, dy = my - t.screenY
        const dist = Math.sqrt(dx * dx + dy * dy)
        let tRx = 0, tRy = 0, tRz = t.baseRot
        if (dist < RADIUS) {
          const inf = 1 - dist / RADIUS
          const ang = Math.atan2(dy, dx)
          tRz = t.baseRot + ang * inf * 0.6
          tRx = Math.sin(ang) * inf * 0.4
          tRy = -Math.cos(ang) * inf * 0.4
        }
        const r = rots[i]
        r.rx = lerp(r.rx, tRx, 0.08)
        r.ry = lerp(r.ry, tRy, 0.08)
        r.rz = lerp(r.rz, tRz, 0.08)
        dummy.position.set(t.px, t.py, 0)
        dummy.rotation.set(r.rx, r.ry, r.rz)
        dummy.scale.setScalar(symScale)
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      })
      ref.current.instanceMatrix.needsUpdate = true
    }
    update(uRef, uTiles, uRots.current)
    update(xRef, xTiles, xRots.current)
  })

  return (
    <>
      {uTiles.length > 0 && <instancedMesh ref={uRef} args={[uGeo, mat, uTiles.length]} />}
      {xTiles.length > 0 && <instancedMesh ref={xRef} args={[xGeo, mat, xTiles.length]} />}
    </>
  )
}

function OrthoSetup() {
  const { camera } = useThree()
  const w = window.innerWidth / PX / 2, h = window.innerHeight / PX / 2
  useMemo(() => {
    camera.left = -w; camera.right = w; camera.top = h; camera.bottom = -h
    camera.near = -100; camera.far = 100; camera.position.set(0, 0, 10)
    camera.updateProjectionMatrix()
  }, [camera, w, h])
  return null
}

export default function TileGrid3D() {
  return (
    <div className="tile-grid-3d">
      <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 1, near: -100, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'default' }} dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
        <OrthoSetup />
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 5, 6]} intensity={1.0} />
        <directionalLight position={[-3, -2, 4]} intensity={0.35} />
        <pointLight position={[0, 0, 5]} intensity={0.3} />
        <Scene />
      </Canvas>
    </div>
  )
}
