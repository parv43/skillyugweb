export interface CurriculumDay {
  dayNumber: number;
  topic: string;
  subtopics: string[];
  outcome: string;
  date: Date;
  dateStr: string; // "YYYY-MM-DD"
}

export const BOOTCAMP_START = new Date(2026, 4, 28); // May 28, 2026 (Month is 0-indexed: 4 = May)

const rawCurriculumData = [
  {
    topic: "Introduction to AI",
    subtopics: [
      "Introduction to AI",
      "What AI can Do",
      "How AI helps",
      "Some fun activities using AI",
      "Daily Life AI Usage",
      "How different platforms use AI"
    ],
    outcome: "Students get an idea of what AI is all about"
  },
  {
    topic: "Types of AI and Memory Trick",
    subtopics: [
      "Narrow AI",
      "Generative AI",
      "AI VS HUMAN",
      "How AI works for YouTube, Insta, Google",
      "Chat Bot Showcase",
      "How AI remember and the forgetting curve"
    ],
    outcome: "Students will get an Idea about different types of AI. How does AI help any application to show data"
  },
  {
    topic: "Understanding Prompt",
    subtopics: [
      "What is Prompt",
      "How to write a prompt",
      "Zero-shot Prompting",
      "Types of Prompt",
      "Elements of a Good Prompt"
    ],
    outcome: "Students get an Idea about prompt writing and how to give prompts to the computer"
  },
  {
    topic: "AI Tools (Text Generator Tool and Scripting Tool)",
    subtopics: [
      "Using AI Generate: Text",
      "Story Telling",
      "Understand the concept"
    ],
    outcome: "Here student will learn the Text tools"
  },
  {
    topic: "AI Tools (Image Generator and Audio video generator Tools)",
    subtopics: [
      "Using AI Generate: Image",
      "Audio",
      "Video Tools"
    ],
    outcome: "Here student will learn the image , audio and Video tools"
  },
  {
    topic: "GEN AI Foundation",
    subtopics: [
      "AI and ML and Gen AI Explanation with a practical example"
    ],
    outcome: "Student will learn about Gen AI foundation"
  },
  {
    topic: "Responsible AI and AI Creative Day",
    subtopics: [
      "AI ethics",
      "Safe AI usage",
      "Scenario discussion",
      "Creative Task to students"
    ],
    outcome: "By learning, this student will use AI mindfully"
  },
  {
    topic: "Smart Learning (How to study smart)",
    subtopics: [
      "What is Smart Learning?",
      "Smart Study vs Hard Study (simple examples)",
      "Common Problems While Studying",
      "Easy Smart Study Tips"
    ],
    outcome: "Here students will learn how AI can increase their smart study pattern and how to become a fast learner"
  },
  {
    topic: "Fast Addition Techniques (Mental math challenge)",
    subtopics: [
      "Quiz Using AI",
      "Faster calculations"
    ],
    outcome: "Vedic Math concept"
  },
  {
    topic: "Multiplication Tricks (Activity: Speed test)",
    subtopics: [
      "Improved speed"
    ],
    outcome: "Vedic Math concept"
  },
  {
    topic: "Division Tricks (Activity: Practice round)",
    subtopics: [
      "Accuracy"
    ],
    outcome: "Vedic Math concept"
  },
  {
    topic: "Logical Thinking for Problem Solving and Activity Day",
    subtopics: [
      "Strong thinking ability"
    ],
    outcome: "Logical Thinking development"
  },
  {
    topic: "Algorithms",
    subtopics: [
      "Algorithm Writing"
    ],
    outcome: "Systematic Way of Writing Procedure"
  },
  {
    topic: "Flowchart",
    subtopics: [
      "Flow chart writing"
    ],
    outcome: "Systematic Way of Drawing procedure"
  },
  {
    topic: "How AI Learns",
    subtopics: [
      "Data + pattern (simple)"
    ],
    outcome: "Concept clarity"
  },
  {
    topic: "Project Development (Part 1)",
    subtopics: [
      "Project For using algorithm and the flow chart"
    ],
    outcome: "Systematic implementation of algorithm & flow chart"
  },
  {
    topic: "Programming Language Introduction & Python Introduction",
    subtopics: [
      "Introduction to Programming",
      "Python Introduction",
      "Python IDLE walkthrough"
    ],
    outcome: "Python Language Basic learning"
  },
  {
    topic: "Variables and Data Types",
    subtopics: [
      "Variable Types",
      "Data Type"
    ],
    outcome: "Python Language Basic learning"
  },
  {
    topic: "Input and Output (Activity: User input program)",
    subtopics: [
      "Printing and Input"
    ],
    outcome: "Python Language Basic learning"
  },
  {
    topic: "Operators",
    subtopics: [
      "Operator Types",
      "Simple calculator program",
      "Formatted input"
    ],
    outcome: "Python Language Basic learning"
  },
  {
    topic: "Conditions",
    subtopics: [
      "If else statement",
      "Even Odd Identification"
    ],
    outcome: "Python Language Basic learning"
  },
  {
    topic: "Project Development (Part 2)",
    subtopics: [
      "Project using Python Program"
    ],
    outcome: "Hands-on Python project implementation"
  },
  {
    topic: "Canva Basic – AI Canva",
    subtopics: [
      "Canva Design",
      "AI Feature in Canva"
    ],
    outcome: "Design Concept"
  },
  {
    topic: "Create Presentation , Reels , AI Story , AI Script Writing",
    subtopics: [
      "Creation mode"
    ],
    outcome: "Writing and Thinking Creativity"
  },
  {
    topic: "Graduation Ceremony",
    subtopics: [
      "Certificates",
      "Awards",
      "Recognition Prizes for: Best Project, Most Creative Student, Coding Star, AI Innovator"
    ],
    outcome: "Celebrate course completion and student achievements"
  }
];

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const CURRICULUM_DAYS: CurriculumDay[] = [];

