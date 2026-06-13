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

// ─── WEBGL-NATIVE BILLBOARDED ORBITING NODE ────────────────────────────────
interface OrbitingNodeProps {
  radius: number
  speed: number
  startOffset: number
  alpha: number
  tilt: number
  texture: THREE.Texture
  label: string
  cardTexture: THREE.Texture
}

function OrbitingNode({ radius, speed, startOffset, alpha, tilt, texture, label, cardTexture }: OrbitingNodeProps) {
  const groupRef = useRef<THREE.Group>(null)
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
    angleRef.current += speed * delta
    const t = angleRef.current

    if (groupRef.current) {
      // ── Core orbital math: parametric ellipse in screen XY plane ──
      const a = radius          // semi-major axis (full radius)
      const b = radius * tilt   // semi-minor axis (controls ellipse squish)

      // Rotate the parametric ellipse by alpha degrees in screen space
      const localX = a * Math.cos(t) * Math.cos(alpha) - b * Math.sin(t) * Math.sin(alpha)
      const localY = a * Math.cos(t) * Math.sin(alpha) + b * Math.sin(t) * Math.cos(alpha)
      const localZ = 0  // stays in screen plane — no depth needed

      groupRef.current.position.set(localX, localY, localZ)

      // ── Billboarding: always face camera ──
      groupRef.current.quaternion.copy(state.camera.quaternion)

      // ── Smooth scale LERP on hover ──
      const targetScale = hovered ? 1.15 : 1.0
      const lerpFactor = 0.15
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, lerpFactor)
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, lerpFactor)
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, lerpFactor)
    }
  })

  return (
    <group 
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
      }}
    >
      {/* Backing glassmorphic card (renderOrder enforced for overlay layering) */}
      <mesh castShadow receiveShadow renderOrder={4}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshBasicMaterial 
          map={cardTexture} 
          transparent 
          depthWrite={true} 
        />
      </mesh>

      {/* Front SVG icon texture (renderOrder and Z-offset ensure it draws on top) */}
      <mesh position={[0, 0, 0.025]} renderOrder={5}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial 
          map={texture} 
          transparent 
          depthWrite={true} 
        />
      </mesh>
    </group>
  )
}

