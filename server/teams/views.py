from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from .models import Team, TeamMember
from .serializers import (
    TeamListSerializer,
    TeamDetailSerializer,
    TeamCreateSerializer,
    AddTeamMemberSerializer,
    TeamMemberSerializer,
)

User = get_user_model()


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def team_list_create(request):
    if request.method == 'GET':
        teams = Team.objects.all()
        serializer = TeamListSerializer(teams, many=True)
        return Response(serializer.data)

    # POST — create team
    serializer = TeamCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    team = serializer.save(created_by=request.user)
    # Creator automatically becomes lead
    TeamMember.objects.create(team=team, user=request.user, role='LEAD')
    return Response(
        TeamDetailSerializer(team).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def team_detail(request, pk):
    team = get_object_or_404(Team, pk=pk)

    if request.method == 'GET':
        serializer = TeamDetailSerializer(team)
        return Response(serializer.data)

    if request.method == 'PUT':
        for field in ('name', 'description', 'color'):
            if field in request.data:
                setattr(team, field, request.data[field])
        team.save()
        return Response(TeamDetailSerializer(team).data)

    if request.method == 'DELETE':
        team.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_team_member(request, pk):
    team = get_object_or_404(Team, pk=pk)

    serializer = AddTeamMemberSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = User.objects.get(email=serializer.validated_data['email'])

    if TeamMember.objects.filter(team=team, user=user).exists():
        return Response(
            {'detail': 'User is already a member of this team.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    member = TeamMember.objects.create(
        team=team,
        user=user,
        role=serializer.validated_data.get('role', 'MEMBER'),
    )
    return Response(
        TeamMemberSerializer(member).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_team_member(request, pk, user_id):
    team = get_object_or_404(Team, pk=pk)

    membership = get_object_or_404(TeamMember, team=team, user_id=user_id)
    membership.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_users(request):
    """Return all users in the system for member selection dropdowns."""
    users = User.objects.all().order_by('name')
    from accounts.serializers import UserSerializer
    return Response(UserSerializer(users, many=True).data)
