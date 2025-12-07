import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Admin.css';

// Card Component
function Card({ title, value, children, color = 'primary', icon, className = '' }) {
  return (
    <motion.div 
      className={`card ${color} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-header">
        {icon && <div className="card-icon">{icon}</div>}
        <div>
          <h3 className="card-title">{title}</h3>
          <p className="card-value">{value}</p>
        </div>
      </div>
      {children && <div className="card-content">{children}</div>}
    </motion.div>
  );
}

// Button Component
function Button({ children, variant = 'primary', onClick, icon, size = 'medium', fullWidth = false, className = '' }) {
  return (
    <motion.button 
      className={`btn ${variant} ${size} ${fullWidth ? 'full-width' : ''} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </motion.button>
  );
}

// Badge Component
function Badge({ children, variant = 'default', size = 'medium' }) {
  return <span className={`badge ${variant} ${size}`}>{children}</span>;
}

// Progress Bar Component
function ProgressBar({ value, max = 100, label, color = 'primary', showPercentage = true }) {
  const percentage = (value / max) * 100;
  
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-header">
        {label && <span className="progress-label">{label}</span>}
        {showPercentage && <span className="progress-percentage">{value}/{max}</span>}
      </div>
      <div className="progress-bar-background">
        <motion.div 
          className={`progress-bar-fill ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// Modal Component
function Modal({ isOpen, onClose, title, children, size = 'medium' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className={`modal-content ${size}`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Notification Component
function Notification({ message, type = 'info', onClose }) {
  return (
    <motion.div 
      className={`notification ${type}`}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <div className="notification-content">
        <div className="notification-icon">
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'warning' && '⚠'}
          {type === 'info' && 'ℹ'}
        </div>
        <span className="notification-message">{message}</span>
      </div>
      <button className="notification-close" onClick={onClose}>×</button>
    </motion.div>
  );
}

// Table Component
function Table({ columns, data, onRowClick, emptyMessage = "No data available" }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'clickable' : ''}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render ? column.render(row[column.accessor], row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="empty-state">
                <div className="empty-content">
                  <div className="empty-icon">📊</div>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Chart Component
function Chart({ type = 'bar', data, labels, height = 300 }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (canvasRef.current && data && labels) {
      const ctx = canvasRef.current.getContext('2d');
      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      if (type === 'bar') {
        drawBarChart(ctx, data, labels);
      } else if (type === 'line') {
        drawLineChart(ctx, data, labels);
      }
    }
  }, [type, data, labels, height]);
  
  const drawBarChart = (ctx, data, labels) => {
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const maxValue = Math.max(...data);
    const barWidth = (width - 100) / data.length;
    
    // Draw bars
    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * (height - 60);
      const x = 50 + (index * barWidth);
      const y = height - barHeight - 30;
      
      ctx.fillStyle = `hsl(${index * 40}, 70%, 60%)`;
      ctx.fillRect(x, y, barWidth - 10, barHeight);
      
      // Draw label
      ctx.fillStyle = '#374151';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x + (barWidth - 10) / 2, height - 10);
      
      // Draw value
      ctx.fillStyle = '#111827';
      ctx.fillText(value, x + (barWidth - 10) / 2, y - 5);
    });
  };
  
  const drawLineChart = (ctx, data, labels) => {
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const maxValue = Math.max(...data);
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    
    data.forEach((value, index) => {
      const x = 50 + (index * (width - 100) / (data.length - 1));
      const y = height - 30 - ((value / maxValue) * (height - 60));
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      // Draw point
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw label
      ctx.fillStyle = '#374151';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x, height - 10);
    });
    
    ctx.stroke();
  };
  
  return (
    <div className="chart-container">
      <canvas 
        ref={canvasRef}
        width={800}
        height={height}
        className="chart-canvas"
      />
    </div>
  );
}

// Map Component
function MapComponent({ locations, center, zoom = 10 }) {
  const mapRef = useRef(null);
  
  useEffect(() => {
    // This would integrate with a real map library like Leaflet or Google Maps
    // For now, we'll create a placeholder
    if (mapRef.current) {
      // Initialize map here
    }
  }, [locations, center, zoom]);
  
  return (
    <div className="map-container">
      <div ref={mapRef} className="map-placeholder">
        <div className="map-overlay">
          <h4>Geo-Fencing & Compliance Map</h4>
          <p>Showing {locations?.length || 0} active locations</p>
        </div>
        <div className="map-markers">
          {locations?.map((loc, index) => (
            <div 
              key={index}
              className="map-marker"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`
              }}
            >
              <div className="marker-tooltip">
                <strong>{loc.name}</strong>
                <span>{loc.type}</span>
                <span>Status: {loc.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Admin Dashboard Component
export default function AdminDashboard() {
  // State Management
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [systemHealth, setSystemHealth] = useState({
    blockchain: { status: 'healthy', uptime: 99.9 },
    database: { status: 'healthy', uptime: 99.8 },
    api: { status: 'healthy', uptime: 99.7 },
    storage: { status: 'healthy', uptime: 99.5 }
  });
  
  // Farmer Portal Dashboard States
  const [farmers, setFarmers] = useState([
    { 
      id: 'FARM-001',
      name: 'Rajesh Kumar', 
      email: 'rajesh@example.com',
      phone: '+91 9876543210',
      herb: 'Tulsi', 
      location: 'Madurai, Tamil Nadu', 
      farmSize: '5 acres',
      status: 'active',
      compliance: 'A+',
      registeredDate: '2024-01-15',
      batchesCompleted: 12,
      revenue: '₹2,45,000'
    },
    { 
      id: 'FARM-002',
      name: 'Priya Sharma', 
      email: 'priya@example.com',
      phone: '+91 9876543211',
      herb: 'Ashwagandha', 
      location: 'Nagpur, Maharashtra', 
      farmSize: '8 acres',
      status: 'active',
      compliance: 'A',
      registeredDate: '2024-01-14',
      batchesCompleted: 8,
      revenue: '₹1,89,000'
    }
  ]);
  
  // Batch Management
  const [batches, setBatches] = useState([
    {
      id: 'BATCH-2024-001',
      herb: 'Tulsi',
      quantity: '500 kg',
      farmer: 'Rajesh Kumar',
      farmerId: 'FARM-001',
      collector: 'Govind Singh',
      tester: 'Dr. Sharma Lab',
      manufacturer: 'Himalaya Herbals',
      status: 'manufacturing',
      timeline: {
        planting: '2024-01-15',
        collection: '2024-01-20',
        testing: '2024-01-22',
        manufacturing: '2024-01-25',
        packaging: null,
        distribution: null
      },
      delayFlags: 0,
      complianceScore: 94,
      gpsCompliance: true,
      labelId: 'LABEL-TUL-2024-001',
      txHash: '0x1234...abcd'
    },
    {
      id: 'BATCH-2024-002',
      herb: 'Ashwagandha',
      quantity: '800 kg',
      farmer: 'Priya Sharma',
      farmerId: 'FARM-002',
      collector: 'Anil Kumar',
      tester: 'AYUSH Testing Center',
      manufacturer: 'Dabur India',
      status: 'testing',
      timeline: {
        planting: '2024-01-16',
        collection: '2024-01-21',
        testing: '2024-01-23',
        manufacturing: null,
        packaging: null,
        distribution: null
      },
      delayFlags: 1,
      complianceScore: 88,
      gpsCompliance: true,
      labelId: null,
      txHash: null
    }
  ]);
  
  // Collector Management
  const [collectors, setCollectors] = useState([
    { 
      id: 'COL-001',
      name: 'Govind Singh', 
      location: 'Madurai, TN', 
      status: 'active',
      assignedBatches: 3,
      completedCollections: 12,
      rating: 4.8,
      phone: '+91 9876543220',
      zones: ['South Tamil Nadu'],
      lastSeen: '10 min ago'
    },
    { 
      id: 'COL-002',
      name: 'Anil Kumar', 
      location: 'Nagpur, MH', 
      status: 'active',
      assignedBatches: 5,
      completedCollections: 18,
      rating: 4.6,
      phone: '+91 9876543221',
      zones: ['Maharashtra'],
      lastSeen: '30 min ago'
    }
  ]);
  
  // Tester Management
  const [testers, setTesters] = useState([
    {
      id: 'TEST-001',
      name: 'Dr. Sharma Lab',
      location: 'Delhi',
      accreditation: 'NABL Certified',
      specialization: ['Tulsi', 'Ashwagandha', 'Turmeric'],
      rating: 4.9,
      turnaroundTime: '48 hours',
      status: 'active',
      testsCompleted: 156
    },
    {
      id: 'TEST-002',
      name: 'AYUSH Testing Center',
      location: 'Bangalore',
      accreditation: 'AYUSH Certified',
      specialization: ['All Herbs'],
      rating: 4.7,
      turnaroundTime: '72 hours',
      status: 'active',
      testsCompleted: 234
    }
  ]);
  
  // Test Results
  const [testResults, setTestResults] = useState([
    {
      batchId: 'BATCH-2024-001',
      tester: 'Dr. Sharma Lab',
      date: '2024-01-22',
      results: {
        moisture: '8%',
        heavyMetals: 'Below Threshold',
        pesticides: 'Not Detected',
        microbialLoad: 'Within Limits',
        activeCompounds: 'Optimal',
        dnaAuthenticity: 'Confirmed'
      },
      grade: 'Premium (AAA)',
      certificate: 'CERT-2024-001'
    }
  ]);
  
  // Manufacturer Management
  const [manufacturers, setManufacturers] = useState([
    {
      id: 'MFG-001',
      name: 'Himalaya Herbals',
      location: 'Bangalore',
      accreditation: 'GMP Certified',
      specialization: 'All Ayurvedic Herbs',
      rating: 4.8,
      capacity: '5000 kg/month',
      status: 'active',
      bidsWon: 45
    },
    {
      id: 'MFG-002',
      name: 'Dabur India',
      location: 'Delhi',
      accreditation: 'ISO 9001',
      specialization: 'Traditional Medicines',
      rating: 4.9,
      capacity: '10000 kg/month',
      status: 'active',
      bidsWon: 78
    }
  ]);
  
  // Manufacturing Logs
  const [manufacturingLogs, setManufacturingLogs] = useState([
    {
      batchId: 'BATCH-2024-001',
      manufacturer: 'Himalaya Herbals',
      steps: {
        washing: { date: '2024-01-25', status: 'completed' },
        drying: { date: '2024-01-26', temp: '40°C', status: 'completed' },
        grinding: { date: '2024-01-27', status: 'completed' },
        extraction: { method: 'Cold Extraction', status: 'in-progress' },
        packaging: { status: 'pending' }
      },
      finalProduct: {
        form: 'Capsules',
        quantity: '10000 units',
        shelfLife: '2 years'
      },
      photos: 5,
      certificate: 'MFG-CERT-2024-001'
    }
  ]);
  
  // Consumer Analytics
  const [consumerAnalytics, setConsumerAnalytics] = useState({
    totalScans: 12456,
    uniqueUsers: 8923,
    avgRating: 4.7,
    popularProducts: ['Tulsi Gold Capsules', 'Ashwagandha Powder', 'Turmeric Extract'],
    scanLocations: [
      { city: 'Mumbai', count: 2345 },
      { city: 'Delhi', count: 1987 },
      { city: 'Bangalore', count: 1567 },
      { city: 'Chennai', count: 1234 }
    ],
    feedback: [
      { product: 'Tulsi Gold Capsules', rating: 4.8, count: 234 },
      { product: 'Ashwagandha Powder', rating: 4.5, count: 189 },
      { product: 'Turmeric Extract', rating: 4.6, count: 156 }
    ]
  });
  
  // Blockchain Transactions
  const [blockchainTx, setBlockchainTx] = useState([
    {
      hash: '0x1234...abcd',
      type: 'Batch Creation',
      batchId: 'BATCH-2024-001',
      timestamp: '2024-01-15 10:30:00',
      status: 'confirmed',
      gasUsed: '45000'
    },
    {
      hash: '0x5678...efgh',
      type: 'Test Results',
      batchId: 'BATCH-2024-001',
      timestamp: '2024-01-22 14:45:00',
      status: 'confirmed',
      gasUsed: '32000'
    }
  ]);
  
  // IPFS Storage
  const [ipfsData, setIpfsData] = useState([
    {
      cid: 'QmXyz...123',
      type: 'Farm Photos',
      batchId: 'BATCH-2024-001',
      size: '45.6 MB',
      uploadDate: '2024-01-20'
    },
    {
      cid: 'QmAbc...456',
      type: 'Lab Certificate',
      batchId: 'BATCH-2024-001',
      size: '2.3 MB',
      uploadDate: '2024-01-22'
    }
  ]);
  
  // Modals State
  const [modals, setModals] = useState({
    createFarmer: false,
    createCollector: false,
    createTester: false,
    createManufacturer: false,
    assignCollector: false,
    assignTester: false,
    selectManufacturer: false,
    generateLabel: false,
    viewProvenance: false,
    batchDetails: false,
    systemConfig: false
  });
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    farmer: { name: '', email: '', phone: '', location: '', farmSize: '', herb: '' },
    collector: { name: '', phone: '', location: '', zones: '' },
    tester: { name: '', location: '', accreditation: '', specialization: '' },
    manufacturer: { name: '', location: '', accreditation: '', capacity: '' }
  });
  
  // Analytics Data
  const [analytics, setAnalytics] = useState({
    totalFarmers: 156,
    totalBatches: 234,
    totalCollectors: 42,
    totalTesters: 18,
    totalManufacturers: 24,
    totalRevenue: '₹24,56,789',
    supplyChainEfficiency: 92,
    complianceRate: 94.5,
    avgProcessingTime: '4.2 days',
    batchSuccessRate: 96.3,
    farmerSatisfaction: 4.8,
    testerTurnaround: '2.5 days',
    manufacturerEfficiency: 91.2,
    consumerScanRate: '87%'
  });
  
  // System Configuration
  const [systemConfig, setSystemConfig] = useState({
    geoFencing: true,
    autoAssignCollector: true,
    minimumBids: 3,
    complianceThreshold: 85,
    notificationDelay: 24,
    blockchainSync: 'auto',
    backupFrequency: 'daily',
    auditLogRetention: '365 days'
  });
  
  // Show notification
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };
  
  // Open modal
  const openModal = (modalName, item = null) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    setSelectedItem(item);
  };
  
  // Close modal
  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setSelectedItem(null);
  };
  
  // Network Management Functions
  const createFarmer = () => {
    const newFarmer = {
      id: `FARM-${farmers.length + 1}`,
      ...newItem.farmer,
      status: 'active',
      compliance: 'A',
      registeredDate: new Date().toISOString().split('T')[0],
      batchesCompleted: 0,
      revenue: '₹0'
    };
    
    setFarmers(prev => [...prev, newFarmer]);
    showNotification(`Farmer ${newItem.farmer.name} created successfully`, 'success');
    closeModal('createFarmer');
    setNewItem(prev => ({ ...prev, farmer: { name: '', email: '', phone: '', location: '', farmSize: '', herb: '' } }));
  };
  
  const createCollector = () => {
    const newCollector = {
      id: `COL-${collectors.length + 1}`,
      ...newItem.collector,
      status: 'active',
      assignedBatches: 0,
      completedCollections: 0,
      rating: 0,
      lastSeen: 'Just now'
    };
    
    setCollectors(prev => [...prev, newCollector]);
    showNotification(`Collector ${newItem.collector.name} created successfully`, 'success');
    closeModal('createCollector');
    setNewItem(prev => ({ ...prev, collector: { name: '', phone: '', location: '', zones: '' } }));
  };
  
  const createTester = () => {
    const newTester = {
      id: `TEST-${testers.length + 1}`,
      ...newItem.tester,
      specialization: newItem.tester.specialization.split(',').map(s => s.trim()),
      rating: 0,
      turnaroundTime: '72 hours',
      status: 'active',
      testsCompleted: 0
    };
    
    setTesters(prev => [...prev, newTester]);
    showNotification(`Tester ${newItem.tester.name} created successfully`, 'success');
    closeModal('createTester');
    setNewItem(prev => ({ ...prev, tester: { name: '', location: '', accreditation: '', specialization: '' } }));
  };
  
  const createManufacturer = () => {
    const newManufacturer = {
      id: `MFG-${manufacturers.length + 1}`,
      ...newItem.manufacturer,
      rating: 0,
      status: 'active',
      bidsWon: 0
    };
    
    setManufacturers(prev => [...prev, newManufacturer]);
    showNotification(`Manufacturer ${newItem.manufacturer.name} created successfully`, 'success');
    closeModal('createManufacturer');
    setNewItem(prev => ({ ...prev, manufacturer: { name: '', location: '', accreditation: '', capacity: '' } }));
  };
  
  // Batch Management Functions
  const assignCollectorToBatch = (batchId, collectorId) => {
    const collector = collectors.find(c => c.id === collectorId);
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? { 
            ...batch, 
            collector: collector.name,
            status: 'collection',
            timeline: { ...batch.timeline, collection: new Date().toISOString().split('T')[0] }
          }
        : batch
    ));
    
    showNotification(`Collector ${collector.name} assigned to batch ${batchId}`, 'success');
    closeModal('assignCollector');
  };
  
  const assignTesterToBatch = (batchId, testerId) => {
    const tester = testers.find(t => t.id === testerId);
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? { 
            ...batch, 
            tester: tester.name,
            status: 'testing',
            timeline: { ...batch.timeline, testing: new Date().toISOString().split('T')[0] }
          }
        : batch
    ));
    
    showNotification(`Tester ${tester.name} assigned to batch ${batchId}`, 'success');
    closeModal('assignTester');
  };
  
  const selectManufacturerForBatch = (batchId, manufacturerId) => {
    const manufacturer = manufacturers.find(m => m.id === manufacturerId);
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? { 
            ...batch, 
            manufacturer: manufacturer.name,
            status: 'manufacturing',
            timeline: { ...batch.timeline, manufacturing: new Date().toISOString().split('T')[0] }
          }
        : batch
    ));
    
    showNotification(`Manufacturer ${manufacturer.name} selected for batch ${batchId}`, 'success');
    closeModal('selectManufacturer');
  };
  
  const generateLabel = (batchId) => {
    const newLabelId = `LABEL-${batchId.split('-')[1]}-${Date.now().toString().slice(-6)}`;
    const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
    
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? { 
            ...batch, 
            labelId: newLabelId,
            txHash: txHash,
            status: 'packaging',
            timeline: { ...batch.timeline, packaging: new Date().toISOString().split('T')[0] }
          }
        : batch
    ));
    
    // Add to IPFS
    const newIpfsEntry = {
      cid: `Qm${Math.random().toString(16).slice(2)}`,
      type: 'Label Metadata',
      batchId: batchId,
      size: '1.2 MB',
      uploadDate: new Date().toISOString().split('T')[0]
    };
    
    setIpfsData(prev => [...prev, newIpfsEntry]);
    
    showNotification(`Label ${newLabelId} generated and stored on IPFS`, 'success');
    closeModal('generateLabel');
  };
  
  // System Functions
  const updateSystemConfig = () => {
    showNotification('System configuration updated successfully', 'success');
    closeModal('systemConfig');
  };
  
  const exportReport = (type) => {
    showNotification(`${type} report exported successfully`, 'success');
  };
  
  const runSystemCheck = () => {
    showNotification('System health check completed successfully', 'success');
  };
  
  // Analytics Functions
  const getStageProgress = () => {
    return {
      planting: 85,
      collection: 88,
      testing: 92,
      manufacturing: 90,
      packaging: 87,
      distribution: 95
    };
  };
  
  const getRevenueData = () => {
    return [45, 52, 68, 74, 82, 90, 96, 105, 112, 120, 128, 135];
  };
  
  const getRevenueLabels = () => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  };
  
  const getGeoLocations = () => {
    return [
      { name: 'Farm - Rajesh', type: 'farm', status: 'active', lat: 9.9252, lng: 78.1198 },
      { name: 'Lab - Dr. Sharma', type: 'lab', status: 'active', lat: 28.7041, lng: 77.1025 },
      { name: 'Factory - Himalaya', type: 'factory', status: 'active', lat: 12.9716, lng: 77.5946 },
      { name: 'Dist Center - Mumbai', type: 'distribution', status: 'active', lat: 19.0760, lng: 72.8777 }
    ];
  };
  
  // Calculate Statistics
  const stats = {
    activeBatches: batches.filter(b => b.status !== 'completed').length,
    pendingAssignments: batches.filter(b => !b.collector || !b.tester || !b.manufacturer).length,
    delayedBatches: batches.filter(b => b.delayFlags > 0).length,
    complianceIssues: batches.filter(b => b.complianceScore < 90).length,
    blockchainTxCount: blockchainTx.length,
    ipfsStorage: ipfsData.reduce((sum, item) => sum + parseFloat(item.size), 0)
  };
  
  return (
    <div className="admin-dashboard">
      {/* Notification Container */}
      <div className="notifications-container">
        <AnimatePresence>
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              message={notification.message}
              type={notification.type}
              onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            {/* <span className="title-icon">🌿</span>
            AYUSH Supply Chain Admin Portal */}
          </h1>
          {/* <p className="dashboard-subtitle">Ministry of AYUSH - Centralized Supply Chain Management System</p> */}
        </div>
        
        <div className="header-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search batches, farmers, entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="system-health">
            <div className="health-indicator healthy" title="Blockchain: Healthy"></div>
            <div className="health-indicator healthy" title="Database: Healthy"></div>
            <div className="health-indicator healthy" title="API: Healthy"></div>
          </div>
          
          <div className="user-profile">
            <div className="profile-avatar">
              <span className="avatar-initials">AO</span>
            </div>
            <div className="profile-info">
              <span className="profile-name">Admin Officer</span>
              <span className="profile-role">Ministry of AYUSH</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Navigation Tabs */}
      <div className="main-navigation">
        {['dashboard', 'network', 'batches', 'geo-fencing', 'label-system', 'analytics', 'system'].map(tab => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.replace('-', ' ').toUpperCase()}
          </button>
        ))}
      </div>
      
      {/* Quick Stats */}
      <div className="quick-stats">
        <Card
          title="Active Batches"
          value={stats.activeBatches}
          color="primary"
          icon="📦"
          className="stat-card"
        >
          <div className="stat-breakdown">
            <span className="breakdown-item">{batches.filter(b => b.status === 'collection').length} Collecting</span>
            <span className="breakdown-item">{batches.filter(b => b.status === 'testing').length} Testing</span>
          </div>
        </Card>
        
        <Card
          title="Supply Chain Efficiency"
          value={`${analytics.supplyChainEfficiency}%`}
          color="success"
          icon="⚡"
          className="stat-card"
        >
          <div className="stat-trend positive">+2.3% this quarter</div>
        </Card>
        
        <Card
          title="Blockchain Transactions"
          value={stats.blockchainTxCount}
          color="secondary"
          icon="⛓️"
          className="stat-card"
        >
          <div className="stat-breakdown">
            <span className="breakdown-item">{blockchainTx.filter(tx => tx.type === 'Batch Creation').length} Batches</span>
            <span className="breakdown-item">{blockchainTx.filter(tx => tx.type === 'Test Results').length} Tests</span>
          </div>
        </Card>
        
        <Card
          title="IPFS Storage"
          value={`${stats.ipfsStorage.toFixed(1)} MB`}
          color="warning"
          icon="🗄️"
          className="stat-card"
        >
          <div className="stat-trend positive">+15.6 MB today</div>
        </Card>
      </div>
      
      {/* Main Content Area */}
      <div className="main-content">
        
        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-overview">
            <div className="section-card">
              <div className="section-header">
                <h3>📊 System Overview</h3>
                <div className="section-actions">
                  <Button icon="📈" variant="outline" onClick={() => exportReport('System')}>
                    Generate Report
                  </Button>
                  <Button icon="🔍" variant="outline" onClick={runSystemCheck}>
                    System Check
                  </Button>
                </div>
              </div>
              
              <div className="overview-grid">
                <div className="overview-item">
                  <h4>Supply Chain Status</h4>
                  <div className="stage-progress">
                    {Object.entries(getStageProgress()).map(([stage, percentage]) => (
                      <div key={stage} className="stage-item">
                        <span className="stage-label">{stage}</span>
                        <ProgressBar value={percentage} max={100} color="primary" showPercentage={false} />
                        <span className="stage-percentage">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="overview-item">
                  <h4>System Health</h4>
                  <div className="system-health-grid">
                    {Object.entries(systemHealth).map(([system, data]) => (
                      <div key={system} className="system-health-item">
                        <div className="system-name">{system.toUpperCase()}</div>
                        <div className="system-status">
                          <Badge variant={data.status === 'healthy' ? 'success' : 'error'}>
                            {data.status}
                          </Badge>
                          <span className="uptime">{data.uptime}% uptime</span>
                        </div>
                        <ProgressBar value={data.uptime} max={100} color="success" showPercentage={false} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="section-card">
              <div className="section-header">
                <h3>📈 Revenue Analytics</h3>
              </div>
              <div className="revenue-chart">
                <Chart 
                  type="line" 
                  data={getRevenueData()}
                  labels={getRevenueLabels()}
                  height={300}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Network Management */}
        {activeTab === 'network' && (
          <div className="network-management">
            <div className="section-card">
              <div className="section-header">
                <h3>👥 Network Management</h3>
                <div className="section-actions">
                  <Button icon="👨‍🌾" onClick={() => openModal('createFarmer')}>
                    New Farmer
                  </Button>
                  <Button icon="🚚" onClick={() => openModal('createCollector')}>
                    New Collector
                  </Button>
                  <Button icon="🏢" onClick={() => openModal('createTester')}>
                    New Tester
                  </Button>
                  <Button icon="🏭" onClick={() => openModal('createManufacturer')}>
                    New Manufacturer
                  </Button>
                </div>
              </div>
              
              <div className="network-stats">
                <Card title="Farmers" value={analytics.totalFarmers} color="primary" icon="👨‍🌾" />
                <Card title="Collectors" value={analytics.totalCollectors} color="success" icon="🚚" />
                <Card title="Testers" value={analytics.totalTesters} color="warning" icon="🏢" />
                <Card title="Manufacturers" value={analytics.totalManufacturers} color="secondary" icon="🏭" />
              </div>
              
              <div className="network-tabs">
                <button className="network-tab active">Farmers</button>
                <button className="network-tab">Collectors</button>
                <button className="network-tab">Testers</button>
                <button className="network-tab">Manufacturers</button>
              </div>
              
              <Table
                columns={[
                  { header: 'ID', accessor: 'id' },
                  { header: 'Name', accessor: 'name' },
                  { header: 'Location', accessor: 'location' },
                  { header: 'Herb/Specialization', accessor: 'herb' },
                  { 
                    header: 'Status', 
                    accessor: 'status',
                    render: (value) => (
                      <Badge variant={value === 'active' ? 'success' : 'error'}>
                        {value}
                      </Badge>
                    )
                  },
                  { header: 'Compliance', accessor: 'compliance' },
                  { header: 'Revenue/Batches', accessor: 'revenue' },
                  { 
                    header: 'Actions', 
                    accessor: 'actions',
                    render: (_, row) => (
                      <div className="action-buttons">
                        <Button size="small" variant="outline">View</Button>
                        <Button size="small" variant="outline">Edit</Button>
                      </div>
                    )
                  }
                ]}
                data={farmers}
              />
            </div>
          </div>
        )}
        
        {/* Batch Management */}
        {activeTab === 'batches' && (
          <div className="batch-management">
            <div className="section-card">
              <div className="section-header">
                <h3>📦 Batch Management</h3>
                <div className="section-actions">
                  <Button icon="📊" variant="outline" onClick={() => exportReport('Batches')}>
                    Export Report
                  </Button>
                  <Button icon="⚠️" variant="outline">
                    View Delays ({stats.delayedBatches})
                  </Button>
                </div>
              </div>
              
              <div className="batch-stats">
                <Card title="Total Batches" value={analytics.totalBatches} color="primary" icon="📦" />
                <Card title="Success Rate" value={`${analytics.batchSuccessRate}%`} color="success" icon="✅" />
                <Card title="Avg Processing" value={analytics.avgProcessingTime} color="warning" icon="⏱️" />
                <Card title="Compliance Rate" value={`${analytics.complianceRate}%`} color="secondary" icon="📋" />
              </div>
              
              <Table
                columns={[
                  { header: 'Batch ID', accessor: 'id' },
                  { header: 'Herb', accessor: 'herb' },
                  { header: 'Quantity', accessor: 'quantity' },
                  { header: 'Farmer', accessor: 'farmer' },
                  { 
                    header: 'Status', 
                    accessor: 'status',
                    render: (value) => (
                      <Badge variant={
                        value === 'planting' ? 'default' :
                        value === 'collection' ? 'primary' :
                        value === 'testing' ? 'warning' :
                        value === 'manufacturing' ? 'info' : 'success'
                      }>
                        {value}
                      </Badge>
                    )
                  },
                  { header: 'Collector', accessor: 'collector' },
                  { header: 'Tester', accessor: 'tester' },
                  { header: 'Manufacturer', accessor: 'manufacturer' },
                  { header: 'Compliance', accessor: 'complianceScore' },
                  { 
                    header: 'Actions', 
                    accessor: 'actions',
                    render: (_, row) => (
                      <div className="action-buttons">
                        {!row.collector && (
                          <Button size="small" onClick={() => openModal('assignCollector', row)}>
                            Assign Collector
                          </Button>
                        )}
                        {!row.tester && row.collector && (
                          <Button size="small" onClick={() => openModal('assignTester', row)}>
                            Assign Tester
                          </Button>
                        )}
                        {!row.manufacturer && row.tester && (
                          <Button size="small" onClick={() => openModal('selectManufacturer', row)}>
                            Select Manufacturer
                          </Button>
                        )}
                        {!row.labelId && row.manufacturer && (
                          <Button size="small" onClick={() => openModal('generateLabel', row)}>
                            Generate Label
                          </Button>
                        )}
                      </div>
                    )
                  }
                ]}
                data={batches}
                onRowClick={(row) => openModal('batchDetails', row)}
              />
            </div>
            
            <div className="section-card">
              <div className="section-header">
                <h3>📄 Test Results</h3>
              </div>
              <Table
                columns={[
                  { header: 'Batch ID', accessor: 'batchId' },
                  { header: 'Tester', accessor: 'tester' },
                  { header: 'Date', accessor: 'date' },
                  { header: 'Grade', accessor: 'grade' },
                  { header: 'Moisture', accessor: 'results.moisture' },
                  { header: 'Heavy Metals', accessor: 'results.heavyMetals' },
                  { header: 'Pesticides', accessor: 'results.pesticides' },
                  { header: 'Certificate', accessor: 'certificate' }
                ]}
                data={testResults}
              />
            </div>
          </div>
        )}
        
        {/* Geo-Fencing & Compliance */}
        {activeTab === 'geo-fencing' && (
          <div className="geo-fencing">
            <div className="section-card">
              <div className="section-header">
                <h3>🗺️ Geo-Fencing & Compliance</h3>
                <div className="section-actions">
                  <Button icon="📍" variant="outline">
                    Set Zones
                  </Button>
                  <Button icon="📊" variant="outline" onClick={() => exportReport('Compliance')}>
                    Compliance Report
                  </Button>
                </div>
              </div>
              
              <div className="compliance-stats">
                <Card title="GPS Compliance" value="98%" color="success" icon="📍" />
                <Card title="Season Compliance" value="96%" color="primary" icon="🌦️" />
                <Card title="Zone Compliance" value="94%" color="warning" icon="🗺️" />
                <Card title="Violations" value={stats.complianceIssues} color="error" icon="⚠️" />
              </div>
              
              <div className="map-container-large">
                <MapComponent 
                  locations={getGeoLocations()}
                  center={{ lat: 20.5937, lng: 78.9629 }}
                  zoom={5}
                />
              </div>
              
              <div className="compliance-list">
                <h4>Recent Compliance Checks</h4>
                <div className="compliance-items">
                  {batches.map(batch => (
                    <div key={batch.id} className="compliance-item">
                      <div className="compliance-info">
                        <strong>{batch.id}</strong>
                        <span>{batch.herb} • {batch.farmer}</span>
                      </div>
                      <div className="compliance-status">
                        <Badge variant={batch.gpsCompliance ? 'success' : 'error'}>
                          GPS: {batch.gpsCompliance ? '✓' : '✗'}
                        </Badge>
                        <Badge variant={batch.complianceScore >= 90 ? 'success' : 'warning'}>
                          Score: {batch.complianceScore}%
                        </Badge>
                        <Badge variant={batch.delayFlags === 0 ? 'success' : 'error'}>
                          Delays: {batch.delayFlags}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Label System */}
        {activeTab === 'label-system' && (
          <div className="label-system">
            <div className="section-card">
              <div className="section-header">
                <h3>🏷️ Smart Label Generation</h3>
                <div className="section-actions">
                  <Button icon="🔄" variant="outline">
                    Sync Blockchain
                  </Button>
                  <Button icon="📋" variant="outline" onClick={() => exportReport('Labels')}>
                    Labels Report
                  </Button>
                </div>
              </div>
              
              <div className="label-stats">
                <Card title="Labels Generated" value={batches.filter(b => b.labelId).length} color="primary" icon="🏷️" />
                <Card title="On Blockchain" value={blockchainTx.length} color="secondary" icon="⛓️" />
                <Card title="IPFS Storage" value={ipfsData.length} color="warning" icon="🗄️" />
                <Card title="Consumer Scans" value={consumerAnalytics.totalScans.toLocaleString()} color="success" icon="📱" />
              </div>
              
              <div className="label-grid">
                {batches
                  .filter(batch => batch.labelId)
                  .map(batch => (
                    <div key={batch.id} className="label-card">
                      <div className="label-header">
                        <div className="label-qr">
                          <div className="qr-placeholder">
                            <div className="qr-code">[QR Code]</div>
                            <span className="label-id">{batch.labelId}</span>
                          </div>
                        </div>
                        <div className="label-info">
                          <h4>{batch.id}</h4>
                          <p>{batch.herb} • {batch.quantity}</p>
                          <div className="label-details">
                            <span>Status: {batch.status}</span>
                            <span>Compliance: {batch.complianceScore}%</span>
                            <span>TX: {batch.txHash?.slice(0, 12)}...</span>
                          </div>
                        </div>
                      </div>
                      <div className="label-actions">
                        <Button size="small" variant="outline">
                          View Provenance
                        </Button>
                        <Button size="small" variant="outline">
                          Print Label
                        </Button>
                        <Button size="small" variant="outline">
                          Verify on Chain
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="section-card">
                <div className="section-header">
                  <h4>📜 Blockchain Transactions</h4>
                </div>
                <Table
                  columns={[
                    { header: 'Transaction Hash', accessor: 'hash' },
                    { header: 'Type', accessor: 'type' },
                    { header: 'Batch ID', accessor: 'batchId' },
                    { header: 'Timestamp', accessor: 'timestamp' },
                    { 
                      header: 'Status', 
                      accessor: 'status',
                      render: (value) => (
                        <Badge variant={value === 'confirmed' ? 'success' : 'pending'}>
                          {value}
                        </Badge>
                      )
                    },
                    { header: 'Gas Used', accessor: 'gasUsed' }
                  ]}
                  data={blockchainTx}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="analytics-dashboard">
            <div className="section-card">
              <div className="section-header">
                <h3>📈 Analytics & Reports</h3>
                <div className="section-actions">
                  <Button icon="📊" variant="outline" onClick={() => exportReport('Full Analytics')}>
                    Export All Data
                  </Button>
                  <Button icon="🔄" variant="outline">
                    Refresh Data
                  </Button>
                </div>
              </div>
              
              <div className="analytics-grid">
                <Card title="Supply Chain Analytics" color="primary" className="chart-card">
                  <div className="chart-container">
                    <Chart 
                      type="bar" 
                      data={Object.values(getStageProgress())}
                      labels={Object.keys(getStageProgress())}
                      height={250}
                    />
                  </div>
                </Card>
                
                <Card title="Consumer Engagement" color="secondary" className="chart-card">
                  <div className="consumer-stats">
                    <div className="consumer-stat">
                      <span className="stat-value">{consumerAnalytics.totalScans.toLocaleString()}</span>
                      <span className="stat-label">Total Scans</span>
                    </div>
                    <div className="consumer-stat">
                      <span className="stat-value">{consumerAnalytics.uniqueUsers.toLocaleString()}</span>
                      <span className="stat-label">Unique Users</span>
                    </div>
                    <div className="consumer-stat">
                      <span className="stat-value">{consumerAnalytics.avgRating}/5</span>
                      <span className="stat-label">Avg Rating</span>
                    </div>
                  </div>
                  <div className="popular-products">
                    <h5>Popular Products</h5>
                    {consumerAnalytics.popularProducts.map((product, index) => (
                      <div key={index} className="product-item">
                        <span className="product-rank">#{index + 1}</span>
                        <span className="product-name">{product}</span>
                        <span className="product-rating">
                          {consumerAnalytics.feedback.find(f => f.product === product)?.rating || 4.5}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card title="Sustainability Metrics" color="success" className="stats-card">
                  <div className="sustainability-stats">
                    <div className="sustainability-item">
                      <span className="item-label">Carbon Footprint Reduction</span>
                      <span className="item-value">-23.4%</span>
                    </div>
                    <div className="sustainability-item">
                      <span className="item-label">Water Conservation</span>
                      <span className="item-value">+18.7%</span>
                    </div>
                    <div className="sustainability-item">
                      <span className="item-label">Soil Health Improvement</span>
                      <span className="item-value">+15.2%</span>
                    </div>
                    <div className="sustainability-item">
                      <span className="item-label">Farmer Income Increase</span>
                      <span className="item-value">+34.6%</span>
                    </div>
                  </div>
                </Card>
                
                <Card title="Performance Metrics" color="warning" className="stats-card">
                  <div className="performance-stats">
                    <div className="performance-item">
                      <span className="item-label">Tester Turnaround</span>
                      <span className="item-value">{analytics.testerTurnaround}</span>
                      <ProgressBar value={85} max={100} color="primary" showPercentage={false} />
                    </div>
                    <div className="performance-item">
                      <span className="item-label">Manufacturer Efficiency</span>
                      <span className="item-value">{analytics.manufacturerEfficiency}%</span>
                      <ProgressBar value={analytics.manufacturerEfficiency} max={100} color="success" showPercentage={false} />
                    </div>
                    <div className="performance-item">
                      <span className="item-label">Consumer Scan Rate</span>
                      <span className="item-value">{analytics.consumerScanRate}</span>
                      <ProgressBar value={parseInt(analytics.consumerScanRate)} max={100} color="secondary" showPercentage={false} />
                    </div>
                    <div className="performance-item">
                      <span className="item-label">Farmer Satisfaction</span>
                      <span className="item-value">{analytics.farmerSatisfaction}/5</span>
                      <ProgressBar value={analytics.farmerSatisfaction * 20} max={100} color="accent" showPercentage={false} />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
        
        {/* System Configuration */}
        {activeTab === 'system' && (
          <div className="system-config">
            <div className="section-card">
              <div className="section-header">
                <h3>⚙️ System Configuration</h3>
                <div className="section-actions">
                  <Button icon="💾" onClick={updateSystemConfig}>
                    Save Configuration
                  </Button>
                  <Button icon="🔄" variant="outline">
                    Reset to Defaults
                  </Button>
                </div>
              </div>
              
              <div className="config-grid">
                <div className="config-section">
                  <h4>General Settings</h4>
                  <div className="config-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={systemConfig.geoFencing}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, geoFencing: e.target.checked }))}
                      />
                      Enable Geo-Fencing
                    </label>
                  </div>
                  <div className="config-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={systemConfig.autoAssignCollector}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, autoAssignCollector: e.target.checked }))}
                      />
                      Auto-Assign Collector
                    </label>
                  </div>
                  <div className="config-item">
                    <label>Minimum Bids Required</label>
                    <input 
                      type="number" 
                      value={systemConfig.minimumBids}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, minimumBids: parseInt(e.target.value) }))}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                
                <div className="config-section">
                  <h4>Compliance Settings</h4>
                  <div className="config-item">
                    <label>Compliance Threshold (%)</label>
                    <input 
                      type="range" 
                      value={systemConfig.complianceThreshold}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, complianceThreshold: parseInt(e.target.value) }))}
                      min="50"
                      max="100"
                    />
                    <span>{systemConfig.complianceThreshold}%</span>
                  </div>
                  <div className="config-item">
                    <label>Notification Delay (hours)</label>
                    <input 
                      type="number" 
                      value={systemConfig.notificationDelay}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, notificationDelay: parseInt(e.target.value) }))}
                      min="1"
                      max="72"
                    />
                  </div>
                </div>
                
                <div className="config-section">
                  <h4>Blockchain Settings</h4>
                  <div className="config-item">
                    <label>Blockchain Sync</label>
                    <select 
                      value={systemConfig.blockchainSync}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, blockchainSync: e.target.value }))}
                    >
                      <option value="auto">Auto Sync</option>
                      <option value="manual">Manual Sync</option>
                      <option value="scheduled">Scheduled Sync</option>
                    </select>
                  </div>
                  <div className="config-item">
                    <label>Backup Frequency</label>
                    <select 
                      value={systemConfig.backupFrequency}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, backupFrequency: e.target.value }))}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                
                <div className="config-section">
                  <h4>Audit & Logs</h4>
                  <div className="config-item">
                    <label>Audit Log Retention</label>
                    <select 
                      value={systemConfig.auditLogRetention}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, auditLogRetention: e.target.value }))}
                    >
                      <option value="30 days">30 Days</option>
                      <option value="90 days">90 Days</option>
                      <option value="180 days">180 Days</option>
                      <option value="365 days">1 Year</option>
                      <option value="forever">Forever</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="system-logs">
                <h4>Recent System Logs</h4>
                <div className="log-list">
                  {[
                    { time: '10:30:00', message: 'Blockchain sync completed successfully', level: 'info' },
                    { time: '10:15:00', message: 'New batch created: BATCH-2024-003', level: 'info' },
                    { time: '09:45:00', message: 'Backup completed successfully', level: 'info' },
                    { time: '09:30:00', message: 'System health check passed', level: 'success' },
                    { time: '08:15:00', message: 'Consumer scan analytics updated', level: 'info' }
                  ].map((log, index) => (
                    <div key={index} className={`log-item ${log.level}`}>
                      <span className="log-time">{log.time}</span>
                      <span className="log-message">{log.message}</span>
                      <Badge variant={log.level} size="small">{log.level}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      
      {/* Create Farmer Modal */}
      <Modal
        isOpen={modals.createFarmer}
        onClose={() => closeModal('createFarmer')}
        title="Create Farmer Profile"
        size="medium"
      >
        <div className="form-container">
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              value={newItem.farmer.name}
              onChange={(e) => setNewItem(prev => ({ 
                ...prev, 
                farmer: { ...prev.farmer, name: e.target.value }
              }))}
              placeholder="Enter farmer name"
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={newItem.farmer.email}
              onChange={(e) => setNewItem(prev => ({ 
                ...prev, 
                farmer: { ...prev.farmer, email: e.target.value }
              }))}
              placeholder="Enter email"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input 
                type="tel" 
                value={newItem.farmer.phone}
                onChange={(e) => setNewItem(prev => ({ 
                  ...prev, 
                  farmer: { ...prev.farmer, phone: e.target.value }
                }))}
                placeholder="+91 9876543210"
              />
            </div>
            
            <div className="form-group">
              <label>Location</label>
              <input 
                type="text" 
                value={newItem.farmer.location}
                onChange={(e) => setNewItem(prev => ({ 
                  ...prev, 
                  farmer: { ...prev.farmer, location: e.target.value }
                }))}
                placeholder="City, State"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Farm Size</label>
              <input 
                type="text" 
                value={newItem.farmer.farmSize}
                onChange={(e) => setNewItem(prev => ({ 
                  ...prev, 
                  farmer: { ...prev.farmer, farmSize: e.target.value }
                }))}
                placeholder="e.g., 5 acres"
              />
            </div>
            
            <div className="form-group">
              <label>Herb Specialization</label>
              <select 
                value={newItem.farmer.herb}
                onChange={(e) => setNewItem(prev => ({ 
                  ...prev, 
                  farmer: { ...prev.farmer, herb: e.target.value }
                }))}
              >
                <option value="">Select herb</option>
                <option value="Tulsi">Tulsi</option>
                <option value="Ashwagandha">Ashwagandha</option>
                <option value="Turmeric">Turmeric</option>
                <option value="Giloy">Giloy</option>
                <option value="Neem">Neem</option>
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <Button variant="outline" onClick={() => closeModal('createFarmer')}>
              Cancel
            </Button>
            <Button onClick={createFarmer}>
              Create Farmer Profile
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Assign Collector Modal */}
      <Modal
        isOpen={modals.assignCollector}
        onClose={() => closeModal('assignCollector')}
        title="Assign Collector to Batch"
        size="medium"
      >
        {selectedItem && (
          <div className="assign-form">
            <div className="form-group">
              <label>Batch Details</label>
              <div className="item-details">
                <strong>{selectedItem.id} - {selectedItem.herb}</strong>
                <span>Quantity: {selectedItem.quantity}</span>
                <span>Farmer: {selectedItem.farmer}</span>
              </div>
            </div>
            
            <div className="form-group">
              <label>Select Collector</label>
              <select className="form-select" defaultValue="">
                <option value="" disabled>Choose a collector</option>
                {collectors
                  .filter(c => c.status === 'active')
                  .map(collector => (
                    <option key={collector.id} value={collector.id}>
                      {collector.name} ({collector.location}) - Rating: {collector.rating}
                    </option>
                  ))
                }
              </select>
            </div>
            
            <div className="form-actions">
              <Button variant="outline" onClick={() => closeModal('assignCollector')}>
                Cancel
              </Button>
              <Button onClick={() => assignCollectorToBatch(selectedItem.id, collectors[0].id)}>
                Assign Collector
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Generate Label Modal */}
      <Modal
        isOpen={modals.generateLabel}
        onClose={() => closeModal('generateLabel')}
        title="Generate Smart Label"
        size="medium"
      >
        {selectedItem && (
          <div className="label-generation-form">
            <div className="form-group">
              <label>Batch Information</label>
              <div className="item-details">
                <strong>{selectedItem.id} - {selectedItem.herb}</strong>
                <span>Manufacturer: {selectedItem.manufacturer}</span>
                <span>Test Grade: {testResults.find(t => t.batchId === selectedItem.id)?.grade || 'Premium'}</span>
              </div>
            </div>
            
            <div className="form-group">
              <label>Label Type</label>
              <select defaultValue="qr">
                <option value="qr">QR Code</option>
                <option value="barcode">Barcode</option>
                <option value="nfc">NFC Tag</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Include on Blockchain</label>
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" defaultChecked />
                  Store provenance on blockchain
                </label>
                <label>
                  <input type="checkbox" defaultChecked />
                  Upload metadata to IPFS
                </label>
                <label>
                  <input type="checkbox" defaultChecked />
                  Enable consumer verification
                </label>
              </div>
            </div>
            
            <div className="form-note">
              <div className="note-icon">ℹ️</div>
              <div className="note-content">
                <strong>Note:</strong> Label generation will create a unique identifier, 
                store batch metadata on IPFS, and record the transaction on the blockchain.
              </div>
            </div>
            
            <div className="form-actions">
              <Button variant="outline" onClick={() => closeModal('generateLabel')}>
                Cancel
              </Button>
              <Button onClick={() => generateLabel(selectedItem.id)}>
                Generate & Deploy
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Batch Details Modal */}
      <Modal
        isOpen={modals.batchDetails}
        onClose={() => closeModal('batchDetails')}
        title="Batch Details"
        size="large"
      >
        {selectedItem && (
          <div className="batch-details-view">
            <div className="batch-header">
              <div className="batch-title">
                <h3>{selectedItem.id}</h3>
                <Badge variant={
                  selectedItem.status === 'planting' ? 'default' :
                  selectedItem.status === 'collection' ? 'primary' :
                  selectedItem.status === 'testing' ? 'warning' :
                  selectedItem.status === 'manufacturing' ? 'info' : 'success'
                }>
                  {selectedItem.status}
                </Badge>
              </div>
              <div className="batch-meta">
                <span><strong>Herb:</strong> {selectedItem.herb}</span>
                <span><strong>Quantity:</strong> {selectedItem.quantity}</span>
                <span><strong>Compliance:</strong> {selectedItem.complianceScore}%</span>
              </div>
            </div>
            
            <div className="batch-timeline">
              <h4>Timeline</h4>
              <div className="timeline-steps">
                {Object.entries(selectedItem.timeline).map(([stage, date]) => (
                  <div key={stage} className="timeline-step">
                    <div className="step-icon">{date ? '✓' : '○'}</div>
                    <div className="step-info">
                      <span className="step-stage">{stage}</span>
                      <span className="step-date">{date || 'Pending'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="batch-stakeholders">
              <h4>Stakeholders</h4>
              <div className="stakeholder-grid">
                <div className="stakeholder">
                  <strong>Farmer</strong>
                  <span>{selectedItem.farmer}</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="stakeholder">
                  <strong>Collector</strong>
                  <span>{selectedItem.collector || 'Not Assigned'}</span>
                  <Badge variant={selectedItem.collector ? 'success' : 'error'}>
                    {selectedItem.collector ? 'Assigned' : 'Pending'}
                  </Badge>
                </div>
                <div className="stakeholder">
                  <strong>Tester</strong>
                  <span>{selectedItem.tester || 'Not Assigned'}</span>
                  <Badge variant={selectedItem.tester ? 'success' : 'error'}>
                    {selectedItem.tester ? 'Assigned' : 'Pending'}
                  </Badge>
                </div>
                <div className="stakeholder">
                  <strong>Manufacturer</strong>
                  <span>{selectedItem.manufacturer || 'Not Selected'}</span>
                  <Badge variant={selectedItem.manufacturer ? 'success' : 'error'}>
                    {selectedItem.manufacturer ? 'Selected' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {selectedItem.labelId && (
              <div className="batch-blockchain">
                <h4>Blockchain Information</h4>
                <div className="blockchain-info">
                  <div className="info-item">
                    <strong>Label ID:</strong>
                    <span>{selectedItem.labelId}</span>
                  </div>
                  <div className="info-item">
                    <strong>Transaction Hash:</strong>
                    <span className="tx-hash">{selectedItem.txHash}</span>
                  </div>
                  <div className="info-item">
                    <strong>IPFS Metadata:</strong>
                    <span>{ipfsData.find(i => i.batchId === selectedItem.id)?.cid || 'Not stored'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}