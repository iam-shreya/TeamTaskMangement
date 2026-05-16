from django.db import models
from django.conf import settings


class Team(models.Model):
    """A team groups users together across the workspace."""

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    color = models.CharField(max_length=7, default='#6C63FF')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_teams',
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='TeamMember',
        related_name='teams',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class TeamMember(models.Model):
    ROLE_CHOICES = [
        ('LEAD', 'Lead'),
        ('MEMBER', 'Member'),
    ]

    team = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name='team_members'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='team_memberships',
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='MEMBER')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['team', 'user']
        ordering = ['joined_at']

    def __str__(self):
        return f'{self.user.name} — {self.team.name} ({self.role})'
