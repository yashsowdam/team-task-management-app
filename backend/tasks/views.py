from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Task
from .serializers import TaskSerializer, TaskStatusUpdateSerializer, TaskAssignSerializer
from projects.models import Project
from workspaces.models import WorkspaceMember
from notifications.models import Notification
from notifications.utils import create_notification

User = get_user_model()


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs["project_id"]
        return Task.objects.filter(
            project_id=project_id,
            project__workspace__memberships__user=self.request.user
        ).distinct()

    def create(self, request, *args, **kwargs):
        project_id = self.kwargs["project_id"]
        project = Project.objects.select_related("workspace", "workspace__owner").filter(id=project_id).first()

        if not project:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

        membership = WorkspaceMember.objects.filter(
            workspace=project.workspace,
            user=request.user
        ).first()

        if not membership:
            return Response({"detail": "You are not a workspace member."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save(project=project, created_by=request.user)

        workspace = project.workspace

        # Notify workspace owner when someone else creates a task
        if workspace.owner != request.user:
            create_notification(
                recipient=workspace.owner,
                actor=request.user,
                notification_type=Notification.TYPE_TASK_CREATED,
                message=f"{request.user.username} created a new task '{task.title}' in project '{project.title}'",
                workspace=workspace,
                project=project,
                task=task,
            )

        # If task was created with assignee, notify assignee
        if task.assigned_to and task.assigned_to != request.user:
            create_notification(
                recipient=task.assigned_to,
                actor=request.user,
                notification_type=Notification.TYPE_TASK_ASSIGNED,
                message=f"{request.user.username} assigned you the task '{task.title}'",
                workspace=workspace,
                project=project,
                task=task,
            )

        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Task.objects.select_related("project__workspace", "assigned_to", "created_by")

    def get_object(self):
        task = super().get_object()

        is_member = WorkspaceMember.objects.filter(
            workspace=task.project.workspace,
            user=self.request.user
        ).exists()

        if not is_member:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You are not allowed to access this task.")

        return task

    def update(self, request, *args, **kwargs):
        task = self.get_object()

        membership = WorkspaceMember.objects.filter(
            workspace=task.project.workspace,
            user=request.user
        ).first()

        if not membership:
            return Response(
                {"detail": "You are not a workspace member."},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()

        membership = WorkspaceMember.objects.filter(
            workspace=task.project.workspace,
            user=request.user
        ).first()

        if membership.role not in [WorkspaceMember.ROLE_OWNER, WorkspaceMember.ROLE_ADMIN]:
            return Response(
                {"detail": "Only owner/admin can delete tasks."},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class TaskStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        task = Task.objects.select_related(
            "project__workspace",
            "project__workspace__owner",
            "assigned_to",
            "created_by"
        ).filter(pk=pk).first()

        if not task:
            return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        membership = WorkspaceMember.objects.filter(
            workspace=task.project.workspace,
            user=request.user
        ).first()

        if not membership:
            return Response(
                {"detail": "You are not a workspace member."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TaskStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_status = task.status
        task.status = serializer.validated_data["status"]
        task.save()

        if old_status != task.status:
            workspace = task.project.workspace
            recipients = []

            if workspace.owner != request.user:
                recipients.append(workspace.owner)

            if task.created_by != request.user and task.created_by not in recipients:
                recipients.append(task.created_by)

            if task.assigned_to and task.assigned_to != request.user and task.assigned_to not in recipients:
                recipients.append(task.assigned_to)

            for recipient in recipients:
                create_notification(
                    recipient=recipient,
                    actor=request.user,
                    notification_type=Notification.TYPE_TASK_STATUS_CHANGED,
                    message=f"{request.user.username} changed task '{task.title}' status to {task.get_status_display()}",
                    workspace=workspace,
                    project=task.project,
                    task=task,
                )

        return Response(TaskSerializer(task).data)


class TaskAssignView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        task = Task.objects.select_related("project__workspace").filter(pk=pk).first()

        if not task:
            return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        membership = WorkspaceMember.objects.filter(
            workspace=task.project.workspace,
            user=request.user
        ).first()

        if not membership:
            return Response(
                {"detail": "You are not a workspace member."},
                status=status.HTTP_403_FORBIDDEN
            )

        if membership.role not in [WorkspaceMember.ROLE_OWNER, WorkspaceMember.ROLE_ADMIN]:
            return Response(
                {"detail": "Only owner/admin can assign tasks."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TaskAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        assigned_user = User.objects.get(id=serializer.validated_data["assigned_to"])

        is_workspace_member = WorkspaceMember.objects.filter(
            workspace=task.project.workspace,
            user=assigned_user
        ).exists()

        if not is_workspace_member:
            return Response(
                {"detail": "Assigned user must be a member of the workspace."},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.assigned_to = assigned_user
        task.save()

        if assigned_user != request.user:
            create_notification(
                recipient=assigned_user,
                actor=request.user,
                notification_type=Notification.TYPE_TASK_ASSIGNED,
                message=f"{request.user.username} assigned you the task '{task.title}'",
                workspace=task.project.workspace,
                project=task.project,
                task=task,
            )

        return Response(TaskSerializer(task).data)