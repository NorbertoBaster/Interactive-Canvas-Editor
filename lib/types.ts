export type CanvasNode = {
  id: string;
  x: number;
  y: number;
  text: string;
};
export type CanvasEdge = {
  id: string;
  from: string; // node id
  to: string;   // node id
};
export type Edge = {
  id: string;
  from: string; // node id
  to: string;   // node id
};
