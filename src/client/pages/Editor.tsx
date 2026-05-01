import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Canvas from "../components/Canvas/Canvas";
import CostPanel from "../components/CostPanel/CostPanel";
import Palette from "../components/Palette/Palette";
import Properties from "../components/Properties/Properties";
import AIGenerateButton from "../components/Toolbar/AIGenerateButton";
import CostToggle from "../components/Toolbar/CostToggle";
import ExportButton from "../components/Toolbar/ExportButton";
import ImportButton from "../components/Toolbar/ImportButton";
import OnlineUsers from "../components/Toolbar/OnlineUsers";
import SaveAsTemplate from "../components/Toolbar/SaveAsTemplate";
import ShortcutHelp from "../components/Toolbar/ShortcutHelp";
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

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCostPanel, setShowCostPanel] = useState(false);

  useEffect(() => {
    const MOVE_STEP = 10;
    const MOVE_STEP_LARGE = 50;
    let arrowUndoPushed = false;
    let arrowTimer: ReturnType<typeof setTimeout> | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (el instanceof HTMLElement && el.isContentEditable) return;
      const store = useCanvasStore.getState();
      const mod = e.ctrlKey || e.metaKey;

      if (e.key === "Escape") {
        store.deselectAll();
        setShowShortcuts(false);
        return;
      }

      if (e.key === "?" && !mod) {
        setShowShortcuts((prev) => !prev);
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (store.selectedNodeId) {
          store.removeNode(store.selectedNodeId);
        } else if (store.selectedEdgeId) {
          store.removeEdge(store.selectedEdgeId);
        } else if (store.selectedGroupId) {
          store.removeGroup(store.selectedGroupId);
        }
        return;
      }

      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        (store.selectedNodeId || store.selectedGroupId)
      ) {
        e.preventDefault();
        const step = e.shiftKey ? MOVE_STEP_LARGE : MOVE_STEP;
        if (!arrowUndoPushed) {
          store.pushUndo();
          arrowUndoPushed = true;
        }
        if (arrowTimer) clearTimeout(arrowTimer);
        arrowTimer = setTimeout(() => {
          arrowUndoPushed = false;
        }, 500);
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        if (store.selectedGroupId) {
          store.moveGroupChildren(store.selectedGroupId, dx, dy);
        } else if (store.selectedNodeId) {
          const node = store.data.nodes.find((n) => n.id === store.selectedNodeId);
          if (node) store.updateNode(node.id, { x: node.x + dx, y: node.y + dy });
        }
        return;
      }

      if (mod) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          store.undo();
        } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
          e.preventDefault();
          store.redo();
        } else if (e.key === "d") {
          e.preventDefault();
          if (store.selectedNodeId) {
            store.duplicateNode(store.selectedNodeId);
          }
        } else if (e.key === "e") {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("toggle-export"));
        } else if (e.key === "g") {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("toggle-ai-generate"));
        } else if (e.key === "i") {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("toggle-import"));
        } else if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("canvas-zoom", { detail: "in" }));
        } else if (e.key === "-") {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("canvas-zoom", { detail: "out" }));
        } else if (e.key === "0") {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("canvas-zoom", { detail: "reset" }));
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
          <button
            onClick={() => setShowShortcuts(true)}
            className="text-sm text-text-secondary hover:text-text px-2 py-1 rounded-md transition-colors"
            title="キーボードショートカット (?)"
          >
            ⌨
          </button>
          <CostToggle active={showCostPanel} onClick={() => setShowCostPanel((v) => !v)} />
          <AIGenerateButton />
          <ImportButton />
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
        {showCostPanel && <CostPanel onClose={() => setShowCostPanel(false)} />}
      </div>

      {showShortcuts && <ShortcutHelp onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
