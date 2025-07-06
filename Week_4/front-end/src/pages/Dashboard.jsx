import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_videos: 0,
    total_views: 0,
    total_likes: 0,
    subscribers_count: 0
  });
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user videos from API
              const videosResponse = await fetch('http://127.0.0.1:8000/api/my-videos/', {
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add when auth is implemented
        }
      });

      // Fetch user stats from API
              const statsResponse = await fetch('http://127.0.0.1:8000/api/dashboard/stats/', {
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add when auth is implemented
        }
      });

      if (videosResponse.ok && statsResponse.ok) {
        const videosData = await videosResponse.json();
        const statsData = await statsResponse.json();

        setUserVideos(videosData.results || []);
        setStats(statsData);
      } else {
        // Fallback to dummy data if API fails
        console.log('API not available, using dummy data');
        
        const dummyStats = {
          total_videos: 12,
          total_views: 15420,
          total_likes: 1248,
          subscribers_count: 345
        };

        const dummyVideos = [
          {
            id: 1,
            title: "My First Programming Tutorial",
            description: "A comprehensive guide to getting started with JavaScript",
            thumbnail_url: "https://picsum.photos/320/180?random=1",
            views_count: 2341,
            likes_count: 189,
            comments_count: 45,
            status: "published",
            created_at: "2024-01-15T10:30:00Z",
            duration_formatted: "15:32"
          },
          {
            id: 2,
            title: "React Hooks Explained",
            description: "Deep dive into React Hooks and how to use them effectively",
            thumbnail_url: "https://picsum.photos/320/180?random=2",
            views_count: 4567,
            likes_count: 324,
            comments_count: 78,
            status: "published",
            created_at: "2024-01-20T14:15:00Z",
            duration_formatted: "22:48"
          },
          {
            id: 3,
            title: "Building a REST API",
            description: "Step by step guide to creating a REST API with Node.js",
            thumbnail_url: "https://picsum.photos/320/180?random=3",
            views_count: 3245,
            likes_count: 267,
            comments_count: 56,
            status: "published",
            created_at: "2024-01-25T09:45:00Z",
            duration_formatted: "28:15"
          },
          {
            id: 4,
            title: "CSS Grid vs Flexbox",
            description: "Understanding when to use CSS Grid vs Flexbox",
            thumbnail_url: "https://picsum.photos/320/180?random=4",
            views_count: 1876,
            likes_count: 143,
            comments_count: 29,
            status: "published",
            created_at: "2024-01-30T16:20:00Z",
            duration_formatted: "18:42"
          },
          {
            id: 5,
            title: "Database Design Principles",
            description: "Learn the fundamentals of good database design",
            thumbnail_url: "https://picsum.photos/320/180?random=5",
            views_count: 2890,
            likes_count: 198,
            comments_count: 67,
            status: "draft",
            created_at: "2024-02-01T11:30:00Z",
            duration_formatted: "31:28"
          }
        ];

        setStats(dummyStats);
        setUserVideos(dummyVideos);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback to dummy data on error
      const dummyStats = {
        total_videos: 12,
        total_views: 15420,
        total_likes: 1248,
        subscribers_count: 345
      };

      const dummyVideos = [
        {
          id: 1,
          title: "My First Programming Tutorial",
          description: "A comprehensive guide to getting started with JavaScript",
          thumbnail_url: "https://picsum.photos/320/180?random=1",
          views_count: 2341,
          likes_count: 189,
          comments_count: 45,
          status: "published",
          created_at: "2024-01-15T10:30:00Z",
          duration_formatted: "15:32"
        }
      ];

      setStats(dummyStats);
      setUserVideos(dummyVideos);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEditVideo = (videoId) => {
    // Navigate to edit video page
    navigate(`/video/edit/${videoId}`);
  };

  const handleDeleteVideo = (videoId) => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      setUserVideos(prev => prev.filter(video => video.id !== videoId));
      setStats(prev => ({
        ...prev,
        total_videos: prev.total_videos - 1
      }));
      alert('Video deleted successfully!');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { label: 'Published', class: 'status-published' },
      draft: { label: 'Draft', class: 'status-draft' },
      private: { label: 'Private', class: 'status-private' },
      unlisted: { label: 'Unlisted', class: 'status-unlisted' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Creator Dashboard</h1>
            <p>Manage your content and track your progress</p>
          </div>
          <button 
            className="upload-btn"
            onClick={() => navigate('/upload')}
          >
            <i className="fas fa-plus"></i>
            Upload Video
          </button>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            My Videos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-video"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.total_videos}</h3>
                  <p>Total Videos</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-eye"></i>
                </div>
                <div className="stat-content">
                  <h3>{formatNumber(stats.total_views)}</h3>
                  <p>Total Views</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-thumbs-up"></i>
                </div>
                <div className="stat-content">
                  <h3>{formatNumber(stats.total_likes)}</h3>
                  <p>Total Likes</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <h3>{formatNumber(stats.subscribers_count)}</h3>
                  <p>Subscribers</p>
                </div>
              </div>
            </div>

            <div className="recent-videos">
              <h2>Recent Videos</h2>
              <div className="video-list">
                {userVideos.slice(0, 3).map(video => (
                  <div key={video.id} className="video-item">
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title}
                      className="video-thumbnail"
                    />
                    <div className="video-info">
                      <h3>{video.title}</h3>
                      <p className="video-stats">
                        {formatNumber(video.views_count)} views • 
                        {formatNumber(video.likes_count)} likes • 
                        {video.comments_count} comments
                      </p>
                      <p className="video-date">Published {formatDate(video.created_at)}</p>
                    </div>
                    {getStatusBadge(video.status)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="videos-section">
            <div className="section-header">
              <h2>My Videos ({userVideos.length})</h2>
              <div className="video-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => navigate('/upload')}
                >
                  <i className="fas fa-plus"></i>
                  Upload New Video
                </button>
              </div>
            </div>

            <div className="videos-grid">
              {userVideos.map(video => (
                <div key={video.id} className="video-card">
                  <div className="video-thumbnail-container">
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title}
                      className="video-thumbnail"
                    />
                    <div className="video-duration">{video.duration_formatted}</div>
                    {getStatusBadge(video.status)}
                  </div>
                  
                  <div className="video-content">
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-description">{video.description}</p>
                    
                    <div className="video-metrics">
                      <span><i className="fas fa-eye"></i> {formatNumber(video.views_count)}</span>
                      <span><i className="fas fa-thumbs-up"></i> {formatNumber(video.likes_count)}</span>
                      <span><i className="fas fa-comment"></i> {video.comments_count}</span>
                    </div>
                    
                    <p className="upload-date">Uploaded {formatDate(video.created_at)}</p>
                    
                    <div className="video-actions">
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEditVideo(video.id)}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button 
                        className="action-btn view"
                        onClick={() => navigate(`/watch/${video.id}`)}
                      >
                        <i className="fas fa-external-link-alt"></i>
                        View
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteVideo(video.id)}
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>Analytics</h2>
            <div className="analytics-placeholder">
              <i className="fas fa-chart-line"></i>
              <h3>Analytics Dashboard</h3>
              <p>Detailed analytics and insights about your videos will appear here.</p>
              <p>Track views, engagement, audience demographics, and more.</p>
              <div className="coming-soon">Coming Soon</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 