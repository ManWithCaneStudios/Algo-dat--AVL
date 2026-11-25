import { Suspense } from "react";
import RightRotationChallenge from "@/components/level/RightRotationChallenge";
import TutorialSession from "@/components/level/TutorialSession";

export default function LevelSixPage() {
  return <Suspense fallback={<p className="m-auto p-8">Kratzbäume werden vorbereitet …</p>}><TutorialSession><RightRotationChallenge /></TutorialSession></Suspense>;
}
