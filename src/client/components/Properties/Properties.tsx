import { getServiceDef } from "../../lib/aws-services";
import { useCanvasStore } from "../../stores/canvas";

const GROUP_TYPE_LABELS: Record<string, string> = {
  vpc: "VPC",
  subnet: "Subnet",
  az: "Availability Zone",
  region: "Region",
  generic: "グループ",
};

const GROUP_COLORS: Record<string, string> = {
  vpc: "#8C4FFF",
  subnet: "#3F8624",
  az: "#ED7100",
  region: "#2E27AD",
  generic: "#6b7280",
};

export default function Properties() {
  const {
    data,
    selectedNodeId,
    selectedEdgeId,
    selectedGroupId,
    updateNode,
    updateEdge,
    updateGroup,
    removeNode,
    removeEdge,
    removeGroup,
  } = useCanvasStore();

  const selectedNode = selectedNodeId ? data.nodes.find((n) => n.id === selectedNodeId) : null;
  const selectedEdge = selectedEdgeId ? data.edges.find((e) => e.id === selectedEdgeId) : null;
  const selectedGroup = selectedGroupId ? data.groups.find((g) => g.id === selectedGroupId) : null;

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

  if (selectedGroup) {
    const color = GROUP_COLORS[selectedGroup.type] || GROUP_COLORS.generic;
    const childCount = data.nodes.filter(
      (n) => n.group === selectedGroup.id || selectedGroup.children.includes(n.id),
    ).length;

    return (
      <div className="w-64 bg-bg-panel border-l border-border overflow-y-auto shrink-0 p-3">
        <h2 className="text-sm font-medium text-text-secondary mb-4">ゾーン</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-secondary block mb-1">タイプ</label>
            <div
              className="text-sm px-2 py-1 rounded flex items-center gap-2"
              style={{ backgroundColor: `${color}20` }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {GROUP_TYPE_LABELS[selectedGroup.type] || selectedGroup.type}
            </div>
          </div>
          <div>
            <label className="text-xs text-text-secondary block mb-1">ラベル</label>
            <input
              type="text"
              value={selectedGroup.label}
              onChange={(e) => updateGroup(selectedGroup.id, { label: e.target.value })}
              className="w-full bg-bg-hover border border-border-strong rounded-md px-2 py-1 text-sm text-text"
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary block mb-1">子ノード数</label>
            <div className="text-sm text-text px-2 py-1">{childCount}</div>
          </div>
          <button
            onClick={() => removeGroup(selectedGroup.id)}
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
