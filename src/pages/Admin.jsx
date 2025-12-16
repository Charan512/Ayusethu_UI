import React, { useState, useEffect, useRef, Fragment } from "react";
import adminApi from "../api/adminApi";
import "../styles/Admin.css";

/* =========================
   HELPERS
========================= */
const getBatchId = (batch) => batch?.batch_id || batch?.id || "";
const isSuperAdmin =
  localStorage.getItem("role") === "superadmin";

/* =========================
   COMPONENT
========================= */
const Admin = () => {

  /* =========================
   CORE STATE
========================= */
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState({
    users: "create-user",
    batches: "stage-tracking",
    analytics: "consumer-analytics",
  });


  const [modalOpen, setModalOpen] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mintBatch, setMintBatch] = useState(null);

  const [batches, setBatches] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [testers, setTesters] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [manufacturerQuotes, setManufacturerQuotes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const LABEL_MODE = "SIMULATION";
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState(null);
  const [visitDate, setVisitDate] = useState("");
  const [labelType, setLabelType] = useState("standard");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState({
    activeFarmers: 0,
    batchesInProgress: 0,
    pendingTesterAssignments: 0,
    pendingManufacturerQuotes: 0,
    completedBatches: 0,
    blockchainTransactions: 0,
    delayedStages: 0,
    complianceViolations: 0,
  });
  const [chartsInitialized, setChartsInitialized] = useState(false);
  const batchChartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const STATUS_TO_STAGE = {
    planting: 1,
    growing_stage_1: 2,
    growing_stage_2: 3,
    growing_stage_3: 4,
    harvest_completed: 5,
    verify: 5,
    testing_assigned: 6,
    testing_in_progress: 6,
    bidding_open: 7,
    manufacturing_assigned: 7,
    manufacturing_done: 7,
    packaged: 7,
    blockchain_anchored: 7,
  };

  const normalizeBatch = (batch) => {
    const stage = STATUS_TO_STAGE[batch.status] || 1;

    return {
      ...batch,

      // 🔑 HARD REQUIREMENTS FOR UI
      stage,
      completeness: Math.round((stage / 7) * 100),

      // Optional but stabilizes tables
      herb: batch.herb_name,
      timeline: batch.timeline ? Object.keys(batch.timeline).join(" → ") : "N/A",
    };
  };
  const normalizeQuote = (q) => ({
    quoteId: q.id,
    manufacturerId: q.manufacturer_id,
    batchId: q.batch_id,
    manufacturer: q.manufacturer_name,
    amount: `₹${q.price}`,
    time: q.processing_time || "N/A",
    score: q.quality_score ?? "—",
    submitted: q.submitted_at,
    status: q.status || "pending",
  });

  /* =========================
   AUTH GUARD
========================= */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  /* =========================
     DATA LOAD
  ========================= */
  const fetchAllAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        batchesRes,
        collectorsRes,
        testersRes,
        manufacturersRes,
      ] = await Promise.all([
        adminApi.get("/admin/dashboard"),
        adminApi.get("/admin/collectors"),
        adminApi.get("/admin/testers"),
        adminApi.get("/admin/manufacturers"),
      ]);

      const rawBatches = batchesRes.data?.batches || batchesRes.data || [];
      setBatches(rawBatches.map(normalizeBatch));

      setCollectors(collectorsRes.data || []);
      setTesters(testersRes.data || []);
      setManufacturers(manufacturersRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };
  const markAllNotificationsRead = async () => {
    try {
      await adminApi.put("/notifications/read-all");
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
    }
  };

  const viewAllNotifications = () => {
    setShowNotifications(false);
    openModal("allNotificationsModal");
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);
  /* =========================
   ACTIONS
========================= */
  const assignCollector = async () => {
    try {
      const selectedCollector = collectors.find(c => c.id === selectedCollectorId);

      if (!selectedCollector || !selectedBatchId) {
        alert("Select batch and collector");
        return;
      }

      await adminApi.put(`/admin/assign-collector/${selectedBatchId}`, {
        id: selectedCollector.id,
        name: selectedCollector.name,
        visit_date: visitDate
      });

      alert("Collector assigned");
      closeModal();
      await fetchBatches();
    } catch (err) {
      console.error(err);
      alert("Assignment failed");
    }
  };

  const publishTesterRequest = async () => {
    const batch = batches.find(b => getBatchId(b) === selectedBatchId);
    if (!batch) {
      alert("Invalid batch selected");
      return;
    }
    
    if (!["verify", "harvest_completed"].includes(batch.status)) {
      alert("Batch must be in verify or harvest completed state");
      return;
    }


    try {
      await adminApi.post("/admin/publish-tester-request", {
        batch_id: selectedBatchId,
      });

      alert("Tester request published. First tester wins.");
      await fetchBatches();

      /* 🔥 FIX ISSUE 3 */
      setSelectedBatchId(null);   // reset previous selection
      closeModal();

    } catch (err) {
      console.error(err);
      alert("Failed to publish tester request");
    }
  };


  const fetchQuotes = async (batchId) => {
    try {
      const res = await adminApi.get(`/admin/quotes/${batchId}`);
      setManufacturerQuotes((res.data || []).map(normalizeQuote));
    } catch {
      setManufacturerQuotes([]);
    }
  };


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
  const fetchNotifications = async () => {
    try {
      const res = await adminApi.get("/notifications"); // ✅ FIX
      setNotifications(
        (res.data || []).map(n => ({ ...n, id: n.id || n._id }))
      );

    } catch {
      setNotifications([]);
    }
  };
  useEffect(() => {
    if (selectedBatchId) {
      fetchQuotes(selectedBatchId);
    }
  }, [selectedBatchId]);


  useEffect(() => {
    fetchNotifications();
  }, []);


  // Helper function to fetch batches only
  const fetchBatches = async () => {
    try {
      const res = await adminApi.get("/admin/dashboard");
      const raw = res.data?.batches || res.data || [];
      setBatches(raw.map(normalizeBatch));
    } catch (err) {
      console.error("Batch fetch failed", err);
    }
  };






  // Initialize charts
  useEffect(() => {
    if (!chartsInitialized) {
      (async () => {
        try {
          const { Chart } = await import('chart.js/auto');

          if (batchChartRef.current) {
            const ctx = batchChartRef.current.getContext('2d');

            if (chartInstanceRef.current) {
              chartInstanceRef.current.destroy();
            }

            chartInstanceRef.current = new Chart(ctx, {
              type: 'line',
              data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                datasets: [
                  {
                    label: 'Batches Completed',
                    data: [65, 78, 90, 85, 92, 88, 95, 124],
                    borderColor: '#2e7d32',
                    fill: true,
                    tension: 0.4
                  }
                ]
              },
              options: { responsive: true }
            });
          }

          setChartsInitialized(true);
        } catch (e) {
          console.error(e);
        }
      })();
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

  // Notification handler
  const markNotificationReadLocal = async (notificationId) => {
    try {
      await adminApi.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (e) {
      console.error("Failed to mark notification read", e);
    }
  };




  // TODO: Add backend call when endpoint is ready
  // await adminApi.post(`/admin/notifications/${notificationId}/read`);

  // Action functions
  const generateLabel = async () => {
    // ❌ ISSUE: Backend endpoint /admin/generate-label does NOT exist yet
    // TODO: Add backend endpoint or remove this feature
    try {
      // Temporarily disabled until backend endpoint is created
      // await adminApi.post("/admin/generate-label", {
      //   batchId: selectedBatchId,
      //   labelType,
      // });

      // Mock success for now
      console.warn("generateLabel: Backend endpoint not implemented yet");
      await fetchBatches();
      alert("Label generation requested (backend pending)");
      closeModal();
    } catch (err) {
      console.error("Label generation failed:", err);
      alert("Label generation failed");
    }
  };


  const mintNFT = (batch) => {
    if (!batch) {
      alert("Please select a batch first");
      return;
    }
    setMintBatch(batch);
    openModal('mintNFTModal');
  };


  const confirmMint = () => {
    alert('NFT minting transaction submitted to Polygon network!\nTransaction hash: 0x5b2...9e1a\nTokenID: #12479');
    closeModal();
  };

  const selectManufacturer = async (quoteId) => {
    try {
      const quote = manufacturerQuotes.find(q => q.quoteId === quoteId);
      if (!quote) {
        alert("Quote not found");
        return;
      }

      // TODO: Update when backend endpoint is finalized
      await adminApi.post("/admin/select-manufacturer", {
        batch_id: quote.batchId,
        manufacturer_id: quote.manufacturerId,
      });

      await fetchBatches();
      alert("Manufacturer selected");
    } catch (err) {
      console.error("Manufacturer selection failed:", err);
      alert("Selection failed");
    }
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
  useEffect(() => {
    setKpis(prev => ({
      ...prev,
      batchesInProgress: batches.filter(b => b.stage < 7).length,
      completedBatches: batches.filter(b => b.stage === 7).length,
      pendingTesterAssignments: batches.filter(
        b => ["verify", "harvest_completed"].includes(b.status)
      ).length,

      pendingManufacturerQuotes: manufacturerQuotes.filter(q => q.status === "pending").length,

    }));
  }, [batches, manufacturerQuotes]);
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Progress bar component
  const ProgressBar = ({ percentage, color = '#2e7d32' }) => (
    <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, borderRadius: '4px' }}></div>
    </div>
  );

  // Quick actions
  const quickActions = [
    { id: 'assignCollector', icon: 'fa-user-plus', label: 'Assign Collector', modal: 'assignCollectorModal' },

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
          <h3 className="section-title"><i className="fas fa-bell"></i> Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon success"><i className="fas fa-check-circle"></i></div>
              <div>
                <strong>Batch HB-2023-08-124</strong> moved to Stage 3
                <div className="activity-time">10 minutes ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon warning"><i className="fas fa-exclamation-triangle"></i></div>
              <div>
                <strong>Collector C-103</strong> delayed visit by 2 hours
                <div className="activity-time">45 minutes ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon info"><i className="fas fa-info-circle"></i></div>
              <div>
                <strong>New manufacturer</strong> HerbCare Solutions registered
                <div className="activity-time">2 hours ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon success"><i className="fas fa-link"></i></div>
              <div>
                <strong>Blockchain sync</strong> completed for 5 batches
                <div className="activity-time">3 hours ago</div>
              </div>
            </div>
          </div>
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
            {batches.map(batch => {
              // 🔴 FIX: Defensive handling for undefined fields
              const completeness = batch.completeness ?? Math.round((batch.stage / 7) * 100);
              const timeline = batch.timeline || "N/A";

              return (
                <tr key={getBatchId(batch)}>
                  <td>{getBatchId(batch)}</td>
                  <td>{batch.herb || batch.herb_name}</td>
                  <td>Stage {batch.stage}/7</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '60px' }}>{completeness}%</div>
                      <ProgressBar percentage={completeness} />
                    </div>
                  </td>
                  <td>{timeline}</td>
                  <td><StatusBadge status={batch.status} /></td>
                  <td><button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.9rem' }}>View</button></td>
                </tr>
              );
            })}
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
                  {batches.map(batch => {
                    // 🔴 FIX: Defensive handling for undefined fields
                    const completeness = batch.completeness ?? Math.round((batch.stage / 7) * 100);
                    const delay = batch.delay ?? 0;

                    return (
                      <tr key={getBatchId(batch)}>
                        <td>{getBatchId(batch)}</td>
                        <td><i className="fas fa-check-circle" style={{ color: batch.stage >= 1 ? 'green' : 'gray' }}></i></td>
                        <td><i className="fas fa-check-circle" style={{ color: batch.stage >= 2 ? 'green' : 'gray' }}></i></td>
                        <td><i className={`fas ${batch.stage >= 3 ? (delay > 0 ? 'fa-exclamation-triangle text-warning' : 'fa-check-circle text-success') : 'fa-clock text-gray'}`}></i></td>
                        <td><i className="fas fa-check-circle" style={{ color: batch.stage >= 4 ? 'green' : 'gray' }}></i></td>
                        <td><i className="fas fa-check-circle" style={{ color: batch.stage >= 5 ? 'green' : 'gray' }}></i></td>
                        <td><i className="fas fa-flask" style={{ color: batch.stage >= 6 ? 'green' : 'gray' }}></i></td>
                        <td><i className="fas fa-industry" style={{ color: batch.stage >= 7 ? 'green' : 'gray' }}></i></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '40px' }}>{completeness}%</div>
                            <ProgressBar percentage={completeness} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
            {LABEL_MODE === "SIMULATION" && (
              <div
                style={{
                  marginTop: '10px',
                  fontSize: '0.85rem',
                  color: '#ff9800',
                  background: '#fff8e1',
                  padding: '8px',
                  borderRadius: '6px'
                }}
              >
                ⚠ <strong>Demo Mode:</strong>
                LabelID, IPFS CID, and NFT minting are simulated for presentation.
                No real blockchain or IPFS transaction occurs.
              </div>
            )}

            {isSuperAdmin ? (
              <button
                className="btn btn-primary"
                onClick={() => openModal('generateLabelModal')}
                style={{ marginTop: '15px', width: '100%' }}
              >
                <i className="fas fa-qrcode"></i> Generate New Label
              </button>
            ) : (
              <small style={{ color: '#999' }}>
                Label generation restricted
              </small>
            )}

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
            {isSuperAdmin && (
              <button
                className="btn btn-primary"
                onClick={() => mintNFT(batches.find(b => getBatchId(b) === selectedBatchId))}
              >
                <i className="fas fa-coins"></i> mintHerbNFT()
              </button>
            )}

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


  // Loading state
  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#2e7d32', marginBottom: '20px' }}></i>
          <h2>Loading Admin Dashboard...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#d32f2f', marginBottom: '20px' }}></i>
          <h2 style={{ color: '#d32f2f', marginBottom: '10px' }}>Error Loading Data</h2>
          <p style={{ marginBottom: '20px' }}>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h1>AyuSethu</h1>
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
            <div className="notification-icon-container">
              <i
                className="fas fa-bell"
                style={{ fontSize: '1.2rem', color: '#2e7d32', cursor: 'pointer', position: 'relative' }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                {/* Notification Badge */}
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="notification-badge">
                    {notifications.filter(n => !n.read).length}
                  </span>
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
                      <div key={notification.id} className={`notification-dropdown-item ${notification.type || 'info'}`}>
                        <div className="notification-dropdown-content">
                          <strong>{notification.title || "System Update"}</strong>
                          <p>{notification.details || notification.message || "No details available"}</p>
                          <small>{notification.time || "Just now"}</small>
                        </div>
                        <button
                          className="notification-mark-read"
                          onClick={() => markNotificationReadLocal(notification.id)}
                          title="Mark as read"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="notifications-footer">
                    <button className="btn btn-sm btn-block btn-secondary"
                      onClick={markAllNotificationsRead}
                    >
                      Mark all as read
                    </button>
                    <button className="btn btn-sm btn-block btn-primary"
                      onClick={viewAllNotifications}
                    >
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
              <select value={selectedBatchId || ""} onChange={e => setSelectedBatchId(e.target.value)}>
                <option value="">Select a batch...</option>
                {batches.filter(b => b.stage === 1).map(batch => (
                  <option key={getBatchId(batch)} value={getBatchId(batch)}>
                    {getBatchId(batch)} ({batch.herb || batch.herb_name})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Select Collector</label>
              <select value={selectedCollectorId || ""} onChange={e => setSelectedCollectorId(e.target.value)}>
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
              <input
                type="date"
                value={visitDate}
                onChange={e => setVisitDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={assignCollector}>Assign Collector</button>
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {modalOpen === 'publishTesterModal' && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ color: '#1b5e20' }}>
                Publish Tester Request
              </h2>
              <span className="close-modal" onClick={closeModal}>
                &times;
              </span>
            </div>

            <div className="form-group">
              <label>Select Batch for Testing</label>
              <select
                value={selectedBatchId || ""}
                onChange={(e) => setSelectedBatchId(e.target.value)}
              >
                <option value="">Select batch...</option>

                {batches
                  .filter(
                    (b) =>
                      (b.status === "verify" || b.status === "harvest_completed")
                  )

                  .map((batch) => (
                    <option
                      key={getBatchId(batch)}
                      value={getBatchId(batch)}
                    >
                      {getBatchId(batch)} ({batch.herb || batch.herb_name})
                    </option>
                  ))}
              </select>
            </div>

            <div
              style={{
                background: '#e8f5e9',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                marginBottom: '15px'
              }}
            >
              📢 This will notify <strong>all testers</strong>.
              The <strong>first tester</strong> to accept will be assigned automatically.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {isSuperAdmin ? (
                <button
                  className="btn btn-primary"
                  onClick={publishTesterRequest}
                  disabled={!selectedBatchId}
                >
                  Publish Request
                </button>
              ) : (
                <small style={{ color: '#999' }}>
                  Restricted to Super Admin
                </small>
              )}

              <button
                className="btn btn-secondary"
                onClick={closeModal}
              >
                Cancel
              </button>
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
            {LABEL_MODE === "SIMULATION" && (
              <div style={{
                background: '#fff3cd',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '0.9rem'
              }}>
                ⚠ <strong>Simulation Mode:</strong>
                LabelID, IPFS CID and Blockchain entries are <strong>mocked</strong>.
                No real blockchain or IPFS write occurs.
              </div>
            )}

            <div className="form-group">
              <label>Select Batch for Labeling</label>
              <select value={selectedBatchId || ""} onChange={e => setSelectedBatchId(e.target.value)}>
                <option value="">Select a completed batch...</option>
                {batches.filter(b => b.stage === 7).map(batch => (
                  <option key={getBatchId(batch)} value={getBatchId(batch)}>
                    {getBatchId(batch)} ({batch.herb || batch.herb_name}) - Manufacturing Complete
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Label Type</label>
              <select value={labelType} onChange={e => setLabelType(e.target.value)}>
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
              <button
                className="btn btn-primary"
                onClick={generateLabel}
                disabled={LABEL_MODE !== "SIMULATION" && LABEL_MODE !== "LIVE"}
              >
                Generate Label
              </button>

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
              <input
                type="text"
                value={mintBatch ? getBatchId(mintBatch) : ""}
                readOnly
              />

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
            {LABEL_MODE === "SIMULATION" && (
              <div style={{
                background: '#fff3cd',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '10px'
              }}>
                ⚠ NFT minting is disabled in simulation mode.
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={confirmMint}
                disabled={LABEL_MODE === "SIMULATION"}
              >
                Confirm & Mint NFT
              </button>

              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {modalOpen === "allNotificationsModal" && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>All Notifications</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>

            {notifications.map(n => (
              <div key={n.id} style={{
                padding: '10px',
                borderBottom: '1px solid #eee'
              }}>
                <strong>{n.title || "Notification"}</strong>
                <p>{n.message}</p>
                <small>{n.time || "—"}</small>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;