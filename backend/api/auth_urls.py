from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from . import auth_views

urlpatterns = [
    #Jwt token endpoint
    path('login/', TokenObtainPairView.as_view(), name= 'token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name= 'token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    #custom endpoint
    path('register/', auth_views.register_user, name='register'),
    path('logout/', auth_views.logout_user, name= 'logout'),
    path('me/', auth_views.current_user, name= 'current_user')
]