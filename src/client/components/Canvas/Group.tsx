import type { CanvasGroup, CanvasNode } from "../../types";

interface GroupProps {
  group: CanvasGroup;
  nodes: CanvasNode[];
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragStart: (groupId: string, clientX: number, clientY: number) => void;
}

const GROUP_COLORS: Record<string, string> = {
  vpc: "#8C4FFF",
  subnet: "#3F8624",
  az: "#ED7100",
  region: "#2E27AD",
  generic: "#6b7280",
};

export default function Group({ group, nodes, isSelected, onSelect, onDragStart }: GroupProps) {
  const childNodes = nodes.filter((n) => n.group === group.id || group.children.includes(n.id));

  if (childNodes.length === 0) return null;

  const padding = 24;
  const headerHeight = 28;

  const minX = Math.min(...childNodes.map((n) => n.x)) - padding;
  const minY = Math.min(...childNodes.map((n) => n.y)) - padding - headerHeight;
  const maxX = Math.max(...childNodes.map((n) => n.x + n.width)) + padding;
  const maxY = Math.max(...childNodes.map((n) => n.y + n.height)) + padding;

  const color = GROUP_COLORS[group.type] || GROUP_COLORS.generic;

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(group.id);
    onDragStart(group.id, e.clientX, e.clientY);
  };

  const handleBorderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(group.id);
  };

  return (
    <g>
      {/* border - clickable for selection */}
      <rect
        x={minX}
        y={minY}
        width={maxX - minX}
        height={maxY - minY}
        rx={6}
        fill="none"
        stroke={color}
        strokeWidth={isSelected ? 2.5 : 1.5}
        strokeDasharray={isSelected ? "none" : "6,3"}
        opacity={isSelected ? 0.9 : 0.6}
        style={{ cursor: "pointer" }}
        onMouseDown={handleBorderClick}
      />
      {/* header - draggable */}
      <rect
        x={minX}
        y={minY}
        width={maxX - minX}
        height={headerHeight}
        rx={6}
        fill={color}
        opacity={isSelected ? 0.3 : 0.15}
        style={{ cursor: "grab" }}
        onMouseDown={handleHeaderMouseDown}
      />
      <text
        x={minX + 8}
        y={minY + 18}
        fill={color}
        fontSize={11}
        fontWeight="bold"
        opacity={0.8}
        style={{ pointerEvents: "none" }}
      >
        {group.label}
      </text>
    </g>
  );
}
