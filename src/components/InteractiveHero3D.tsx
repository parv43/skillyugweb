"use client"

import React, { useRef, useState, useEffect, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, useTexture } from "@react-three/drei"
import * as THREE from "three"

// ─── BACKGROUND STARDUST PARTICLES ─────────────────────────────────────────
function BackgroundParticles({ count = 25 }) {
  const points = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 15
      const y = (Math.random() - 0.5) * 15
      const z = (Math.random() - 0.5) * 8 - 4
      const speed = 0.03 + Math.random() * 0.07
      const size = 0.015 + Math.random() * 0.03
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
        child.position.y = p.initialY + Math.sin(time * p.speed + i) * 0.2
        child.position.x = p.position.x + Math.cos(time * p.speed + i) * 0.1
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

// ─── WEBGL-NATIVE ORBITING NODE CARD ───────────────────────────────────────
interface OrbitingNodeProps {
  radius: number
  speed: number
  startOffset: number
  texture: THREE.Texture
  label: string
  cardTexture: THREE.Texture
}

function OrbitingNode({ radius, speed, startOffset, texture, label, cardTexture }: OrbitingNodeProps) {
  const groupRef = useRef<THREE.Group>(null)
  const billboardRef = useRef<THREE.Group>(null)
  const angleRef = useRef(startOffset)
  const [hovered, setHovered] = useState(false)

  // Manage custom cursor on hover
  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = "pointer"
    } else {
      document.body.style.cursor = "auto"
    }
    return () => {
      document.body.style.cursor = "auto"
    }
  }, [hovered])

  useFrame((state, delta) => {
    // 1. Orbit calculations
    angleRef.current += speed * delta
    const currentAngle = angleRef.current

    if (groupRef.current) {
      groupRef.current.position.x = radius * Math.cos(currentAngle)
      groupRef.current.position.y = radius * Math.sin(currentAngle)
      groupRef.current.position.z = 0
    }

    // 2. Billboarding (manually copy camera rotation to face the screen directly)
    if (billboardRef.current) {
      billboardRef.current.quaternion.copy(state.camera.quaternion)
    }

    // 3. Smooth Scale LERP on Hover
    if (groupRef.current) {
      const targetScale = hovered ? 1.15 : 1.0
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15)
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.15)
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.15)
    }
  })

  return (
    <group ref={groupRef}>
      <group 
        ref={billboardRef}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
        }}
      >
        {/* Backing glassmorphic card (enlarged to 0.9 for readability) */}
        <mesh castShadow receiveShadow>
          <planeGeometry args={[0.9, 0.9]} />
          <meshBasicMaterial 
            map={cardTexture} 
            transparent 
            depthWrite={false} 
          />
        </mesh>

        {/* Front SVG icon texture (enlarged to 0.6 and offset slightly forward) */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[0.6, 0.6]} />
          <meshBasicMaterial 
            map={texture} 
            transparent 
            depthWrite={false} 
          />
        </mesh>
      </group>
    </group>
  )
}

