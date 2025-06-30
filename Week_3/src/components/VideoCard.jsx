import { useState, useEffect } from 'react';

const VideoCard = ({ video, onWatchLaterToggle, isWatchLater = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchLater, setIsInWatchLater] = useState(false);

  useEffect(() => {
    // Check if video is liked
    const likedVideos = JSON.parse(sessionStorage.getItem('likedVideos') || '[]');
    setIsLiked(likedVideos.includes(video.id));

    // Check if video is in watch later
    const watchLaterVideos = JSON.parse(sessionStorage.getItem('watchLaterVideos') || '[]');
    setIsInWatchLater(watchLaterVideos.some(v => v.id === video.id));
  }, [video.id]);

  const handleLike = () => {
    const likedVideos = JSON.parse(sessionStorage.getItem('likedVideos') || '[]');
    
    if (isLiked) {
      // Remove from liked
      const updatedLiked = likedVideos.filter(id => id !== video.id);
      sessionStorage.setItem('likedVideos', JSON.stringify(updatedLiked));
      setIsLiked(false);
    } else {
      // Add to liked
      const updatedLiked = [...likedVideos, video.id];
      sessionStorage.setItem('likedVideos', JSON.stringify(updatedLiked));
      setIsLiked(true);
    }
  };

  const handleWatchLater = () => {
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
  };

  return (
    <div className="video-card">
      <div className="video-thumbnail">
        <img src={video.thumbnail} alt={video.title} />
      </div>
      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <p className="video-channel">{video.channel}</p>
        <p className="video-stats">{video.views} views • {video.time}</p>
        <div className="video-actions">
          <button 
            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            ❤️ {isLiked ? 'Liked' : 'Like'}
          </button>
          <button 
            className={`action-btn watch-later-btn ${isInWatchLater ? 'added' : ''}`}
            onClick={handleWatchLater}
          >
            {isWatchLater ? '🗑️ Remove' : (isInWatchLater ? '✅ Added' : '➕ Watch Later')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard; 