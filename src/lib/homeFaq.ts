export interface HomeFaqItem {
  question: string
  answer: string
  href?: string
  linkLabel?: string
}

export const homeFaqItems: HomeFaqItem[] = [
  {
    question: "What exactly will my child learn at Skillyug?",
    answer:
      "Students learn how to use practical AI tools like ChatGPT, Canva AI, Gamma, and visual workflow tools to research faster, build presentations, create projects, and think more critically about AI output.",
    href: "/#what-they-learn",
    linkLabel: "See the tools we teach",
  },
  {
    question: "Is this suitable for a Class 8 student?",
    answer:
      "Yes. Skillyug is designed for Class 6 to Class 12 students. The bootcamp focuses on age-appropriate AI skills, project work, and guided practice rather than advanced coding prerequisites.",
    href: "/blog/ai-basics-for-class-6-12",
    linkLabel: "Read the AI basics guide",
  },
  {
    question: "What kind of projects do students build?",
    answer:
      "Students create presentations, visual explainers, AI-assisted research workflows, prompt-driven creative assets, and practical school-ready projects that help them present ideas clearly and confidently.",
    href: "/#projects",
    linkLabel: "View student project examples",
  },
  {
    question: "How does the ₹49 demo class work?",
    answer:
      "The ₹49 demo class is a live introductory session that lets parents and students experience the teaching style, tools, and bootcamp format before committing to the full program.",
    href: "/book-demo",
    linkLabel: "Book the ₹49 demo class",
  },
  {
    question: "What is the ₹299 course or spot booking for?",
    answer:
      "The ₹299 booking is the paid step used to reserve a seat for the upcoming bootcamp session. It is separate from the ₹49 demo and is meant for families ready to secure a bootcamp spot.",
    href: "/book-slot",
    linkLabel: "Reserve the ₹299 spot",
  },
]
