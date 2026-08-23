export interface CurriculumDay {
  dayNumber: number;
  topic: string;
  subtopics: string[];
  outcome: string;
  date: Date;
  dateStr: string; // "YYYY-MM-DD"
}

// No hardcoded bootcamp start anymore.

const rawCurriculumData = [
  {
    "topic": "Welcome & What is AI?",
    "subtopics": [
      "Foundation: What AI is, in simple words",
      "Foundation: AI in daily life: Siri, YouTube, Google Maps",
      "Foundation: Fun game: 'Is this AI or not?'",
      "Advanced: What AI is + how it's changing industries",
      "Advanced: Real-world AI: healthcare, finance, social media",
      "Advanced: AI vs Human: what each does better"
    ],
    "outcome": "Students can explain what AI is and spot AI in everyday apps."
  },
  {
    "topic": "Types of AI & How AI \"Thinks\"",
    "subtopics": [
      "Foundation: Narrow AI vs Generative AI (simple examples)",
      "Foundation: How AI 'remembers' — the forgetting curve trick for studying",
      "Advanced: Narrow AI vs Generative AI",
      "Advanced: Basics of Machine Learning",
      "Advanced: How YouTube/Instagram recommend content"
    ],
    "outcome": "Students classify AI tools as Narrow or Generative and grasp the basic ML idea."
  },
  {
    "topic": "Prompting 101",
    "subtopics": [
      "Foundation: What is a prompt?",
      "Foundation: Elements of a good prompt",
      "Foundation: Game: Guess the Prompt",
      "Advanced: Prompt types, zero-shot prompting",
      "Advanced: Elements of a good vs a bad prompt",
      "Advanced: Writing a structured prompt"
    ],
    "outcome": "Students write their first clear, well structured prompts."
  },
  {
    "topic": "Best Prompt vs Worst Prompt",
    "subtopics": [
      "Foundation: Before/after activity: turn a vague prompt into a great one",
      "Foundation: Practice prompting AI for homework help",
      "Advanced: Role-based prompting",
      "Advanced: Chain-of-thought prompting",
      "Advanced: Multi-step prompt chaining"
    ],
    "outcome": "Students confidently write clear, specific, high-quality prompts."
  },
  {
    "topic": "AI Tool 1 — Text & Research Assistants (ChatGPT / Claude / Gemini)",
    "subtopics": [
      "Foundation: Use an AI chatbot for homework help & story writing",
      "Foundation: Fun Q&A with AI",
      "Advanced: Compare ChatGPT vs Claude vs Gemini answers",
      "Advanced: Use AI for research and structured notes"
    ],
    "outcome": "Students use a text AI tool confidently and check its answers critically."
  },
  {
    "topic": "AI Tool 2 — Image Generation (Canva AI / Leonardo AI)",
    "subtopics": [
      "Foundation: Generate AI images/posters from simple prompts",
      "Advanced: Generate & refine AI images",
      "Advanced: Prompt parameters: style, mood, composition"
    ],
    "outcome": "Students create an original AI-generated poster or artwork."
  },
  {
    "topic": "AI Tool 3 & 4 — Video and Music/Voice (Runway/Pika + Suno)",
    "subtopics": [
      "Foundation: Create a short AI video clip",
      "Foundation: Create a fun AI song",
      "Advanced: Storyboard first, then generate AI video + AI song",
      "Advanced: Combine visuals with sound"
    ],
    "outcome": "Students produce a short multimedia piece using AI."
  },
  {
    "topic": "Responsible AI + AI Tool 5 — Study Assistant (NotebookLM)",
    "subtopics": [
      "Foundation: Safe AI usage rules",
      "Foundation: Simple ethics scenarios (what's okay, what's not)",
      "Foundation: Use AI to summarise a chapter",
      "Advanced: AI ethics: bias, deepfakes, data privacy",
      "Advanced: Use AI for structured study notes & summaries"
    ],
    "outcome": "Students understand responsible AI use and use AI as a genuine study aid."
  },
  {
    "topic": "Mini Project 1 — AI Creative Showcase",
    "subtopics": [
      "Foundation: Combine an AI image + AI-written caption/story into one poster",
      "Advanced: Combine AI image + AI video + AI voice/music into one short multimedia piece"
    ],
    "outcome": "First hands-on multi-tool AI project completed and presented to the group."
  },
  {
    "topic": "Smart Learning with AI + Recap Quiz",
    "subtopics": [
      "Foundation: Smart study tips",
      "Foundation: AI-made flashcards",
      "Foundation: Fun recap quiz (Kahoot-style)",
      "Advanced: AI-powered study planning & spaced repetition",
      "Advanced: Recap quiz with bonus challenge round"
    ],
    "outcome": "Students apply AI to their own study habits; Weeks 1-2 concepts reinforced."
  },
  {
    "topic": "Algorithms & Flowcharts",
    "subtopics": [
      "Foundation: Write a simple everyday algorithm (e.g., making a sandwich)",
      "Foundation: Draw a basic flowchart",
      "Advanced: Write an algorithm for a small logic problem",
      "Advanced: Draw a flowchart with decision branches"
    ],
    "outcome": "Students think step-by-step and represent logic visually."
  },
  {
    "topic": "Intro to Programming & Python Setup",
    "subtopics": [
      "Foundation: What is coding?",
      "Foundation: Python intro",
      "Foundation: First 'Hello World' program (Replit/IDLE)",
      "Advanced: Python intro",
      "Advanced: IDLE/Replit walkthrough",
      "Advanced: First program, syntax rules & comments"
    ],
    "outcome": "Python environment is set up; first program runs successfully."
  },
  {
    "topic": "Variables & Data Types",
    "subtopics": [
      "Foundation: Numbers and strings",
      "Foundation: Store a name & age in variables",
      "Advanced: Data types: int, float, str, bool",
      "Advanced: Type casting",
      "Advanced: Taking input() from a user"
    ],
    "outcome": "Students can declare and use variables correctly."
  },
  {
    "topic": "Operators & Simple Calculator (With AI / Without AI)",
    "subtopics": [
      "Foundation: Add, subtract, multiply, divide using operators",
      "Foundation: Build a mini calculator by hand",
      "Advanced: Build a calculator program manually",
      "Advanced: Then ask an AI tool to generate/explain the same program — compare both"
    ],
    "outcome": "Students build a working calculator and compare human-written vs AI-written code."
  },
  {
    "topic": "Conditionals (If-Else)",
    "subtopics": [
      "Foundation: Even/Odd checker",
      "Foundation: Simple if-else programs",
      "Advanced: Nested if-elif-else",
      "Advanced: Build a simple grading system program"
    ],
    "outcome": "Students use decision-making logic inside code."
  },
  {
    "topic": "Loops (For & While)",
    "subtopics": [
      "Foundation: Star & number pattern printing using loops",
      "Advanced: Nested loops",
      "Advanced: Multiplication table generator",
      "Advanced: Pattern challenges"
    ],
    "outcome": "Students automate repetition using loops."
  },
  {
    "topic": "Lists & Basic Functions",
    "subtopics": [
      "Foundation: Create and access a list (e.g., favourite AI tools)",
      "Foundation: Simple function basics",
      "Advanced: List operations: append, sort, loop through",
      "Advanced: Functions with parameters & return values"
    ],
    "outcome": "Students organise data with lists and reuse code with functions."
  },
  {
    "topic": "Mini Project 2 — Python Build Day (AI-Assisted Coding)",
    "subtopics": [
      "Foundation: Build a simple number-guessing game",
      "Foundation: Use AI to help fix bugs",
      "Advanced: Build a quiz game or simple calculator app",
      "Advanced: Use AI to review and improve the code"
    ],
    "outcome": "Students complete a working Python mini-project using AI as a coding assistant."
  },
  {
    "topic": "Automation Basics",
    "subtopics": [
      "Foundation: What is automation?",
      "Foundation: Real-life examples: auto-reply, alarms, smart devices",
      "Advanced: Automation in business: auto-scheduling, chatbots",
      "Advanced: Write a simple script that automates a repetitive task"
    ],
    "outcome": "Students understand automation concepts and see a working example."
  },
  {
    "topic": "AI-Powered Automation Hands-On",
    "subtopics": [
      "Foundation: Explore one simple no-code automation (e.g., an AI auto-reply template)",
      "Advanced: Set up a simple automation using an AI/no-code tool (e.g., Sheets + AI, or a basic flow-builder)"
    ],
    "outcome": "Students set up their first mini automation."
  },
  {
    "topic": "How Websites Work + HTML Basics Part 1",
    "subtopics": [
      "Foundation: Simple explanation of client-server",
      "Foundation: HTML structure, tags, headings, paragraphs",
      "Advanced: How the web works: browser, server, HTML/CSS/JS roles",
      "Advanced: HTML structure & semantic tags"
    ],
    "outcome": "Students create their first HTML page."
  },
  {
    "topic": "HTML Basics Part 2",
    "subtopics": [
      "Foundation: Lists, links, images",
      "Foundation: Build a simple 'About Me' page",
      "Advanced: Lists, links, images, tables, basic forms",
      "Advanced: Build a structured 'About Me' page"
    ],
    "outcome": "Students build a multi-section HTML page."
  },
  {
    "topic": "CSS Basics Part 1",
    "subtopics": [
      "Foundation: Colors, fonts, basic selectors",
      "Foundation: Style the About Me page",
      "Advanced: Selectors, box model, colors/fonts/spacing",
      "Advanced: Style with finer control"
    ],
    "outcome": "Students style their HTML page with CSS."
  },
  {
    "topic": "CSS Basics Part 2 — Layouts",
    "subtopics": [
      "Foundation: Simple Flexbox layout: navbar, cards",
      "Advanced: Flexbox/Grid layouts",
      "Advanced: Basic responsive design (mobile-friendly tweaks)"
    ],
    "outcome": "Students build a structured, well-laid-out webpage."
  },
  {
    "topic": "JavaScript Basics Part 1",
    "subtopics": [
      "Foundation: What is JS?",
      "Foundation: Real-world example: button click changes color/text",
      "Advanced: JS variables & functions",
      "Advanced: Real-world example: interactive counter / like button"
    ],
    "outcome": "Students add their first interactivity to a webpage."
  },
  {
    "topic": "JavaScript Basics Part 2 + AI-Assisted JS",
    "subtopics": [
      "Foundation: Simple to-do list logic using JS",
      "Foundation: Ask AI to explain/improve the code",
      "Advanced: Form validation, to-do list logic",
      "Advanced: Use AI (ChatGPT/Claude) to generate & explain JS snippets"
    ],
    "outcome": "Students build interactive JS features with AI assistance."
  },
  {
    "topic": "Meet Your AI Coding Agent (Setup Day)",
    "subtopics": [
      "Foundation: Install & set up the AI coding agent with guided help",
      "Foundation: First simple prompt-to-code exercise",
      "Advanced: Install & set up the AI coding agent",
      "Advanced: Explore agent features: chat, inline edit, multi-file changes"
    ],
    "outcome": "AI coding agent installed and working; students run their first agent-generated code."
  },
  {
    "topic": "Building with the AI Coding Agent",
    "subtopics": [
      "Foundation: Use the agent to build one webpage section (e.g., hero banner) from a prompt",
      "Advanced: Use the agent to build multiple sections",
      "Advanced: Iterate and refine using follow-up prompts"
    ],
    "outcome": "Students build real webpage sections through AI prompting."
  },
  {
    "topic": "Debugging & Automation with the AI Coding Agent",
    "subtopics": [
      "Foundation: Fix a simple bug with guided agent help",
      "Advanced: Debug independently using the agent",
      "Advanced: Add a small JS automation/interactivity feature"
    ],
    "outcome": "Students practice debugging and enhancing code using an AI agent."
  },
  {
    "topic": "Final Project Kickoff — Creative Website with AI",
    "subtopics": [
      "Foundation: Brief announced",
      "Foundation: Brainstorm website theme & content",
      "Foundation: Plan site structure (site map + sections)",
      "Advanced: Brief announced",
      "Advanced: Plan site structure + decide which AI tools (image/video/text) to use where"
    ],
    "outcome": "Every student has a clear, written plan for their final creative website."
  },
  {
    "topic": "Final Project Build Day 1 — Structure & Content",
    "subtopics": [
      "Foundation: Build HTML structure",
      "Foundation: Add AI-generated text/images with guided agent support",
      "Advanced: Build HTML/CSS structure independently using the AI coding agent",
      "Advanced: Integrate AI-generated content"
    ],
    "outcome": "Website skeleton with real content in place."
  },
  {
    "topic": "Final Project Build Day 2 — Styling & Interactivity",
    "subtopics": [
      "Foundation: Style the site with CSS",
      "Foundation: Add one simple JS interaction, with guided support",
      "Advanced: Polish styling & responsiveness",
      "Advanced: Add JS interactivity",
      "Advanced: Integrate AI-generated video/audio elements"
    ],
    "outcome": "Website is styled and interactive."
  },
  {
    "topic": "Final Project Build Day 3 — Polish, Test & Peer Review",
    "subtopics": [
      "Foundation: Fix visual issues",
      "Foundation: Test all links/buttons",
      "Foundation: Get feedback from a peer",
      "Advanced: Test responsiveness across screen sizes",
      "Advanced: Debug with the agent",
      "Advanced: Peer + trainer feedback round"
    ],
    "outcome": "Website is polished, tested, and feedback-ready."
  },
  {
    "topic": "Presentation Prep + AI Career Guidance",
    "subtopics": [
      "Foundation: Practice presenting the website (2-3 min pitch)",
      "Foundation: Fun intro to AI-related careers",
      "Advanced: Practice presenting the website",
      "Advanced: AI/tech career roadmap discussion",
      "Advanced: Resume/portfolio tips using AI"
    ],
    "outcome": "Students are ready to present and have exposure to future AI career paths."
  },
  {
    "topic": "Graduation Day — Final Presentations & Certification Ceremony",
    "subtopics": [
      "Foundation: Final website presentations",
      "Foundation: Judging",
      "Foundation: Certificates & awards",
      "Advanced: Final website presentations",
      "Advanced: Judging",
      "Advanced: Certificates & awards"
    ],
    "outcome": "Program completed — every student is certified and celebrated."
  }
];

