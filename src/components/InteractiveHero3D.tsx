"use client"

import React, { useRef, useState, useEffect, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

// ─── BACKGROUND STARDUST PARTICLES ─────────────────────────────────────────
function BackgroundParticles({ count = 30 }) {
  const points = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 15
      const y = (Math.random() - 0.5) * 15
      const z = (Math.random() - 0.5) * 10 - 4 // Placed slightly behind the center plane
      const speed = 0.04 + Math.random() * 0.08
      const size = 0.015 + Math.random() * 0.035
      temp.push({ position: new THREE.Vector3(x, y, z), speed, size, initialY: y })
    }
    return temp
  }, [count])

  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        const p = points[i]
        // Gentle drifting motion
        child.position.y = p.initialY + Math.sin(time * p.speed + i) * 0.25
        child.position.x = p.position.x + Math.cos(time * p.speed + i) * 0.15
      })
    }
  })

  return (
    <group ref={ref}>
      {points.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial 
            color="#a78bfa" 
            transparent 
            opacity={0.3} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── DETAILED 3D ORBITING NODE ─────────────────────────────────────────────
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
    // Continuous travel along local orbit
    angleRef.current += speed * delta
    const currentAngle = angleRef.current

    if (groupRef.current) {
      groupRef.current.position.x = radius * Math.cos(currentAngle)
      groupRef.current.position.y = radius * Math.sin(currentAngle)
      groupRef.current.position.z = 0
    }
  })

  return (
    <group ref={groupRef}>
      {/* 
        By enabling 'transform', the HTML element is converted into a CSS3DObject
        which integrates directly into the WebGL depth buffer (occluding behind objects).
        By enabling 'sprite', the HTML container is rotated on every frame to always
        directly face the camera (billboarding).
        By using 'distanceFactor={14}', we force 3D scaling perspective (small when far, large when close)
        while maintaining extremely crisp rendering quality.
      */}
      <Html transform sprite distanceFactor={15}>
        <div 
          className="group/node w-14 h-14 rounded-2xl flex items-center justify-center bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 p-2.5 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto cursor-pointer select-none"
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

  // Dynamically calculate responsive orbit radius
  const radius = useMemo(() => {
    return Math.min(3.5, width * 0.35)
  }, [width])

  // Center core sphere scale
  const coreScale = useMemo(() => {
    return Math.min(1.2, width * 0.12)
  }, [width])

  return (
    <>
      {/* Ambient Fill Light */}
      <ambientLight intensity={0.4} />
      
      {/* High-contrast studio lighting config */}
      <directionalLight position={[5, 10, 5]} intensity={3.5} color="#ffffff" />
      <pointLight position={[-8, -8, -4]} intensity={2.0} color="#f472b6" distance={15} />
      <pointLight position={[0, 0, 0]} intensity={4.5} color="#818cf8" distance={10} decay={1.5} />

      {/* Orbit Controls with dynamic bounds */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.35}
        maxPolarAngle={Math.PI / 1.7}
        minPolarAngle={Math.PI / 3.2}
      />

      {/* Background Floating Particles */}
      <BackgroundParticles count={25} />

      {/* ── CENTRAL REFRACTIVE CORE ── */}
      <group>
        {/* Glowing glass core sphere */}
        <mesh scale={[coreScale, coreScale, coreScale]}>
          <sphereGeometry args={[1.3, 64, 64]} />
          <meshPhysicalMaterial
            roughness={0.05}
            metalness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            transmission={0.9}
            thickness={1.5}
            transparent
            opacity={0.35}
            color="#ffffff"
          />
        </mesh>
        
        {/* Core Skillyug logo embedded inside depth queue */}
        <Html transform sprite distanceFactor={12}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white/45 dark:bg-slate-950/45 backdrop-blur-xl border border-slate-200/30 dark:border-white/20 p-4 shadow-2xl select-none pointer-events-none">
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
        {/* Inner core wire */}
        <mesh>
          <torusGeometry args={[radius, 0.006, 8, 120]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.35} />
        </mesh>
        
        {/* Outer glass-glow tube */}
        <mesh>
          <torusGeometry args={[radius, 0.035, 24, 120]} />
          <meshPhysicalMaterial
            roughness={0.1}
            transmission={0.8}
            thickness={0.5}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            transparent
            opacity={0.25}
            color="#818cf8"
            emissive="#818cf8"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Fast Orbiting Nodes: Claude & Perplexity */}
        <OrbitingNode 
          radius={radius} 
          speed={0.65} 
          startOffset={0} 
          svgSrc="/claude-ai-icon.svg" 
          label="Claude AI" 
        />
        <OrbitingNode 
          radius={radius} 
          speed={0.65} 
          startOffset={Math.PI} 
          svgSrc="/perplexity.svg" 
          label="Perplexity" 
        />
      </group>

      {/* ── ORBITAL RING 2 (Tilted -45° Y) ── */}
      <group rotation={[0, -Math.PI / 4, 0]}>
        {/* Inner core wire */}
        <mesh>
          <torusGeometry args={[radius, 0.006, 8, 120]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.35} />
        </mesh>
        
        {/* Outer glass-glow tube */}
        <mesh>
          <torusGeometry args={[radius, 0.035, 24, 120]} />
          <meshPhysicalMaterial
            roughness={0.1}
            transmission={0.8}
            thickness={0.5}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            transparent
            opacity={0.25}
            color="#818cf8"
            emissive="#818cf8"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Fast Orbiting Nodes: Gemini & Canva */}
        <OrbitingNode 
          radius={radius} 
          speed={-0.55} 
          startOffset={Math.PI / 2} 
          svgSrc="/gemini.svg" 
          label="Google Gemini" 
        />
        <OrbitingNode 
          radius={radius} 
          speed={-0.55} 
          startOffset={-Math.PI / 2} 
          svgSrc="/canva.svg" 
          label="Canva AI" 
        />
      </group>

      {/* ── ORBITAL RING 3 (Horizontal X: 90°) ── */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* Inner core wire */}
        <mesh>
          <torusGeometry args={[radius, 0.006, 8, 120]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.35} />
        </mesh>
        
        {/* Outer glass-glow tube */}
        <mesh>
          <torusGeometry args={[radius, 0.035, 24, 120]} />
          <meshPhysicalMaterial
            roughness={0.1}
            transmission={0.8}
            thickness={0.5}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            transparent
            opacity={0.25}
            color="#818cf8"
            emissive="#818cf8"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Fast Orbiting Node: Antigravity */}
        <OrbitingNode 
          radius={radius} 
          speed={0.45} 
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
        camera={{ position: [3.5, 2.5, 7.5], fov: 55 }} 
        className="w-full h-full"
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
