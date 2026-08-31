"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { MessageSquare, Palette, Brain, Sparkles } from "lucide-react"

interface BuilderCardProps {
  name: string
  className: string
  photo: string
  projectTitle: string
  projectImage: string
  photoPosition?: string
  quote: string
  tools: { name: string; icon: React.ReactNode }[]
  rank: string
}

const CompactBuilderCard = ({ name, className, photo, projectTitle, projectImage, photoPosition = "object-center", quote, tools, rank }: BuilderCardProps) => {
  return (
    <div className="bg-white dark:bg-[#0a0f1c] rounded-2xl p-3 md:p-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-slate-100 dark:border-white/5 flex flex-row gap-4 h-full group relative items-center">
      
      {/* Left: Project Image & Rank Badge */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-white/10">
        <Image 
          src={projectImage} 
          alt={projectTitle} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="128px"
        />
        <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-gradient-to-br from-[#0060aa] to-[#ff8b12] rounded-full flex items-center justify-center text-white font-black text-xs shadow-md border-[1.5px] border-white dark:border-[#0a0f1c] z-20">
          #{rank}
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex flex-col flex-grow justify-center py-1">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base leading-tight mb-1.5 relative z-10">{projectTitle}</h4>
        
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-5 h-5 rounded-full bg-slate-50 dark:bg-white/5 overflow-hidden relative flex-shrink-0 border border-slate-100 dark:border-white/10">
            <Image src={photo} alt={name} fill className={`object-cover ${photoPosition}`} sizes="20px" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-xs tracking-tight">{name}</span>
          <span className="text-slate-400 dark:text-slate-500 text-[10px] font-medium">• Class {className}</span>
        </div>
        
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed italic mb-2.5 line-clamp-2">
          &quot;{quote}&quot;
        </p>

        {/* Tools Used */}
        <div className="flex items-center flex-wrap gap-1.5 mt-auto">
          {tools.map((tool, idx) => (
             <div key={idx} className="flex items-center gap-1 bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-100 dark:border-white/10">
               {tool.icon}
               <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{tool.name}</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const ClassroomCollage = () => {
  const images = [
    "/classimage1.jpeg",
    "/classimage2.jpeg",
    "/classimage3.jpeg",
    "/classimage4.jpeg"
  ];

  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="grid grid-cols-2 gap-4 w-full">
      {images.map((src, idx) => (
        <div 
          key={src} 
          className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md hover:-translate-y-1 transition-all duration-700 ease-out group transform ${
            isVisible 
              ? "opacity-100 translate-y-0 scale-100" 
              : "opacity-0 translate-y-8 scale-95"
          }`}
          style={{ transitionDelay: `${idx * 150}ms` }}
        >
          <Image
            src={src}
            alt={`Classroom in action ${idx + 1}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 1024px) 50vw, 25vw"
          />
        </div>
      ))}
    </div>
  )
}

export default function OurTopBuilders() {
  const builders = [
    {
      name: "Sarvasva",
      className: "6",
      photo: "/Sarvasva-Photo.jpeg",
      projectTitle: "AI Tools Hub",
      projectImage: "/Sarvasva-Project.jpeg",
      photoPosition: "object-center",
      quote: "Learning AI workflows completely changed how I approach my homework.",
      tools: [
        { name: "Gamma", icon: <Sparkles className="w-3.5 h-3.5 text-blue-500" /> },
        { name: "ChatGPT", icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> }
      ],
      rank: "1"
    },
    {
      name: "Monaksh",
      className: "6",
      photo: "/Monaksh-Photo.jpeg",
      projectTitle: "SocialHub",
      projectImage: "/Monaksh-Project.jpeg",
      photoPosition: "object-center",
      quote: "The bootcamp was incredible. I built a project I'm genuinely proud of.",
      tools: [
        { name: "Canva AI", icon: <Palette className="w-3.5 h-3.5 text-purple-500" /> },
        { name: "Brain", icon: <Brain className="w-3.5 h-3.5 text-pink-500" /> }
      ],
      rank: "2"
    },
    {
      name: "Bharat",
      className: "6",
      photo: "/Bharat-photo.jpeg",
      projectTitle: "3D Solar Explorer",
      projectImage: "/Bharat-Project.jpeg",
      photoPosition: "object-top",
      quote: "Skillyug showed me how to turn my ideas into real AI applications.",
      tools: [
        { name: "ChatGPT", icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> },
        { name: "Canva AI", icon: <Palette className="w-3.5 h-3.5 text-purple-500" /> }
      ],
      rank: "3"
    }
  ];

  return (
    <section className="relative w-full bg-slate-50 dark:bg-[#020817] py-16 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#0060aa]/10 dark:bg-[#0060aa]/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#ff8b12]/10 dark:bg-[#ff8b12]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] px-6 lg:px-8 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Top Builders */}
          <div className="flex flex-col w-full order-1">
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold text-xs mb-4 border border-blue-200 dark:border-blue-800/30">
                <Sparkles className="w-3 h-3" />
                <span>Student Showcase</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 drop-shadow-sm tracking-tight leading-tight">
                Our Top Builders
              </h2>
              <p className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0060aa] via-[#8b5cf6] to-[#ff8b12]">
                Amazing AI Projects Built by Bootcamp Students
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {builders.map((builder, idx) => (
                <CompactBuilderCard
                  key={idx}
                  {...builder}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Learning In Action */}
          <div className="flex flex-col w-full order-2 h-full justify-center">
            <div className="mb-6 text-center">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 drop-shadow-sm tracking-tight leading-tight">
                Learning in Action
              </h2>
              <p className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0060aa] via-[#8b5cf6] to-[#ff8b12]">
                Real classes, real learning, real building.
              </p>
            </div>
            
            <ClassroomCollage />
          </div>

        </div>
      </div>

      {/* Bottom Wave Treatment */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0 rotate-180 opacity-50 dark:opacity-20 pointer-events-none">
        <svg
          className="relative block w-full h-[100px] md:h-[150px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-blue-50/50 dark:fill-[#0a0f1c]"
          ></path>
        </svg>
      </div>
    </section>
  )
}
