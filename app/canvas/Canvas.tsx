'use client';

import { useEffect, useRef, useState } from 'react';
import CanvasNode from './CanvasNode';
import type { CanvasNode as Node, Edge } from '@/lib/types';
import {
  loadNodes,
  saveNodes,
  loadEdges,
  saveEdges,
  loadViewport,
  saveViewport,
  type Viewport,
} from '@/lib/storage';

type DragState = {
  mouse: { x: number; y: number };
  nodes: Map<string, { x: number; y: number }>;
} | null;

export default function Canvas() {
  const [nodes, setNodes] = useState<Node[]>(() => loadNodes());
  const [edges, setEdges] = useState<Edge[]>(() => loadEdges());
  const [viewport, setViewport] = useState<Viewport>(() => loadViewport());

  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const dragStart = useRef<DragState>(null);

  /* ------------------ persistence ------------------ */

  useEffect(() => saveNodes(nodes), [nodes]);
  useEffect(() => saveEdges(edges), [edges]);
  useEffect(() => saveViewport(viewport), [viewport]);

  /* ------------------ helpers ------------------ */

  function getNode(id: string) {
    return nodes.find(n => n.id === id);
  }

  /* ------------------ selection ------------------ */

  function handleNodeSelect(e: React.MouseEvent, node: Node) {
    e.stopPropagation();
    setSelectedEdgeId(null);

    setSelectedNodeIds(prev => {
      const next = new Set(prev);
      if (e.shiftKey) {
        next.has(node.id) ? next.delete(node.id) : next.add(node.id);
      } else {
        next.clear();
        next.add(node.id);
      }
      return next;
    });

    dragStart.current = {
      mouse: { x: e.clientX, y: e.clientY },
      nodes: new Map(
        nodes
          .filter(n => selectedNodeIds.has(n.id) || n.id === node.id)
          .map(n => [n.id, { x: n.x, y: n.y }])
      ),
    };
  }

  function handleEdgeSelect(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setSelectedNodeIds(new Set());
    setSelectedEdgeId(id);
  }

  /* ------------------ dragging ------------------ */

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragStart.current) return;

    const dx = (e.clientX - dragStart.current.mouse.x) / viewport.scale;
    const dy = (e.clientY - dragStart.current.mouse.y) / viewport.scale;

    setNodes(prev =>
      prev.map(n => {
        const start = dragStart.current!.nodes.get(n.id);
        if (!start) return n;
        return { ...n, x: start.x + dx, y: start.y + dy };
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
      x: (e.clientX - rect.left - viewport.x) / viewport.scale,
      y: (e.clientY - rect.top - viewport.y) / viewport.scale,
      text: 'New Node',
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeIds(new Set([newNode.id]));
    setSelectedEdgeId(null);
  }

  /* ------------------ keyboard delete ------------------ */

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedEdgeId) {
          setEdges(prev => prev.filter(e => e.id !== selectedEdgeId));
          setSelectedEdgeId(null);
        } else if (selectedNodeIds.size) {
          setNodes(prev => prev.filter(n => !selectedNodeIds.has(n.id)));
          setEdges(prev =>
            prev.filter(
              e =>
                !selectedNodeIds.has(e.from) &&
                !selectedNodeIds.has(e.to)
            )
          );
          setSelectedNodeIds(new Set());
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedNodeIds, selectedEdgeId]);

  /* ------------------ render ------------------ */

  return (
    <div
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#f9fafb',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transformOrigin: '0 0',
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {/* EDGES */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          {edges.map(edge => {
            const from = getNode(edge.from);
            const to = getNode(edge.to);
            if (!from || !to) return null;

            return (
              <line
                key={edge.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={edge.id === selectedEdgeId ? '#2563eb' : '#9ca3af'}
                strokeWidth={2}
                pointerEvents="stroke"
                onClick={e => handleEdgeSelect(e, edge.id)}
              />
            );
          })}
        </svg>

        {/* NODES */}
        {nodes.map(node => (
          <CanvasNode
            key={node.id}
            node={node}
            selected={selectedNodeIds.has(node.id)}
            onSelect={e => handleNodeSelect(e, node)}
            onChange={updated =>
              setNodes(prev =>
                prev.map(n => (n.id === updated.id ? updated : n))
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
