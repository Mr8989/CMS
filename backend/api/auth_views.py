from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')


    #Validation
    if not username or not password:
        return Response (
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if email and User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already exist'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response(
           { 'error': 'Username already exist'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate password strength

    try:
        validate_password(password)
    except ValidationError as e:
        return Response(
            {'error' : list(e.messages)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    #create User

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )
    

    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'message': 'User registered successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        },
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_201_CREATED)

# auth_views.py - Improved login_user function

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login with email or username"""
    print("📥 Login request data:", request.data)
    
    email_or_username = request.data.get('email')
    password = request.data.get('password')
    
    print(f"🔍 Attempting login for: {email_or_username}")

    if not email_or_username or not password:
        return Response({
            'error': 'Email/username and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Try to find user by email or username
    user = None
    try:
        # Try email first
        user = User.objects.get(email=email_or_username)
        print(f"✅ User found by email: {user.username}")
    except User.DoesNotExist:
        try:
            # Try username
            user = User.objects.get(username=email_or_username)
            print(f"✅ User found by username: {user.username}")
        except User.DoesNotExist:
            print(f"❌ User not found: {email_or_username}")
            return Response({
                'error': 'Invalid email or username'
            }, status=status.HTTP_401_UNAUTHORIZED)

    # Check password
    if not user.check_password(password):
        print("❌ Password check failed")
        return Response({
            'error': 'Invalid password'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check if user is active
    if not user.is_active:
        print("❌ User account is disabled")
        return Response({
            'error': 'Account is disabled'
        }, status=status.HTTP_403_FORBIDDEN)

    print(f"✅ Password verified for user: {user.username}")

    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    print(f"🔑 Generated tokens:")
    print(f"   Access: {access_token[:50]}...")
    print(f"   Refresh: {refresh_token[:50]}...")

    response_data = {
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        },
        'tokens': {
            'access': access_token,
            'refresh': refresh_token,
        }
    }
    
    print("✅ Sending response with user data and tokens")
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user by blacklisting refresh token"""
    try:
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response(
            {'message': 'Successfully logged out'},
            status=status.HTTP_205_RESET_CONTENT
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current authenticated user details"""
    user = request.user
    print(f"Get current user: {user}")
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'date_joined': user.date_joined,
    })