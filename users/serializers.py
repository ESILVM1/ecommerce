from rest_framework import serializers
from django.contrib.auth import authenticate
from users.models import CustomUser, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model - handles profile data serialization"""
    class Meta:
        model = UserProfile
        fields = [
            'id', 'bio', 'gender', 'profile_picture', 'address',
            'city', 'postal_code', 'country', 'is_verified',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for CustomUser model - includes nested profile data"""
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'date_of_birth', 'profile'
        ]
        read_only_fields = ['id']


class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration - validates password confirmation"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'password', 'password_confirm', 'phone'
        ]
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError(
                {"password": "Passwords do not match."}
            )
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login - authenticates credentials"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(
            username=data['username'],
            password=data['password']
        )
        if not user:
            raise serializers.ValidationError(
                "Invalid credentials."
            )
        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change - validates old and new passwords"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError(
                {"new_password": "Passwords do not match."}
            )
        return data


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Serializer for profile updates - allows partial profile modifications"""
    class Meta:
        model = UserProfile
        fields = [
            'bio', 'gender', 'profile_picture', 'address',
            'city', 'postal_code', 'country'
        ]