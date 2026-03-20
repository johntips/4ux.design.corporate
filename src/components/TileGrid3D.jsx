/**
 * TileGrid3D.jsx — Three.js WebGL タイルグリッド
 *
 * OrthographicCamera でピクセル座標系に合わせる。
 * 1 Three.js unit = 1px (÷PX_SCALE で縮小)
 * SVG グリッドと同じ配置ロジック。
 */
import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDesignParams } from '../context/VariantContext'
import { useSmoothMouse } from '../hooks/useMouse'

// 1px = 1/PX unit にスケール（数値を扱いやすくする）
const PX = 100

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

// ── U 字 Shape (半径0.5の単位円ベース → scale で tileSize に合わせる) ──
function makeUShape() {
  const s = new THREE.Shape()
  const o = 0.42, n = 0.28
  s.moveTo(-o, 0.35)
  s.lineTo(-o, 0)
  s.absarc(0, 0, o, Math.PI, 0, true)
  s.lineTo(o, 0.35)
  s.lineTo(n, 0.35)
  s.lineTo(n, 0)
  s.absarc(0, 0, n, 0, Math.PI, false)
  s.lineTo(-n, 0.35)
  s.closePath()
  return s
}

// ── X 字 Shape ──
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
  const groupRef = useRef()
  const uRef = useRef()
  const xRef = useRef()

  const varIdx = variant - 30
  const v = VARIANTS_3D[varIdx] || VARIANTS_3D[0]
  const cellSize = Math.max(tileSize + tileGap, 4)

  // タイル配置 (ピクセル座標 → Three.js 単位)
  const { uPos, xPos } = useMemo(() => {
    const w = window.innerWidth, h = window.innerHeight
    const cols = Math.min(Math.ceil(w / cellSize) + 2, 30)
    const rows = Math.min(Math.ceil(h / cellSize) + 2, 20)
    const total = Math.min(cols * rows, 600)
    const u = [], x = []
    // グリッドの中心をスクリーン中心に合わせる
    const ox = -(cols * cellSize) / 2
    const oy = -(rows * cellSize) / 2
    let count = 0
    for (let row = 0; row < rows && count < total; row++) {
      for (let col = 0; col < cols && count < total; col++) {
        const idx = (col + row) % 4
        // ピクセル座標 → Three.js 単位 (y は反転)
        const px = (ox + col * cellSize + cellSize / 2) / PX
        const py = -(oy + row * cellSize + cellSize / 2) / PX
        const rot = idx === 3 ? Math.PI / 4 : (idx * Math.PI) / 2
        if (idx === 3) x.push({ x: px, y: py, rot })
        else u.push({ x: px, y: py, rot })
        count++
      }
    }
    return { uPos: u, xPos: x }
  }, [cellSize])

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

  // シンボルのスケール: tileSize px → tileSize/PX Three.js 単位
  // Shape は -0.42~0.42 = 幅0.84 なので、tileSize/PX / 0.84 * 0.4 で収まるサイズに
  const symScale = (tileSize / PX) * 0.5
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const updateKey = `${varIdx}-${symScale}-${v.depth}-${cellSize}`
  const lastKey = useRef('')

  useFrame(() => {
    if (!groupRef.current) return

    if (updateKey !== lastKey.current) {
      if (uRef.current && uPos.length > 0) {
        uPos.forEach((p, i) => {
          dummy.position.set(p.x, p.y, 0)
          dummy.rotation.set(0, 0, p.rot)
          dummy.scale.setScalar(symScale)
          dummy.updateMatrix()
          uRef.current.setMatrixAt(i, dummy.matrix)
        })
        uRef.current.instanceMatrix.needsUpdate = true
      }
      if (xRef.current && xPos.length > 0) {
        xPos.forEach((p, i) => {
          dummy.position.set(p.x, p.y, 0)
          dummy.rotation.set(0, 0, p.rot)
          dummy.scale.setScalar(symScale)
          dummy.updateMatrix()
          xRef.current.setMatrixAt(i, dummy.matrix)
        })
        xRef.current.instanceMatrix.needsUpdate = true
      }
      lastKey.current = updateKey
    }

    // マウス追従で微回転
    const mx = (mouse.current.x / window.innerWidth - 0.5) * 2
    const my = (mouse.current.y / window.innerHeight - 0.5) * 2
    groupRef.current.rotation.y += (mx * 0.1 - groupRef.current.rotation.y) * 0.04
    groupRef.current.rotation.x += (-my * 0.1 - groupRef.current.rotation.x) * 0.04
  })

  return (
    <group ref={groupRef}>
      {uPos.length > 0 && (
        <instancedMesh key={`u-${updateKey}`} ref={uRef} args={[uGeo, mat, uPos.length]} />
      )}
      {xPos.length > 0 && (
        <instancedMesh key={`x-${updateKey}`} ref={xRef} args={[xGeo, mat, xPos.length]} />
      )}
    </group>
  )
}

// ── OrthographicCamera でピクセル座標に近いビューを作る ──
function OrthoCamera() {
  const { camera } = useThree()
  const w = window.innerWidth / PX / 2
  const h = window.innerHeight / PX / 2
  useMemo(() => {
    camera.left = -w
    camera.right = w
    camera.top = h
    camera.bottom = -h
    camera.near = -100
    camera.far = 100
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
        <OrthoCamera />
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={0.9} />
        <directionalLight position={[-2, -1, 3]} intensity={0.3} />
        <Scene />
      </Canvas>
    </div>
  )
}
