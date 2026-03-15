from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Task
from workspaces.models import WorkspaceMember

User = get_user_model()


class TaskSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    assigned_to_username = serializers.CharField(source="assigned_to.username", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "assigned_to",
            "assigned_to_username",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["project", "created_by", "created_at", "updated_at"]

    def validate(self, attrs):
        project = attrs.get("project") or getattr(self.instance, "project", None)
        assigned_to = attrs.get("assigned_to")

        if assigned_to and project:
            is_workspace_member = WorkspaceMember.objects.filter(
                workspace=project.workspace,
                user=assigned_to
            ).exists()

            if not is_workspace_member:
                raise serializers.ValidationError({
                    "assigned_to": "Assigned user must belong to the same workspace."
                })

        return attrs


class TaskStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Task.STATUS_CHOICES)


class TaskAssignSerializer(serializers.Serializer):
    assigned_to = serializers.IntegerField()

    def validate_assigned_to(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("User not found.")
        return value