export const BOOTCAMP_START_FALLBACK = new Date(2026, 8, 7); // Sept 7, 2026

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function generateCurriculumDays(startDate: Date): CurriculumDay[] {
  const days: CurriculumDay[] = [];
  const currentGenDate = new Date(startDate.getTime());
  let genIndex = 0;
  
  while (genIndex < rawCurriculumData.length) {
    const dayOfWeek = currentGenDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
      const raw = rawCurriculumData[genIndex];
      days.push({
        dayNumber: genIndex + 1,
        topic: raw.topic,
        subtopics: raw.subtopics,
        outcome: raw.outcome,
        date: new Date(currentGenDate.getTime()),
        dateStr: formatDate(currentGenDate)
      });
      genIndex++;
    }
    currentGenDate.setDate(currentGenDate.getDate() + 1);
  }
  return days;
}

export function getCurriculumDays(startDateStr?: string | null): CurriculumDay[] {
  const start = startDateStr ? new Date(startDateStr) : BOOTCAMP_START_FALLBACK;
  return generateCurriculumDays(start);
}

export function getBootcampEnd(startDateStr?: string | null): Date {
  const days = getCurriculumDays(startDateStr);
  return days[days.length - 1].date;
}

export function getNextLiveSession(now: Date = new Date(), startDateStr?: string | null) {
  const days = getCurriculumDays(startDateStr);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  for (const day of days) {
    const classDateStart = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
    
    if (classDateStart > todayStart) {
      return {
        dayNumber: day.dayNumber,
        topic: day.topic,
        date: day.date,
        status: "upcoming" as const
      };
    } else if (classDateStart.getTime() === todayStart.getTime()) {
      if (now.getHours() < 16) {
        return {
          dayNumber: day.dayNumber,
          topic: day.topic,
          date: day.date,
          status: now.getHours() >= 14 ? ("live" as const) : ("upcoming" as const)
        };
      }
    }
  }
  return null;
}

export function getCompletedDaysCount(now: Date = new Date(), startDateStr?: string | null): number {
  const days = getCurriculumDays(startDateStr);
  let count = 0;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  for (const day of days) {
    const classDateStart = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
    if (classDateStart < todayStart) {
      count++;
    } else if (classDateStart.getTime() === todayStart.getTime()) {
      if (now.getHours() >= 16) {
        count++;
      }
    }
  }
  return count;
}

export function getInitialDates(startDateStr?: string | null) {
  const today = new Date();
  const startRaw = startDateStr ? new Date(startDateStr) : BOOTCAMP_START_FALLBACK;
  const end = getBootcampEnd(startDateStr);
  
  const start = new Date(startRaw.getFullYear(), startRaw.getMonth(), startRaw.getDate());
  const todayClean = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  if (todayClean >= start && todayClean <= end) {
    return { current: today, selected: today };
  }
  return { current: start, selected: start };
}