// Populate dates dynamically skipping weekends
let currentGenDate = new Date(BOOTCAMP_START.getTime());
let genIndex = 0;
while (genIndex < rawCurriculumData.length) {
  const dayOfWeek = currentGenDate.getDay();
  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
    const raw = rawCurriculumData[genIndex];
    CURRICULUM_DAYS.push({
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

export const BOOTCAMP_END = CURRICULUM_DAYS[CURRICULUM_DAYS.length - 1].date;

export function getNextLiveSession(now: Date = new Date()) {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  for (const day of CURRICULUM_DAYS) {
    const classDateStart = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
    
    if (classDateStart > todayStart) {
      return {
        dayNumber: day.dayNumber,
        topic: day.topic,
        date: day.date,
        status: "upcoming" as const
      };
    } else if (classDateStart.getTime() === todayStart.getTime()) {
      // It's today! Class runs 2:00 PM - 3:00 PM IST (so we keep showing it until 4 PM / 16:00)
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
  return null; // All classes completed
}

export function getCompletedDaysCount(now: Date = new Date()): number {
  let count = 0;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  for (const day of CURRICULUM_DAYS) {
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

export function getInitialDates() {
  const today = new Date();
  // We want to make sure it selects today's date if it's within range
  const start = new Date(BOOTCAMP_START.getFullYear(), BOOTCAMP_START.getMonth(), BOOTCAMP_START.getDate());
  const end = new Date(BOOTCAMP_END.getFullYear(), BOOTCAMP_END.getMonth(), BOOTCAMP_END.getDate());
  const todayClean = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  if (todayClean >= start && todayClean <= end) {
    return { current: today, selected: today };
  }
  // If outside bootcamp range, default to showing the first class
  return { current: new Date(2026, 5, 1), selected: new Date(2026, 4, 28) };
}
