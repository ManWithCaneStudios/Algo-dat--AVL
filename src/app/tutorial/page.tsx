import SearchTreeChallenge from "@/components/level/SearchTreeChallenge";
import TutorialSession from "@/components/level/TutorialSession";
import { Suspense } from "react";
import FindErrorChallenge from "@/components/level/FindErrorChallenge";
import SearchPathChallenge from "@/components/level/SearchPathChallenge";
import RepairSearchChallenge from "@/components/level/RepairSearchChallenge";
import TreeCategoryChallenge from "@/components/level/TreeCategoryChallenge";
import BalanceFactorChallenge from "@/components/level/BalanceFactorChallenge";

type Query = Promise<Record<string, string | string[] | undefined>>;
async function TutorialStart({ searchParams }: { searchParams: Query }) {
  const query = await searchParams;
  const part = process.env.NODE_ENV === "development" ? query.part : undefined;
  const challenge = part === "1.2" ? <FindErrorChallenge /> : part === "1.3" ? <SearchPathChallenge /> : part === "2" ? <RepairSearchChallenge /> : part === "3" ? <TreeCategoryChallenge /> : part === "4.3" ? <BalanceFactorChallenge initialRound={2} /> : <SearchTreeChallenge />;
  return <TutorialSession key={String(part ?? "1.1")}>{challenge}</TutorialSession>;
}
export default function TutorialPage({ searchParams }: { searchParams: Query }) {
  return <Suspense fallback={<p className="m-auto p-8">Kratzbäume werden vorbereitet …</p>}><TutorialStart searchParams={searchParams} /></Suspense>;
}
