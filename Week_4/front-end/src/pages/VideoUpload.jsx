import React, { useState, useEffect } from 'react';
import './VideoUpload.css';

const VideoUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    video_url: '',
    status: 'published'
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    // Fetch categories - for now using dummy data
    setCategories([
      { id: 1, name: 'Technology' },
      { id: 2, name: 'Entertainment' },
      { id: 3, name: 'Education' },
      { id: 4, name: 'Gaming' },
      { id: 5, name: 'Music' },
      { id: 6, name: 'Sports' },
      { id: 7, name: 'Travel' },
      { id: 8, name: 'Cooking' }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      // Clear video URL if file is selected
      setFormData(prev => ({ ...prev, video_url: '' }));
      
      // Create preview for video
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setFormData(prev => ({ ...prev, video_url: '' }));
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        alert('Please select a video file');
      }
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('Please enter a video title');
      return false;
    }
    if (!formData.description.trim()) {
      alert('Please enter a video description');
      return false;
    }
    if (!videoFile && !formData.video_url.trim()) {
      alert('Please select a video file or enter a video URL');
      return false;
    }
    if (!formData.category) {
      alert('Please select a category');
      return false;
    }
    return true;
  };

  const simulateUpload = () => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        setUploadProgress(Math.min(progress, 100));
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload process for user feedback
      await simulateUpload();
      
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('category', formData.category);
      uploadData.append('tags', formData.tags);
      uploadData.append('status', formData.status);
      
      if (videoFile) {
        uploadData.append('video_file', videoFile);
      } else {
        uploadData.append('video_url', formData.video_url);
      }
      
      if (thumbnailFile) {
        uploadData.append('thumbnail', thumbnailFile);
      }

      // Make actual API call to backend
              const response = await fetch('http://127.0.0.1:8000/api/videos/create/', {
        method: 'POST',
        body: uploadData,
        headers: {
          // Don't set Content-Type header for FormData - browser will set it automatically
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add when auth is implemented
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      alert('Video uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: '',
        video_url: '',
        status: 'published'
      });
      setVideoFile(null);
      setThumbnailFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload video. Please try again. Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="video-upload-page">
      <div className="upload-container">
        <div className="upload-header">
          <h1>Upload Video</h1>
          <p>Share your content with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-row">
            <div className="form-section">
              <h3>Video File</h3>
              
              <div 
                className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {!videoFile && !previewUrl ? (
                  <div className="upload-placeholder">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>Drag and drop your video file here</p>
                    <p>or</p>
                    <input
                      type="file"
                      id="video-file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="file-input"
                    />
                    <label htmlFor="video-file" className="file-button">
                      Choose Video File
                    </label>
                  </div>
                ) : (
                  <div className="file-preview">
                    {previewUrl && (
                      <video controls className="video-preview">
                        <source src={previewUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                    <div className="file-info">
                      <p className="file-name">{videoFile?.name}</p>
                      <p className="file-size">{videoFile && formatFileSize(videoFile.size)}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFile(null);
                          setPreviewUrl(null);
                        }}
                        className="remove-file"
                      >
                        Remove File
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="url-option">
                <p>Or enter a video URL:</p>
                <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/video.mp4"
                  className="url-input"
                  disabled={!!videoFile}
                />
              </div>

              <div className="thumbnail-upload">
                <label htmlFor="thumbnail">Custom Thumbnail (optional):</label>
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="file-input"
                />
                <label htmlFor="thumbnail" className="file-button secondary">
                  Choose Thumbnail
                </label>
                {thumbnailFile && (
                  <span className="file-selected">{thumbnailFile.name}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-section">
              <h3>Video Details</h3>
              
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter video title"
                  maxLength="200"
                  required
                />
                <div className="char-count">{formData.title.length}/200</div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell viewers about your video"
                  rows="5"
                  maxLength="1000"
                  required
                />
                <div className="char-count">{formData.description.length}/1000</div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Enter tags separated by commas"
                />
                <small>Help people find your video</small>
              </div>

              <div className="form-group">
                <label htmlFor="status">Visibility</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="published">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {loading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p>Uploading... {Math.round(uploadProgress)}%</p>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
                  // Navigate back or reset form
                  window.history.back();
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload; 