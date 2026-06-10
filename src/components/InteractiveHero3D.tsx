"use client"

import React, { useRef, useState, useEffect, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

// ─── LOCAL ORBITING NODE ──────────────────────────────────────────────────
interface OrbitingNodeProps {
  radius: number
  speed: number
  startOffset: number
  svgSrc: string
  label: string
}

function OrbitingNode({ radius, speed, startOffset, svgSrc, label }: OrbitingNodeProps) {
  const groupRef = useRef<THREE.Group>(null)
  const angleRef = useRef(startOffset)

  useFrame((state, delta) => {
    // Increment angle based on speed and delta time
    angleRef.current += speed * delta
    const currentAngle = angleRef.current

    if (groupRef.current) {
      // Orbit in the local XY plane
      groupRef.current.position.x = radius * Math.cos(currentAngle)
      groupRef.current.position.y = radius * Math.sin(currentAngle)
      groupRef.current.position.z = 0
    }
  })

  return (
    <group ref={groupRef}>
      {/* 
        We omit "transform" so Drei's HTML node projects onto the 2D viewport overlay.
        This provides perfect billboarding (facing camera directly) without skewing or perspective distortion.
      */}
      <Html center>
        <div 
          className="group/node w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-white/10 p-2.5 shadow-md hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto cursor-pointer select-none"
          title={label}
        >
          <img 
            src={svgSrc} 
            alt={label} 
            className="w-full h-full object-contain transition-transform group-hover/node:scale-105 duration-300" 
          />
        </div>
      </Html>
    </group>
  )
}

// ─── THREE SCENE CONTENT ──────────────────────────────────────────────────
function SceneContent() {
  const { width } = useThree((state) => state.viewport)

  // Dynamically compute orbit radius based on viewport width for responsiveness
  const radius = useMemo(() => {
    return Math.min(3.4, width * 0.35)
  }, [width])

  // Center core sphere scale
  const coreScale = useMemo(() => {
    return Math.min(1.2, width * 0.12)
  }, [width])

  return (
    <>
      {/* Ambient Lighting */}
      <ambientLight intensity={1.5} />
      
      {/* Soft Directional & Point Lighting */}
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#818cf8" />
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#a78bfa" distance={8} />

      {/* Orbit Controls for Premium Interactivity */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.4}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3.0}
      />

      {/* ── CENTRAL CORE ── */}
      <group>
        {/* Glow Sphere */}
        <mesh scale={[coreScale, coreScale, coreScale]}>
          <sphereGeometry args={[1.3, 64, 64]} />
          <meshPhysicalMaterial
            roughness={0.1}
            metalness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            transmission={0.85}
            thickness={1.5}
            transparent
            opacity={0.35}
            color="#ffffff"
          />
        </mesh>
        
        {/* Central Logo */}
        <Html center>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-white/45 dark:bg-slate-950/45 backdrop-blur-xl border border-slate-200/50 dark:border-white/20 p-3 shadow-xl select-none pointer-events-none">
            <img 
              src="/skillyug.svg" 
              alt="Skillyug Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
        </Html>
      </group>

      {/* ── ORBITAL RING 1 (Tilted 45° X) ── */}
      <group rotation={[Math.PI / 4, 0, 0]}>
        {/* Torus Geometry representing the thin line */}
        <mesh>
          <torusGeometry args={[radius, 0.012, 16, 120]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.15} />
        </mesh>
        
        {/* Orbiting Nodes: Claude & Perplexity */}
        <OrbitingNode 
          radius={radius} 
          speed={0.22} 
          startOffset={0} 
          svgSrc="/claude-ai-icon.svg" 
          label="Claude AI" 
        />
        <OrbitingNode 
          radius={radius} 
          speed={0.22} 
          startOffset={Math.PI} 
          svgSrc="/perplexity.svg" 
          label="Perplexity" 
        />
      </group>

      {/* ── ORBITAL RING 2 (Tilted -45° Y) ── */}
      <group rotation={[0, -Math.PI / 4, 0]}>
        <mesh>
          <torusGeometry args={[radius, 0.012, 16, 120]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.15} />
        </mesh>
        
        {/* Orbiting Nodes: Gemini & Canva */}
        <OrbitingNode 
          radius={radius} 
          speed={-0.18} 
          startOffset={Math.PI / 2} 
          svgSrc="/gemini.svg" 
          label="Google Gemini" 
        />
        <OrbitingNode 
          radius={radius} 
          speed={-0.18} 
          startOffset={-Math.PI / 2} 
          svgSrc="/canva.svg" 
          label="Canva AI" 
        />
      </group>

      {/* ── ORBITAL RING 3 (Horizontal X: 90°) ── */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[radius, 0.012, 16, 120]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.15} />
        </mesh>
        
        {/* Orbiting Node: Antigravity */}
        <OrbitingNode 
          radius={radius} 
          speed={0.15} 
          startOffset={0} 
          svgSrc="/antigravity.svg" 
          label="Antigravity AI" 
        />
      </group>
    </>
  )
}

// ─── MAIN RESPONSIVE HERO CANVAS ──────────────────────────────────────────
export default function InteractiveHero3D() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-[70vh] min-h-[500px] lg:h-full lg:min-h-[600px] flex items-center justify-center bg-transparent">
        {/* Premium glowing skeleton state */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full border-2 border-slate-200 dark:border-white/10 animate-pulse flex items-center justify-center p-2">
            <img 
              src="/skillyug.svg" 
              alt="Loading" 
              className="w-full h-full object-contain opacity-40" 
            />
          </div>
          <div className="absolute w-32 h-32 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] lg:h-full lg:min-h-[600px] flex items-center justify-center overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 8.5], fov: 55 }} 
        className="w-full h-full"
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
