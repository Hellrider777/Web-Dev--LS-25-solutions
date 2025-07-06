from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Category, Video, Comment, Like, WatchLater, 
    VideoView, Subscription, Playlist, PlaylistVideo
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'video_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at']
    
    def video_count(self, obj):
        return obj.video_set.count()
    video_count.short_description = 'Videos'


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    fields = ['user', 'content', 'is_approved', 'created_at']
    readonly_fields = ['created_at']
    show_change_link = True


class LikeInline(admin.TabularInline):
    model = Like
    extra = 0
    fields = ['user', 'like_type', 'created_at']
    readonly_fields = ['created_at']


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'user', 'category', 'status', 'views_count', 
        'likes_count', 'comments_count', 'created_at', 'thumbnail_preview'
    ]
    list_filter = [
        'status', 'category', 'created_at', 'video_quality'
    ]
    search_fields = ['title', 'description', 'tags', 'user__username']
    readonly_fields = [
        'views_count', 'likes_count', 'dislikes_count', 'comments_count',
        'created_at', 'updated_at', 'file_size', 'duration', 'thumbnail_preview'
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'user', 'category', 'tags')
        }),
        ('Files', {
            'fields': ('video_file', 'video_url', 'thumbnail', 'thumbnail_preview')
        }),
        ('Settings', {
            'fields': ('status', 'video_quality')
        }),
        ('Statistics', {
            'fields': ('views_count', 'likes_count', 'dislikes_count', 'comments_count'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('duration', 'file_size', 'created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )
    inlines = [CommentInline, LikeInline]
    
    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html(
                '<img src="{}" width="150" height="100" style="object-fit: cover;" />',
                obj.thumbnail.url
            )
        return "No thumbnail"
    thumbnail_preview.short_description = 'Thumbnail Preview'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'category')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'video', 'content_preview', 'is_approved', 
        'is_edited', 'created_at', 'parent'
    ]
    list_filter = ['is_approved', 'is_edited', 'created_at']
    search_fields = ['content', 'user__username', 'video__title']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['is_approved']
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'video', 'parent')


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'like_type', 'created_at']
    list_filter = ['like_type', 'created_at']
    search_fields = ['user__username', 'video__title']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'video')


@admin.register(WatchLater)
class WatchLaterAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'added_at']
    list_filter = ['added_at']
    search_fields = ['user__username', 'video__title']
    readonly_fields = ['added_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'video')


@admin.register(VideoView)
class VideoViewAdmin(admin.ModelAdmin):
    list_display = [
        'video', 'user', 'ip_address', 'viewed_at', 'watch_duration'
    ]
    list_filter = ['viewed_at']
    search_fields = ['video__title', 'user__username', 'ip_address']
    readonly_fields = ['viewed_at']
    date_hierarchy = 'viewed_at'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'video')


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        'subscriber', 'channel', 'subscribed_at', 'notifications_enabled'
    ]
    list_filter = ['subscribed_at', 'notifications_enabled']
    search_fields = ['subscriber__username', 'channel__username']
    readonly_fields = ['subscribed_at']
    list_editable = ['notifications_enabled']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('subscriber', 'channel')


class PlaylistVideoInline(admin.TabularInline):
    model = PlaylistVideo
    extra = 0
    fields = ['video', 'order', 'added_at']
    readonly_fields = ['added_at']
    ordering = ['order']


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'user', 'privacy', 'video_count_display', 
        'created_at', 'updated_at'
    ]
    list_filter = ['privacy', 'created_at', 'updated_at']
    search_fields = ['title', 'description', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [PlaylistVideoInline]
    
    def video_count_display(self, obj):
        return obj.get_video_count()
    video_count_display.short_description = 'Videos'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(PlaylistVideo)
class PlaylistVideoAdmin(admin.ModelAdmin):
    list_display = ['playlist', 'video', 'order', 'added_at']
    list_filter = ['added_at']
    search_fields = ['playlist__title', 'video__title']
    readonly_fields = ['added_at']
    ordering = ['playlist', 'order']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('playlist', 'video')


# Custom admin site configuration
admin.site.site_header = "VideoHub Admin"
admin.site.site_title = "VideoHub Admin Portal"
admin.site.index_title = "Welcome to VideoHub Administration"
