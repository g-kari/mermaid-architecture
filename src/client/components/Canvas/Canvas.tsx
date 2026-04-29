import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AwsServiceDef } from "../../lib/aws-services";
import { useCanvasStore } from "../../stores/canvas";
import type { CanvasNode } from "../../types";
import EdgeComponent from "./Edge";
import EdgeCreator from "./EdgeCreator";
import Group from "./Group";
import NodeComponent from "./Node";

const DEFAULT_VIEWBOX = { x: 0, y: 0, w: 1200, h: 800 };

export default function Canvas() {
  const {
    data,
    selectedNodeId,
    selectedEdgeId,
    selectedGroupId,
    addNode,
    addEdge,
    updateNode,
    moveGroupChildren,
    pushUndo,
    selectNode,
    selectEdge,
    selectGroup,
  } = useCanvasStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1200, h: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [draggingGroupId, setDraggingGroupId] = useState<string | null>(null);
  const [groupDragPrev, setGroupDragPrev] = useState({ x: 0, y: 0 });

  const [edgeSourceId, setEdgeSourceId] = useState<string | null>(null);
  const [edgeEndPos, setEdgeEndPos] = useState({ x: 0, y: 0 });

  const svgPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: viewBox.x + ((clientX - rect.left) / rect.width) * viewBox.w,
        y: viewBox.y + ((clientY - rect.top) / rect.height) * viewBox.h,
      };
    },
    [viewBox],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      const service = JSON.parse(raw) as AwsServiceDef;
      const pos = svgPoint(e.clientX, e.clientY);
      const node: CanvasNode = {
        id: nanoid(8),
        type: service.id,
        label: service.name,
        x: pos.x - service.defaultWidth / 2,
        y: pos.y - service.defaultHeight / 2,
        width: service.defaultWidth,
        height: service.defaultHeight,
      };
      addNode(node);
    },
    [addNode, svgPoint],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (edgeSourceId) {
      setEdgeSourceId(null);
      return;
    }
    selectNode(null);
    selectEdge(null);
    selectGroup(null);
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (edgeSourceId) {
      const pos = svgPoint(e.clientX, e.clientY);
      setEdgeEndPos(pos);
      return;
    }

    if (draggingGroupId) {
      const pos = svgPoint(e.clientX, e.clientY);
      const dx = pos.x - groupDragPrev.x;
      const dy = pos.y - groupDragPrev.y;
      moveGroupChildren(draggingGroupId, dx, dy);
      setGroupDragPrev(pos);
      return;
    }

    if (draggingNodeId) {
      const pos = svgPoint(e.clientX, e.clientY);
      updateNode(draggingNodeId, {
        x: pos.x - dragOffset.x,
        y: pos.y - dragOffset.y,
      });
      return;
    }

    if (isPanning) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const dx = ((e.clientX - panStart.x) / rect.width) * viewBox.w;
      const dy = ((e.clientY - panStart.y) / rect.height) * viewBox.h;
      setViewBox((prev) => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setDraggingGroupId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scale = e.deltaY > 0 ? 1.1 : 0.9;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = viewBox.x + ((e.clientX - rect.left) / rect.width) * viewBox.w;
    const my = viewBox.y + ((e.clientY - rect.top) / rect.height) * viewBox.h;

    const newW = viewBox.w * scale;
    const newH = viewBox.h * scale;
    setViewBox({
      x: mx - (mx - viewBox.x) * scale,
      y: my - (my - viewBox.y) * scale,
      w: newW,
      h: newH,
    });
  };

  const handleNodeDragStart = (nodeId: string, clientX: number, clientY: number) => {
    const node = data.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    pushUndo();
    const pos = svgPoint(clientX, clientY);
    setDraggingNodeId(nodeId);
    setDragOffset({ x: pos.x - node.x, y: pos.y - node.y });
  };

  const handleGroupDragStart = (groupId: string, clientX: number, clientY: number) => {
    pushUndo();
    const pos = svgPoint(clientX, clientY);
    setDraggingGroupId(groupId);
    setGroupDragPrev(pos);
  };

  const handleNodeConnectStart = (nodeId: string) => {
    setEdgeSourceId(nodeId);
    const node = data.nodes.find((n) => n.id === nodeId);
    if (node) {
      setEdgeEndPos({ x: node.x + node.width / 2, y: node.y + node.height });
    }
  };

  const handleLabelChange = useCallback(
    (id: string, label: string) => {
      pushUndo();
      updateNode(id, { label });
    },
    [pushUndo, updateNode],
  );

  const handleNodeConnectEnd = (nodeId: string) => {
    if (edgeSourceId && edgeSourceId !== nodeId) {
      addEdge({
        id: nanoid(8),
        source: edgeSourceId,
        target: nodeId,
        style: "solid",
      });
    }
    setEdgeSourceId(null);
  };

  useEffect(() => {
    const handleZoom = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setViewBox((prev) => {
        if (detail === "reset") return { ...DEFAULT_VIEWBOX };
        const scale = detail === "in" ? 0.8 : 1.25;
        const cx = prev.x + prev.w / 2;
        const cy = prev.y + prev.h / 2;
        const newW = prev.w * scale;
        const newH = prev.h * scale;
        return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH };
      });
    };
    window.addEventListener("canvas-zoom", handleZoom);
    return () => window.removeEventListener("canvas-zoom", handleZoom);
  }, []);

  const sourceNode = edgeSourceId ? data.nodes.find((n) => n.id === edgeSourceId) : null;

  return (
    <div
      className="flex-1 bg-bg-canvas relative overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <svg
        id="canvas-svg"
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--edge-color)" />
          </marker>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--grid-color)" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect
          x={viewBox.x - 5000}
          y={viewBox.y - 5000}
          width={viewBox.w + 10000}
          height={viewBox.h + 10000}
          fill="url(#grid)"
        />

        {data.groups.map((group) => (
          <Group
            key={group.id}
            group={group}
            nodes={data.nodes}
            isSelected={selectedGroupId === group.id}
            onSelect={selectGroup}
            onDragStart={handleGroupDragStart}
          />
        ))}

        {data.edges.map((edge) => {
          const source = data.nodes.find((n) => n.id === edge.source);
          const target = data.nodes.find((n) => n.id === edge.target);
          if (!source || !target) return null;
          return (
            <EdgeComponent
              key={edge.id}
              edge={edge}
              sourceNode={source}
              targetNode={target}
              isSelected={selectedEdgeId === edge.id}
              onSelect={selectEdge}
            />
          );
        })}

        {edgeSourceId && sourceNode && (
          <EdgeCreator
            startX={sourceNode.x + sourceNode.width / 2}
            startY={sourceNode.y + sourceNode.height}
            endX={edgeEndPos.x}
            endY={edgeEndPos.y}
          />
        )}

        {data.nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isConnecting={edgeSourceId !== null}
            onSelect={selectNode}
            onDragStart={handleNodeDragStart}
            onConnectStart={handleNodeConnectStart}
            onConnectEnd={handleNodeConnectEnd}
            onLabelChange={handleLabelChange}
          />
        ))}
      </svg>
    </div>
  );
}
