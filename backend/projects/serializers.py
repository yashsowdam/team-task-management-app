from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "workspace",
            "title",
            "description",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["workspace", "created_by", "created_at", "updated_at"]