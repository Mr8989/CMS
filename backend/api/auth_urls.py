from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from . import auth_views

urlpatterns = [
    #Jwt token endpoint
    path('token/refresh/', TokenRefreshView.as_view(), name= 'token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    #custom endpoint
    path('register/', auth_views.register_user, name='register'),
     path('login/', auth_views.login_user, name= 'login'),
    path('logout/', auth_views.logout_user, name= 'logout'),
    path('me/', auth_views.current_user, name= 'current_user') 
]