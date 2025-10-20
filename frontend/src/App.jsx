import { useState, useEffect, useCallback } from "react";
import axios from "axios";

import api from "./lib/api";
import ProjectsList from "./pages/ProjectsList";
import ProjectBoard from "./pages/ProjectBoard";
import { errorToast } from "./lib/toast";

export default function App() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isServerReady, setIsServerReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Please wait, server is waking up..."
  );

  useEffect(() => {
    checkHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isServerReady) fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isServerReady]);

  const checkHealth = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:8081"}/health`,
        {
          timeout: 5000, // 5 seconds timeout
        }
      );
      if (res.status === 200) {
        setStatusMessage("Server is ready!");
        setTimeout(() => setIsServerReady(true), 800); // Small delay for smoother transition
      }
    } catch (err) {
      setStatusMessage("Still waking up... please hold on!");
      checkHealth();
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get("/project");
      const list = res.data || [];
      setProjects(list);

      setSelected((currSelected) => {
        // If no selected currently and list available -> pick first
        if (!currSelected && list.length) return list[0];

        // If there is a selected, but it's gone from the refreshed list -> pick first or null
        if (
          currSelected &&
          !list.find((p) => String(p._id) === String(currSelected._id))
        ) {
          console.log({ currSelected });
          return list.length ? list[0] : null;
        }

        // Otherwise keep the current selection
        return currSelected;
      });
    } catch (err) {
      console.error("Failed to load projects:", err);
      errorToast("Failed to fetch projects");
    }
  }, []);

  // --- LOCAL STATE UPDATERS (avoid refetch) ---
  const handleProjectCreated = (newProject) => {
    // prepend or append as you like
    setProjects((prev) => [newProject, ...prev]);
    // If nothing selected, select the newly created project
    setSelected((curr) => curr || newProject);
  };

  const handleProjectUpdated = (updatedProject) => {
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
  };

  const handleProjectDeleted = (deletedProjectId) => {
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
  };

  if (!isServerReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-700 font-medium">{statusMessage}</p>
        <p className="text-sm text-gray-500 mt-2">
          This may take 20–40 seconds if server was idle.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow p-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <h1 className="text-lg sm:text-xl font-semibold">
              DevVoid — Project & Task Manager
            </h1>

            {/* MOBILE: project selector shown only on small screens */}
            <div className="sm:hidden flex-1">
              <select
                value={selected?._id || ""}
                onChange={(e) => {
                  const p = projects.find(
                    (x) => String(x._id) === e.target.value
                  );
                  if (p) setSelected(p);
                }}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="hidden sm:flex text-sm text-gray-600">
              MERN + Gemini (demo)
            </div> */}
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-3">
          {/* responsive main: stack on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Sidebar: full width on mobile, fixed on desktop */}
            <aside className="w-full sm:w-72">
              <div className="bg-white rounded shadow p-4">
                <ProjectsList
                  projects={projects}
                  selected={selected}
                  onSelect={(val) => setSelected(val)}
                  fetchProjects={fetchProjects}
                  onCreate={handleProjectCreated}
                  onUpdate={handleProjectUpdated}
                  onDelete={handleProjectDeleted}
                />
              </div>
            </aside>

            {/* Content: stretches */}
            <section className="flex-1">
              <div className="bg-white p-4 rounded shadow">
                {selected ? (
                  <ProjectBoard project={selected} />
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    No project available — create one
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
