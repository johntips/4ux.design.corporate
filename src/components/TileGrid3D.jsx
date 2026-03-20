/**
 * TileGrid3D.jsx — 軽量 Three.js WebGL タイルグリッド
 *
 * パターン 30-39。InstancedMesh で高速描画。
 * Environment HDR は使わず、ライトのみでシンプルに。
 */
import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDesignParams } from '../context/VariantContext'
import { useSmoothMouse } from '../hooks/useMouse'

// ── 3D バリエーション定義 ──
export const VARIANTS_3D = [
  { name: 'Glass',      depth: 0.15, color: '#e8e8e8', metal: 0.1, rough: 0.05, opacity: 0.5, wire: false, emissive: '#000' },
  { name: 'Chrome',     depth: 0.2,  color: '#ccc',    metal: 1.0, rough: 0.1,  opacity: 1,   wire: false, emissive: '#000' },
  { name: 'Wireframe',  depth: 0.1,  color: '#555',    metal: 0,   rough: 1,    opacity: 1,   wire: true,  emissive: '#000' },
  { name: 'Neon 3D',    depth: 0.12, color: '#222',    metal: 0,   rough: 1,    opacity: 1,   wire: false, emissive: '#fff' },
  { name: 'Matte',      depth: 0.25, color: '#f0f0f0', metal: 0,   rough: 0.9,  opacity: 1,   wire: false, emissive: '#000' },
  { name: 'Holo',       depth: 0.1,  color: '#ccf',    metal: 0.8, rough: 0.2,  opacity: 0.7, wire: false, emissive: '#114' },
  { name: 'Voxel',      depth: 0.5,  color: '#ddd',    metal: 0.2, rough: 0.6,  opacity: 1,   wire: false, emissive: '#000' },
  { name: 'Clay',       depth: 0.3,  color: '#e8ddd0', metal: 0,   rough: 1.0,  opacity: 1,   wire: false, emissive: '#000' },
  { name: 'Deep',       depth: 0.6,  color: '#bbb',    metal: 0.5, rough: 0.3,  opacity: 1,   wire: false, emissive: '#000' },
  { name: 'Minimal 3D', depth: 0.04, color: '#ccc',    metal: 0.3, rough: 0.5,  opacity: 1,   wire: false, emissive: '#000' },
]

// ── U 字 Shape ──
function makeUShape() {
  const s = new THREE.Shape()
  const outer = 0.5, inner = 0.35, legH = 0.3
  // 外側 U
  s.moveTo(-outer, legH)
  s.lineTo(-outer, 0)
  s.absarc(0, 0, outer, Math.PI, 0, true)
  s.lineTo(outer, legH)
  // 内側 U (くり抜き)
  s.lineTo(inner, legH)
  s.lineTo(inner, 0)
  s.absarc(0, 0, inner, 0, Math.PI, false)
  s.lineTo(-inner, legH)
  s.closePath()
  return s
}

// ── X 字 Shape (十字) ──
function makeXShape() {
  const s = new THREE.Shape()
  const a = 0.5, b = 0.12
  // 十字を1つの Shape で描く
  s.moveTo(-b, -a)
  s.lineTo(b, -a)
  s.lineTo(b, -b)
  s.lineTo(a, -b)
  s.lineTo(a, b)
  s.lineTo(b, b)
  s.lineTo(b, a)
  s.lineTo(-b, a)
  s.lineTo(-b, b)
  s.lineTo(-a, b)
  s.lineTo(-a, -b)
  s.lineTo(-b, -b)
  s.closePath()
  return s
}

