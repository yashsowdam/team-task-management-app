from rest_framework.permissions import BasePermission
from .models import WorkspaceMember


def get_workspace_role(user, workspace):
    membership = WorkspaceMember.objects.filter(user=user, workspace=workspace).first()
    return membership.role if membership else None


class IsWorkspaceMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        return WorkspaceMember.objects.filter(user=request.user, workspace=obj).exists()


class IsWorkspaceOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return WorkspaceMember.objects.filter(
            user=request.user,
            workspace=obj,
            role=WorkspaceMember.ROLE_OWNER
        ).exists()


class IsWorkspaceOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return WorkspaceMember.objects.filter(
            user=request.user,
            workspace=obj,
            role__in=[WorkspaceMember.ROLE_OWNER, WorkspaceMember.ROLE_ADMIN]
        ).exists()