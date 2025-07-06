import VideoCard from '../components/VideoCard';
import { videos } from '../data/dummyVideos';

const Home = () => {
  const handleWatchLaterToggle = (videoId, isAdded) => {
    // Dispatch custom event to update navbar count
    window.dispatchEvent(new Event('watchLaterUpdated'));
  };

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Recommended Videos</h1>
        <p>Discover amazing content from creators around the world</p>
      </div>
      
      <div className="video-grid">
        {videos.map(video => (
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