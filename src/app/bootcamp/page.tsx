"use client"

import { useEffect, useRef, useState } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import Navbar from "@/components/Navbar"
import { BOOK_SLOT_AMOUNT_LABEL } from "@/lib/pricing"

const instructors = [
  {
    name: "Prachi Chandra",
    initials: "PC",
    image: "/Prachi_mam.png",
    title: "AI Trainer & Educator",
    bio: [
      "10+ Years Experience: EdTech leader with a background at Vedantu and Outschool.",
      "CBSE Curriculum Architect: Key curator for the official CBSE AI handbooks.",
      "Proven Impact: Trained thousands of students and teachers globally, specializing in making complex tech concepts simple and practical.",
    ],
  },
  {
    name: "Krupali Busa",
    initials: "KB",
    image: "/Krupali_mam.png",
    title: "Senior Technical Trainer & Educator",
    bio: [
      "13+ Years Experience: Seasoned educator with a deep background spanning from foundational computer science tutoring to corporate tech training.",
      "Industry & Academic Leader: Senior Technical Trainer at a leading global tech firm, backed by over four years of experience as a Senior University Lecturer.",
      "Tech & Content Expert: Specializes in technical content creation, turning complex programming and enterprise cloud technologies into accessible, structured learning.",
    ],
  },
]

const benefits = [
  "Interactive Live Sessions",
  "Hands-on AI Project Building",
  "Mastery of AI tools",
  "Personal Project Reviews & Feedback",
  "Official Skillyug Verified Certification",
  "Doubt Clearing Sessions",
]

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
]


