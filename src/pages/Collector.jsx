import React, { useState, useEffect } from "react";
import "../styles/Collector.css";
import { Bell, X, CheckCircle, AlertCircle, MapPin, Camera } from 'lucide-react';

const STAGE_DATA = [
  {
    id: 1,
    title: "Plantation Documentation",
    description: "Initial plantation images, leaf health verification and geo-tagging for origin trail",
    icon: "📸"
  },
  {
    id: 2,
    title: "Farmer Engagement",
    description: "Farmer receives instructions, safety guidelines and schedule via SMS/App",
    icon: "👨‍🌾"
  },
  {
    id: 3,
    title: "Growth Verification",
    description: "On-field growth monitoring and quality assessment by collector",
    icon: "🌱"
  },
  {
    id: 4,
    title: "Harvest Scheduling",
    description: "Harvest timing coordination and equipment preparation with farmer",
    icon: "📅"
  },
  {
    id: 5,
    title: "Final Verification",
    description: "Final harvest images, drying verification & dispatch authorization",
    icon: "✅"
  }
];

const NOTIFICATIONS = [
  {
    id: 1,
    type: "admin",
    title: "New Quality Standards Update",
    message: "Updated AAA grading criteria effective from Nov 15th",
    time: "2 hours ago",
    read: false
  },
  {
    id: 2,
    type: "tester",
    title: "Lab Test Results Ready",
    message: "Batch BATCH-2024-7283 passed all quality tests",
    time: "1 day ago",
    read: false
  },
  {
    id: 3,
    type: "system",
    title: "Weather Alert",
    message: "Heavy rain predicted in South region tomorrow",
    time: "2 days ago",
    read: true
  },
  {
    id: 4,
    type: "admin",
    title: "Monthly Collection Target",
    message: "You've achieved 85% of monthly target",
    time: "3 days ago",
    read: true
  },
  {
    id: 5,
    type: "tester",
    title: "Sample Rejection",
    message: "Batch BATCH-2024-7251 rejected due to moisture content",
    time: "5 days ago",
    read: true
  }
];

