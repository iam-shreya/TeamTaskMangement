from django.urls import path
from . import views

urlpatterns = [
    path('project/<int:project_id>/', views.task_list_create, name='task-list-create'),
    path('<int:pk>/', views.task_detail, name='task-detail'),
]
