"use client";

import RotationChallenge from "./RotationChallenge";

export default function LeftRotationChallenge({ initialRound = 0 }: { initialRound?: number }) {
  return <RotationChallenge direction="left" initialRound={initialRound} />;
}
