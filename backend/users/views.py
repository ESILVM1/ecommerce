from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from users.models import CustomUser, UserProfile
from users.serializers import (
    UserSerializer,
    UserProfileSerializer,
    UserRegisterSerializer,
    UserLoginSerializer,
    ChangePasswordSerializer,
    UpdateProfileSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management.
    Provides authentication, profile management, and account operations.
    Actions: register, login, logout, me, update_profile, change_password, delete_account
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @method_decorator(ratelimit(key='ip', rate='5/h', method='POST', block=True))
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """
        Register a new user and return authentication token.
        Rate limit: 5 registrations per hour per IP address.
        """
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'User created successfully!'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @method_decorator(ratelimit(key='ip', rate='10/h', method='POST', block=True))
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """
        Authenticate user and return authentication token.
        Rate limit: 10 login attempts per hour per IP address.
        """
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'Login successful!'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        """Logout user by deleting their authentication token"""
        request.user.auth_token.delete()
        return Response(
            {'message': 'Logout successful!'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Retrieve the current authenticated user's profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put'], permission_classes=[permissions.IsAuthenticated])
    def update_profile(self, request):
        """Update the current user's profile information"""
        profile = request.user.profile
        serializer = UpdateProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'profile': UserProfileSerializer(profile).data,
                'message': 'Profile updated successfully!'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        """Change the current user's password with old password verification"""
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': 'Current password is incorrect.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response(
                {'message': 'Password changed successfully!'},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def delete_account(self, request):
        """Delete the current user's account permanently"""
        user = request.user
        user.delete()
        return Response(
            {'message': 'Account deleted successfully!'},
            status=status.HTTP_204_NO_CONTENT
        )


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user profile management.
    Provides read/write access to user profile data.
    Only users can access their own profiles.
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only the current user's profile"""
        return UserProfile.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Retrieve the current user's profile"""
        profile = request.user.profile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
