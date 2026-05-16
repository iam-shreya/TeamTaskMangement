from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Team, TeamMember
from accounts.serializers import UserSerializer

User = get_user_model()


class TeamMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TeamMember
        fields = ['id', 'user', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class TeamListSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'color', 'member_count', 'created_at']

    def get_member_count(self, obj):
        return obj.team_members.count()


class TeamDetailSerializer(TeamListSerializer):
    team_members = TeamMemberSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta(TeamListSerializer.Meta):
        fields = TeamListSerializer.Meta.fields + ['team_members', 'created_by', 'updated_at']


class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['name', 'description', 'color']


class AddTeamMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=['LEAD', 'MEMBER'], default='MEMBER'
    )

    def validate_email(self, value):
        try:
            User.objects.get(email=value.lower())
        except User.DoesNotExist:
            raise serializers.ValidationError('No user found with this email.')
        return value.lower()
