/**
 * TileGrid3D.jsx — Three.js タイルグリッド
 *
 * U = 深いU字型 (両脚 + 半円底) — SVGと同じプロポーション
 * X = 十字
 *
 * 回転モデル:
 *   ベース: Z軸回転 (0°/90°/180°/270°) — SVGと同じ
 *   カーソル影響: Z軸回転 + 微量のX/Y傾き
 *   → 球体表面に貼り付いたシンボルが、カーソル方向に転がるイメージ
 */
import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDesignParams } from '../context/VariantContext'
import { useSmoothMouse } from '../hooks/useMouse'

const PX = 100
const RADIUS = 800

// ── 10 バリエーション (差別化を強めた) ──
export const VARIANTS_3D = [
  // 30: Glass — 薄い透過ガラス、ベベルあり
  { name: 'Glass',      depth: 0.06, bevel: 0.02, color: '#f0f0f0', metal: 0.1, rough: 0.02, opacity: 0.3, wire: false, emissive: '#000', emInt: 0 },
  // 31: Chrome — 厚い鏡面メタル
  { name: 'Chrome',     depth: 0.2,  bevel: 0.01, color: '#e0e0e0', metal: 1.0, rough: 0.05, opacity: 1,   wire: false, emissive: '#000', emInt: 0 },
  // 32: Wireframe — 保全 (ユーザー評価済み)
  { name: 'Wireframe',  depth: 0.06, bevel: 0,    color: '#444',    metal: 0,   rough: 1,    opacity: 1,   wire: true,  emissive: '#000', emInt: 0 },
  // 33: Neon — 極薄 + 強発光
  { name: 'Neon 3D',    depth: 0.02, bevel: 0,    color: '#111',    metal: 0,   rough: 1,    opacity: 1,   wire: false, emissive: '#fff', emInt: 1.2 },
  // 34: Matte — 厚い磁器風、丸ベベル
  { name: 'Matte',      depth: 0.25, bevel: 0.04, color: '#f4f4f4', metal: 0,   rough: 0.95, opacity: 1,   wire: false, emissive: '#000', emInt: 0 },
  // 35: Holo — 半透明イリデッセント
  { name: 'Holo',       depth: 0.04, bevel: 0.02, color: '#e0e0ff', metal: 0.7, rough: 0.15, opacity: 0.45, wire: false, emissive: '#336', emInt: 0.4 },
  // 36: Voxel — 極厚ブロック、ベベルなし
  { name: 'Voxel',      depth: 0.5,  bevel: 0,    color: '#ddd',    metal: 0.15, rough: 0.7, opacity: 1,   wire: false, emissive: '#000', emInt: 0 },
  // 37: Clay — 暖色厚め、丸ベベル
  { name: 'Clay',       depth: 0.3,  bevel: 0.03, color: '#e8ddd0', metal: 0,   rough: 1.0,  opacity: 1,   wire: false, emissive: '#000', emInt: 0 },
  // 38: Deep — 超深押し出し + 金属
  { name: 'Deep',       depth: 0.7,  bevel: 0.01, color: '#bbb',    metal: 0.6, rough: 0.25, opacity: 1,   wire: false, emissive: '#000', emInt: 0 },
  // 39: Minimal 3D — 紙のように薄い
  { name: 'Minimal 3D', depth: 0.008, bevel: 0,   color: '#ccc',    metal: 0.2, rough: 0.5,  opacity: 1,   wire: false, emissive: '#000', emInt: 0 },
]

// ── U字型 Shape (直線 + 曲線で確実にU字を構築) ──
//
//   |         |   ← 脚 (legH)
//   |         |
//    ╲_______╱    ← 丸底 (quadraticCurve)
//
function makeUShape() {
  const ow = 0.42, iw = 0.22  // 外・内幅
  const legH = 0.4             // 脚高さ
  const bot = -0.42            // 底の最深点 Y
  const iBot = -0.22           // 内底の最深点 Y

  const shape = new THREE.Shape()
  // 外側 (左上 → 時計回り)
  shape.moveTo(-ow, legH)              // 左脚上
  shape.lineTo(-ow, 0)                 // 左脚下
  shape.quadraticCurveTo(-ow, bot, 0, bot) // 左→底カーブ
  shape.quadraticCurveTo(ow, bot, ow, 0)   // 底→右カーブ
  shape.lineTo(ow, legH)               // 右脚上
  // 内側 (右上 → 反時計回り = 折り返し)
  shape.lineTo(iw, legH)               // 内右脚上
  shape.lineTo(iw, 0)                  // 内右脚下
  shape.quadraticCurveTo(iw, iBot, 0, iBot) // 内右→底
  shape.quadraticCurveTo(-iw, iBot, -iw, 0) // 内底→左
  shape.lineTo(-iw, legH)              // 内左脚上
  shape.closePath()
  return shape
}

