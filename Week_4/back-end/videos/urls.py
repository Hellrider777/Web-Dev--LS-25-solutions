from django.urls import path, include
from . import views

app_name = 'videos'

urlpatterns = [
    # Category URLs
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('categories/all/', views.video_categories, name='all-categories'),
    
    # Video CRUD URLs
    path('videos/', views.VideoListView.as_view(), name='video-list'),
    path('videos/create/', views.VideoCreateView.as_view(), name='video-create'),
    path('videos/<int:pk>/', views.VideoDetailView.as_view(), name='video-detail'),
    path('videos/<int:pk>/update/', views.VideoUpdateView.as_view(), name='video-update'),
    path('videos/<int:pk>/delete/', views.VideoDeleteView.as_view(), name='video-delete'),
    
    # User's videos
    path('my-videos/', views.UserVideosView.as_view(), name='user-videos'),
    
    # Search
    path('search/', views.VideoSearchView.as_view(), name='video-search'),
    
    # Trending/Popular
    path('trending/', views.TrendingVideosView.as_view(), name='trending-videos'),
    path('popular/', views.PopularVideosView.as_view(), name='popular-videos'),
    
    # Comments
    path('videos/<int:video_id>/comments/', views.VideoCommentsView.as_view(), name='video-comments'),
    path('comments/<int:comment_id>/reply/', views.CommentReplyView.as_view(), name='comment-reply'),
    path('comments/<int:pk>/update/', views.CommentUpdateView.as_view(), name='comment-update'),
    
    # Likes
    path('videos/<int:video_id>/like/', views.toggle_like_video, name='toggle-like'),
    
    # Watch Later
    path('watch-later/', views.WatchLaterListView.as_view(), name='watch-later-list'),
    path('videos/<int:video_id>/watch-later/', views.toggle_watch_later, name='toggle-watch-later'),
    
    # Subscriptions
    path('subscriptions/', views.SubscriptionListView.as_view(), name='subscription-list'),
    path('users/<int:user_id>/subscribe/', views.toggle_subscription, name='toggle-subscription'),
    
    # Playlists
    path('playlists/', views.PlaylistListView.as_view(), name='playlist-list'),
    path('playlists/<int:pk>/', views.PlaylistDetailView.as_view(), name='playlist-detail'),
    
    # Dashboard
    path('dashboard/stats/', views.user_dashboard_stats, name='dashboard-stats'),
] 