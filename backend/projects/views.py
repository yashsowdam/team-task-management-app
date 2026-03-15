from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Project
from .serializers import ProjectSerializer
from workspaces.models import Workspace, WorkspaceMember


class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        workspace_id = self.kwargs["workspace_id"]
        return Project.objects.filter(
            workspace_id=workspace_id,
            workspace__memberships__user=self.request.user
        ).distinct()

    def create(self, request, *args, **kwargs):
        workspace_id = self.kwargs["workspace_id"]
        workspace = Workspace.objects.filter(id=workspace_id).first()

        if not workspace:
            return Response(
                {"detail": "Workspace not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        membership = WorkspaceMember.objects.filter(
            workspace=workspace,
            user=request.user
        ).first()

        if not membership:
            return Response(
                {"detail": "You are not a workspace member."},
                status=status.HTTP_403_FORBIDDEN
            )

        if membership.role not in [WorkspaceMember.ROLE_OWNER, WorkspaceMember.ROLE_ADMIN]:
            return Response(
                {"detail": "Only owner/admin can create projects."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(workspace=workspace, created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Project.objects.select_related("workspace", "created_by")

    def get_object(self):
        project = super().get_object()

        is_member = WorkspaceMember.objects.filter(
            workspace=project.workspace,
            user=self.request.user
        ).exists()

        if not is_member:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You are not allowed to access this project.")

        return project

    def update(self, request, *args, **kwargs):
        project = self.get_object()

        membership = WorkspaceMember.objects.filter(
            workspace=project.workspace,
            user=request.user
        ).first()

        if membership.role not in [WorkspaceMember.ROLE_OWNER, WorkspaceMember.ROLE_ADMIN]:
            return Response(
                {"detail": "Only owner/admin can update projects."},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        project = self.get_object()

        membership = WorkspaceMember.objects.filter(
            workspace=project.workspace,
            user=request.user
        ).first()

        if membership.role not in [WorkspaceMember.ROLE_OWNER, WorkspaceMember.ROLE_ADMIN]:
            return Response(
                {"detail": "Only owner/admin can delete projects."},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)