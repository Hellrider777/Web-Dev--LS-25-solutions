from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse
from django.urls import reverse
from django.contrib.auth.models import User
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
