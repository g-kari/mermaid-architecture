import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Project } from "../types";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get<Project[]>("/projects").then(setProjects);
  }, []);

  const createProject = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const project = await api.post<Project>("/projects", { name: newName });
    setProjects((prev) => [
      {
        ...project,
        owner_id: "",
        role: "owner",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNewName("");
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mermaid Architecture</h1>

        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createProject()}
            placeholder="新しいプロジェクト名"
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500"
          />
          <button
            onClick={createProject}
            disabled={creating || !newName.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded font-medium"
          >
            作成
          </button>
        </div>

        <div className="grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
            >
              <h2 className="text-lg font-medium">{project.name}</h2>
              <p className="text-gray-400 text-sm mt-1">
                {new Date(project.updated_at).toLocaleString("ja-JP")}
              </p>
            </Link>
          ))}
          {projects.length === 0 && (
            <p className="text-gray-500 text-center py-8">プロジェクトがありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
