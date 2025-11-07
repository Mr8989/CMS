from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('', views.attendance_history, name='attendance_history'),
    path('upload/', views.upload_attendance, name='upload_attendance'),
    path('report/<int:pk>/', views.attendance_report, name='attendance_report'),
    path('export/<int:pk>/', views.export_attendance_excel, name='export_attendance'),
    path('delete/<int:pk>/', views.delete_attendance_record, name='delete_attendance'),
]