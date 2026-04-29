import { useState } from "react";
import { api } from "../../lib/api";
import { canvasDataToMermaid } from "../../lib/mermaid-generator";
import { useCanvasStore } from "../../stores/canvas";

export default function SaveAsTemplate() {
  const data = useCanvasStore((s) => s.data);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("custom");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await api.post("/templates", {
      name,
      description: description || undefined,
      category,
      mermaid_code: canvasDataToMermaid(data),
      canvas_data: JSON.stringify(data),
    });
    setSaving(false);
    setIsOpen(false);
    setName("");
    setDescription("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm bg-bg-hover hover:bg-bg-hover px-3 py-1 rounded-md transition-colors"
      >
        テンプレート保存
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
          <div className="bg-bg-panel rounded-lg border border-border w-[400px]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-medium text-sm">テンプレートとして保存</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text"
              >
                &times;
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1">名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-hover border border-border-strong rounded-md px-3 py-1.5 text-sm text-text"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1">説明（任意）</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-bg-hover border border-border-strong rounded-md px-3 py-1.5 text-sm text-text resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1">カテゴリ</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-bg-hover border border-border-strong rounded-md px-3 py-1.5 text-sm text-text"
                >
                  <option value="web-app">Webアプリ</option>
                  <option value="static-site">静的サイト</option>
                  <option value="microservice">マイクロサービス</option>
                  <option value="serverless">サーバーレス</option>
                  <option value="custom">カスタム</option>
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
