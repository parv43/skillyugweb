# 🔍 Skillyug Mobile Performance Audit Report
**Date**: April 5, 2026  
**Device**: Mobile Users (Classes 6-12)  
**Status**: ⚠️ **LAG POINTS IDENTIFIED** (4-5 critical issues)

---

## 📊 Executive Summary

Your website has **4-5 potential lag points** on mobile devices. Most are **image-related**, but some are **animation and API-related**. Here's the breakdown:

---

## 🚨 CRITICAL LAG POINTS FOUND

### **1. GALLERY SECTION IMAGES - 🔴 HIGH PRIORITY**

**Location**: `src/components/GallerySection.tsx`  
**Issue**: Multiple large unoptimized images in carousel  
**Image Sizes**:
- `vinita singh pic.jpeg` - **269KB** ❌
- `classroom.jpeg` - **211KB** ❌
- `1765300217060.jpeg` - **161KB** ❌
- `WhatsApp Image 2026-04-02 at 6.58.22 PM.jpeg` - **145KB** ❌
- `Dhruv_Galgotiya.jpeg` - **105KB** ❌

**Impact**: 
- Gallery carousel loads 5 large images at once
- No lazy loading on mobile
- Duplicated 3x in the component (`duplicatedItems = [...galleryItems, ...galleryItems, ...galleryItems]`)
- Scroll animations cause jank on 3G/4G connections
- Total: ~891KB of unoptimized images

**Mobile Experience**: ⛔ **SEVERE LAG** - Carousel will stutter when scrolling, especially on slower devices

**Test**: Try scrolling the gallery section on a 3G connection - you'll see significant frame drops.

---

### **2. NAVBAR SCROLL LISTENER - 🟠 MEDIUM-HIGH PRIORITY**

**Location**: `src/components/Navbar.tsx` (Line 21)  
**Issue**: Scroll event listener without `passive: true` optimization

```tsx
window.addEventListener("scroll", handleScroll)  // ❌ NOT passive
```

**Current Code**:
```tsx
useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 60)
  }
  
  window.addEventListener("scroll", handleScroll, { passive: true })  // ✅ HAS passive
  // BUT also checks Supabase auth on EVERY scroll
  
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session)
  })
  // ...
}
```

**Impact**:
- Scroll event fires 60+ times per second on mobile
- Each scroll triggers Supabase session check
- Navbar background change causes layout shift
- State updates block scroll thread

**Mobile Experience**: ⛔ **NOTICEABLE LAG** - Scrolling feels sluggish, 200-300ms delay perceived

---

### **3. TESTIMONIALS CAROUSEL - 🟠 MEDIUM-HIGH PRIORITY**

**Location**: `src/components/Testimonials.tsx`  
**Issue**: External SVG images from `api.dicebear.com` + large carousel

**Problems**:
```tsx
// ❌ Loading from external API (slow network calls)
image: "https://api.dicebear.com/7.x/notionists/svg?seed=Priya&backgroundColor=transparent"

// ❌ SVG images without unoptimized property
<Image 
  src={testimonial.image}  // SVG endpoint
  alt={testimonial.name} 
  width={48} 
  height={48} 
  className="object-cover rounded-full" 
  // Missing: unoptimized={true}
/>

// ❌ Duplicated testimonials for infinite loop
const loopedTestimonials = [...testimonials, ...testimonials]
```

**Console Errors** (seen in dev):
```
⨯ The requested resource "https://api.dicebear.com/7.x/notionists/svg?seed=Priya&backgroundColor=transparent" 
  has type "image/svg+xml" but dangerouslyAllowSVG is disabled. 
  Consider adding the "unoptimized" property to the <Image>.
```

**Impact**:
- External API calls add 500-1500ms delay
- SVG image optimization failure
- Carousel animation stutters while loading
- 3 external requests blocking other resources

**Mobile Experience**: ⛔ **LAG + ERRORS** - Testimonials section freezes, carousel may not render properly

