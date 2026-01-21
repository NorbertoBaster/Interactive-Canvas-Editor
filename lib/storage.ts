import type { CanvasNode, Edge } from './types';

const NODES_KEY = 'canvas:nodes';
const EDGES_KEY = 'canvas:edges';
const VIEWPORT_KEY = 'canvas:viewport';

/* ------------------ nodes ------------------ */

export function loadNodes(): CanvasNode[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(NODES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveNodes(nodes: CanvasNode[]) {
  localStorage.setItem(NODES_KEY, JSON.stringify(nodes));
}

/* ------------------ edges ------------------ */

export function loadEdges(): Edge[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(EDGES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveEdges(edges: Edge[]) {
  localStorage.setItem(EDGES_KEY, JSON.stringify(edges));
}

/* ------------------ viewport ------------------ */

export type Viewport = {
  x: number;
  y: number;
  scale: number;
};

export function loadViewport(): Viewport {
  if (typeof window === 'undefined')
    return { x: 0, y: 0, scale: 1 };

  try {
    return JSON.parse(
      localStorage.getItem(VIEWPORT_KEY) ||
        JSON.stringify({ x: 0, y: 0, scale: 1 })
    );
  } catch {
    return { x: 0, y: 0, scale: 1 };
  }
}

export function saveViewport(viewport: Viewport) {
  localStorage.setItem(VIEWPORT_KEY, JSON.stringify(viewport));
}
