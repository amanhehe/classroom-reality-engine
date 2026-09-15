import { useCallback, useEffect, useState } from "react";
import type { Concept } from "./aikyro-data";

export type AskedQuestion = {
  id: string;
  conceptId: string;
  conceptName: string;
  question: string;
  answer: string;
  at: string;
};

export type LearnerState = {
  name: string;
  points: number;
  askedQuestions: AskedQuestion[];
  customConcepts: Concept[];
  completedCheckpoints: Record<string, number>;
  answeredQuizzes: string[];
  settings: {
    readAloud: boolean;
    reducedDialogue: boolean;
    multimodal: boolean;
    captions: boolean;
  };
};

const KEY = "aikyro_learner_state";

export const DEFAULT_STATE: LearnerState = {
  name: "Student",
  points: 120,
  askedQuestions: [],
  customConcepts: [],
  completedCheckpoints: {},
  answeredQuizzes: [],
  settings: { readAloud: true, reducedDialogue: false, multimodal: false, captions: true },
};

function read(): LearnerState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as LearnerState) };
  } catch {
    return DEFAULT_STATE;
  }
}

/** Reads on mount only, so server and first client render always match. */
export function useLearner() {
  const [state, setState] = useState<LearnerState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(read());
    setReady(true);
  }, []);

  const update = useCallback((next: Partial<LearnerState> | ((prev: LearnerState) => LearnerState)) => {
    setState((prev) => {
      const value = typeof next === "function" ? next(prev) : { ...prev, ...next };
      if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(value));
      return value;
    });
  }, []);

  const addPoints = useCallback(
    (amount: number) => update((prev) => ({ ...prev, points: prev.points + amount })),
    [update],
  );

  return { state, update, addPoints, ready };
}
