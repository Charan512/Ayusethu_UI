import React, { useState, useEffect, useRef } from 'react';
import { BellRing } from "lucide-react";
import "../styles/Farmerdashboard.css";

// Notification Types
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Single Notification Toast Component
const NotificationToast = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onClose();
      }, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = (type) => {
    switch(type) {
      case NOTIFICATION_TYPES.SUCCESS: return '✓';
      case NOTIFICATION_TYPES.ERROR: return '✕';
      case NOTIFICATION_TYPES.WARNING: return '⚠';
      case NOTIFICATION_TYPES.INFO: return 'ℹ';
      default: return '•';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className={`notification-item ${notification.type} ${isExiting ? 'exit' : ''}`}>
      <div className="notification-icon">
        {getIcon(notification.type)}
      </div>
      <div className="notification-content">
        <div className="notification-title">
          <span>{notification.title}</span>
          <button className="notification-close" onClick={() => {
            setIsExiting(true);
            setTimeout(onClose, 300);
          }}>
            ×
          </button>
        </div>
        <div className="notification-message">{notification.message}</div>
        <div className="notification-time">
          <i className="fas fa-clock"></i>
          {formatTime(notification.timestamp)}
        </div>
      </div>
      <div className="notification-progress">
        <div className="notification-progress-bar"></div>
      </div>
    </div>
  );
};

