from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.contrib.auth.models import User
from videos.models import Category, Video


class Command(BaseCommand):
    help = 'Create sample data for videos and categories'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating sample data...'))
        
        # Create categories
        categories_data = [
            {"name": "Technology", "description": "Tech reviews, tutorials, and news"},
            {"name": "Entertainment", "description": "Movies, TV shows, and celebrity news"},
            {"name": "Education", "description": "Educational content and tutorials"},
            {"name": "Gaming", "description": "Gaming reviews, walkthroughs, and news"},
            {"name": "Music", "description": "Music videos, reviews, and artist interviews"},
            {"name": "Sports", "description": "Sports highlights, analysis, and news"},
            {"name": "Travel", "description": "Travel vlogs, guides, and destinations"},
            {"name": "Cooking", "description": "Recipes, cooking tips, and food reviews"},
        ]
        
        self.stdout.write('Creating categories...')
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data["name"],
                defaults={
                    "description": cat_data["description"],
                    "slug": slugify(cat_data["name"])
                }
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')
        
        # Get or create a sample user
        user, created = User.objects.get_or_create(
            username='sampleuser',
            defaults={
                'email': 'sample@example.com',
                'first_name': 'Sample',
                'last_name': 'User'
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            self.stdout.write(f'Created user: {user.username}')
        
        # Create sample videos
        videos_data = [
            {
                "title": "Introduction to Python Programming",
                "description": "Learn the basics of Python programming language with this comprehensive tutorial. Perfect for beginners who want to start their coding journey.",
                "category": "Education",
                "tags": "python, programming, tutorial, beginners",
                "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
                "views_count": 1250,
                "likes_count": 89,
                "comments_count": 23,
            },
            {
                "title": "Latest iPhone 15 Review",
                "description": "Complete review of the new iPhone 15 featuring all the new features, performance tests, and camera comparisons.",
                "category": "Technology",
                "tags": "iphone, apple, review, smartphone",
                "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
                "views_count": 5420,
                "likes_count": 324,
                "comments_count": 87,
            },
            {
                "title": "Top 10 Gaming Moments of 2024",
                "description": "The most epic gaming moments from popular games this year. From incredible plays to funny glitches, we've got them all!",
                "category": "Gaming",
                "tags": "gaming, top10, epic, moments",
                "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
                "views_count": 8932,
                "likes_count": 672,
                "comments_count": 156,
            },
            {
                "title": "Amazing Pasta Recipe in 15 Minutes",
                "description": "Quick and delicious pasta recipe that you can make in just 15 minutes. Perfect for busy weeknights!",
                "category": "Cooking",
                "tags": "cooking, recipe, pasta, quick",
                "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
                "views_count": 2156,
                "likes_count": 189,
                "comments_count": 45,
            },
            {
                "title": "Travel Vlog: Tokyo Adventures",
                "description": "Join me on my incredible journey through Tokyo! From amazing food to beautiful temples, this city has it all.",
                "category": "Travel",
                "tags": "travel, tokyo, japan, vlog",
                "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
                "views_count": 3847,
                "likes_count": 298,
                "comments_count": 72,
            },
            {
                "title": "Best Music Hits of 2024",
                "description": "A compilation of the best music hits from 2024. Perfect playlist for your weekend vibes!",
                "category": "Music",
                "tags": "music, hits, 2024, playlist",
                "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
                "views_count": 12453,
                "likes_count": 1024,
                "comments_count": 234,
            },
            {
                "title": "Football Highlights - World Cup 2024",
                "description": "The most exciting moments from the World Cup 2024. Goals, saves, and unforgettable plays!",
                "category": "Sports",
                "tags": "football, worldcup, highlights, sports",
                "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
                "views_count": 15678,
                "likes_count": 1456,
                "comments_count": 389,
            },
            {
                "title": "React.js Complete Tutorial",
                "description": "Master React.js with this comprehensive tutorial covering components, hooks, state management, and more.",
                "category": "Education",
                "tags": "react, javascript, tutorial, web development",
                "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
                "views_count": 4567,
                "likes_count": 387,
                "comments_count": 98,
            },
            {
                "title": "Comedy Skits Compilation",
                "description": "The funniest comedy skits that will make you laugh out loud. Perfect for when you need a good laugh!",
                "category": "Entertainment",
                "tags": "comedy, funny, skits, humor",
                "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
                "views_count": 6789,
                "likes_count": 567,
                "comments_count": 123,
            },
            {
                "title": "Minecraft Building Tutorial",
                "description": "Learn how to build amazing structures in Minecraft with this step-by-step tutorial. Perfect for all skill levels!",
                "category": "Gaming",
                "tags": "minecraft, building, tutorial, gaming",
                "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
                "views_count": 3456,
                "likes_count": 234,
                "comments_count": 67,
            },
            {
                "title": "Healthy Breakfast Ideas",
                "description": "Start your day right with these healthy and delicious breakfast ideas. Easy to make and nutritious!",
                "category": "Cooking",
                "tags": "breakfast, healthy, recipes, nutrition",
                "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
                "views_count": 2345,
                "likes_count": 178,
                "comments_count": 56,
            },
            {
                "title": "Guitar Lesson for Beginners",
                "description": "Learn to play guitar with this beginner-friendly tutorial. We'll cover basic chords and simple songs.",
                "category": "Music",
                "tags": "guitar, music, lesson, beginners",
                "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
                "views_count": 1876,
                "likes_count": 145,
                "comments_count": 34,
            },
        ]
        
        self.stdout.write('Creating sample videos...')
        for video_data in videos_data:
            category = Category.objects.get(name=video_data["category"])
            
            video, created = Video.objects.get_or_create(
                title=video_data["title"],
                user=user,
                defaults={
                    "description": video_data["description"],
                    "category": category,
                    "tags": video_data["tags"],
                    "video_url": video_data["video_url"],
                    "views_count": video_data["views_count"],
                    "likes_count": video_data["likes_count"],
                    "comments_count": video_data["comments_count"],
                    "status": "published",
                }
            )
            
            if created:
                self.stdout.write(f'Created video: {video.title}')
        
        self.stdout.write(self.style.SUCCESS('\nSample data created successfully!'))
        self.stdout.write(f'Categories: {Category.objects.count()}')
        self.stdout.write(f'Videos: {Video.objects.count()}')
        self.stdout.write(f'Users: {User.objects.count()}')
        
        # Display some sample API endpoints
        self.stdout.write('\n' + '='*50)
        self.stdout.write('Sample API Endpoints:')
        self.stdout.write('='*50)
        self.stdout.write('GET /api/videos/ - List all videos')
        self.stdout.write('GET /api/videos/1/ - Get video details')
        self.stdout.write('GET /api/categories/ - List all categories')
        self.stdout.write('GET /api/search/?q=python - Search videos')
        self.stdout.write('GET /api/trending/ - Get trending videos')
        self.stdout.write('GET /api/popular/ - Get popular videos')
        self.stdout.write('POST /api/videos/create/ - Create new video (requires auth)')
        self.stdout.write('POST /api/videos/1/like/ - Like/unlike video (requires auth)')
        self.stdout.write('POST /api/videos/1/watch-later/ - Add to watch later (requires auth)') 