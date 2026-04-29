interface RemoteCursor {
  clientId: number;
  name: string;
  color: string;
  x: number;
  y: number;
}

interface RemoteCursorsProps {
  cursors: RemoteCursor[];
}

export default function RemoteCursors({ cursors }: RemoteCursorsProps) {
  return (
    <>
      {cursors.map((cursor) => (
        <g
          key={cursor.clientId}
          transform={`translate(${cursor.x}, ${cursor.y})`}
          pointerEvents="none"
        >
          <path d="M 0 0 L 0 16 L 4 12 L 8 16 L 8 0 Z" fill={cursor.color} opacity={0.8} />
          <rect
            x={10}
            y={12}
            width={cursor.name.length * 6 + 8}
            height={16}
            rx={3}
            fill={cursor.color}
            opacity={0.9}
          />
          <text x={14} y={24} fill="white" fontSize={10} fontWeight="bold">
            {cursor.name}
          </text>
        </g>
      ))}
    </>
  );
}
