import React, { useState, useEffect, useRef, Fragment } from 'react';
import '../styles/Admin.css';

const Admin = () => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState({
    users: 'create-user',
    batches: 'stage-tracking',
    analytics: 'consumer-analytics'
  });
  const [modalOpen, setModalOpen] = useState(null);
  
  // Add this line with your other state declarations (around line 9)
const [showNotifications, setShowNotifications] = useState(false);

  // Chart references
  const batchChartRef = useRef(null);
  const analyticsChartRef = useRef(null);
  const [chartsInitialized, setChartsInitialized] = useState(false);

  // Stable data - no fluctuations
  const [notifications] = useState([
    { id: 1, title: 'New herb planting request', details: 'from Farmer Rajesh (ID: F-1245)', time: '2 minutes ago', type: 'info' },
    { id: 2, title: 'Tester accepted batch first', details: 'for Batch ID: HB-2023-08-124', time: '15 minutes ago', type: 'success' },
    { id: 3, title: 'Manufacturer quote received', details: 'from AyurPharma for Batch HB-2023-08-119', time: '1 hour ago', type: 'info' },
    { id: 4, title: 'Blockchain mint successful', details: 'for Token ID: 12478 (Batch HB-2023-08-115)', time: '3 hours ago', type: 'success' },
    { id: 5, title: 'Farmer delayed Stage 3', details: 'for Batch ID: HB-2023-08-121 (Ashwagandha)', time: '5 hours ago', type: 'warning' },
  ]);

  const [kpis] = useState({
    activeFarmers: 1247,
    batchesInProgress: 84,
    pendingTesterAssignments: 17,
    pendingManufacturerQuotes: 23,
    completedBatches: 892,
    blockchainTransactions: 5241,
    delayedStages: 12,
    complianceViolations: 4,
  });

  const [batches] = useState([
    { id: 'HB-2023-08-124', herb: 'Ashwagandha', farmer: 'Rajesh Kumar', collector: 'Anand Kumar', 
      tester: 'HerbCheck Labs', manufacturer: 'Pending', stage: 3, completeness: 40, 
      timeline: 'On track', status: 'inprogress', delay: 0 },
    { id: 'HB-2023-08-123', herb: 'Tulsi', farmer: 'Suresh Patel', collector: 'Anand Kumar', 
      tester: 'AyurTest Labs', manufacturer: 'Pending', stage: 5, completeness: 80, 
      timeline: 'Delayed 2d', status: 'pending', delay: 2 },
    { id: 'HB-2023-08-122', herb: 'Giloy', farmer: 'Mohan Singh', collector: 'Ravi Shankar', 
      tester: 'HerbCheck Labs', manufacturer: 'Pending', stage: 2, completeness: 20, 
      timeline: 'On track', status: 'inprogress', delay: 0 },
    { id: 'HB-2023-08-121', herb: 'Turmeric', farmer: 'Amit Sharma', collector: 'Sanjay Patel', 
      tester: 'AyurTest Labs', manufacturer: 'AyurPharma Ltd.', stage: 6, completeness: 100, 
      timeline: 'Manufacturing', status: 'inprogress', delay: 0 },
    { id: 'HB-2023-08-120', herb: 'Neem', farmer: 'Vijay Kumar', collector: 'Ravi Shankar', 
      tester: 'HerbCheck Labs', manufacturer: 'Nature\'s Way', stage: 7, completeness: 100, 
      timeline: 'Completed', status: 'completed', delay: 0 },
  ]);

  const [collectors] = useState([
    { id: 'C-101', name: 'Anand Kumar', region: 'North India', phone: '+91 9876543210', 
      email: 'anand@virtuherbchain.com', assignedBatches: 24, completed: 22, 
      avgTime: '2.1 hrs', accuracy: '99%', status: 'active', rating: 4.8 },
    { id: 'C-102', name: 'Ravi Shankar', region: 'South India', phone: '+91 9876543211', 
      email: 'ravi@virtuherbchain.com', assignedBatches: 18, completed: 16, 
      avgTime: '2.8 hrs', accuracy: '97%', status: 'active', rating: 4.5 },
    { id: 'C-103', name: 'Sanjay Patel', region: 'West India', phone: '+91 9876543212', 
      email: 'sanjay@virtuherbchain.com', assignedBatches: 15, completed: 12, 
      avgTime: '3.2 hrs', accuracy: '95%', status: 'delayed', rating: 4.2 },
  ]);

  const [testers] = useState([
    { id: 'T-101', name: 'HerbCheck Labs', location: 'Delhi', accreditation: 'NABL Certified', 
      turnaround: '36 hrs', accuracy: '99.1%', acceptanceRate: '92%', rating: 4.8, status: 'active' },
    { id: 'T-102', name: 'AyurTest Labs', location: 'Bangalore', accreditation: 'ISO 17025', 
      turnaround: '42 hrs', accuracy: '98.7%', acceptanceRate: '88%', rating: 4.6, status: 'active' },
    { id: 'T-103', name: 'Vedic Quality Labs', location: 'Mumbai', accreditation: 'FSSAI Approved', 
      turnaround: '48 hrs', accuracy: '97.5%', acceptanceRate: '85%', rating: 4.3, status: 'active' },
  ]);

  const [manufacturers] = useState([
    { id: 'M-101', name: 'AyurPharma Ltd.', location: 'Gujarat', license: 'GMP Certified', 
      capacity: '5000 kg/month', successRate: '94%', avgProcessing: '5.2 days', rating: 4.7, status: 'active' },
    { id: 'M-102', name: 'HerbCare Solutions', location: 'Maharashtra', license: 'USFDA Approved', 
      capacity: '3000 kg/month', successRate: '91%', avgProcessing: '6.1 days', rating: 4.5, status: 'active' },
    { id: 'M-103', name: 'Nature\'s Way', location: 'Kerala', license: 'Organic Certified', 
      capacity: '2000 kg/month', successRate: '96%', avgProcessing: '4.8 days', rating: 4.9, status: 'active' },
  ]);

  const [manufacturerQuotes] = useState([
    { id: 'Q-001', batchId: 'HB-2023-08-119', manufacturer: 'AyurPharma Ltd.', amount: '₹124,500', 
      time: '5 days', score: '94/100', status: 'pending', submitted: '2023-08-15' },
    { id: 'Q-002', batchId: 'HB-2023-08-119', manufacturer: 'HerbCare Solutions', amount: '₹118,200', 
      time: '6 days', score: '91/100', status: 'pending', submitted: '2023-08-15' },
    { id: 'Q-003', batchId: 'HB-2023-08-118', manufacturer: 'Nature\'s Way', amount: '₹135,800', 
      time: '4 days', score: '96/100', status: 'selected', submitted: '2023-08-14' },
  ]);

  const [geoFencingData] = useState({
    allowedZones: ['North India', 'South India', 'East India', 'West India'],
    violations: [
      { id: 'GV-001', batchId: 'HB-2023-08-110', type: 'Season Window', details: 'Harvested outside allowed season', date: '2023-08-10' },
      { id: 'GV-002', collectorId: 'C-103', type: 'Geo-fence', details: 'Moved 15km outside allowed zone', date: '2023-08-12' },
    ],
    compliance: {
      harvestRules: 98,
      qualityThresholds: 99,
      aiValidation: 99.3
    }
  });

  const [blockchainData] = useState({
    fabric: {
      transactions: 5241,
      chaincodeCalls: 8920,
      worldState: 1247,
      lastTx: 'Tx-2023-08-124'
    },
    polygon: {
      nftsMinted: 892,
      contractAddress: '0x8a4...c3f2',
      lastTokenId: '#12478',
      lastTxHash: '0x5b2...9e1a'
    }
  });

  const [analytics] = useState({
    consumer: {
      qrScans: 12458,
      repeatScans: 4235,
      regionScans: { north: 4521, south: 3245, east: 2154, west: 2538 },
      authFailures: 25,
      rating: 4.5
    },
    batch: {
      completionRate: 92,
      avgDuration: '45 days',
      successRate: 94,
      delayPatterns: { stage3: 12, stage5: 8, testing: 5 }
    },
    sustainability: {
      carbonFootprint: '1.2 ton CO2',
      waterSaved: '12,500 liters',
      organicCompliance: 98,
      geoConservation: 95
    }
  });

  const [settings] = useState({
    notifications: {
      delayReminders: true,
      visitSchedule: true,
      batchCompletion: true,
      testerAcceptance: true,
      manufacturerQuotes: false,
      blockchainTx: true
    },
    automation: {
      autoSelectTester: true,
      autoEscalate: true,
      weeklyAnalytics: false,
      autoSyncIPFS: true,
      autoAssignCollector: false,
      autoValidateAI: true
    },
    system: {
      fabricCA: 'https://fabric-ca.virtuherbchain.com',
      polygonRPC: 'https://polygon-rpc.com',
      nftContract: '0x8a4...c3f2',
      ipfsGateway: 'https://ipfs.io/ipfs'
    }
  });

  // Initialize charts
  useEffect(() => {
    const initializeCharts = async () => {
      try {
        const { Chart } = await import('chart.js/auto');
        
        // Batch Completion Chart
        if (batchChartRef.current) {
          const ctx = batchChartRef.current.getContext('2d');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              datasets: [{
                label: 'Batches Completed',
                data: [65, 78, 90, 85, 92, 88, 95, 124],
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
              }, {
                label: 'Batches in Progress',
                data: [45, 52, 60, 55, 70, 68, 75, 84],
                borderColor: '#ffb300',
                backgroundColor: 'rgba(255, 179, 0, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } },
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Number of Batches' }
                }
              }
            }
          });
        }

        setChartsInitialized(true);
      } catch (error) {
        console.error('Chart.js initialization error:', error);
      }
    };

    if (!chartsInitialized) {
      initializeCharts();
    }
  }, [chartsInitialized]);

  // Navigation
  const navItems = [
    { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { id: 'users', icon: 'fa-users', label: 'User Management' },
    { id: 'batches', icon: 'fa-boxes', label: 'Batch Management' },
    { id: 'collectors', icon: 'fa-truck-pickup', label: 'Collector Management' },
    { id: 'testers', icon: 'fa-flask', label: 'Tester Management' },
    { id: 'manufacturers', icon: 'fa-industry', label: 'Manufacturer Management' },
    { id: 'geofencing', icon: 'fa-map-marker-alt', label: 'Geo-Fencing' },
    { id: 'labeling', icon: 'fa-qrcode', label: 'Smart Labeling' },
    { id: 'blockchain', icon: 'fa-link', label: 'Blockchain' },
    { id: 'analytics', icon: 'fa-chart-bar', label: 'Analytics' },
    { id: 'settings', icon: 'fa-cog', label: 'Settings' },
  ];

  const userSubTabs = ['create-user', 'assign-permissions', 'identity-mapping'];
  const batchSubTabs = ['batch-creation', 'stage-tracking', 'compliance'];
  const analyticsSubTabs = ['consumer-analytics', 'batch-analytics', 'sustainability'];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSubTabClick = (subTabId, parentTab) => {
    setActiveSubTab(prev => ({ ...prev, [parentTab]: subTabId }));
  };

  // Modal functions
  const openModal = (modalId) => {
    setModalOpen(modalId);
  };

  const closeModal = () => {
    setModalOpen(null);
  };

  // Action functions
  const generateLabel = () => {
    alert('Label generation initiated! ProductID: PRD-2023-08-119-01\nLabelID will be generated and QR code created.');
    closeModal();
  };

  const mintNFT = () => {
    openModal('mintNFTModal');
  };

  const confirmMint = () => {
    alert('NFT minting transaction submitted to Polygon network!\nTransaction hash: 0x5b2...9e1a\nTokenID: #12479');
    closeModal();
  };

  const assignCollector = () => {
    alert('Collector assigned successfully!');
    closeModal();
  };

  const assignTester = () => {
    alert('Tester assigned successfully!');
    closeModal();
  };

  const selectManufacturer = (quoteId) => {
    alert(`Manufacturer selected for quote ${quoteId}`);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'pending': { class: 'status-pending', label: 'Pending' },
      'completed': { class: 'status-completed', label: 'Completed' },
      'inprogress': { class: 'status-inprogress', label: 'In Progress' },
      'active': { class: 'status-completed', label: 'Active' },
      'delayed': { class: 'status-pending', label: 'Delayed' },
      'selected': { class: 'status-completed', label: 'Selected' }
    };

    const config = statusConfig[status] || { class: '', label: status };
    return <span className={`status ${config.class}`}>{config.label}</span>;
  };

  // Progress bar component
  const ProgressBar = ({ percentage, color = '#2e7d32' }) => (
    <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, borderRadius: '4px' }}></div>
    </div>
  );

  // Quick actions
  const quickActions = [
    { id: 'assignCollector', icon: 'fa-user-plus', label: 'Assign Collector', modal: 'assignCollectorModal' },
    { id: 'assignTester', icon: 'fa-flask', label: 'Assign Tester', modal: 'assignTesterModal' },
    { id: 'reviewQuotes', icon: 'fa-file-signature', label: 'Review Manufacturer Quotes', modal: 'reviewQuotesModal' },
    { id: 'generateLabel', icon: 'fa-qrcode', label: 'Generate LabelID', modal: 'generateLabelModal' },
    { id: 'reschedule', icon: 'fa-calendar-alt', label: 'Reschedule Collector Visit', modal: 'rescheduleModal' },
    { id: 'publishTester', icon: 'fa-bullhorn', label: 'Publish Tester Request', modal: 'publishTesterModal' },
  ];

  // KPI Cards
  const kpiCards = [
    { id: 'farmers', title: 'Active Farmers', value: kpis.activeFarmers.toLocaleString(), icon: 'fa-user-tie', change: { type: 'positive', value: '12% from last month' } },
    { id: 'batches', title: 'Batches in Progress', value: kpis.batchesInProgress, icon: 'fa-spinner', change: { type: 'negative', value: '3% delayed' } },
    { id: 'tester', title: 'Pending Tester Assignments', value: kpis.pendingTesterAssignments, icon: 'fa-tasks', change: { type: 'positive', value: 'Assign now' } },
    { id: 'quotes', title: 'Pending Manufacturer Quotes', value: kpis.pendingManufacturerQuotes, icon: 'fa-file-invoice-dollar', change: { type: 'neutral', value: 'Waiting for review' } },
    { id: 'completed', title: 'Completed Batches', value: kpis.completedBatches, icon: 'fa-check-circle', change: { type: 'positive', value: '8% this month' } },
    { id: 'blockchain', title: 'Blockchain Transactions', value: kpis.blockchainTransactions.toLocaleString(), icon: 'fa-link', change: { type: 'positive', value: 'All successful' } },
    { id: 'delayed', title: 'Delayed Stages', value: kpis.delayedStages, icon: 'fa-clock', change: { type: 'negative', value: 'Needs attention' } },
    { id: 'violations', title: 'Compliance Violations', value: kpis.complianceViolations, icon: 'fa-exclamation-triangle', change: { type: 'negative', value: 'Requires action' } },
  ];

  // Render functions for different tabs
  const renderDashboard = () => (
    <>
      <div className="dashboard-grid">
        {kpiCards.map(kpi => (
          <div className="card" key={kpi.id}>
            <div className="card-header">
              <div className="card-title">{kpi.title}</div>
              <div className="card-icon">
                <i className={`fas ${kpi.icon}`}></i>
              </div>
            </div>
            <div className="card-value">{kpi.value}</div>
            <div className={`card-change ${kpi.change.type}`}>
              {kpi.change.type === 'positive' && <i className="fas fa-arrow-up"></i>}
              {kpi.change.type === 'negative' && <i className="fas fa-arrow-down"></i>}
              {kpi.change.value}
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-title"><i className="fas fa-bolt"></i> Quick Actions</h3>
      <div className="quick-actions">
        {quickActions.map(action => (
          <div className="action-btn" key={action.id} onClick={() => openModal(action.modal)}>
            <i className={`fas ${action.icon}`}></i>
            <span>{action.label}</span>
          </div>
        ))}
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3 className="section-title"><i className="fas fa-chart-line"></i> Batch Completion Timeline</h3>
          <div style={{ height: '250px' }}>
            <canvas ref={batchChartRef}></canvas>
          </div>
        </div>
        
        <div className="notifications-container">
          <h3 className="section-title"><i className="fas fa-bell"></i> Recent Notifications</h3>
          {notifications.map(notification => (
            <div className={`notification-item ${notification.type}`} key={notification.id}>
              <div><strong>{notification.title}</strong> {notification.details}</div>
              <div className="notification-time">{notification.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="table-container">
        <h3 style={{ padding: '20px 20px 0 20px', color: '#1b5e20' }}>Recent Batches</h3>
        <table>
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Herb</th>
              <th>Stage</th>
              <th>Completeness</th>
              <th>Timeline</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map(batch => (
              <tr key={batch.id}>
                <td>{batch.id}</td>
                <td>{batch.herb}</td>
                <td>Stage {batch.stage}/7</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '60px' }}>{batch.completeness}%</div>
                    <ProgressBar percentage={batch.completeness} />
                  </div>
                </td>
                <td>{batch.timeline}</td>
                <td><StatusBadge status={batch.status} /></td>
                <td><button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.9rem' }}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderUserManagement = () => {
    const currentSubTab = activeSubTab['users'] || 'create-user';
    
    return (
      <>
        <h2 className="section-title"><i className="fas fa-users"></i> User & Role Management</h2>
        
        <div className="tabs">
          {userSubTabs.map(subTab => (
            <div 
              key={subTab} 
              className={`tab ${currentSubTab === subTab ? 'active' : ''}`}
              onClick={() => handleSubTabClick(subTab, 'users')}
            >
              {subTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>
          ))}
        </div>
        
        {currentSubTab === 'create-user' && (
          <div id="create-user" className="subtab-content active">
            <div className="dashboard-grid">
              <div className="card" onClick={() => openModal('createFarmerModal')} style={{ cursor: 'pointer' }}>
                <div className="card-header">
                  <div className="card-title">Create Farmer</div>
                  <div className="card-icon">
                    <i className="fas fa-user-tie"></i>
                  </div>
                </div>
                <div className="card-value">{kpis.activeFarmers.toLocaleString()}</div>
                <div className="card-change">Click to add new farmer</div>
              </div>
              
              <div className="card" onClick={() => openModal('createCollectorModal')} style={{ cursor: 'pointer' }}>
                <div className="card-header">
                  <div className="card-title">Create Collector</div>
                  <div className="card-icon">
                    <i className="fas fa-truck-pickup"></i>
                  </div>
                </div>
                <div className="card-value">{collectors.length}</div>
                <div className="card-change">Click to add new collector</div>
              </div>
              
              <div className="card" onClick={() => openModal('createTesterModal')} style={{ cursor: 'pointer' }}>
                <div className="card-header">
                  <div className="card-title">Create Tester</div>
                  <div className="card-icon">
                    <i className="fas fa-flask"></i>
                  </div>
                </div>
                <div className="card-value">{testers.length}</div>
                <div className="card-change">Click to add new tester</div>
              </div>
              
              <div className="card" onClick={() => openModal('createManufacturerModal')} style={{ cursor: 'pointer' }}>
                <div className="card-header">
                  <div className="card-title">Create Manufacturer</div>
                  <div className="card-icon">
                    <i className="fas fa-industry"></i>
                  </div>
                </div>
                <div className="card-value">{manufacturers.length}</div>
                <div className="card-change">Click to add new manufacturer</div>
              </div>
            </div>
          </div>
        )}
        
        {currentSubTab === 'assign-permissions' && (
          <div id="assign-permissions" className="subtab-content">
            <h3 style={{ margin: '20px 0', color: '#1b5e20' }}>Role Permissions Matrix</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Stage 1 & 5</th>
                    <th>Stage 2-4</th>
                    <th>Test Reports</th>
                    <th>Manufacturing</th>
                    <th>View Only</th>
                    <th>Fabric Cert</th>
                    <th>Public Wallet</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Farmer</strong></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                    <td><i className="fas fa-check" style={{ color: 'green' }}></i></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                    <td><i className="fas fa-check" style={{ color: 'green' }}></i></td>
                    <td><i className="fas fa-check" style={{ color: 'green' }}></i></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                  </tr>
                  <tr>
                    <td><strong>Collector</strong></td>
                    <td><i className="fas fa-check" style={{ color: 'green' }}></i></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                    <td><i className="fas fa-check" style={{ color: 'green' }}></i></td>
                    <td><i className="fas fa-check" style={{ color: 'green' }}></i></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                  </tr>
                  <tr>
                    <td><strong>Tester</strong></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                    <td><i className="fas fa-check" style={{ color: 'green' }}></i></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                    <td><i className="fas fa-check" style={{ color: 'green' }}></i></td>
                    <td><i className="fas fa-check" style={{ color: 'green' }}></i></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                  </tr>
                  <tr>
                    <td><strong>Manufacturer</strong></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                    <td><i className="fas fa-times" style={{ color: 'red' }}></i></td>
                    <td><i className="fas fa-check" style={{ color: 'green' }}></i></td>
                    <td><i className="fas fa-check" style={{ color: 'green' }}></i></td>
                    <td><i className="fas fa-check" style={{ color: 'green' }}></i></td>
                    <td><i className="fas fa-check" style={{ color: 'green' }}></i></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {currentSubTab === 'identity-mapping' && (
          <div id="identity-mapping" className="subtab-content">
            <h3 style={{ margin: '20px 0', color: '#1b5e20' }}>Fabric Identity & Wallet Management</h3>
            <div className="dashboard-grid">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Fabric CA Certificates</div>
                  <div className="card-icon">
                    <i className="fas fa-certificate"></i>
                  </div>
                </div>
                <div className="card-value">1,315 Issued</div>
                <div className="card-change">X.509 certificates for all participants</div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Public Chain Wallets</div>
                  <div className="card-icon">
                    <i className="fas fa-wallet"></i>
                  </div>
                </div>
                <div className="card-value">{manufacturers.length}</div>
                <div className="card-change">Polygon wallet addresses stored</div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Internal Role Groups</div>
                  <div className="card-icon">
                    <i className="fas fa-layer-group"></i>
                  </div>
                </div>
                <div className="card-value">4 Groups</div>
                <div className="card-change">Farmer, Collector, Tester, Manufacturer</div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderBatchManagement = () => {
    const currentSubTab = activeSubTab['batches'] || 'stage-tracking';
    
    return (
      <>
        <h2 className="section-title"><i className="fas fa-boxes"></i> Batch Management System</h2>
        
        <div className="tabs">
          {batchSubTabs.map(subTab => (
            <div 
              key={subTab} 
              className={`tab ${currentSubTab === subTab ? 'active' : ''}`}
              onClick={() => handleSubTabClick(subTab, 'batches')}
            >
              {subTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>
          ))}
        </div>
        
        {currentSubTab === 'stage-tracking' && (
          <div id="stage-tracking" className="subtab-content active">
            <h3 style={{ margin: '20px 0', color: '#1b5e20' }}>Batch Stage Status</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Stage 1</th>
                    <th>Stage 2</th>
                    <th>Stage 3</th>
                    <th>Stage 4</th>
                    <th>Stage 5</th>
                    <th>Testing</th>
                    <th>Manufacturing</th>
                    <th>Completeness</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(batch => (
                    <tr key={batch.id}>
                      <td>{batch.id}</td>
                      <td><i className="fas fa-check-circle" style={{ color: batch.stage >= 1 ? 'green' : 'gray' }}></i></td>
                      <td><i className="fas fa-check-circle" style={{ color: batch.stage >= 2 ? 'green' : 'gray' }}></i></td>
                      <td><i className={`fas ${batch.stage >= 3 ? (batch.delay > 0 ? 'fa-exclamation-triangle text-warning' : 'fa-check-circle text-success') : 'fa-clock text-gray'}`}></i></td>
                      <td><i className="fas fa-check-circle" style={{ color: batch.stage >= 4 ? 'green' : 'gray' }}></i></td>
                      <td><i className="fas fa-check-circle" style={{ color: batch.stage >= 5 ? 'green' : 'gray' }}></i></td>
                      <td><i className="fas fa-flask" style={{ color: batch.stage >= 6 ? 'green' : 'gray' }}></i></td>
                      <td><i className="fas fa-industry" style={{ color: batch.stage >= 7 ? 'green' : 'gray' }}></i></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '40px' }}>{batch.completeness}%</div>
                          <ProgressBar percentage={batch.completeness} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Stage Visualization</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px', background: '#e8f5e9', padding: '0 10px', borderRadius: '8px', marginBottom: '10px' }}>
                {['Collection', 'Planting', 'Growth', 'Harvest', 'Verify', 'Testing', 'Manufacturing'].map((stage, index) => (
                  <div key={index} style={{ textAlign: 'center', flex: 1, borderLeft: index > 0 ? '2px solid #2e7d32' : 'none' }}>
                    <div style={{ fontWeight: 'bold' }}>Stage {index + 1}</div>
                    <div>{stage}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderCollectorManagement = () => (
    <>
      <h2 className="section-title"><i className="fas fa-truck-pickup"></i> Collector Management</h2>
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Active Collectors</div>
            <div className="card-icon">
              <i className="fas fa-user-check"></i>
            </div>
          </div>
          <div className="card-value">{collectors.filter(c => c.status === 'active').length}</div>
          <div className="card-change positive"><i className="fas fa-arrow-up"></i> 5 new this month</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">Avg. Assignment Time</div>
            <div className="card-icon">
              <i className="fas fa-clock"></i>
            </div>
          </div>
          <div className="card-value">2.4 hrs</div>
          <div className="card-change negative"><i className="fas fa-arrow-up"></i> 0.3 hrs longer</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">Missed Visits</div>
            <div className="card-icon">
              <i className="fas fa-calendar-times"></i>
            </div>
          </div>
          <div className="card-value">12</div>
          <div className="card-change positive"><i className="fas fa-arrow-down"></i> 3 less than last month</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">Stage 1 & 5 Accuracy</div>
            <div className="card-icon">
              <i className="fas fa-check-double"></i>
            </div>
          </div>
          <div className="card-value">98.2%</div>
          <div className="card-change positive"><i className="fas fa-arrow-up"></i> High compliance</div>
        </div>
      </div>
      
      <div className="table-container" style={{ marginTop: '30px' }}>
        <h3 style={{ padding: '20px 20px 0 20px', color: '#1b5e20' }}>Collector Performance</h3>
        <table>
          <thead>
            <tr>
              <th>Collector ID</th>
              <th>Name</th>
              <th>Region</th>
              <th>Assigned</th>
              <th>Completed</th>
              <th>Avg. Time</th>
              <th>Accuracy</th>
              <th>Rating</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {collectors.map(collector => (
              <tr key={collector.id}>
                <td>{collector.id}</td>
                <td>{collector.name}</td>
                <td>{collector.region}</td>
                <td>{collector.assignedBatches}</td>
                <td>{collector.completed}</td>
                <td>{collector.avgTime}</td>
                <td>{collector.accuracy}</td>
                <td>{collector.rating}/5.0</td>
                <td><StatusBadge status={collector.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderTesterManagement = () => (
    <>
      <h2 className="section-title"><i className="fas fa-flask"></i> Tester Management</h2>
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Pending Tests</div>
            <div className="card-icon">
              <i className="fas fa-hourglass-half"></i>
            </div>
          </div>
          <div className="card-value">{kpis.pendingTesterAssignments}</div>
          <div className="card-change">Awaiting results</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">Avg. Turnaround Time</div>
            <div className="card-icon">
              <i className="fas fa-stopwatch"></i>
            </div>
          </div>
          <div className="card-value">36 hrs</div>
          <div className="card-change positive"><i className="fas fa-arrow-down"></i> 4 hrs faster</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">Test Accuracy</div>
            <div className="card-icon">
              <i className="fas fa-check-double"></i>
            </div>
          </div>
          <div className="card-value">99.1%</div>
          <div className="card-change">AI validated</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">Blockchain Test Entries</div>
            <div className="card-icon">
              <i className="fas fa-link"></i>
            </div>
          </div>
          <div className="card-value">892</div>
          <div className="card-change positive">All confirmed</div>
        </div>
      </div>
      
      <div className="table-container" style={{ marginTop: '30px' }}>
        <h3 style={{ padding: '20px 20px 0 20px', color: '#1b5e20' }}>Testing Labs</h3>
        <table>
          <thead>
            <tr>
              <th>Lab ID</th>
              <th>Name</th>
              <th>Accreditation</th>
              <th>Turnaround</th>
              <th>Accuracy</th>
              <th>Acceptance Rate</th>
              <th>Rating</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {testers.map(tester => (
              <tr key={tester.id}>
                <td>{tester.id}</td>
                <td>{tester.name}</td>
                <td>{tester.accreditation}</td>
                <td>{tester.turnaround}</td>
                <td>{tester.accuracy}</td>
                <td>{tester.acceptanceRate}</td>
                <td>{tester.rating}/5.0</td>
                <td><StatusBadge status={tester.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderManufacturerManagement = () => (
    <>
      <h2 className="section-title"><i className="fas fa-industry"></i> Manufacturer Management</h2>
      
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Pending Quotes</div>
            <div className="card-icon">
              <i className="fas fa-file-invoice-dollar"></i>
            </div>
          </div>
          <div className="card-value">{kpis.pendingManufacturerQuotes}</div>
          <div className="card-change">Awaiting review</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">Avg. Processing Time</div>
            <div className="card-icon">
              <i className="fas fa-clock"></i>
            </div>
          </div>
          <div className="card-value">5.2 days</div>
          <div className="card-change positive"><i className="fas fa-arrow-down"></i> 0.8 days faster</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">Quote Success Rate</div>
            <div className="card-icon">
              <i className="fas fa-percentage"></i>
            </div>
          </div>
          <div className="card-value">87%</div>
          <div className="card-change positive"><i className="fas fa-arrow-up"></i> 5% increase</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">Fabric Transactions</div>
            <div className="card-icon">
              <i className="fas fa-database"></i>
            </div>
          </div>
          <div className="card-value">457</div>
          <div className="card-change positive">manufactureMedicine()</div>
        </div>
      </div>
      
      <div className="table-container" style={{ marginTop: '30px' }}>
        <h3 style={{ padding: '20px 20px 0 20px', color: '#1b5e20' }}>Manufacturer Quotes</h3>
        <table>
          <thead>
            <tr>
              <th>Quote ID</th>
              <th>Batch ID</th>
              <th>Manufacturer</th>
              <th>Quote Amount</th>
              <th>Processing Time</th>
              <th>Quality Score</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {manufacturerQuotes.map(quote => (
              <tr key={quote.id}>
                <td>{quote.id}</td>
                <td>{quote.batchId}</td>
                <td>{quote.manufacturer}</td>
                <td>{quote.amount}</td>
                <td>{quote.time}</td>
                <td>{quote.score}</td>
                <td>{quote.submitted}</td>
                <td><StatusBadge status={quote.status} /></td>
                <td>
                  {quote.status === 'pending' ? (
                    <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.9rem' }} onClick={() => selectManufacturer(quote.id)}>
                      Select
                    </button>
                  ) : (
                    <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.9rem' }}>
                      View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderGeofencing = () => (
    <>
      <h2 className="section-title"><i className="fas fa-map-marker-alt"></i> Geo-Fencing & Compliance Monitoring</h2>
      
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Allowed Zones</div>
            <div className="card-icon">
              <i className="fas fa-globe-asia"></i>
            </div>
          </div>
          <div className="card-value">{geoFencingData.allowedZones.length}</div>
          <div className="card-change">India: North, South, East, West</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">Season Window Violations</div>
            <div className="card-icon">
              <i className="fas fa-calendar-times"></i>
            </div>
          </div>
          <div className="card-value">{geoFencingData.violations.filter(v => v.type === 'Season Window').length}</div>
          <div className="card-change negative"><i className="fas fa-arrow-up"></i> This month</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">AI Threshold Compliance</div>
            <div className="card-icon">
              <i className="fas fa-robot"></i>
            </div>
          </div>
          <div className="card-value">{geoFencingData.compliance.aiValidation}%</div>
          <div className="card-change positive"><i className="fas fa-arrow-up"></i> Within limits</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">Out-of-Range Violations</div>
            <div className="card-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
          </div>
          <div className="card-value">{geoFencingData.violations.filter(v => v.type === 'Geo-fence').length}</div>
          <div className="card-change negative"><i className="fas fa-arrow-up"></i> Collector moved</div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginTop: '30px' }}>
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}><i className="fas fa-map"></i> Compliance Dashboard</h3>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>_checkHarvestRules()</span>
              <span><i className="fas fa-check-circle" style={{ color: 'green' }}></i> {geoFencingData.compliance.harvestRules}% Pass</span>
            </div>
            <ProgressBar percentage={geoFencingData.compliance.harvestRules} />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>_checkQualityThresholds()</span>
              <span><i className="fas fa-check-circle" style={{ color: 'green' }}></i> {geoFencingData.compliance.qualityThresholds}% Pass</span>
            </div>
            <ProgressBar percentage={geoFencingData.compliance.qualityThresholds} />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>AI Model Validation</span>
              <span><i className="fas fa-check-circle" style={{ color: 'green' }}></i> {geoFencingData.compliance.aiValidation}% Pass</span>
            </div>
            <ProgressBar percentage={geoFencingData.compliance.aiValidation} />
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}><i className="fas fa-exclamation-triangle"></i> Recent Violations</h3>
          {geoFencingData.violations.map(violation => (
            <div key={violation.id} style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
              <div style={{ fontWeight: 'bold' }}>{violation.type}</div>
              <div style={{ fontSize: '0.9rem' }}>{violation.details}</div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                {violation.batchId || violation.collectorId} • {violation.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderSmartLabeling = () => (
    <>
      <h2 className="section-title"><i className="fas fa-qrcode"></i> Smart Label Generation</h2>
      
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Labels Generated</div>
            <div className="card-icon">
              <i className="fas fa-tags"></i>
            </div>
          </div>
          <div className="card-value">{blockchainData.polygon.nftsMinted}</div>
          <div className="card-change">This month: 124</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">ProductIDs Created</div>
              <div className="card-icon">
              <i className="fas fa-barcode"></i>
            </div>
          </div>
          <div className="card-value">{blockchainData.polygon.nftsMinted}</div>
          <div className="card-change">1:1 with batches</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">IPFS Metadata</div>
            <div className="card-icon">
              <i className="fas fa-database"></i>
            </div>
          </div>
          <div className="card-value">100% Available</div>
          <div className="card-change positive">All pinned</div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">NFT Mint Success</div>
            <div className="card-icon">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
          <div className="card-value">100%</div>
          <div className="card-change positive">No failures</div>
        </div>
      </div>
      
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginTop: '30px' }}>
        <h3 style={{ color: '#1b5e20', marginBottom: '20px' }}>Label Generation Workflow</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
          {['ProductID', 'LabelID', 'MetadataCID', 'Mint NFT'].map((step, index) => (
            <Fragment key={`step-${index}`}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: '#2e7d32', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontWeight: 'bold' }}>
                  {index + 1}
                </div>
                <div>{step}</div>
              </div>
              {index < 3 && <div style={{ flex: 1, height: '3px', background: '#2e7d32' }}></div>}
            </Fragment>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4 style={{ color: '#1b5e20', marginBottom: '10px' }}>QR Code Contents</h4>
            <ul style={{ paddingLeft: '20px' }}>
              <li>BatchID / TokenId</li>
              <li>URL to verification page</li>
              <li>Shortened IPFS gateway link</li>
              <li>Manufacturing date</li>
              <li>Expiry date</li>
              <li>Blockchain verification link</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#1b5e20', marginBottom: '10px' }}>Verification Status</h4>
            <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>NFT Mint Success:</span>
                <span><i className="fas fa-check-circle" style={{ color: 'green' }}></i> Confirmed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Public Chain Confirmation:</span>
                <span><i className="fab fa-polygon" style={{ color: 'green' }}></i> Polygon</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>IPFS Metadata:</span>
                <span><i className="fas fa-check-circle" style={{ color: 'green' }}></i> Available</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>QR Scans:</span>
                <span>{analytics.consumer.qrScans.toLocaleString()}</span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => openModal('generateLabelModal')} style={{ marginTop: '15px', width: '100%' }}>
              <i className="fas fa-qrcode"></i> Generate New Label
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderBlockchain = () => (
    <>
      <h2 className="section-title"><i className="fas fa-link"></i> Blockchain Management Panel</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1b5e20', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fab fa-hyperledger"></i> Hyperledger Fabric
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Last Transaction:</span>
              <span style={{ fontFamily: 'monospace' }}>{blockchainData.fabric.lastTx}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Batch States:</span>
              <span>{blockchainData.fabric.worldState} in world state</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Chaincode Executions:</span>
              <span>{blockchainData.fabric.chaincodeCalls.toLocaleString()} successful</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Total Transactions:</span>
              <span>{blockchainData.fabric.transactions.toLocaleString()}</span>
            </div>
          </div>
          
          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px' }}>
            <h4 style={{ color: '#1b5e20', marginBottom: '10px' }}>Fabric Chaincode Functions</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
              <div>• createBatch()</div>
              <div>• updateStage()</div>
              <div>• _checkHarvestRules()</div>
              <div>• _checkQualityThresholds()</div>
              <div>• manufactureMedicine()</div>
              <div>• generateLabel()</div>
            </div>
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1b5e20', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fab fa-polygon"></i> Polygon Public Chain
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>NFTs Minted:</span>
              <span style={{ fontFamily: 'monospace' }}>{blockchainData.polygon.nftsMinted}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Last TokenID:</span>
              <span style={{ fontFamily: 'monospace' }}>{blockchainData.polygon.lastTokenId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Contract Address:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{blockchainData.polygon.contractAddress}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Last Transaction Hash:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{blockchainData.polygon.lastTxHash}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={mintNFT}>
              <i className="fas fa-coins"></i> mintHerbNFT()
            </button>
            <button className="btn btn-secondary">
              <i className="fas fa-sync"></i> Re-sync Metadata
            </button>
            <button className="btn btn-secondary">
              <i className="fas fa-search"></i> Verify NFT
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Recent Blockchain Transactions</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Batch ID</th>
                <th>Chain</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2023-08-15 14:23</td>
                <td style={{ fontFamily: 'monospace' }}>Tx-2023-08-124</td>
                <td>Stage Update</td>
                <td>HB-2023-08-124</td>
                <td><StatusBadge status="inprogress" /></td>
                <td><StatusBadge status="completed" /></td>
              </tr>
              <tr>
                <td>2023-08-15 11:47</td>
                <td style={{ fontFamily: 'monospace' }}>0x5b2...9e1a</td>
                <td>NFT Mint</td>
                <td>HB-2023-08-115</td>
                <td><span className="status status-inprogress">Polygon</span></td>
                <td><StatusBadge status="completed" /></td>
              </tr>
              <tr>
                <td>2023-08-14 16:12</td>
                <td style={{ fontFamily: 'monospace' }}>Tx-2023-08-123</td>
                <td>Manufacturing</td>
                <td>HB-2023-08-119</td>
                <td><StatusBadge status="inprogress" /></td>
                <td><StatusBadge status="completed" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderAnalytics = () => {
    const currentSubTab = activeSubTab['analytics'] || 'consumer-analytics';
    
    return (
      <>
        <h2 className="section-title"><i className="fas fa-chart-bar"></i> Analytics & Reports</h2>
        
        <div className="tabs">
          {analyticsSubTabs.map(subTab => (
            <div 
              key={subTab} 
              className={`tab ${currentSubTab === subTab ? 'active' : ''}`}
              onClick={() => handleSubTabClick(subTab, 'analytics')}
            >
              {subTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>
          ))}
        </div>
        
        {currentSubTab === 'consumer-analytics' && (
          <div id="consumer-analytics" className="subtab-content active">
            <div className="dashboard-grid">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">QR Scans</div>
                  <div className="card-icon">
                    <i className="fas fa-qrcode"></i>
                  </div>
                </div>
                <div className="card-value">{analytics.consumer.qrScans.toLocaleString()}</div>
                <div className="card-change positive"><i className="fas fa-arrow-up"></i> 24% this month</div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Repeat Scans</div>
                  <div className="card-icon">
                    <i className="fas fa-redo"></i>
                  </div>
                </div>
                <div className="card-value">{analytics.consumer.repeatScans.toLocaleString()}</div>
                <div className="card-change positive">High engagement</div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Auth Failures</div>
                  <div className="card-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                </div>
                <div className="card-value">{analytics.consumer.authFailures}</div>
                <div className="card-change positive">Very low (0.2%)</div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Avg. Consumer Rating</div>
                  <div className="card-icon">
                    <i className="fas fa-star"></i>
                  </div>
                </div>
                <div className="card-value">{analytics.consumer.rating}/5.0</div>
                <div className="card-change positive">Excellent</div>
              </div>
            </div>

            <div className="user-info">
  {/* Notifications Bell with Badge */}
  <div className="notification-icon-container">
    <i 
      className="fas fa-bell" 
      style={{ fontSize: '1.2rem', color: '#2e7d32', cursor: 'pointer', position: 'relative' }}
      onClick={() => setShowNotifications(!showNotifications)}
    >
      {/* Notification Badge */}
      {notifications.length > 0 && (
        <span className="notification-badge">{notifications.length}</span>
      )}
    </i>
    
    {/* Notifications Dropdown */}
    {showNotifications && (
      <div className="notifications-dropdown">
        <div className="notifications-header">
          <h4>Notifications ({notifications.length})</h4>
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => setShowNotifications(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="notifications-list">
          {notifications.map(notification => (
            <div key={notification.id} className={`notification-dropdown-item ${notification.type}`}>
              <div className="notification-dropdown-content">
                <strong>{notification.title}</strong>
                <p>{notification.details}</p>
                <small>{notification.time}</small>
              </div>
              <button className="notification-mark-read">
                <i className="fas fa-check"></i>
              </button>
            </div>
          ))}
        </div>
        <div className="notifications-footer">
          <button className="btn btn-sm btn-block btn-secondary">
            Mark all as read
          </button>
          <button className="btn btn-sm btn-block btn-primary">
            View all notifications
          </button>
        </div>
      </div>
    )}
  </div>
  
  <div className="user-avatar">AD</div>
  <div>
    <div style={{ fontWeight: '600' }}>Admin User</div>
    <div style={{ fontSize: '0.9rem', color: '#666' }}>Super Administrator</div>
  </div>
</div>
            
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginTop: '30px' }}>
              <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>Region-wise QR Scans</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  {Object.entries(analytics.consumer.regionScans).map(([region, scans]) => (
                    <div key={region} style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span>{region.charAt(0).toUpperCase() + region.slice(1)} India:</span>
                        <span>{scans.toLocaleString()} scans</span>
                      </div>
                      <ProgressBar percentage={(scans / analytics.consumer.qrScans) * 100} />
                    </div>
                  ))}
                </div>
                <div>
                  <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>Consumer Feedback</h4>
                  <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontWeight: 'bold' }}>Positive Feedback</div>
                      <div>"Authentic herbs with complete transparency"</div>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontWeight: 'bold' }}>Areas for Improvement</div>
                      <div>"Faster QR code loading on mobile"</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Satisfaction Score</div>
                      <ProgressBar percentage={90} color="#ffb300" />
                      <div style={{ textAlign: 'right', fontSize: '0.9rem', marginTop: '5px' }}>90% Positive</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentSubTab === 'sustainability' && (
          <div id="sustainability" className="subtab-content">
            <div className="dashboard-grid">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Carbon Footprint</div>
                  <div className="card-icon">
                    <i className="fas fa-leaf"></i>
                  </div>
                </div>
                <div className="card-value">{analytics.sustainability.carbonFootprint}</div>
                <div className="card-change positive"><i className="fas fa-arrow-down"></i> 15% reduction</div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Water Saved</div>
                  <div className="card-icon">
                    <i className="fas fa-tint"></i>
                  </div>
                </div>
                <div className="card-value">{analytics.sustainability.waterSaved}</div>
                <div className="card-change positive">Traditional farming</div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Organic Compliance</div>
                  <div className="card-icon">
                    <i className="fas fa-seedling"></i>
                  </div>
                </div>
                <div className="card-value">{analytics.sustainability.organicCompliance}%</div>
                <div className="card-change positive">Certified organic</div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Geo-Conservation</div>
                  <div className="card-icon">
                    <i className="fas fa-globe"></i>
                  </div>
                </div>
                <div className="card-value">{analytics.sustainability.geoConservation}%</div>
                <div className="card-change positive">Biodiversity preserved</div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderSettings = () => (
    <>
      <h2 className="section-title"><i className="fas fa-cog"></i> Settings & Automation</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1b5e20', marginBottom: '20px' }}>Notification Rules</h3>
          
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.notifications.delayReminders} readOnly /> 
              Delay reminders
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.notifications.visitSchedule} readOnly /> 
              Visit schedule alerts
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.notifications.batchCompletion} readOnly /> 
              Batch completion alerts
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.notifications.testerAcceptance} readOnly /> 
              Tester acceptance alerts
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.notifications.manufacturerQuotes} readOnly /> 
              Manufacturer quote alerts
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.notifications.blockchainTx} readOnly /> 
              Blockchain transaction alerts
            </label>
          </div>
          
          <button className="btn btn-primary" style={{ marginTop: '15px' }}>Save Notification Settings</button>
        </div>
        
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1b5e20', marginBottom: '20px' }}>Automation Settings</h3>
          
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.automation.autoSelectTester} readOnly /> 
              Auto-select first tester
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.automation.autoEscalate} readOnly /> 
              Auto-escalate delayed stages
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.automation.weeklyAnalytics} readOnly /> 
              Auto-generate analytics weekly
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.automation.autoSyncIPFS} readOnly /> 
              Auto-sync IPFS reports
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.automation.autoAssignCollector} readOnly /> 
              Auto-assign nearest collector
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={settings.automation.autoValidateAI} readOnly /> 
              Auto-validate AI thresholds
            </label>
          </div>
          
          <button className="btn btn-primary" style={{ marginTop: '15px' }}>Save Automation Settings</button>
        </div>
      </div>
      
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginTop: '30px' }}>
        <h3 style={{ color: '#1b5e20', marginBottom: '20px' }}>System Configuration</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>Fabric Identity Enrollment</h4>
            <div className="form-group">
              <label>CA Server URL</label>
              <input type="text" value={settings.system.fabricCA} readOnly />
            </div>
            <div className="form-group">
              <label>Admin Certificate Path</label>
              <input type="text" value="/etc/fabric/certs/admin-cert.pem" readOnly />
            </div>
          </div>
          
          <div>
            <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>Public Chain Configuration</h4>
            <div className="form-group">
              <label>NFT Contract Address</label>
              <input type="text" value={settings.system.nftContract} readOnly />
            </div>
            <div className="form-group">
              <label>Polygon RPC Endpoint</label>
              <input type="text" value={settings.system.polygonRPC} readOnly />
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#1b5e20', marginBottom: '15px' }}>IPFS Health Monitoring</h4>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#e8f5e9', padding: '15px', borderRadius: '8px' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>Metadata Availability</div>
              <div>All CIDs pinned and available via {settings.system.ipfsGateway}</div>
            </div>
            <div><i className="fas fa-check-circle" style={{ color: 'green', fontSize: '1.5rem' }}></i></div>
          </div>
        </div>
      </div>
    </>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUserManagement();
      case 'batches':
        return renderBatchManagement();
      case 'collectors':
        return renderCollectorManagement();
      case 'testers':
        return renderTesterManagement();
      case 'manufacturers':
        return renderManufacturerManagement();
      case 'geofencing':
        return renderGeofencing();
      case 'labeling':
        return renderSmartLabeling();
      case 'blockchain':
        return renderBlockchain();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h1><i className="fas fa-leaf"></i> <span>VirtuHerbChain</span></h1>
        </div>
        <ul className="nav-menu">
          {navItems.map(item => (
            <li 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabClick(item.id)}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="page-title">
            <h2>Admin Dashboard</h2>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div className="user-info">
            <i className="fas fa-bell" style={{ fontSize: '1.2rem', color: '#2e7d32', cursor: 'pointer' }}></i>
            <div className="user-avatar">AD</div>
            <div>
              <div style={{ fontWeight: '600' }}>Admin User</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Super Administrator</div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div id={activeTab} className="tab-content active">
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      {modalOpen === 'assignCollectorModal' && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ color: '#1b5e20' }}>Assign Collector</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            <div className="form-group">
              <label>Select Batch</label>
              <select defaultValue="">
                <option value="">Select a batch...</option>
                {batches.filter(b => b.stage === 1).map(batch => (
                  <option key={batch.id} value={batch.id}>{batch.id} ({batch.herb})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Select Collector</label>
              <select defaultValue="">
                <option value="">Select a collector...</option>
                {collectors.filter(c => c.status === 'active').map(collector => (
                  <option key={collector.id} value={collector.id}>
                    {collector.name} ({collector.region}) - Rating: {collector.rating}/5.0
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Scheduled Visit Date</label>
              <input type="date" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={assignCollector}>Assign Collector</button>
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {modalOpen === 'generateLabelModal' && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ color: '#1b5e20' }}>Generate LabelID</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            <div className="form-group">
              <label>Select Batch for Labeling</label>
              <select defaultValue="">
                <option value="">Select a completed batch...</option>
                {batches.filter(b => b.stage === 7).map(batch => (
                  <option key={batch.id} value={batch.id}>{batch.id} ({batch.herb}) - Manufacturing Complete</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Label Type</label>
              <select defaultValue="standard">
                <option value="standard">Standard QR Label</option>
                <option value="enhanced">Enhanced Security Label</option>
                <option value="premium">Premium Holographic Label</option>
              </select>
            </div>
            <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
              <h4 style={{ color: '#1b5e20', marginBottom: '10px' }}>Will Generate:</h4>
              <ul>
                <li>ProductID: PRD-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01</li>
                <li>LabelID: LBL-{Math.random().toString(36).substring(2, 15)} (hashed QR)</li>
                <li>MetadataCID: Qm{Math.random().toString(36).substring(2, 15)} (IPFS)</li>
                <li>Public Chain Transaction on Polygon</li>
                <li>QR Code for consumer verification</li>
              </ul>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={generateLabel}>Generate Label</button>
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {modalOpen === 'mintNFTModal' && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ color: '#1b5e20' }}>Mint Herb NFT</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            <div className="form-group">
              <label>Batch ID</label>
              <input type="text" value="HB-2023-08-119" readOnly />
            </div>
            <div className="form-group">
              <label>Metadata CID (IPFS)</label>
              <input type="text" value="QmXyZ123...abc456" readOnly />
            </div>
            <div className="form-group">
              <label>Manufacturing Summary</label>
              <textarea rows="4" readOnly>Turmeric powder, 100kg, Organic certified, Harvested Aug 2023, Processed by AyurPharma Ltd., Expiry: Aug 2025</textarea>
            </div>
            <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
              <h4 style={{ color: '#1b5e20', marginBottom: '10px' }}>NFT Minting Details</h4>
              <div>Network: Polygon Mainnet</div>
              <div>Contract: {blockchainData.polygon.contractAddress}</div>
              <div>Gas Estimate: ~0.01 MATIC</div>
              <div>Token ID: #{parseInt(blockchainData.polygon.lastTokenId.slice(1)) + 1}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={confirmMint}>Confirm & Mint NFT</button>
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;