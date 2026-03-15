from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Workspace, WorkspaceMember
from .serializers import (
    WorkspaceSerializer,
    WorkspaceMemberSerializer,
    AddWorkspaceMemberSerializer,
    UpdateMemberRoleSerializer,
)
from notifications.models import Notification
from notifications.utils import create_notification

User = get_user_model()


class WorkspaceListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(memberships__user=self.request.user).distinct()

    def perform_create(self, serializer):
        workspace = serializer.save(owner=self.request.user)
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.request.user,
            role=WorkspaceMember.ROLE_OWNER
        )


class WorkspaceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Workspace.objects.all()

    def get_object(self):
        workspace = super().get_object()
        is_member = WorkspaceMember.objects.filter(workspace=workspace, user=self.request.user).exists()
        if not is_member:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You are not a member of this workspace.')
        return workspace

    def update(self, request, *args, **kwargs):
        workspace = self.get_object()
        membership = WorkspaceMember.objects.filter(workspace=workspace, user=request.user).first()

        if membership.role != WorkspaceMember.ROLE_OWNER:
            return Response({'detail': 'Only owner can update workspace.'}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        workspace = self.get_object()
        membership = WorkspaceMember.objects.filter(workspace=workspace, user=request.user).first()

        if membership.role != WorkspaceMember.ROLE_OWNER:
            return Response({'detail': 'Only owner can delete workspace.'}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)


class WorkspaceMembersListView(generics.ListAPIView):
    serializer_class = WorkspaceMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        workspace_id = self.kwargs['workspace_id']
        is_member = WorkspaceMember.objects.filter(
            workspace_id=workspace_id,
            user=self.request.user
        ).exists()

        if not is_member:
            return WorkspaceMember.objects.none()

        return WorkspaceMember.objects.filter(workspace_id=workspace_id).select_related('user')


class AddWorkspaceMemberView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, workspace_id):
        workspace = Workspace.objects.filter(id=workspace_id).first()
        if not workspace:
            return Response({'detail': 'Workspace not found.'}, status=status.HTTP_404_NOT_FOUND)

        membership = WorkspaceMember.objects.filter(workspace=workspace, user=request.user).first()
        if not membership or membership.role not in [WorkspaceMember.ROLE_OWNER, WorkspaceMember.ROLE_ADMIN]:
            return Response({'detail': 'Only owner/admin can add members.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AddWorkspaceMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.get(email=serializer.validated_data['email'])
        role = serializer.validated_data['role']

        if WorkspaceMember.objects.filter(workspace=workspace, user=user).exists():
            return Response({'detail': 'User is already a workspace member.'}, status=status.HTTP_400_BAD_REQUEST)

        new_member = WorkspaceMember.objects.create(workspace=workspace, user=user, role=role)

        create_notification(
            recipient=user,
            actor=request.user,
            notification_type=Notification.TYPE_ADDED_TO_WORKSPACE,
            message=f"You were added to workspace '{workspace.name}' as {role.title()}",
            workspace=workspace,
        )

        return Response(WorkspaceMemberSerializer(new_member).data, status=status.HTTP_201_CREATED)


class UpdateWorkspaceMemberRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, workspace_id, member_id):
        workspace = Workspace.objects.filter(id=workspace_id).first()
        if not workspace:
            return Response({'detail': 'Workspace not found.'}, status=status.HTTP_404_NOT_FOUND)

        current_membership = WorkspaceMember.objects.filter(workspace=workspace, user=request.user).first()
        if not current_membership or current_membership.role != WorkspaceMember.ROLE_OWNER:
            return Response({'detail': 'Only owner can change member roles.'}, status=status.HTTP_403_FORBIDDEN)

        target_membership = WorkspaceMember.objects.filter(id=member_id, workspace=workspace).select_related('user').first()
        if not target_membership:
            return Response({'detail': 'Member not found.'}, status=status.HTTP_404_NOT_FOUND)

        if target_membership.role == WorkspaceMember.ROLE_OWNER:
            return Response({'detail': 'Owner role cannot be changed here.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UpdateMemberRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target_membership.role = serializer.validated_data['role']
        target_membership.save()

        create_notification(
            recipient=target_membership.user,
            actor=request.user,
            notification_type=Notification.TYPE_ROLE_UPDATED,
            message=f"Your role in workspace '{workspace.name}' was changed to {target_membership.role.title()}",
            workspace=workspace,
        )

        return Response(WorkspaceMemberSerializer(target_membership).data)


class RemoveWorkspaceMemberView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, workspace_id, member_id):
        workspace = Workspace.objects.filter(id=workspace_id).first()
        if not workspace:
            return Response({'detail': 'Workspace not found.'}, status=status.HTTP_404_NOT_FOUND)

        current_membership = WorkspaceMember.objects.filter(workspace=workspace, user=request.user).first()
        if not current_membership or current_membership.role not in [WorkspaceMember.ROLE_OWNER, WorkspaceMember.ROLE_ADMIN]:
            return Response({'detail': 'Only owner/admin can remove members.'}, status=status.HTTP_403_FORBIDDEN)

        target_membership = WorkspaceMember.objects.filter(id=member_id, workspace=workspace).first()
        if not target_membership:
            return Response({'detail': 'Member not found.'}, status=status.HTTP_404_NOT_FOUND)

        if target_membership.role == WorkspaceMember.ROLE_OWNER:
            return Response({'detail': 'Owner cannot be removed.'}, status=status.HTTP_400_BAD_REQUEST)

        if current_membership.role == WorkspaceMember.ROLE_ADMIN and target_membership.role == WorkspaceMember.ROLE_ADMIN:
            return Response({'detail': 'Admin cannot remove another admin.'}, status=status.HTTP_403_FORBIDDEN)

        target_membership.delete()
        return Response({'detail': 'Member removed successfully.'}, status=status.HTTP_200_OK)