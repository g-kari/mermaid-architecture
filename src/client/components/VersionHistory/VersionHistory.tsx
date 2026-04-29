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
    <div className="border-t border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm text-text-secondary hover:text-text hover:bg-bg-hover transition-colors"
      >
        <span>バージョン履歴</span>
        <span>{isOpen ? "▼" : "▲"}</span>
      </button>

      {isOpen && (
        <div className="bg-bg-panel max-h-48 overflow-y-auto">
          <div className="px-4 py-2 flex gap-2">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="text-xs bg-accent hover:bg-accent-hover px-3 py-1 rounded-md"
            >
              バージョンを保存
            </button>
          </div>

          {showSaveDialog && (
            <div className="px-4 py-2 flex gap-2 bg-bg-panel">
              <input
                type="text"
                value={savingLabel}
                onChange={(e) => setSavingLabel(e.target.value)}
                placeholder="バージョン名（任意）"
                className="flex-1 bg-bg-hover border border-border-strong rounded-md px-2 py-1 text-xs text-text"
                onKeyDown={(e) => e.key === "Enter" && saveSnapshot()}
              />
              <button
                onClick={saveSnapshot}
                className="text-xs bg-success hover:bg-success/80 px-2 py-1 rounded-md"
              >
                保存
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-xs text-text-secondary hover:text-text"
              >
                ×
              </button>
            </div>
          )}

          {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="px-4 py-2 flex items-center gap-3 hover:bg-bg-hover text-xs border-b border-border"
            >
              <div className="flex-1 min-w-0">
                <div className="text-text-secondary truncate">{snapshot.label || "自動保存"}</div>
                <div className="text-text-tertiary">
                  {new Date(snapshot.created_at).toLocaleString("ja-JP")} ・{" "}
                  {snapshot.created_by_email}
                </div>
              </div>
              <button
                onClick={() => previewSnapshot(snapshot)}
                className="text-text-secondary hover:text-text shrink-0"
              >
                プレビュー
              </button>
              <button
                onClick={() => restoreSnapshot(snapshot.id)}
                className="text-accent hover:text-accent shrink-0"
              >
                復元
              </button>
            </div>
          ))}

          {snapshots.length === 0 && (
            <p className="px-4 py-4 text-text-tertiary text-xs text-center">
              バージョン履歴がありません
            </p>
          )}

          {previewData && (
            <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
              <div className="bg-bg-panel rounded-lg border border-border w-[640px] h-[480px] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h2 className="font-medium text-sm">プレビュー</h2>
                  <button
                    onClick={() => setPreviewData(null)}
                    className="text-text-secondary hover:text-text"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-auto">
                  <pre className="text-xs text-text-secondary font-mono">
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
