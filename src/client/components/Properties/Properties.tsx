import { getServiceDef } from "../../lib/aws-services";
import { useCanvasStore } from "../../stores/canvas";

export default function Properties() {
  const { data, selectedNodeId, selectedEdgeId, updateNode, updateEdge, removeNode, removeEdge } =
    useCanvasStore();

  const selectedNode = selectedNodeId ? data.nodes.find((n) => n.id === selectedNodeId) : null;
  const selectedEdge = selectedEdgeId ? data.edges.find((e) => e.id === selectedEdgeId) : null;

  if (selectedNode) {
    const service = getServiceDef(selectedNode.type);
    return (
      <div className="w-64 bg-bg-panel border-l border-border overflow-y-auto shrink-0 p-3">
        <h2 className="text-sm font-medium text-text-secondary mb-4">ノード</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-secondary block mb-1">タイプ</label>
            <div
              className="text-sm px-2 py-1 rounded flex items-center gap-2"
              style={{ backgroundColor: `${service?.color || "#666"}20` }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: service?.color || "#666" }}
              />
              {service?.name || selectedNode.type}
            </div>
          </div>
          <div>
            <label className="text-xs text-text-secondary block mb-1">ラベル</label>
            <input
              type="text"
              value={selectedNode.label}
              onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
              className="w-full bg-bg-hover border border-border-strong rounded-md px-2 py-1 text-sm text-text"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-text-secondary block mb-1">X</label>
              <input
                type="number"
                value={Math.round(selectedNode.x)}
                onChange={(e) => updateNode(selectedNode.id, { x: Number(e.target.value) })}
                className="w-full bg-bg-hover border border-border-strong rounded-md px-2 py-1 text-sm text-text"
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1">Y</label>
              <input
                type="number"
                value={Math.round(selectedNode.y)}
                onChange={(e) => updateNode(selectedNode.id, { y: Number(e.target.value) })}
                className="w-full bg-bg-hover border border-border-strong rounded-md px-2 py-1 text-sm text-text"
              />
            </div>
          </div>
          <button
            onClick={() => removeNode(selectedNode.id)}
            className="w-full bg-danger/10 hover:bg-danger/20 text-danger-text text-sm px-3 py-1.5 rounded-md transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    );
  }

  if (selectedEdge) {
    return (
      <div className="w-64 bg-bg-panel border-l border-border overflow-y-auto shrink-0 p-3">
        <h2 className="text-sm font-medium text-text-secondary mb-4">エッジ</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-secondary block mb-1">ラベル</label>
            <input
              type="text"
              value={selectedEdge.label || ""}
              onChange={(e) =>
                updateEdge(selectedEdge.id, {
                  label: e.target.value || undefined,
                })
              }
              className="w-full bg-bg-hover border border-border-strong rounded-md px-2 py-1 text-sm text-text"
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary block mb-1">スタイル</label>
            <select
              value={selectedEdge.style || "solid"}
              onChange={(e) =>
                updateEdge(selectedEdge.id, {
                  style: e.target.value as "solid" | "dashed" | "dotted",
                })
              }
              className="w-full bg-bg-hover border border-border-strong rounded-md px-2 py-1 text-sm text-text"
            >
              <option value="solid">実線</option>
              <option value="dashed">破線</option>
              <option value="dotted">点線</option>
            </select>
          </div>
          <button
            onClick={() => removeEdge(selectedEdge.id)}
            className="w-full bg-danger/10 hover:bg-danger/20 text-danger-text text-sm px-3 py-1.5 rounded-md transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-bg-panel border-l border-border overflow-y-auto shrink-0 p-3">
      <h2 className="text-sm font-medium text-text-secondary mb-2">プロパティ</h2>
      <p className="text-text-tertiary text-xs">ノードまたはエッジを選択してください</p>
    </div>
  );
}
