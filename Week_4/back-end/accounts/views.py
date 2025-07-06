from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.urls import reverse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import json
from .forms import CustomUserRegistrationForm, CustomLoginForm
from .models import EmailVerificationToken


def register_view(request):
    """User registration view"""
    if request.user.is_authenticated:
        return redirect('accounts:dashboard')
    
    if request.method == 'POST':
        form = CustomUserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False  # User needs to verify email first
            user.save()
            
            # Create verification token
            verification_token = EmailVerificationToken.objects.create(user=user)
            
            # Simulate sending email (using console backend)
            print(f"\n{'='*50}")
            print(f"SIMULATED EMAIL VERIFICATION")
            print(f"{'='*50}")
            print(f"To: {user.email}")
            print(f"Subject: Verify your YouTube Clone account")
            print(f"Verification Link: http://127.0.0.1:8000{reverse('accounts:verify', kwargs={'token': verification_token.token})}")
            print(f"{'='*50}\n")
            
            messages.success(request, 
                f'Registration successful! Please check the console for your verification link '
                f'(simulated email sent to {user.email})')
            return redirect('accounts:login')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = CustomUserRegistrationForm()
    
    return render(request, 'accounts/register.html', {'form': form})


def login_view(request):
    """User login view"""
    if request.user.is_authenticated:
        return redirect('accounts:dashboard')
    
    if request.method == 'POST':
        form = CustomLoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            
            if user is not None:
                if user.is_active:
                    login(request, user)
                    messages.success(request, f'Welcome back, {user.username}!')
                    
                    # Redirect to next page if specified
                    next_page = request.GET.get('next')
                    if next_page:
                        return redirect(next_page)
                    return redirect('accounts:dashboard')
                else:
                    messages.error(request, 'Your account is not verified. Please check your email for verification link.')
            else:
                messages.error(request, 'Invalid username or password.')
        else:
            messages.error(request, 'Invalid username or password.')
    else:
        form = CustomLoginForm()
    
    return render(request, 'accounts/login.html', {'form': form})


def logout_view(request):
    """User logout view"""
    if request.user.is_authenticated:
        username = request.user.username
        logout(request)
        messages.success(request, f'Goodbye, {username}! You have been logged out.')
    return redirect('accounts:login')


@login_required
def dashboard_view(request):
    """Protected dashboard view"""
    return render(request, 'accounts/dashboard.html', {
        'user': request.user
    })


def verify_email_view(request, token):
    """Email verification view"""
    try:
        verification_token = get_object_or_404(EmailVerificationToken, token=token)
        
        if verification_token.is_verified:
            messages.info(request, 'Your account is already verified.')
            return redirect('accounts:login')
        
        if verification_token.is_expired():
            messages.error(request, 'Verification link has expired. Please register again.')
            return redirect('accounts:register')
        
        # Verify the user
        user = verification_token.user
        user.is_active = True
        user.save()
        
        verification_token.is_verified = True
        verification_token.save()
        
        messages.success(request, 'Account Verified Successfully! You can now login.')
        return render(request, 'accounts/verify.html', {
            'success': True,
            'user': user
        })
        
    except EmailVerificationToken.DoesNotExist:
        messages.error(request, 'Invalid verification link.')
        return redirect('accounts:register')


def home_view(request):
    """Home page view"""
    return render(request, 'accounts/home.html')


# API Views for React Frontend
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def api_register(request):
    """API endpoint for user registration"""
    try:
        data = request.data
        
        # Validate required fields
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name', '')
        
        if not username or not email or not password:
            return Response({
                'error': 'Username, email, and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response({
                'error': 'Username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response({
                'error': 'Email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=full_name
        )
        user.is_active = True  # For development - skip email verification
        user.save()
        
        return Response({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.first_name
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def api_login(request):
    """API endpoint for user login"""
    try:
        data = request.data
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        
        if user is not None:
            if user.is_active:
                login(request, user)
                return Response({
                    'message': 'Login successful',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'full_name': user.first_name
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Account is not verified'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'error': 'Invalid username or password'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@csrf_exempt
def api_logout(request):
    """API endpoint for user logout"""
    try:
        if request.user.is_authenticated:
            logout(request)
            return Response({
                'message': 'Logged out successfully'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'No user is logged in'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@csrf_exempt
def api_current_user(request):
    """API endpoint to get current user info"""
    try:
        if request.user.is_authenticated:
            return Response({
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                    'full_name': request.user.first_name
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'user': None
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