// Notification List Item Component (for dropdown)
const NotificationListItem = ({ notification, onMarkAsRead, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = (type) => {
    switch(type) {
      case NOTIFICATION_TYPES.SUCCESS: return '✓';
      case NOTIFICATION_TYPES.ERROR: return '✕';
      case NOTIFICATION_TYPES.WARNING: return '⚠';
      case NOTIFICATION_TYPES.INFO: return 'ℹ';
      default: return '•';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div 
      className={`notification-list-item ${notification.type} ${notification.read ? '' : 'unread'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="notification-list-icon">
        {getIcon(notification.type)}
      </div>
      <div className="notification-list-content">
        <div className="notification-list-title">{notification.title}</div>
        <div className="notification-list-message">{notification.message}</div>
        <div className="notification-list-time">{formatTime(notification.timestamp)}</div>
      </div>
      <div className="notification-list-actions">
        {!notification.read && (
          <button 
            className="notification-action-btn" 
            title="Mark as read"
            onClick={() => onMarkAsRead(notification.id)}
          >
            <i className="fas fa-check"></i>
          </button>
        )}
        <button 
          className="notification-action-btn" 
          title="Delete"
          onClick={() => onDelete(notification.id)}
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

// Notification Dropdown Component
const NotificationDropdown = ({ notifications, onClose, onMarkAllAsRead, onDeleteNotification, onMarkAsRead }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-dropdown-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <span className="notification-count-badge">{unreadCount}</span>
        )}
      </div>
      <div className="notification-dropdown-content">
        {notifications.length === 0 ? (
          <div className="notification-dropdown-empty">
            <i className="fas fa-bell-slash"></i>
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationListItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={() => onMarkAsRead(notification.id)}
              onDelete={() => onDeleteNotification(notification.id)}
            />
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <div className="notification-dropdown-footer">
          <button className="mark-all-read-btn" onClick={onMarkAllAsRead}>
            <i className="fas fa-check-double"></i> Mark all as read
          </button>
        </div>
      )}
    </div>
  );
};

// Mock user data
const USER_DATA = {
  name: "Ramesh Kumar",
  email: "ramesh.kumar@farmer.com",
  farmerId: "FARM-2024-AP-1024",
  phone: "+91 98765 43210",
  location: "Andhra Pradesh, India",
  farmSize: "12.5 acres",
  registrationDate: "2023-06-15",
  verified: true,
  complianceScore: 95,
  profileImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9"
};

const MOCK_COLLECTOR_UPDATES = [
  {
    id: 1,
    cropName: "Ashwagandha (Batch A)",
    collectorName: "Suresh Patil",
    pickupDate: "2025-12-10",
    status: "Scheduled",
    vehicleNumber: "AP-02-CD-1234"
  }
];

const MOCK_ACTIVE_CROPS = [
  {
    id: 101,
    species: "Ashwagandha",
    plantedDate: "2025-01-15",
    expectedHarvest: "2025-12-01",
    stage: 3,
    status: "Ready for Harvest",
    updates: 2
  },
  {
    id: 102,
    species: "Tulsi (Holy Basil)",
    plantedDate: "2025-11-20",
    expectedHarvest: "2026-02-20",
    stage: 1,
    status: "Growing",
    updates: 0
  }
];

// --- Reusable Components ---
const Card = ({ children, className = "", onClick }) => (
  <div className={`card ${className}`} onClick={onClick}>
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  let className = "status-badge ";
  if (status === "Ready for Harvest") className += "ready";
  else if (status === "Scheduled") className += "scheduled";
  else if (status === "Growing") className += "growing";
  
  return <span className={className}>{status}</span>;
};

// --- Dashboard Component ---
function DashboardHome({ navTo, showNotification }) {
  const handleCropClick = (crop) => {
    if (showNotification) {
      showNotification(
        `Viewing ${crop.species}`,
        `You're now viewing details for ${crop.species}. Current stage: ${crop.updates + 1}/3`,
        NOTIFICATION_TYPES.INFO
      );
    }
    navTo('updates');
  };

  return (
    <div className="fade-in">
      {/* Quick Actions */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div>
            <h2 className="glass-card-title">Quick Actions</h2>
            <p className="glass-card-subtitle">Manage your crops with these essential tools</p>
          </div>
        </div>

        <div className="action-grid">
          <button className="action-card moss" onClick={() => navTo('register')}>
            <div className="action-icon">
              <i className="fas fa-seedling"></i>
            </div>
            <h3>Register New Crop</h3>
            <p>Notify authorities 7 days prior to planting.</p>
            <div className="action-link">
              Get Started <i className="fas fa-arrow-right"></i>
            </div>
          </button>

          <button className="action-card blue" onClick={() => navTo('updates')}>
            <div className="action-icon">
              <i className="fas fa-camera"></i>
            </div>
            <h3>Update Growth</h3>
            <p>Upload photos & geotags for compliance.</p>
            <div className="action-link">
              Update Now <i className="fas fa-arrow-right"></i>
            </div>
          </button>

          <button className="action-card orange" onClick={() => navTo('harvest')}>
            <div className="action-icon">
              <i className="fas fa-truck"></i>
            </div>
            <h3>Harvest Request</h3>
            <p>Request a collector for ready crops.</p>
            <div className="action-link">
              Request <i className="fas fa-arrow-right"></i>
            </div>
          </button>
        </div>
      </div>

      {/* Grid: Collector + Active Crops */}
      <div className="dashboard-grid">
        {/* Collector Updates */}
        <div>
          <h3 className="section-title">
            <i className="fas fa-truck"></i> Collector Arrivals
          </h3>
          <div className="section-content">
            {MOCK_COLLECTOR_UPDATES.map((update) => (
              <Card key={update.id} className="collector-card">
                <div className="collector-card-header">
                  <StatusBadge status={update.status} />
                  <span className="collector-date">{update.pickupDate}</span>
                </div>
                <h4 className="collector-crop-name">{update.cropName}</h4>
                <div className="collector-details">
                  <div>
                    Collector: <strong>{update.collectorName}</strong>
                  </div>
                  <div>
                    Vehicle: <code className="vehicle-code">{update.vehicleNumber}</code>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Active Crops */}
        <div>
          <h3 className="section-title">
            <i className="fas fa-leaf"></i> Active Crops
          </h3>
          <div className="section-content">
            {MOCK_ACTIVE_CROPS.map((crop) => (
              <div key={crop.id} className="card crop-card" onClick={() => handleCropClick(crop)}>
                <div className="crop-card-header">
                  <h4>{crop.species}</h4>
                  <StatusBadge status={crop.status} />
                </div>
                <div className="crop-stage">
                  Stage {crop.updates + 1}/3
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${((crop.updates + 0.5) / 3) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Register Form Component ---
function RegisterCropForm({ navTo, showNotification }) {
  const [formData, setFormData] = useState({
    species: '',
    startDate: '',
    harvestDate: '',
    farmId: USER_DATA.farmerId,
    coords: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (showNotification) {
      showNotification(
        'Registration Submitted',
        `Crop registration for ${formData.species} has been submitted successfully!`,
        NOTIFICATION_TYPES.SUCCESS
      );
    }
    
    alert('Registration submitted successfully!');
    navTo('dashboard');
  };

  const getCoordinates = () => {
    setFormData({ ...formData, coords: 'Getting location...' });
    setTimeout(() => {
      setFormData({ ...formData, coords: '16.5062° N, 80.6480° E' });
      
      if (showNotification) {
        showNotification(
          'Location Captured',
          'GPS coordinates have been successfully captured.',
          NOTIFICATION_TYPES.SUCCESS
        );
      }
    }, 800);
  };

  return (
    <div className="form-container fade-in">
      <button 
        onClick={() => navTo('dashboard')} 
        className="back-button"
      >
        <i className="fas fa-arrow-left"></i> Back
      </button>
      
      <h2 className="page-title">Register New Crop</h2>
      <p className="page-description">
        Required: Inform authority 7 days prior to planting.
      </p>

      <Card>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Farm ID</label>
              <input 
                className="form-input" 
                value={formData.farmId} 
                readOnly 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Species</label>
              <select
                className="form-select"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                required
              >
                <option value="">Select...</option>
                <option value="Ashwagandha">Ashwagandha</option>
                <option value="Tulsi">Tulsi</option>
                <option value="Aloe Vera">Aloe Vera</option>
                <option value="Brahmi">Brahmi</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Planting Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Exp. Harvest</label>
              <input
                type="date"
                className="form-input"
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="geolocation-section">
            <label className="form-label">Geolocation</label>
            <div className="geolocation-input-group">
              <input
                className="form-input"
                placeholder="Waiting for GPS..."
                value={formData.coords}
                readOnly
              />
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={getCoordinates}
              >
                <i className="fas fa-map-marker-alt"></i> Get
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary full-width">
            Submit Registration
          </button>
        </form>
      </Card>
    </div>
  );
}

// --- Updates Component ---
function CropUpdates({ navTo, showNotification }) {
  const [selectedCrop, setSelectedCrop] = useState(MOCK_ACTIVE_CROPS[0]);
  const [stagePhotos, setStagePhotos] = useState({ 1: null, 2: null, 3: null });
  const [voiceNote, setVoiceNote] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [observations, setObservations] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const recordingTimerRef = useRef(null);

  // Handle photo upload
  const handlePhotoUpload = (e, stage) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        if (showNotification) {
          showNotification(
            'File Too Large',
            'File size should be less than 5MB',
            NOTIFICATION_TYPES.ERROR
          );
        }
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        if (showNotification) {
          showNotification(
            'Invalid File Type',
            'Please upload only JPG or PNG images',
            NOTIFICATION_TYPES.ERROR
          );
        }
        return;
      }
      
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setStagePhotos(prev => ({
        ...prev,
        [stage]: { file, preview: imageUrl, name: file.name, size: file.size }
      }));
      
      if (showNotification) {
        showNotification(
          'Photo Uploaded',
          `Stage ${stage} photo uploaded successfully`,
          NOTIFICATION_TYPES.SUCCESS
        );
      }
    }
  };

  // Start voice recording
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    setTimeout(() => {
      setVoiceNote({
        name: `voice_note_${Date.now()}.wav`,
        duration: '30s',
        size: '2.4 MB',
        timestamp: new Date().toLocaleTimeString()
      });
      
      if (showNotification) {
        showNotification(
          'Recording Complete',
          'Voice note recorded successfully',
          NOTIFICATION_TYPES.SUCCESS
        );
      }
    }, 2000);
  };

  // Stop voice recording
  const stopRecording = () => {
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Remove photo
  const removePhoto = (stage) => {
    if (stagePhotos[stage] && stagePhotos[stage].preview) {
      URL.revokeObjectURL(stagePhotos[stage].preview);
    }
    setStagePhotos(prev => ({
      ...prev,
      [stage]: null
    }));
  };

  // Remove voice note
  const removeVoiceNote = () => {
    setVoiceNote(null);
  };

  // Simulate upload process
  const handleSubmitUpdate = async () => {
    if (!selectedCrop) {
      if (showNotification) {
        showNotification(
          'No Crop Selected',
          'Please select a crop first',
          NOTIFICATION_TYPES.WARNING
        );
      }
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            
            if (showNotification) {
              showNotification(
                'Update Submitted',
                `Stage ${selectedCrop.updates + 1} update for ${selectedCrop.species} submitted successfully!`,
                NOTIFICATION_TYPES.SUCCESS
              );
            }
            
            // Reset form
            setStagePhotos({ 1: null, 2: null, 3: null });
            setVoiceNote(null);
            setObservations('');
            setUploadProgress(0);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(stagePhotos).forEach(photo => {
        if (photo && photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="fade-in">
      <button 
        onClick={() => navTo('dashboard')} 
        className="back-button"
      >
        <i className="fas fa-arrow-left"></i> Back
      </button>
      
      <h2 className="page-title">Crop Growth Updates</h2>
      <p className="page-description">
        Provide regular photo and audio evidence to maintain your compliance score.
      </p>

      <div className="upload-interface-grid">
        {/* Left Panel - Crop Selection */}
        <div>
          <Card className="crop-selection-card">
            <h3 className="crop-selection-title">
              <i className="fas fa-seedling"></i>
              Select Crop
            </h3>
            <div className="crop-selection-list">
              {MOCK_ACTIVE_CROPS.map(crop => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop)}
                  className={`crop-select-button ${selectedCrop?.id === crop.id ? 'selected' : ''}`}
                >
                  <div className="crop-select-header">
                    <span>{crop.species}</span>
                    {selectedCrop?.id === crop.id && (
                      <i className="fas fa-check-circle"></i>
                    )}
                  </div>
                  <div className="crop-select-details">
                    Stage {crop.updates + 1}/3 • {crop.status}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Current Stage Progress */}
          <Card className="progress-card">
            <h3 className="progress-title">Current Progress</h3>
            {selectedCrop && (
              <div>
                <div className="progress-header">
                  <span>Stage {selectedCrop.updates + 1}</span>
                  <span className="progress-percentage">
                    {Math.round(((selectedCrop.updates + 0.5) / 3) * 100)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${((selectedCrop.updates + 0.5) / 3) * 100}%` }}
                  ></div>
                </div>
                
                <div className="crop-dates">
                  <div className="crop-date">
                    <i className="fas fa-calendar"></i>
                    Planted: {selectedCrop.plantedDate}
                  </div>
                  <div className="crop-date">
                    <i className="fas fa-clock"></i>
                    Harvest: {selectedCrop.expectedHarvest}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Panel - Upload Interface */}
        <Card className="upload-card">
          {selectedCrop ? (
            <div>
              <div className="upload-header">
                <div>
                  <h3 className="upload-title">
                    Update for <span className="crop-name">{selectedCrop.species}</span>
                  </h3>
                  <p className="upload-subtitle">
                    Submitting evidence for Stage {selectedCrop.updates + 1}
                  </p>
                </div>
                <StatusBadge status={selectedCrop.status} />
              </div>

              {/* Stage Indicators */}
              <div className="stage-indicators">
                <div className="stage-line"></div>
                {[1, 2, 3].map(stage => (
                  <div key={stage} className="stage-indicator">
                    <div className={`stage-circle ${stage <= selectedCrop.updates + 1 ? 'active' : 'inactive'}`}>
                      {stage}
                    </div>
                    <span className={`stage-label ${stage <= selectedCrop.updates + 1 ? 'active' : 'inactive'}`}>
                      Stage {stage}
                    </span>
                  </div>
                ))}
              </div>

              {/* Photo Upload Section */}
              <div className="upload-section">
                <h4 className="upload-section-title">
                  <i className="fas fa-camera"></i>
                  1. Upload Stage Photos
                </h4>
                <div className="photo-upload-grid">
                  {[1, 2, 3].map(stage => (
                    <div 
                      key={stage}
                      className={`photo-upload-box ${stagePhotos[stage] ? 'has-photo' : ''}`}
                      onClick={() => {
                        if (!stagePhotos[stage]) {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/jpeg,image/jpg,image/png';
                          input.onchange = (e) => handlePhotoUpload(e, stage);
                          input.click();
                        }
                      }}
                    >
                      {stagePhotos[stage] ? (
                        <div>
                          <img 
                            src={stagePhotos[stage].preview} 
                            alt={`Stage ${stage}`}
                            className="photo-preview"
                          />
                          <div className="photo-info">
                            {stagePhotos[stage].name}
                          </div>
                          <div className="photo-size">
                            {(stagePhotos[stage].size / 1024 / 1024).toFixed(2)} MB
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removePhoto(stage);
                            }}
                            className="remove-photo-btn"
                          >
                            <i className="fas fa-trash"></i> Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="upload-placeholder">
                            <i className="fas fa-camera"></i>
                          </div>
                          <div className="photo-stage-label">
                            Stage {stage}
                          </div>
                          <div className="photo-upload-hint">
                            Click to upload
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div className="upload-info">
                  <i className="fas fa-info-circle"></i>
                  Maximum file size: 5MB per image. Supported formats: JPG, PNG
                </div>
              </div>

              {/* Voice Note Section */}
              <div className="upload-section">
                <h4 className="upload-section-title">
                  <i className="fas fa-microphone"></i>
                  2. Voice Observation (Optional)
                </h4>
                {voiceNote ? (
                  <div className="voice-note-preview">
                    <div className="voice-note-content">
                      <div className="voice-note-info">
                        <div className="voice-note-icon">
                          <i className="fas fa-microphone"></i>
                        </div>
                        <div className="voice-note-details">
                          <div className="voice-note-name">{voiceNote.name}</div>
                          <div className="voice-note-meta">
                            Duration: {voiceNote.duration} • Size: {voiceNote.size}
                          </div>
                          <div className="voice-note-timestamp">
                            Recorded at: {voiceNote.timestamp}
                          </div>
                        </div>
                      </div>
                      <div className="voice-note-actions">
                        <button className="btn-secondary">
                          <i className="fas fa-play"></i> Play
                        </button>
                        <button 
                          onClick={removeVoiceNote}
                          className="btn-danger"
                        >
                          <i className="fas fa-trash"></i> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`voice-recording-box ${isRecording ? 'recording' : ''}`}>
                    {isRecording ? (
                      <div>
                        <div className="voice-recording-icon recording">
                          <i className="fas fa-microphone"></i>
                        </div>
                        <div className="timer-display">
                          {formatTime(recordingTime)}
                        </div>
                        <div className="recording-status">
                          Recording in progress...
                        </div>
                        <button 
                          onClick={stopRecording}
                          className="btn btn-primary"
                        >
                          <i className="fas fa-stop"></i> Stop Recording
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="voice-recording-icon ready">
                          <i className="fas fa-microphone"></i>
                        </div>
                        <div className="voice-recording-title">
                          Record Voice Note
                        </div>
                        <div className="voice-recording-description">
                          Share observations about pests, water levels, or growth issues
                        </div>
                        <button 
                          onClick={startRecording}
                          className="btn btn-primary"
                        >
                          <i className="fas fa-microphone"></i> Start Recording
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Observations Text Area */}
              <div className="upload-section">
                <h4 className="upload-section-title">
                  <i className="fas fa-edit"></i>
                  3. Written Observations (Optional)
                </h4>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Add any additional notes about crop health, weather conditions, fertilizer usage, or other observations..."
                  className="observations-textarea"
                />
              </div>

              {/* Location Verification */}
              <div className="upload-section">
                <h4 className="upload-section-title">
                  <i className="fas fa-map-marker-alt"></i>
                  4. Location Verification
                </h4>
                <div className="location-verification">
                  <div className="location-content">
                    <div className="location-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="location-details">
                      <div className="location-title">
                        Location Verified
                      </div>
                      <div className="location-coordinates">
                        GPS coordinates: 16.5062° N, 80.6480° E
                      </div>
                      <div className="location-status">
                        <i className="fas fa-satellite"></i> Strong GPS signal • Within 5m of farm boundaries
                      </div>
                    </div>
                    <button className="refresh-location-btn">
                      <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="upload-progress-container">
                  <div className="upload-progress-header">
                    <span className="upload-progress-label">Uploading...</span>
                    <span className="upload-progress-percentage">{uploadProgress}%</span>
                  </div>
                  <div className="upload-progress-bar">
                    <div 
                      className="upload-progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="upload-processing">
                    <i className="fas fa-spinner fa-spin"></i>
                    Processing images and voice note...
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button 
                onClick={handleSubmitUpdate}
                disabled={isUploading}
                className={`btn btn-primary full-width ${isUploading ? 'uploading' : ''}`}
              >
                {isUploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Submitting Update...
                  </>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt"></i> Submit Stage Update
                  </>
                )}
              </button>

              {/* Requirements Info */}
              <div className="requirements-info">
                <div className="requirements-header">
                  <i className="fas fa-exclamation-circle"></i>
                  <div className="requirements-content">
                    <strong>Compliance Requirements:</strong> At least one photo per stage is required. 
                    Regular updates (every 15 days) help maintain 100% compliance score and ensure 
                    faster payment processing.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-seedling"></i>
              </div>
              <h3 className="empty-title">No Crop Selected</h3>
              <p className="empty-description">
                Please select a crop from the left panel to start providing updates.
              </p>
              <button 
                onClick={() => setSelectedCrop(MOCK_ACTIVE_CROPS[0])}
                className="btn btn-primary"
              >
                <i className="fas fa-seedling"></i> Select Ashwagandha
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// --- Harvest Component ---
function HarvestRequest({ navTo, showNotification }) {
  const handleHarvestRequest = () => {
    if (showNotification) {
      showNotification(
        'Harvest Requested',
        'Your harvest request has been submitted. Collector will be assigned within 24 hours.',
        NOTIFICATION_TYPES.SUCCESS
      );
    }
    alert('Harvest request submitted!');
    navTo('dashboard');
  };

  return (
    <div className="fade-in">
      <button 
        onClick={() => navTo('dashboard')} 
        className="back-button"
      >
        <i className="fas fa-arrow-left"></i> Back
      </button>
      
      <h2 className="page-title">Harvest Request</h2>
      <Card>
        <div className="harvest-alert">
          <i className="fas fa-clock"></i>
          <div>
            <strong>Ashwagandha - Ready</strong>
            <div>Est Yield: 500kg</div>
          </div>
        </div>
        <button className="btn btn-primary full-width" onClick={handleHarvestRequest}>
          Request Collection
        </button>
      </Card>
    </div>
  );
}

// --- Main App Component ---
function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Notification state variables
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [toastNotifications, setToastNotifications] = useState([]);
  const [storedNotifications, setStoredNotifications] = useState([
    {
      id: 1,
      title: 'Harvest Scheduled',
      message: 'Collector Suresh Patil will arrive on Dec 10, 2025 for Ashwagandha harvest',
      type: NOTIFICATION_TYPES.SUCCESS,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false
    },
    {
      id: 2,
      title: 'Crop Update Required',
      message: 'Please upload Stage 2 photos for Ashwagandha crop',
      type: NOTIFICATION_TYPES.WARNING,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false
    },
    {
      id: 3,
      title: 'Registration Approved',
      message: 'Your Tulsi crop registration has been approved by AYUSH authorities',
      type: NOTIFICATION_TYPES.INFO,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      read: true
    },
    {
      id: 4,
      title: 'Payment Received',
      message: '₹45,000 payment for Ashwagandha batch processed',
      type: NOTIFICATION_TYPES.SUCCESS,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      read: true
    }
  ]);

  // Notification functions
  const showNotification = (title, message, type = NOTIFICATION_TYPES.INFO) => {
    const id = Date.now();
    const newNotification = {
      id,
      title,
      message,
      type,
      timestamp: new Date().toISOString()
    };
    
    setToastNotifications(prev => [...prev, newNotification]);
    
    setStoredNotifications(prev => [{
      ...newNotification,
      read: false
    }, ...prev]);
  };

  const closeToastNotification = (id) => {
    setToastNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
    setShowProfileDropdown(false);
  };

  const markAllAsRead = () => {
    setStoredNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const markNotificationAsRead = (id) => {
    setStoredNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setStoredNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Auto show welcome notification on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      showNotification(
        'Welcome Back!',
        'Your compliance score is 95%. Keep up the good work!',
        NOTIFICATION_TYPES.SUCCESS
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle click outside notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-container') && !event.target.closest('.notification-bell-container')) {
        setShowProfileDropdown(false);
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowNotificationDropdown(false);
  };

  const navTo = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome navTo={navTo} showNotification={showNotification} />;
      case 'register':
        return <RegisterCropForm navTo={navTo} showNotification={showNotification} />;
      case 'updates':
        return <CropUpdates navTo={navTo} showNotification={showNotification} />;
      case 'harvest':
        return <HarvestRequest navTo={navTo} showNotification={showNotification} />;
      default:
        return <DashboardHome navTo={navTo} showNotification={showNotification} />;
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notifications Container */}
      <div className="notifications-container">
        {toastNotifications.map(notification => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => closeToastNotification(notification.id)}
          />
        ))}
      </div>

      {/* Header Image */}
      <div className="header">
        <div className="header_img">
          <img src="https://i.herbalreality.com/wp-content/uploads/2024/09/01151754/Ecological-farming-for-medicinal-herbs.jpg" alt="farmer"/>
        </div>
      </div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => navTo('dashboard')}>
            <div className="logo-icon float-animation">
              <i className="fas fa-leaf"></i>
            </div>
            <div className="logo-text">
              <h1>AyuSethu</h1>
              <span>Farmer Portal</span>
            </div>
          </div>

          <div className="profile-container">
            {/* Notification Bell */}
            <div className="notification-bell-container">
              <button className="notification-btn" onClick={toggleNotificationDropdown}>
                <BellRing className="notification-icon" style={{ width: '20px', height: '20px' }} />
                {storedNotifications.filter(n => !n.read).length > 0 && (
                  <span className="badge-count">
                    {storedNotifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              
              {showNotificationDropdown && (
                <NotificationDropdown
                  notifications={storedNotifications}
                  onClose={() => setShowNotificationDropdown(false)}
                  onMarkAllAsRead={markAllAsRead}
                  onMarkAsRead={markNotificationAsRead}
                  onDeleteNotification={deleteNotification}
                />
              )}
            </div>

            {/* Profile Button */}
            <button className="profile-btn" onClick={toggleProfileDropdown}>
              <img src={USER_DATA.profileImg} alt="Profile" className="profile-img" />
              <span>{USER_DATA.name}</span>
              <i className={`fas fa-chevron-${showProfileDropdown ? 'up' : 'down'}`}></i>
            </button>

            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <i className={isMobileMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
            </button>

            {/* Profile Dropdown */}
            <div className={`profile-dropdown ${showProfileDropdown ? 'active' : ''}`}>
              <div className="dropdown-header">
                <img src={USER_DATA.profileImg} alt="Profile" className="dropdown-profile-img" />
                <div className="dropdown-info">
                  <h3>{USER_DATA.name}</h3>
                  <p>{USER_DATA.location}</p>
                </div>
              </div>
              <div className="dropdown-content">
                <button className="dropdown-item">
                  <i className="fas fa-id-card"></i>
                  <div>
                    <strong>Farmer ID</strong>
                    <div className="dropdown-subtext">{USER_DATA.farmerId}</div>
                  </div>
                </button>
                <button className="dropdown-item">
                  <i className="fas fa-chart-line"></i>
                  <div>
                    <strong>Compliance Score</strong>
                    <div className="dropdown-subtext">{USER_DATA.complianceScore}%</div>
                  </div>
                </button>
              </div>
              <div className="dropdown-footer">
                <button className="btn btn-secondary">
                  Edit
                </button>
                <button className="btn btn-primary">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content fade-in">
        {renderContent()}
      </main>
    </div>
  );
}

export default FarmerDashboard;