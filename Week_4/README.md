# YouTube-Clone Video Platform

A full-stack video sharing platform built with Django (backend) and React (frontend), offering YouTube-like functionality including user authentication, video upload, streaming, and social features.


- **User Registration & Login** with email verification
- **Password Reset** functionality
- **User Profiles** with customizable information
- **Email Verification** system with token-based verification
- **Session Management** with secure authentication

- **Video Upload** with file validation and processing
- **Video Streaming** with custom video player
- **Thumbnail Generation** and custom thumbnail support
- **Video Categories** (Education, Entertainment, Technology, etc.)
- **Video Status Management** (Draft, Published, Private, Unlisted)
- **Video Metadata** (Duration, file size, quality)
- **Tag System** for better video organization

- **Responsive Design** for all devices
- **Modern UI** with clean, YouTube-inspired interface
- **Video Grid Layout** with thumbnail previews
- **Custom Video Player** with playback controls
- **Navigation Menu** with user-friendly routing
- **Search Functionality** for discovering content

- **Like & Dislike** system for videos
- **Comments System** with nested replies
- **Video Subscriptions** to follow favorite creators
- **Watch Later** list for saving videos
- **Video History** tracking
- **User Playlists** for organizing content
- **View Count** tracking and analytics

- **Video Views** tracking with IP and user agent
- **Watch Duration** analytics
- **User Engagement** metrics
- **View History** for users


### Backend (Django)
- **Python 3.12** with Django 5.1.5
- **Django REST Framework** for API endpoints
- **SQLite3** database (development)
- **Django CORS Headers** for cross-origin requests
- **File Upload** handling with secure paths
- **Media Files** management for videos and thumbnails

### Frontend (React)
- **React 18.2.0** with modern hooks
- **React Router DOM 6.30.1** for navigation
- **FontAwesome 6.7.2** for icons
- **Custom CSS** with responsive design
- **Axios** for API communication (implied)


## Directory Structure
```
Week_4/
├── back-end/                    # Django Backend
│   ├── accounts/               # User authentication app
│   │   ├── models.py          # Email verification model
│   │   ├── views.py           # Auth views
│   │   └── templates/         # HTML templates
│   ├── videos/                # Video management app
│   │   ├── models.py          # Video, Comment, Like models
│   │   ├── views.py           # Video CRUD operations
│   │   └── admin.py           # Django admin interface
│   ├── youtube_auth/          # Main Django project
│   │   ├── settings.py        # Project configuration
│   │   ├── urls.py            # URL routing
│   │   └── wsgi.py            # WSGI application
│   ├── media/                 # User uploaded content
│   │   └── videos/            # Video files storage
│   ├── static/                # Static files (CSS, JS, images)
│   ├── db.sqlite3             # Database file
│   └── requirements.txt       # Python dependencies
└── front-end/                 # React Frontend
    ├── public/                # Static assets
    ├── src/
    │   ├── components/        # Reusable components
    │   │   ├── Navbar.jsx     # Navigation component
    │   │   ├── VideoCard.jsx  # Video thumbnail component
    │   │   └── Timer.jsx      # Timer component
    │   ├── pages/             # Page components
    │   │   ├── Home.jsx       # Landing page
    │   │   ├── Dashboard.jsx  # User dashboard
    │   │   ├── VideoUpload.jsx # Video upload page
    │   │   ├── VideoPlayer.jsx # Video player page
    │   │   ├── Account.jsx    # User account page
    │   │   ├── History.jsx    # Watch history
    │   │   ├── LikedVideos.jsx # Liked videos page
    │   │   └── WatchLater.jsx # Watch later list
    │   ├── data/              # Mock data
    │   │   └── dummyVideos.js # Sample video data
    │   ├── App.jsx            # Main app component
    │   └── index.js           # React entry point
    └── package.json           # Node.js dependencies
```

   Frontend: http://localhost:3000
   Backend API: http://localhost:8000
   Django Admin: http://localhost:8000/admin
   ```



1. **Registration & Login:**
   - Register with email and password
   - Verify email through verification link
   - Login to access full features

2. **Browsing Videos:**
   - Browse videos on home page
   - Use search to find specific content
   - Filter by categories and tags

3. **Watching Videos:**
   - Click on video to open player
   - Like/dislike videos
   - Add comments and replies
   - Add to Watch Later list

4. **User Dashboard:**
   - View uploaded videos
   - Check watch history
   - Manage liked videos
   - Create and manage playlists

### For Content Creators

1. **Upload Videos:**
   - Navigate to Upload page
   - Select video file and thumbnail
   - Add title, description, and tags
   - Choose category and privacy settings

2. **Manage Content:**
   - Edit video information
   - Change privacy settings
   - View video analytics
   - Respond to comments


### API Endpoints

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/verify/{token}/` - Email verification

- `GET /api/videos/` - List all videos
- `POST /api/videos/` - Upload new video
- `GET /api/videos/{id}/` - Get video details
- `PUT /api/videos/{id}/` - Update video
- `DELETE /api/videos/{id}/` - Delete video

- `POST /api/videos/{id}/like/` - Like video
- `POST /api/videos/{id}/comment/` - Add comment
- `POST /api/videos/{id}/watch-later/` - Add to watch later
- `GET /api/user/history/` - Get watch history

### Visual Design
- **Clean Interface** with modern styling
- **Responsive Layout** for all screen sizes
- **Consistent Color Scheme** throughout the app
- **Intuitive Navigation** with clear user flow
- **Professional Typography** for readability

## Security Features
- **Secure File Uploads** with validation
- **Email Verification** for account security
- **Session Management** with secure cookies

## Responsive Design

- **Mobile-First** approach
- **Tablet** optimization
- **Desktop** full-screen layout


### Environment Variables

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
MEDIA_URL=/media/
STATIC_URL=/static/
```

### Database Configuration
Default uses SQLite3 for development.:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```


### Docker Deployment
```bash
cd back-end
docker-compose up -d
```

