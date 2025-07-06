import { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import { videos } from '../data/dummyVideos';

const Home = () => {
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/videos/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // If we got videos from API, use them; otherwise fallback to dummy data
      if (data.results && data.results.length > 0) {
        setAllVideos(data.results);
      } else {
        console.log('No videos from API, using dummy data');
        setAllVideos(videos);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos from server, showing sample videos');
      // Fallback to dummy data on error
      setAllVideos(videos);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchLaterToggle = (videoId, isAdded) => {
    // Dispatch custom event to update navbar count
    window.dispatchEvent(new Event('watchLaterUpdated'));
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Recommended Videos</h1>
        <p>Discover amazing content from creators around the world</p>
        {error && (
          <div className="error-message">
            <p style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>
              {error}
            </p>
          </div>
        )}
      </div>
      
      <div className="video-grid">
        {allVideos.map(video => (
          <VideoCard 
            key={video.id} 
            video={video} 
            onWatchLaterToggle={handleWatchLaterToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default Home; 