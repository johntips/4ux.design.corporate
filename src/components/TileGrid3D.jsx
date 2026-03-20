/**
 * TileGrid3D.jsx — Three.js タイルグリッド
 *
 * U = ランドルト環 (ドーナツ弧 with gap at top) — SVG版と同じ形状
 * X = 十字
 * マウス近接で個別タイルが3D方向に回転
 */
import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDesignParams } from '../context/VariantContext'
import { useSmoothMouse } from '../hooks/useMouse'

const PX = 100
const RADIUS = 200 // マウス影響範囲 (px)

export const VARIANTS_3D = [
  { name: 'Glass',      depth: 0.08, color: '#e8e8e8', metal: 0.1, rough: 0.05, opacity: 0.35, wire: false, emissive: '#000' },
  { name: 'Chrome',     depth: 0.12, color: '#d0d0d0', metal: 1.0, rough: 0.1,  opacity: 1,    wire: false, emissive: '#000' },
  { name: 'Wireframe',  depth: 0.06, color: '#444',    metal: 0,   rough: 1,    opacity: 1,    wire: true,  emissive: '#000' },
  { name: 'Neon 3D',    depth: 0.05, color: '#222',    metal: 0,   rough: 1,    opacity: 1,    wire: false, emissive: '#fff' },
  { name: 'Matte',      depth: 0.15, color: '#f0f0f0', metal: 0,   rough: 0.9,  opacity: 1,    wire: false, emissive: '#000' },
  { name: 'Holo',       depth: 0.06, color: '#ddf',    metal: 0.6, rough: 0.2,  opacity: 0.5,  wire: false, emissive: '#226' },
  { name: 'Voxel',      depth: 0.3,  color: '#ddd',    metal: 0.2, rough: 0.6,  opacity: 1,    wire: false, emissive: '#000' },
  { name: 'Clay',       depth: 0.2,  color: '#e8ddd0', metal: 0,   rough: 1.0,  opacity: 1,    wire: false, emissive: '#000' },
  { name: 'Deep',       depth: 0.4,  color: '#bbb',    metal: 0.5, rough: 0.3,  opacity: 1,    wire: false, emissive: '#000' },
  { name: 'Minimal 3D', depth: 0.02, color: '#ccc',    metal: 0.3, rough: 0.5,  opacity: 1,    wire: false, emissive: '#000' },
]

// ── U: ランドルト環 (厚みのある円弧、上に切れ目) ──
function makeUShape() {
  const shape = new THREE.Shape()
  const outerR = 0.42, innerR = 0.26
  const gapAngle = Math.PI / 2 // 90° gap
  const gapCenter = Math.PI / 2 // top
  const start = gapCenter + gapAngle / 2 // 3PI/4 = gap の左端
  const end = gapCenter - gapAngle / 2   // PI/4  = gap の右端

  // 外弧: start → end (時計回り = gap を避けて下を通る)
  shape.absarc(0, 0, outerR, start, end, true)
  // 内弧: end → start (反時計回り = 戻る)
  shape.absarc(0, 0, innerR, end, start, false)
  shape.closePath()
  return shape
}

// ── X: 十字 ──
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

  const varIdx = variant - 30
  const v = VARIANTS_3D[varIdx] || VARIANTS_3D[0]
  const cellSize = Math.max(tileSize + tileGap, 4)
  const symScale = (tileSize / PX) * 0.5

  // タイル配置
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
          // ピクセル座標 (マウス距離計算用)
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

  const uGeo = useMemo(() =>
    new THREE.ExtrudeGeometry(makeUShape(), { depth: v.depth, bevelEnabled: false }), [v.depth])
  const xGeo = useMemo(() =>
    new THREE.ExtrudeGeometry(makeXShape(), { depth: v.depth, bevelEnabled: false }), [v.depth])

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: v.color, metalness: v.metal, roughness: v.rough,
    transparent: v.opacity < 1, opacity: Math.min(v.opacity, baseOpacity * 15),
    wireframe: v.wire, side: THREE.DoubleSide,
    emissive: new THREE.Color(v.emissive),
    emissiveIntensity: v.emissive === '#000' ? 0 : 0.5,
  }), [v, baseOpacity])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  // 毎フレーム: マウス近接タイルを3D回転
  useFrame(() => {
    const mx = mouse.current.x
    const my = mouse.current.y

    // U instances
    if (uRef.current) {
      uTiles.forEach((t, i) => {
        const dx = mx - t.screenX
        const dy = my - t.screenY
        const dist = Math.sqrt(dx * dx + dy * dy)

        dummy.position.set(t.px, t.py, 0)
        dummy.scale.setScalar(symScale)

        if (dist < RADIUS) {
          const influence = 1 - dist / RADIUS
          const angleToMouse = Math.atan2(dy, dx)
          // マウス方向に3D回転
          dummy.rotation.set(
            -Math.sin(angleToMouse) * influence * 0.8, // X軸
            Math.cos(angleToMouse) * influence * 0.8,   // Y軸
            t.baseRot + angleToMouse * influence * 0.3,  // Z軸 (平面回転)
          )
        } else {
          dummy.rotation.set(0, 0, t.baseRot)
        }

        dummy.updateMatrix()
        uRef.current.setMatrixAt(i, dummy.matrix)
      })
      uRef.current.instanceMatrix.needsUpdate = true
    }

    // X instances
    if (xRef.current) {
      xTiles.forEach((t, i) => {
        const dx = mx - t.screenX
        const dy = my - t.screenY
        const dist = Math.sqrt(dx * dx + dy * dy)

        dummy.position.set(t.px, t.py, 0)
        dummy.scale.setScalar(symScale)

        if (dist < RADIUS) {
          const influence = 1 - dist / RADIUS
          const angleToMouse = Math.atan2(dy, dx)
          dummy.rotation.set(
            -Math.sin(angleToMouse) * influence * 0.8,
            Math.cos(angleToMouse) * influence * 0.8,
            t.baseRot + angleToMouse * influence * 0.3,
          )
        } else {
          dummy.rotation.set(0, 0, t.baseRot)
        }

        dummy.updateMatrix()
        xRef.current.setMatrixAt(i, dummy.matrix)
      })
      xRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <>
      {uTiles.length > 0 && (
        <instancedMesh ref={uRef} args={[uGeo, mat, uTiles.length]} />
      )}
      {xTiles.length > 0 && (
        <instancedMesh ref={xRef} args={[xGeo, mat, xTiles.length]} />
      )}
    </>
  )
}

function OrthoSetup() {
  const { camera } = useThree()
  const w = window.innerWidth / PX / 2
  const h = window.innerHeight / PX / 2
  useMemo(() => {
    camera.left = -w; camera.right = w
    camera.top = h; camera.bottom = -h
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
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={0.9} />
        <directionalLight position={[-2, -1, 3]} intensity={0.3} />
        <Scene />
      </Canvas>
    </div>
  )
}
