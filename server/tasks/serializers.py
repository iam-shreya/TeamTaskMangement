from rest_framework import serializers
from .models import Task
from accounts.serializers import UserSerializer


class TaskSerializer(serializers.ModelSerializer):
    assignee_detail = UserSerializer(source='assignee', read_only=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'due_date', 'project', 'project_name', 'assignee',
            'assignee_detail', 'created_by', 'created_by_detail',
            'is_overdue', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_is_overdue(self, obj):
        from django.utils import timezone
        if obj.due_date and obj.status != 'DONE':
            return obj.due_date < timezone.now().date()
        return False


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['title', 'description', 'status', 'priority', 'due_date', 'assignee']

    def validate_assignee(self, value):
        if value:
            from projects.models import ProjectMember
            project = self.context.get('project')
            if project and not ProjectMember.objects.filter(
                project=project, user=value
            ).exists():
                raise serializers.ValidationError(
                    'Assignee must be a member of the project.'
                )
        return value
