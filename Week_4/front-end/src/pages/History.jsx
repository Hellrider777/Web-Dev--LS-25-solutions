import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './History.css';

const History = () => {
  const [historyVideos, setHistoryVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = () => {
      const saved = JSON.parse(sessionStorage.getItem('videoHistory') || '[]');
      // Sort by timestamp (most recent first)
      const sortedHistory = saved.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setHistoryVideos(sortedHistory);
    };

    loadHistory();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('historyUpdated', loadHistory);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('historyUpdated', loadHistory);
    };
  }, []);

  const handleVideoClick = (video) => {
    navigate(`/watch/${video.id}`);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your watch history?')) {
      sessionStorage.setItem('videoHistory', JSON.stringify([]));
      setHistoryVideos([]);
      window.dispatchEvent(new Event('historyUpdated'));
    }
  };

  const removeFromHistory = (videoId, timestamp) => {
    const updatedHistory = historyVideos.filter(
      item => !(item.video.id === videoId && item.timestamp === timestamp)
    );
    sessionStorage.setItem('videoHistory', JSON.stringify(updatedHistory));
    setHistoryVideos(updatedHistory);
    window.dispatchEvent(new Event('historyUpdated'));
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMs = now - then;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else {
      return then.toLocaleDateString();
    }
  };

  const formatFullTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="history-page">
      <div className="page-header">
        <h1>Watch History</h1>
        <p>Videos you've watched recently</p>
        {historyVideos.length > 0 && (
          <button className="clear-all-btn" onClick={clearHistory}>
            🗑️ Clear All History
          </button>
        )}
      </div>

      {historyVideos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📺</div>
          <h2>No watch history</h2>
          <p>Videos you watch will appear here</p>
        </div>
      ) : (
        <div className="history-list">
          {historyVideos.map((item, index) => (
            <div key={`${item.video.id}-${item.timestamp}`} className="history-item">
              <div className="history-thumbnail" onClick={() => handleVideoClick(item.video)}>
                <img src={item.video.thumbnail} alt={item.video.title} />
                <div className="play-overlay">
                  <i className="fas fa-play"></i>
                </div>
                {item.video.duration && (
                  <div className="video-duration">{item.video.duration}</div>
                )}
              </div>
              
              <div className="history-info">
                <h3 
                  className="history-title" 
                  onClick={() => handleVideoClick(item.video)}
                  title={item.video.title}
                >
                  {item.video.title}
                </h3>
                <p className="history-channel">{item.video.channel}</p>
                <p className="history-stats">
                  {item.video.views} views • {item.video.time}
                </p>
                <div className="history-timestamp">
                  <i className="fas fa-clock"></i>
                  <span title={formatFullTime(item.timestamp)}>
                    Watched {formatTimeAgo(item.timestamp)}
                  </span>
                </div>
                <p className="history-url" title={item.url}>
                  <i className="fas fa-link"></i>
                  {item.url}
                </p>
              </div>

              <div className="history-actions">
                <button 
                  className="remove-btn"
                  onClick={() => removeFromHistory(item.video.id, item.timestamp)}
                  title="Remove from history"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History; 