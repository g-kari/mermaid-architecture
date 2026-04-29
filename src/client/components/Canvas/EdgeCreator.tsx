interface EdgeCreatorProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function EdgeCreator({ startX, startY, endX, endY }: EdgeCreatorProps) {
  const midY = (startY + endY) / 2;
  return (
    <path
      d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`}
      fill="none"
      stroke="#3b82f6"
      strokeWidth={2}
      strokeDasharray="6,3"
      opacity={0.7}
      pointerEvents="none"
    />
  );
}
