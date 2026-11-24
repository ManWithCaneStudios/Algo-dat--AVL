import { randomInt } from "node:crypto";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { TutorialExercises } from "./TutorialExercises";

export default async function TutorialSession({ children }: { children: ReactNode }) {
  await connection();
  const seed = randomInt(0, 2147483647);
  return <TutorialExercises key={seed} seed={seed}>{children}</TutorialExercises>;
}
