from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember
from accounts.serializers import UserSerializer

User = get_user_model()


class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class ProjectListSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    completed_count = serializers.SerializerMethodField()
    my_role = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'color',
            'created_at', 'member_count', 'task_count',
            'completed_count', 'my_role',
        ]

    def get_member_count(self, obj):
        return obj.members.count()

    def get_task_count(self, obj):
        return obj.tasks.count()

    def get_completed_count(self, obj):
        return obj.tasks.filter(status='DONE').count()

    def get_my_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = obj.members.filter(user=request.user).first()
            return membership.role if membership else None
        return None


class ProjectDetailSerializer(ProjectListSerializer):
    members = ProjectMemberSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta(ProjectListSerializer.Meta):
        fields = ProjectListSerializer.Meta.fields + ['members', 'created_by', 'updated_at']


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['name', 'description', 'color']

    def create(self, validated_data):
        import random
        colors = ['#6C63FF', '#00D4AA', '#FF6B6B', '#FFB86C', '#50C8FF', '#FF79C6']
        user = self.context['request'].user
        if not validated_data.get('color'):
            validated_data['color'] = random.choice(colors)
        project = Project.objects.create(created_by=user, **validated_data)
        # Creator automatically becomes admin
        ProjectMember.objects.create(project=project, user=user, role='ADMIN')
        return project


class AddMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=['ADMIN', 'MEMBER'], default='MEMBER'
    )

    def validate_email(self, value):
        try:
            User.objects.get(email=value.lower())
        except User.DoesNotExist:
            raise serializers.ValidationError('No user found with this email.')
        return value.lower()
