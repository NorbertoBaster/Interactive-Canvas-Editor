Interactive Canvas Editor

An interactive, node-based canvas editor inspired by tools like Miro, Whimsical, and Excalidraw.

Built to showcase complex frontend interaction, state management, and performance-aware React patterns using Next.js App Router.

✨ Features

Create nodes by clicking on the canvas

Drag single or multiple selected nodes

Inline text editing

Connect nodes with edges

Select and delete nodes or edges

Empty-state onboarding guidance (no blank screen)

Clear Canvas button for demo/reset

Keyboard shortcuts:

Delete / Backspace – delete selection

Esc – clear selection

Ctrl / Cmd + A – select all

? – toggle in-app help

Pan & zoom support

Persistent state (nodes, edges, viewport) via localStorage

🧭 First-Time User Experience

When the canvas is empty, the editor provides:

Visual guidance prompting users to create their first node

Discoverable interactions without reading documentation

The goal is immediate usability within seconds.

🧠 Technical Focus

This project emphasizes interactive frontend architecture over backend complexity.

It demonstrates:

Managing complex UI state without external state libraries

Mixing declarative React state with imperative refs for performance

Precise mouse & keyboard event handling

SVG + DOM coordination

Persistence and serialization of editor state

🏗️ Architecture Overview

Canvas – owns global state (nodes, edges, selection, viewport)

CanvasNode – presentational + interaction component

Edges – rendered via SVG and synced to node positions

Viewport – pan & zoom via CSS transforms

Why refs for dragging?
To avoid re-renders on every mouse move and keep dragging smooth.

💾 Persistence

Stored in localStorage:

Nodes

Edges

Viewport position and zoom level

The editor restores its exact state on reload.

🚧 Future Improvements

Undo / redo

Edge snapping

Minimap

Collaboration

Backend persistence

🛠️ Tech Stack

Next.js (App Router)

React

TypeScript

Tailwind CSS

SVG

🎯 What This Project Shows

Ability to build complex interactive UIs

Strong React fundamentals and performance awareness

Thoughtful UX and onboarding decisions

Scalable frontend architecture

🚀 Getting Started
npm install
npm run dev