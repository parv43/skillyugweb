"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import Image from "next/image";

const galleryItems = [
  {
    src: "/classroom.jpeg",
    title: "AI Orientation at DWPS",
    story: "Bringing the future of tech directly into the classroom. An engaging session empowering young innovators at DWPS with foundational AI knowledge."
  },
  {
    src: "/Dhruv_Galgotiya.jpeg",
    title: "Meeting Dr. Dhruv Galgotia",
    story: "Strategic discussions and visionary planning with Dr. Dhruv Galgotia, exploring avenues to scale impactful education and align our roadmaps."
  },
  {
    src: "/paytmAdvisor.jpeg",
    title: "Insights with Mr. Saurabh Jain",
    story: "An inspiring virtual masterclass with Mr. Saurabh Jain, former VP at Paytm, diving deep into startup mentorship and the evolution of tech ecosystems."
  },
  {
    src: "/vinita singh pic.jpeg",
    title: "Connecting with Vineeta Singh",
    story: "An incredible face-to-face interaction with SUGAR Cosmetics Founder & Shark Tank India Judge Mrs. Vineeta Singh, absorbing her dynamic entrepreneurial spirit."
  },
  {
    src: "/WhatsApp Image 2026-04-02 at 6.58.22 PM.jpeg",
    title: "The Skillyug Team",
    story: "The driving force behind the mission. A dedicated team of technologists and educators completely united by a passion to democratize AI learning."
  }
];

export default function GallerySection() {
  const controls = useAnimationControls();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // We duplicate the items to create a long enough track for the seamless infinite effect
  const duplicatedItems = [...galleryItems, ...galleryItems, ...galleryItems];

  const startAnimation = async () => {
    await controls.start({
      x: "-33.33%", // Move by one full set of images
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
      },
    });
  };

  useEffect(() => {
    if (!isHovered && !isDragging) {
      startAnimation();
    } else {
      controls.stop();
    }
  }, [isHovered, isDragging]);

  return (
    <section className="py-24 relative overflow-hidden flex flex-col items-center justify-center border-t border-slate-900 bg-[#020617]">
      {/* Background glow matching theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-purple-900/5 to-transparent rounded-full z-0 pointer-events-none" />

      <div className="text-center mb-12 relative z-10 w-full px-6">
        <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 mb-6 tracking-tight leading-tight">
          Skillyug <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 neon-text">Gallery</span>
        </h2>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light font-body">
          See our Company in action.
        </p>
      </div>

      <div className="relative w-full z-10 pt-4 pb-8 cursor-grab active:cursor-grabbing overflow-hidden">
        {/* The Track Container */}
        <motion.div 
          className="flex gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-4 w-max"
          animate={controls}
          initial={{ x: 0 }}
          drag="x"
          // Allowing drag but stopping the auto-animation while dragging
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => {
            setIsDragging(false);
            // Reset to 0 if we drag too far to maintain the loop illusion
            // controls.set({ x: 0 }); 
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          dragConstraints={{ left: -2000, right: 0 }}
          dragElastic={0.05}
        >
          {duplicatedItems.map((item, index) => (
             <div 
               key={index} 
               className="w-[280px] sm:w-[320px] md:w-[400px] lg:w-[480px] flex-shrink-0 aspect-[4/3] rounded-2xl md:rounded-[3rem] overflow-hidden glass-panel border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.1)] relative group select-none transition-all duration-500 hover:border-blue-400/30"
             >
                {/* Story Overlay — visible on mobile by default, triggered on hover for desktop */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/95 via-[#020617]/50 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none flex flex-col justify-end p-6 md:p-8">
                  <h3 className="text-white font-bold text-xl md:text-2xl mb-2 translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 ease-out delay-75 shadow-black text-shadow-sm">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 ease-out delay-100 font-medium">
                    {item.story}
                  </p>
                </div>

                <div className="absolute inset-0 bg-[#020617]/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                <Image 
                   src={item.src} 
                   alt={`Skillyug Gallery - ${item.title}`} 
                   fill
                   sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 400px, 480px"
                   className="object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110"
                   priority={index < 3}
                />
             </div>
          ))}
        </motion.div>

        {/* Edge Fade Out Gradients */}
        <div className="absolute top-0 bottom-0 left-0 w-20 md:w-48 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-20 md:w-48 bg-gradient-to-l from-[#020617] via-[#020617]/80 to-transparent z-20 pointer-events-none" />
      </div>

    </section>
  );
}