function App() {
  const [form, setForm] = useState({
    herb: "Tulsi (Holy Basil)",
    qty: "25.5",
    date: "",
    plot: "Plot 5B – Valley North",
    quality: "Premium (AAA)",
    weather: "Clear · 26°C · Humidity 65%",
    gps: "68.165408, 114.720211",
    notes: "Early morning harvest, no spray in last 30 days, leaves hand-plucked. Optimal sunlight exposure throughout growth cycle."
  });

  const [stage1Form, setStage1Form] = useState({
    farmerName: "",
    fid: "",
    visitDate: "",
    geotag: "",
    notes: "",
    species: "",
    estimatedQty: "",
    farmPhoto: null
  });

  const [stage5Form, setStage5Form] = useState({
    batchId: "BATCH-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 10000),
    finalHarvestDate: "",
    finalQuantity: "",
    sampleCollected: false,
    finalPhoto: null,
    finalGeotag: "",
    dispatchAuth: false
  });

  const [currentStage, setCurrentStage] = useState(1);
  const [stageStatus, setStageStatus] = useState(["current", "waiting", "waiting", "waiting", "waiting"]);
  const [toast, setToast] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState("stage1");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setForm(f => ({ ...f, date: today }));
    setStage1Form(s => ({ ...s, visitDate: today }));
    setStage5Form(s => ({ ...s, finalHarvestDate: today }));
  }, []);

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateStage1Form = (key, value) => {
    setStage1Form(prev => ({ ...prev, [key]: value }));
  };

  const updateStage5Form = (key, value) => {
    setStage5Form(prev => ({ ...prev, [key]: value }));
  };

  const handleGPS = () => {
    setToast("📍 Capturing GPS location...");
    setTimeout(() => {
      const newGPS = `${(Math.random() * 90).toFixed(6)}, ${(Math.random() * 180).toFixed(6)}`;
      updateForm("gps", newGPS);
      setToast("✅ GPS location captured!");
    }, 800);
    setTimeout(() => setToast(""), 3000);
  };

  const handleStage1GPS = () => {
    setToast("📍 Capturing Farm GPS location...");
    setTimeout(() => {
      const newGPS = `${(Math.random() * 90).toFixed(6)}, ${(Math.random() * 180).toFixed(6)}`;
      updateStage1Form("geotag", newGPS);
      setToast("✅ Farm GPS location captured!");
    }, 800);
    setTimeout(() => setToast(""), 3000);
  };

  const handleStage5GPS = () => {
    setToast("📍 Capturing Final GPS location...");
    setTimeout(() => {
      const newGPS = `${(Math.random() * 90).toFixed(6)}, ${(Math.random() * 180).toFixed(6)}`;
      updateStage5Form("finalGeotag", newGPS);
      setToast("✅ Final GPS location captured!");
    }, 800);
    setTimeout(() => setToast(""), 3000);
  };

  const handlePhotoUpload = (stage, file) => {
    if (stage === 1) {
      updateStage1Form("farmPhoto", file);
      setToast("✅ Farm photo uploaded successfully!");
    } else if (stage === 5) {
      updateStage5Form("finalPhoto", file);
      setToast("✅ Final harvest photo uploaded!");
    }
    setTimeout(() => setToast(""), 3000);
  };

  const handleStageClick = (stageId) => {
    setCurrentStage(stageId);
    setActiveTab(`stage${stageId}`);
    setToast(`📋 Switched to Stage ${stageId}`);
    setTimeout(() => setToast(""), 3000);
  };

  const markStageDone = (stageId) => {
    const newStatus = [...stageStatus];
    newStatus[stageId - 1] = "done";
    if (stageId < 5) newStatus[stageId] = "current";
    setStageStatus(newStatus);

    setToast(`✅ Stage ${stageId} completed!`);
    setTimeout(() => setToast(""), 3000);

    if (stageId === 5) {
      setTimeout(() => {
        setToast("🎉 Batch completed and ready for dispatch!");
      }, 500);
    }
  };

  const handleCreateBatch = () => {
    setToast("🌿 Creating new herb batch...");
    setTimeout(() => {
      // Generate new batch ID
      const newBatchId = `BATCH-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
      updateStage5Form("batchId", newBatchId);

      setToast(`✅ New batch created: ${newBatchId}`);
      // Move to stage 2
      const newStatus = [...stageStatus];
      newStatus[0] = "done";
      newStatus[1] = "current";
      setStageStatus(newStatus);
      setCurrentStage(2);
      setActiveTab("stage2");
    }, 1000);

    setTimeout(() => setToast(""), 4000);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    // Mark all as read when opening
    if (!showNotifications) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "admin": return "👨‍💼";
      case "tester": return "🔬";
      case "system": return "⚙️";
      default: return "📢";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getStatusText = (status) => {
    switch (status) {
      case "done": return "COMPLETED";
      case "current": return "IN PROGRESS";
      default: return "PENDING";
    }
  };

  const renderTimelineItem = (stage) => {
    const status = stageStatus[stage.id - 1];

    return (
      <div
        key={stage.id}
        className={`vhc-timeline-item ${status === "current" ? "vhc-timeline-item-current" : ""}`}
        onClick={() => handleStageClick(stage.id)}
      >
        <div className={`vhc-timeline-dot ${status}`}>
          {status === "done" ? "✓" : stage.id}
        </div>
        <div className="vhc-timeline-content">
          <div className="vhc-timeline-stage">
            <span className="vhc-timeline-stage-icon">{stage.icon}</span>
            {stage.title}
          </div>
          <div className="vhc-timeline-desc">
            {stage.description}
          </div>
          <div className={`vhc-timeline-status ${status}`}>
            {getStatusText(status)}
          </div>
        </div>
        {status === "current" && (
          <button
            className="vhc-mark-done-btn"
            onClick={(e) => {
              e.stopPropagation();
              markStageDone(stage.id);
            }}
          >
            Mark Complete
          </button>
        )}
      </div>
    );
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 1:
        return (
          <div className="vhc-stage-content">
            <h3 className="vhc-stage-title">Stage 1: Plantation Documentation</h3>
            <p className="vhc-stage-subtitle">Collect initial farm data and documentation</p>

            <div className="vhc-form-grid">
              <div className="vhc-field">
                <label className="vhc-label">
                  Farmer Name <span className="vhc-required">*</span>
                </label>
                <input
                  className="vhc-input"
                  type="text"
                  value={stage1Form.farmerName}
                  onChange={(e) => updateStage1Form("farmerName", e.target.value)}
                  placeholder="Enter farmer's full name"
                />
              </div>

              <div className="vhc-field">
                <label className="vhc-label">
                  Farmer ID (FID) <span className="vhc-required">*</span>
                </label>
                <input
                  className="vhc-input"
                  type="text"
                  value={stage1Form.fid}
                  onChange={(e) => updateStage1Form("fid", e.target.value)}
                  placeholder="Enter FID"
                />
              </div>

              <div className="vhc-field">
                <label className="vhc-label">
                  Visit Date <span className="vhc-required">*</span>
                </label>
                <input
                  className="vhc-input"
                  type="date"
                  value={stage1Form.visitDate}
                  onChange={(e) => updateStage1Form("visitDate", e.target.value)}
                />
              </div>

              <div className="vhc-field">
                <label className="vhc-label">
                  Herb Species <span className="vhc-required">*</span>
                </label>
                <select
                  className="vhc-select"
                  value={stage1Form.species}
                  onChange={(e) => updateStage1Form("species", e.target.value)}
                >
                  <option value="">Select species</option>
                  <option value="Tulsi (Holy Basil)">Tulsi (Holy Basil)</option>
                  <option value="Ashwagandha">Ashwagandha</option>
                  <option value="Neem">Neem</option>
                  <option value="Brahmi">Brahmi</option>
                  <option value="Turmeric">Turmeric</option>
                </select>
              </div>

              <div className="vhc-field">
                <label className="vhc-label">
                  Estimated Quantity (kg) <span className="vhc-required">*</span>
                </label>
                <input
                  className="vhc-input"
                  type="number"
                  value={stage1Form.estimatedQty}
                  min="0"
                  step="0.1"
                  placeholder="e.g., 25.5"
                  onChange={(e) => updateStage1Form("estimatedQty", e.target.value)}
                />
              </div>

              <div className="vhc-field vhc-field-full">
                <label className="vhc-label">
                  GPS Location <span className="vhc-required">*</span>
                </label>
                <div className="vhc-gps-row">
                  <input
                    className="vhc-input vhc-gps-input"
                    value={stage1Form.geotag}
                    readOnly
                    placeholder="Click Capture GPS to get location"
                  />
                  <button
                    type="button"
                    className="vhc-btn vhc-btn-secondary"
                    onClick={handleStage1GPS}
                  >
                    <MapPin size={16} /> Capture GPS
                  </button>
                </div>
              </div>

              <div className="vhc-field vhc-field-full">
                <label className="vhc-label">Farm Photo</label>
                <div className="vhc-photo-upload">
                  {stage1Form.farmPhoto ? (
                    <div className="vhc-photo-preview">
                      <img src={URL.createObjectURL(stage1Form.farmPhoto)} alt="Farm preview" />
                      <button
                        className="vhc-remove-photo"
                        onClick={() => updateStage1Form("farmPhoto", null)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="vhc-upload-area">
                      <Camera size={24} />
                      <span>Click to upload farm photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(1, e.target.files[0])}
                        hidden
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="vhc-field vhc-field-full">
                <label className="vhc-label">Notes & Observations</label>
                <textarea
                  className="vhc-textarea"
                  value={stage1Form.notes}
                  onChange={(e) => updateStage1Form("notes", e.target.value)}
                  placeholder="Record your observations about soil health, plant condition, pests, etc."
                  rows="4"
                />
              </div>
            </div>

            <div className="vhc-create-batch-section">
              <button
                className="vhc-create-batch-btn"
                onClick={handleCreateBatch}
                disabled={!stage1Form.farmerName || !stage1Form.fid || !stage1Form.species}
              >
                <CheckCircle size={20} /> Create New Herb Batch
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="vhc-stage-content">
            <h3 className="vhc-stage-title">Stage 5: Final Verification</h3>
            <p className="vhc-stage-subtitle">Complete final documentation before dispatch</p>

            <div className="vhc-form-grid">
              <div className="vhc-field">
                <label className="vhc-label">Batch ID</label>
                <input
                  className="vhc-input"
                  type="text"
                  value={stage5Form.batchId}
                  readOnly
                />
              </div>

              <div className="vhc-field">
                <label className="vhc-label">
                  Final Harvest Date <span className="vhc-required">*</span>
                </label>
                <input
                  className="vhc-input"
                  type="date"
                  value={stage5Form.finalHarvestDate}
                  onChange={(e) => updateStage5Form("finalHarvestDate", e.target.value)}
                />
              </div>

              <div className="vhc-field">
                <label className="vhc-label">
                  Final Quantity (kg) <span className="vhc-required">*</span>
                </label>
                <input
                  className="vhc-input"
                  type="number"
                  value={stage5Form.finalQuantity}
                  min="0"
                  step="0.1"
                  placeholder="Enter actual harvested quantity"
                  onChange={(e) => updateStage5Form("finalQuantity", e.target.value)}
                />
              </div>

              <div className="vhc-field">
                <label className="vhc-label">Sample Collected</label>
                <div className="vhc-checkbox-group">
                  <label className="vhc-checkbox-label">
                    <input
                      type="checkbox"
                      checked={stage5Form.sampleCollected}
                      onChange={(e) => updateStage5Form("sampleCollected", e.target.checked)}
                      className="vhc-checkbox"
                    />
                    <span>Lab sample collected</span>
                  </label>
                </div>
              </div>

              <div className="vhc-field vhc-field-full">
                <label className="vhc-label">
                  Final GPS Location <span className="vhc-required">*</span>
                </label>
                <div className="vhc-gps-row">
                  <input
                    className="vhc-input vhc-gps-input"
                    value={stage5Form.finalGeotag}
                    readOnly
                    placeholder="Click Capture GPS to get location"
                  />
                  <button
                    type="button"
                    className="vhc-btn vhc-btn-secondary"
                    onClick={handleStage5GPS}
                  >
                    <MapPin size={16} /> Capture GPS
                  </button>
                </div>
              </div>

              <div className="vhc-field vhc-field-full">
                <label className="vhc-label">Final Harvest Photo</label>
                <div className="vhc-photo-upload">
                  {stage5Form.finalPhoto ? (
                    <div className="vhc-photo-preview">
                      <img src={URL.createObjectURL(stage5Form.finalPhoto)} alt="Final harvest preview" />
                      <button
                        className="vhc-remove-photo"
                        onClick={() => updateStage5Form("finalPhoto", null)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="vhc-upload-area">
                      <Camera size={24} />
                      <span>Click to upload final harvest photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(5, e.target.files[0])}
                        hidden
                      />
                    </label>
                  )}
                </div>
                <div className="verify">
                  <button onClick={() => alert('Aswaganda Verified.')}>Verify</button>
                </div>

              </div>

              <div className="vhc-field">
                <label className="vhc-label">Dispatch Authorization</label>
                <div className="vhc-checkbox-group">
                  <label className="vhc-checkbox-label">
                    <input
                      type="checkbox"
                      checked={stage5Form.dispatchAuth}
                      onChange={(e) => updateStage5Form("dispatchAuth", e.target.checked)}
                      className="vhc-checkbox"
                    />
                    <span>Authorize dispatch</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="vhc-final-verification">
              <button
                className="vhc-create-batch-btn"
                onClick={() => markStageDone(5)}
                disabled={!stage5Form.finalHarvestDate || !stage5Form.finalQuantity}
              >
                <CheckCircle size={20} /> Complete Final Verification
              </button>
              <p className="vhc-verification-note">
                Note: Once verified, batch will be locked and sent for processing
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="vhc-stage-content">
            <h3 className="vhc-stage-title">Stage {currentStage}: {STAGE_DATA[currentStage - 1]?.title}</h3>
            <p className="vhc-stage-subtitle">{STAGE_DATA[currentStage - 1]?.description}</p>
            <div className="vhc-stage-placeholder">
              <p>Stage {currentStage} content will appear here. Click "Mark Complete" when done.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="vhc-toast">
          <span className="vhc-toast-icon">
            {toast.includes("📍") ? "📍" :
              toast.includes("✅") ? "✅" :
                toast.includes("📋") ? "📋" :
                  toast.includes("🎉") ? "🎉" :
                    toast.includes("🌿") ? "🌿" : "📡"}
          </span>
          <div className="vhc-toast-content">
            {toast.replace(/[📍✅📋🎉🌿📡]/g, '').trim()}
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="vhc-navbar">
        <div className="vhc-navbar-left">
          <div className="vhc-nav-logo">🌿 VirtuHerbChain</div>
        </div>

        <div className="vhc-navbar-right">
          <div className="vhc-notification-container">
            <button
              className="vhc-notification-btn"
              onClick={toggleNotifications}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="vhc-notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="vhc-notification-dropdown">
                <div className="vhc-notification-header">
                  <h4>Notifications</h4>
                  <button
                    className="vhc-notification-close"
                    onClick={toggleNotifications}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="vhc-notification-tabs">
                  <button
                    className={`vhc-notification-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    All
                  </button>
                  <button
                    className={`vhc-notification-tab ${activeTab === 'admin' ? 'active' : ''}`}
                    onClick={() => setActiveTab('admin')}
                  >
                    Admin
                  </button>
                  <button
                    className={`vhc-notification-tab ${activeTab === 'tester' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tester')}
                  >
                    Tester
                  </button>
                </div>

                <div className="vhc-notification-list">
                  {notifications
                    .filter(n => activeTab === 'all' || n.type === activeTab)
                    .map(notification => (
                      <div
                        key={notification.id}
                        className={`vhc-notification-item ${!notification.read ? 'unread' : ''}`}
                      >
                        <div className="vhc-notification-icon">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="vhc-notification-content">
                          <div className="vhc-notification-title">
                            {notification.title}
                          </div>
                          <div className="vhc-notification-message">
                            {notification.message}
                          </div>
                          <div className="vhc-notification-time">
                            {notification.time}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="vhc-user-profile">
            <div className="vhc-user-avatar">CO</div>
            <div className="vhc-user-info">
              <div className="vhc-user-name">Collector #7421</div>
              <div className="vhc-user-role">Senior Field Officer</div>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="vhc-header">
        <div className="vhc-hero-image">
          <img
            src="https://media.assettype.com/knocksense%2F2022-08%2F05cd04ec-388c-40d7-ac05-c55b02d14a2d%2F5935_8_10_2021_19_36_13_2_08102021YVU1.jpeg"
            alt="Herb farm landscape"
          />
          <div className="vhc-hero-overlay">
            <div className="vhc-hero-content">
              <h1 className="vhc-hero-title">VirtuHerbChain Collector Portal</h1>
              <p className="vhc-hero-subtitle">Ayurvedic Traceability & Quality Assurance System</p>
              <div className="vhc-hero-stats">
                <div className="vhc-stat">
                  <div className="vhc-stat-value">18</div>
                  <div className="vhc-stat-label">Active Batches</div>
                </div>
                <div className="vhc-stat">
                  <div className="vhc-stat-value">94%</div>
                  <div className="vhc-stat-label">Quality Score</div>
                </div>
                <div className="vhc-stat">
                  <div className="vhc-stat-value">28</div>
                  <div className="vhc-stat-label">Farmers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="vhc-main">
        <div className="vhc-grid">
          {/* LEFT PANEL: STAGE CONTENT */}
          <section className="vhc-card vhc-stage-card">
            {renderStageContent()}
          </section>

          {/* RIGHT PANEL: TIMELINE & PREVIEW */}
          <aside className="vhc-card">
            <div className="vhc-timeline-header">
              <h2 className="vhc-timeline-title">Batch Integrity Timeline</h2>
              <p className="vhc-timeline-subtitle">
                Track progress through all stages. Click any stage to manage.
              </p>
            </div>

            <div className="vhc-timeline-container">
              <div className="vhc-timeline-line" />
              <div>
                {STAGE_DATA.map((stage) => renderTimelineItem(stage))}
              </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className="vhc-live-preview">
              <h3 className="vhc-live-preview-title">Live Batch Preview</h3>

              <div className="vhc-preview-container">
                {currentStage === 1 ? (
                  <div className="vhc-preview-grid">
                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Farmer Name</div>
                      <div className="vhc-preview-value">
                        {stage1Form.farmerName || <span className="vhc-preview-empty">Not entered</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Farmer ID</div>
                      <div className="vhc-preview-value">
                        {stage1Form.fid || <span className="vhc-preview-empty">Not entered</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Visit Date</div>
                      <div className="vhc-preview-value">
                        {stage1Form.visitDate ? new Date(stage1Form.visitDate).toLocaleDateString('en-GB') :
                          <span className="vhc-preview-empty">Not set</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Species</div>
                      <div className="vhc-preview-value">
                        {stage1Form.species || <span className="vhc-preview-empty">Not selected</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Estimated Qty</div>
                      <div className="vhc-preview-value">
                        {stage1Form.estimatedQty ? `${stage1Form.estimatedQty} kg` :
                          <span className="vhc-preview-empty">Not estimated</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">GPS Location</div>
                      <div className="vhc-preview-value vhc-preview-gps">
                        {stage1Form.geotag || <span className="vhc-preview-empty">Not captured</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-notes">
                      <div className="vhc-notes-label">Observations</div>
                      <div className="vhc-notes-content">
                        {stage1Form.notes || <span className="vhc-preview-empty">No observations added</span>}
                      </div>
                    </div>
                  </div>
                ) : currentStage === 5 ? (
                  <div className="vhc-preview-grid">
                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Batch ID</div>
                      <div className="vhc-preview-value vhc-preview-batchid">
                        {stage5Form.batchId}
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Final Harvest Date</div>
                      <div className="vhc-preview-value">
                        {stage5Form.finalHarvestDate ? new Date(stage5Form.finalHarvestDate).toLocaleDateString('en-GB') :
                          <span className="vhc-preview-empty">Not set</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Final Quantity</div>
                      <div className="vhc-preview-value">
                        {stage5Form.finalQuantity ? `${stage5Form.finalQuantity} kg` :
                          <span className="vhc-preview-empty">Not recorded</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Sample Collected</div>
                      <div className="vhc-preview-value">
                        <span className={`vhc-preview-status-badge ${stage5Form.sampleCollected ? 'success' : 'pending'}`}>
                          {stage5Form.sampleCollected ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Dispatch Auth</div>
                      <div className="vhc-preview-value">
                        <span className={`vhc-preview-status-badge ${stage5Form.dispatchAuth ? 'success' : 'pending'}`}>
                          {stage5Form.dispatchAuth ? 'Authorized' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Final GPS</div>
                      <div className="vhc-preview-value vhc-preview-gps">
                        {stage5Form.finalGeotag || <span className="vhc-preview-empty">Not captured</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-photo">
                      <div className="vhc-notes-label">Final Photo</div>
                      <div className="vhc-photo-status">
                        {stage5Form.finalPhoto ? (
                          <span className="vhc-photo-uploaded">✅ Photo uploaded</span>
                        ) : (
                          <span className="vhc-preview-empty">No photo uploaded</span>
                        )}
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="vhc-preview-grid">
                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Herb Name</div>
                      <div className="vhc-preview-value">
                        {form.herb || <span className="vhc-preview-empty">Not selected</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Harvest Date</div>
                      <div className="vhc-preview-value">
                        {form.date ? new Date(form.date).toLocaleDateString('en-GB') :
                          <span className="vhc-preview-empty">Not set</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Quality Grade</div>
                      <div className="vhc-preview-value">
                        {form.quality || <span className="vhc-preview-empty">Not graded</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Quantity</div>
                      <div className="vhc-preview-value">
                        {form.qty ? `${form.qty} kg` : <span className="vhc-preview-empty">Not specified</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">Weather</div>
                      <div className="vhc-preview-value">
                        {form.weather || <span className="vhc-preview-empty">Not recorded</span>}
                      </div>
                    </div>

                    <div className="vhc-preview-item">
                      <div className="vhc-preview-label">GPS Location</div>
                      <div className="vhc-preview-value vhc-preview-gps">
                        {form.gps === "Not captured" ?
                          <span className="vhc-preview-empty">Not captured</span> :
                          form.gps}
                      </div>
                    </div>

                    <div className="vhc-preview-notes">
                      <div className="vhc-notes-label">Collector Notes</div>
                      <div className="vhc-notes-content">
                        {form.notes || <span className="vhc-preview-empty">No notes added</span>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="vhc-preview-status">
                  <div className="vhc-preview-status-icon">
                    {stageStatus[currentStage - 1] === "done" ? "✅" :
                      stageStatus[currentStage - 1] === "current" ? "🔄" : "⏳"}
                  </div>
                  <div className="vhc-preview-status-text">
                    <div className="vhc-preview-status-title">
                      Stage {currentStage}: {STAGE_DATA[currentStage - 1]?.title}
                    </div>
                    <div className="vhc-preview-status-subtitle">
                      Status: {getStatusText(stageStatus[currentStage - 1])}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

export default App;