function BootcampSpline() {
  const [shouldLoad, setShouldLoad] = useState(false)

  // Load during browser idle time so Spline doesn't compete with page hydration/paint.
  // Also fires immediately on first user interaction so active users see it faster.
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isMobile = window.matchMedia("(max-width: 767px)").matches
    if (reducedMotion || isMobile) return

    let triggered = false
    const trigger = () => {
      if (triggered) return
      triggered = true
      cleanup() // eslint-disable-line @typescript-eslint/no-use-before-define
      setShouldLoad(true)
    }

    // Strategy 1: idle callback — doesn't compete with hydration (Safari falls back to 500ms timeout)
    let idleId: number
    if ("requestIdleCallback" in window) {
      idleId = requestIdleCallback(trigger, { timeout: 2000 })
    } else {
      idleId = setTimeout(trigger, 500) as unknown as number
    }

    // Strategy 2: also fire on first user intent for faster load on active users
    window.addEventListener("mousemove", trigger, { once: true, passive: true })
    window.addEventListener("scroll", trigger, { once: true, passive: true })
    window.addEventListener("touchstart", trigger, { once: true, passive: true })

    function cleanup() {
      if ("cancelIdleCallback" in window) {
        cancelIdleCallback(idleId as number)
      } else {
        clearTimeout(idleId as unknown as ReturnType<typeof setTimeout>)
      }
      window.removeEventListener("mousemove", trigger)
      window.removeEventListener("scroll", trigger)
      window.removeEventListener("touchstart", trigger)
    }

    return cleanup
  }, [])

  return (
    <div
      className="pointer-events-auto absolute inset-0"
      style={{ willChange: "transform" }}
    >
      {shouldLoad ? (
        // iframe loads Spline in a separate browsing context:
        // zero JS bundle impact, scroll NOT blocked, hover effects work normally.
        <iframe
          title="Skillyug AI bootcamp 3D model"
          src="/spline-bootcamp.html"
          className="h-full w-full border-0"
          loading="lazy"
          allow="autoplay; fullscreen"
        />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(circle_at_54%_42%,rgba(168,85,247,0.06),transparent_28%),radial-gradient(circle_at_62%_56%,rgba(37,99,235,0.04),transparent_34%)]" />
      )}
    </div>
  )
}
function EnrollmentCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const cardStyle = {
    "--rx": "0deg",
    "--ry": "0deg",
    "--mx": "50%",
    "--my": "35%",
  } as CSSProperties & Record<`--${string}`, string>

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    card.style.setProperty("--rx", `${(0.5 - y) * 9}deg`)
    card.style.setProperty("--ry", `${(x - 0.5) * 11}deg`)
    card.style.setProperty("--mx", `${x * 100}%`)
    card.style.setProperty("--my", `${y * 100}%`)
  }

  const handlePointerLeave = () => {
    const card = cardRef.current
    if (!card) return

    card.style.setProperty("--rx", "0deg")
    card.style.setProperty("--ry", "0deg")
    card.style.setProperty("--mx", "50%")
    card.style.setProperty("--my", "35%")
  }

  return (
    <div className="mx-auto w-full max-w-3xl [perspective:1400px]">
      <div
        ref={cardRef}
        style={cardStyle}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="group relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0f1c]/95 shadow-lg shadow-purple-500/[0.03] backdrop-blur-xl transition-transform duration-200 ease-out will-change-transform [transform:perspective(1400px)_rotateX(var(--rx))_rotateY(var(--ry))] [transform-style:preserve-3d]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--mx)_var(--my),rgba(168,85,247,0.08),transparent_34%)] opacity-90" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),transparent_28%,rgba(59,130,246,0.08)_68%,transparent)]" />
        <div className="relative p-4 sm:p-6">
          <div className="relative h-72 overflow-hidden rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.08),transparent_30%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_55%,#e0e7ff_100%)] dark:bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.15),transparent_30%),linear-gradient(135deg,#0a0f1c_0%,#0f172a_55%,#020617_100%)] shadow-sm [transform:translateZ(42px)]">
            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] [background-size:34px_34px]" />
            <div className="absolute left-1/2 top-[46%] h-48 w-[34rem] -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.08),rgba(37,99,235,0.06)_38%,rgba(168,85,247,0.04)_55%,transparent_72%)] blur-sm transition duration-500 group-hover:rotate-[-7deg]" />
            <div className="absolute left-1/2 top-[47%] h-44 w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-200/40 dark:bg-slate-850/40 blur-2xl" />
            <div className="absolute left-1/2 top-[43%] w-[21rem] -translate-x-1/2 -translate-y-1/2 rotate-[-4deg] opacity-20 blur-md transition duration-500 group-hover:translate-y-[-54%] group-hover:rotate-[-1deg] sm:w-[29rem]">
              <Image
                src="/skillyug.png"
                alt=""
                width={700}
                height={280}
                className="h-auto w-full"
              />
            </div>
            <div className="absolute left-1/2 top-[42%] w-[21rem] -translate-x-[49%] -translate-y-[47%] rotate-[-4deg] opacity-15 brightness-0 saturate-150 transition duration-500 group-hover:-translate-y-1/2 group-hover:rotate-[-1deg] sm:w-[29rem]">
              <Image
                src="/skillyug.png"
                alt=""
                width={700}
                height={280}
                className="h-auto w-full"
              />
            </div>
            <div className="absolute left-1/2 top-[39%] w-[21rem] -translate-x-1/2 -translate-y-1/2 rotate-[-4deg] drop-shadow-[0_28px_38px_rgba(0,0,0,0.05)] transition duration-500 group-hover:scale-[1.04] group-hover:rotate-[-1deg] sm:w-[29rem]">
              <Image
                src="/skillyug.png"
                alt="Skillyug"
                width={700}
                height={280}
                className="h-auto w-full drop-shadow-[0_8px_16px_rgba(59,130,246,0.08)]"
              />
            </div>
            <div className="absolute left-1/2 top-[65%] h-10 w-[24rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06),rgba(168,85,247,0.04)_46%,transparent_72%)] blur-md transition duration-500 group-hover:w-[28rem]" />
            <div className="absolute left-1/2 top-[43%] h-52 w-[34rem] -translate-x-1/2 -translate-y-1/2 rotate-[-10deg] rounded-full border border-blue-400/8 transition duration-500 group-hover:rotate-[-4deg]" />
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-50 dark:from-[#0a0f1c] to-transparent" />
            <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 dark:border-purple-900/30 dark:bg-purple-950/40 px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-400 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Early Bird
            </div>
          </div>

          <div className="relative mx-auto -mt-16 max-w-xl rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1c] p-6 shadow-md backdrop-blur-xl sm:p-8 [transform:translateZ(86px)]">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-purple-600 dark:text-purple-400">
                Skillyug AI Bootcamp
              </p>
              <div className="mt-4 flex items-end justify-center gap-4">
                <span className="text-xl text-slate-400 dark:text-slate-500 line-through">₹4000</span>
                <span className="text-5xl font-bold text-slate-900 dark:text-white">{BOOK_SLOT_AMOUNT_LABEL}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 text-slate-600 dark:text-slate-350">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-purple-600 dark:text-purple-450" aria-hidden="true" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <Link
              href="/book-slot?from=bootcamp"
              className="mt-9 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-lg font-bold text-white shadow-sm hover:from-purple-500 hover:to-indigo-500 transition hover:-translate-y-0.5"
            >
              Enroll in Bootcamp
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function DesktopBootcampHero() {
  return (
    <section className="relative hidden min-h-screen items-center overflow-hidden px-6 pb-16 pt-28 md:flex md:px-10 md:py-28 lg:px-16">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,#f8fafc_0%,#f8fafc_42%,#f3e8ff_72%,#e0f2fe_100%)] dark:bg-[linear-gradient(135deg,#020617_0%,#020617_42%,#1a103c_72%,#081e30_100%)]" />
      <div className="absolute inset-0 z-0 [contain:layout_paint] md:opacity-80">
        <BootcampSpline />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#f8fafc_0%,#f8fafc_34%,rgba(248,250,252,0.84)_48%,rgba(248,250,252,0.34)_68%,rgba(248,250,252,0.18)_100%)] dark:bg-[linear-gradient(90deg,#020617_0%,#020617_34%,rgba(2,6,23,0.84)_48%,rgba(2,6,23,0.34)_68%,rgba(2,6,23,0.18)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_46%,transparent_0%,transparent_28%,rgba(248,250,252,0.2)_54%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_74%_46%,transparent_0%,transparent_28%,rgba(2,6,23,0.2)_54%,#020617_100%)]" />
        <div className="pointer-events-none absolute bottom-5 right-5 h-14 w-44 rounded-2xl bg-transparent" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-48 bg-gradient-to-b from-transparent via-slate-50/80 dark:via-[#020617]/80 to-slate-50 dark:to-[#020617]" />

      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="pointer-events-auto max-w-xl">
          <div
            className="mb-6 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 dark:border-purple-900/30 dark:bg-purple-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-purple-700 dark:text-purple-400 backdrop-blur-md"
          >
            Skillyug AI Bootcamp
          </div>
          <h1
            className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl"
          >
            Give Your Child the Advantage in the{" "}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Era of AI
            </span>
          </h1>
          <p
            className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-350 sm:text-xl"
          >
            Students in Classes 6–12 gain mastery over industry-leading generative platforms and creative automation through hands-on project building, guided feedback, and live expert sessions.
          </p>
          <div>
            <Link
              href="/book-slot?from=bootcamp"
              className="mt-9 inline-flex rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-sm hover:from-purple-500 hover:to-indigo-500 transition hover:-translate-y-0.5"
            >
              Enroll Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function MobileBootcampHero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pb-16 pt-32 md:hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.06),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(37,99,235,0.04),transparent_40%),linear-gradient(135deg,#f8fafc_0%,#f5f3ff_50%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.1),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(37,99,235,0.08),transparent_40%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-48 bg-gradient-to-b from-transparent via-slate-50/80 dark:via-[#020617]/80 to-slate-50 dark:to-[#020617]" />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <div
          className="mb-6 inline-flex items-center justify-center rounded-full border border-purple-200 bg-purple-50 dark:border-purple-900/30 dark:bg-purple-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-purple-700 dark:text-purple-400 backdrop-blur-md"
        >
          Skillyug AI Bootcamp
        </div>
        <h1
          className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl"
        >
          Give Your Child the Advantage in the{" "}
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Era of AI
          </span>
        </h1>
        <p
          className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-355"
        >
          Students in Classes 6–12 gain mastery over industry-leading generative platforms and creative automation through hands-on project building, guided feedback, and live expert sessions.
        </p>
        <div
          className="mt-10 w-full"
        >
          <Link
            href="/book-slot?from=bootcamp"
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-sm hover:from-purple-500 hover:to-indigo-500 transition hover:-translate-y-0.5"
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function BootcampPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 selection:bg-purple-100 selection:text-purple-900 transition-colors duration-300">
      <Navbar />

      <DesktopBootcampHero />
      <MobileBootcampHero />

      <section className="relative px-6 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <h2
            className="text-center text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl"
          >
            Learn from the best in the industry
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {instructors.map((instructor, idx) => (
              <article
                key={instructor.name}
                className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1c] p-8 backdrop-blur-md shadow-sm transition hover:border-purple-300 dark:hover:border-purple-500/30 hover:bg-white/95 dark:hover:bg-[#0a0f1c]/95"
              >
                <div className="absolute right-8 top-8 h-20 w-72 opacity-80 transition-opacity hover:opacity-100">
                  <Image src="/skillyug-optimized.svg" alt="Skillyug Logo" fill className="object-contain object-right opacity-30" />
                </div>
                {instructor.image ? (
                  <div className="mb-7 relative h-24 w-24 overflow-hidden rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
                    <Image src={instructor.image} alt={instructor.name} fill className="object-cover" sizes="96px" />
                  </div>
                ) : (
                  <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f172a] text-2xl font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                    {instructor.initials}
                  </div>
                )}
                <div className="pr-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{instructor.name}</h3>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-purple-600 dark:text-purple-400">
                    {instructor.title}
                  </p>
                  {Array.isArray(instructor.bio) ? (
                    <ul className="mt-5 space-y-2 text-base leading-7 text-slate-600 dark:text-slate-355 list-disc list-outside ml-4">
                      {instructor.bio.map((point, pointIdx) => {
                        const colonIndex = point.indexOf(':');
                        if (colonIndex !== -1) {
                          return (
                            <li key={pointIdx}>
                              <span className="font-bold text-slate-900 dark:text-white">{point.substring(0, colonIndex + 1)}</span>
                              {point.substring(colonIndex + 1)}
                            </li>
                          );
                        }
                        return <li key={pointIdx}>{point}</li>;
                      })}
                    </ul>
                  ) : (
                    <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-355">{instructor.bio}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20 md:px-10 lg:px-16">
        <div className="absolute inset-x-0 top-1/2 h-[34rem] -translate-y-1/2 bg-[radial-gradient(circle,rgba(168,85,247,0.05),transparent_62%)] dark:bg-[radial-gradient(circle,rgba(168,85,247,0.15),transparent_62%)]" />
        <div className="relative mx-auto max-w-6xl">
          <h2
            className="mb-10 text-center text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl"
          >
            Secure Your Child&apos;s Spot
          </h2>
          <div>
            <EnrollmentCard />
          </div>
        </div>
      </section>

      <footer className="relative border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-[#0a0f1c]/50 px-6 py-24 text-center sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.03),transparent_34%)]" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center">
          <div>
            <Image
              src="/skillyug-optimized.svg"
              alt="Skillyug"
              width={520}
              height={220}
              className="h-auto w-64 sm:w-80 md:w-[420px]"
            />
          </div>
          <nav
            className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-xl font-bold text-slate-600 dark:text-slate-400 sm:text-2xl"
          >
            {footerLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-slate-900 dark:hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-7 text-base font-medium text-slate-500 dark:text-slate-450 sm:text-lg"
          >
            <Link href="/refund-policy" className="transition hover:text-slate-805 dark:hover:text-slate-300">
              Refund Policy
            </Link>
            <span>|</span>
            <Link href="/terms-and-conditions" className="transition hover:text-slate-805 dark:hover:text-slate-300">
              Terms & Conditions
            </Link>
          </div>
          <p
            className="mt-16 text-lg font-medium uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500 sm:text-2xl"
          >
            © 2026 Skillyug
            <br />
            All Rights Reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
