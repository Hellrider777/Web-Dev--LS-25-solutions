from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid
import os


def video_upload_path(instance, filename):
    """Generate upload path for video files"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('videos', str(instance.user.id), filename)


def thumbnail_upload_path(instance, filename):
    """Generate upload path for thumbnail files"""
    ext = filename.split('.')[-1]
    filename = f"thumb_{uuid.uuid4()}.{ext}"
    return os.path.join('thumbnails', str(instance.user.id), filename)


class Category(models.Model):
    """Video categories like Education, Entertainment, Technology, etc."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    slug = models.SlugField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Video(models.Model):
    """Main Video model"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('private', 'Private'),
        ('unlisted', 'Unlisted'),
    ]
    
    # Basic Info
    title = models.CharField(max_length=200)
    description = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_videos')
    
    # Files
    video_file = models.FileField(upload_to=video_upload_path, null=True, blank=True)
    thumbnail = models.ImageField(upload_to=thumbnail_upload_path, null=True, blank=True)
    
    # Metadata
    duration = models.DurationField(null=True, blank=True)
    file_size = models.BigIntegerField(null=True, blank=True)  # in bytes
    video_quality = models.CharField(max_length=20, default='720p')
    
    # Organization
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.TextField(blank=True, help_text="Comma-separated tags")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published')
    
    # Statistics
    views_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    dislikes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    # Video URL (for external videos or when file is not uploaded)
    video_url = models.URLField(blank=True, help_text="External video URL if not uploading file")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['category', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    def get_tags_list(self):
        """Return tags as a list"""
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
    
    def increment_views(self):
        """Increment view count"""
        self.views_count += 1
        self.save(update_fields=['views_count'])
    
    def get_video_url(self):
        """Get video URL (either uploaded file or external URL)"""
        if self.video_file:
            return self.video_file.url
        return self.video_url
    
    def get_thumbnail_url(self):
        """Get thumbnail URL with fallback"""
        if self.thumbnail:
            return self.thumbnail.url
        # Return a default thumbnail URL based on the video ID
        return f"https://picsum.photos/320/180?random={self.id}"


class Comment(models.Model):
    """Video comments"""
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    # Moderation
    is_edited = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['video', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.video.title}"
    
    def get_replies(self):
        """Get all replies to this comment"""
        return self.replies.filter(is_approved=True)


class Like(models.Model):
    """Video likes and dislikes"""
    LIKE_CHOICES = [
        ('like', 'Like'),
        ('dislike', 'Dislike'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='likes')
    like_type = models.CharField(max_length=10, choices=LIKE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'video']
        indexes = [
            models.Index(fields=['video', 'like_type']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} {self.like_type}d {self.video.title}"


class WatchLater(models.Model):
    """User's watch later list"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'video']
        ordering = ['-added_at']
        indexes = [
            models.Index(fields=['user', '-added_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.video.title}"


class VideoView(models.Model):
    """Track video views for analytics"""
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='video_views')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # null for anonymous users
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    viewed_at = models.DateTimeField(auto_now_add=True)
    watch_duration = models.DurationField(null=True, blank=True)  # How long they watched
    
    class Meta:
        indexes = [
            models.Index(fields=['video', '-viewed_at']),
            models.Index(fields=['user', '-viewed_at']),
        ]
    
    def __str__(self):
        user_info = self.user.username if self.user else f"Anonymous ({self.ip_address})"
        return f"{user_info} viewed {self.video.title}"


class Subscription(models.Model):
    """User subscriptions to channels"""
    subscriber = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    channel = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscribers')
    subscribed_at = models.DateTimeField(auto_now_add=True)
    notifications_enabled = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['subscriber', 'channel']
        indexes = [
            models.Index(fields=['subscriber', '-subscribed_at']),
            models.Index(fields=['channel', '-subscribed_at']),
        ]
    
    def __str__(self):
        return f"{self.subscriber.username} subscribed to {self.channel.username}"


class Playlist(models.Model):
    """User playlists"""
    PRIVACY_CHOICES = [
        ('public', 'Public'),
        ('unlisted', 'Unlisted'),
        ('private', 'Private'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='playlists')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    privacy = models.CharField(max_length=20, choices=PRIVACY_CHOICES, default='public')
    videos = models.ManyToManyField(Video, through='PlaylistVideo', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at']),
        ]
    
    def __str__(self):
        return f"{self.title} by {self.user.username}"
    
    def get_video_count(self):
        """Get number of videos in playlist"""
        return self.videos.count()


class PlaylistVideo(models.Model):
    """Through model for playlist videos with ordering"""
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    order = models.PositiveIntegerField()
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['playlist', 'video']
        indexes = [
            models.Index(fields=['playlist', 'order']),
        ]
    
    def __str__(self):
        return f"{self.video.title} in {self.playlist.title}"
