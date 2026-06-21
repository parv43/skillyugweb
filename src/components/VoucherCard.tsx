"use client";

import React, { useRef, useState, MouseEvent } from "react";
import { Lock } from "lucide-react";

export default function VoucherCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Rotate max 10 degrees
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div 
        style={{ perspective: "1500px" }}
        className="w-full h-full flex flex-col justify-between"
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isHovered ? "none" : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
            transformStyle: "preserve-3d"
          }}
          className="relative w-full aspect-[1.6/1] bg-[#020617] rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(255,139,18,0.2)] transform-gpu group cursor-crosshair"
        >
          <div 
            className="absolute inset-0 z-10 flex flex-col justify-between text-white p-5 md:p-8 rounded-[1.5rem] border border-white/10"
            style={{
              background: "linear-gradient(135deg, rgba(0, 96, 170, 0.8) 0%, rgba(255, 139, 18, 0.8) 100%)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              boxShadow: "inset 0 0 20px rgba(255,255,255,0.1)"
            }}
          >
            {/* Organic Shape Background Element */}
            <div 
              className="absolute top-0 right-0 w-[60%] h-full z-0 pointer-events-none transition-transform duration-700 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, rgba(255, 237, 213, 0.2) 0%, rgba(219, 234, 254, 0.2) 100%)",
                borderRadius: "40% 0 1.5rem 60%"
              }}
            ></div>
            
            {/* Top Section: Logo & Brand */}
            <div className="relative z-20 flex items-center gap-3 transform-gpu" style={{ transform: "translateZ(30px)" }}>
              <img 
                alt="Skillyug Logo" 
                className="w-auto h-20 md:h-28 object-contain drop-shadow-xl" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaLDtPLJdtYtLv7h3BpCI-2V0TEyavDu-CIZlHmTw9NZCET4Hrl6Gwuat-8zMLTXdmmu1RbxmFKw8cg8jLDhGCxNJqUaAS6SC5bYSrx_S65Ie7dBr0RQJEbECi1jLaI6A8zej8M2j_tHZ-fFDiHFgKKrJyBUd25poMnXG5OGtfSt7GH55mted7jFGDQl21ReJ2Tj17RCSDQ5uAzhGIC4HR6PkGy0xjPX7L-dyuMJa8olbTjYXZSmERXVrkAN0GdvkShTSX9PiCIPkH"
              />
            </div>
            
            {/* Middle Section: Value Proposition */}
            <div className="relative z-20 mt-auto mb-2 md:mb-4 transform-gpu" style={{ transform: "translateZ(40px)" }}>
              <h2 className="font-black tracking-tight mb-1 drop-shadow-lg text-3xl md:text-4xl lg:text-5xl leading-none">
                ₹500 DISCOUNT
              </h2>
              <p className="text-white/80 font-semibold tracking-widest uppercase text-[10px] md:text-xs">
                Special Offer Voucher
              </p>
            </div>
            
            {/* Bottom Section: Terms/Code */}
            <div className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-end border-t border-white/20 pt-3 gap-3 transform-gpu" style={{ transform: "translateZ(20px)" }}>
              <p className="text-white/80 text-[10px] md:text-xs font-medium max-w-[120px] md:max-w-[150px]">
                Valid on Upcoming Premium Courses.
              </p>
              <div className="bg-white/10 rounded-lg backdrop-blur-md border border-white/20 px-3 py-2 md:px-4 md:py-3 flex items-center shadow-lg">
                <span className="font-mono tracking-widest font-bold text-[10px] md:text-xs flex items-center text-white/90">
                  <Lock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 opacity-80" />
                  CODE: <span className="text-white/60 ml-1 md:ml-2">XXXXX</span>
                </span>
              </div>
            </div>
            
            {/* Decorative geometric element inside the card */}
            <div className="absolute bottom-[-10%] right-[-5%] w-32 h-32 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
            <div className="absolute top-[-5%] left-[-5%] w-40 h-40 bg-orange-500/20 rounded-full blur-3xl z-0 pointer-events-none"></div>
          </div>
        </div>
      </div>
      
      {/* Required Text below the 3D card layout */}
      <div className="mt-6 opacity-80 transition-opacity hover:opacity-100 pb-2">
        <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.25em] text-center">
          Complete the course to get code
        </h3>
      </div>
    </div>
  );
}
