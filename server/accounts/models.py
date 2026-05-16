from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user with email-based auth and display name."""

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    avatar_color = models.CharField(
        max_length=7,
        default='#6C63FF',
        help_text='Hex color for avatar background',
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return self.name or self.email
