# Interactive Canvas Editor

An interactive, node-based canvas editor inspired by tools like Miro, Whimsical, and Excalidraw.

This project focuses on complex client-side interaction, state management, and performance-conscious React patterns using **Next.js App Router**.

---

## ✨ Features

- Create nodes by clicking on the canvas
- Drag single or multiple selected nodes
- Inline text editing
- Connect nodes with edges
- Select and delete nodes or edges
- Keyboard shortcuts:
  - `Delete / Backspace` – delete selection
  - `Esc` – clear selection
  - `Ctrl / Cmd + A` – select all
- Pan & zoom support
- Persistent state (nodes, edges, viewport) via `localStorage`

---

## 🧠 Technical Focus

This project intentionally emphasizes **interactive frontend architecture** over backend complexity.

Key areas demonstrated:
- Managing complex UI state without external state libraries
- Combining declarative React state with imperative refs
- Precise mouse & keyboard event handling
- SVG + DOM coordination
- Persistence and serialization of editor state

---

## 🏗️ Architecture Overview

### Core Concepts

- **Canvas**  
  Owns global state: nodes, edges, selection, viewport.

- **CanvasNode**  
  Pure presentational + interaction component (drag, edit, select).

- **Edges**  
  Rendered using SVG and synced to node positions.

- **Viewport**  
  Controls pan and zoom using CSS transforms.

### Why refs are used for dragging

Drag state is stored in `useRef` instead of React state to:
- Avoid re-renders on every mouse movement
- Maintain smooth dragging performance
- Separate transient interaction state from persistent UI state

---

## 🧪 State Management Decisions

- No global state library (Redux/Zustand)  
  → Local component state is sufficient and clearer for this scope.

- No canvas/WebGL rendering  
  → DOM + SVG allow easier hit testing, accessibility, and styling.

- No backend  
  → The focus is frontend interaction patterns, not CRUD infrastructure.

---

## 💾 Persistence Strategy

The following data is persisted in `localStorage`:
- Nodes
- Edges
- Viewport position and zoom level

This allows the editor to restore the exact state on reload, similar to real-world design tools.

---

## 🚧 Tradeoffs & Future Improvements

If this were expanded further:
- Add undo / redo history
- Edge snapping & connection handles
- Minimap overview
- Multi-user collaboration
- Backend persistence

These were intentionally excluded to keep the focus on core interaction quality.

---

## 🛠️ Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS (minimal use)
- SVG for edges

---

## 🎯 What This Project Demonstrates

- Comfort with complex interactive UIs
- Understanding of React performance tradeoffs
- Ability to design scalable frontend architecture
- Attention to real-world UX details

---

## 🚀 Getting Started

```bash
npm install
npm run dev
