import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId]);

  // Add video to history when component mounts
  useEffect(() => {
    if (video) {
      addToHistory(video);
    }
  }, [video]);

  const addToHistory = (videoData) => {
    const historyItem = {
      video: videoData,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Get existing history
    const existingHistory = JSON.parse(sessionStorage.getItem('videoHistory') || '[]');
    
    // Remove any previous entry of the same video (to avoid duplicates and move to top)
    const filteredHistory = existingHistory.filter(item => item.video.id !== videoData.id);
    
    // Add new entry at the beginning
    const updatedHistory = [historyItem, ...filteredHistory];
    
    // Keep only the last 50 items to prevent unlimited growth
    const limitedHistory = updatedHistory.slice(0, 50);
    
    // Save to storage
    sessionStorage.setItem('videoHistory', JSON.stringify(limitedHistory));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('historyUpdated'));
  };

  const fetchVideoDetails = async () => {
    try {
      setLoading(true);
      // For now, use dummy data since API is not connected yet
      const dummyVideo = {
        id: parseInt(videoId),
        title: "Sample Video Title",
        description: "This is a sample video description. In a real implementation, this would come from the backend API.",
        user: {
          id: 1,
          username: "sampleuser",
          full_name: "Sample User"
        },
        category: {
          id: 1,
          name: "Technology"
        },
        video_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        thumbnail_url: `https://picsum.photos/800/450?random=${videoId}`,
        views_count: 1234 + parseInt(videoId) * 100,
        likes_count: 89 + parseInt(videoId) * 10,
        comments_count: 23 + parseInt(videoId) * 5,
        duration_formatted: "5:32",
        tags_list: ["technology", "tutorial", "programming"],
        created_at: new Date().toISOString(),
        related_videos: [
          {
            id: parseInt(videoId) + 1,
            title: "Related Video 1",
            thumbnail_url: `https://picsum.photos/320/180?random=${parseInt(videoId) + 1}`,
            duration_formatted: "3:45",
            views_count: 567,
            user: { username: "creator1" }
          },
          {
            id: parseInt(videoId) + 2,
            title: "Related Video 2",
            thumbnail_url: `https://picsum.photos/320/180?random=${parseInt(videoId) + 2}`,
            duration_formatted: "7:21",
            views_count: 890,
            user: { username: "creator2" }
          }
        ],
        comments: [
          {
            id: 1,
            user: { username: "viewer1", full_name: "John Doe" },
            content: "Great video! Very informative.",
            created_at: new Date().toISOString(),
            replies: []
          },
          {
            id: 2,
            user: { username: "viewer2", full_name: "Jane Smith" },
            content: "Thanks for sharing this tutorial!",
            created_at: new Date().toISOString(),
            replies: []
          }
        ]
      };
      
      setVideo(dummyVideo);
      setComments(dummyVideo.comments);
      setError(null);
    } catch (err) {
      setError('Failed to load video');
      console.error('Error fetching video:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setVideo(prev => ({
      ...prev,
      likes_count: isLiked ? prev.likes_count - 1 : prev.likes_count + 1
    }));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Video link copied to clipboard!');
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: { username: "currentuser", full_name: "Current User" },
        content: newComment,
        created_at: new Date().toISOString(),
        replies: []
      };
      setComments([comment, ...comments]);
      setNewComment('');
      setVideo(prev => ({
        ...prev,
        comments_count: prev.comments_count + 1
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading">Loading video...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!video) return <div className="error">Video not found</div>;

  return (
    <div className="video-player-page">
      <div className="video-content">
        <div className="video-main">
          <div className="video-container">
            <video
              controls
              poster={video.thumbnail_url}
              className="video-player"
              key={video.id}
            >
              <source src={video.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="video-info">
            <h1 className="video-title">{video.title}</h1>
            
            <div className="video-stats">
              <span className="views">{video.views_count.toLocaleString()} views</span>
              <span className="date">• {formatDate(video.created_at)}</span>
            </div>

            <div className="video-actions">
              <button 
                className={`action-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                <i className="fas fa-thumbs-up"></i>
                {video.likes_count}
              </button>
              <button className="action-btn" onClick={handleShare}>
                <i className="fas fa-share"></i>
                Share
              </button>
            </div>

            <div className="video-description">
              <div className="channel-info">
                <div className="channel-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="channel-details">
                  <h3 className="channel-name">{video.user.full_name || video.user.username}</h3>
                  <p className="channel-meta">Published on {formatDate(video.created_at)}</p>
                </div>
                <button className="subscribe-btn">Subscribe</button>
              </div>
              
              <div className="description-text">
                <p>{video.description}</p>
                {video.tags_list && video.tags_list.length > 0 && (
                  <div className="tags">
                    {video.tags_list.map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="comments-section">
            <div className="comments-header">
              <h3>{video.comments_count} Comments</h3>
              <button 
                className="toggle-comments"
                onClick={() => setShowComments(!showComments)}
              >
                {showComments ? 'Hide' : 'Show'} Comments
              </button>
            </div>

            {showComments && (
              <>
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                  <div className="comment-input-container">
                    <div className="user-avatar">
                      <i className="fas fa-user"></i>
                    </div>
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="comment-input"
                    />
                  </div>
                  <div className="comment-actions">
                    <button type="submit" className="submit-comment">Comment</button>
                    <button type="button" onClick={() => setNewComment('')}>Cancel</button>
                  </div>
                </form>

                <div className="comments-list">
                  {comments.map(comment => (
                    <div key={comment.id} className="comment">
                      <div className="comment-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{comment.user.full_name || comment.user.username}</span>
                          <span className="comment-date">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                        <div className="comment-actions">
                          <button className="comment-like">
                            <i className="fas fa-thumbs-up"></i>
                          </button>
                          <button className="comment-reply">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="video-sidebar">
          <div className="related-videos">
            <h3>Related Videos</h3>
            {video.related_videos && video.related_videos.map(relatedVideo => (
              <div 
                key={relatedVideo.id} 
                className="related-video-item"
                onClick={() => navigate(`/watch/${relatedVideo.id}`)}
              >
                <img src={relatedVideo.thumbnail_url} alt={relatedVideo.title} />
                <div className="related-video-info">
                  <h4>{relatedVideo.title}</h4>
                  <p className="related-video-channel">{relatedVideo.user.username}</p>
                  <p className="related-video-stats">
                    {relatedVideo.views_count.toLocaleString()} views
                  </p>
                </div>
                <div className="related-video-duration">
                  {relatedVideo.duration_formatted}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 