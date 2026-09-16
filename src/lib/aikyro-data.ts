export type Bloom = "remember" | "understand" | "apply" | "analyse";

export type Concept = {
  id: string;
  name: string;
  bloom: Bloom;
  boardText: string;
  turns: Turn[];
  checkpoint: CheckpointQuestion[];
};

export type Speaker = "teacher" | "basic_student" | "advanced_student" | "learner";

export type Turn = {
  id: string;
  speaker: Speaker;
  type: "dialogue" | "hint" | "blank";
  content: string;
  /** For blank turns: the expected idea, revealed after a guess. */
  answer?: string | undefined;
  hint?: string | undefined;
};

export type CheckpointQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
};

export type Module = {
  id: string;
  name: string;
  blurb: string;
  concepts: Concept[];
};

export const MODULES: Module[] = [
  {
    id: "thermodynamics",
    name: "Thermodynamics",
    blurb: "Energy, heat, and why nothing is ever free.",
    concepts: [
      {
        id: "conservation_of_energy",
        name: "Conservation of Energy",
        bloom: "understand",
        boardText: "Energy is never lost — it only changes address.",
        turns: [
          { id: "t1", speaker: "teacher", type: "dialogue", content: "Why do you think energy changes form instead of disappearing?" },
          { id: "t2", speaker: "basic_student", type: "dialogue", content: "I think it transfers from one object to another." },
          { id: "t3", speaker: "advanced_student", type: "dialogue", content: "The total energy in a closed system remains constant." },
          {
            id: "t4",
            speaker: "teacher",
            type: "blank",
            content: "A ball is dropped. At the moment it hits the floor, most of its energy is ______ energy.",
            answer: "kinetic",
            hint: "Think about what motion carries.",
          },
          { id: "t5", speaker: "teacher", type: "dialogue", content: "Good. So where does that energy go after the bounce fades?" },
          { id: "t6", speaker: "basic_student", type: "dialogue", content: "Into sound and a little heat in the floor?" },
          { id: "t7", speaker: "advanced_student", type: "dialogue", content: "Yes — dissipated, not destroyed. The book-keeping still balances." },
          { id: "t8", speaker: "teacher", type: "hint", content: "Remember: 'lost energy' usually means 'energy I forgot to count'." },
        ],
        checkpoint: [
          {
            id: "c1",
            prompt: "A pendulum slows down over time. What happened to the missing energy?",
            options: ["It was destroyed", "It became heat and sound", "It turned into mass", "It left the universe"],
            answer: "It became heat and sound",
          },
          {
            id: "c2",
            prompt: "In a closed system the total energy is…",
            options: ["Always increasing", "Always decreasing", "Constant", "Random"],
            answer: "Constant",
          },
        ],
      },
      {
        id: "entropy",
        name: "Entropy & Disorder",
        bloom: "analyse",
        boardText: "Order is expensive. Disorder is free.",
        turns: [
          { id: "e1", speaker: "teacher", type: "dialogue", content: "Why does a hot drink cool down but never warm itself back up?" },
          { id: "e2", speaker: "basic_student", type: "dialogue", content: "Because the room is colder than the drink." },
          { id: "e3", speaker: "advanced_student", type: "dialogue", content: "Because spreading the energy out has far more possible arrangements." },
          {
            id: "e4",
            speaker: "teacher",
            type: "blank",
            content: "The measure of how spread out energy is, is called ______.",
            answer: "entropy",
            hint: "It starts with the letter E.",
          },
          { id: "e5", speaker: "teacher", type: "dialogue", content: "So can entropy ever fall in one place?" },
          { id: "e6", speaker: "advanced_student", type: "dialogue", content: "Locally yes — if something else pays with a bigger rise elsewhere." },
        ],
        checkpoint: [
          {
            id: "e-c1",
            prompt: "Entropy in an isolated system tends to…",
            options: ["Decrease", "Stay exactly equal", "Increase", "Oscillate"],
            answer: "Increase",
          },
        ],
      },
    ],
  },
  {
    id: "probability_stats",
    name: "Probability & Statistics",
    blurb: "Reasoning carefully when you cannot be certain.",
    concepts: [
      {
        id: "conditional_probability",
        name: "Conditional Probability",
        bloom: "apply",
        boardText: "New evidence should move your belief — by how much?",
        turns: [
          { id: "p1", speaker: "teacher", type: "dialogue", content: "A test is 99% accurate. You test positive. Are you 99% likely to be ill?" },
          { id: "p2", speaker: "basic_student", type: "dialogue", content: "That sounds right to me — the test is very accurate." },
          { id: "p3", speaker: "advanced_student", type: "dialogue", content: "Not necessarily. It also depends how rare the illness is." },
          {
            id: "p4",
            speaker: "teacher",
            type: "blank",
            content: "How common the illness is beforehand is called the ______ probability.",
            answer: "prior",
            hint: "It comes before the evidence.",
          },
          { id: "p5", speaker: "teacher", type: "dialogue", content: "Exactly. Rare conditions make false positives dominate." },
        ],
        checkpoint: [
          {
            id: "p-c1",
            prompt: "For a very rare disease, a positive result from an accurate test usually means…",
            options: ["You almost certainly have it", "It is still fairly unlikely", "The test is broken", "Nothing at all"],
            answer: "It is still fairly unlikely",
          },
        ],
      },
    ],
  },
];

