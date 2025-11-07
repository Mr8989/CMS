# api/member_urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Members endpoints
    path('members/', views.get_all_members, name='get_all_members'),
    path('members/create/', views.create_member, name='create_member'),
    path('members/import/', views.import_members, name='import_members'),
    path('members/statistics/', views.member_statistics, name='member_statistics'),
    path('members/<int:pk>/', views.get_member, name='get_member'),
    path('members/<int:pk>/update/', views.update_member, name='update_member'),
    path('members/<int:pk>/delete/', views.delete_member, name='delete_member'),
]