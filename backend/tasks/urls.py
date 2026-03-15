from django.urls import path
from .views import TaskListCreateView, TaskDetailView, TaskStatusUpdateView, TaskAssignView

urlpatterns = [
    path('project/<int:project_id>/', TaskListCreateView.as_view(), name='task-list-create'),
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('<int:pk>/status/', TaskStatusUpdateView.as_view(), name='task-status-update'),
    path('<int:pk>/assign/', TaskAssignView.as_view(), name='task-assign'),
]