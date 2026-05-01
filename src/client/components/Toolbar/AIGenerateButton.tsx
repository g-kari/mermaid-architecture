import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { validateCanvasData } from "../../lib/canvas-data-validator";
import { useCanvasStore } from "../../stores/canvas";
import type { CanvasData } from "../../types";

export default function AIGenerateButton() {
  const [showModal, setShowModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleToggle = () => {
      if (!loading) setShowModal((prev) => !prev);
    };
    window.addEventListener("toggle-ai-generate", handleToggle);
    return () => window.removeEventListener("toggle-ai-generate", handleToggle);
  }, [loading]);

  const closeModal = () => {
    if (loading) return;
    setShowModal(false);
    setPrompt("");
    setError("");
  };

  const applyData = (data: CanvasData) => {
    useCanvasStore.getState().pushUndo();
    useCanvasStore.setState({ data });
    closeModal();
  };

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await api.post<{ data: CanvasData }>("/ai/generate", {
        prompt,
      });
      const validation = validateCanvasData(result.data);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      applyData(validation.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm bg-bg-hover hover:bg-bg-hover px-3 py-1 rounded-md transition-colors"
      >
        AI生成
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-overlay flex items-center justify-center z-50"
          onClick={closeModal}
          onKeyDown={(e) => e.key === "Escape" && closeModal()}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-bg-panel rounded-lg border border-border w-[640px] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-medium">AI図生成</h2>
              <button onClick={closeModal} className="text-text-secondary hover:text-text">
                &times;
              </button>
            </div>

            <div className="flex-1 flex flex-col p-4 gap-3">
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setError("");
                }}
                placeholder="例：EC2とRDSを使ったWebアプリ構成を作って"
                maxLength={2000}
                className="flex-1 w-full min-h-[200px] bg-bg-input border border-border rounded-md p-3 text-sm font-mono text-text placeholder:text-text-tertiary resize-none focus:outline-none focus:border-border-strong"
                disabled={loading}
              />
              {error && <div className="text-danger-text text-sm">{error}</div>}
              {loading && (
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>生成中...</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className="bg-accent hover:bg-accent-hover text-accent-text px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                生成
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
