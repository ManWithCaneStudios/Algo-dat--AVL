import { Suspense } from "react";
import LeftRotationChallenge from "@/components/level/LeftRotationChallenge";
import TutorialSession from "@/components/level/TutorialSession";

export default function LevelFivePage() {
  return <Suspense fallback={<p className="m-auto p-8">Kratzbäume werden vorbereitet …</p>}><TutorialSession><LeftRotationChallenge /></TutorialSession></Suspense>;
}
