import { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';

const WatchLater = () => {
  const [watchLaterVideos, setWatchLaterVideos] = useState([]);

  useEffect(() => {
    const loadWatchLaterVideos = () => {
      const saved = JSON.parse(sessionStorage.getItem('watchLaterVideos') || '[]');
      setWatchLaterVideos(saved);
    };

    loadWatchLaterVideos();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadWatchLaterVideos();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('watchLaterUpdated', loadWatchLaterVideos);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('watchLaterUpdated', loadWatchLaterVideos);
    };
  }, []);

  const handleWatchLaterToggle = (videoId, isAdded) => {
    if (!isAdded) {
      // Remove from local state immediately for better UX
      setWatchLaterVideos(prev => prev.filter(v => v.id !== videoId));
    }
    // Dispatch custom event to update navbar count
    window.dispatchEvent(new Event('watchLaterUpdated'));
  };

  const clearAllWatchLater = () => {
    if (window.confirm('Are you sure you want to clear all videos from Watch Later?')) {
      sessionStorage.setItem('watchLaterVideos', JSON.stringify([]));
      setWatchLaterVideos([]);
      window.dispatchEvent(new Event('watchLaterUpdated'));
    }
  };

  return (
    <div className="watch-later-page">
      <div className="page-header">
        <h1>Watch Later</h1>
        <p>Videos you've saved to watch later</p>
        {watchLaterVideos.length > 0 && (
          <button className="clear-all-btn" onClick={clearAllWatchLater}>
            🗑️ Clear All
          </button>
        )}
      </div>

      {watchLaterVideos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📺</div>
          <h2>No videos in Watch Later</h2>
          <p>Videos you add to Watch Later will appear here</p>
        </div>
      ) : (
        <div className="video-grid">
          {watchLaterVideos.map(video => (
            <VideoCard 
              key={video.id} 
              video={video} 
              onWatchLaterToggle={handleWatchLaterToggle}
              isWatchLater={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchLater; 