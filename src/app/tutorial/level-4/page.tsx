import { Suspense } from "react";
import BalanceFactorChallenge from "@/components/level/BalanceFactorChallenge";
import TutorialSession from "@/components/level/TutorialSession";

export default function LevelFourPage() {
  return <Suspense fallback={<p className="m-auto p-8">Kratzbäume werden vorbereitet …</p>}><TutorialSession><BalanceFactorChallenge /></TutorialSession></Suspense>;
}
