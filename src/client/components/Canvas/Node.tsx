import { useState } from "react";
import { getServiceDef } from "../../lib/aws-services";
import type { CanvasNode } from "../../types";

interface NodeProps {
  node: CanvasNode;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string, startX: number, startY: number) => void;
  onConnectStart: (id: string) => void;
  onConnectEnd: (id: string) => void;
}

export default function Node({
  node,
  isSelected,
  isConnecting,
  onSelect,
  onDragStart,
  onConnectStart,
  onConnectEnd,
}: NodeProps) {
  const service = getServiceDef(node.type);
  const color = service?.color || "#666";
  const [hovered, setHovered] = useState(false);

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (isConnecting) {
          onConnectEnd(node.id);
          return;
        }
        onSelect(node.id);
        onDragStart(node.id, e.clientX, e.clientY);
      }}
      className="cursor-move"
    >
      <rect
        width={node.width}
        height={node.height}
        rx={8}
        fill="var(--node-body)"
        stroke={isSelected ? "var(--node-selected-border)" : color}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />
      <rect width={node.width} height={24} rx={8} fill={color} opacity={0.9} />
      <rect x={0} y={16} width={node.width} height={8} fill={color} opacity={0.9} />
      <text
        x={node.width / 2}
        y={15}
        textAnchor="middle"
        fill="white"
        fontSize={10}
        fontWeight="bold"
      >
        {service?.name || node.type}
      </text>
      <text
        x={node.width / 2}
        y={node.height / 2 + 10}
        textAnchor="middle"
        fill="var(--text)"
        fontSize={10}
      >
        {node.label}
      </text>

      {/* Connection port (bottom center) - visible on hover */}
      {(hovered || isSelected) && !isConnecting && (
        <circle
          cx={node.width / 2}
          cy={node.height}
          r={6}
          fill="var(--port-color)"
          stroke="var(--node-border)"
          strokeWidth={2}
          className="cursor-crosshair"
          onMouseDown={(e) => {
            e.stopPropagation();
            onConnectStart(node.id);
          }}
        />
      )}

      {/* Target highlight when connecting */}
      {isConnecting && (
        <circle
          cx={node.width / 2}
          cy={0}
          r={6}
          fill="var(--port-target)"
          stroke="var(--node-border)"
          strokeWidth={2}
          opacity={hovered ? 1 : 0.4}
        />
      )}
    </g>
  );
}
