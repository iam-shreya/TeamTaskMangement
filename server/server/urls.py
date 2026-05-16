from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
import os


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/teams/', include('teams.urls')),
]

# Serve React SPA for all non-API routes in production
if not settings.DEBUG or os.path.isfile(os.path.join(settings.BASE_DIR, 'build', 'index.html')):
    urlpatterns += [
        re_path(r'^(?!api/|admin/|assets/).*$',
                TemplateView.as_view(template_name='index.html'),
                name='spa-fallback'),
    ]
