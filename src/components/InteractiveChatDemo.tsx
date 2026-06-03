"use client"

import React, { useState, useRef, useEffect } from "react"

import { Bot, User, Send, Sparkles } from "lucide-react"
import HomeFaqSection from "@/components/HomeFaqSection"

interface InteractiveChatDemoProps {
  id?: string
}

export default function InteractiveChatDemo({ id = "ask-ai" }: InteractiveChatDemoProps) {
  const [messages, setMessages] = useState([
    {
      role: "user",
      content: "Hi! What exactly is Skillyug?"
    },
    {
      role: "ai",
      content: "Welcome! Skillyug teaches Class 6–12 students how to use modern AI tools like ChatGPT and Canva AI to build creative projects. I'm here to help you understand the program!"
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
    "How do I reserve a bootcamp spot?"
  ]

  const getMockAIResponse = (input: string) => {
    const text = input.toLowerCase()

    // Specific match: "what exactly will my child learn?"
    if (
      (text.includes("exactly") && text.includes("learn")) ||
      (text.includes("what") && text.includes("child") && text.includes("learn")) ||
      (text.includes("what will") && text.includes("learn"))
    ) {
      return `Great question! Here's a sneak peek at what's covered across the bootcamp:\n\n📅 Week 1 — Introduction to AI\nStudents discover what AI really is, how it works in daily life, and get hands-on with fun AI activities.\n\n🔒 The full week-by-week curriculum (with all sub-topics and outcomes) is shared exclusively with enrolled students.\n\n👉 Enrol in the bootcamp to access the complete curriculum and secure your child's spot before seats fill up!`
    }

    if (text.includes("learn") || text.includes("tool") || text.includes("teach") || text.includes("curriculum")) {
      return "Students learn to use ChatGPT, Canva AI, Midjourney, and automation tools to build creative projects."
    }
    if (text.includes("age") || text.includes("class") || text.includes("who") || text.includes("old") || text.includes("suitable")) {
      return "Skillyug is designed perfectly for students from Class 6 to 12."
    }
    if (text.includes("book") || text.includes("join") || text.includes("enroll") || text.includes("start") || text.includes("spot") || text.includes("reserve")) {
      return "To secure your child's seat, use the Bootcamp page to reserve a spot. Seats are limited per batch!"
    }
    if (text.includes("project") || text.includes("build") || text.includes("create") || text.includes("make")) {
      return "Students build real-world AI chatbots, AI generated designs, and automation workflows."
    }
    
    // Off-topic fallback
    return "I am here to help parents understand the Skillyug AI Bootcamp. Please ask questions related to the program or what students will learn."
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
    <section id={id} className="relative w-full py-32 bg-slate-50 overflow-hidden border-t border-slate-100">
      
      {/* Background Ambience */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="text-center mb-10 px-6 max-w-3xl mx-auto relative z-20">
        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 mb-6 drop-shadow-sm tracking-tight">
          Master the Art of Prompting
        </h2>
        <p className="text-slate-600 text-lg md:text-xl font-light mb-4">
          We don&apos;t just teach students what AI is. We teach them exactly how to talk to it to get professional results.
        </p>
        <p className="text-blue-600 text-sm font-semibold tracking-wide">
          Have questions about the bootcamp? Ask our AI assistant instantly.
        </p>
      </div>

      {/* Chat Interface Container */}
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col h-[600px]">
          
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-slate-800 font-bold text-sm tracking-wide">Interactive AI Assistant</h3>
              <p className="text-xs text-slate-500">Skillyug Simulator</p>
            </div>
          </div>

          {/* Chat History Container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
          >
              {messages.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* AI Avatar */}
                  {msg.role === 'ai' && (
                    <div className="w-10 h-10 shrink-0 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mt-1 text-blue-600">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-[80%] rounded-2xl p-5 ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-tr-none shadow-sm' 
                      : 'bg-slate-100 border border-slate-200/60 text-slate-800 rounded-tl-none'
                  }`}>
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <div className="w-10 h-10 shrink-0 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center mt-1 text-purple-600">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator — CSS bounce replaces framer-motion */}
              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mt-1 text-blue-600">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-slate-100 border border-slate-200/60 rounded-2xl rounded-tl-none p-5 flex items-center gap-2 pr-6">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce-dot-1" />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce-dot-2" />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce-dot-3" />
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-100">
            
            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickPrompts.map((prompt, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(prompt)}
                  disabled={isTyping}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:border-blue-400/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
                className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-4 pr-14 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 shadow-sm transition-all disabled:opacity-50"
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
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <HomeFaqSection />
      </div>

    </section>
  )
}
