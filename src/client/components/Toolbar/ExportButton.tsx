import { useState } from "react";
import { useCanvasStore } from "../../stores/canvas";
import { canvasDataToMermaid } from "../../lib/mermaid-generator";

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
        className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
      >
        エクスポート
      </button>

      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-[640px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="font-medium">Mermaid コード</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            <pre className="flex-1 overflow-auto p-4 text-sm text-gray-300 font-mono whitespace-pre">
              {mermaidCode}
            </pre>
            <div className="flex gap-2 p-4 border-t border-gray-700">
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
              >
                クリップボードにコピー
              </button>
              <button
                onClick={downloadMmd}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm font-medium"
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
