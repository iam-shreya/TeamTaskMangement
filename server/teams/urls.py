from django.urls import path
from . import views

urlpatterns = [
    path('', views.team_list_create, name='team-list-create'),
    path('<int:pk>/', views.team_detail, name='team-detail'),
    path('<int:pk>/members/', views.add_team_member, name='add-team-member'),
    path('<int:pk>/members/<int:user_id>/', views.remove_team_member, name='remove-team-member'),
    path('users/', views.all_users, name='all-users'),
]
