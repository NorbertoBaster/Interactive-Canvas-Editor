'use client';

import { useEffect, useRef, useState } from 'react';
import CanvasNode from './CanvasNode';
import type { CanvasNode as Node } from '@/lib/types';
import { loadNodes, saveNodes } from '@/lib/storage';

type DragState = {
  mouse: { x: number; y: number };
  nodes: Map<string, { x: number; y: number }>; // nodeId -> start pos
} | null;

export default function Canvas() {
  const [nodes, setNodes] = useState<Node[]>(() => loadNodes());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showHelp, setShowHelp] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const dragStart = useRef<DragState>(null);
  const panStart = useRef<{ x: number; y: number } | null>(null);

  const GROUP_DISTANCE = 60; // pixels in world coordinates

  /* ------------------ persistence ------------------ */
  useEffect(() => {
    saveNodes(nodes);
  }, [nodes]);

  /* ------------------ keyboard ------------------ */
  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      if (e.key === '?') setShowHelp(true);
      if (e.key === 'Escape') setShowHelp(false);
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setNodes(prev => prev.filter(n => !selectedIds.has(n.id)));
        setSelectedIds(new Set());
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIds]);

  /* ------------------ selection & drag ------------------ */
  function handleSelect(e: React.MouseEvent<HTMLDivElement>, node: Node) {
    e.stopPropagation();
    if (!selectedIds.has(node.id)) {
      setSelectedIds(new Set([node.id]));
    }

    // Initialize drag for selected nodes
    dragStart.current = {
      mouse: { x: e.clientX, y: e.clientY },
      nodes: new Map(
        Array.from(selectedIds).map(id => {
          const n = nodes.find(n => n.id === id) || node;
          return [id, { x: n.x, y: n.y }] as const;
        })
      ),
    };
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    // Node dragging
    if (dragStart.current) {
      const drag = dragStart.current;
      const dx = (e.clientX - drag.mouse.x) / zoom;
      const dy = (e.clientY - drag.mouse.y) / zoom;

      setNodes(prev =>
        prev.map(n => {
          const start = drag.nodes.get(n.id);

          // Proximity detection: add nearby nodes to drag
          if (!start && selectedIds.size > 0) {
            const isNear = Array.from(selectedIds).some(id => {
              const selNode = prev.find(x => x.id === id);
              if (!selNode) return false;
              const dist = Math.hypot(n.x - selNode.x, n.y - selNode.y);
              return dist < GROUP_DISTANCE;
            });
            if (isNear) {
              drag.nodes.set(n.id, { x: n.x, y: n.y }); // include in drag
            }
          }

          if (!drag.nodes.has(n.id)) return n;
          const s = drag.nodes.get(n.id)!;
          return { ...n, x: s.x + dx, y: s.y + dy };
        })
      );
    }

    // Canvas panning
    if (panStart.current && !dragStart.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({ x: pan.x + dx, y: pan.y + dy });
      panStart.current = { x: e.clientX, y: e.clientY };
    }
  }

  function handleMouseUp() {
    dragStart.current = null;
    panStart.current = null;
    setIsPanning(false);
  }

  /* ------------------ canvas click ------------------ */
  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('[data-node]')) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const newNode: Node = {
      id: crypto.randomUUID(),
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
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

  /* ------------------ wheel zoom ------------------ */
  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(prev * delta, 4)));
  }

  /* ------------------ pan start ------------------ */
  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('[data-node]')) return;
    panStart.current = { x: e.clientX, y: e.clientY };
    setIsPanning(true);
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
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>Keyboard shortcuts</h2>
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
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: '#f9fafb',
          cursor: isPanning ? 'grabbing' : 'default',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'relative',
          }}
        >
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
                <div style={{ fontSize: 18, marginBottom: 6 }}>Click anywhere to create a node</div>
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
      </div>
    </>
  );
}
