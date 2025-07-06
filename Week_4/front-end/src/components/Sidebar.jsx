import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={toggleSidebar}>
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <Link to="/" className={`nav-item ${isActive('/')}`}>
            <i className="fas fa-home"></i>
            <span className="nav-text">Home</span>
          </Link>
          
          <Link to="/trending" className={`nav-item ${isActive('/trending')}`}>
            <i className="fas fa-fire"></i>
            <span className="nav-text">Trending</span>
          </Link>
          
          <Link to="/subscriptions" className={`nav-item ${isActive('/subscriptions')}`}>
            <i className="fas fa-play-circle"></i>
            <span className="nav-text">Subscriptions</span>
          </Link>
        </div>

        <div className="nav-section">
          <div className="section-title">
            <span className="nav-text">Library</span>
          </div>
          
          <Link to="/history" className={`nav-item ${isActive('/history')}`}>
            <i className="fas fa-history"></i>
            <span className="nav-text">History</span>
          </Link>
          
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
            <i className="fas fa-video"></i>
            <span className="nav-text">Your videos</span>
          </Link>
          
          <Link to="/watch-later" className={`nav-item ${isActive('/watch-later')}`}>
            <i className="fas fa-clock"></i>
            <span className="nav-text">Watch later</span>
          </Link>
          
          <Link to="/liked" className={`nav-item ${isActive('/liked')}`}>
            <i className="fas fa-thumbs-up"></i>
            <span className="nav-text">Liked videos</span>
          </Link>
        </div>
        
        <div className="nav-section">
          <div className="section-title">
            <span className="nav-text">Account</span>
          </div>
          
          <Link to="/account" className={`nav-item ${isActive('/account')}`}>
            <i className="fas fa-user-circle"></i>
            <span className="nav-text">Sign In / Profile</span>
          </Link>
        </div>

        <div className="nav-section">
          <div className="section-title">
            <span className="nav-text">Browse</span>
          </div>
          
          <Link to="/category/music" className={`nav-item ${isActive('/category/music')}`}>
            <i className="fas fa-music"></i>
            <span className="nav-text">Music</span>
          </Link>
          
          <Link to="/category/gaming" className={`nav-item ${isActive('/category/gaming')}`}>
            <i className="fas fa-gamepad"></i>
            <span className="nav-text">Gaming</span>
          </Link>
          
          <Link to="/category/sports" className={`nav-item ${isActive('/category/sports')}`}>
            <i className="fas fa-futbol"></i>
            <span className="nav-text">Sports</span>
          </Link>
          
          <Link to="/category/education" className={`nav-item ${isActive('/category/education')}`}>
            <i className="fas fa-graduation-cap"></i>
            <span className="nav-text">Education</span>
          </Link>
          
          <Link to="/category/technology" className={`nav-item ${isActive('/category/technology')}`}>
            <i className="fas fa-laptop"></i>
            <span className="nav-text">Technology</span>
          </Link>
          
          <Link to="/category/entertainment" className={`nav-item ${isActive('/category/entertainment')}`}>
            <i className="fas fa-film"></i>
            <span className="nav-text">Entertainment</span>
          </Link>
          
          <Link to="/category/travel" className={`nav-item ${isActive('/category/travel')}`}>
            <i className="fas fa-plane"></i>
            <span className="nav-text">Travel</span>
          </Link>
          
          <Link to="/category/cooking" className={`nav-item ${isActive('/category/cooking')}`}>
            <i className="fas fa-utensils"></i>
            <span className="nav-text">Cooking</span>
          </Link>
        </div>

        <div className="nav-section">
          <div className="section-title">
            <span className="nav-text">More from VideoHub</span>
          </div>
          
          <Link to="/upload" className={`nav-item ${isActive('/upload')}`}>
            <i className="fas fa-plus-circle"></i>
            <span className="nav-text">Upload Video</span>
          </Link>
          
          <Link to="/live" className={`nav-item ${isActive('/live')}`}>
            <i className="fas fa-broadcast-tower"></i>
            <span className="nav-text">Go Live</span>
          </Link>
        </div>

        <div className="nav-section">
          <div className="section-title">
            <span className="nav-text">Settings</span>
          </div>
          
          <Link to="/settings" className={`nav-item ${isActive('/settings')}`}>
            <i className="fas fa-cog"></i>
            <span className="nav-text">Settings</span>
          </Link>
          
          <Link to="/report" className={`nav-item ${isActive('/report')}`}>
            <i className="fas fa-flag"></i>
            <span className="nav-text">Report history</span>
          </Link>
          
          <Link to="/help" className={`nav-item ${isActive('/help')}`}>
            <i className="fas fa-question-circle"></i>
            <span className="nav-text">Help</span>
          </Link>
          
          <Link to="/feedback" className={`nav-item ${isActive('/feedback')}`}>
            <i className="fas fa-comment-alt"></i>
            <span className="nav-text">Send feedback</span>
          </Link>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-links">
          <span className="nav-text">About Press Copyright</span>
          <span className="nav-text">Contact us Creators</span>
          <span className="nav-text">Advertise Developers</span>
          <span className="nav-text">Terms Privacy Policy & Safety</span>
        </div>
        <div className="footer-copy">
          <span className="nav-text">© 2025 VideoHub</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 