// ── InstancedMesh で描画するシーン ──
function Scene() {
  const { tileSize, tileGap, opacity: baseOpacity, variant } = useDesignParams()
  const mouse = useSmoothMouse(0.1)
  const groupRef = useRef()
  const uMeshRef = useRef()
  const xMeshRef = useRef()

  const varIdx = variant - 30
  const v = VARIANTS_3D[varIdx] || VARIANTS_3D[0]
  const cellSize = Math.max(tileSize + tileGap, 4)

  // タイル配置
  const { uPositions, xPositions, cols, rows } = useMemo(() => {
    const c = Math.min(Math.ceil(window.innerWidth / cellSize) + 2, 30)
    const r = Math.min(Math.ceil(window.innerHeight / cellSize) + 2, 20)
    const uPos = [], xPos = []
    const ox = -(c * cellSize) / 200  // Three.js 単位に変換 (/100)
    const oy = -(r * cellSize) / 200

    for (let row = 0; row < r; row++) {
      for (let col = 0; col < c; col++) {
        const idx = (col + row) % 4
        const px = ox + (col * cellSize) / 100 + cellSize / 200
        const py = -(oy + (row * cellSize) / 100 + cellSize / 200)
        const rot = idx === 3 ? Math.PI / 4 : (idx * Math.PI) / 2

        if (idx === 3) {
          xPos.push({ x: px, y: py, rot })
        } else {
          uPos.push({ x: px, y: py, rot })
        }
      }
    }
    return { uPositions: uPos, xPositions: xPos, cols: c, rows: r }
  }, [cellSize])

  // Geometry (メモ化)
  const uGeo = useMemo(() => {
    const shape = makeUShape()
    return new THREE.ExtrudeGeometry(shape, { depth: v.depth, bevelEnabled: false })
  }, [v.depth])

  const xGeo = useMemo(() => {
    const shape = makeXShape()
    return new THREE.ExtrudeGeometry(shape, { depth: v.depth, bevelEnabled: false })
  }, [v.depth])

  // Material
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: v.color,
    metalness: v.metal,
    roughness: v.rough,
    transparent: v.opacity < 1,
    opacity: Math.min(v.opacity, baseOpacity * 16),
    wireframe: v.wire,
    emissive: new THREE.Color(v.emissive),
    emissiveIntensity: v.emissive === '#000' ? 0 : 0.6,
    side: THREE.DoubleSide,
  }), [v, baseOpacity])

  // InstancedMesh のマトリクスを設定
  const scale = tileSize / 130
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // U instances
  useMemo(() => {
    if (!uMeshRef.current) return
    uPositions.forEach((p, i) => {
      dummy.position.set(p.x, p.y, 0)
      dummy.rotation.set(0, 0, p.rot)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      uMeshRef.current.setMatrixAt(i, dummy.matrix)
    })
    uMeshRef.current.instanceMatrix.needsUpdate = true
  }, [uPositions, scale, dummy])

  useMemo(() => {
    if (!xMeshRef.current) return
    xPositions.forEach((p, i) => {
      dummy.position.set(p.x, p.y, 0)
      dummy.rotation.set(0, 0, p.rot)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      xMeshRef.current.setMatrixAt(i, dummy.matrix)
    })
    xMeshRef.current.instanceMatrix.needsUpdate = true
  }, [xPositions, scale, dummy])

  // マウス追従でグループ微回転
  useFrame(() => {
    if (!groupRef.current) return
    const mx = (mouse.current.x / window.innerWidth - 0.5) * 2
    const my = (mouse.current.y / window.innerHeight - 0.5) * 2
    groupRef.current.rotation.y += (mx * 0.12 - groupRef.current.rotation.y) * 0.04
    groupRef.current.rotation.x += (-my * 0.12 - groupRef.current.rotation.x) * 0.04
  })

  return (
    <group ref={groupRef}>
      {uPositions.length > 0 && (
        <instancedMesh ref={uMeshRef} args={[uGeo, mat, uPositions.length]} />
      )}
      {xPositions.length > 0 && (
        <instancedMesh ref={xMeshRef} args={[xGeo, mat, xPositions.length]} />
      )}
    </group>
  )
}

// ── メインキャンバス ──
export default function TileGrid3D() {
  return (
    <div className="tile-grid-3d">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.9} />
        <directionalLight position={[-3, -2, 4]} intensity={0.4} />
        <Scene />
      </Canvas>
    </div>
  )
}
