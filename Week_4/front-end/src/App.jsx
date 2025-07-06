import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import WatchLater from './pages/WatchLater';
import LikedVideos from './pages/LikedVideos';
import History from './pages/History';
import VideoPlayer from './pages/VideoPlayer';
import VideoUpload from './pages/VideoUpload';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Login from './components/Login';
import Register from './components/Register';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/watch-later" element={<WatchLater />} />
              <Route path="/liked" element={<LikedVideos />} />
              <Route path="/history" element={<History />} />
              <Route path="/watch/:videoId" element={<VideoPlayer />} />
              <Route path="/upload" element={<VideoUpload />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/video/edit/:videoId" element={<VideoUpload />} />
              <Route path="/account" element={<Account />} />
              <Route path="/login" element={<Account />} />
              <Route path="/register" element={<Account />} />
            </Routes>
          </main>
        </div>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-left">
              <p>&copy; 2025 VideoHub - Built with React</p>
            </div>
            <div className="footer-right">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App; 