import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Timer from './Timer';

const Navbar = () => {
  const [watchLaterCount, setWatchLaterCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const updateWatchLaterCount = () => {
      const watchLaterVideos = JSON.parse(sessionStorage.getItem('watchLaterVideos') || '[]');
      setWatchLaterCount(watchLaterVideos.length);
    };

    // Initial count
    updateWatchLaterCount();

    // Listen for storage changes
    const handleStorageChange = () => {
      updateWatchLaterCount();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Since sessionStorage doesn't trigger storage event in same tab,
    // we'll use a custom event
    window.addEventListener('watchLaterUpdated', updateWatchLaterCount);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('watchLaterUpdated', updateWatchLaterCount);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // This is a dummy search - in a real app, you'd implement actual search
    alert(`Searching for: ${searchTerm}`);
    setSearchTerm('');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">🎥</span>
            <span className="logo-text">VideoHub</span>
          </Link>
        </div>

        <div className="nav-center">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>
        </div>

        <div className="nav-right">
          <Timer />
          <Link to="/watch-later" className="watch-later-link">
            <button className="watch-later-btn">
              📺 Watch Later 
              {watchLaterCount > 0 && (
                <span className="count-badge">{watchLaterCount}</span>
              )}
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 