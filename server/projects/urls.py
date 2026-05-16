from django.urls import path
from . import views

urlpatterns = [
    path('', views.project_list_create, name='project-list-create'),
    path('<int:pk>/', views.project_detail, name='project-detail'),
    path('<int:pk>/members/', views.add_member, name='add-member'),
    path('<int:pk>/members/<int:user_id>/', views.remove_member, name='remove-member'),
]
