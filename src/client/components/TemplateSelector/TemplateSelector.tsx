import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Template } from "../../types";

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template | null) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  "web-app": "Webアプリ",
  "static-site": "静的サイト",
  microservice: "マイクロサービス",
  serverless: "サーバーレス",
  custom: "カスタム",
};

export default function TemplateSelector({ isOpen, onClose, onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    if (isOpen) {
      api.get<Template[]>("/templates").then(setTemplates);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ["all", ...new Set(templates.map((t) => t.category))];

  const filtered =
    activeCategory === "all" ? templates : templates.filter((t) => t.category === activeCategory);

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
      <div className="bg-bg-panel rounded-lg border border-border w-[700px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-medium">テンプレートを選択</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text">
            &times;
          </button>
        </div>

        <div className="flex gap-2 px-4 pt-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1 rounded-md ${
                activeCategory === cat
                  ? "bg-accent text-accent-text"
                  : "bg-bg-hover text-text-secondary hover:bg-bg-hover"
              }`}
            >
              {cat === "all" ? "すべて" : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => onSelect(null)}
            className="border-2 border-dashed border-border-strong rounded-lg p-4 hover:border-accent transition-colors text-center"
          >
            <div className="text-text-secondary text-2xl mb-2">+</div>
            <div className="text-sm text-text-secondary">空のダイアグラム</div>
          </button>

          {filtered.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="bg-bg-hover border border-border-strong rounded-lg p-4 hover:border-accent transition-colors text-left"
            >
              <div className="text-sm font-medium text-text">{template.name}</div>
              {template.description && (
                <div className="text-xs text-text-secondary mt-1 line-clamp-2">
                  {template.description}
                </div>
              )}
              <div className="text-xs text-text-tertiary mt-2">
                {CATEGORY_LABELS[template.category] || template.category}
                {template.is_builtin ? "" : " (カスタム)"}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
