import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Canvas from "../components/Canvas/Canvas";
import Palette from "../components/Palette/Palette";
import Properties from "../components/Properties/Properties";
import ExportButton from "../components/Toolbar/ExportButton";
import OnlineUsers from "../components/Toolbar/OnlineUsers";
import SaveAsTemplate from "../components/Toolbar/SaveAsTemplate";
import ThemeToggle from "../components/Toolbar/ThemeToggle";
import VersionHistory from "../components/VersionHistory/VersionHistory";
import { api } from "../lib/api";
import { useCanvasStore } from "../stores/canvas";
import { useCollaborationStore } from "../stores/collaboration";
import type { CanvasData, Diagram } from "../types";

export default function Editor() {
  const { diagramId } = useParams<{ diagramId: string }>();
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const setData = useCanvasStore((s) => s.setData);
  const { connect, disconnect } = useCollaborationStore();

  useEffect(() => {
    if (!diagramId) return;
    api.get<Diagram>(`/diagrams/${diagramId}`).then((d) => {
      setDiagram(d);
      if (d.canvas_data) {
        try {
          setData(JSON.parse(d.canvas_data) as CanvasData);
        } catch {
          // ignore invalid JSON
        }
      }
    });
    connect(diagramId);
    return () => disconnect();
  }, [diagramId, setData, connect, disconnect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const store = useCanvasStore.getState();
      if (e.key === "Delete" || e.key === "Backspace") {
        if (store.selectedNodeId) {
          store.removeNode(store.selectedNodeId);
        } else if (store.selectedEdgeId) {
          store.removeEdge(store.selectedEdgeId);
        }
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          store.undo();
        } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
          e.preventDefault();
          store.redo();
        } else if (e.key === "a") {
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!diagram) return <div className="min-h-screen bg-bg" />;

  return (
    <div className="h-screen bg-bg text-text flex flex-col">
      <div className="h-12 bg-bg-panel border-b border-border flex items-center px-4 gap-4 shrink-0">
        <Link
          to={`/projects/${diagram.project_id}`}
          className="text-text-secondary hover:text-text text-sm"
        >
          &larr;
        </Link>
        <span className="font-medium">{diagram.name}</span>
        <div className="ml-auto flex items-center gap-3">
          <OnlineUsers />
          <ThemeToggle />
          <SaveAsTemplate />
          <ExportButton />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Palette onDragStart={() => {}} />
        <div className="flex-1 flex flex-col">
          <Canvas />
          <VersionHistory diagramId={diagramId!} />
        </div>
        <Properties />
      </div>
    </div>
  );
}