// ── X字型 ──
function makeXShape() {
  const s = new THREE.Shape()
  const a = 0.42, b = 0.1
  s.moveTo(-b, -a); s.lineTo(b, -a); s.lineTo(b, -b)
  s.lineTo(a, -b);  s.lineTo(a, b);  s.lineTo(b, b)
  s.lineTo(b, a);   s.lineTo(-b, a); s.lineTo(-b, b)
  s.lineTo(-a, b);  s.lineTo(-a, -b); s.lineTo(-b, -b)
  s.closePath()
  return s
}

function Scene() {
  const { tileSize, tileGap, opacity: baseOpacity, variant } = useDesignParams()
  const mouse = useSmoothMouse(0.1)
  const uRef = useRef()
  const xRef = useRef()
  // 各タイルの現在回転を保持（lerp 用）
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
    const ox = -(cols * cellSize) / 2
    const oy = -(rows * cellSize) / 2
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

  // ベベル設定を含む ExtrudeGeometry
  const uGeo = useMemo(() => new THREE.ExtrudeGeometry(makeUShape(), {
    depth: v.depth,
    bevelEnabled: v.bevel > 0,
    bevelThickness: v.bevel,
    bevelSize: v.bevel,
    bevelSegments: v.bevel > 0 ? 3 : 0,
  }), [v.depth, v.bevel])

  const xGeo = useMemo(() => new THREE.ExtrudeGeometry(makeXShape(), {
    depth: v.depth,
    bevelEnabled: v.bevel > 0,
    bevelThickness: v.bevel,
    bevelSize: v.bevel,
    bevelSegments: v.bevel > 0 ? 3 : 0,
  }), [v.depth, v.bevel])

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: v.color, metalness: v.metal, roughness: v.rough,
    transparent: v.opacity < 1, opacity: Math.min(v.opacity, baseOpacity * 15),
    wireframe: v.wire, side: THREE.DoubleSide,
    emissive: new THREE.Color(v.emissive),
    emissiveIntensity: v.emInt,
  }), [v, baseOpacity])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const lerp = (a, b, t) => a + (b - a) * t

  // ── 毎フレーム: 球体回転モデル ──
  useFrame(() => {
    const mx = mouse.current.x
    const my = mouse.current.y

    // 回転配列を初期化
    if (uRots.current.length !== uTiles.length) {
      uRots.current = uTiles.map(t => ({ rx: 0, ry: 0, rz: t.baseRot }))
    }
    if (xRots.current.length !== xTiles.length) {
      xRots.current = xTiles.map(t => ({ rx: 0, ry: 0, rz: t.baseRot }))
    }

    const updateInstances = (ref, tilesArr, rots) => {
      if (!ref.current) return
      tilesArr.forEach((t, i) => {
        const dx = mx - t.screenX
        const dy = my - t.screenY
        const dist = Math.sqrt(dx * dx + dy * dy)

        let targetRx = 0, targetRy = 0, targetRz = t.baseRot

        if (dist < RADIUS) {
          const influence = 1 - dist / RADIUS
          const angle = Math.atan2(dy, dx)

          // Z軸: SVGと同様、カーソル方向に回転 (メイン)
          targetRz = t.baseRot + angle * influence * 0.6

          // X/Y軸: 球体表面の傾き (サブ、3D感を出す)
          targetRx = Math.sin(angle) * influence * 0.4
          targetRy = -Math.cos(angle) * influence * 0.4
        }

        // lerp で滑らかに補間
        const r = rots[i]
        r.rx = lerp(r.rx, targetRx, 0.08)
        r.ry = lerp(r.ry, targetRy, 0.08)
        r.rz = lerp(r.rz, targetRz, 0.08)

        dummy.position.set(t.px, t.py, 0)
        dummy.rotation.set(r.rx, r.ry, r.rz)
        dummy.scale.setScalar(symScale)
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      })
      ref.current.instanceMatrix.needsUpdate = true
    }

    updateInstances(uRef, uTiles, uRots.current)
    updateInstances(xRef, xTiles, xRots.current)
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
  const w = window.innerWidth / PX / 2
  const h = window.innerHeight / PX / 2
  useMemo(() => {
    camera.left = -w; camera.right = w; camera.top = h; camera.bottom = -h
    camera.near = -100; camera.far = 100
    camera.position.set(0, 0, 10)
    camera.updateProjectionMatrix()
  }, [camera, w, h])
  return null
}

export default function TileGrid3D() {
  return (
    <div className="tile-grid-3d">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 1, near: -100, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
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
