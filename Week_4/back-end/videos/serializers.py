from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Category, Video, Comment, Like, WatchLater, 
    VideoView, Subscription, Playlist, PlaylistVideo
)


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer for nested representations"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'email']
        extra_kwargs = {'email': {'write_only': True}}
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class CategorySerializer(serializers.ModelSerializer):
    video_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'slug', 'video_count', 'created_at']
        read_only_fields = ['created_at']
    
    def get_video_count(self, obj):
        return obj.video_set.filter(status='published').count()


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'user', 'parent', 'replies', 'reply_count',
            'is_edited', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'is_edited', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.parent is None:  # Only get replies for top-level comments
            replies = obj.get_replies()[:3]  # Limit to 3 replies for performance
            return CommentSerializer(replies, many=True, context=self.context).data
        return []
    
    def get_reply_count(self, obj):
        return obj.get_replies().count()


class VideoListSerializer(serializers.ModelSerializer):
    """Serializer for video list views (lighter data)"""
    user = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    thumbnail_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()
    duration_formatted = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_in_watch_later = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'user', 'category', 'thumbnail_url',
            'video_url', 'duration', 'duration_formatted', 'views_count', 
            'likes_count', 'comments_count', 'created_at', 'is_liked', 
            'is_in_watch_later', 'tags'
        ]
    
    def get_thumbnail_url(self, obj):
        return obj.get_thumbnail_url()
    
    def get_video_url(self, obj):
        return obj.get_video_url()
    
    def get_duration_formatted(self, obj):
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            if hours > 0:
                return f"{hours}:{minutes:02d}:{seconds:02d}"
            return f"{minutes}:{seconds:02d}"
        return "0:00"
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, video=obj, like_type='like').exists()
        return False
    
    def get_is_in_watch_later(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return WatchLater.objects.filter(user=request.user, video=obj).exists()
        return False


class VideoDetailSerializer(VideoListSerializer):
    """Serializer for video detail views (full data)"""
    comments = serializers.SerializerMethodField()
    related_videos = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()
    
    class Meta(VideoListSerializer.Meta):
        fields = VideoListSerializer.Meta.fields + [
            'comments', 'related_videos', 'tags_list', 'status', 'video_quality'
        ]
    
    def get_comments(self, obj):
        # Get top-level comments only (replies are included in CommentSerializer)
        comments = obj.comments.filter(parent=None, is_approved=True)[:10]
        return CommentSerializer(comments, many=True, context=self.context).data
    
    def get_related_videos(self, obj):
        # Get related videos from same category
        related = Video.objects.filter(
            category=obj.category, 
            status='published'
        ).exclude(id=obj.id)[:6]
        return VideoListSerializer(related, many=True, context=self.context).data
    
    def get_tags_list(self, obj):
        return obj.get_tags_list()


class VideoCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating videos"""
    
    class Meta:
        model = Video
        fields = [
            'title', 'description', 'category', 'tags', 'status', 'video_quality',
            'video_file', 'thumbnail', 'video_url'
        ]
    
    def validate(self, data):
        # Either video_file or video_url must be provided
        if not data.get('video_file') and not data.get('video_url'):
            raise serializers.ValidationError(
                "Either video_file or video_url must be provided."
            )
        return data


class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Like
        fields = ['id', 'user', 'video', 'like_type', 'created_at']
        read_only_fields = ['user', 'created_at']


class WatchLaterSerializer(serializers.ModelSerializer):
    video = VideoListSerializer(read_only=True)
    
    class Meta:
        model = WatchLater
        fields = ['id', 'video', 'added_at']
        read_only_fields = ['added_at']


class SubscriptionSerializer(serializers.ModelSerializer):
    channel = UserSerializer(read_only=True)
    subscriber = UserSerializer(read_only=True)
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'subscriber', 'channel', 'subscribed_at', 'notifications_enabled'
        ]
        read_only_fields = ['subscriber', 'subscribed_at']


class PlaylistVideoSerializer(serializers.ModelSerializer):
    video = VideoListSerializer(read_only=True)
    
    class Meta:
        model = PlaylistVideo
        fields = ['id', 'video', 'order', 'added_at']
        read_only_fields = ['added_at']


class PlaylistSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    videos = PlaylistVideoSerializer(source='playlistvideo_set', many=True, read_only=True)
    video_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Playlist
        fields = [
            'id', 'title', 'description', 'privacy', 'user', 
            'videos', 'video_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_video_count(self, obj):
        return obj.get_video_count()


class VideoViewSerializer(serializers.ModelSerializer):
    """Serializer for tracking video views"""
    
    class Meta:
        model = VideoView
        fields = ['video', 'watch_duration', 'viewed_at']
        read_only_fields = ['viewed_at']


# Search serializer for video search results
class VideoSearchSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    thumbnail_url = serializers.SerializerMethodField()
    duration_formatted = serializers.SerializerMethodField()
    relevance_score = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'user', 'category', 'thumbnail_url',
            'duration_formatted', 'views_count', 'likes_count', 'created_at',
            'relevance_score'
        ]
    
    def get_thumbnail_url(self, obj):
        return obj.get_thumbnail_url()
    
    def get_duration_formatted(self, obj):
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            minutes = total_seconds // 60
            seconds = total_seconds % 60
            return f"{minutes}:{seconds:02d}"
        return "0:00" 