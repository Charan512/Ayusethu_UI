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

  const avatarSrc = "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=200&auto=format&fit=crop&crop=faces";

  const unreadCount = notifications.filter(
    (n) => !n.read && n.status === "pending"
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
            {/* <div className="logo-icon">
              <Leaf className="w-5 h-5" />
            </div> */}
            <div>
              <div className="text-base font-bold">AyuSethu</div>
              <div className="text-xs opacity-80">Tester Portal</div>
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
                    {notifications.filter(n => n.status === "pending").length === 0 ? (
                      <div className="p-20 text-center text-gray-500">
                        <BellRing className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No new notifications</p>
                      </div>
                    ) : (
                      notifications.filter(n => n.status === "pending").map(notification => (
                        <div key={notification.id} className="notification-item">
                          <div className="notification-content">
                            {notification.message}
                          </div>
                          <div className="notification-actions">
                            <button
                              className="action-btn reject"
                              onClick={() => {
                                onRejectNotification(notification.id, notification.batch_id);
                                setShowNotifications(false);
                              }}
                            >
                              Reject
                            </button>
                            <button
                              className="action-btn accept"
                              onClick={() => {
                                onAcceptNotification(notification.id, notification.batch_id);
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
                        <img src={"https://img.freepik.com/premium-photo/young-optimistic-woman-doctor-is-holding-clipboard-her-hands-while-standing-sunny-clinic-portrait-friendly-female-physician-with-stethoscope-perfect-medical-service-hospital-me_665183-12973.jpg"} alt="Profile" />
                      </div>
                      <div className="profile-details">
                        <h4>Dr. Sarah Chen</h4>
                        <p>Lead Quality Tester</p>
                        <button
                          className="btn-logout"
                          onClick={() => {
                            // your logout function here
                            handleLogout();
                          }}
                        >
                          <h3>LogOut</h3>
                        </button>

                      </div>
                    </div>
                  </div>

                  <div className="profile-stats">
                    <div className="stat-item">
                      <div className="stat-label">License ID</div>
                      <div className="stat-value">LIC-2024-001</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Laboratory</div>
                      <div className="stat-value">National Herbal Lab</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Tests Today</div>
                      <div className="stat-value">12</div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Header Content */}
    </div>
  );
}

// ===============================
// BATCH LIST COMPONENT
// ===============================

function BatchList({ batches, selectedBatchId, onSelectBatch }) {
  const grouped = {
    "Pending Verification": batches.filter(
      (b) => b.status === "accepted" || b.status === "to_test" || b.status === "pending"
    ),
    "In Progress": batches.filter(
      (b) => b.status === "in_progress" || b.status === "ongoing"
    ),
    "Completed": batches.filter(
      (b) => b.status === "completed" || b.status === "rejected"
    ),
  };

  const icon = (status) => {
    switch (status) {
      case "accepted":
      case "to_test":
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "in_progress":
      case "ongoing":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
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
                  key={batch.id}
                  onClick={() => onSelectBatch(batch.id)}
                  className={`batch-item ${selectedBatchId === batch.id ? 'selected' : ''}`}
                >
                  <div className="batch-id">
                    <span>{batch.batch_id}</span>
                    {icon(batch.status)}
                  </div>
                  <div className="batch-name">{batch.herb_name}</div>
                  <div className="batch-details">
                    <div className="batch-detail">
                      <Weight className="w-4 h-4" />
                      <span>{batch.quantity}g</span>
                    </div>
                    <div className="batch-detail">
                      <MapPin className="w-4 h-4" />
                      <span>{batch.location}</span>
                    </div>
                    <div className="batch-detail">
                      <CalendarDays className="w-4 h-4" />
                      <span>{batch.collected_date}</span>
                    </div>
                  </div>
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
// TEST FORM
// ===============================

function TestForm({ batch, testResult, onSave, onSubmit }) {
  const [openSection, setOpenSection] = useState("herb");
  const [formData, setFormData] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (testResult) {
      setFormData(testResult);
    } else if (batch) {
      setFormData({
        batch_id: batch.batch_id,
        herb_name: batch.herb_name,
        botanical_name: batch.botanical_name,
        collected_place: batch.location,
        collected_date: batch.collected_date,
        dried: batch.dried ? "Yes" : "No",
        processing_notes: batch.processing_notes || "",
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
        passed: false,
        rejection_reason: "",
        lab_technician_name: "",
        test_date: new Date().toISOString().split("T")[0],
        lab_report_filename: "",
      });
    }
  }, [batch, testResult]);

  const toggle = (key) => setOpenSection(openSection === key ? null : key);
  const update = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      update("lab_report_filename", file.name);
    }
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
            Quantity
          </div>
          <div className="info-value">{batch.quantity}g</div>
        </div>
        <div className="info-card">
          <div className="info-label">
            <MapPin className="w-5 h-5" />
            Location
          </div>
          <div className="info-value">{batch.location}</div>
        </div>
        <div className="info-card">
          <div className="info-label">
            <UserCheck className="w-5 h-5" />
            Collector
          </div>
          <div className="info-value">{batch.collector_name}</div>
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
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="file-upload-content">
                <div className="file-upload-icon">
                  <Upload className="w-7 h-7" style={{ color: THEME }} />
                </div>
                <h4>Drop PDF here or click to browse</h4>
                <p>You can upload lab reports in PDF or DOC format for archival</p>
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
              Laboratory Comments & Observations
            </label>
            <textarea
              className="field-textarea"
              placeholder="Enter detailed observations, deviations, or special findings from the laboratory tests..."
              rows={4}
            />
          </div>
        </div>
      </AccordionSection>

      <div className="action-buttons">
        <button
          className="btn-save"
          onClick={() => onSave(formData)}
        >
          <Save className="w-6 h-6" />
          Save Draft
        </button>
        <button
          className=" btn-approve"
          onClick={() => setShowConfirmModal(true)}
        >
          <CheckCircle className="w-6 h-6" />
          Approve & Seal on Chain
        </button>
        <button
          className="btn-reject"
          onClick={() => {
            const reason = prompt("Enter rejection reason:");
            if (reason) onSubmit(false, reason, formData);
          }}
        >
          <XCircle className="w-6 h-6" />
          Reject & Flag Batch
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
                  <h3>Confirm & Seal on Blockchain</h3>
                  <p>Review key details before permanent sealing on the distributed ledger</p>
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
                  onSubmit(true, undefined, formData);
                }}
              >
                <Database className="w-5 h-5 mr-2" />
                Confirm & Seal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===============================
// HISTORY SECTION
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
              Recently verified batches with parity and approval ratios. Synced with private ledger + public VHC index.
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
              Complete your first batch test to see it appear here. All approved tests will be permanently recorded.
            </p>
          </div>
        ) : (
          <div className="history-table">
            <thead>
              <tr>
                <th>Herb Name</th>
                <th>Batch ID</th>
                <th>License Number</th>
                <th>Final Status</th>
                <th>Test Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
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
                  <td className="font-mono text-gray-700 font-medium">{item.license_id}</td>
                  <td>
                    <span className={`status-badge ${item.final_status === 'passed' ? 'status-approved' : 'status-rejected'}`}>
                      {item.final_status === 'passed' ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Approved
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Rejected
                        </>
                      )}
                    </span>
                  </td>
                  <td className="text-gray-700 font-medium">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      {new Date(item.test_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td>
                    <div className="action-cell">
                      <div
                        className="action-icon view"
                        onClick={() => handleView(item.id)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </div>
                      <div
                        className="action-icon download"
                        onClick={() => handleDownload(item.id)}
                        title="Download Report"
                      >
                        <Download className="w-4 h-4" />
                      </div>
                      <div
                        className="action-icon copy"
                        onClick={() => handleCopy(item.id)}
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
// MAIN APP COMPONENT
// ===============================

function VirtuHerbChainApp() {
  const [tester] = useState({
    id: "mock-tester-id",
    name: "Dr. Sarah Chen",
    institute_name: "National Herbal Testing Laboratory",
    license_id: "LIC-2024-001",
  });

  const [batches, setBatches] = useState([
    {
      id: "batch-1",
      batch_id: "VHC-2024-001",
      herb_name: "Ashwagandha",
      botanical_name: "Withania somnifera",
      quantity: 500,
      location: "Rajasthan, India",
      collector_name: "Ravi Kumar",
      collected_date: "2024-11-15",
      dried: true,
      processing_notes: "Sun-dried 7 days",
      status: "accepted",
    },
    {
      id: "batch-2",
      batch_id: "VHC-2024-002",
      herb_name: "Tulsi",
      botanical_name: "Ocimum sanctum",
      quantity: 750,
      location: "Kerala, India",
      collector_name: "Priya Nair",
      collected_date: "2024-11-18",
      dried: true,
      processing_notes: "Shade-dried 5 days",
      status: "in_progress",
    },
    {
      id: "batch-3",
      batch_id: "VHC-2024-003",
      herb_name: "Turmeric",
      botanical_name: "Curcuma longa",
      quantity: 1000,
      location: "Karnataka, India",
      collector_name: "Amit Patel",
      collected_date: "2024-11-20",
      dried: false,
      processing_notes: "Fresh rhizomes",
      status: "pending",
    },
  ]);

  const [selectedBatchId, setSelectedBatchId] = useState("batch-1");
  const [testResults, setTestResults] = useState({});
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      batch_id: "batch-3",
      message: "New batch VHC-2024-003 (Turmeric, 1000g) requires testing",
      read: false,
      status: "pending",
    },
  ]);

  const [history, setHistory] = useState([
    {
      id: "history-1",
      batch_id: "VHC-2024-000",
      herb_name: "Brahmi",
      license_id: "LIC-2024-001",
      final_status: "passed",
      test_date: "2024-11-10",
    },
    {
      id: "history-2",
      batch_id: "VHC-2023-999",
      herb_name: "Ginger",
      license_id: "LIC-2024-001",
      final_status: "passed",
      test_date: "2024-11-05",
    },
  ]);

  const handleLogout = () => {
    console.log("Logout initiated");
    alert("Logout successful");
  };

  const handleAcceptNotification = (notifId, batchId) => {
    setNotifications(prev => prev.map(n =>
      n.id === notifId ? { ...n, status: "accepted", read: true } : n
    ));
    setBatches(prev => prev.map(b =>
      b.id === batchId ? { ...b, status: "accepted" } : b
    ));
  };

  const handleRejectNotification = (notifId, batchId) => {
    setNotifications(prev => prev.map(n =>
      n.id === notifId ? { ...n, status: "rejected", read: true } : n
    ));
    setBatches(prev => prev.map(b =>
      b.id === batchId ? { ...b, status: "rejected" } : b
    ));
  };

  const handleSave = (data) => {
    if (!selectedBatchId) return;
    setTestResults(prev => ({ ...prev, [selectedBatchId]: { ...prev[selectedBatchId], ...data } }));
    setBatches(prev => prev.map(b =>
      b.id === selectedBatchId ? { ...b, status: "in_progress" } : b
    ));
    alert("Draft saved successfully!");
  };

  const handleSubmit = (passed, reason, finalData) => {
    if (!selectedBatchId) return;
    const batch = batches.find(b => b.id === selectedBatchId);
    if (!batch) return;

    const entry = {
      id: "history-" + Date.now(),
      batch_id: batch.batch_id,
      herb_name: batch.herb_name,
      license_id: tester.license_id,
      final_status: passed ? "passed" : "rejected",
      test_date: new Date().toISOString().split("T")[0],
    };

    setHistory(prev => [entry, ...prev]);
    setBatches(prev => prev.map(b =>
      b.id === selectedBatchId ? { ...b, status: passed ? "completed" : "rejected" } : b
    ));
    setSelectedBatchId(null);
    alert(passed ? "✓ Batch approved & blockchain sealed successfully!" : `✗ Batch rejected: ${reason}`);
  };

  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  const selectedTestResult = selectedBatchId ? testResults[selectedBatchId] : null;

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
        />

        <TestForm
          batch={selectedBatch}
          testResult={selectedTestResult}
          onSave={handleSave}
          onSubmit={handleSubmit}
        />
      </div>

      <HistorySection history={history} />
    </div>
  );
}

export default VirtuHerbChainApp;