import React, { useEffect, useState, useRef } from 'react';
import {
  BellRing, LogOut, User, Package, Clock, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Save, Calendar, Upload, Eye, Download,
  FileText, FlaskConical, Microscope, TestTube, Thermometer,
  Droplets, Shield, Leaf, Bug, Skull, Beaker, Scale, Activity,
  FileCheck, Database, BarChart3, ClipboardCheck, FileSpreadsheet,
  Percent, Hash, Type, Globe, CalendarDays, MapPin, Package as PackageIcon,
  Weight, UserCheck, Filter, MoreVertical, ExternalLink, Copy
} from 'lucide-react';
import '../styles/Labtest.css';

/* ===============================
   CONFIG
================================ */
const API_BASE = import.meta.env.VITE_API_BASE;

// FIX: Use correct token key
const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.error("No access token found");
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// For FormData requests
const authHeadersFormData = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
    // Don't set Content-Type for FormData
  };
};

// THEME COLOR
const THEME = "#639601";
const THEME_LIGHT = "#f0f9ec";
const THEME_VERY_LIGHT = "#f9fcf7";
const THEME_DARK = "#4e7c00";

// ===============================
// HEADER COMPONENT
// ===============================

function Header({
  tester,
  notifications,
  onLogout,
  onAcceptNotification,
  onRejectNotification,
}) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(
    (n) => !n.read
  ).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (!profileRef.current?.contains(e.target)) setShowProfile(false);
      if (!notifRef.current?.contains(e.target)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="header-landing">
      {/* Transparent Navbar */}
      <div className="navbar">
        <nav>
          <div className="logo-container">
            <div className="Logo">
              <img src="https://res.cloudinary.com/domogztsv/image/upload/v1765220874/WhatsApp_Image_2025-12-09_at_12.36.40_AM_bp8jxt.jpg"
                alt="AyuSethu Logo"></img>
            </div>
            <div>
              <div className="Logo-text">AyuSethu</div>
            </div>
          </div>

          <div className="nav-controls">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                className="nav-btn"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2645/2645897.png"
                  className="icon-img"
                />
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="dropdown-panel">
                  <div className="notifications-header">
                    <h3>Notifications</h3>
                    <span className="text-xs text-gray-500">{notifications.length} total</span>
                  </div>
                  <div className="divide-y">
                    {notifications.length === 0 ? (
                      <div className="p-20 text-center text-gray-500">
                        <BellRing className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No new notifications</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div key={notification._id} className="notification-item">
                          <div className="notification-content">
                            {notification.message}
                          </div>
                          <div className="notification-actions">
                            <button
                              className="action-btn reject"
                              onClick={() => {
                                onRejectNotification(notification);
                                setShowNotifications(false);
                              }}
                            >
                              Reject
                            </button>
                            <button
                              className="action-btn accept"
                              onClick={() => {
                                onAcceptNotification(notification);
                                setShowNotifications(false);
                              }}
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile - Larger button without name */}
            <div className="relative" ref={profileRef}>
              <button
                className="profile-btn-large"
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
              >
                <div className="animated-avatar-profile">
                  <img src={"https://img.freepik.com/premium-photo/young-optimistic-woman-doctor-is-holding-clipboard-her-hands-while-standing-sunny-clinic-portrait-friendly-female-physician-with-stethoscope-perfect-medical-service-hospital-me_665183-12973.jpg"} alt="Profile" />
                </div>
              </button>

              {showProfile && (
                <div className="dropdown-panel">
                  <div className="profile-header">
                    <div className="profile-info">
                      <div className="profile-avatar-lg">
                        <img src={"https://img.freepik.com/premium-photo/young-optimistic-woman-doctor-is-holding-clipboard-her-hands-while-standing-sunny-clinic-portrait-friendly-female-physician-with-stethoscope-perfect_medical-service-hospital-me_665183-12973.jpg"} alt="Profile" />
                      </div>
                      <div className="profile-details">
                        <h4>{tester.name || "Tester"}</h4>
                        <p>{tester.labName || "Laboratory"}</p>
                        <button
                          className="btn-logout"
                          onClick={onLogout}
                        >
                          <h3>LogOut</h3>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="profile-stats">
                    <div className="stat-item">
                      <div className="stat-label">License ID</div>
                      <div className="stat-value">{tester.licenseNumber || "N/A"}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Laboratory</div>
                      <div className="stat-value">{tester.institute_name || tester.labName || "N/A"}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Email</div>
                      <div className="stat-value">{tester.email || "N/A"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

// ===============================
// BATCH LIST COMPONENT (UPDATED WITH REAL DATA)
// ===============================

function BatchList({ batches, selectedBatchId, onSelectBatch, tester }) {
  if (!tester || !tester.id) {
    return (
      <div className="batch-sidebar">
        <div className="sidebar-header">
          <h2>Batch List</h2>
          <p>Loading tester info...</p>
        </div>
      </div>
    );
  }

  // Group batches based on real backend status
  const grouped = {
    "Pending Verification": batches.filter(b => b.status === "testing_assigned"),
    "In Progress": batches.filter(
      b => b.status === "testing_in_progress" && b.lab_data?.tester_id === tester.id
    ),
    "Completed": batches.filter(
      b => ["bidding_open", "rejected"].includes(b.status) && b.lab_data?.tester_id === tester.id
    ),
  };

  const icon = (batch) => {
    if (batch.status === "testing_assigned") {
      return <Clock className="w-4 h-4 text-amber-500" />;
    } else if (batch.status === "testing_in_progress") {
      return <Package className="w-4 h-4 text-blue-500" />;
    } else if (batch.status === "bidding_open") {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (batch.status === "rejected") {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="batch-sidebar">
      <div className="sidebar-header">
        <h2>Batch List</h2>
        <p>Select a batch to begin quality testing</p>
      </div>

      {Object.entries(grouped).map(([group, items]) =>
        items.length > 0 && (
          <div key={group} className="batch-group">
            <div className="batch-group-header">
              <div className="batch-group-title">{group}</div>
              <div className="batch-group-count">{items.length}</div>
            </div>

            <div className="space-y-2">
              {items.map((batch) => (
                <button
                  key={batch.batch_id || batch._id}
                  onClick={() => onSelectBatch(batch.batch_id)}
                  className={`batch-item ${selectedBatchId === batch.batch_id ? 'selected' : ''}`}
                >
                  <div className="batch-id">
                    <span>{batch.batch_id}</span>
                    {icon(batch)}
                  </div>
                  <div className="batch-name">{batch.herb_name || "Unknown Herb"}</div>
                  {batch.location && (
                    <div className="batch-details">
                      <div className="batch-detail">
                        <MapPin className="w-4 h-4" />
                        <span>{batch.location}</span>
                      </div>
                      {batch.timeline && batch.timeline.planting && (
                        <div className="batch-detail">
                          <CalendarDays className="w-4 h-4" />
                          <span>{new Date(batch.timeline.planting).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ===============================
// REUSABLE INPUT HELPERS
// ===============================

function renderInput(key, label, data, update, readonly = false, icon = null) {
  const IconComponent = icon;
  return (
    <div className="form-field">
      <label className="field-label">
        {IconComponent && React.cloneElement(icon, { className: "w-5 h-5" })}
        {label}
      </label>
      <input
        type="text"
        readOnly={readonly}
        value={data[key] ?? ""}
        onChange={(e) => update(key, e.target.value)}
        className="field-input"
      />
    </div>
  );
}

function renderNumber(key, label, data, update, icon = null) {
  const IconComponent = icon;
  return (
    <div className="form-field">
      <label className="field-label">
        {IconComponent && React.cloneElement(icon, { className: "w-5 h-5" })}
        {label}
      </label>
      <input
        type="number"
        step="0.01"
        value={data[key] ?? 0}
        onChange={(e) => update(key, parseFloat(e.target.value || "0"))}
        className="field-input"
      />
    </div>
  );
}

function renderSelect(key, label, data, update, options, icon = null) {
  const IconComponent = icon;
  return (
    <div className="form-field">
      <label className="field-label">
        {IconComponent && React.cloneElement(icon, { className: "w-5 h-5" })}
        {label}
      </label>
      <select
        value={data[key] ?? ""}
        onChange={(e) => update(key, e.target.value)}
        className="field-select"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

// ===============================
// ACCORDION SECTION
// ===============================

function AccordionSection({ open, onToggle, title, children, index }) {
  return (
    <div className="section-container">
      <button
        className="section-header"
        onClick={onToggle}
      >
        <div className="section-title">
          <span className="section-number">{index + 1}</span>
          <span className="section-name">{title}</span>
        </div>
        {open ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
      </button>

      {open && (
        <div className="section-content">
          {children}
        </div>
      )}
    </div>
  );
}

// ===============================
// TEST FORM (UPDATED WITH REAL API)
// ===============================

function TestForm({ batch, onSave, onSubmit, onFileUpload }) {
  const [openSection, setOpenSection] = useState("herb");
  const [formData, setFormData] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [labReportFile, setLabReportFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (batch) {
      setFormData({
        batch_id: batch.batch_id,
        herb_name: batch.herb_name,
        botanical_name: "", // Will be filled by tester
        collected_place: batch.location || "",
        collected_date: batch.timeline?.planting || "",
        dried: "Yes",
        processing_notes: "",
        color: "",
        odor: "",
        taste: "",
        texture: "",
        foreign_matter_percent: 0,
        microscopic_features: "",
        moisture_content_percent: 0,
        total_ash_percent: 0,
        acid_insoluble_ash_percent: 0,
        water_soluble_ash_percent: 0,
        alcohol_extract_percent: 0,
        water_extract_percent: 0,
        ph: 7,
        swelling_index: 0,
        foaming_index: 0,
        marker_compound_name: "",
        active_compound_percent: 0,
        phenolic_content: 0,
        flavonoid_content: 0,
        total_plate_count: 0,
        yeast_mold_count: 0,
        salmonella: "Not Detected",
        ecoli: "Not Detected",
        lead_ppm: 0,
        arsenic_ppm: 0,
        cadmium_ppm: 0,
        mercury_ppm: 0,
        pesticide_residue_ppm: 0,
        aflatoxin_ugkg: 0,
        passed: "true", // Default to true
        rejection_reason: "",
        lab_technician_name: "",
        test_date: new Date().toISOString().split("T")[0],
        lab_report_filename: "",
      });
    }
  }, [batch]);

  const toggle = (key) => setOpenSection(openSection === key ? null : key);
  const update = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLabReportFile(file);
      update("lab_report_filename", file.name);
    }
  };

  const handleSaveDraft = () => {
    onSave(formData);
  };

  const handleSubmitResult = (passed) => {
    if (passed === "false" && !formData.rejection_reason) {
      alert("Please provide rejection reason");
      return;
    }
    
    const resultData = {
      ...formData,
      passed: passed === "true"
    };
    
    onSubmit(resultData.passed, resultData, labReportFile);
  };

  if (!batch) {
    return (
      <div className="test-form-container flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-8">
            <PackageIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Select a Batch</h3>
          <p className="text-gray-600 text-lg">Choose a batch from the sidebar to begin quality testing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="test-form-container">
      <div className="form-header">
        <h2>Laboratory Testing Panel</h2>
        <p>Recording results for {batch.batch_id}</p>
      </div>

      <div className="batch-info-grid">
        <div className="info-card">
          <div className="info-label">
            <Leaf className="w-5 h-5" />
            Herb Name
          </div>
          <div className="info-value">{batch.herb_name}</div>
        </div>
        <div className="info-card">
          <div className="info-label">
            <Weight className="w-5 h-5" />
            Collector
          </div>
          <div className="info-value">{batch.collector_data?.name || "Unknown"}</div>
        </div>
        <div className="info-card">
          <div className="info-label">
            <MapPin className="w-5 h-5" />
            Location
          </div>
          <div className="info-value">{batch.location || "Unknown"}</div>
        </div>
        <div className="info-card">
          <div className="info-label">
            <CalendarDays className="w-5 h-5" />
            Created
          </div>
          <div className="info-value">
            {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : "Unknown"}
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <AccordionSection
        open={openSection === "herb"}
        onToggle={() => toggle("herb")}
        title="HERB INFORMATION"
        index={0}
      >
        <div className="form-grid">
          {renderInput("batch_id", "Batch ID", formData, update, true, <Hash />)}
          {renderInput("herb_name", "Herb Name", formData, update, false, <Leaf />)}
          {renderInput("botanical_name", "Botanical Name", formData, update, false, <Type />)}
          {renderInput("collected_place", "Collection Place", formData, update, false, <MapPin />)}
          <div className="form-field">
            <label className="field-label">
              <CalendarDays className="w-5 h-5" />
              Collection Date
            </label>
            <input
              type="date"
              value={formData.collected_date}
              onChange={(e) => update("collected_date", e.target.value)}
              className="field-input"
            />
          </div>
          {renderSelect("dried", "Dried Status", formData, update, ["Yes", "No", "Partially"], <Thermometer />)}
          <div className="form-field col-span-2">
            <label className="field-label">
              <FileText className="w-5 h-5" />
              Processing Notes
            </label>
            <textarea
              className="field-textarea"
              value={formData.processing_notes}
              onChange={(e) => update("processing_notes", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        open={openSection === "identity"}
        onToggle={() => toggle("identity")}
        title="IDENTITY TEST RESULTS"
        index={1}
      >
        <div className="form-grid">
          {renderInput("color", "Color", formData, update, false, <Eye />)}
          {renderInput("odor", "Odor", formData, update, false, <Thermometer />)}
          {renderInput("taste", "Taste", formData, update, false, <Droplets />)}
          {renderInput("texture", "Texture", formData, update, false, <Scale />)}
          {renderNumber("foreign_matter_percent", "Foreign Matter %", formData, update, <Percent />)}
          <div className="form-field col-span-2">
            <label className="field-label">
              <Microscope className="w-5 h-5" />
              Microscopic Features
            </label>
            <textarea
              className="field-textarea"
              value={formData.microscopic_features}
              onChange={(e) => update("microscopic_features", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        open={openSection === "physico"}
        onToggle={() => toggle("physico")}
        title="PHYSICOCHEMICAL RESULTS"
        index={2}
      >
        <div className="form-grid">
          {renderNumber("moisture_content_percent", "Moisture %", formData, update, <Droplets />)}
          {renderNumber("total_ash_percent", "Total Ash %", formData, update, <FlaskConical />)}
          {renderNumber("acid_insoluble_ash_percent", "Acid Insoluble Ash %", formData, update, <Beaker />)}
          {renderNumber("water_soluble_ash_percent", "Water Soluble Ash %", formData, update, <Droplets />)}
          {renderNumber("alcohol_extract_percent", "Alcohol Extract %", formData, update, <TestTube />)}
          {renderNumber("water_extract_percent", "Water Extract %", formData, update, <Droplets />)}
          {renderNumber("ph", "pH Level", formData, update, <Activity />)}
          {renderNumber("swelling_index", "Swelling Index", formData, update, <BarChart3 />)}
          {renderNumber("foaming_index", "Foaming Index", formData, update, <BarChart3 />)}
        </div>
      </AccordionSection>

      <AccordionSection
        open={openSection === "phyto"}
        onToggle={() => toggle("phyto")}
        title="PHYTOCHEMICAL RESULTS"
        index={3}
      >
        <div className="form-grid">
          {renderInput("marker_compound_name", "Marker Compound", formData, update, false, <FlaskConical />)}
          {renderNumber("active_compound_percent", "Active Compound %", formData, update, <Percent />)}
          {renderNumber("phenolic_content", "Phenolic Content", formData, update, <BarChart3 />)}
          {renderNumber("flavonoid_content", "Flavonoid Content", formData, update, <Leaf />)}
        </div>
      </AccordionSection>

      <AccordionSection
        open={openSection === "micro"}
        onToggle={() => toggle("micro")}
        title="MICROBIAL & CONTAMINANTS"
        index={4}
      >
        <div className="form-grid">
          {renderNumber("total_plate_count", "Total Plate Count", formData, update, <Activity />)}
          {renderNumber("yeast_mold_count", "Yeast & Mold Count", formData, update, <Bug />)}
          {renderSelect("salmonella", "Salmonella", formData, update, ["Not Detected", "Detected"], <Skull />)}
          {renderSelect("ecoli", "E. Coli", formData, update, ["Not Detected", "Detected"], <Bug />)}
          {renderNumber("lead_ppm", "Lead (ppm)", formData, update, <Shield />)}
          {renderNumber("arsenic_ppm", "Arsenic (ppm)", formData, update, <Shield />)}
          {renderNumber("cadmium_ppm", "Cadmium (ppm)", formData, update, <Shield />)}
          {renderNumber("mercury_ppm", "Mercury (ppm)", formData, update, <Shield />)}
        </div>
      </AccordionSection>

      <AccordionSection
        open={openSection === "final"}
        onToggle={() => toggle("final")}
        title="FINAL LAB DECISION"
        index={5}
      >
        <div className="form-grid">
          {renderSelect("passed", "Final Decision", formData, update, ["true", "false"], <Shield />)}
          {renderInput("rejection_reason", "Rejection Reason", formData, update, false, <FileText />)}
          {renderInput("lab_technician_name", "Technician Name", formData, update, false, <UserCheck />)}
          <div className="form-field">
            <label className="field-label">
              <CalendarDays className="w-5 h-5" />
              Test Date
            </label>
            <input
              type="date"
              value={formData.test_date}
              onChange={(e) => update("test_date", e.target.value)}
              className="field-input"
            />
          </div>

          <div className="form-field col-span-2">
            <label className="field-label">
              <FileSpreadsheet className="w-5 h-5" />
              Laboratory Report
            </label>
            <div
              className="file-upload"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="file-upload-content">
                <div className="file-upload-icon">
                  <Upload className="w-7 h-7" style={{ color: THEME }} />
                </div>
                <h4>Drop report here or click to browse</h4>
                <p>Upload lab reports in PDF, DOC, or TXT format</p>
              </div>

              {formData.lab_report_filename && (
                <div className="file-preview">
                  <div className="file-info">
                    <FileText className="w-6 h-6" style={{ color: THEME }} />
                    <span className="file-name">{formData.lab_report_filename}</span>
                  </div>
                  <Download className="w-6 h-6 text-gray-400 cursor-pointer hover:text-green-600 transition-colors" />
                </div>
              )}
            </div>
          </div>

          <div className="form-field col-span-2">
            <label className="field-label">
              <ClipboardCheck className="w-5 h-5" />
              Laboratory Comments
            </label>
            <textarea
              className="field-textarea"
              placeholder="Enter detailed observations, deviations, or special findings..."
              rows={4}
              value={formData.lab_comments || ""}
              onChange={(e) => update("lab_comments", e.target.value)}
            />
          </div>
        </div>
      </AccordionSection>

      <div className="action-buttons">
        <button
          className="btn-save"
          onClick={handleSaveDraft}
        >
          <Save className="w-6 h-6" />
          Save Draft
        </button>
        <button
          className="btn-approve"
          onClick={() => setShowConfirmModal(true)}
        >
          <CheckCircle className="w-6 h-6" />
          Approve & Submit
        </button>
        <button
          className="btn-reject"
          onClick={() => {
            if (!formData.rejection_reason) {
              const reason = prompt("Enter rejection reason:");
              if (reason) {
                update("rejection_reason", reason);
                handleSubmitResult("false");
              }
            } else {
              handleSubmitResult("false");
            }
          }}
        >
          <XCircle className="w-6 h-6" />
          Reject Batch
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <FileCheck className="w-7 h-7" style={{ color: THEME }} />
                </div>
                <div>
                  <h3>Confirm & Submit Results</h3>
                  <p>Review key details before submitting to blockchain</p>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-summary">
                <div className="summary-item">
                  <div className="summary-label">Batch ID</div>
                  <div className="summary-value">{formData.batch_id}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Herb Name</div>
                  <div className="summary-value">{formData.herb_name}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Test Date</div>
                  <div className="summary-value">{formData.test_date}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Technician</div>
                  <div className="summary-value">{formData.lab_technician_name || "—"}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Moisture %</div>
                  <div className="summary-value">{formData.moisture_content_percent}%</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Active Compound</div>
                  <div className="summary-value">{formData.active_compound_percent}%</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn confirm"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmitResult("true");
                }}
              >
                <Database className="w-5 h-5 mr-2" />
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===============================
// HISTORY SECTION (UPDATED WITH REAL DATA)
// ===============================

function HistorySection({ history }) {
  const handleExport = () => {
    alert("Exporting data... This would trigger a download in production.");
  };

  const handleView = (id) => {
    alert(`Viewing details for test ${id}`);
  };

  const handleDownload = (id) => {
    alert(`Downloading report for test ${id}`);
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    alert(`Copied ID: ${id}`);
  };

  return (
    <div className="history-section">
      <div className="history-container">
        <div className="history-header">
          <div>
            <h2 className="history-title">Completed Test History</h2>
            <p className="history-subtitle">
              Recently verified batches from the database
            </p>
          </div>
          <button className="export-btn" onClick={handleExport}>
            <Download className="w-5 h-5" />
            Export Data
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">No Test History Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Complete your first batch test to see it appear here.
            </p>
          </div>
        ) : (
          <div className="history-table">
            <thead>
              <tr>
                <th>Herb Name</th>
                <th>Batch ID</th>
                <th>Status</th>
                <th>Submitted At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.batch_id}>
                  <td className="font-bold text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-green-600" />
                      </div>
                      {item.herb_name}
                    </div>
                  </td>
                  <td className="font-mono font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      {item.batch_id}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${item.passed ? 'status-approved' : 'status-rejected'}`}>
                      {item.passed ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          PASSED
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          REJECTED
                        </>
                      )}
                    </span>
                  </td>
                  <td className="text-gray-700 font-medium">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : "N/A"}
                    </div>
                  </td>
                  <td>
                    <div className="action-cell">
                      <div
                        className="action-icon view"
                        onClick={() => handleView(item.batch_id)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </div>
                      <div
                        className="action-icon download"
                        onClick={() => handleDownload(item.batch_id)}
                        title="Download Report"
                      >
                        <Download className="w-4 h-4" />
                      </div>
                      <div
                        className="action-icon copy"
                        onClick={() => handleCopy(item.batch_id)}
                        title="Copy ID"
                      >
                        <Copy className="w-4 h-4" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </div>
        )}
      </div>
    </div>
  );
}

// ===============================
// MAIN APP COMPONENT WITH REAL API
// ===============================

function VirtuHerbChainApp() {
  const [tester, setTester] = useState({});
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- LOAD DATA FROM API ---------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 1. Load tester info
        const meRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: authHeaders(),
        });
        
        if (meRes.ok) {
          const testerData = await meRes.json();
          setTester(testerData);
        } else if (meRes.status === 401) {
          console.error("Token invalid, redirecting to login");
          window.location.href = "/login";
          return;
        }

        // 2. Load batches
        const batchesRes = await fetch(`${API_BASE}/api/lab/batches`, {
          headers: authHeaders(),
        });
        
        if (batchesRes.ok) {
          const batchesData = await batchesRes.json();
          setBatches(Array.isArray(batchesData) ? batchesData : []);
        }

        // 3. Load notifications
        const notifRes = await fetch(`${API_BASE}/api/notifications`, {
          headers: authHeaders(),
        });
        
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(Array.isArray(notifData) ? notifData : []);
        }

        // 4. Load history
        const historyRes = await fetch(`${API_BASE}/api/lab/history`, {
          headers: authHeaders(),
        });
        
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setHistory(Array.isArray(historyData) ? historyData : []);
        }

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchBatches = async () => {
    const res = await fetch(`${API_BASE}/api/lab/batches`, {
      headers: authHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      setBatches(Array.isArray(data) ? data : []);
    }
  };
  
  const fetchNotifications = async () => {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      headers: authHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    }
  };

  /* ---------- ACTIONS ---------- */
  const handleAcceptNotification = async (notification) => {
    try {
      const res = await fetch(`${API_BASE}/api/lab/accept`, {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ batch_id: notification.batch_id })
      });
    
      if (!res.ok) {
        alert("Batch already accepted by another tester");
        return;
      }
    
      fetchBatches();
      fetchNotifications();
    } catch (error) {
      console.error("Error accepting notification:", error);
      alert("Failed to accept batch");
    }
  };

  const handleRejectNotification = async (notification) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${notification._id}/read`, {
        method: "PUT",
        headers: authHeaders(),
      });
    
      setNotifications(prev => prev.filter(x => x._id !== notification._id));
    } catch (error) {
      console.error("Error rejecting notification:", error);
    }
  };

  const handleSaveDraft = (data) => {
    if (!selectedBatchId) return;
    setTestResults(prev => ({ ...prev, [selectedBatchId]: { ...prev[selectedBatchId], ...data } }));
    alert("Draft saved locally!");
  };

  const handleSubmitResult = async (passed, finalData, labReportFile) => {
    try {
      const form = new FormData();
      form.append("batch_id", finalData.batch_id);
      form.append("result_json", JSON.stringify({ ...finalData, passed }));
      if (labReportFile) form.append("report", labReportFile);

      const res = await fetch(`${API_BASE}/api/lab/submit`, {
        method: "POST",
        headers: authHeadersFormData(),
        body: form,
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      // Refresh data
      fetchBatches();
      fetchNotifications();
      
      // Load updated history
      const historyRes = await fetch(`${API_BASE}/api/lab/history`, {
        headers: authHeaders(),
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(Array.isArray(historyData) ? historyData : []);
      }

      setSelectedBatchId(null);
      alert(passed ? "✓ Batch approved & submitted successfully!" : `✗ Batch rejected successfully`);
    } catch (error) {
      console.error("Error submitting result:", error);
      alert("Failed to submit results");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const selectedBatch = batches.find(b => b.batch_id === selectedBatchId);
  const selectedTestResult = selectedBatchId ? testResults[selectedBatchId] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading laboratory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        tester={tester}
        notifications={notifications}
        onLogout={handleLogout}
        onAcceptNotification={handleAcceptNotification}
        onRejectNotification={handleRejectNotification}
      />

      <div className="main-container">
        <BatchList
          batches={batches}
          selectedBatchId={selectedBatchId}
          onSelectBatch={setSelectedBatchId}
          tester={tester}
        />

        <TestForm
          batch={selectedBatch}
          onSave={handleSaveDraft}
          onSubmit={handleSubmitResult}
        />
      </div>

      <HistorySection history={history} />
    </div>
  );
}

export default VirtuHerbChainApp;