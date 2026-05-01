import { useEffect, useRef, useState } from "react";
import { getIconUrl } from "../../lib/aws-icons";
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
  onLabelChange: (id: string, label: string) => void;
}

export default function Node({
  node,
  isSelected,
  isConnecting,
  onSelect,
  onDragStart,
  onConnectStart,
  onConnectEnd,
  onLabelChange,
}: NodeProps) {
  const service = getServiceDef(node.type);
  const color = service?.color || "#666";
  const iconUrl = getIconUrl(node.type);
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnecting) return;
    setEditValue(node.label);
    setIsEditing(true);
  };

  const handleLabelSave = () => {
    if (savingRef.current) return;
    savingRef.current = true;
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== node.label) {
      onLabelChange(node.id, trimmed);
    }
    setIsEditing(false);
    savingRef.current = false;
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleLabelSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (isEditing) return;
        if (isConnecting) {
          onConnectEnd(node.id);
          return;
        }
        onSelect(node.id);
        onDragStart(node.id, e.clientX, e.clientY);
      }}
      onDoubleClick={handleDoubleClick}
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
      <image
        href={iconUrl}
        x={(node.width - 28) / 2}
        y={28}
        width={28}
        height={28}
        aria-label={service?.name || node.type}
      />
      {isEditing ? (
        <foreignObject x={2} y={node.height - 22} width={node.width - 4} height={20}>
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleLabelSave}
            onKeyDown={handleInputKeyDown}
            style={{
              width: "100%",
              fontSize: "10px",
              textAlign: "center",
              background: "var(--bg-input)",
              color: "var(--text)",
              border: "1px solid var(--border-strong)",
              borderRadius: "3px",
              padding: "1px 2px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </foreignObject>
      ) : (
        <text
          x={node.width / 2}
          y={node.height - 8}
          textAnchor="middle"
          fill="var(--text)"
          fontSize={10}
        >
          {node.label}
        </text>
      )}

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
