import type { TreeNode } from "./search-tree";

export type LeftRotation = { tree: TreeNode; shelf?: TreeNode; pivot: number; lifted: number };
export type RotationDirection = "left" | "right";

export function parentOf(tree: TreeNode, value: number): TreeNode | undefined {
  if (tree.left?.value === value || tree.right?.value === value) return tree;
  return (tree.left && parentOf(tree.left, value)) || (tree.right && parentOf(tree.right, value));
}

// The inner subtree is kept intact on the shelf; no nodes are discarded.
export function liftRightChild(tree: TreeNode, value: number): LeftRotation | undefined {
  const parent = parentOf(tree, value);
  if (!parent || parent.right?.value !== value) return;
  const lifted = parent.right;
  function replace(node: TreeNode): TreeNode {
    if (node.value === parent!.value) return { ...lifted, left: { ...parent!, right: undefined } };
    return { ...node, ...(node.left ? { left: replace(node.left) } : {}), ...(node.right ? { right: replace(node.right) } : {}) };
  }
  return { tree: replace(tree), shelf: lifted.left, pivot: parent.value, lifted: value };
}

export function liftLeftChild(tree: TreeNode, value: number): LeftRotation | undefined {
  const parent = parentOf(tree, value);
  if (!parent || parent.left?.value !== value) return;
  const lifted = parent.left;
  function replace(node: TreeNode): TreeNode {
    if (node.value === parent!.value) return { ...lifted, right: { ...parent!, left: undefined } };
    return { ...node, ...(node.left ? { left: replace(node.left) } : {}), ...(node.right ? { right: replace(node.right) } : {}) };
  }
  return { tree: replace(tree), shelf: lifted.right, pivot: parent.value, lifted: value };
}

export type BranchSide = "left" | "right";

export function attachBranch(tree: TreeNode, parent: number, side: BranchSide, branch: TreeNode): TreeNode {
  let found = false;
  function visit(node: TreeNode): TreeNode {
    if (node.value === parent) {
      if (node[side]) throw new Error("Dieser Platz ist bereits belegt.");
      found = true;
      return { ...node, [side]: branch };
    }
    return { ...node, ...(node.left ? { left: visit(node.left) } : {}), ...(node.right ? { right: visit(node.right) } : {}) };
  }
  const attached = visit(tree);
  if (!found) throw new Error("Die Elternkatze wurde nicht gefunden.");
  return attached;
}

export function attachInnerBranch(tree: TreeNode, parent: number, branch: TreeNode): TreeNode {
  return attachBranch(tree, parent, "right", branch);
}
