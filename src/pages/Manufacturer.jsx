import React, { useState, useEffect } from 'react';
import '../styles/Manufacturer.css';

const Manufacturer = () => {
  // State for different phases
  const [activePhase, setActivePhase] = useState('receive');
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    manufacturerID: 'MANUF-7890',
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
  
  // NOTIFICATION STATES - ADDED
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'admin',
      category: 'bidding',
      title: 'Bidding Update',
      message: 'Your quote for BTH-2024-001 has been accepted by admin',
      time: '10 minutes ago',
      read: false,
      batchId: 'BTH-2024-001'
    },
    {
      id: 2,
      type: 'admin',
      category: 'collector',
      title: 'Collector Assignment',
      message: 'Collector COL-7421 has been assigned to deliver BTH-2024-002',
      time: '2 hours ago',
      read: false,
      batchId: 'BTH-2024-002'
    },
    {
      id: 3,
      type: 'admin',
      category: 'material',
      title: 'Material Received',
      message: 'Batch BTH-2024-003 delivered to your facility. Please confirm receipt',
      time: '1 day ago',
      read: true,
      batchId: 'BTH-2024-003'
    },
    {
      id: 4,
      type: 'admin',
      category: 'bidding',
      title: 'New Batch Available',
      message: 'New batch BTH-2024-004 available for bidding. Quality score: 94%',
      time: '2 days ago',
      read: true,
      batchId: 'BTH-2024-004'
    },
    {
      id: 5,
      type: 'system',
      category: 'system',
      title: 'System Update',
      message: 'Manufacturing portal updated with new features',
      time: '3 days ago',
      read: true
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2); // 2 unread notifications

  // Mock data for batches
  useEffect(() => {
    const mockBatches = [
      {
        id: 'BTH-2024-001',
        name: 'Immunity Boost Syrup Base',
        status: 'ready_for_quote',
        herbType: 'Multi-Herb',
        quantity: 50,
        testResults: 'Passed',
        testScore: 92,
        testDetails: {
          microbiological: 'Passed',
          heavyMetals: 'Passed',
          activeCompounds: 'Passed',
          pesticide: 'In Progress',
          stability: 'Scheduled'
        },
        pickupInstructions: 'Collect from Farm Gate 3, Plot 5B. Contact Farmer: Rajesh Kumar - 9876543210',
        quoteDeadline: '2024-01-25',
        farmerName: 'Rajesh Kumar',
        farmLocation: 'Plot 5B, Valley North'
      },
      {
        id: 'BTH-2024-002',
        name: 'Organic Turmeric Powder',
        status: 'quote_submitted',
        herbType: 'Single Herb',
        quantity: 40,
        testResults: 'Passed',
        testScore: 95,
        testDetails: {
          microbiological: 'Passed',
          heavyMetals: 'Passed',
          activeCompounds: 'Passed',
          pesticide: 'Passed',
          stability: 'In Progress'
        },
        pickupInstructions: 'Available at Collection Center A. Bring Govt ID and authorization letter.',
        quoteDeadline: '2024-01-20',
        farmerName: 'Suresh Patel',
        farmLocation: 'Farm 12, Southern Plains'
      },
      {
        id: 'BTH-2024-003',
        name: 'Digestive Health Mix',
        status: 'manufacturing',
        herbType: 'Multi-Herb',
        quantity: 35,
        testResults: 'Passed',
        testScore: 88,
        testDetails: {
          microbiological: 'Passed',
          heavyMetals: 'Passed',
          activeCompounds: 'Passed',
          pesticide: 'Passed',
          stability: 'Pending'
        },
        pickupInstructions: 'Already delivered to manufacturing unit',
        quoteDeadline: 'Completed',
        farmerName: 'Anita Sharma',
        farmLocation: 'Organic Farm 7'
      }
    ];
    setBatches(mockBatches);
  }, []);

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
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  // Handle batch selection
  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
    setQuoteForm(prev => ({ ...prev, batchID: batch.id }));
  };

  // Handle quote submission
  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    alert(`Quote submitted for ${quoteForm.batchID}\nAmount: ₹${quoteForm.quoteAmount}/kg\nValidity: ${quoteForm.validityTime}`);
    
    // Update batch status
    setBatches(prev => prev.map(batch => 
      batch.id === quoteForm.batchID 
        ? { ...batch, status: 'quote_submitted' }
        : batch
    ));
    
    setActivePhase('manufacturing');
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

  // Handle manufacturing submission
  const handleManufacturingSubmit = () => {
    alert('Manufacturing process submitted to admin for verification');
    setActivePhase('packaging');
  };

  // Handle packaging submission
  const handlePackagingSubmit = () => {
    alert('Packaging completed and sent to blockchain');
  };

  // Render phase content
  const renderPhaseContent = () => {
    switch(activePhase) {
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
              <button className="btn-primary" onClick={(e) => {
                e.stopPropagation();
                setSelectedBatch(batch);
                setActivePhase('manufacturing');
              }}>
                <i className="fas fa-industry"></i> Start Manufacturing
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
  const renderManufacturingPhase = () => (
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
              <label>Label ID *</label>
              <input
                type="text"
                value={packagingForm.labelID}
                onChange={(e) => setPackagingForm(prev => ({ ...prev, labelID: e.target.value }))}
                placeholder="Enter label ID"
                required
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
              <span>PROD-{selectedBatch?.id?.replace('BTH-', '') || 'XXXX'}-PKG</span>
            </div>
            <div className="barcode-info">
              <p>Scan this barcode to verify product authenticity</p>
              <button className="btn-secondary">
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
      {/* Header */}
      <header className="portal-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">
              <i className="fas fa-industry"></i>
              <div>
                <h1>VirtuHerbChain</h1>
                <p>Manufacturer Portal</p>
              </div>
            </div>
          </div>

          <div className="header-actions">
            {/* UPDATED NOTIFICATION SECTION */}
            <div className="notification-container">
              <div 
                className="notification-bell" 
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <i className="fas fa-bell"></i>
                {notificationCount > 0 && (
                  <span className="notification-count">{notificationCount}</span>
                )}
              </div>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Notifications ({notificationCount})</h4>
                    <button 
                      className="mark-all-read" 
                      onClick={markAllAsRead}
                      disabled={notificationCount === 0}
                    >
                      Mark all read
                    </button>
                  </div>
                  
                  <div className="notification-tabs">
                    <button className="notification-tab active">All</button>
                    <button className="notification-tab">Bidding</button>
                    <button className="notification-tab">Collector</button>
                    <button className="notification-tab">Material</button>
                  </div>
                  
                  <div className="notification-list">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.read ? '' : 'unread'}`}
                        onClick={() => {
                          markNotificationAsRead(notification.id);
                          if (notification.batchId) {
                            const batch = batches.find(b => b.id === notification.batchId);
                            if (batch) {
                              setSelectedBatch(batch);
                              setActivePhase('receive');
                              setShowNotifications(false);
                            }
                          }
                        }}
                      >
                        <div className={`notification-icon ${notification.category}`}>
                          {notification.category === 'bidding' && <i className="fas fa-gavel"></i>}
                          {notification.category === 'collector' && <i className="fas fa-user-tie"></i>}
                          {notification.category === 'material' && <i className="fas fa-box-open"></i>}
                          {notification.category === 'system' && <i className="fas fa-cog"></i>}
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">{notification.time}</div>
                        </div>
                        {!notification.read && <div className="unread-dot"></div>}
                      </div>
                    ))}
                  </div>
                  
                  <div className="notification-footer">
                    <button className="view-all-btn">View All Notifications</button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="user-profile">
              <div className="avatar">M</div>
              <div className="user-info">
                <span className="username">Herbal Solutions Inc.</span>
                <span className="user-id">MANUF-7890</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="phase-navigation">
        <div className="nav-container">
          <button 
            className={`nav-item ${activePhase === 'receive' ? 'active' : ''}`}
            onClick={() => setActivePhase('receive')}
          >
            <i className="fas fa-inbox"></i>
            <span>Receive Batches</span>
          </button>
          <button 
            className={`nav-item ${activePhase === 'quote' ? 'active' : ''}`}
            onClick={() => setActivePhase('quote')}
          >
            <i className="fas fa-file-invoice-dollar"></i>
            <span>Submit Quotes</span>
          </button>
          <button 
            className={`nav-item ${activePhase === 'manufacturing' ? 'active' : ''}`}
            onClick={() => setActivePhase('manufacturing')}
          >
            <i className="fas fa-industry"></i>
            <span>Manufacturing</span>
          </button>
          <button 
            className={`nav-item ${activePhase === 'packaging' ? 'active' : ''}`}
            onClick={() => setActivePhase('packaging')}
          >
            <i className="fas fa-box"></i>
            <span>Packaging</span>
          </button>
        </div>
      </nav>

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