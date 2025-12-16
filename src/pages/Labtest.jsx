import React, { useEffect, useState, useRef } from "react";
import {
  BellRing, Package, Clock, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Save, Calendar, Upload, Eye, Download,
  FileText, FlaskConical, Microscope, TestTube, Thermometer,
  Droplets, Shield, Leaf, Bug, Skull, Beaker, Scale, Activity,
  FileCheck, Database, BarChart3, ClipboardCheck, FileSpreadsheet,
  Percent, Hash, Type, CalendarDays, MapPin, Package as PackageIcon,
  Weight, UserCheck, Copy,User
} from "lucide-react";
import "../styles/Labtest.css";

/* ===============================
   CONFIG
================================ */
const API_BASE = process.env.API_BASE;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ===============================
   HEADER
================================ */
function Header({ tester, notifications, onLogout, onAccept, onReject }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(
    n => !n.read && n.category === "lab"
  ).length;
  


  useEffect(() => {
    const handler = (e) => {
      if (!profileRef.current?.contains(e.target)) setShowProfile(false);
      if (!notifRef.current?.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="header-landing">
      <div className="navbar">
        <nav>
          <div className="logo-container">
            <div className="Logo-text">AyuSethu</div>
          </div>

          <div className="nav-controls">
            {/* Notifications */}
            <div ref={notifRef}>
              <button
                className="nav-btn"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
              >
                <BellRing />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="dropdown-panel">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center">No notifications</p>
                  ) : (
                    notifications.filter(n => n.category === "lab").map(n => (
                      <div key={n.id} className="notification-item">
                        <p>{n.message}</p>
                        {!n.read && (
                          <div className="notification-actions">
                            <button onClick={() => onReject(n)}>Reject</button>
                            <button onClick={() => onAccept(n)}>Accept</button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div ref={profileRef}>
              <button
                className="profile-btn-large"
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
              >
                <User />
              </button>

              {showProfile && (
                <div className="dropdown-panel">
                  <h4>{tester.name}</h4>
                  <p>{tester.institute_name}</p>
                  <p>License: {tester.license_id}</p>
                  <button onClick={onLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ===============================
   BATCH LIST
================================ */
function BatchList({ batches, selectedBatchId, onSelect, tester}) {
  if (!tester.id) return <div className="batch-sidebar" />;
  const grouped = {
    Pending: batches.filter(b => b.status === "testing_assigned"),
    InProgress: batches.filter(
      b => b.status === "testing_in_progress" && b.lab_data?.tester_id === tester.id
    ),
    Completed: batches.filter(
      b =>
        ["bidding_open", "rejected"].includes(b.status) &&
        b.lab_data?.tester_id === tester.id
    ),    
  };
  

  return (
    <div className="batch-sidebar">
      {Object.entries(grouped).map(([title, items]) =>
        items.length > 0 && (
          <div key={title}>
            <h3>{title}</h3>
            {items.map(b => (
              <button
                key={b.batch_id}
                className={selectedBatchId === b.batch_id ? "selected" : ""}
                onClick={() => onSelect(b.batch_id)}
              >
                <div>{b.batch_id}</div>
                <div>{b.herb_name}</div>
              </button>
            ))}
          </div>
        )
      )}
    </div>
  );
}

/* ===============================
   MAIN APP
================================ */
export default function VirtuHerbChainApp() {
  const [tester, setTester] = useState({});
  const [batches, setBatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    fetch(`${API_BASE}/api/lab/batches`, { headers: authHeaders() })
      .then(r => r.json())
      .then(setBatches);

      fetch(`${API_BASE}/api/notifications`, { headers: authHeaders() })
      .then(r => r.json())
      .then(setNotifications);

    fetch(`${API_BASE}/api/lab/history`, { headers: authHeaders() })
      .then(r => r.json())
      .then(setHistory);

    // decode token for tester info (simple version)
    fetch(`${API_BASE}/api/auth/me`, {
      headers: authHeaders(),
    })
      .then(r => r.json())
      .then(setTester);
    
  }, []);
  const fetchBatches = async () => {
    const res = await fetch(`${API_BASE}/api/lab/batches`, {
      headers: authHeaders(),
    });
    setBatches(await res.json());
  };
  
  const fetchNotifications = async () => {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      headers: authHeaders(),
    });
    setNotifications(await res.json());
  };
  
  /* ---------- ACTIONS ---------- */
  const acceptNotification = async (n) => {
    const res = await fetch(`${API_BASE}/api/lab/accept`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ batch_id: n.batch_id })
    });
  
    if (!res.ok) {
      alert("Batch already accepted by another tester");
      return;
    }
  
    fetchBatches();
    fetchNotifications();
  };
  

  const rejectNotification = async (n) => {
    await fetch(`${API_BASE}/api/notifications/${n.id}/read`, {
      method: "PUT",
      headers: authHeaders(),
    });
  
    setNotifications(prev => prev.filter(x => x.id !== n.id));
  };
  

  const submitLabResult = async (passed, data, file) => {
    const form = new FormData();
    form.append("batch_id", data.batch_id);
    form.append("result_json", JSON.stringify({ ...data, passed }));
    if (file) form.append("report", file);

    await fetch(`${API_BASE}/api/lab/submit`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    });

    setSelectedBatchId(null);
  };

  const selectedBatch = batches.find(b => b.batch_id === selectedBatchId);

  return (
    <div className="min-h-screen">
      <Header
        tester={tester}
        notifications={notifications}
        onAccept={acceptNotification}
        onReject={rejectNotification}
        onLogout={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      />

      <div className="main-container">
        <BatchList
          batches={batches}
          selectedBatchId={selectedBatchId}
          onSelect={setSelectedBatchId}
          tester={tester}
        />

        {!selectedBatch ? (
          <div className="empty-panel">
            <PackageIcon size={64} />
            <p>Select a batch to begin testing</p>
          </div>
        ) : (
          <div className="test-form-container">
            {/* 🔥 You already have the full TestForm UI – reuse it here */}
            <p>Batch selected: {selectedBatch.batch_id}</p>
            {/* call submitLabResult() from your existing buttons */}
          </div>
        )}
      </div>

      {/* HISTORY */}
      <div className="history-section">
        <h2>Completed Tests</h2>
        {history.map(h => (
          <div key={h.batch_id}>
            {h.batch_id} – {h.passed ? "PASSED" : "FAILED"}
          </div>
        ))}
      </div>
    </div>
  );
}
