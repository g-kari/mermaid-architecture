import { useState } from "react";
import { canvasDataToMermaid } from "../../lib/mermaid-generator";
import { useCanvasStore } from "../../stores/canvas";

export default function ExportButton() {
  const data = useCanvasStore((s) => s.data);
  const [showPreview, setShowPreview] = useState(false);

  const mermaidCode = canvasDataToMermaid(data);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(mermaidCode);
  };

  const downloadMmd = () => {
    const blob = new Blob([mermaidCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "architecture.mmd";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className="text-sm bg-bg-hover hover:bg-bg-hover px-3 py-1 rounded-md transition-colors"
      >
        エクスポート
      </button>

      {showPreview && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
          <div className="bg-bg-panel rounded-lg border border-border w-[640px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-medium">Mermaid コード</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-text-secondary hover:text-text"
              >
                &times;
              </button>
            </div>
            <pre className="flex-1 overflow-auto p-4 text-sm text-text-secondary font-mono whitespace-pre">
              {mermaidCode}
            </pre>
            <div className="flex gap-2 p-4 border-t border-border">
              <button
                onClick={copyToClipboard}
                className="bg-accent hover:bg-accent-hover px-4 py-2 rounded-md text-sm font-medium"
              >
                クリップボードにコピー
              </button>
              <button
                onClick={downloadMmd}
                className="bg-bg-hover hover:bg-bg-hover px-4 py-2 rounded-md text-sm font-medium"
              >
                .mmd ダウンロード
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