// ─── SCENE LOADING CONTENT (SUSPENSE SUPPORTED) ──────────────────────────
function SceneContent() {
  const { width } = useThree((state) => state.viewport)
  
  // 1. Listen to the document dark mode class
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  // 2. Pre-load all SVG textures in WebGL (crisp and cached)
  const textures = useTexture({
    claude: "/claude-ai-icon.svg",
    perplexity: "/perplexity.svg",
    gemini: "/gemini.svg",
    canva: "/canva.svg",
    antigravity: "/antigravity.svg",
    skillyug: "/skillyug.svg",
  })

  // Set correct colorspace for vivid rendering to prevent dark/washed-out textures
  useEffect(() => {
    Object.values(textures).forEach((tex) => {
      if (tex) {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true
      }
    })
  }, [textures])

  // 3. Dynamically draw rounded square card backgrounds (High res 512x512 for crispness)
  const cardTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.clearRect(0, 0, 512, 512)
      
      // Card Shadow
      ctx.shadowColor = isDark ? "rgba(0, 0, 0, 0.45)" : "rgba(0, 0, 0, 0.08)"
      ctx.shadowBlur = 28
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 8

      // White/slate backdrop fill
      ctx.fillStyle = isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.88)"
      const r = 80
      const w = 432
      const h = 432
      const x = 40
      const y = 40
      
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + w, y, x + w, y + h, r)
      ctx.arcTo(x + w, y + h, x, y + h, r)
      ctx.arcTo(x, y + h, x, y, r)
      ctx.arcTo(x, y, x + w, y, r)
      ctx.closePath()
      ctx.fill()

      // Card Border
      ctx.shadowBlur = 0
      ctx.shadowColor = "transparent"
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(226, 232, 240, 0.85)"
      ctx.lineWidth = 10
      ctx.stroke()
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.generateMipmaps = true
    return texture
  }, [isDark])

  // 4. Dynamically draw central logo background circle (High res 512x512)
  const coreLogoBgTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.clearRect(0, 0, 512, 512)
      
      // Backdrop fill
      ctx.fillStyle = isDark ? "rgba(10, 15, 28, 0.8)" : "rgba(255, 255, 255, 0.85)"
      ctx.beginPath()
      ctx.arc(256, 256, 216, 0, Math.PI * 2)
      ctx.closePath()
      ctx.fill()

      // Border
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(226, 232, 240, 0.85)"
      ctx.lineWidth = 10
      ctx.stroke()
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.generateMipmaps = true
    return texture
  }, [isDark])

  // Responsive calculations (enlarged radius and scale bounds)
  const radius = useMemo(() => {
    return Math.min(3.8, width * 0.38)
  }, [width])

  const coreScale = useMemo(() => {
    return Math.min(1.3, width * 0.13)
  }, [width])

  const centralLogoRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (centralLogoRef.current) {
      centralLogoRef.current.quaternion.copy(state.camera.quaternion)
    }
  })

  return (
    <>
      {/* Lights config */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={3.5} color="#ffffff" />
      <pointLight position={[-8, -8, -4]} intensity={2.0} color="#f472b6" distance={15} />
      <pointLight position={[0, 0, 0]} intensity={5.0} color="#818cf8" distance={10} decay={1.5} />

      {/* Interactive OrbitControls */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 1.7}
        minPolarAngle={Math.PI / 3.2}
      />

      {/* Floating Space Particles */}
      <BackgroundParticles count={25} />

      {/* ── CENTRAL REFRACTIVE CORE ── */}
      <group>
        {/* Physical 3D glass core sphere (transmission increased to 0.95 for maximum clarity) */}
        <mesh scale={[coreScale, coreScale, coreScale]}>
          <sphereGeometry args={[1.35, 64, 64]} />
          <meshPhysicalMaterial
            roughness={0.05}
            metalness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            transmission={0.95}
            thickness={1.5}
            transparent
            opacity={0.25}
            color="#ffffff"
          />
        </mesh>
        
        {/* Core Skillyug logo billboard (enlarged and positioned slightly forward for clarity) */}
        <group ref={centralLogoRef} scale={[coreScale, coreScale, coreScale]}>
          {/* Logo Circular Background */}
          <mesh>
            <planeGeometry args={[1.6, 1.6]} />
            <meshBasicMaterial 
              map={coreLogoBgTexture} 
              transparent 
              depthWrite={false} 
            />
          </mesh>
          
          {/* Logo Graphic Decal */}
          <mesh position={[0, 0, 0.035]}>
            <planeGeometry args={[1.15, 1.15]} />
            <meshBasicMaterial 
              map={textures.skillyug} 
              transparent 
              depthWrite={false} 
            />
          </mesh>
        </group>
      </group>

      {/* ── ORBITAL RING 1 (Tilted 45° X) ── */}
      <group rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[radius, 0.006, 8, 120]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.35} />
        </mesh>
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
        
        {/* Orbiting Nodes: Claude & Perplexity */}
        <OrbitingNode 
          radius={radius} 
          speed={0.65} 
          startOffset={0} 
          texture={textures.claude} 
          label="Claude AI" 
          cardTexture={cardTexture}
        />
        <OrbitingNode 
          radius={radius} 
          speed={0.65} 
          startOffset={Math.PI} 
          texture={textures.perplexity} 
          label="Perplexity" 
          cardTexture={cardTexture}
        />
      </group>

      {/* ── ORBITAL RING 2 (Tilted -45° Y) ── */}
      <group rotation={[0, -Math.PI / 4, 0]}>
        <mesh>
          <torusGeometry args={[radius, 0.006, 8, 120]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.35} />
        </mesh>
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
        
        {/* Orbiting Nodes: Gemini & Canva */}
        <OrbitingNode 
          radius={radius} 
          speed={-0.55} 
          startOffset={Math.PI / 2} 
          texture={textures.gemini} 
          label="Google Gemini" 
          cardTexture={cardTexture}
        />
        <OrbitingNode 
          radius={radius} 
          speed={-0.55} 
          startOffset={-Math.PI / 2} 
          texture={textures.canva} 
          label="Canva AI" 
          cardTexture={cardTexture}
        />
      </group>

      {/* ── ORBITAL RING 3 (Horizontal X: 90°) ── */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[radius, 0.006, 8, 120]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.35} />
        </mesh>
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
        
        {/* Orbiting Node: Antigravity */}
        <OrbitingNode 
          radius={radius} 
          speed={0.45} 
          startOffset={0} 
          texture={textures.antigravity} 
          label="Antigravity AI" 
          cardTexture={cardTexture}
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
      <div className="w-full h-[80vh] min-h-[550px] lg:h-full lg:min-h-[700px] flex items-center justify-center bg-transparent">
        {/* Premium skeleton loading spinner */}
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
    <div className="relative w-full h-[80vh] min-h-[550px] lg:h-full lg:min-h-[700px] flex items-center justify-center overflow-hidden">
      <Canvas 
        camera={{ position: [3.5, 2.5, 7.5], fov: 55 }} 
        className="w-full h-full"
      >
        <React.Suspense fallback={null}>
          <SceneContent />
        </React.Suspense>
      </Canvas>
    </div>
  )
}
