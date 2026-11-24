"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createExerciseSet, type ExerciseSet } from "@/lib/tutorial-exercises";

const Context = createContext<ExerciseSet | null>(null);
export function TutorialExercises({ seed, children }: { seed: number; children: ReactNode }) {
  const exercises = useMemo(() => createExerciseSet(seed), [seed]);
  return <Context.Provider value={exercises}>{children}</Context.Provider>;
}
export function useTutorialExercises() {
  const exercises = useContext(Context);
  if (!exercises) throw new Error("TutorialExercises provider is missing");
  return exercises;
}