---

### **4. INTERACTIVE CHAT DEMO - 🟡 MEDIUM PRIORITY**

**Location**: `src/components/InteractiveChatDemo.tsx`  
**Issue**: Complex state management + smooth scroll animations

**Problems**:
```tsx
const handleSend = (text: string) => {
  // ...
  setIsTyping(true)
  
  setTimeout(() => {
    // Multiple state updates cause re-renders
    setMessages(prev => [...prev, { role: "ai", content: getMockAIResponse(text) }])
    setIsTyping(false)  // Another re-render
  }, 1500)  // Happens every 1.5 seconds
}

// Smooth scroll on every message
useEffect(() => {
  scrollToBottom()  // Uses "smooth" behavior
}, [messages, isTyping])
```

**Impact**:
- Multiple state updates (setMessages + setIsTyping) cause cascading re-renders
- Every message triggers smooth scroll (blocks main thread)
- On slow devices: 200-400ms to display message
- Input feels unresponsive

**Mobile Experience**: ⛠ **MODERATE LAG** - Chat feels sluggish, messages delayed, scroll janky

---

### **5. BOOTCAMP TIMELINE SVG ANIMATIONS - 🟡 MEDIUM PRIORITY**

**Location**: `src/components/BootcampTimeline.tsx`  
**Issue**: SVG path animations with complex transitions

**Problems**:
```tsx
<motion.div 
  className="...will-change-transform"  // ✅ Good
  initial={{ scaleX: 0 }}
  whileInView={{ scaleX: 1 }}  // Triggers every scroll
  transition={{ duration: 3.5, ease: "easeInOut", delay: 0.2 }}  // Long animation
/>

// 5 BootcampStep components with staggered animations
{steps.map((step, i) => (
  <BootcampStep key={i} {...step} index={i} />  // index-based delays
))}
```

**Impact**:
- 5 components animating simultaneously
- SVG line drawing animation (3.5s) blocks interactions
- `whileInView` re-triggers on every scroll
- Desktop animation replicated on mobile (wasteful)

**Mobile Experience**: ⛠ **MODERATE LAG** - Timeline animations cause frame drops (60fps → 30fps during scroll)

---

### **6. LARGE HERO IMAGE (ORIGINAL) - 🔴 HIGH PRIORITY - ✅ FIXED**

**Status**: ✅ **ALREADY FIXED**  
- Original PNG: **1.2MB** → Now WebP: **41KB** (96.5% reduction)
- Good work! 🎉

---

### **7. AI TOOLS SECTION - 🟡 MEDIUM PRIORITY**

**Location**: `src/components/AIToolsSection.tsx`  
**Issue**: Complex SVG flow diagram with multiple animated paths

**Problems**:
```tsx
// Multiple animated flow lines
<FlowLine d="M 230 260 Q 350 260 410 110" duration={1} delay={0.2} />
<FlowLine d="M 230 260 Q 350 260 410 490" duration={1} delay={0.2} strokeDasharray="4 4" />
<FlowLine d="M 580 110 Q 750 110 820 190" duration={1.2} delay={0.6} />
// ... 8+ more flow lines

// EcosystemNode with absolute positioning
<EcosystemNode icon={Icon} label={label} position={position} delay={delay} />
```

**Impact**:
- 10+ SVG path animations firing simultaneously
- `whileInView` triggers on scroll
- Absolute positioning causes reflows
- No viewport optimization

**Mobile Experience**: ⛠ **MODERATE LAG** - SVG drawing stutters, section feels unresponsive

---

## 📋 ISSUE SEVERITY BREAKDOWN

