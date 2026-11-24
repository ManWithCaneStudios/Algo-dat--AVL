import { categoryTrees, errorTrees, exampleTrees, pathChallenges, repairChallenge, type TreeNode, treeHeight } from "./search-tree";

export function nodeFacts(tree: TreeNode): { node: TreeNode; left: number; right: number; bf: number }[] {
  const left = treeHeight(tree.left), right = treeHeight(tree.right);
  return [...(tree.left ? nodeFacts(tree.left) : []), ...(tree.right ? nodeFacts(tree.right) : []), { node: tree, left, right, bf: right - left }];
}

const balanceTemplates: TreeNode[] = [
  { value: 40, left: { value: 20, left: { value: 10, left: { value: 5 } } }, right: { value: 60 } },
  { value: 40, left: { value: 20 }, right: { value: 60, left: { value: 50 }, right: { value: 80, right: { value: 90 } } } },
  { value: 50, left: { value: 30, left: { value: 20, left: { value: 10 } } }, right: { value: 80, left: { value: 70 }, right: { value: 90 } } },
];

const rotationTemplates: TreeNode[] = [
  { value: 20, right: { value: 40, right: { value: 60 } } },
  { value: 30, left: { value: 10 }, right: { value: 60, left: { value: 45 }, right: { value: 80, right: { value: 90 } } } },
  { value: 40, left: { value: 20 }, right: { value: 80, left: { value: 60, right: { value: 70 } }, right: { value: 100, right: { value: 110 } } } },
];

// Mirroring plus reversed value ranks preserves ordering violations and balance.
export function createExerciseSet(seed: number) {
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  function variant(tree: TreeNode, forcedMirror?: boolean) {
    const original = nodeFacts(tree).map(fact => fact.node.value).sort((a, b) => a - b);
    const mirror = forcedMirror ?? random() < .5;
    let next = 5 + Math.floor(random() * 15);
    const numbers = original.map(() => (next += 3 + Math.floor(random() * 7)));
    const mapped = new Map(original.map((value, index) => [value, numbers[mirror ? numbers.length - 1 - index : index]]));
    function build(node: TreeNode): TreeNode {
      const left = mirror ? node.right : node.left, right = mirror ? node.left : node.right;
      return { value: mapped.get(node.value)!, ...(left ? { left: build(left) } : {}), ...(right ? { right: build(right) } : {}) };
    }
    return { tree: build(tree), value: (value: number) => mapped.get(value)! };
  }
  const balanceMirror = random() < .5;
  return {
    exampleTrees: exampleTrees.map(tree => variant(tree).tree),
    errorTrees: errorTrees.map(({ tree, wrongValues }) => { const v = variant(tree); return { tree: v.tree, wrongValues: wrongValues.map(v.value) }; }),
    pathChallenges: pathChallenges.map(({ tree, target }) => { const v = variant(tree); return { tree: v.tree, target: v.value(target) }; }),
    categoryTrees: categoryTrees.map(tree => variant(tree).tree),
    repairChallenge: (() => { const v = variant(repairChallenge.tree); return { tree: v.tree, target: v.value(repairChallenge.target) }; })(),
    balanceRounds: balanceTemplates.map((tree, index) => {
      const generated = variant(tree, balanceMirror).tree;
      const facts = nodeFacts(generated);
      const manualValues = index === 0 ? facts.map(f => f.node.value) : facts.filter(f => f.node.left || f.node.right).slice(index === 1 ? 0 : -3).map(f => f.node.value);
      return { tree: generated, manualValues };
    }),
    rotationRounds: rotationTemplates.map(tree => variant(tree, false).tree),
  };
}

export type ExerciseSet = ReturnType<typeof createExerciseSet>;
