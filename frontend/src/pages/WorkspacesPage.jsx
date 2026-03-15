import React, { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import WorkspaceCard from "../components/workspaces/WorkspaceCard";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import { useCreateWorkspace, useWorkspaces } from "../hooks/useWorkspaces";

export default function WorkspacesPage() {
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    createWorkspaceMutation.mutate(formData, {
      onSuccess: () => {
        setFormData({ name: "", description: "" });
      },
    });
  }

  if (isLoading) return <Loader />;

  return (
    <DashboardLayout>
      <PageHeader
        title="Workspaces"
        subtitle="Create and manage team spaces for projects and tasks."
      />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Create Workspace</h5>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Workspace name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn btn-primary" disabled={createWorkspaceMutation.isPending}>
                {createWorkspaceMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {workspaces.length === 0 ? (
        <EmptyState
          title="No workspaces yet"
          text="Create your first workspace to start collaborating with your team."
        />
      ) : (
        <div className="row g-4">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}