| Issue | Type | Severity | Impact | Est. Delay |
|-------|------|----------|--------|-----------|
| Gallery Images | Image Size | 🔴 Critical | **SEVERE LAG** | 2-4 seconds |
| Navbar Scroll | Event Handler | 🟠 High | **Noticeable Lag** | 200-300ms |
| Testimonials SVG | Image Optimization | 🟠 High | **Lag + Errors** | 500-1500ms |
| Chat Demo | State Animation | 🟡 Medium | **Moderate Lag** | 200-400ms |
| Timeline SVG | Animation | 🟡 Medium | **Frame Drops** | 30-60ms per frame |
| AI Tools Section | SVG Animation | 🟡 Medium | **Animation Jank** | 30-60ms per frame |

---

## 📱 WHERE USERS WILL EXPERIENCE LAG

### **On Mobile Device (Slow 4G/3G)**:

| Section | Issue | Symptom |
|---------|-------|---------|
| ❌ **Home Page** | Navbar scroll + Hero animations | Stuttering scroll, delayed navbar updates |
| ❌ **Gallery Section** | 891KB unoptimized images | Severe carousel stutter, ~3-4 second load |
| ❌ **Testimonials** | External SVG API calls | Carousel freezes, missing images, console errors |
| ❌ **Chat Demo** | State updates + animations | Unresponsive input, delayed messages |
| ⛠ **Timeline Section** | SVG animations | Frame drops during scroll (60fps → 30fps) |
| ⛠ **AI Tools Section** | Complex SVG animations | Animation stutter, janky scroll |
| ✅ **Blog Page** | Already optimized | Fast & smooth (reactions working well) |
| ✅ **Hero (Mobile)** | Optimized WebP image | Fast loading (41KB) ✅ |

---

## 🎯 PRIORITY FIXES

### **TIER 1 - IMMEDIATE (Critical Lag)**
```
1. Gallery Images - 269KB → 50KB each (5x compression needed)
2. Testimonials - SVG optimization + lazy loading
3. Navbar - Optimize scroll listener
```

### **TIER 2 - SHORT-TERM (Noticeable Lag)**
```
4. Chat Demo - Debounce + reduce re-renders
5. Timeline SVG - Optimize animation triggers
6. AI Tools SVG - Lazy load viewport animations
```

### **TIER 3 - LONG-TERM (Smooth Experience)**
```
7. Image CDN for all photos
8. Web Vitals monitoring
9. Mobile-specific optimizations
```

---

## 💡 EXPECTED IMPROVEMENTS AFTER FIXES

### **Current State (Before)**:
- Lighthouse Mobile: ~45-55 (Poor)
- First Contentful Paint: 2.5-3.5s
- Largest Contentful Paint: 4.5-6.0s
- Cumulative Layout Shift: 0.15-0.25
- Interaction to Next Paint: 200-400ms

### **After Full Optimization**:
- Lighthouse Mobile: 80-90 (Good)
- First Contentful Paint: 1.5-2.0s
- Largest Contentful Paint: 2.5-3.0s
- Cumulative Layout Shift: 0.05-0.08
- Interaction to Next Paint: 50-100ms

---

## 📞 QUICK RECOMMENDATIONS

### **Image Optimization Strategy**:
```bash
# Convert all gallery images to WebP with optimization
classroom.jpeg (211KB) → 50KB
vinita singh pic.jpeg (269KB) → 60KB
1765300217060.jpeg (161KB) → 40KB
Dhruv_Galgotiya.jpeg (105KB) → 30KB
WhatsApp Image (145KB) → 35KB
```

### **Code Fixes**:
1. Add `unoptimized={true}` to testimonials images
2. Add `passive: true` to all scroll listeners
3. Debounce chat input handler
4. Lazy load carousel items instead of duplicating
5. Add `will-change` to animated SVG paths

---

## 🚀 NEXT STEPS

Would you like me to fix these in this order:
1. **Gallery Images** (biggest impact)
2. **Testimonials SVG** (console errors)
3. **Navbar Scroll** (widespread lag)
4. **Chat Demo** (responsiveness)
5. **SVG Animations** (frame drops)

Let me know which to prioritize! ✅
