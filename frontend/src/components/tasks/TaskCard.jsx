import React from "react";

export default function TaskCard({
  task,
  members = [],
  canAssign = false,
  onStatusChange,
  onAssignTask,
}) {
  return (
    <div className="task-card-ui">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
            <h6 className="fw-bold mb-0">{task.title}</h6>
            <span className="badge bg-light text-dark border text-capitalize">
              {task.priority}
            </span>
            <span className="badge bg-primary-subtle text-primary text-capitalize">
              {task.status.replace("_", " ")}
            </span>
          </div>

          <p className="text-muted mb-3">{task.description || "No description."}</p>

          <div className="d-flex gap-2 flex-wrap">
            {task.assigned_to_username ? (
              <span className="badge bg-success-subtle text-success">
                Assigned to: {task.assigned_to_username}
              </span>
            ) : (
              <span className="badge bg-secondary-subtle text-secondary">
                Unassigned
              </span>
            )}

            {task.due_date && (
              <span className="badge bg-light text-dark border">
                Due: {task.due_date}
              </span>
            )}
          </div>
        </div>

        <div className="d-flex flex-column gap-2 task-actions-panel">
          <select
            className="form-select task-status-select"
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {canAssign && (
            <select
              className="form-select task-status-select"
              value={task.assigned_to || ""}
              onChange={(e) => onAssignTask(task.id, e.target.value)}
            >
              <option value="">Assign member</option>
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.username} ({member.role})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}