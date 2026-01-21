'use client';

import { useRef, useState } from 'react';
import type { CanvasNode as Node } from '@/lib/types';

type Props = {
  node: Node;
  selected: boolean;
  onSelect: (e: React.MouseEvent<HTMLDivElement>) => void;
  onChange: (node: Node) => void;
};

export default function CanvasNode({
  node,
  selected,
  onSelect,
  onChange,
}: Props) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDoubleClick() {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...node, text: e.target.value });
  }

  function handleBlur() {
    setEditing(false);
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    onSelect(e);
  }

  return (
    <div
      data-node
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        padding: 8,
        background: 'white',
        border: selected ? '2px solid #2563eb' : '1px solid #d1d5db',
        borderRadius: 6,
        cursor: 'move',
        userSelect: 'none',
        minWidth: 80,
      }}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={node.text}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{
            border: 'none',
            outline: 'none',
            width: '100%',
          }}
        />
      ) : (
        node.text
      )}
    </div>
  );
}
