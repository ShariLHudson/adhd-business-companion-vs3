/**
 * Mind Map tree mutations for natural visual editing (224).
 */

import type { VisualFocusNode } from "../types";

export function newMindMapNodeId(): string {
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function cloneTree(root: VisualFocusNode): VisualFocusNode {
  return JSON.parse(JSON.stringify(root)) as VisualFocusNode;
}

export function findNode(
  root: VisualFocusNode,
  id: string,
): VisualFocusNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function findParent(
  root: VisualFocusNode,
  id: string,
): VisualFocusNode | null {
  for (const child of root.children) {
    if (child.id === id) return root;
    const found = findParent(child, id);
    if (found) return found;
  }
  return null;
}

export function updateNodeInTree(
  root: VisualFocusNode,
  nodeId: string,
  updater: (n: VisualFocusNode) => VisualFocusNode,
): VisualFocusNode {
  if (root.id === nodeId) return updater(root);
  return {
    ...root,
    children: root.children.map((c) => updateNodeInTree(c, nodeId, updater)),
  };
}

export function renameNode(
  root: VisualFocusNode,
  nodeId: string,
  label: string,
): VisualFocusNode {
  return updateNodeInTree(root, nodeId, (n) => ({
    ...n,
    label: label.trim() || n.label,
  }));
}

export function setNodeNote(
  root: VisualFocusNode,
  nodeId: string,
  notes: string,
): VisualFocusNode {
  return updateNodeInTree(root, nodeId, (n) => ({
    ...n,
    notes: notes.trim() || undefined,
  }));
}

export function addChildNode(
  root: VisualFocusNode,
  parentId: string,
  label = "New idea",
): VisualFocusNode {
  return updateNodeInTree(root, parentId, (n) => ({
    ...n,
    collapsed: false,
    children: [
      ...n.children,
      { id: newMindMapNodeId(), label, children: [] },
    ],
  }));
}

export function removeNodeFromTree(
  root: VisualFocusNode,
  nodeId: string,
): VisualFocusNode {
  if (root.id === nodeId) return root;
  function prune(n: VisualFocusNode): VisualFocusNode {
    return {
      ...n,
      children: n.children
        .filter((c) => c.id !== nodeId)
        .map((c) => prune(c)),
    };
  }
  return prune(root);
}

/** Move node under a new parent (connect). Detaches from old parent. */
export function reparentNode(
  root: VisualFocusNode,
  nodeId: string,
  newParentId: string,
): VisualFocusNode {
  if (nodeId === root.id || nodeId === newParentId) return root;
  const moving = findNode(root, nodeId);
  if (!moving) return root;
  // Prevent cycles: new parent cannot be under moving node
  if (findNode(moving, newParentId)) return root;

  const detached = removeNodeFromTree(root, nodeId);
  return updateNodeInTree(detached, newParentId, (n) => ({
    ...n,
    collapsed: false,
    children: [...n.children, { ...moving, children: [...moving.children] }],
  }));
}

/** Disconnect: promote node to root's children (sibling of former parent branch). */
export function disconnectToRoot(
  root: VisualFocusNode,
  nodeId: string,
): VisualFocusNode {
  if (nodeId === root.id) return root;
  const moving = findNode(root, nodeId);
  if (!moving) return root;
  const parent = findParent(root, nodeId);
  if (!parent || parent.id === root.id) return root;
  const detached = removeNodeFromTree(root, nodeId);
  return {
    ...detached,
    children: [...detached.children, { ...moving, children: [...moving.children] }],
  };
}

export function reorderSibling(
  root: VisualFocusNode,
  nodeId: string,
  direction: "up" | "down",
): VisualFocusNode {
  const parent = findParent(root, nodeId);
  if (!parent) return root;
  const idx = parent.children.findIndex((c) => c.id === nodeId);
  if (idx < 0) return root;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= parent.children.length) return root;
  const next = [...parent.children];
  const tmp = next[idx]!;
  next[idx] = next[swapWith]!;
  next[swapWith] = tmp;
  return updateNodeInTree(root, parent.id, (n) => ({ ...n, children: next }));
}

export function toggleCollapsed(
  root: VisualFocusNode,
  nodeId: string,
): VisualFocusNode {
  return updateNodeInTree(root, nodeId, (n) => ({
    ...n,
    collapsed: !n.collapsed,
  }));
}

/** Flatten tree for layout when collapsed branches are hidden. */
export function visibleSubtree(root: VisualFocusNode): VisualFocusNode {
  if (root.collapsed) {
    return { ...root, children: [] };
  }
  return {
    ...root,
    children: root.children.map((c) => visibleSubtree(c)),
  };
}
