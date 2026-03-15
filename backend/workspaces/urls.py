from django.urls import path
from .views import (
    WorkspaceListCreateView,
    WorkspaceDetailView,
    WorkspaceMembersListView,
    AddWorkspaceMemberView,
    UpdateWorkspaceMemberRoleView,
    RemoveWorkspaceMemberView,
)

urlpatterns = [
    path('', WorkspaceListCreateView.as_view(), name='workspace-list-create'),
    path('<int:pk>/', WorkspaceDetailView.as_view(), name='workspace-detail'),

    path('<int:workspace_id>/members/', WorkspaceMembersListView.as_view(), name='workspace-members'),
    path('<int:workspace_id>/members/add/', AddWorkspaceMemberView.as_view(), name='workspace-member-add'),
    path('<int:workspace_id>/members/<int:member_id>/role/', UpdateWorkspaceMemberRoleView.as_view(), name='workspace-member-role-update'),
    path('<int:workspace_id>/members/<int:member_id>/remove/', RemoveWorkspaceMemberView.as_view(), name='workspace-member-remove'),
]