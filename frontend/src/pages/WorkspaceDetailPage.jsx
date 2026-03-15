import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Loader from "../components/common/Loader";
import PageHeader from "../components/common/PageHeader";
import ProjectCard from "../components/projects/ProjectCard";
import EmptyState from "../components/common/EmptyState";
import { useAddWorkspaceMember, useWorkspace, useWorkspaceMembers } from "../hooks/useWorkspaces";
import { useCreateProject, useProjects } from "../hooks/useProjects";
import { useAuth } from "../hooks/useAuth";
import { isOwnerOrAdmin } from "../utils/roleHelpers";

export default function WorkspaceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: workspace, isLoading: workspaceLoading } = useWorkspace(id);
  const { data: members = [], isLoading: membersLoading } = useWorkspaceMembers(id);
  const { data: projects = [], isLoading: projectsLoading } = useProjects(id);

  const addMemberMutation = useAddWorkspaceMember(id);
  const createProjectMutation = useCreateProject(id);

  const [memberData, setMemberData] = useState({ email: "", role: "member" });
  const [projectData, setProjectData] = useState({ title: "", description: "" });
  const [memberError, setMemberError] = useState("");
  const [projectError, setProjectError] = useState("");

  const currentMembership = useMemo(() => {
    return members.find((member) => member.user_id === user?.id);
  }, [members, user]);

  const canManageWorkspace = isOwnerOrAdmin(currentMembership?.role);

  if (workspaceLoading || membersLoading || projectsLoading) return <Loader />;

  function handleAddMember(e) {
    e.preventDefault();
    setMemberError("");

    addMemberMutation.mutate(memberData, {
      onSuccess: () => setMemberData({ email: "", role: "member" }),
      onError: (error) => {
        setMemberError(
          error?.response?.data?.detail || "Failed to add member."
        );
      },
    });
  }

  function handleCreateProject(e) {
    e.preventDefault();
    setProjectError("");

    createProjectMutation.mutate(projectData, {
      onSuccess: () => setProjectData({ title: "", description: "" }),
      onError: (error) => {
        setProjectError(
          error?.response?.data?.detail || "Project creation failed."
        );
      },
    });
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={workspace?.name}
        subtitle={workspace?.description || "Manage members and projects inside this workspace."}
        action={
          currentMembership?.role ? (
            <span className="badge bg-light text-dark border text-capitalize px-3 py-2">
              Your role: {currentMembership.role}
            </span>
          ) : null
        }
      />

      <div className="row g-4">
        <div className="col-lg-4">
          {canManageWorkspace ? (
            <div className="dashboard-panel mb-4">
              <h5 className="fw-bold mb-3">Add Member</h5>

              <form onSubmit={handleAddMember}>
                <input
                  className="form-control mb-3"
                  placeholder="User email"
                  value={memberData.email}
                  onChange={(e) => setMemberData({ ...memberData, email: e.target.value })}
                  required
                />

                <select
                  className="form-select mb-3"
                  value={memberData.role}
                  onChange={(e) => setMemberData({ ...memberData, role: e.target.value })}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>

                <button
                  className="btn btn-primary w-100"
                  disabled={addMemberMutation.isPending}
                >
                  {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                </button>
              </form>

              {memberError && <div className="alert alert-danger mt-3 mb-0">{memberError}</div>}
            </div>
          ) : (
            <div className="dashboard-panel mb-4">
              <h5 className="fw-bold mb-2">Member Access</h5>
              <p className="text-muted mb-0">
                You can view projects, create tasks, and update task status in this workspace.
              </p>
            </div>
          )}

          <div className="dashboard-panel">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Members</h5>
              <span className="badge bg-light text-dark border">{members.length}</span>
            </div>

            <div className="d-flex flex-column gap-2">
              {members.map((member) => (
                <div key={member.id} className="member-row">
                  <div>
                    <div className="fw-semibold">{member.username}</div>
                    <div className="text-muted small">{member.email}</div>
                  </div>
                  <span className="badge bg-light text-dark border text-capitalize">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          {canManageWorkspace ? (
            <div className="dashboard-panel mb-4">
              <h5 className="fw-bold mb-3">Create Project</h5>

              <form onSubmit={handleCreateProject} className="row g-3">
                <div className="col-md-4">
                  <input
                    className="form-control"
                    placeholder="Project title"
                    value={projectData.title}
                    onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Description"
                    value={projectData.description}
                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  />
                </div>

                <div className="col-md-2 d-grid">
                  <button
                    className="btn btn-primary"
                    disabled={createProjectMutation.isPending}
                  >
                    {createProjectMutation.isPending ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>

              {projectError && <div className="alert alert-danger mt-3 mb-0">{projectError}</div>}
            </div>
          ) : (
            <div className="dashboard-panel mb-4 workspace-info-banner">
              <h5 className="fw-bold mb-2">Projects are managed by Owner/Admin</h5>
              <p className="text-muted mb-0">
                You can open existing projects, create tasks, and update progress, but you cannot create projects.
              </p>
            </div>
          )}

          {projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              text="Create the first project in this workspace to start organizing tasks."
            />
          ) : (
            <div className="row g-4">
              {projects.map((project) => (
                <div className="col-md-6" key={project.id}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}