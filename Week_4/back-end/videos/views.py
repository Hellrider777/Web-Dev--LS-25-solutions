from django.shortcuts import render
from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q, F, Count, Case, When, IntegerField, Sum
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import models
import os

from .models import (
    Category, Video, Comment, Like, WatchLater, 
    VideoView, Subscription, Playlist, PlaylistVideo
)
from .serializers import (
    CategorySerializer, VideoListSerializer, VideoDetailSerializer,
    VideoCreateUpdateSerializer, CommentSerializer, LikeSerializer,
    WatchLaterSerializer, SubscriptionSerializer, PlaylistSerializer,
    VideoViewSerializer, VideoSearchSerializer, UserSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50


# Category Views
class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# Video Views
class VideoListView(generics.ListAPIView):
    serializer_class = VideoListSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'views_count', 'likes_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Video.objects.filter(status='published').select_related('user', 'category')
        
        # Filter by category
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by user
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        return queryset


class VideoDetailView(generics.RetrieveAPIView):
    queryset = Video.objects.filter(status='published').select_related('user', 'category')
    serializer_class = VideoDetailSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Track video view
        if request.user.is_authenticated or True:  # Track anonymous views too
            self.track_video_view(instance, request)
        
        # Increment view count
        instance.increment_views()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def track_video_view(self, video, request):
        """Track video view for analytics"""
        user = request.user if request.user.is_authenticated else None
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        VideoView.objects.create(
            video=video,
            user=user,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class VideoCreateView(generics.CreateAPIView):
    serializer_class = VideoCreateUpdateSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow anonymous uploads for testing
    
    def perform_create(self, serializer):
        # For testing, use a default user (admin) if no user is authenticated
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            # Use the first user in the database (admin) for anonymous uploads
            from django.contrib.auth.models import User
            default_user = User.objects.first()
            if default_user:
                serializer.save(user=default_user)
            else:
                # Create a default user if none exists
                default_user = User.objects.create_user(
                    username='defaultuser',
                    email='default@example.com',
                    password='defaultpass123'
                )
                serializer.save(user=default_user)


class VideoUpdateView(generics.UpdateAPIView):
    serializer_class = VideoCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Video.objects.filter(user=self.request.user)


class VideoDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Video.objects.filter(user=self.request.user)


class UserVideosView(generics.ListAPIView):
    """Get videos uploaded by a specific user"""
    serializer_class = VideoListSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.AllowAny]  # Temporarily allow anonymous access for testing
    
    def get_queryset(self):
        # For testing, show all videos if user is not authenticated
        if self.request.user.is_authenticated:
            return Video.objects.filter(user=self.request.user).select_related('category')
        else:
            # Return all videos for anonymous users during testing
            return Video.objects.all().select_related('category')


# Comment Views
class VideoCommentsView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        video_id = self.kwargs['video_id']
        return Comment.objects.filter(
            video_id=video_id, 
            parent=None,  # Top-level comments only
            is_approved=True
        ).select_related('user').order_by('-created_at')
    
    def perform_create(self, serializer):
        video_id = self.kwargs['video_id']
        video = get_object_or_404(Video, id=video_id)
        serializer.save(user=self.request.user, video=video)


class CommentReplyView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        comment_id = self.kwargs['comment_id']
        parent_comment = get_object_or_404(Comment, id=comment_id)
        serializer.save(
            user=self.request.user, 
            video=parent_comment.video,
            parent=parent_comment
        )


class CommentUpdateView(generics.UpdateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Comment.objects.filter(user=self.request.user)


# Like/Unlike Views
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like_video(request, video_id):
    """Toggle like/dislike for a video"""
    video = get_object_or_404(Video, id=video_id)
    like_type = request.data.get('like_type', 'like')  # 'like' or 'dislike'
    
    # Check if user already liked/disliked this video
    existing_like = Like.objects.filter(user=request.user, video=video).first()
    
    if existing_like:
        if existing_like.like_type == like_type:
            # Remove like/dislike
            existing_like.delete()
            action = 'removed'
        else:
            # Change like to dislike or vice versa
            existing_like.like_type = like_type
            existing_like.save()
            action = 'changed'
    else:
        # Create new like/dislike
        Like.objects.create(user=request.user, video=video, like_type=like_type)
        action = 'added'
    
    # Update video counts
    video.likes_count = video.likes.filter(like_type='like').count()
    video.dislikes_count = video.likes.filter(like_type='dislike').count()
    video.save(update_fields=['likes_count', 'dislikes_count'])
    
    return Response({
        'action': action,
        'like_type': like_type,
        'likes_count': video.likes_count,
        'dislikes_count': video.dislikes_count
    })


# Watch Later Views
class WatchLaterListView(generics.ListAPIView):
    serializer_class = WatchLaterSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return WatchLater.objects.filter(user=self.request.user).select_related('video')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_watch_later(request, video_id):
    """Add or remove video from watch later"""
    video = get_object_or_404(Video, id=video_id)
    watch_later_item = WatchLater.objects.filter(user=request.user, video=video).first()
    
    if watch_later_item:
        # Remove from watch later
        watch_later_item.delete()
        action = 'removed'
    else:
        # Add to watch later
        WatchLater.objects.create(user=request.user, video=video)
        action = 'added'
    
    return Response({
        'action': action,
        'video_id': video_id
    })


# Search Views
class VideoSearchView(generics.ListAPIView):
    serializer_class = VideoSearchSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        
        if not query:
            return Video.objects.none()
        
        # Search in title, description, and tags
        search_results = Video.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(tags__icontains=query) |
            Q(user__username__icontains=query),
            status='published'
        ).select_related('user', 'category').annotate(
            # Simple relevance scoring
            relevance_score=Case(
                When(title__icontains=query, then=3),
                When(description__icontains=query, then=2),
                When(tags__icontains=query, then=2),
                When(user__username__icontains=query, then=1),
                default=0,
                output_field=IntegerField()
            )
        ).order_by('-relevance_score', '-views_count', '-created_at')
        
        return search_results


# Subscription Views
class SubscriptionListView(generics.ListAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Subscription.objects.filter(subscriber=self.request.user).select_related('channel')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_subscription(request, user_id):
    """Subscribe or unsubscribe from a channel"""
    channel = get_object_or_404(User, id=user_id)
    
    if channel == request.user:
        return Response(
            {'error': 'You cannot subscribe to yourself'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    subscription = Subscription.objects.filter(
        subscriber=request.user, 
        channel=channel
    ).first()
    
    if subscription:
        # Unsubscribe
        subscription.delete()
        action = 'unsubscribed'
    else:
        # Subscribe
        Subscription.objects.create(subscriber=request.user, channel=channel)
        action = 'subscribed'
    
    return Response({
        'action': action,
        'channel_id': user_id
    })


# Playlist Views
class PlaylistListView(generics.ListCreateAPIView):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PlaylistDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user)


# Trending/Popular Videos
class TrendingVideosView(generics.ListAPIView):
    """Get trending videos based on recent views and engagement"""
    serializer_class = VideoListSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        # Get videos trending in the last 7 days
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)
        
        return Video.objects.filter(
            status='published',
            created_at__gte=week_ago
        ).select_related('user', 'category').annotate(
            engagement_score=F('views_count') + F('likes_count') * 2 + F('comments_count') * 3
        ).order_by('-engagement_score')[:50]


class PopularVideosView(generics.ListAPIView):
    """Get most popular videos of all time"""
    serializer_class = VideoListSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return Video.objects.filter(
            status='published'
        ).select_related('user', 'category').order_by('-views_count', '-likes_count')


# Dashboard/Analytics Views
@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # Temporarily allow anonymous access for testing
def user_dashboard_stats(request):
    """Get user dashboard statistics"""
    # For testing, provide sample stats if user is not authenticated
    if request.user.is_authenticated:
        user = request.user
        
        # Get user's video statistics
        videos = Video.objects.filter(user=user)
        total_videos = videos.count()
        total_views = videos.aggregate(total=Sum('views_count'))['total'] or 0
        total_likes = videos.aggregate(total=Sum('likes_count'))['total'] or 0
        
        # Get subscriber count
        subscribers_count = Subscription.objects.filter(channel=user).count()
        
        # Get recent video performance
        recent_videos = videos.order_by('-created_at')[:5]
        recent_videos_data = VideoListSerializer(recent_videos, many=True, context={'request': request}).data
        
        return Response({
            'total_videos': total_videos,
            'total_views': total_views,
            'total_likes': total_likes,
            'subscribers_count': subscribers_count,
            'recent_videos': recent_videos_data
        })
    else:
        # Return sample stats for anonymous users
        all_videos = Video.objects.all()
        total_videos = all_videos.count()
        total_views = all_videos.aggregate(total=Sum('views_count'))['total'] or 0
        total_likes = all_videos.aggregate(total=Sum('likes_count'))['total'] or 0
        
        return Response({
            'total_videos': total_videos,
            'total_views': total_views,
            'total_likes': total_likes,
            'subscribers_count': 0,
            'recent_videos': []
        })


# Utility Views
@api_view(['GET'])
def video_categories(request):
    """Get all video categories"""
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)
