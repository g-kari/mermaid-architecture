import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useCanvasStore } from "../../stores/canvas";
import type { CanvasData, Snapshot } from "../../types";

interface VersionHistoryProps {
  diagramId: string;
}

export default function VersionHistory({ diagramId }: VersionHistoryProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [previewData, setPreviewData] = useState<CanvasData | null>(null);
  const [savingLabel, setSavingLabel] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const setData = useCanvasStore((s) => s.setData);

  const fetchSnapshots = useCallback(async () => {
    const list = await api.get<Snapshot[]>(`/diagrams/${diagramId}/snapshots`);
    setSnapshots(list);
  }, [diagramId]);

  useEffect(() => {
    if (isOpen) fetchSnapshots();
  }, [isOpen, fetchSnapshots]);

  const saveSnapshot = async () => {
    await api.post(`/diagrams/${diagramId}/snapshots`, {
      label: savingLabel || undefined,
    });
    setSavingLabel("");
    setShowSaveDialog(false);
    fetchSnapshots();
  };

  const restoreSnapshot = async (snapshotId: string) => {
    const result = await api.post<{ ok: boolean }>(`/snapshots/${snapshotId}/restore`, {});
    if (result.ok) {
      const snapshot = snapshots.find((s) => s.id === snapshotId);
      if (snapshot?.canvas_data) {
        try {
          setData(JSON.parse(snapshot.canvas_data) as CanvasData);
        } catch {
          // ignore
        }
      }
      fetchSnapshots();
    }
  };

  const previewSnapshot = (snapshot: Snapshot) => {
    if (snapshot.canvas_data) {
      try {
        setPreviewData(JSON.parse(snapshot.canvas_data) as CanvasData);
      } catch {
        setPreviewData(null);
      }
    }
  };

  return (
    <div className="border-t border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
      >
        <span>バージョン履歴</span>
        <span>{isOpen ? "▼" : "▲"}</span>
      </button>

      {isOpen && (
        <div className="bg-gray-850 max-h-48 overflow-y-auto">
          <div className="px-4 py-2 flex gap-2">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
            >
              バージョンを保存
            </button>
          </div>

          {showSaveDialog && (
            <div className="px-4 py-2 flex gap-2 bg-gray-800">
              <input
                type="text"
                value={savingLabel}
                onChange={(e) => setSavingLabel(e.target.value)}
                placeholder="バージョン名（任意）"
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                onKeyDown={(e) => e.key === "Enter" && saveSnapshot()}
              />
              <button
                onClick={saveSnapshot}
                className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
              >
                保存
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
          )}

          {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="px-4 py-2 flex items-center gap-3 hover:bg-gray-800 text-xs border-b border-gray-700/50"
            >
              <div className="flex-1 min-w-0">
                <div className="text-gray-300 truncate">{snapshot.label || "自動保存"}</div>
                <div className="text-gray-500">
                  {new Date(snapshot.created_at).toLocaleString("ja-JP")} ・{" "}
                  {snapshot.created_by_email}
                </div>
              </div>
              <button
                onClick={() => previewSnapshot(snapshot)}
                className="text-gray-400 hover:text-white shrink-0"
              >
                プレビュー
              </button>
              <button
                onClick={() => restoreSnapshot(snapshot.id)}
                className="text-blue-400 hover:text-blue-300 shrink-0"
              >
                復元
              </button>
            </div>
          ))}

          {snapshots.length === 0 && (
            <p className="px-4 py-4 text-gray-500 text-xs text-center">
              バージョン履歴がありません
            </p>
          )}

          {previewData && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg border border-gray-700 w-[640px] h-[480px] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <h2 className="font-medium text-sm">プレビュー</h2>
                  <button
                    onClick={() => setPreviewData(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-auto">
                  <pre className="text-xs text-gray-400 font-mono">
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
