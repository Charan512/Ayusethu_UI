import React, { useState, useEffect } from 'react';
import '../styles/Manufacturer.css';
import api from "../api/adminApi"; 
import { useAuth } from "../context/AuthContext"; // ✅ STEP 3: Auth context

const Manufacturer = () => {
  // ✅ STEP 3: Get manufacturer ID from auth
  const { user } = useAuth();

  // State for different phases
  const [activePhase, setActivePhase] = useState('receive');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBarcodeImage, setShowBarcodeImage] = useState(false);

  const [showProfileCard, setShowProfileCard] = useState(false);

  const [quoteForm, setQuoteForm] = useState({
    manufacturerID: user?.id || '', // ✅ STEP 3: Get from auth, not hardcoded
    batchID: '',
    quoteAmount: '',
    validityTime: '',
    notes: ''
  });
  const [manufacturingForm, setManufacturingForm] = useState({
    receivedQuantity: '',
    receivedTimestamp: '',
    washingDate: '',
    dryingDate: '',
    dryingTemp: '',
    grindingDate: '',
    extractionMethod: '',
    extractionDetails: '',
    storageConditions: '',
    finalQuantity: '',
    productForm: 'powder',
    manufacturingCertificate: null,
    manufacturingPhotos: [],
    geoTag: '',
    batchNumber: ''
  });
  const [packagingForm, setPackagingForm] = useState({
    labelID: '',
    printedTimestamp: '',
    packagingBatchNumber: '',
    packagingPhotos: []
  });

  // ❌ FIX 1: REMOVE MOCK NOTIFICATIONS
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // ✅ STEP 2: FETCH REAL BATCHES FROM BACKEND
  useEffect(() => {
    fetchAssignedBatches();
    fetchNotifications(); // ✅ FIX 1: Fetch notifications
  }, []);

  // ✅ FIX 2: Batch field normalization adapter
  const normalizeBatch = (b) => ({
    id: b.batch_id,
    batch_id: b.batch_id, // ✅ FIX 3: Keep both for consistency
    name: b.herb_name || 'Unknown Herb',
    herbType: b.species || 'Herbal',
    quantity: b.quantity || 0,
    testScore: b.lab_data?.results?.score ?? 0,
    testResults: b.lab_data?.results?.status || 'Pending',
    testDetails: b.lab_data?.results || {},
    farmerName: b.farmer_name || 'Unknown',
    farmLocation: b.location || 'Unknown',
    pickupInstructions: b.pickup_instructions || 'Contact admin for details',
    quoteDeadline: b.quote_deadline || 'N/A',
    status: b.status,
    manufacturer_data: b.manufacturer_data,
  });

  const fetchAssignedBatches = async () => {
    const res = await api.get("/api/manufacturer/batches");
    const visibleBatches = res.data.filter(b =>
      b.status === "bidding_open" ||
      b.manufacturer_data?.id === user.id
    );

    setBatches(visibleBatches.map(normalizeBatch));
  };


  // ✅ FIX 1: Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  // NOTIFICATION FUNCTIONS - ADDED
  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  // Update notification count when notifications change
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setNotificationCount(unreadCount);
  }, [notifications]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.vhc-notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showProfileMenu &&
        !event.target.closest(".vhc-user-profile")
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showProfileMenu]);

  // Handle batch selection
  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
    setQuoteForm(prev => ({ ...prev, batchID: batch.id }));
  };

  // ✅ STEP 4: WIRE QUOTE SUBMISSION TO BACKEND
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/manufacturer/submit-quote", {
        batch_id: quoteForm.batchID,
        price: Number(quoteForm.quoteAmount),
        validity: quoteForm.validityTime,
        notes: quoteForm.notes,
      });

      alert("Quote submitted successfully. Waiting for admin selection.");
      setActivePhase('receive');
      await fetchAssignedBatches();
    } catch (err) {
      console.error("Quote submission failed:", err);
      alert("Failed to submit quote");
    }
  };

  // Handle manufacturing form changes
  const handleManufacturingChange = (field, value) => {
    setManufacturingForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle file upload
  const handleFileUpload = (field, files) => {
    if (field === 'manufacturingCertificate') {
      setManufacturingForm(prev => ({ ...prev, manufacturingCertificate: files[0] }));
    } else if (field === 'manufacturingPhotos') {
      setManufacturingForm(prev => ({ ...prev, manufacturingPhotos: [...prev.manufacturingPhotos, ...files] }));
    } else if (field === 'packagingPhotos') {
      setPackagingForm(prev => ({ ...prev, packagingPhotos: [...prev.packagingPhotos, ...files] }));
    }
  };
  const relevantNotifications = notifications.filter(n =>
    n.role === "Manufacturer"
  );
  
  // ✅ STEP 5: MANUFACTURING SUBMISSION (CRITICAL)
  const handleManufacturingSubmit = async () => {
    try {
      const formData = new FormData();

      Object.entries(manufacturingForm).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => formData.append(key, v));
        } else if (value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      formData.append("batch_id", selectedBatch.batch_id); // ✅ FIX 3: Use batch_id

      await api.post("/api/manufacturer/submit-manufacturing", formData);

      alert("Manufacturing data submitted");
      setActivePhase('packaging');
    } catch (err) {
      console.error("Manufacturing submission failed:", err);
      alert("Manufacturing submission failed");
    }
  };

  // ✅ STEP 7: FINAL PACKAGING SUBMISSION
  const handlePackagingSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("batch_id", selectedBatch.batch_id); // ✅ FIX 3: Use batch_id
      formData.append("printedTimestamp", packagingForm.printedTimestamp);

      packagingForm.packagingPhotos.forEach(p =>
        formData.append("photos", p)
      );

      await api.post("/api/manufacturer/complete-packaging", formData);

      alert("Packaging completed & product sealed");
      await fetchAssignedBatches();
    } catch (err) {
      console.error("Packaging submission failed:", err);
      alert("Packaging submission failed");
    }
  };

  // Render phase content
  const renderPhaseContent = () => {
    switch (activePhase) {
      case 'receive':
        return renderReceivePhase();
      case 'quote':
        return renderQuotePhase();
      case 'manufacturing':
        return renderManufacturingPhase();
      case 'packaging':
        return renderPackagingPhase();
      default:
        return renderReceivePhase();
    }
  };

  // Receive Phase
  const renderReceivePhase = () => (
    <div className="phase-content">
      <div className="phase-header">
        <div className="phase-icon">
          <i className="fas fa-inbox"></i>
        </div>
        <div>
          <h3>Batch Reception Dashboard</h3>
          <p>Review available batches, test results, and pickup instructions</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {batches.map(batch => (
          <div key={batch.id} className={`batch-card ${selectedBatch?.id === batch.id ? 'selected' : ''}`}
            onClick={() => handleBatchSelect(batch)}>
            <div className="batch-header">
              <div className="batch-id">{batch.id}</div>
              <span className={`status-badge ${batch.status}`}>
                {batch.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <h4 className="batch-name">{batch.name}</h4>

            <div className="batch-details">
              <div className="detail-row">
                <span className="detail-label">Herb Type:</span>
                <span className="detail-value">{batch.herbType}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Quantity:</span>
                <span className="detail-value">{batch.quantity} kg</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Test Score:</span>
                <span className="detail-value score">{batch.testScore}%</span>
              </div>
            </div>

            <div className="test-results">
              <div className="test-title">Test Results:</div>
              <div className="test-grid">
                {Object.entries(batch.testDetails).map(([test, result]) => (
                  <div key={test} className="test-item">
                    <span className="test-name">{test.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className={`test-result ${result.toLowerCase()}`}>{result}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pickup-instructions">
              <div className="instructions-title">
                <i className="fas fa-truck"></i> Pickup Instructions
              </div>
              <p>{batch.pickupInstructions}</p>
              <div className="farmer-info">
                <span><i className="fas fa-user"></i> {batch.farmerName}</span>
                <span><i className="fas fa-map-marker-alt"></i> {batch.farmLocation}</span>
              </div>
            </div>

            <div className="batch-actions">
              <button className="btn-secondary" onClick={(e) => {
                e.stopPropagation();
                setSelectedBatch(batch);
                setActivePhase('quote');
              }}>
                <i className="fas fa-file-invoice-dollar"></i> Submit Quote
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Quote Phase
  const renderQuotePhase = () => (
    <div className="phase-content">
      <div className="phase-header">
        <div className="phase-icon">
          <i className="fas fa-file-invoice-dollar"></i>
        </div>
        <div>
          <h3>Quotation Submission</h3>
          <p>Submit your quote for the selected batch</p>
        </div>
      </div>

      <div className="quote-form-container">
        <div className="quote-info-card">
          <div className="info-header">
            <h4>Batch Information</h4>
            {selectedBatch && <span className="batch-tag">{selectedBatch.id}</span>}
          </div>
          {selectedBatch && (
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Product:</span>
                <span className="info-value">{selectedBatch.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Quantity Available:</span>
                <span className="info-value">{selectedBatch.quantity} kg</span>
              </div>
              <div className="info-item">
                <span className="info-label">Test Score:</span>
                <span className="info-value score">{selectedBatch.testScore}%</span>
              </div>
              <div className="info-item">
                <span className="info-label">Quote Deadline:</span>
                <span className="info-value deadline">{selectedBatch.quoteDeadline}</span>
              </div>
            </div>
          )}
        </div>

        <form className="quote-form" onSubmit={handleQuoteSubmit}>
          <div className="form-group">
            <label>Manufacturer ID</label>
            <input
              type="text"
              value={quoteForm.manufacturerID}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label>Batch ID</label>
            <input
              type="text"
              value={quoteForm.batchID}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label>Quote Amount (INR/kg) *</label>
            <input
              type="number"
              value={quoteForm.quoteAmount}
              onChange={(e) => setQuoteForm(prev => ({ ...prev, quoteAmount: e.target.value }))}
              placeholder="Enter amount per kg"
              required
            />
          </div>

          <div className="form-group">
            <label>Validity Time *</label>
            <select
              value={quoteForm.validityTime}
              onChange={(e) => setQuoteForm(prev => ({ ...prev, validityTime: e.target.value }))}
              required
            >
              <option value="">Select validity period</option>
              <option value="24h">24 Hours</option>
              <option value="48h">48 Hours</option>
              <option value="72h">72 Hours</option>
              <option value="1w">1 Week</option>
              <option value="2w">2 Weeks</option>
            </select>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              value={quoteForm.notes}
              onChange={(e) => setQuoteForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special conditions or notes..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setActivePhase('receive')}>
              <i className="fas fa-arrow-left"></i> Back to Batches
            </button>
            <button type="submit" className="btn-primary">
              <i className="fas fa-paper-plane"></i> Submit Quote to Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Manufacturing Phase
  const renderManufacturingPhase = () => {
    if (!selectedBatch ||
      selectedBatch.status !== "manufacturing_assigned" ||
      selectedBatch.manufacturer_data?.id !== user.id) {
      return (
        <div className="phase-content">
          <p className="locked-text">
            You are not authorized to manufacture this batch.
          </p>
        </div>
      );
    }

    return (
      <div className="phase-content">
        <div className="phase-header">
          <div className="phase-icon">
            <i className="fas fa-industry"></i>
          </div>
          <div>
            <h3>Manufacturing Process</h3>
            <p>Record manufacturing steps after batch delivery</p>
          </div>
        </div>

        <div className="manufacturing-form">
          {/* Receiving Section */}
          <div className="form-section">
            <h4 className="section-title">
              <i className="fas fa-truck-loading"></i> Batch Receiving
            </h4>
            <div className="form-row">
              <div className="form-group">
                <label>Received Quantity (kg) *</label>
                <input
                  type="number"
                  value={manufacturingForm.receivedQuantity}
                  onChange={(e) => handleManufacturingChange('receivedQuantity', e.target.value)}
                  placeholder="Enter actual received quantity"
                  required
                />
              </div>
              <div className="form-group">
                <label>Received Timestamp *</label>
                <input
                  type="datetime-local"
                  value={manufacturingForm.receivedTimestamp}
                  onChange={(e) => handleManufacturingChange('receivedTimestamp', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="form-section">
            <h4 className="section-title">
              <i className="fas fa-cogs"></i> Processing Steps
            </h4>

            <div className="step-grid">
              <div className="step-card">
                <div className="step-icon washing">
                  <i className="fas fa-hand-sparkles"></i>
                </div>
                <h5>Washing</h5>
                <input
                  type="date"
                  value={manufacturingForm.washingDate}
                  onChange={(e) => handleManufacturingChange('washingDate', e.target.value)}
                  placeholder="Washing date"
                />
              </div>

              <div className="step-card">
                <div className="step-icon drying">
                  <i className="fas fa-sun"></i>
                </div>
                <h5>Drying</h5>
                <input
                  type="date"
                  value={manufacturingForm.dryingDate}
                  onChange={(e) => handleManufacturingChange('dryingDate', e.target.value)}
                  placeholder="Drying date"
                />
                <input
                  type="number"
                  value={manufacturingForm.dryingTemp}
                  onChange={(e) => handleManufacturingChange('dryingTemp', e.target.value)}
                  placeholder="Temperature (°C)"
                  className="temp-input"
                />
              </div>

              <div className="step-card">
                <div className="step-icon grinding">
                  <i className="fas fa-mortar-pestle"></i>
                </div>
                <h5>Grinding</h5>
                <input
                  type="date"
                  value={manufacturingForm.grindingDate}
                  onChange={(e) => handleManufacturingChange('grindingDate', e.target.value)}
                  placeholder="Grinding date"
                />
              </div>

              <div className="step-card">
                <div className="step-icon extraction">
                  <i className="fas fa-flask"></i>
                </div>
                <h5>Extraction</h5>
                <select
                  value={manufacturingForm.extractionMethod}
                  onChange={(e) => handleManufacturingChange('extractionMethod', e.target.value)}
                >
                  <option value="">Select method</option>
                  <option value="cold">Cold Extraction</option>
                  <option value="hot">Hot Extraction</option>
                  <option value="supercritical">Supercritical CO2</option>
                  <option value="solvent">Solvent Extraction</option>
                </select>
                <textarea
                  value={manufacturingForm.extractionDetails}
                  onChange={(e) => handleManufacturingChange('extractionDetails', e.target.value)}
                  placeholder="Extraction details..."
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Storage & Final Product */}
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label>Storage Conditions</label>
                <textarea
                  value={manufacturingForm.storageConditions}
                  onChange={(e) => handleManufacturingChange('storageConditions', e.target.value)}
                  placeholder="Temperature, humidity, packaging..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Final Product Quantity (kg) *</label>
                <input
                  type="number"
                  value={manufacturingForm.finalQuantity}
                  onChange={(e) => handleManufacturingChange('finalQuantity', e.target.value)}
                  placeholder="Enter final quantity"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Product Form *</label>
              <div className="product-form-options">
                {['powder', 'extract', 'capsules', 'tablets', 'syrup', 'oil'].map(form => (
                  <label key={form} className="form-option">
                    <input
                      type="radio"
                      name="productForm"
                      value={form}
                      checked={manufacturingForm.productForm === form}
                      onChange={(e) => handleManufacturingChange('productForm', e.target.value)}
                    />
                    <span className="option-label">{form.charAt(0).toUpperCase() + form.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Documentation */}
          <div className="form-section">
            <h4 className="section-title">
              <i className="fas fa-file-upload"></i> Documentation
            </h4>

            <div className="upload-grid">
              <div className="upload-card">
                <div className="upload-icon">
                  <i className="fas fa-file-certificate"></i>
                </div>
                <h5>Manufacturing Certificate</h5>
                <div className="file-upload">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => handleFileUpload('manufacturingCertificate', e.target.files)}
                    hidden
                    id="certificate-upload"
                  />
                  <label htmlFor="certificate-upload" className="upload-btn">
                    <i className="fas fa-cloud-upload-alt"></i> Upload Certificate
                  </label>
                  {manufacturingForm.manufacturingCertificate && (
                    <div className="file-preview">
                      <i className="fas fa-file-pdf"></i>
                      <span>{manufacturingForm.manufacturingCertificate.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="upload-card">
                <div className="upload-icon">
                  <i className="fas fa-camera"></i>
                </div>
                <h5>Manufacturing Photos</h5>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload('manufacturingPhotos', e.target.files)}
                    hidden
                    id="photos-upload"
                  />
                  <label htmlFor="photos-upload" className="upload-btn">
                    <i className="fas fa-cloud-upload-alt"></i> Upload Photos
                  </label>
                  {manufacturingForm.manufacturingPhotos.length > 0 && (
                    <div className="photos-preview">
                      <span>{manufacturingForm.manufacturingPhotos.length} photos selected</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="upload-card">
                <div className="upload-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <h5>Geo-tag Location</h5>
                <input
                  type="text"
                  value={manufacturingForm.geoTag}
                  onChange={(e) => handleManufacturingChange('geoTag', e.target.value)}
                  placeholder="Latitude, Longitude"
                />
                <button className="gps-btn" onClick={() => {
                  // Mock GPS capture
                  const mockGPS = `${(Math.random() * 90).toFixed(6)}, ${(Math.random() * 180).toFixed(6)}`;
                  handleManufacturingChange('geoTag', mockGPS);
                  alert(`GPS captured: ${mockGPS}`);
                }}>
                  <i className="fas fa-location-dot"></i> Capture GPS
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setActivePhase('receive')}>
              <i className="fas fa-arrow-left"></i> Back
            </button>
            <button type="button" className="btn-primary" onClick={handleManufacturingSubmit}>
              <i className="fas fa-paper-plane"></i> Submit to Admin & Blockchain
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Packaging Phase
  const renderPackagingPhase = () => (
    <div className="phase-content">
      <div className="phase-header">
        <div className="phase-icon">
          <i className="fas fa-box"></i>
        </div>
        <div>
          <h3>Final Packaging</h3>
          <p>Complete final packaging and labeling</p>
        </div>
      </div>

      <div className="packaging-form">
        <div className="packaging-info">
          <div className="info-card">
            <h4>Manufacturing Complete</h4>
            <p>Proceed with final packaging using the assigned labels</p>
          </div>
        </div>

        <div className="form-section">
          <h4 className="section-title">
            <i className="fas fa-tags"></i> Label Information
          </h4>
          <div className="form-row">
            <div className="form-group">
              <label>Label ID * (Admin Generated)</label>
              <input
                type="text"
                value={selectedBatch?.manufacturer_data?.label_id || ""}
                readOnly
                className="readonly-input"
                placeholder="Label ID will be assigned by admin"
              />
            </div>
            <div className="form-group">
              <label>Label Printed Timestamp *</label>
              <input
                type="datetime-local"
                value={packagingForm.printedTimestamp}
                onChange={(e) => setPackagingForm(prev => ({ ...prev, printedTimestamp: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>


        <div className="barcode-preview">
          <h4>Final Barcode</h4>
          <div className="barcode-container">
            <div className="barcode-placeholder">
              <i className="fas fa-barcode"></i>
              <span>PROD-{selectedBatch?.manufacturer_data?.label_id || 'PENDING'}</span>
            </div>
            <div className="barcode-info">
              <p>Scan this barcode to verify product authenticity</p>
              <button
                className="btn-secondary"
                onClick={() => window.open("https://res.cloudinary.com/domogztsv/image/upload/v1765720436/WhatsApp_Image_2025-12-14_at_6.07.45_PM_ehfirz.jpg", "_blank")}
              >
                <i className="fas fa-print"></i> Print Barcode
              </button>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => setActivePhase('manufacturing')}>
            <i className="fas fa-arrow-left"></i> Back to Manufacturing
          </button>
          <button type="button" className="btn-primary" onClick={handlePackagingSubmit}>
            <i className="fas fa-check-circle"></i> Complete Packaging
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="manufacturer-portal">

      {/* Navigation */}
      <nav className="vhc-navbar">
        {/* LEFT SIDE */}
        <div className="vhc-navbar-left">
          <img
            src="https://res.cloudinary.com/domogztsv/image/upload/v1765220874/WhatsApp_Image_2025-12-09_at_12.36.40_AM_bp8jxt.jpg"
            alt="AyuSethu Logo"
            className="vhc-nav-LogoImage"
          />
          <div className="vhc-nav-logo">AyuSethu</div>
        </div>

        {/* RIGHT SIDE */}
        <div className="vhc-navbar-right">
          {/* PHASE NAVIGATION */}


          {/* NOTIFICATIONS */}
          <div className="vhc-notification-container">
            <button
              className="vhc-notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="fas fa-bell"></i>
              {notificationCount > 0 && (
                <span className="vhc-notification-badge">
                  {notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="vhc-notification-dropdown">
                <div className="vhc-notification-header">
                  <h4>Notifications ({notificationCount})</h4>
                  <button
                    className="vhc-mark-all-read"
                    onClick={markAllAsRead}
                    disabled={notificationCount === 0}
                  >
                    Mark all read
                  </button>
                </div>

                <div className="vhc-notification-tabs">
                  <button className="vhc-notification-tab active">All</button>
                  <button className="vhc-notification-tab">Bidding</button>
                  <button className="vhc-notification-tab">Collector</button>
                  <button className="vhc-notification-tab">Material</button>
                </div>

                <div className="vhc-notification-list">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`vhc-notification-item ${notification.read ? "" : "unread"}`}
                      onClick={() => {
                        markNotificationAsRead(notification.id);
                        if (notification.batchId) {
                          const batch = batches.find(b => b.id === notification.batchId);
                          if (batch) {
                            setSelectedBatch(batch);
                            setActivePhase("receive");
                            setShowNotifications(false);
                          }
                        }
                      }}
                    >
                      <div className={`vhc-notification-icon ${notification.category}`}>
                        {notification.category === "bidding" && <i className="fas fa-gavel"></i>}
                        {notification.category === "collector" && <i className="fas fa-user-tie"></i>}
                        {notification.category === "material" && <i className="fas fa-box-open"></i>}
                        {notification.category === "system" && <i className="fas fa-cog"></i>}
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

                      {!notification.read && <div className="vhc-unread-dot"></div>}
                    </div>
                  ))}
                </div>

                <div className="vhc-notification-footer">
                  <button className="vhc-view-all-btn">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* USER PROFILE */}
          <div className="vhc-user-profile">
            <div
              className="vhc-avatar"
              onClick={() => setShowProfileCard(prev => !prev)}
            >
              M
            </div>

            {showProfileCard && (
              <div className="vhc-user-card-dropdown">
                <div className="vhc-user-name">{user?.name || 'Manufacturer'}</div>
                <div className="vhc-user-id">Manufacturer ID: {user?.id || 'N/A'}</div>
                <div className="vhc-user-email">Email: {user?.email || 'N/A'}</div>
                <div className="vhc-user-role">Role: {user?.role || 'Manufacturer'}</div>
              </div>
            )}
          </div>

        </div>
      </nav>
      <div className="vhc-phase-nav">
        <button
          className={`vhc-phase-item ${activePhase === "receive" ? "active" : ""}`}
          onClick={() => setActivePhase("receive")}
        >
          <i className="fas fa-inbox"></i>
          <span>Receive Batches</span>
        </button>

        <button
          className={`vhc-phase-item ${activePhase === "quote" ? "active" : ""}`}
          onClick={() => setActivePhase("quote")}
        >
          <i className="fas fa-file-invoice-dollar"></i>
          <span>Submit Quotes</span>
        </button>

        <button
          className={`vhc-phase-item ${activePhase === "manufacturing" ? "active" : ""}`}
          onClick={() => setActivePhase("manufacturing")}
        >
          <i className="fas fa-industry"></i>
          <span>Manufacturing</span>
        </button>

        <button
          className={`vhc-phase-item ${activePhase === "packaging" ? "active" : ""}`}
          onClick={() => setActivePhase("packaging")}
        >
          <i className="fas fa-box"></i>
          <span>Packaging</span>
        </button>
      </div>



      {/* Main Content */}
      <main className="portal-main">
        <div className="container">
          {renderPhaseContent()}
        </div>
      </main>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="container">
          <div className="status-info">
            <div className="status-item">
              <span className="status-label">Active Batches:</span>
              <span className="status-value">3</span>
            </div>
            <div className="status-item">
              <span className="status-label">Quotes Submitted:</span>
              <span className="status-value">2</span>
            </div>
            <div className="status-item">
              <span className="status-label">In Production:</span>
              <span className="status-value">1</span>
            </div>
            <div className="status-item">
              <span className="status-label">Blockchain Verified:</span>
              <span className="status-value">Yes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manufacturer;