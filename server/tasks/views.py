from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Task
from .serializers import TaskSerializer, TaskCreateSerializer
from projects.models import Project, ProjectMember


def _is_admin(user, project):
    return ProjectMember.objects.filter(
        project=project, user=user, role='ADMIN'
    ).exists()


def _is_member(user, project):
    return ProjectMember.objects.filter(project=project, user=user).exists()


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list_create(request, project_id):
    project = get_object_or_404(Project, pk=project_id)

    if not _is_member(request.user, project):
        return Response(
            {'detail': 'You are not a member of this project.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == 'GET':
        tasks = Task.objects.filter(project=project).select_related(
            'assignee', 'created_by', 'project'
        )

        # Members only see their own tasks
        membership = ProjectMember.objects.get(project=project, user=request.user)
        if membership.role == 'MEMBER':
            tasks = tasks.filter(assignee=request.user)

        # Optional filters
        task_status = request.query_params.get('status')
        if task_status:
            tasks = tasks.filter(status=task_status)

        priority = request.query_params.get('priority')
        if priority:
            tasks = tasks.filter(priority=priority)

        return Response(TaskSerializer(tasks, many=True).data)

    # POST — create task (admin only)
    if not _is_admin(request.user, project):
        return Response(
            {'detail': 'Only admins can create tasks.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = TaskCreateSerializer(
        data=request.data, context={'project': project}
    )
    serializer.is_valid(raise_exception=True)
    task = serializer.save(project=project, created_by=request.user)

    return Response(
        TaskSerializer(task).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):
    task = get_object_or_404(
        Task.objects.select_related('assignee', 'created_by', 'project'),
        pk=pk,
    )
    project = task.project

    if not _is_member(request.user, project):
        return Response(
            {'detail': 'You are not a member of this project.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    is_admin = _is_admin(request.user, project)
    is_assignee = task.assignee == request.user

    if request.method == 'GET':
        if not is_admin and not is_assignee:
            return Response(
                {'detail': 'You can only view tasks assigned to you.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(TaskSerializer(task).data)

    if request.method == 'PUT':
        if not is_admin and not is_assignee:
            return Response(
                {'detail': 'You can only update tasks assigned to you.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Members can only update status
        if not is_admin and is_assignee:
            allowed_fields = {'status'}
            update_fields = set(request.data.keys())
            if not update_fields.issubset(allowed_fields):
                return Response(
                    {'detail': 'Members can only update task status.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

        # Apply updates
        updatable = ['title', 'description', 'status', 'priority', 'due_date', 'assignee']
        for field in updatable:
            if field in request.data:
                value = request.data[field]
                if field == 'assignee' and value:
                    # Validate assignee is a project member
                    if not ProjectMember.objects.filter(
                        project=project, user_id=value
                    ).exists():
                        return Response(
                            {'detail': 'Assignee must be a project member.'},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                if field == 'assignee' and not value:
                    task.assignee = None
                elif field == 'due_date' and not value:
                    task.due_date = None
                else:
                    setattr(task, field + '_id' if field == 'assignee' else field, value)
        task.save()
        task.refresh_from_db()
        return Response(TaskSerializer(task).data)

    if request.method == 'DELETE':
        if not is_admin:
            return Response(
                {'detail': 'Only admins can delete tasks.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
