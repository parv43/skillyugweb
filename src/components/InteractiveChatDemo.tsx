"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, User, Send, Sparkles } from "lucide-react"
import HomeFaqSection from "@/components/HomeFaqSection"

interface InteractiveChatDemoProps {
  id?: string
}

export default function InteractiveChatDemo({ id = "ask-ai" }: InteractiveChatDemoProps) {
  const [messages, setMessages] = useState([
    {
      role: "user",
      content: "Hi, I'm interested in the demo. What exactly is Skillyug?"
    },
    {
      role: "ai",
      content: "Welcome! Skillyug teaches Class 6–12 students how to use modern AI tools like ChatGPT and Canva AI to build creative projects. I'm here to help you understand the program before you book a demo class!"
    }
  ])

  const [inputVal, setInputVal] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const quickPrompts = [
    "What exactly will my child learn?",
    "Is this suitable for a Class 8 student?",
    "What kind of projects do students build?",
    "How does the ₹49 demo class work?"
  ]

  const getMockAIResponse = (input: string) => {
    const text = input.toLowerCase()
    
    if (text.includes("learn") || text.includes("tool") || text.includes("teach") || text.includes("curriculum")) {
      return "Students learn to use ChatGPT, Canva AI, Midjourney, and automation tools to build creative projects. You can also see this in action during the ₹49 live demo class."
    }
    if (text.includes("age") || text.includes("class") || text.includes("who") || text.includes("old") || text.includes("suitable")) {
      return "Skillyug is designed perfectly for students from Class 6 to 12. Many parents attend the demo before deciding if it's the right fit for their child."
    }
    if (text.includes("49") || (text.includes("demo") && text.includes("work"))) {
      return "The ₹49 demo class is a live introductory session where parents and students see the teaching style, tools, and overall bootcamp format before moving ahead."
    }
    if (text.includes("book") || text.includes("demo") || text.includes("join") || text.includes("enroll") || text.includes("start")) {
      return "The best way to understand the program is to attend the ₹49 demo session first. Families who are ready to continue can then use the ₹299 spot-booking flow."
    }
    if (text.includes("project") || text.includes("build") || text.includes("create") || text.includes("make")) {
      return "Students build real-world AI chatbots, AI generated designs, and automation workflows. The best way to understand the program is to attend the demo session."
    }
    
    // Off-topic fallback
    return "I am here to help parents understand the Skillyug AI Creator Demo Class. Please ask questions related to the program or what students will learn."
  }

  const handleSend = (text: string) => {
    if (!text.trim() || isTyping) return

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: text }])
    setInputVal("")
    setIsTyping(true)

    // Simulate AI thinking and responding
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          role: "ai", 
          content: getMockAIResponse(text)
        }
      ])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <section id={id} className="relative w-full py-32 bg-[#020617] overflow-hidden border-t border-slate-900">
      
      {/* Background Ambience */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="text-center mb-10 px-6 max-w-3xl mx-auto relative z-20">
        <motion.h2 
          className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 mb-6 drop-shadow-sm tracking-tight"
        >
          Master the Art of Prompting
        </motion.h2>
        <p className="text-slate-400 text-lg md:text-xl font-light mb-4">
          We don&apos;t just teach students what AI is. We teach them exactly how to talk to it to get professional results.
        </p>
        <p className="text-blue-400/80 text-sm font-medium tracking-wide">
          Have questions before booking the demo? Ask our AI assistant instantly.
        </p>
      </div>

      {/* Chat Interface Container */}
      <motion.div 
        className="max-w-4xl mx-auto px-4 relative z-10"
        
        transition={{ duration: 0.6 }}
      >
        <div className="w-full bg-[#0a0f1c] rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.05)] overflow-hidden flex flex-col h-[600px] cyber-glow">
          
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.3)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm tracking-wide">Interactive AI Demo</h3>
              <p className="text-xs text-slate-400">Skillyug Simulator</p>
            </div>
          </div>

          {/* Chat History Container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ y: 10, scale: 0.95 }}
                  animate={{ y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* AI Avatar */}
                  {msg.role === 'ai' && (
                    <div className="w-10 h-10 shrink-0 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mt-1 text-blue-400">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-[80%] rounded-2xl p-5 ${
                    msg.role === 'user' 
                      ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50 rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none'
                  }`}>
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <div className="w-10 h-10 shrink-0 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mt-1 text-purple-400">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div 
                  key="typing"
                  className="flex gap-4"
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="w-10 h-10 shrink-0 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mt-1 text-blue-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-5 flex items-center gap-2 pr-6">
                    <motion.span 
                      className="w-2 h-2 bg-blue-400 rounded-full" 
                      animate={{ y: [0, -5, 0] }} 
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} 
                    />
                    <motion.span 
                      className="w-2 h-2 bg-blue-400 rounded-full" 
                      animate={{ y: [0, -5, 0] }} 
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} 
                    />
                    <motion.span 
                      className="w-2 h-2 bg-blue-400 rounded-full" 
                      animate={{ y: [0, -5, 0] }} 
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/[0.02] border-t border-white/5">
            
            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickPrompts.map((prompt, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(prompt)}
                  disabled={isTyping}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                handleSend(inputVal)
              }}
              className="relative flex items-center"
            >
              <label htmlFor="interactive-chat-input" className="sr-only">
                Message the AI assistant
              </label>
              <input 
                id="interactive-chat-input"
                type="text" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Message the AI..."
                disabled={isTyping}
                className="w-full bg-[#020617] border border-white/10 rounded-xl py-4 pl-4 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!inputVal.trim() || isTyping}
                aria-label="Send message"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center text-white disabled:opacity-50 disabled:hover:bg-blue-500 transition-colors"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>

        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <HomeFaqSection />
      </div>

    </section>
  )
}
