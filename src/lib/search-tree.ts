export type TreeNode = { value: number; left?: TreeNode; right?: TreeNode };

export function treeHeight(node: TreeNode | undefined): number {
  return node ? 1 + Math.max(treeHeight(node.left), treeHeight(node.right)) : 0;
}

export function findImbalance(node: TreeNode | undefined): { value: number; leftHeight: number; rightHeight: number } | undefined {
  if (!node) return;
  const leftHeight = treeHeight(node.left);
  const rightHeight = treeHeight(node.right);
  if (Math.abs(rightHeight - leftHeight) > 1) return { value: node.value, leftHeight, rightHeight };
  return findImbalance(node.left) ?? findImbalance(node.right);
}

export type TreeCategory = "unordered" | "avl" | "unbalanced";

export function classifyTree(tree: TreeNode): TreeCategory {
  if (!isSearchTree(tree)) return "unordered";
  return findImbalance(tree) ? "unbalanced" : "avl";
}

export function explainCategory(tree: TreeNode): string {
  if (!isSearchTree(tree)) return `${explainTree(tree)} Ohne Suchbaumordnung kann der Baum kein AVL-Baum sein, auch wenn seine Höhen ausgeglichen sind.`;
  const imbalance = findImbalance(tree);
  if (imbalance) return `Die Suchbaumordnung stimmt. Bei Katze ${imbalance.value} hat der linke Teilbaum Höhe ${imbalance.leftHeight} und der rechte Höhe ${imbalance.rightHeight}. Der Unterschied ist ${Math.abs(imbalance.rightHeight - imbalance.leftHeight)} statt höchstens 1. Deshalb ist der Baum kein AVL-Baum.`;
  return "Die Suchbaumordnung stimmt und bei jeder Katze unterscheiden sich die Höhen des linken und rechten Teilbaums um höchstens 1. Der Baum ist ein gültiger AVL-Baum. Beide Seiten müssen nicht genau gleich hoch sein.";
}

export const categoryTrees: TreeNode[] = [
  { value: 40, left: { value: 20 }, right: { value: 60 } },
  { value: 50, left: { value: 25, left: { value: 10 }, right: { value: 65 } }, right: { value: 75, left: { value: 60 }, right: { value: 90 } } },
  { value: 10, right: { value: 20, right: { value: 30, right: { value: 40 } } } },
  { value: 50, left: { value: 30, left: { value: 20 } }, right: { value: 70, right: { value: 90 } } },
  { value: 50, left: { value: 30, left: { value: 20, left: { value: 10 } } }, right: { value: 75, right: { value: 90 } } },
];

export function traceSearch(tree: TreeNode, target: number): { path: number[]; found: boolean } {
  const path: number[] = [];
  let node: TreeNode | undefined = tree;
  while (node) {
    path.push(node.value);
    if (node.value === target) return { path, found: true };
    node = target < node.value ? node.left : node.right;
  }
  return { path, found: false };
}

export function swapTreeValues(tree: TreeNode, first: number, second: number): TreeNode {
  return {
    ...tree,
    value: tree.value === first ? second : tree.value === second ? first : tree.value,
    ...(tree.left ? { left: swapTreeValues(tree.left, first, second) } : {}),
    ...(tree.right ? { right: swapTreeValues(tree.right, first, second) } : {}),
  };
}

export const repairChallenge: { tree: TreeNode; target: number } = {
  target: 30,
  tree: { value: 40, left: { value: 20, left: { value: 10 }, right: { value: 60 } }, right: { value: 70, left: { value: 30 }, right: { value: 85 } } },
};

export function getSearchPath(tree: TreeNode, target: number): number[] {
  const path: number[] = [];
  let current: TreeNode | undefined = tree;
  while (current) {
    path.push(current.value);
    if (current.value === target) return path;
    current = target < current.value ? current.left : current.right;
  }
  return [];
}

// Bounds apply to the entire subtree, not just the immediate children.
export function isSearchTree(node: TreeNode | undefined, min = -Infinity, max = Infinity): boolean {
  if (!node) return true;
  return node.value > min && node.value < max
    && isSearchTree(node.left, min, node.value)
    && isSearchTree(node.right, node.value, max);
}

