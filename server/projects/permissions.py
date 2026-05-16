from rest_framework import permissions
from .models import ProjectMember


class IsProjectAdmin(permissions.BasePermission):
    """Only project admins can perform this action."""

    def has_object_permission(self, request, view, obj):
        # obj is a Project instance
        return ProjectMember.objects.filter(
            project=obj, user=request.user, role='ADMIN'
        ).exists()


class IsProjectMember(permissions.BasePermission):
    """Any project member (admin or member) can access."""

    def has_object_permission(self, request, view, obj):
        return ProjectMember.objects.filter(
            project=obj, user=request.user
        ).exists()
