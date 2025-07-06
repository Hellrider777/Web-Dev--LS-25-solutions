import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoCard = ({ video, onWatchLaterToggle, isWatchLater = false, isLiked = false }) => {
  const navigate = useNavigate();
  const [isVideoLiked, setIsVideoLiked] = useState(isLiked);
  const [isInWatchLater, setIsInWatchLater] = useState(false);

  useEffect(() => {
    // Check if video is liked
    if (!isLiked) {
      const likedVideos = JSON.parse(sessionStorage.getItem('likedVideos') || '[]');
      setIsVideoLiked(likedVideos.some(v => v.id === video.id));
    } else {
      setIsVideoLiked(isLiked);
    }

    // Check if video is in watch later
    const watchLaterVideos = JSON.parse(sessionStorage.getItem('watchLaterVideos') || '[]');
    setIsInWatchLater(watchLaterVideos.some(v => v.id === video.id));
  }, [video.id, isLiked]);

  const handleLike = () => {
    const likedVideos = JSON.parse(sessionStorage.getItem('likedVideos') || '[]');
    
    if (isVideoLiked) {
      // Remove from liked
      const updatedLiked = likedVideos.filter(v => v.id !== video.id);
      sessionStorage.setItem('likedVideos', JSON.stringify(updatedLiked));
      setIsVideoLiked(false);
      
      // Notify parent component if it's the LikedVideos page
      if (onWatchLaterToggle) {
        onWatchLaterToggle(video.id, false);
      }
    } else {
      // Add to liked (store full video object)
      const updatedLiked = [...likedVideos, video];
      sessionStorage.setItem('likedVideos', JSON.stringify(updatedLiked));
      setIsVideoLiked(true);
      
      // Notify parent component
      if (onWatchLaterToggle) {
        onWatchLaterToggle(video.id, true);
      }
    }
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('likedVideosUpdated'));
  };

  const handleWatchLater = (e) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    const watchLaterVideos = JSON.parse(sessionStorage.getItem('watchLaterVideos') || '[]');
    
    if (isInWatchLater) {
      // Remove from watch later
      const updatedWatchLater = watchLaterVideos.filter(v => v.id !== video.id);
      sessionStorage.setItem('watchLaterVideos', JSON.stringify(updatedWatchLater));
      setIsInWatchLater(false);
      if (onWatchLaterToggle) {
        onWatchLaterToggle(video.id, false);
      }
    } else {
      // Add to watch later
      const updatedWatchLater = [...watchLaterVideos, video];
      sessionStorage.setItem('watchLaterVideos', JSON.stringify(updatedWatchLater));
      setIsInWatchLater(true);
      if (onWatchLaterToggle) {
        onWatchLaterToggle(video.id, true);
      }
    }
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('watchLaterUpdated'));
  };

  const handleLikeClick = (e) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    handleLike();
  };

  const handleCardClick = () => {
    navigate(`/watch/${video.id}`);
  };

  return (
    <div className="video-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="video-thumbnail">
        <img src={video.thumbnail} alt={video.title} />
        <div className="play-overlay">
          <i className="fas fa-play"></i>
        </div>
      </div>
      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <p className="video-channel">{video.channel}</p>
        <p className="video-stats">{video.views} views • {video.time}</p>
        <div className="video-actions">
          <button 
            className={`action-btn like-btn ${isVideoLiked ? 'liked' : ''}`}
            onClick={handleLikeClick}
          >
            <i className={`${isVideoLiked ? 'fas' : 'far'} fa-heart`}></i>
            {isVideoLiked ? 'Liked' : 'Like'}
          </button>
          <button 
            className={`action-btn watch-later-btn ${isInWatchLater ? 'added' : ''}`}
            onClick={handleWatchLater}
          >
            {isWatchLater ? (
              <>
                <i className="fas fa-trash"></i> Remove
              </>
            ) : isInWatchLater ? (
              <>
                <i className="fas fa-check"></i> Added
              </>
            ) : (
              <>
                <i className="fas fa-clock"></i> Watch Later
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard; 