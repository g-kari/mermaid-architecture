import { useEffect, useState } from "react";
import { validateCanvasData } from "../../lib/canvas-data-validator";
import { parseMermaid } from "../../lib/mermaid-parser";
import { useCanvasStore } from "../../stores/canvas";
import type { CanvasData } from "../../types";

type ImportTab = "mermaid" | "json";

const TABS: { key: ImportTab; label: string }[] = [
  { key: "mermaid", label: "Mermaid" },
  { key: "json", label: "JSON" },
];

export default function ImportButton() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ImportTab>("mermaid");
  const [mermaidCode, setMermaidCode] = useState("");
  const [jsonCode, setJsonCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleToggle = () => setShowModal((prev) => !prev);
    window.addEventListener("toggle-import", handleToggle);
    return () => window.removeEventListener("toggle-import", handleToggle);
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setMermaidCode("");
    setJsonCode("");
    setError("");
  };

  const handleTabChange = (tab: ImportTab) => {
    setActiveTab(tab);
    setError("");
  };

  const applyData = (data: CanvasData) => {
    useCanvasStore.getState().pushUndo();
    useCanvasStore.setState({ data });
    closeModal();
  };

  const handleMermaidImport = () => {
    try {
      const result = parseMermaid(mermaidCode);
      const validation = validateCanvasData(result);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      applyData(validation.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mermaidコードの解析に失敗しました");
    }
  };

  const handleJsonImport = () => {
    try {
      const parsed: unknown = JSON.parse(jsonCode);
      const validation = validateCanvasData(parsed);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      applyData(validation.data);
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError("JSONの構文が正しくありません");
      } else {
        setError(e instanceof Error ? e.message : "JSONの解析に失敗しました");
      }
    }
  };

  const handleFileUpload = (accept: string, onLoad: (content: string) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onLoad(reader.result);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "mermaid":
        return (
          <>
            <div className="flex-1 flex flex-col p-4 gap-3">
              <textarea
                value={mermaidCode}
                onChange={(e) => {
                  setMermaidCode(e.target.value);
                  setError("");
                }}
                placeholder={"flowchart TD\n  ..."}
                className="flex-1 w-full bg-bg-input border border-border rounded-md p-3 text-sm font-mono text-text placeholder:text-text-tertiary resize-none focus:outline-none focus:border-border-strong"
              />
              {error && <div className="text-danger-text text-sm">{error}</div>}
            </div>
            <div className="flex gap-2 p-4 border-t border-border">
              <button
                onClick={handleMermaidImport}
                disabled={!mermaidCode.trim()}
                className="bg-accent hover:bg-accent-hover text-accent-text px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                インポート
              </button>
              <button
                onClick={() =>
                  handleFileUpload(".mmd", (content) => {
                    setMermaidCode(content);
                    setError("");
                  })
                }
                className="bg-bg-hover hover:bg-bg px-4 py-2 rounded-md text-sm font-medium"
              >
                .mmd ファイルを選択
              </button>
            </div>
          </>
        );

      case "json":
        return (
          <>
            <div className="flex-1 flex flex-col p-4 gap-3">
              <textarea
                value={jsonCode}
                onChange={(e) => {
                  setJsonCode(e.target.value);
                  setError("");
                }}
                placeholder={'{"nodes": [], "edges": [], "groups": []}'}
                className="flex-1 w-full bg-bg-input border border-border rounded-md p-3 text-sm font-mono text-text placeholder:text-text-tertiary resize-none focus:outline-none focus:border-border-strong"
              />
              {error && <div className="text-danger-text text-sm">{error}</div>}
            </div>
            <div className="flex gap-2 p-4 border-t border-border">
              <button
                onClick={handleJsonImport}
                disabled={!jsonCode.trim()}
                className="bg-accent hover:bg-accent-hover text-accent-text px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                インポート
              </button>
              <button
                onClick={() =>
                  handleFileUpload(".json", (content) => {
                    setJsonCode(content);
                    setError("");
                  })
                }
                className="bg-bg-hover hover:bg-bg px-4 py-2 rounded-md text-sm font-medium"
              >
                .json ファイルを選択
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm bg-bg-hover hover:bg-bg-hover px-3 py-1 rounded-md transition-colors"
      >
        インポート
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
          <div className="bg-bg-panel rounded-lg border border-border w-[640px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-medium">インポート</h2>
              <button onClick={closeModal} className="text-text-secondary hover:text-text">
                &times;
              </button>
            </div>

            <div className="flex border-b border-border">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "text-accent border-b-2 border-accent"
                      : "text-text-secondary hover:text-text"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-col min-h-[300px]">{renderTabContent()}</div>
          </div>
        </div>
      )}
    </>
  );
}
