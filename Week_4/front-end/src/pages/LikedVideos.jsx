import { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';

const LikedVideos = () => {
  const [likedVideos, setLikedVideos] = useState([]);

  useEffect(() => {
    const loadLikedVideos = () => {
      const saved = JSON.parse(sessionStorage.getItem('likedVideos') || '[]');
      setLikedVideos(saved);
    };

    loadLikedVideos();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadLikedVideos();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('likedVideosUpdated', loadLikedVideos);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('likedVideosUpdated', loadLikedVideos);
    };
  }, []);

  const handleLikedToggle = (videoId, isLiked) => {
    if (!isLiked) {
      // Remove from local state immediately for better UX
      setLikedVideos(prev => prev.filter(v => v.id !== videoId));
    }
    // Dispatch custom event to update other components
    window.dispatchEvent(new Event('likedVideosUpdated'));
  };

  const clearAllLiked = () => {
    if (window.confirm('Are you sure you want to clear all liked videos?')) {
      sessionStorage.setItem('likedVideos', JSON.stringify([]));
      setLikedVideos([]);
      window.dispatchEvent(new Event('likedVideosUpdated'));
    }
  };

  return (
    <div className="liked-videos-page">
      <div className="page-header">
        <h1>Liked Videos</h1>
        <p>Videos you've liked</p>
        {likedVideos.length > 0 && (
          <button className="clear-all-btn" onClick={clearAllLiked}>
            🗑️ Clear All
          </button>
        )}
      </div>

      {likedVideos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h2>No liked videos</h2>
          <p>Videos you like will appear here</p>
        </div>
      ) : (
        <div className="video-grid">
          {likedVideos.map(video => (
            <VideoCard 
              key={video.id} 
              video={video} 
              onWatchLaterToggle={handleLikedToggle}
              isLiked={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideos; 