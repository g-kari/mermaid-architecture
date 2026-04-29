import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import TemplateSelector from "../components/TemplateSelector/TemplateSelector";
import { api } from "../lib/api";
import type { Diagram, Project, Template } from "../types";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.get<Project>(`/projects/${projectId}`).then(setProject);
    api.get<Diagram[]>(`/projects/${projectId}/diagrams`).then(setDiagrams);
  }, [projectId]);

  const createFromTemplate = async (template: Template | null) => {
    if (!projectId) return;
    const name = template ? `${template.name} - コピー` : "新しいダイアグラム";
    const diagram = await api.post<{ id: string }>(`/projects/${projectId}/diagrams`, {
      name,
      mermaid_code: template?.mermaid_code ?? undefined,
      canvas_data: template?.canvas_data ?? undefined,
    });
    setShowTemplateSelector(false);
    navigate(`/editor/${diagram.id}`);
  };

  if (!project) return <div className="min-h-screen bg-bg" />;

  return (
    <div className="min-h-screen bg-bg text-text p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-accent hover:text-accent text-sm mb-4 inline-block">
          &larr; プロジェクト一覧
        </Link>
        <h1 className="text-3xl font-bold mb-8">{project.name}</h1>

        <div className="mb-8">
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="bg-accent hover:bg-accent-hover px-6 py-2 rounded-md font-medium text-accent-text"
          >
            + 新しいダイアグラム
          </button>
        </div>

        <div className="grid gap-4">
          {diagrams.map((d) => (
            <Link
              key={d.id}
              to={`/editor/${d.id}`}
              className="block bg-bg-panel border border-border rounded-lg p-4 hover:border-accent transition-colors"
            >
              <h2 className="text-lg font-medium">{d.name}</h2>
              <p className="text-text-secondary text-sm mt-1">
                {new Date(d.updated_at).toLocaleString("ja-JP")}
              </p>
            </Link>
          ))}
          {diagrams.length === 0 && (
            <p className="text-text-tertiary text-center py-8">ダイアグラムがありません</p>
          )}
        </div>
      </div>

      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={createFromTemplate}
      />
    </div>
  );
}
