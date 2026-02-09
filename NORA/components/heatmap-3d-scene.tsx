"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import type * as THREE from "three"

interface Heatmap3DSceneProps {
  data: Record<string, { amount: number; intensity: string }>
  weeks: { date: string; dayOfWeek: number }[][]
}

const INTENSITY_COLORS: Record<string, string> = {
  none: "#e5e7eb",
  low: "#86efac",
  medium: "#34d399",
  high: "#10b981",
  "very-high": "#047857",
}

function getBarColor(intensity: string | undefined): string {
  return INTENSITY_COLORS[intensity ?? "none"] ?? INTENSITY_COLORS.none
}

function HeatmapBars({
  data,
  weeks,
}: {
  data: Record<string, { amount: number; intensity: string }>
  weeks: { date: string; dayOfWeek: number }[][]
}) {
  const groupRef = useRef<THREE.Group>(null)

  const maxAmount = useMemo(() => {
    let max = 1
    for (const v of Object.values(data)) {
      if (v.amount > max) max = v.amount
    }
    return max
  }, [data])

  const bars = useMemo(() => {
    const result: {
      x: number
      z: number
      height: number
      color: string
      hasData: boolean
    }[] = []

    const cellSize = 0.18
    const gap = 0.04
    const step = cellSize + gap

    const totalWidth = weeks.length * step
    const totalDepth = 7 * step
    const offsetX = -totalWidth / 2
    const offsetZ = -totalDepth / 2

    for (let weekIdx = 0; weekIdx < weeks.length; weekIdx++) {
      for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const cell = weeks[weekIdx]?.find((c) => c.dayOfWeek === dayIdx)
        const x = offsetX + weekIdx * step
        const z = offsetZ + dayIdx * step

        if (!cell) {
          result.push({ x, z, height: 0, color: INTENSITY_COLORS.none, hasData: false })
          continue
        }

        const cellData = data[cell.date]
        const amount = cellData?.amount ?? 0
        const intensity = cellData?.intensity

        const normalizedHeight = amount > 0 ? 0.1 + (amount / maxAmount) * 2.4 : 0
        const color = getBarColor(intensity)

        result.push({ x, z, height: normalizedHeight, color, hasData: true })
      }
    }

    return result
  }, [data, weeks, maxAmount])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03
    }
  })

  return (
    <group ref={groupRef}>
      {bars
        .filter((b) => b.hasData)
        .map((bar, i) => (
          <group key={`tile-${i}`}>
            <mesh position={[bar.x, 0, bar.z]}>
              <boxGeometry args={[0.16, 0.04, 0.16]} />
              <meshStandardMaterial color={bar.height > 0 ? "#d1d5db" : bar.color} />
            </mesh>
            {bar.height > 0 && (
              <mesh position={[bar.x, bar.height / 2 + 0.02, bar.z]}>
                <boxGeometry args={[0.16, bar.height, 0.16]} />
                <meshStandardMaterial color={bar.color} />
              </mesh>
            )}
          </group>
        ))}
    </group>
  )
}

export function Heatmap3DScene({ data, weeks }: Heatmap3DSceneProps) {
  return (
    <div className="h-[420px] w-full rounded-lg overflow-hidden bg-background">
      <Canvas
        camera={{
          position: [8, 6, 8],
          fov: 35,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1} />
        <directionalLight position={[-5, 10, -5]} intensity={0.3} />

        <HeatmapBars data={data} weeks={weeks} />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={5}
          maxDistance={20}
          minPolarAngle={0.3}
          maxPolarAngle={Math.PI / 2.5}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}
