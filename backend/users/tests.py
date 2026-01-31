from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import CustomUser, UserProfile


class UserRegistrationTestCase(TestCase):
    """Tests pour l'enregistrement utilisateur"""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('user-register')
    
    def test_user_registration_success(self):
        """Test enregistrement réussi"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertTrue(CustomUser.objects.filter(username='testuser').exists())
    
    def test_user_registration_password_mismatch(self):
        """Test enregistrement avec mots de passe différents"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'differentpass',
            'first_name': 'Test',
            'last_name': 'User',
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_user_registration_duplicate_email(self):
        """Test enregistrement avec email existant"""
        CustomUser.objects.create_user(
            username='existing',
            email='test@example.com',
            password='testpass123'
        )
        data = {
            'username': 'newuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserLoginTestCase(TestCase):
    """Tests pour la connexion"""
    
    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse('user-login')
        self.user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_login_success(self):
        """Test connexion réussie"""
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
    
    def test_login_invalid_credentials(self):
        """Test connexion avec identifiants invalides"""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserProfileTestCase(TestCase):
    """Tests pour le profil utilisateur"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_get_my_profile(self):
        """Test récupération du profil"""
        url = reverse('profile-my-profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_update_profile(self):
        """Test mise à jour du profil"""
        url = reverse('user-update-profile')
        data = {
            'bio': 'Test bio',
            'gender': 'M',
            'city': 'Paris',
            'country': 'France'
        }
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.bio, 'Test bio')


class ChangePasswordTestCase(TestCase):
    """Tests pour changer le mot de passe"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='oldpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_change_password_success(self):
        """Test changement de mot de passe réussi"""
        url = reverse('user-change-password')
        data = {
            'old_password': 'oldpass123',
            'new_password': 'newpass123',
            'new_password_confirm': 'newpass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_change_password_wrong_old_password(self):
        """Test changement avec ancien mot de passe incorrect"""
        url = reverse('user-change-password')
        data = {
            'old_password': 'wrongpass',
            'new_password': 'newpass123',
            'new_password_confirm': 'newpass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
