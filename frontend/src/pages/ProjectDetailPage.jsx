import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Loader from "../components/common/Loader";
import PageHeader from "../components/common/PageHeader";
import TaskCard from "../components/tasks/TaskCard";
import EmptyState from "../components/common/EmptyState";
import { useProject } from "../hooks/useProjects";
import { useCreateTask, useTasks, useUpdateTaskStatus, useAssignTask } from "../hooks/useTasks";
import { useWorkspaceMembers } from "../hooks/useWorkspaces";
import { useAuth } from "../hooks/useAuth";
import { isOwnerOrAdmin } from "../utils/roleHelpers";

export default function ProjectDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();

    const { data: project, isLoading: projectLoading } = useProject(id);
    const { data: tasks = [], isLoading: tasksLoading } = useTasks(id);
    const { data: members = [], isLoading: membersLoading } = useWorkspaceMembers(project?.workspace);

    const createTaskMutation = useCreateTask(id);
    const updateStatusMutation = useUpdateTaskStatus(id);
    const assignTaskMutation = useAssignTask(id);

    const [taskData, setTaskData] = useState({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
    });

    const [taskError, setTaskError] = useState("");

    const currentMembership = useMemo(() => {
        return members.find((member) => member.user_id === user?.id);
    }, [members, user]);

    const canAssign = isOwnerOrAdmin(currentMembership?.role);

    if (projectLoading || tasksLoading || membersLoading) return <Loader />;

    function handleCreateTask(e) {
        e.preventDefault();
        setTaskError("");

        createTaskMutation.mutate(taskData, {
            onSuccess: () => {
                setTaskData({
                    title: "",
                    description: "",
                    priority: "medium",
                    due_date: "",
                });
            },
            onError: (error) => {
                setTaskError(
                    error?.response?.data?.detail ||
                    "Task creation failed. Check your input and permissions."
                );
            },
        });
    }

    function handleStatusChange(taskId, status) {
        updateStatusMutation.mutate({
            taskId,
            payload: { status },
        });
    }

    function handleAssignTask(taskId, assignedTo) {
        if (!assignedTo) return;

        assignTaskMutation.mutate({
            taskId,
            payload: { assigned_to: Number(assignedTo) },
        });
    }

    return (
        <DashboardLayout>
            <PageHeader
                title={project?.title}
                subtitle={project?.description || "Track tasks, update progress, and assign members."}
                action={
                    currentMembership?.role ? (
                        <span className="badge bg-light text-dark border text-capitalize px-3 py-2">
                            Your role: {currentMembership.role}
                        </span>
                    ) : null
                }
            />

            {!canAssign && (
                <div className="dashboard-panel mb-4 workspace-info-banner">
                    <h5 className="fw-bold mb-2">Task assignment is restricted</h5>
                    <p className="text-muted mb-0">
                        You can create tasks and update task status, but only Owner/Admin can assign tasks.
                    </p>
                </div>
            )}

            <div className="dashboard-panel mb-4">
                <h5 className="fw-bold mb-3">Create Task</h5>

                <form onSubmit={handleCreateTask} className="row g-3">
                    <div className="col-md-3">
                        <input
                            className="form-control"
                            placeholder="Task title"
                            value={taskData.title}
                            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="col-md-4">
                        <input
                            className="form-control"
                            placeholder="Description"
                            value={taskData.description}
                            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                        />
                    </div>

                    <div className="col-md-2">
                        <select
                            className="form-select"
                            value={taskData.priority}
                            onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="col-md-2">
                        <input
                            type="date"
                            className="form-control"
                            value={taskData.due_date}
                            onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                        />
                    </div>

                    <div className="col-md-1 d-grid">
                        <button className="btn btn-primary" disabled={createTaskMutation.isPending}>
                            {createTaskMutation.isPending ? "Adding..." : "Add"}
                        </button>
                    </div>
                </form>

                {taskError && <div className="alert alert-danger mt-3 mb-0">{taskError}</div>}
            </div>

            {tasks.length === 0 ? (
                <EmptyState
                    title="No tasks yet"
                    text="Create the first task in this project to begin tracking work."
                />
            ) : (
                <div className="d-flex flex-column gap-3">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            members={members}
                            canAssign={canAssign}
                            onStatusChange={handleStatusChange}
                            onAssignTask={handleAssignTask}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}