// ─── SCENE LOADING CONTENT (SUSPENSE SUPPORTED) ──────────────────────────
const ORBIT_CONFIGS = [
  { 
    alpha: 0, 
    tilt: 0.3, 
    speed: 0.55, 
    colorLight: "#818cf8", 
    colorDark: "#a5b4fc", 
    emissiveLight: "#6366f1", 
    emissiveDark: "#4f46e5", 
    label1: "Claude AI", 
    label2: "Perplexity", 
    texKey1: "claude" as const, 
    texKey2: "perplexity" as const 
  },
  { 
    alpha: Math.PI / 3, 
    tilt: 0.3, 
    speed: -0.50, 
    colorLight: "#ec4899", 
    colorDark: "#fbcfe8", 
    emissiveLight: "#db2777", 
    emissiveDark: "#be185d", 
    label1: "Google Gemini", 
    label2: "Canva AI", 
    texKey1: "gemini" as const, 
    texKey2: "canva" as const 
  },
  { 
    alpha: 2 * Math.PI / 3, 
    tilt: 0.3, 
    speed: 0.48, 
    colorLight: "#a855f7", 
    colorDark: "#e9d5ff", 
    emissiveLight: "#9333ea", 
    emissiveDark: "#7e22ce", 
    label1: "Antigravity AI", 
    label2: "Figma", 
    texKey1: "antigravity" as const, 
    texKey2: "figma" as const 
  },
]

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

  // 2. Pre-load all SVG and PNG textures in WebGL (crisp and cached)
  const textures = useTexture({
    claude: "/claude-ai-icon.svg",
    perplexity: "/perplexity.svg",
    gemini: "/gemini.svg",
    canva: "/canva.svg",
    antigravity: "/antigravity.svg",
    skillyug: "/skillyug.png",
    figma: "/figma.svg",
  })

  // Set correct colorspace for vivid rendering to prevent dark/washed-out textures
  useEffect(() => {
    Object.values(textures).forEach((tex) => {
      if (tex) {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true
      }
    })

    // Zoom in on the central Skillyug logo to fill the circle geometry from edge to edge
    if (textures.skillyug) {
      textures.skillyug.repeat.set(0.75, 0.75) // Zoom in by ~33%
      textures.skillyug.offset.set(0.125, 0.125) // Center the zoom window
      textures.skillyug.wrapS = THREE.ClampToEdgeWrapping
      textures.skillyug.wrapT = THREE.ClampToEdgeWrapping
      textures.skillyug.needsUpdate = true
    }
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

  // (coreLogoBgTexture removed)

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
      <pointLight position={[0, 0, 0]} intensity={2.0} color="#818cf8" distance={10} decay={1.5} />

      {/* Interactive OrbitControls */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        maxPolarAngle={Math.PI / 1.7}
        minPolarAngle={Math.PI / 3.2}
      />

      {/* Floating Space Particles */}
      <BackgroundParticles count={25} />

      {/* ── CENTRAL REFRACTIVE CORE ── */}
      <group>
        {/* Physical 3D glass core sphere (depthWrite={false} to not block the logo) */}
        <mesh scale={[coreScale, coreScale, coreScale]} renderOrder={1}>
          <sphereGeometry args={[1.35, 64, 64]} />
          <meshPhysicalMaterial
            roughness={0.1}
            metalness={0.15}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            transparent={true}
            opacity={0.06}
            depthWrite={false}
            color={isDark ? "#c7d2fe" : "#ffffff"}
            emissive={isDark ? "#4338ca" : "#f1f5f9"}
            emissiveIntensity={isDark ? 0.05 : 0.02}
          />
        </mesh>
        
        {/* Core Skillyug logo billboard (floating transparent PNG, rendered on top of the sphere's front face) */}
        <group ref={centralLogoRef} scale={[coreScale, coreScale, coreScale]}>
          {/* White Backing Circle for High Contrast */}
          <mesh position={[0, 0, 0]} renderOrder={2}>
            <circleGeometry args={[1.35, 64]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Logo Graphic Decal */}
          <mesh position={[0, 0, 0.01]} renderOrder={3}>
            <circleGeometry args={[1.35, 64]} />
            <meshBasicMaterial 
              map={textures.skillyug} 
              transparent 
              depthWrite={true} 
              depthTest={true}
            />
          </mesh>
        </group>

        {/* Invisible Depth Mask Sphere (writes to depth buffer for correct node occlusion) */}
        <mesh scale={[coreScale, coreScale, coreScale]} renderOrder={3}>
          <sphereGeometry args={[1.35, 64, 64]} />
          <meshBasicMaterial
            colorWrite={false}
            depthWrite={true}
            transparent={true}
          />
        </mesh>
      </group>

      {/* ── STATIC ORBITAL RINGS (Visually Tilt-Rotated) ── */}
      {ORBIT_CONFIGS.map((config, idx) => (
        <group key={`ring-${idx}`} rotation={[0, 0, config.alpha]} scale={[1, config.tilt, 1]}>
          <mesh>
            <torusGeometry args={[radius, 0.012, 16, 120]} />
            <meshPhysicalMaterial
              roughness={0.2}
              metalness={0.8}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
              transparent={true}
              opacity={isDark ? 0.35 : 0.45}
              depthWrite={false}
              color={isDark ? config.colorDark : config.colorLight}
              emissive={isDark ? config.emissiveDark : config.emissiveLight}
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>
      ))}

      {/* ── ROOT-LEVEL ORBITING NODES ── */}
      {ORBIT_CONFIGS.map((config, idx) => (
        <React.Fragment key={`nodes-${idx}`}>
          <OrbitingNode 
            radius={radius} 
            speed={config.speed} 
            startOffset={0} 
            alpha={config.alpha}
            tilt={config.tilt}
            texture={textures[config.texKey1]} 
            label={config.label1} 
            cardTexture={cardTexture}
          />
          <OrbitingNode 
            radius={radius} 
            speed={config.speed} 
            startOffset={Math.PI} 
            alpha={config.alpha}
            tilt={config.tilt}
            texture={textures[config.texKey2]} 
            label={config.label2} 
            cardTexture={cardTexture}
          />
        </React.Fragment>
      ))}
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
      <div className="w-full h-[80vh] min-h-[550px] lg:h-full lg:min-h-[800px] flex items-center justify-center bg-transparent">
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
    <div className="relative w-full h-[80vh] min-h-[550px] lg:h-full lg:min-h-[800px] flex items-center justify-center overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 8.2], fov: 55 }} 
        className="w-full h-full"
      >
        <React.Suspense fallback={null}>
          <SceneContent />
        </React.Suspense>
      </Canvas>
    </div>
  )
}
