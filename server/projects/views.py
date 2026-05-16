from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from .models import Project, ProjectMember
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    ProjectCreateSerializer,
    AddMemberSerializer,
    ProjectMemberSerializer,
)

User = get_user_model()


def _is_admin(user, project):
    return ProjectMember.objects.filter(
        project=project, user=user, role='ADMIN'
    ).exists()


def _is_member(user, project):
    return ProjectMember.objects.filter(project=project, user=user).exists()


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def project_list_create(request):
    if request.method == 'GET':
        project_ids = ProjectMember.objects.filter(
            user=request.user
        ).values_list('project_id', flat=True)
        projects = Project.objects.filter(id__in=project_ids)
        serializer = ProjectListSerializer(
            projects, many=True, context={'request': request}
        )
        return Response(serializer.data)

    # POST — create project
    serializer = ProjectCreateSerializer(
        data=request.data, context={'request': request}
    )
    serializer.is_valid(raise_exception=True)
    project = serializer.save()
    return Response(
        ProjectDetailSerializer(project, context={'request': request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def project_detail(request, pk):
    project = get_object_or_404(Project, pk=pk)

    if not _is_member(request.user, project):
        return Response(
            {'detail': 'You are not a member of this project.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == 'GET':
        serializer = ProjectDetailSerializer(
            project, context={'request': request}
        )
        return Response(serializer.data)

    if not _is_admin(request.user, project):
        return Response(
            {'detail': 'Only admins can modify this project.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == 'PUT':
        for field in ('name', 'description', 'color'):
            if field in request.data:
                setattr(project, field, request.data[field])
        project.save()
        return Response(
            ProjectDetailSerializer(project, context={'request': request}).data
        )

    if request.method == 'DELETE':
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_member(request, pk):
    project = get_object_or_404(Project, pk=pk)

    if not _is_admin(request.user, project):
        return Response(
            {'detail': 'Only admins can add members.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = AddMemberSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = User.objects.get(email=serializer.validated_data['email'])

    if ProjectMember.objects.filter(project=project, user=user).exists():
        return Response(
            {'detail': 'User is already a member of this project.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    member = ProjectMember.objects.create(
        project=project,
        user=user,
        role=serializer.validated_data.get('role', 'MEMBER'),
    )
    return Response(
        ProjectMemberSerializer(member).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_member(request, pk, user_id):
    project = get_object_or_404(Project, pk=pk)

    if not _is_admin(request.user, project):
        return Response(
            {'detail': 'Only admins can remove members.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    membership = get_object_or_404(ProjectMember, project=project, user_id=user_id)

    # Prevent removing the last admin
    if membership.role == 'ADMIN':
        admin_count = ProjectMember.objects.filter(
            project=project, role='ADMIN'
        ).count()
        if admin_count <= 1:
            return Response(
                {'detail': 'Cannot remove the last admin from the project.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    membership.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
