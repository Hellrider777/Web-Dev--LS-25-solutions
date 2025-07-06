from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Traditional Django views
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('verify/<uuid:token>/', views.verify_email_view, name='verify'),
    path('', views.home_view, name='home'),
    
    # API endpoints for React frontend
    path('api/register/', views.api_register, name='api_register'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('api/current-user/', views.api_current_user, name='api_current_user'),
] 