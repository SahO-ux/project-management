import React, { useState, useEffect } from "react";
import api from "./lib/api";
import ProjectsList from "./pages/ProjectsList";
import ProjectBoard from "./pages/ProjectBoard";
import { errorToast } from "./lib/toast";

export default function App() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchProjects = async ({ refreshSelected = false } = {}) => {
    try {
      const res = await api.get("/project");
      const list = res.data || [];
      setProjects(list);

      // If nothing selected yet, pick the first project automatically
      if (!selected && list.length) {
        setSelected(list[0]);
      } else if (refreshSelected && selected) {
        try {
          const selRes = await api.get(`/project/${selected._id}`);
          if (selRes?.data) setSelected(selRes.data);
        } catch (err) {
          console.warn(
            "Failed to refresh selected project by id",
            err?.message || err
          );
        }
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
      errorToast("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LOCAL STATE UPDATERS (avoid refetch) ---
  function handleProjectCreated(newProject) {
    // prepend or append as you like
    setProjects((prev) => [newProject, ...prev]);
    // If nothing selected, select the newly created project
    setSelected((curr) => curr || newProject);
  }

  function handleProjectUpdated(updatedProject) {
    setProjects((prev) =>
      prev.map((p) =>
        String(p._id) === String(updatedProject._id) ? updatedProject : p
      )
    );
    setSelected((curr) =>
      curr && String(curr._id) === String(updatedProject._id)
        ? updatedProject
        : curr
    );
  }

  function handleProjectDeleted(deletedProjectId) {
    setProjects((prev) =>
      prev.filter((p) => String(p._id) !== String(deletedProjectId))
    );
    // If the deleted project was selected, pick another or null
    setSelected((curr) => {
      if (!curr) return null;
      if (String(curr._id) !== String(deletedProjectId)) return curr;
      // pick first remaining project if any
      const remaining = projects.filter(
        (p) => String(p._id) !== String(deletedProjectId)
      );
      return remaining.length ? remaining[0] : null;
    });
  }

  const refreshAll = async () => {
    await fetchProjects({ refreshSelected: true });
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            DevVoid — Project & Task Manager
          </h1>
          <div className="text-sm text-gray-600">MERN + Gemini (demo)</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="flex gap-4">
          <aside className="w-72">
            <div className="bg-white rounded shadow p-4">
              <ProjectsList
                projects={projects}
                selected={selected}
                onSelect={(val) => setSelected(val)}
                // refresh prop for manual refresh UI (if needed)
                refresh={refreshAll}
                // local handlers to avoid full refetch after CRUD
                onCreate={handleProjectCreated}
                onUpdate={handleProjectUpdated}
                onDelete={handleProjectDeleted}
              />
            </div>
          </aside>

          <section className="flex-1">
            <div className="bg-white p-4 rounded shadow">
              {selected ? (
                <ProjectBoard project={selected} />
              ) : (
                <div className="text-center p-8 text-gray-500">
                  No project selected — create one
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
