'use client';

import { useEffect, useRef, useState } from 'react';
import CanvasNode from './CanvasNode';
import type { CanvasNode as Node } from '@/lib/types';
import { loadNodes, saveNodes } from '@/lib/storage';

type DragState = {
  mouse: { x: number; y: number };
  nodes: Map<string, { x: number; y: number }>;
} | null;

export default function Canvas() {
  const [nodes, setNodes] = useState<Node[]>(() => loadNodes());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showHelp, setShowHelp] = useState(false);

  const dragStart = useRef<DragState>(null);

  /* ------------------ persistence ------------------ */

  useEffect(() => {
    saveNodes(nodes);
  }, [nodes]);

  /* ------------------ keyboard shortcuts ------------------ */

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Toggle help
      if (e.key === '?') {
        setShowHelp(true);
      }

      if (e.key === 'Escape') {
        setShowHelp(false);
      }

      // Delete nodes
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setNodes(prev => prev.filter(n => !selectedIds.has(n.id)));
        setSelectedIds(new Set());
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIds]);

  /* ------------------ selection ------------------ */

  function handleSelect(
    e: React.MouseEvent<HTMLDivElement>,
    node: Node
  ) {
    e.stopPropagation();

    setSelectedIds(new Set([node.id]));

    dragStart.current = {
      mouse: { x: e.clientX, y: e.clientY },
      nodes: new Map([[node.id, { x: node.x, y: node.y }]]),
    };
  }

  /* ------------------ dragging ------------------ */

  function handleMouseMove(e: React.MouseEvent) {
    const drag = dragStart.current;
    if (!drag) return;

    const dx = e.clientX - drag.mouse.x;
    const dy = e.clientY - drag.mouse.y;

    setNodes(prev =>
      prev.map(n => {
        const start = drag.nodes.get(n.id);
        if (!start) return n;
        return {
          ...n,
          x: start.x + dx,
          y: start.y + dy,
        };
      })
    );
  }

  function handleMouseUp() {
    dragStart.current = null;
  }

  /* ------------------ canvas click ------------------ */

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('[data-node]')) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const newNode: Node = {
      id: crypto.randomUUID(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      text: 'New Node',
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedIds(new Set([newNode.id]));
  }

  /* ------------------ clear canvas ------------------ */

  function clearCanvas() {
    setNodes([]);
    setSelectedIds(new Set());
    localStorage.removeItem('nodes');
  }

  /* ------------------ render ------------------ */

  const isEmpty = nodes.length === 0;

  return (
    <>
      {/* Clear canvas button */}
      <button
        onClick={clearCanvas}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 10,
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid #d1d5db',
          background: 'white',
          cursor: 'pointer',
        }}
      >
        Clear canvas
      </button>

      {/* Help overlay */}
      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              padding: 24,
              borderRadius: 12,
              width: 360,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>
              Keyboard shortcuts
            </h2>
            <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
              <li><b>Click</b> — create node</li>
              <li><b>Drag</b> — move node</li>
              <li><b>Double-click</b> — edit text</li>
              <li><b>Delete / Backspace</b> — delete selected</li>
              <li><b>?</b> — open this help</li>
              <li><b>Esc</b> — close</li>
            </ul>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
          background: '#f9fafb',
        }}
      >
        {/* Empty state */}
        {isEmpty && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'rgba(59,130,246,0.15)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />

            <div
              style={{
                position: 'relative',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: 16,
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 6 }}>
                Click anywhere to create a node
              </div>
              <div>Press ? for help</div>
            </div>

            <style>{`
              @keyframes pulse {
                0% { transform: scale(0.9); opacity: 0.6; }
                50% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0.9); opacity: 0.6; }
              }
            `}</style>
          </div>
        )}

        {nodes.map(node => (
          <CanvasNode
            key={node.id}
            node={node}
            selected={selectedIds.has(node.id)}
            onSelect={e => handleSelect(e, node)}
            onChange={updated =>
              setNodes(prev =>
                prev.map(n => (n.id === updated.id ? updated : n))
              )
            }
          />
        ))}
      </div>
    </>
  );
}
