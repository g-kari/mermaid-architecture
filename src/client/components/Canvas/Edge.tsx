import type { CanvasEdge, CanvasNode } from "../../types";

interface EdgeProps {
  edge: CanvasEdge;
  sourceNode: CanvasNode;
  targetNode: CanvasNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function Edge({ edge, sourceNode, targetNode, isSelected, onSelect }: EdgeProps) {
  const sx = sourceNode.x + sourceNode.width / 2;
  const sy = sourceNode.y + sourceNode.height;
  const tx = targetNode.x + targetNode.width / 2;
  const ty = targetNode.y;

  const midY = (sy + ty) / 2;

  const dashArray = edge.style === "dashed" ? "8,4" : edge.style === "dotted" ? "2,4" : undefined;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect(edge.id);
      }}
      className="cursor-pointer"
    >
      <path
        d={`M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
      />
      <path
        d={`M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`}
        fill="none"
        stroke={isSelected ? "#3b82f6" : "#6b7280"}
        strokeWidth={isSelected ? 2.5 : 1.5}
        strokeDasharray={dashArray}
        markerEnd="url(#arrowhead)"
      />
      {edge.label && (
        <text x={(sx + tx) / 2} y={midY - 6} textAnchor="middle" fill="#9ca3af" fontSize={10}>
          {edge.label}
        </text>
      )}
    </g>
  );
}
