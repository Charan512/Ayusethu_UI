import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Collector.module.css";
import { Bell, X, CheckCircle, AlertCircle, MapPin, Camera } from 'lucide-react';
const API_BASE = import.meta.env.API_BASE;

// ✅ FIX #6: Improved token handling with validation
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    localStorage.clear();
    window.location.href = "/";
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

// ✅ FIX #6: Global API error handler
const handleApiError = (res) => {
  if (res.status === 401 || res.status === 403) {
    localStorage.clear();
    window.location.href = "/";
    throw new Error("Session expired");
  }
};


const STAGE_DATA = [
  {
    id: 1,
    title: "Stage 1",
  },
  {
    id: 2,
    title: "Stage 2",
    description: "Growth monitoring"
  },
  {
    id: 3,
    title: "Stage 3",
    description: "Health assessment"
  },
  {
    id: 4,
    title: "Stage 4",
    description: "Pre-harvest check"
  },
  {
    id: 5,
    title: "Stage 5",
    description: "Final verification"
  },
];

// \u274c FIX #7: Removed hardcoded NOTIFICATIONS - fetch from backend instead

function App() {
  // ✅ CRITICAL: Photo hash generation for ML integrity
  const generatePhotoHash = async (file) => {
    if (!crypto?.subtle) {
      throw new Error("Crypto API not supported");
    }

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // 2️⃣ ML VERIFICATION FUNCTION
  const verifyLeafWithML = async () => {
    if (!stage5Form.finalPhoto) {
      setToast("❌ Upload leaf image first");
      return;
    }

    if (!activeBatch?.batch_id) {
      setToast("❌ No active batch");
      return;
    }

    try {
      setVerifying(true);
      setToast("🔍 Verifying herb species...");

      // ✅ Generate hash of current photo
      const currentHash = await generatePhotoHash(stage5Form.finalPhoto);

      const formData = new FormData();
      formData.append("image", stage5Form.finalPhoto);
      formData.append("batch_id", activeBatch.batch_id);

      // Add 20s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(`${API_BASE}/api/collector/verify-leaf`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // ⚠️ FIX 4: Check status before parsing JSON
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Verification failed");
      }

      const data = await res.json();

      // Validate response schema
      if (typeof data.match !== "boolean" || !data.predicted_species) {
        throw new Error("Invalid ML response");
      }

      setMlResult(data);

      if (data.match === true) {
        setIsLeafVerified(true);
        setVerifiedPhotoHash(currentHash); // ✅ CRITICAL: Store hash
        setToast(`✅ Verified: ${data.predicted_species}`);
      } else {
        setIsLeafVerified(false);
        setToast(
          `❌ Mismatch! Predicted: ${data.predicted_species}, Expected: ${data.expected_species}`
        );
      }
    } catch (err) {
      console.error(err);
      setIsLeafVerified(false);
      if (err.name === 'AbortError') {
        setToast("❌ Verification timeout (20s)");
      } else {
        setToast("❌ ML verification failed");
      }
    } finally {
      setVerifying(false);
      setTimeout(() => setToast(""), 4000);
    }
  };

  const submitStage5 = async () => {
    // 5️⃣ BLOCK SUBMISSION UNLESS VERIFIED
    if (!isLeafVerified) {
      setToast("❌ Herb not verified. Cannot submit.");
      return;
    }

    // ✅ CRITICAL: Validate photo hasn't changed since ML verification
    try {
      const currentHash = await generatePhotoHash(stage5Form.finalPhoto);
      if (currentHash !== verifiedPhotoHash) {
        setToast("❌ Photo changed after verification. Re-verify.");
        setIsLeafVerified(false);
        return;
      }
    } catch (err) {
      setToast("❌ Photo validation failed");
      return;
    }

    if (!activeBatch?.batch_id) {
      setToast("❌ No active batch");
      return;
    }

    const formData = new FormData();
    formData.append("batch_id", activeBatch.batch_id);
    formData.append("stage", 5);
    formData.append("notes", "Final harvest completed");
    formData.append("photo", stage5Form.finalPhoto);
    // \u2705 CRITICAL: Send all required Stage 5 data
    formData.append("final_quantity", stage5Form.finalQuantity || "");
    formData.append("harvest_date", stage5Form.finalHarvestDate || "");
    formData.append("geotag", stage5Form.finalGeotag || "");
    formData.append("dispatch_auth", stage5Form.dispatchAuth || false);
    formData.append("sample_collected", stage5Form.sampleCollected || false);

    try {
      const res = await fetch(`${API_BASE}/api/collector/update-stage`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
        body: formData,
      });

      if (!res.ok) {
        handleApiError(res);
        throw new Error("Submission failed");
      }


      // ✅ Refresh batch state
      const batchRes = await fetch(`${API_BASE}/api/collector/active-batch`, {
        headers: getAuthHeaders()
      });
      const batchData = await batchRes.json();
      setActiveBatch(batchData);
      setCurrentStage(batchData.current_stage);

      setToast("✅ Stage 5 completed!");
      setIsLeafVerified(false);
      setVerifiedPhotoHash(null);

    } catch (err) {
      console.error(err);
      setToast("❌ Failed to submit final stage");
    }
  };


  const [stage1Form, setStage1Form] = useState({
    farmerName: "",
    fid: "",
    visitDate: "",
    geotag: "",
    exactAddress: "",
    notes: "",
    species: "",
    estimatedQty: "",
    farmPhoto: null,
    irrigationType: "",
    soilType: ""
  });

  const [stage2Form, setStage2Form] = useState({
    growthPhotos: [],
    observations: "",
    farmerUpdates: "",
    growthStage: "Early Growth"
  });

  const [stage3Form, setStage3Form] = useState({
    assessmentPhotos: [],
    healthStatus: "Good",
    pestIssues: "",
    irrigationIssues: "",
    recommendations: ""
  });

  const [stage4Form, setStage4Form] = useState({
    preHarvestPhotos: [],
    harvestReadiness: "85%",
    expectedHarvestDate: "",
    qualityCheck: "Pass",
    issues: ""
  });

  const [stage5Form, setStage5Form] = useState({
    batchId: "",
    finalHarvestDate: "",
    finalQuantity: "",
    sampleCollected: false,
    finalPhoto: null,
    finalGeotag: "",
    dispatchAuth: false
  });


  // ✅ BACKEND-DRIVEN STATE
  const [activeBatch, setActiveBatch] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // ✅ CRITICAL: Separate farmer submission from collector approval
  const [farmerSubmitted, setFarmerSubmitted] = useState({
    2: false,
    3: false,
    4: false
  });

  const [currentStage, setCurrentStage] = useState(1);
  const [toast, setToast] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]); // ✅ FIX #7: Fetch from backend
  const [showProfile, setShowProfile] = useState(false);
  // ✅ FIX #2: Renamed to activeNotificationTab (used in UI)
  const [activeNotificationTab, setActiveNotificationTab] = useState("admin");
  const [showCreateBatchDialog, setShowCreateBatchDialog] = useState(false);
  const isBatchLocked =
  activeBatch?.current_stage === 5 &&
  activeBatch?.completed_stages?.includes(5);

  // 1️⃣ ML VERIFICATION STATES (Stage-5)
  const [isLeafVerified, setIsLeafVerified] = useState(false);
  const [mlResult, setMlResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifiedPhotoHash, setVerifiedPhotoHash] = useState(null);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const stage1PhotoURLRef = useRef(null);
  const stage5PhotoURLRef = useRef(null);


  // \u2705 BACKEND-DRIVEN: Load user & batch state on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);

        // 1. Validate user from backend (not localStorage)
        const userRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: getAuthHeaders()
        });
        handleApiError(userRes);
        const userData = await userRes.json();

        if (userData.role !== "Collector") {
          window.location.href = "/";
          return;
        }

        setUser(userData);

        // 2. Load active batch
        const batchRes = await fetch(`${API_BASE}/api/collector/active-batch`, {
          headers: getAuthHeaders()
        });
        handleApiError(batchRes);
        const batchData = await batchRes.json();

        if (batchData) {
          setActiveBatch(batchData);
          setCurrentStage(batchData.current_stage);
          [2, 3, 4].forEach(stage => {
            fetchStageData(stage);
          });
          // Populate Stage 5 form with batch ID
          setStage5Form(prev => ({
            ...prev,
            batchId: batchData.batch_id
          }));
          // ✅ CRITICAL: Do NOT initialize farmerSubmitted from completed_stages
          // farmerSubmitted is set by fetchStageData() only
          // completed_stages is used by getStageStatus() for UI display
        }

      } catch (err) {
        console.error("Initialization failed:", err);
        setToast("❌ Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);
  useEffect(() => {
    if (stage1Form.farmPhoto) {
      stage1PhotoURLRef.current = URL.createObjectURL(stage1Form.farmPhoto);
    }
    return () => {
      if (stage1PhotoURLRef.current) {
        URL.revokeObjectURL(stage1PhotoURLRef.current);
        stage1PhotoURLRef.current = null;
      }
    };
  }, [stage1Form.farmPhoto]);

  useEffect(() => {
    if (stage5Form.finalPhoto) {
      stage5PhotoURLRef.current = URL.createObjectURL(stage5Form.finalPhoto);
    }
    return () => {
      if (stage5PhotoURLRef.current) {
        URL.revokeObjectURL(stage5PhotoURLRef.current);
        stage5PhotoURLRef.current = null;
      }
    };
  }, [stage5Form.finalPhoto]);


  // \u2705 FIX #7 & #9: Fetch real notifications from backend with polling
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        handleApiError(res);
        return;
      }
      const data = await res.json();
      // \u2705 Normalize notification schema
      const normalized = data.map(n => ({
        ...n,
        category: n.category || n.role || "system"
      }));
      setNotifications(normalized);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // \u2705 FIX #9: Poll notifications every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ✅ CRITICAL: Derive stage status from backend state
  const getStageStatus = (stageId) => {
    if (!activeBatch) return "waiting";
    const completedStages = activeBatch.completed_stages ?? [];
    if (completedStages.includes(stageId)) return "done";
    if (stageId === activeBatch.current_stage) return "current";
    if (stageId < activeBatch.current_stage) return "done";
    return "waiting";
  };

  // ===== FORM UPDATE HELPERS =====
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStage1Form(s => ({ ...s, visitDate: today }));
    setStage4Form(s => ({ ...s, expectedHarvestDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] }));
    setStage5Form(s => ({ ...s, finalHarvestDate: today }));
  }, []);

  const updateStage1Form = (key, value) => {
    setStage1Form(prev => ({ ...prev, [key]: value }));
  };

  const updateStage2Form = (key, value) => {
    setStage2Form(prev => ({ ...prev, [key]: value }));
  };

  const updateStage3Form = (key, value) => {
    setStage3Form(prev => ({ ...prev, [key]: value }));
  };

  const updateStage4Form = (key, value) => {
    setStage4Form(prev => ({ ...prev, [key]: value }));
  };

  const updateStage5Form = (key, value) => {
    setStage5Form(prev => ({ ...prev, [key]: value }));
  };

  const handleStage1GPS = () => {
    if (!navigator.geolocation) {
      setToast("❌ GPS not supported on this device");
      return;
    }

    setToast("📍 Capturing precise farm location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Step 1: Save lat-long
        const coords = `${latitude.toFixed(8)}, ${longitude.toFixed(8)}`;
        updateStage1Form("geotag", coords);

        // Step 2: Reverse Geocode via backend (avoid rate limits)
        try {
          const res = await fetch(`${API_BASE}/api/utils/reverse-geocode`, {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ lat: latitude, lon: longitude })
          });

          if (!res.ok) {
            handleApiError(res);
            return;
          }

          const data = await res.json();

          if (data && data.display_name) {
            updateStage1Form("exactAddress", data.display_name);
            setToast("✅ Exact address captured!");
          } else {
            setToast("⚠️ No address found for this location");
          }
        } catch (err) {
          console.error("Reverse geocode failed:", err);
          setToast("⚠️ Could not fetch address");
        }

        setTimeout(() => setToast(""), 3000);
      },

      (error) => {
        console.error(error);
        setToast("❌ Unable to fetch GPS. Allow location access.");
        setTimeout(() => setToast(""), 3000);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleStage5GPS = () => {
    if (!navigator.geolocation) {
      setToast("❌ GPS not supported on this device");
      return;
    }

    setToast("📍 Capturing precise farm location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Step 1: Save lat-long
        const coords = `${latitude.toFixed(8)}, ${longitude.toFixed(8)}`;
        updateStage5Form("finalGeotag", coords);

        // Step 2: Reverse Geocode via backend
        try {
          const res = await fetch(`${API_BASE}/api/utils/reverse-geocode`, {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ lat: latitude, lon: longitude })
          });

          if (!res.ok) {
            handleApiError(res);
            return;
          }

          const data = await res.json();

          if (data && data.display_name) {
            setToast("\u2705 Final GPS location captured!");
          } else {
            setToast("\u26a0\ufe0f GPS location captured, but no address found");
          }

        } catch (err) {
          console.error("Reverse geocode failed:", err);
          setToast("\u2705 GPS location captured!");
        }

        setTimeout(() => setToast(""), 3000);
      },

      (error) => {
        console.error(error);
        setToast("❌ Unable to fetch GPS. Allow location access.");
        setTimeout(() => setToast(""), 3000);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handlePhotoUpload = (stage, file) => {
    if (stage === 1) {
      updateStage1Form("farmPhoto", file);
      setToast("✅ Farm photo uploaded successfully!");
    } else if (stage === 5) {
      updateStage5Form("finalPhoto", file);
      // ✅ CRITICAL: Reset ML verification when photo changes
      setIsLeafVerified(false);
      setMlResult(null);
      setVerifiedPhotoHash(null);
      setToast("✅ Final harvest photo uploaded!");
    } else if (stage === 2) {
      const newPhotos = [...stage2Form.growthPhotos, file];
      updateStage2Form("growthPhotos", newPhotos);
      setToast("✅ Growth photo uploaded!");
    } else if (stage === 3) {
      const newPhotos = [...stage3Form.assessmentPhotos, file];
      updateStage3Form("assessmentPhotos", newPhotos);
      setToast("✅ Assessment photo uploaded!");
    } else if (stage === 4) {
      const newPhotos = [...stage4Form.preHarvestPhotos, file];
      updateStage4Form("preHarvestPhotos", newPhotos);
      setToast("✅ Pre-harvest photo uploaded!");
    }
    setTimeout(() => setToast(""), 3000);
  };

  // \u2705 BACKEND-DRIVEN: Lock stage navigation
  const handleStageClick = (stageId) => {
    if (!activeBatch) {
      setToast("❌ No active batch");
      return;
    }
    if (activeBatch?.current_stage > 5) {
      setToast("❌ Batch is locked");
      return;
    }


    // Only allow navigation to completed or current stages
    if (stageId > activeBatch.current_stage) {
      setToast("❌ Complete previous stages first");
      return;
    }

    if (
      stageId >= 2 &&
      stageId <= 4 &&
      stageId === activeBatch.current_stage &&
      !farmerSubmitted[stageId]
    ) {
      setToast("❌ Farmer has not submitted this stage yet");
      return;
    }



    setCurrentStage(stageId);
    setToast(`Stage ${stageId}`);
    setTimeout(() => setToast(""), 3000);

    // ✅ CRITICAL: Only load data if stage is submitted
    if (
      stageId >= 2 &&
      stageId <= 4 &&
      farmerSubmitted[stageId] &&
      stageId === activeBatch.current_stage
    ) {
      fetchStageData(stageId);
    }

  };

  // \u2705 BACKEND-DRIVEN: Fetch farmer submissions
  const fetchStageData = async (stage) => {
    if (!activeBatch?.batch_id) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/collector/batch/${activeBatch.batch_id}/stage/${stage}`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) {
        handleApiError(res);
        return;
      }

      const data = await res.json();

      // ✅ CRITICAL: Set submission status from backend
      setFarmerSubmitted(prev => ({
        ...prev,
        [stage]: Boolean(data?.submitted)
      }));


      // Populate form with farmer data
      if (stage === 2) {
        setStage2Form(prev => ({
          ...prev,
          growthPhotos: data.photos || prev.growthPhotos,
        }));
      } else if (stage === 3) {
        setStage3Form(prev => ({
          ...prev,
          assessmentPhotos: data.photos || [],
          recommendations: data.notes || ""
        }));
      } else if (stage === 4) {
        setStage4Form(prev => ({
          ...prev,
          preHarvestPhotos: data.photos || [],
          issues: data.notes || ""
        }));
      }
    } catch (err) {
      console.error("Failed to load stage data:", err);
    }
  };

  // \u274c DELETED: markStageDone - frontend stage tracking removed

  // \u2705 BACKEND-DRIVEN: Approve stage with validation
  const approveStage = async (stage) => {
    // Validate stage order
    if (!activeBatch) {
      setToast("\u274c No active batch");
      return;
    }

    if (stage !== activeBatch.current_stage) {
      setToast("❌ Cannot approve out-of-order stage");
      return;
    }

    if (!farmerSubmitted[stage]) {
      setToast("❌ Farmer has not submitted this stage");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("batch_id", activeBatch.batch_id);
      formData.append("stage", stage);
      formData.append("notes", `Stage ${stage} approved by collector`);

      const res = await fetch(`${API_BASE}/api/collector/update-stage`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData
      });

      if (!res.ok) {
        handleApiError(res);
        throw new Error("Approval failed");
      }

      // \u2705 Refresh batch state from backend
      const batchRes = await fetch(`${API_BASE}/api/collector/active-batch`, {
        headers: getAuthHeaders()
      });
      const batchData = await batchRes.json();
      setActiveBatch(batchData);
      setCurrentStage(batchData.current_stage);
      [2, 3, 4].forEach(stage => {
        fetchStageData(stage);
      });
      setToast(`\u2705 Stage ${stage} approved`);
    } catch (err) {
      console.error(err);
      setToast(`\u274c Failed to approve Stage ${stage}`);
    }
  };

  const handleCreateBatchClick = async () => {
    if (
      !stage1Form.farmerName ||
      !stage1Form.fid ||
      !stage1Form.species ||
      !stage1Form.visitDate ||
      !stage1Form.geotag ||
      !stage1Form.estimatedQty
    ) {
      setToast("❌ Fill all required fields");
      return;
    }

    try {
      // ✅ FIX #1: Use collector-specific endpoint
      const res = await fetch(`${API_BASE}/api/collector/create-batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          species: stage1Form.species,
          farmId: stage1Form.fid,
          startDate: stage1Form.visitDate,
          coords: stage1Form.geotag,
        }),
      });

      if (!res.ok) throw new Error("Batch creation failed");

      const data = await res.json();
      setActiveBatch(data);
      setCurrentStage(data.current_stage || 1);
      setStage5Form(prev => ({ ...prev, batchId: data.batch_id }));
      // 🔧 RESET ML STATE
      setIsLeafVerified(false);
      setMlResult(null);
      setVerifiedPhotoHash(null);
      setShowCreateBatchDialog(true);

    } catch (err) {
      console.error(err);
      setToast("❌ Failed to create batch");
    }
  };
  const uploadStage1Photo = async () => {
    if (!activeBatch?.batch_id) {
      setToast("❌ No active batch");
      return;
    }
    if (!stage1Form.farmPhoto) return;

    try {
      const formData = new FormData();
      formData.append("batch_id", activeBatch?.batch_id || "");
      formData.append("stage", 1);
      formData.append("notes", stage1Form.notes || "Initial plantation");
      formData.append("photo", stage1Form.farmPhoto);

      // ✅ FIX #1: Use collector-specific endpoint
      const res = await fetch(`${API_BASE}/api/collector/update-stage`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
        body: formData,
      });

      if (!res.ok) throw new Error("Stage-1 upload failed");
    } catch (err) {
      console.error(err);
      setToast("❌ Failed to upload stage-1 photo");
    }
  };


  const confirmCreateBatch = async () => {
    // Close dialog
    setShowCreateBatchDialog(false);

    // Upload Stage 1 photo
    await uploadStage1Photo();

    // ✅ Refresh batch state from backend (don't manually advance)
    try {
      const batchRes = await fetch(`${API_BASE}/api/collector/active-batch`, {
        headers: getAuthHeaders()
      });
      handleApiError(batchRes);
      const batchData = await batchRes.json();
      if (batchData) {
        setActiveBatch(batchData);
        setCurrentStage(batchData.current_stage);
      }
      setToast(`✅ Batch created successfully`);
    } catch (err) {
      console.error("Failed to refresh batch:", err);
    }
    setTimeout(() => setToast(""), 4000);
  };

  // ✅ FIX #1: Removed auto-read on dropdown open (Option A)
  const toggleNotificationDropdown = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };


  const handleMarkNotificationRead = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );
      if (!res.ok) {
        handleApiError(res);
        return;
      }


      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark notification read", err);
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

  const getStatusText = (status) => {
    switch (status) {
      case "done": return "COMPLETED";
      case "current": return "IN PROGRESS";
      default: return "PENDING";
    }
  };
  const unreadCount = notifications.filter(n => !n.read).length;



  const renderTimelineItem = (stage) => {
    const status = getStageStatus(stage.id);

    return (
      <div
        key={stage.id}
        className={`${styles["vhc-timeline-item"]} ${status === "current" ? styles["vhc-timeline-item-current"] : ""}`}
        onClick={() => handleStageClick(stage.id)}
      >
        <div className={`${styles["vhc-timeline-dot"]} ${styles[status]}`}>
          {status === "done" ? "✓" : stage.id}
        </div>
        <div className={styles["vhc-timeline-content"]}>
          <div className={styles["vhc-timeline-stage"]}>
            <span className={styles["vhc-timeline-stage-icon"]}></span>
            {stage.title}
          </div>
          <div className={styles["vhc-timeline-desc"]}>
            {stage.description}
          </div>
          <div className={`${styles["vhc-timeline-status"]} ${styles[status]}`}>
            {getStatusText(status)}
          </div>
        </div>
        {status === "current" && stage.id !== 5 && farmerSubmitted[stage.id] && (
          <button
            className={styles["vhc-mark-done-btn"]}
            onClick={(e) => {
              e.stopPropagation();
              approveStage(stage.id);
            }}
          >
            Mark Complete
          </button>)
        }

      </div>
    );
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 1:
        return (
          <div className={styles["vhc-stage-content"]}>
            <h3 className={styles["vhc-stage-title"]}>Stage 1: Plantation Documentation</h3>
            <p className={styles["vhc-stage-subtitle"]}>Collect initial farm data and documentation</p>

            <div className={styles["vhc-form-grid"]}>
              <div className={styles["vhc-field"]}>
                <label className={styles["vhc-label"]}>
                  Farmer Name <span className={styles["vhc-required"]}>*</span>
                </label>
                <input
                  className={styles["vhc-input"]}
                  type="text"
                  value={stage1Form.farmerName}
                  onChange={(e) => updateStage1Form("farmerName", e.target.value)}
                  placeholder="Enter farmer's full name"
                />
              </div>

              <div className={styles["vhc-field"]}>
                <label className={styles["vhc-label"]}>
                  Farmer ID (FID) <span className={styles["vhc-required"]}>*</span>
                </label>
                <input
                  className={styles["vhc-input"]}
                  type="text"
                  value={stage1Form.fid}
                  onChange={(e) => updateStage1Form("fid", e.target.value)}
                  placeholder="Enter FID"
                />
              </div>

              <div className={styles["vhc-field"]}>
                <label className={styles["vhc-label"]}>
                  Visit Date <span className={styles["vhc-required"]}>*</span>
                </label>
                <input
                  className={styles["vhc-input"]}
                  type="date"
                  value={stage1Form.visitDate}
                  onChange={(e) => updateStage1Form("visitDate", e.target.value)}
                />
              </div>

              <div className={styles["vhc-field"]}>
                <label className={styles["vhc-label"]}>
                  Herb Species <span className={styles["vhc-required"]}>*</span>
                </label>
                <select
                  className={styles["vhc-select"]}
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

              <div className={styles["vhc-field"]}>
                <label className={styles["vhc-label"]}>
                  Estimated Quantity (kg) <span className={styles["vhc-required"]}>*</span>
                </label>
                <input
                  className={styles["vhc-input"]}
                  type="number"
                  value={stage1Form.estimatedQty}
                  min="0"
                  step="0.1"
                  placeholder="e.g., 25.5"
                  onChange={(e) => updateStage1Form("estimatedQty", e.target.value)}
                />
              </div>

              <div className={styles["vhc-field"]}>
                <label className={styles["vhc-label"]}>Irrigation Type</label>
                <select
                  className={styles["vhc-select"]}
                  value={stage1Form.irrigationType}
                  onChange={(e) => updateStage1Form("irrigationType", e.target.value)}
                >
                  <option value="">Select irrigation type</option>
                  <option value="Drip">Drip Irrigation</option>
                  <option value="Sprinkler">Sprinkler</option>
                  <option value="Flood">Flood</option>
                  <option value="Rainfed">Rainfed</option>
                </select>
              </div>

              <div className={styles["vhc-field"]}>
                <label className={styles["vhc-label"]}>Soil Type</label>
                <select
                  className={styles["vhc-select"]}
                  value={stage1Form.soilType}
                  onChange={(e) => updateStage1Form("soilType", e.target.value)}
                >
                  <option value="">Select soil type</option>
                  <option value="Loamy">Loamy</option>
                  <option value="Clay">Clay</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Silty">Silty</option>
                </select>
              </div>

              <div className={`${styles["vhc-field"]} ${styles["vhc-field-full"]}`}>
                <label className={styles["vhc-label"]}>
                  GPS Location <span className={styles["vhc-required"]}>*</span>
                </label>
                <div className={styles["vhc-gps-row"]}>
                  <input
                    className={`${styles["vhc-input"]} ${styles["vhc-gps-input"]}`}
                    value={stage1Form.geotag}
                    readOnly
                    placeholder="Click Capture GPS to get location"
                  />
                  <button
                    type="button"
                    className={`${styles["vhc-btn"]} ${styles["vhc-btn-secondary"]}`}
                    onClick={handleStage1GPS}
                    disabled={isBatchLocked}
                  >
                    <MapPin size={16} /> Capture GPS
                  </button>
                </div>
              </div>

              <div className={`${styles["vhc-field"]} ${styles["vhc-field-full"]}`}>
                <label className={styles["vhc-label"]}>Exact Address</label>
                <textarea
                  className={styles["vhc-textarea"]}
                  value={stage1Form.exactAddress}
                  readOnly
                  placeholder="Will be auto-filled after GPS capture"
                  rows="2"
                />
              </div>

              <div className={`${styles["vhc-field"]} ${styles["vhc-field-full"]}`}>
                <label className={styles["vhc-label"]}>Farm Photo</label>
                <div className={styles["vhc-photo-upload"]}>
                  {stage1Form.farmPhoto ? (
                    <div className={styles["vhc-photo-preview"]}>
                      <img src={stage1PhotoURLRef.current} />
                      <button
                        className={styles["vhc-remove-photo"]}
                        onClick={() => updateStage1Form("farmPhoto", null)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className={styles["vhc-upload-area"]}>
                      <Camera size={24} />
                      <span>Click to upload farm photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handlePhotoUpload(1, e.target.files[0]);
                          }
                        }}

                        hidden
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className={`${styles["vhc-field"]} ${styles["vhc-field-full"]}`}>
                <label className={styles["vhc-label"]}>Notes & Observations</label>
                <textarea
                  className={styles["vhc-textarea"]}
                  value={stage1Form.notes}
                  onChange={(e) => updateStage1Form("notes", e.target.value)}
                  placeholder="Record your observations about soil health, plant condition, pests, etc."
                  rows="4"
                />
              </div>
            </div>

            <div className={styles["vhc-create-batch-section"]}>
              <button
                className={styles["vhc-create-batch-btn"]}
                onClick={handleCreateBatchClick}
                disabled={isBatchLocked || !stage1Form.farmerName || !stage1Form.fid || !stage1Form.species || !stage1Form.visitDate || !stage1Form.geotag || !stage1Form.estimatedQty}
              >
                <CheckCircle size={20} /> Create New Herb Batch
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles["vhc-stage-content"]}>
            <h3 className={styles["vhc-stage-title"]}>
              Stage 2: Growth Monitoring
            </h3>

            {/* STATUS BOX */}
            <div className={styles["vhc-waiting-box"]}>
              {!farmerSubmitted[2] ? (
                <>
                  <Camera size={28} />
                  <p>Waiting for farmer to upload growth data</p>
                  <span>No submission received yet</span>
                </>
              ) : (
                <>
                  <CheckCircle size={28} />
                  <p>Farmer has submitted growth data</p>
                  <span>Data is locked and cannot be viewed</span>
                </>
              )}
            </div>

            {/* ACTION */}
            <div className={styles["vhc-create-batch-section"]}>
              <button
                className={styles["vhc-create-batch-btn"]}
                disabled={isBatchLocked || !stage5Form.batchId || !farmerSubmitted[2]}
                onClick={() => approveStage(2)}
              >
                <CheckCircle size={20} />
                Approve Growth Monitoring
              </button>

              {!farmerSubmitted[2] && (
                <p className={styles["vhc-verification-note"]}>
                  Approval enabled only after farmer submission
                </p>
              )}
            </div>
          </div>
        );


      case 3:
        return (
          <div className={styles["vhc-stage-content"]}>
            <h3 className={styles["vhc-stage-title"]}>
              Stage 3: Health Assessment
            </h3>

            {/* STATUS BOX */}
            <div className={styles["vhc-waiting-box"]}>
              {!farmerSubmitted[3] ? (
                <>
                  <Camera size={28} />
                  <p>Waiting for farmer to upload health assessment data</p>
                  <span>No submission received yet</span>
                </>
              ) : (
                <>
                  <CheckCircle size={28} />
                  <p>Farmer has submitted health assessment data</p>
                  <span>Data is locked and cannot be viewed</span>
                </>
              )}
            </div>

            {/* ACTION */}
            <div className={styles["vhc-create-batch-section"]}>
              <button
                className={styles["vhc-create-batch-btn"]}
                disabled={isBatchLocked || !stage5Form.batchId || !farmerSubmitted[3]}
                onClick={() => approveStage(3)}
              >
                <CheckCircle size={20} />
                Approve Health Assessment
              </button>

              {!farmerSubmitted[3] && (
                <p className={styles["vhc-verification-note"]}>
                  Approval enabled only after farmer submission
                </p>
              )}
            </div>
          </div>
        );


      case 4:
        return (
          <div className={styles["vhc-stage-content"]}>
            <h3 className={styles["vhc-stage-title"]}>
              Stage 4: Pre-Harvest Assessment
            </h3>

            {/* STATUS BOX */}
            <div className={styles["vhc-waiting-box"]}>
              {!farmerSubmitted[4] ? (
                <>
                  <Camera size={28} />
                  <p>Waiting for farmer to upload pre-harvest assessment data</p>
                  <span>No submission received yet</span>
                </>
              ) : (
                <>
                  <CheckCircle size={28} />
                  <p>Farmer has submitted pre-harvest assessment data</p>
                  <span>Data is locked and cannot be viewed</span>
                </>
              )}
            </div>

            {/* ACTION */}
            <div className={styles["vhc-create-batch-section"]}>
              <button
                className={styles["vhc-create-batch-btn"]}
                disabled={isBatchLocked || !stage5Form.batchId || !farmerSubmitted[4]}
                onClick={() => approveStage(4)}
              >
                <CheckCircle size={20} />
                Approve Pre-Harvest Check
              </button>

              {!farmerSubmitted[4] && (
                <p className={styles["vhc-verification-note"]}>
                  Approval enabled only after farmer submission
                </p>
              )}
            </div>
          </div>
        );


      case 5:
        return (
          <div className={styles["vhc-stage-content"]}>
            <h3 className={styles["vhc-stage-title"]}>Stage 5: Final Verification</h3>
            <p className={styles["vhc-stage-subtitle"]}>Complete final documentation before dispatch</p>

            <div className={styles["vhc-form-grid"]}>
              <div className={styles["vhc-field"]}>
                <label className={styles["vhc-label"]}>Batch ID</label>
                <input
                  className={styles["vhc-input"]}
                  type="text"
                  value={stage5Form.batchId}
                  readOnly
                />
              </div>

              <div className={styles["vhc-field"]}>
                <label className={styles["vhc-label"]}>
                  Final Harvest Date <span className={styles["vhc-required"]}>*</span>
                </label>
                <input
                  className={styles["vhc-input"]}
                  type="date"
                  value={stage5Form.finalHarvestDate}
                  onChange={(e) => updateStage5Form("finalHarvestDate", e.target.value)}
                  disabled={isBatchLocked}
                />
              </div>

              <div className={styles["vhc-field"]}>
                <label className={styles["vhc-label"]}>
                  Final Quantity (kg) <span className={styles["vhc-required"]}>*</span>
                </label>
                <input
                  className={styles["vhc-input"]}
                  type="number"
                  value={stage5Form.finalQuantity}
                  min="0"
                  step="0.1"
                  placeholder="Enter actual harvested quantity"
                  onChange={(e) => updateStage5Form("finalQuantity", e.target.value)}
                  disabled={isBatchLocked}
                />
              </div>

              <div className={styles["vhc-field"]}>
                <label className={styles["vhc-label"]}>Sample Collected</label>
                <div className={styles["vhc-checkbox-group"]}>
                  <label className={styles["vhc-checkbox-label"]}>
                    <input
                      type="checkbox"
                      checked={stage5Form.sampleCollected}
                      onChange={(e) => updateStage5Form("sampleCollected", e.target.checked)}
                      disabled={isBatchLocked}
                      className={styles["vhc-checkbox"]}
                    />
                    <span>Lab sample collected</span>
                  </label>
                </div>
              </div>

              <div className={`${styles["vhc-field"]} ${styles["vhc-field-full"]}`}>
                <label className={styles["vhc-label"]}>
                  Final GPS Location <span className={styles["vhc-required"]}>*</span>
                </label>
                <div className={styles["vhc-gps-row"]}>
                  <input
                    className={`${styles["vhc-input"]} ${styles["vhc-gps-input"]}`}
                    value={stage5Form.finalGeotag}
                    readOnly
                    placeholder="Click Capture GPS to get location"
                  />
                  <button
                    type="button"
                    className={`${styles["vhc-btn"]} ${styles["vhc-btn-secondary"]}`}
                    onClick={handleStage5GPS}
                    disabled={isBatchLocked}
                  >
                    <MapPin size={16} /> Capture GPS
                  </button>
                </div>
              </div>

              <div className={`${styles["vhc-field"]} ${styles["vhc-field-full"]}`}>
                <label className={styles["vhc-label"]}>Final Harvest Photo</label>
                <div className={styles["vhc-photo-upload"]}>
                  {stage5Form.finalPhoto ? (
                    <div className={styles["vhc-photo-preview"]}>
                      <img src={stage5PhotoURLRef.current} />

                      <button
                        className={styles["vhc-remove-photo"]}
                        onClick={() => updateStage5Form("finalPhoto", null)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className={styles["vhc-upload-area"]}>
                      <Camera size={24} />
                      <span>Click to upload final harvest photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handlePhotoUpload(5, e.target.files[0]);
                          }
                        }}

                        hidden
                      />
                    </label>
                  )}
                </div>
                <div className={styles["verify"]}>
                  {/* 3️⃣ UPDATED VERIFY BUTTON */}
                  <button
                    onClick={verifyLeafWithML}
                    disabled={verifying || isLeafVerified || isBatchLocked}
                  >

                    {verifying ? "Verifying..." : "Verify Herb"}
                  </button>

                  {/* 4️⃣ VISUAL CONFIRMATION */}
                  {mlResult && (
                    <div style={{ marginTop: "10px", fontSize: "14px" }}>
                      <strong>ML Result:</strong><br />
                      Predicted: {mlResult.predicted_species}<br />
                      Expected: {mlResult.expected_species}<br />
                      Status: {mlResult.match ? "✅ Match" : "❌ Mismatch"}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles["vhc-field"]}>
                <label className={styles["vhc-label"]}>Dispatch Authorization</label>
                <div className={styles["vhc-checkbox-group"]}>
                  <label className={styles["vhc-checkbox-label"]}>
                    <input
                      type="checkbox"
                      checked={stage5Form.dispatchAuth}
                      onChange={(e) => updateStage5Form("dispatchAuth", e.target.checked)}
                      disabled={isBatchLocked}
                      className={styles["vhc-checkbox"]}
                    />
                    <span>Authorize dispatch</span>
                  </label>
                </div>
              </div>
            </div>

            <div className={styles["vhc-final-verification"]}>
              <button
                className={styles["vhc-create-batch-btn"]}
                onClick={submitStage5}
                disabled={
                  isBatchLocked ||
                  !stage5Form.finalHarvestDate ||
                  !stage5Form.finalQuantity ||
                  !stage5Form.finalGeotag ||
                  !stage5Form.finalPhoto ||
                  !isLeafVerified
                }
              >
                <CheckCircle size={20} /> Complete Final Verification
              </button>
              <p className={styles["vhc-verification-note"]}>
                Note: Once verified, batch will be locked and sent for processing
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className={styles["vhc-stage-content"]}>
            <h3 className={styles["vhc-stage-title"]}>Stage {currentStage}: {STAGE_DATA[currentStage - 1]?.title}</h3>
            <p className={styles["vhc-stage-subtitle"]}>{STAGE_DATA[currentStage - 1]?.description}</p>
            <div className={styles["vhc-stage-placeholder"]}>
              <p>Stage {currentStage} content will appear here. Click "Mark Complete" when done.</p>
            </div>
          </div>
        );
    }
  };

  // \u2705 Loading UI while fetching user & batch data
  if (loading) {
    return (
      <div className={styles["vhc-container"]}>
        <div style={{ padding: "2rem", textAlign: "center", fontSize: "1.2rem" }}>
          <div>\ud83d\udd04 Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}

      {/* Create Batch Dialog */}
      {showCreateBatchDialog && (
        <div className={styles["vhc-dialog-overlay"]}>
          <div className={styles["vhc-dialog-container"]}>
            <div className={styles["vhc-dialog-header"]}>
              <h3 className={styles["vhc-dialog-title"]}>Batch Creation Confirmation</h3>
              <button
                className={styles["vhc-dialog-close"]}
                onClick={() => setShowCreateBatchDialog(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles["vhc-dialog-content"]}>
              <div className={styles["vhc-dialog-icon"]}>
                📋
              </div>
              <h4 className={styles["vhc-dialog-message"]}>
                Batch Assigned Successfully!
              </h4>
              <p className={styles["vhc-dialog-description"]}>
                Your batch has been registered with the following ID:
              </p>

              <div className={styles["vhc-batch-id-display"]}>
                <div className={styles["vhc-batch-id-label"]}>Batch ID</div>
                <div className={styles["vhc-batch-id-value"]}>{activeBatch?.batch_id || "Loading..."}</div>
                <div className={styles["vhc-batch-id-note"]}>(From Backend System)</div>
              </div>

              <div className={styles["vhc-batch-details"]}>
                <div className={styles["vhc-batch-detail-item"]}>
                  <span className={styles["vhc-detail-label"]}>Farmer Name:</span>
                  <span className={styles["vhc-detail-value"]}>{stage1Form.farmerName || "Not specified"}</span>
                </div>
                <div className={styles["vhc-batch-detail-item"]}>
                  <span className={styles["vhc-detail-label"]}>Herb Species:</span>
                  <span className={styles["vhc-detail-value"]}>{stage1Form.species || "Not selected"}</span>
                </div>
                <div className={styles["vhc-batch-detail-item"]}>
                  <span className={styles["vhc-detail-label"]}>Estimated Quantity:</span>
                  <span className={styles["vhc-detail-value"]}>{stage1Form.estimatedQty ? `${stage1Form.estimatedQty} kg` : "Not estimated"}</span>
                </div>
                <div className={styles["vhc-batch-detail-item"]}>
                  <span className={styles["vhc-detail-label"]}>Location:</span>
                  <span className={styles["vhc-detail-value"]}>
                    {stage1Form.exactAddress ? stage1Form.exactAddress.split(',')[0] + '...' : "Not captured"}
                  </span>
                </div>
              </div>

              <div className={styles["vhc-dialog-note"]}>
                <AlertCircle size={16} />
                <span>This batch will now move to Stage 2. Track progress using the Batch ID.</span>
              </div>
            </div>

            <div className={styles["vhc-dialog-footer"]}>
              <button
                className={`${styles["vhc-dialog-btn"]} ${styles["vhc-dialog-btn-cancel"]}`}
                onClick={() => setShowCreateBatchDialog(false)}
              >
                Edit Details
              </button>
              <button
                className={`${styles["vhc-dialog-btn"]} ${styles["vhc-dialog-btn-confirm"]}`}
                onClick={confirmCreateBatch}
                disabled={
                  isBatchLocked ||
                  !stage1Form.farmPhoto ||
                  !stage1Form.farmerName ||
                  !stage1Form.fid ||
                  !stage1Form.species ||
                  !stage1Form.visitDate ||
                  !stage1Form.geotag ||
                  !stage1Form.estimatedQty
                }
              >
                <CheckCircle size={18} />
                Proceed to Stage 2
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={styles["vhc-navbar"]}>
        <div className={styles["vhc-navbar-left"]}>
          <img
            src="https://res.cloudinary.com/domogztsv/image/upload/v1765220874/WhatsApp_Image_2025-12-09_at_12.36.40_AM_bp8jxt.jpg"
            alt="AyuSethu Logo"
            className={styles["vhc-nav-LogoImage"]}
          />

          <div className={styles["vhc-nav-logo"]}>AyuSethu</div>
        </div>

        <div className={styles["vhc-navbar-right"]}>
          <div className={styles["vhc-notification-container"]} ref={notificationRef}>
            <button
              className={styles["vhc-notification-btn"]}
              onClick={toggleNotificationDropdown}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className={styles["vhc-notification-badge"]}>{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className={styles["vhc-notification-dropdown"]}>
                <div className={styles["vhc-notification-header"]}>
                  <h4>Notifications</h4>
                  <button
                    className={styles["vhc-notification-close"]}
                    onClick={toggleNotificationDropdown}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className={styles["vhc-notification-tabs"]}>
                  <button
                    className={`${styles["vhc-notification-tab"]} ${activeNotificationTab === 'admin' ? styles['active'] : ''}`}
                    onClick={() => setActiveNotificationTab('admin')}
                  >
                    Admin
                  </button>
                  <button
                    className={`${styles["vhc-notification-tab"]} ${activeNotificationTab === 'tester' ? styles['active'] : ''}`}
                    onClick={() => setActiveNotificationTab('tester')}
                  >
                    Tester
                  </button>
                </div>

                <div className={styles["vhc-notification-list"]}>
                  {notifications
                    .filter(n =>
                      activeNotificationTab === "admin"
                        ? ["admin", "system"].includes(n.category)
                        : ["tester"].includes(n.category)
                    )
                    .map(notification => (
                      <div
                        className={`${styles["vhc-notification-item"]} ${!notification.read ? styles['unread'] : ''}`}
                        onClick={() => {
                          if (!notification.read) {
                            handleMarkNotificationRead(notification.id);
                          }
                        }}
                      >

                        <div className={styles["vhc-notification-icon"]}>
                          {getNotificationIcon(notification.category)}
                        </div>
                        <div className={styles["vhc-notification-content"]}>
                          <div className={styles["vhc-notification-title"]}>
                            {notification.title}
                          </div>
                          <div className={styles["vhc-notification-message"]}>
                            {notification.message}
                          </div>
                          <div className={styles["vhc-notification-time"]}>
                            {notification.createdAt
                              ? new Date(notification.createdAt).toLocaleString()
                              : "—"}
                          </div>
                        </div>
                        <button
                          className={styles["vhc-mark-read-btn"]}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkNotificationRead(notification.id);
                          }}
                        >
                          Mark Read
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles["vhc-user-profile-container"]} ref={profileRef}>
            <button
              className={styles["vhc-user-profile-btn"]}
              onClick={toggleProfileDropdown}
            >
              <div className={styles["animated-avatar-profile"]}>
                <img src={"https://img.freepik.com/premium-photo/young-optimistic-woman-doctor-is-holding-clipboard-her-hands-while-standing-sunny-clinic-portrait-friendly-female-physician-with-stethoscope-perfect-medical-service-hospital-me_665183-12973.jpg"} alt="Profile" />
              </div>
            </button>

            {showProfile && (
              <div className={styles["vhc-profile-dropdown"]}>
                <div className={styles["vhc-profile-header"]}>
                  <div className={styles["vhc-profile-details"]}>
                    <h4>{user?.fullName || user?.name || "Collector"}</h4>
                    <p>{user?.role || "Collector"}</p>
                    <div className={styles["vhc-profile-badges"]}>
                      <span className={styles["vhc-profile-badge"]}>ID: {user?.id || "N/A"}</span>
                      <span className={`${styles["vhc-profile-badge"]} ${styles["active"]}`}>Active</span>
                    </div>
                  </div>
                </div>

                <div className={styles["vhc-profile-stats"]}>
                  <div className={styles["vhc-profile-note"]}>
                    Demo Data
                  </div>
                  <div className={styles["vhc-stat-item"]}>
                    <div>
                      <div className={styles["vhc-stat-label"]}>Batches Today</div>
                      <div className={styles["vhc-stat-value"]}>8</div>
                    </div>
                  </div>
                  <div className={styles["vhc-stat-item"]}>
                    <div>
                      <div className={styles["vhc-stat-label"]}>Success Rate</div>
                      <div className={styles["vhc-stat-value"]}>94%</div>
                    </div>
                  </div>
                  <div className={styles["vhc-stat-item"]}>
                    <div>
                      <div className={styles["vhc-stat-label"]}>Active Farmers</div>
                      <div className={styles["vhc-stat-value"]}>28</div>
                    </div>
                  </div>
                  <div className={styles["vhc-stat-item"]}>
                    <div>
                      <div className={styles["vhc-stat-label"]}>Certified Farms</div>
                      <div className={styles["vhc-stat-value"]}>15</div>
                    </div>
                  </div>
                </div>

                <button
                  className={styles["vhc-logout-btn"]}
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className={styles["vhc-main"]}>
        <div className={styles["vhc-grid"]}>
          {/* LEFT PANEL: STAGE CONTENT */}
          <section className={`${styles["vhc-card"]} ${styles["vhc-stage-card"]}`}>
            {renderStageContent()}
          </section>

          {/* RIGHT PANEL: TIMELINE & PREVIEW */}
          <aside className={styles["vhc-card"]}>
            <div className={styles["vhc-timeline-header"]}>
              <h2 className={styles["vhc-timeline-title"]}>Batch Integrity Timeline</h2>
              <p className={styles["vhc-timeline-subtitle"]}>
                Track progress through all stages. Click any stage to manage.
              </p>
            </div>

            <div className={styles["vhc-timeline-container"]}>
              <div className={styles["vhc-timeline-line"]} />
              <div>
                {STAGE_DATA.map((stage) => renderTimelineItem(stage))}
              </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className={styles["vhc-live-preview"]}>
              <h3 className={styles["vhc-live-preview-title"]}>Live Batch Preview</h3>

              <div className={styles["vhc-preview-container"]}>
                {currentStage === 1 ? (
                  <div className={styles["vhc-preview-grid"]}>
                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Farmer Name</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage1Form.farmerName || <span className={styles["vhc-preview-empty"]}>Not entered</span>}
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Farmer ID</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage1Form.fid || <span className={styles["vhc-preview-empty"]}>Not entered</span>}
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Visit Date</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage1Form.visitDate ? new Date(stage1Form.visitDate).toLocaleDateString('en-GB') :
                          <span className={styles["vhc-preview-empty"]}>Not set</span>}
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Species</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage1Form.species || <span className={styles["vhc-preview-empty"]}>Not selected</span>}
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Estimated Qty</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage1Form.estimatedQty ? `${stage1Form.estimatedQty} kg` :
                          <span className={styles["vhc-preview-empty"]}>Not estimated</span>}
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Soil Type</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage1Form.soilType || <span className={styles["vhc-preview-empty"]}>Not specified</span>}
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Irrigation</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage1Form.irrigationType || <span className={styles["vhc-preview-empty"]}>Not specified</span>}
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>GPS Location</div>
                      <div className={`${styles["vhc-preview-value"]} ${styles["vhc-preview-gps"]}`}>
                        {stage1Form.geotag || <span className={styles["vhc-preview-empty"]}>Not captured</span>}
                      </div>
                    </div>

                    <div className={`${styles["vhc-preview-item"]} ${styles["vhc-field-full"]}`}>
                      <div className={styles["vhc-preview-label"]}>Exact Address</div>
                      <div className={`${styles["vhc-preview-value"]} ${styles["vhc-preview-address"]}`}>
                        {stage1Form.exactAddress ?
                          <span className={styles["vhc-address-truncated"]}>{stage1Form.exactAddress.substring(0, 50)}...</span> :
                          <span className={styles["vhc-preview-empty"]}>Not captured</span>
                        }
                      </div>
                    </div>

                    <div className={styles["vhc-preview-notes"]}>
                      <div className={styles["vhc-notes-label"]}>Observations</div>
                      <div className={styles["vhc-notes-content"]}>
                        {stage1Form.notes || <span className={styles["vhc-preview-empty"]}>No observations added</span>}
                      </div>
                    </div>
                  </div>
                ) : currentStage === 2 ? (
                  <div className={styles["vhc-preview-grid"]}>
                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Growth Stage</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage2Form.growthStage || <span className={styles["vhc-preview-empty"]}>Not specified</span>}
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Photos Uploaded</div>
                      <div className={styles["vhc-preview-value"]}>
                        <span className={`${styles["vhc-preview-status-badge"]} ${stage2Form.growthPhotos.length > 0 ? styles['success'] : styles['pending']}`}>
                          {stage2Form.growthPhotos.length} photos
                        </span>
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Farmer Updates</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage2Form.farmerUpdates ?
                          <span className={styles["vhc-address-truncated"]}>{stage2Form.farmerUpdates.substring(0, 50)}...</span> :
                          <span className={styles["vhc-preview-empty"]}>No updates</span>
                        }
                      </div>
                    </div>

                    <div className={`${styles["vhc-preview-item"]} ${styles["vhc-field-full"]}`}>
                      <div className={styles["vhc-preview-label"]}>Observations</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage2Form.observations || <span className={styles["vhc-preview-empty"]}>No observations</span>}
                      </div>
                    </div>
                  </div>
                ) : currentStage === 3 ? (
                  <div className={styles["vhc-preview-grid"]}>
                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Health Status</div>
                      <div className={styles["vhc-preview-value"]}>
                        <span className={`${styles["vhc-preview-status-badge"]} ${stage3Form.healthStatus === 'Excellent' || stage3Form.healthStatus === 'Good' ? styles['success'] : styles['pending']}`}>
                          {stage3Form.healthStatus}
                        </span>
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Assessment Photos</div>
                      <div className={styles["vhc-preview-value"]}>
                        <span className={`${styles["vhc-preview-status-badge"]} ${stage3Form.assessmentPhotos.length > 0 ? styles['success'] : styles['pending']}`}>
                          {stage3Form.assessmentPhotos.length} photos
                        </span>
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Pest Issues</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage3Form.pestIssues ?
                          <span className={styles["vhc-address-truncated"]}>{stage3Form.pestIssues.substring(0, 50)}...</span> :
                          <span className={styles["vhc-preview-empty"]}>None reported</span>
                        }
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Irrigation Issues</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage3Form.irrigationIssues ?
                          <span className={styles["vhc-address-truncated"]}>{stage3Form.irrigationIssues.substring(0, 50)}...</span> :
                          <span className={styles["vhc-preview-empty"]}>None reported</span>
                        }
                      </div>
                    </div>
                  </div>
                ) : currentStage === 4 ? (
                  <div className={styles["vhc-preview-grid"]}>
                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Harvest Readiness</div>
                      <div className={styles["vhc-preview-value"]}>
                        <span className={`${styles["vhc-preview-status-badge"]} ${parseInt(stage4Form.harvestReadiness) > 80 ? styles['success'] : styles['pending']}`}>
                          {stage4Form.harvestReadiness}%
                        </span>
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Expected Harvest</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage4Form.expectedHarvestDate ? new Date(stage4Form.expectedHarvestDate).toLocaleDateString('en-GB') :
                          <span className={styles["vhc-preview-empty"]}>Not set</span>}
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Quality Check</div>
                      <div className={styles["vhc-preview-value"]}>
                        <span className={`${styles["vhc-preview-status-badge"]} ${stage4Form.qualityCheck === 'Pass' ? styles['success'] : styles['pending']}`}>
                          {stage4Form.qualityCheck}
                        </span>
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Pre-Harvest Photos</div>
                      <div className={styles["vhc-preview-value"]}>
                        <span className={`${styles["vhc-preview-status-badge"]} ${stage4Form.preHarvestPhotos.length > 0 ? styles['success'] : styles['pending']}`}>
                          {stage4Form.preHarvestPhotos.length} photos
                        </span>
                      </div>
                    </div>
                  </div>
                ) : currentStage === 5 ? (
                  <div className={styles["vhc-preview-grid"]}>
                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Batch ID</div>
                      <div className={`${styles["vhc-preview-value"]} ${styles["vhc-preview-batchid"]}`}>
                        {stage5Form.batchId}
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Final Harvest Date</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage5Form.finalHarvestDate ? new Date(stage5Form.finalHarvestDate).toLocaleDateString('en-GB') :
                          <span className={styles["vhc-preview-empty"]}>Not set</span>}
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Final Quantity</div>
                      <div className={styles["vhc-preview-value"]}>
                        {stage5Form.finalQuantity ? `${stage5Form.finalQuantity} kg` :
                          <span className={styles["vhc-preview-empty"]}>Not recorded</span>}
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Sample Collected</div>
                      <div className={styles["vhc-preview-value"]}>
                        <span className={`${styles["vhc-preview-status-badge"]} ${stage5Form.sampleCollected ? styles['success'] : styles['pending']}`}>
                          {stage5Form.sampleCollected ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Dispatch Auth</div>
                      <div className={styles["vhc-preview-value"]}>
                        <span className={`${styles["vhc-preview-status-badge"]} ${stage5Form.dispatchAuth ? styles['success'] : styles['pending']}`}>
                          {stage5Form.dispatchAuth ? 'Authorized' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className={styles["vhc-preview-item"]}>
                      <div className={styles["vhc-preview-label"]}>Final GPS</div>
                      <div className={`${styles["vhc-preview-value"]} ${styles["vhc-preview-gps"]}`}>
                        {stage5Form.finalGeotag || <span className={styles["vhc-preview-empty"]}>Not captured</span>}
                      </div>
                    </div>

                    <div className={styles["vhc-preview-photo"]}>
                      <div className={styles["vhc-notes-label"]}>Final Photo</div>
                      <div className={styles["vhc-photo-status"]}>
                        {stage5Form.finalPhoto ? (
                          <span className={styles["vhc-photo-uploaded"]}>✅ Photo uploaded</span>
                        ) : (
                          <span className={styles["vhc-preview-empty"]}>No photo uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles["vhc-preview-status"]}>
                    <div className={styles["vhc-preview-status-icon"]}>
                      {getStageStatus(currentStage) === "done" ? "✅" :
                        getStageStatus(currentStage) === "current" ? "🔄" : "⏳"}
                    </div>
                    <div className={styles["vhc-preview-status-text"]}>
                      <div className={styles["vhc-preview-status-title"]}>
                        Stage {currentStage}: {STAGE_DATA[currentStage - 1]?.title}
                      </div>
                      <div className={styles["vhc-preview-status-subtitle"]}>
                        Status: {getStatusText(getStageStatus(currentStage))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

export default App; 