export function explainTree(node: TreeNode | undefined, min = -Infinity, max = Infinity): string | undefined {
  if (!node) return;
  if (node.value <= min) return `Katze ${node.value} sitzt im rechten Teilbaum von ${min}. Dort müssen alle Zahlen größer als ${min} sein.`;
  if (node.value >= max) return `Katze ${node.value} sitzt im linken Teilbaum von ${max}. Dort müssen alle Zahlen kleiner als ${max} sein.`;
  return explainTree(node.left, min, node.value) ?? explainTree(node.right, node.value, max);
}

export const exampleTrees: TreeNode[] = [
  { value: 40, left: { value: 20 }, right: { value: 60 } },
  { value: 35, left: { value: 50 }, right: { value: 70 } },
  { value: 50, left: { value: 25, left: { value: 10 }, right: { value: 40 } }, right: { value: 80 } },
  { value: 40, left: { value: 20, right: { value: 55 } }, right: { value: 70 } },
  { value: 30, right: { value: 50, right: { value: 75 } } },
];

export function findTreeErrors(node: TreeNode | undefined, min = -Infinity, max = Infinity): { value: number; explanation: string }[] {
  if (!node) return [];
  const errors: { value: number; explanation: string }[] = [];
  if (node.value <= min) errors.push({ value: node.value, explanation: `Katze ${node.value} sitzt im rechten Teilbaum von ${min}. Dort müssen alle Zahlen größer als ${min} sein.` });
  else if (node.value >= max) errors.push({ value: node.value, explanation: `Katze ${node.value} sitzt im linken Teilbaum von ${max}. Dort müssen alle Zahlen kleiner als ${max} sein.` });
  return [...errors, ...findTreeErrors(node.left, min, Math.min(max, node.value)), ...findTreeErrors(node.right, Math.max(min, node.value), max)];
}

// One misplaced leaf, two swapped leaves, and a three-leaf cycle.
export const errorTrees: { tree: TreeNode; wrongValues: number[] }[] = [
  { tree: { value: 50, left: { value: 25, left: { value: 10 }, right: { value: 40 } }, right: { value: 75, left: { value: 35 }, right: { value: 90 } } }, wrongValues: [35] },
  { tree: { value: 50, left: { value: 25, left: { value: 80 }, right: { value: 35 } }, right: { value: 75, left: { value: 60 }, right: { value: 10 } } }, wrongValues: [80, 10] },
  { tree: { value: 60, left: { value: 30, left: { value: 20 }, right: { value: 45 } }, right: { value: 85, left: { value: 70 }, right: { value: 75 } } }, wrongValues: [75] },
  { tree: { value: 45, left: { value: 20, left: { value: 5 }, right: { value: 55 } }, right: { value: 70, left: { value: 35 }, right: { value: 85 } } }, wrongValues: [55, 35] },
  { tree: { value: 50, left: { value: 25, left: { value: 70 }, right: { value: 10 } }, right: { value: 75, left: { value: 35 }, right: { value: 90 } } }, wrongValues: [70, 10, 35] },
];

export const pathChallenges: { tree: TreeNode; target: number }[] = [
  { tree: { value: 50, left: { value: 25, left: { value: 10 }, right: { value: 35 } }, right: { value: 75, left: { value: 60 }, right: { value: 90 } } }, target: 35 },
  { tree: { value: 40, left: { value: 20, left: { value: 10 }, right: { value: 30 } }, right: { value: 70, left: { value: 55 }, right: { value: 85 } } }, target: 55 },
  { tree: { value: 60, left: { value: 30, left: { value: 10 }, right: { value: 45 } }, right: { value: 80, left: { value: 70 }, right: { value: 95 } } }, target: 10 },
  { tree: { value: 45, left: { value: 20, left: { value: 5 }, right: { value: 35 } }, right: { value: 70, left: { value: 55 }, right: { value: 85 } } }, target: 85 },
  { tree: { value: 55, left: { value: 25, left: { value: 10 }, right: { value: 40 } }, right: { value: 80, left: { value: 65 }, right: { value: 95 } } }, target: 55 },
];
