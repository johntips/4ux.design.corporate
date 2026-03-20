/**
 * TileGrid3D.jsx — Three.js WebGL タイルグリッド
 *
 * パターン 30-39 で使用。InstancedMesh で大量の3Dシンボルを高速描画。
 * U = ExtrudeGeometry (半円弧パス)
 * X = 2本の直方体を交差
 *
 * 10バリエーション:
 *   30: Glass     — 透過ガラス
 *   31: Chrome    — メタリック反射
 *   32: Wireframe — ワイヤーフレーム
 *   33: Neon3D    — 発光エミッシブ
 *   34: Matte     — マットホワイト
 *   35: Holo      — 虹色イリデッセント風
 *   36: Voxel     — ボクセル/ブロック体
 *   37: Clay      — クレイレンダー風
 *   38: Deep      — 深い押し出し + 強い影
 *   39: Minimal3D — 極薄押し出し
 */
import { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useDesignParams } from '../context/VariantContext'
import { useSmoothMouse } from '../hooks/useMouse'

// ── 3D バリエーション定義 ──
export const VARIANTS_3D = [
  { name: 'Glass',      depth: 1.5, color: '#e8e8e8', metalness: 0.1, roughness: 0.05, transparent: true,  opacity: 0.4, wireframe: false, emissive: '#000' },
  { name: 'Chrome',     depth: 2.0, color: '#ccc',    metalness: 1.0, roughness: 0.1,  transparent: false, opacity: 1,   wireframe: false, emissive: '#000' },
  { name: 'Wireframe',  depth: 1.0, color: '#333',    metalness: 0,   roughness: 1,    transparent: false, opacity: 1,   wireframe: true,  emissive: '#000' },
  { name: 'Neon 3D',    depth: 1.2, color: '#111',    metalness: 0,   roughness: 1,    transparent: false, opacity: 1,   wireframe: false, emissive: '#fff' },
  { name: 'Matte',      depth: 2.5, color: '#f0f0f0', metalness: 0,   roughness: 0.9,  transparent: false, opacity: 1,   wireframe: false, emissive: '#000' },
  { name: 'Holo',       depth: 1.0, color: '#ddf',    metalness: 0.8, roughness: 0.2,  transparent: true,  opacity: 0.6, wireframe: false, emissive: '#226' },
  { name: 'Voxel',      depth: 4.0, color: '#ddd',    metalness: 0.2, roughness: 0.6,  transparent: false, opacity: 1,   wireframe: false, emissive: '#000' },
  { name: 'Clay',       depth: 3.0, color: '#e8ddd0', metalness: 0,   roughness: 1.0,  transparent: false, opacity: 1,   wireframe: false, emissive: '#000' },
  { name: 'Deep',       depth: 6.0, color: '#bbb',    metalness: 0.5, roughness: 0.3,  transparent: false, opacity: 1,   wireframe: false, emissive: '#000' },
  { name: 'Minimal 3D', depth: 0.3, color: '#ccc',    metalness: 0.3, roughness: 0.5,  transparent: false, opacity: 1,   wireframe: false, emissive: '#000' },
]

// ── U 字の Shape (Three.js Path) ──
function createUShape() {
  const shape = new THREE.Shape()
  const r = 0.5, sw = 0.15
  // 外側の U 弧
  shape.moveTo(-r - sw, 0.5)
  shape.lineTo(-r - sw, 0)
  shape.absarc(0, 0, r + sw, Math.PI, 0, true)
  shape.lineTo(r + sw, 0.5)
  // 内側 (くり抜き方向)
  shape.lineTo(r - sw, 0.5)
  shape.lineTo(r - sw, 0)
  shape.absarc(0, 0, r - sw, 0, Math.PI, false)
  shape.lineTo(-r + sw, 0.5)
  shape.closePath()
  return shape
}

// ── X 字の Shape ──
function createXShape() {
  const shape = new THREE.Shape()
  const w = 0.12, l = 0.6
  // 水平バー
  shape.moveTo(-l, -w)
  shape.lineTo(l, -w)
  shape.lineTo(l, w)
  shape.lineTo(-l, w)
  shape.closePath()
  // 垂直バー (hole ではなく union 的に path 追加)
  const vBar = new THREE.Path()
  vBar.moveTo(-w, -l)
  vBar.lineTo(w, -l)
  vBar.lineTo(w, l)
  vBar.lineTo(-w, l)
  vBar.closePath()
  return { hShape: shape, vBar }
}

