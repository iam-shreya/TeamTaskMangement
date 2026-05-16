from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone

from tasks.models import Task
from projects.models import ProjectMember


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    """Aggregated analytics for the current user's projects."""
    user = request.user

    # All projects the user belongs to
    project_ids = ProjectMember.objects.filter(
        user=user
    ).values_list('project_id', flat=True)

    all_tasks = Task.objects.filter(project_id__in=project_ids)
    my_tasks = all_tasks.filter(assignee=user)
    today = timezone.now().date()

    # Status breakdown
    status_agg = dict(
        all_tasks.values('status')
        .annotate(count=Count('id'))
        .values_list('status', 'count')
    )

    # Overdue (not done, past due)
    overdue_count = all_tasks.filter(
        due_date__lt=today
    ).exclude(status='DONE').count()

    my_overdue = my_tasks.filter(
        due_date__lt=today
    ).exclude(status='DONE').count()

    # Tasks per user (top 10)
    tasks_per_user = list(
        all_tasks.filter(assignee__isnull=False)
        .values('assignee__id', 'assignee__name', 'assignee__avatar_color')
        .annotate(count=Count('id'))
        .order_by('-count')[:10]
    )

    # Recent tasks assigned to me
    from tasks.serializers import TaskSerializer
    recent = my_tasks.select_related(
        'project', 'assignee', 'created_by'
    ).order_by('-updated_at')[:8]

    # Project breakdown
    project_stats = list(
        all_tasks.values('project__id', 'project__name', 'project__color')
        .annotate(
            total=Count('id'),
            done=Count('id', filter=Q(status='DONE')),
        )
        .order_by('-total')
    )

    return Response({
        'total_tasks': all_tasks.count(),
        'my_tasks': my_tasks.count(),
        'by_status': {
            'todo': status_agg.get('TODO', 0),
            'in_progress': status_agg.get('IN_PROGRESS', 0),
            'done': status_agg.get('DONE', 0),
        },
        'overdue': overdue_count,
        'my_overdue': my_overdue,
        'tasks_per_user': tasks_per_user,
        'recent_tasks': TaskSerializer(recent, many=True).data,
        'project_stats': project_stats,
        'total_projects': len(project_ids),
    })
