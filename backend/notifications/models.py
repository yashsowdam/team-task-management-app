from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_TASK_CREATED = "task_created"
    TYPE_TASK_ASSIGNED = "task_assigned"
    TYPE_TASK_STATUS_CHANGED = "task_status_changed"
    TYPE_ADDED_TO_WORKSPACE = "added_to_workspace"
    TYPE_ROLE_UPDATED = "role_updated"

    TYPE_CHOICES = [
        (TYPE_TASK_CREATED, "Task Created"),
        (TYPE_TASK_ASSIGNED, "Task Assigned"),
        (TYPE_TASK_STATUS_CHANGED, "Task Status Changed"),
        (TYPE_ADDED_TO_WORKSPACE, "Added To Workspace"),
        (TYPE_ROLE_UPDATED, "Role Updated"),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="actor_notifications",
        null=True,
        blank=True
    )
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)

    workspace = models.ForeignKey(
        "workspaces.Workspace",
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True
    )
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True
    )
    task = models.ForeignKey(
        "tasks.Task",
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.message