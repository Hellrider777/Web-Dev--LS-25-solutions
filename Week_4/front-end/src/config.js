// API Configuration
// This file centralizes API URL configuration for the application

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    // Auth endpoints
    register: `${API_BASE_URL}/api/auth/register/`,
    login: `${API_BASE_URL}/api/auth/login/`,
    logout: `${API_BASE_URL}/api/auth/logout/`,
    verify: (token) => `${API_BASE_URL}/api/auth/verify/${token}/`,

    // Video endpoints
    videos: `${API_BASE_URL}/api/videos/`,
    videoDetail: (id) => `${API_BASE_URL}/api/videos/${id}/`,
    videoLike: (id) => `${API_BASE_URL}/api/videos/${id}/like/`,
    videoComment: (id) => `${API_BASE_URL}/api/videos/${id}/comment/`,
    videoWatchLater: (id) => `${API_BASE_URL}/api/videos/${id}/watch-later/`,

    // User endpoints
    userHistory: `${API_BASE_URL}/api/user/history/`,
  },
};

export default API_CONFIG;