export const ALL_CONCEPTS = MODULES.flatMap((m) =>
  m.concepts.map((c) => ({ ...c, moduleId: m.id, moduleName: m.name })),
);

export function findConcept(id: string) {
  return ALL_CONCEPTS.find((c) => c.id === id);
}

export const SPEAKER_META: Record<Speaker, { label: string; color: string }> = {
  teacher: { label: "Teacher", color: "var(--teacher)" },
  basic_student: { label: "Basic Student", color: "var(--basic)" },
  advanced_student: { label: "Advanced Student", color: "var(--advanced)" },
  learner: { label: "You", color: "var(--learner)" },
};

export type Quiz = {
  id: string;
  conceptId: string;
  conceptName: string;
  prompt: string;
  answer: string;
  dueIn: string;
  availableNow: boolean;
};

export const PENDING_QUIZZES: Quiz[] = [
  {
    id: "q1",
    conceptId: "conservation_of_energy",
    conceptName: "Conservation of Energy",
    prompt: "In your own words: where does the energy of a bouncing ball end up?",
    answer: "heat",
    dueIn: "Due today",
    availableNow: true,
  },
  {
    id: "q2",
    conceptId: "entropy",
    conceptName: "Entropy & Disorder",
    prompt: "Explain why a tidy room becomes messy more easily than the reverse.",
    answer: "entropy",
    dueIn: "Due today",
    availableNow: true,
  },
  {
    id: "q3",
    conceptId: "conditional_probability",
    conceptName: "Conditional Probability",
    prompt: "Why does a rare illness change how you read a positive test?",
    answer: "prior",
    dueIn: "Unlocks in 2 days",
    availableNow: false,
  },
];

export const BADGES = [
  { code: "first_class", label: "First class attended", emoji: "🎒" },
  { code: "deep_thinker", label: "Asked 5 questions", emoji: "💡" },
  { code: "retained", label: "Concept retained a week later", emoji: "🌱" },
];

export const MASTERY = [
  { conceptId: "conservation_of_energy", name: "Conservation of Energy", state: "retained", score: 92 },
  { conceptId: "entropy", name: "Entropy & Disorder", state: "learning", score: 64 },
  { conceptId: "conditional_probability", name: "Conditional Probability", state: "new", score: 18 },
];

export const OPEN_DOUBTS = [
  { id: "d1", conceptName: "Entropy & Disorder", misconception: "Thinks entropy always means physical mess." },
];
