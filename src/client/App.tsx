import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";
import Editor from "./pages/Editor";
import { useAuthStore } from "./stores/auth";

export default function App() {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
        <Route path="/editor/:diagramId" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}