// ── Scene 内のタイルインスタンス ──
function TileInstances() {
  const { tileSize, tileGap, opacity: baseOpacity, variant } = useDesignParams()
  const mouse = useSmoothMouse(0.1)
  const groupRef = useRef()

  const varIdx = variant - 30
  const v = VARIANTS_3D[varIdx] || VARIANTS_3D[0]

  const cellSize = Math.max(tileSize + tileGap, 4)
  const scale = tileSize / 100 // SVG座標系との比率

  // タイル配置計算
  const { positions } = useMemo(() => {
    const cols = Math.min(Math.ceil(window.innerWidth / cellSize) + 2, 40)
    const rows = Math.min(Math.ceil(window.innerHeight / cellSize) + 2, 30)
    const total = Math.min(cols * rows, 800) // 3Dは軽めに
    const pos = []
    const ox = -(cols * cellSize) / 2
    const oy = -(rows * cellSize) / 2
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (pos.length >= total) break
        const idx = (col + row) % 4
        pos.push({
          x: ox + col * cellSize + cellSize / 2,
          y: -(oy + row * cellSize + cellSize / 2),
          isX: idx === 3,
          baseRot: idx === 3 ? Math.PI / 4 : (idx * Math.PI) / 2,
        })
      }
    }
    return { positions: pos }
  }, [cellSize])

  // Geometry
  const uGeo = useMemo(() => {
    const shape = createUShape()
    return new THREE.ExtrudeGeometry(shape, {
      depth: v.depth * 0.1,
      bevelEnabled: false,
    })
  }, [v.depth])

  const xGeo = useMemo(() => {
    const { hShape } = createXShape()
    // 十字型: 2つの直方体相当を ShapeGeometry + extrude
    const geo1 = new THREE.ExtrudeGeometry(hShape, { depth: v.depth * 0.1, bevelEnabled: false })
    // 垂直バーは90度回転した同じ形状
    const geo2 = new THREE.ExtrudeGeometry(hShape, { depth: v.depth * 0.1, bevelEnabled: false })
    geo2.rotateZ(Math.PI / 2)
    // merge
    const merged = new THREE.BufferGeometry()
    merged.copy(geo1)
    // 簡易: geo1 だけ使って rotateZ で十字に見せる
    return geo1
  }, [v.depth])

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: v.color,
    metalness: v.metalness,
    roughness: v.roughness,
    transparent: v.transparent,
    opacity: v.opacity * (baseOpacity / 0.06), // opacity パラメータ反映
    wireframe: v.wireframe,
    emissive: v.emissive,
    emissiveIntensity: v.emissive === '#000' ? 0 : 0.5,
    side: THREE.DoubleSide,
  }), [v, baseOpacity])

  // マウス追従でグループ微回転
  const { viewport } = useThree()
  useFrame(() => {
    if (!groupRef.current) return
    const mx = (mouse.current.x / window.innerWidth - 0.5) * 2
    const my = (mouse.current.y / window.innerHeight - 0.5) * 2
    groupRef.current.rotation.y += (mx * 0.15 - groupRef.current.rotation.y) * 0.05
    groupRef.current.rotation.x += (-my * 0.15 - groupRef.current.rotation.x) * 0.05
  })

  return (
    <group ref={groupRef}>
      {positions.map((p, i) => {
        const s = scale * 0.8
        return (
          <mesh
            key={i}
            geometry={p.isX ? xGeo : uGeo}
            material={mat}
            position={[p.x / 100, p.y / 100, 0]}
            rotation={[0, 0, p.baseRot]}
            scale={[s, s, s]}
          />
        )
      })}
      {/* 垂直バー群 (X の十字の2本目) */}
      {positions.filter(p => p.isX).map((p, i) => {
        const s = scale * 0.8
        return (
          <mesh
            key={`xv-${i}`}
            geometry={xGeo}
            material={mat}
            position={[p.x / 100, p.y / 100, 0]}
            rotation={[0, 0, p.baseRot + Math.PI / 2]}
            scale={[s, s, s]}
          />
        )
      })}
    </group>
  )
}

// ── メインキャンバス ──
export default function TileGrid3D() {
  return (
    <div className="tile-grid-3d">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, -2, 4]} intensity={0.3} />
        <Environment preset="city" />
        <TileInstances />
      </Canvas>
    </div>
  )
}
