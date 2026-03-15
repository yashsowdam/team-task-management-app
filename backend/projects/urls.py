from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView

urlpatterns = [
    path('workspace/<int:workspace_id>/', ProjectListCreateView.as_view(), name='project-list-create'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
]