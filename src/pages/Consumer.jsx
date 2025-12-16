import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "../styles/Consumer.css";

// Icons
import { FaCamera, FaCheckCircle, FaLeaf, FaSeedling, FaCertificate, FaFlask, FaIndustry, FaTimesCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';

// Configuration: MUST be set in your React app's environment (e.g., .env)
const API_BASE_URL = process.env.API_BASE ; 
// Public Block Explorer URL (Placeholder for a real explorer)
const BLOCK_EXPLORER_URL = "https://explorer.polygon.technology/tx/";


function ConsumerVerificationPage() {
    const { productUnitId } = useParams(); 
    
    const [activeHerb, setActiveHerb] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedStage, setExpandedStage] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    // --- Data Fetching Logic (Unchanged from previous version) ---
    useEffect(() => {
        if (!productUnitId) {
            setError("Error: No Product ID provided in the URL.");
            setLoading(false);
            return;
        }

        const fetchVerificationData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/public/scan/${productUnitId}`);
                
                const data = response.data;
                setActiveHerb(data); 
                setError(null);
                
                if (data.processingStages && data.processingStages.length > 0) {
                     setExpandedStage(data.processingStages[0].id);
                }

            } catch (err) {
                console.error("Error fetching verification data:", err);
                const message = err.response?.data?.detail || `Verification failed or Product ID "${productUnitId}" not found/invalid.`;
                setError(message);
                setActiveHerb(null);
            } finally {
                setLoading(false);
            }
        };

        fetchVerificationData();
    }, [productUnitId]);

    // Handlers
    const handleStageClick = (stageId) => {
        setExpandedStage(stageId);
        setSelectedPhoto(null);
    };

    const handlePhotoClick = (photo) => {
        setSelectedPhoto(photo);
    };

    const getStageIcon = (stageName) => {
        if (stageName.includes("Cultivation")) return <FaSeedling />;
        if (stageName.includes("Testing") || stageName.includes("Verification")) return <FaFlask />;
        if (stageName.includes("Manufacturing") || stageName.includes("Packaging")) return <FaIndustry />;
        return <FaCertificate />; 
    };

    // --- NEW: Status Helper Function ---
    const getVerificationStatus = () => {
        if (!activeHerb) return { text: "Data Unavailable", icon: FaTimesCircle, className: 'default-status' };

        switch (activeHerb.status) {
            case 'VERIFIED_ON_PUBLIC_CHAIN':
                return { 
                    text: "Authenticity Verified on Polygon", 
                    icon: FaCheckCircle, 
                    className: 'verified-status' 
                };
            case 'WARNING_PUBLIC_ANCHOR_MISSING':
                return { 
                    text: "WARNING: Public Chain Verification Missing", 
                    icon: FaExclamationTriangle, 
                    className: 'warning-status' 
                };
            case 'packaged':
                return { 
                    text: "Verification Pending Public Anchor", 
                    icon: FaClock, 
                    className: 'pending-status' 
                };
            default:
                return { 
                    text: `Status: ${activeHerb.status}`, 
                    icon: FaClock, 
                    className: 'pending-status' 
                };
        }
    };
    // --- End Status Helper ---

    // --- Conditional Render: Loading and Error States (Unchanged) ---
    if (loading) {
        return (
            <div className="herb-journey-app loading-screen">
                <FaClock className="loading-icon" />
                <h1>Verifying Product Origin...</h1>
                <p>Tracing Product ID: **{productUnitId}**</p>
            </div>
        );
    }

    if (error || !activeHerb) {
        return (
            <div className="herb-journey-app error-screen">
                <FaTimesCircle className="error-icon" />
                <h1>Verification Failed</h1>
                <p>{error}</p>
                <p>The product data could not be retrieved. Please check the ID or QR code.</p>
            </div>
        );
    }
    
    const { text: statusText, icon: StatusIcon, className: statusClass } = getVerificationStatus();

    // --- Main Render ---
    return (
        <div className="herb-journey-app">
            <header className="app-header">
                <div className="header-container">
                    <div className="logo-section">
                        <h1 className="logo-title">VirtuHerbChain</h1>
                        <p className="logo-subtitle">Blockchain-Verified Herbal Supply Chain</p>
                    </div>
                </div>
            </header>

            <main className="app-main">
                {/* Herb Info Banner (Now dynamically styled) */}
                <div className={`herb-banner ${statusClass}`}>
                    <div className="banner-content">
                        <h2>{activeHerb.productName || activeHerb.batchId}</h2>
                        <div className="banner-details">
                            <span className="batch-badge">Product ID: {activeHerb.batchId}</span> 
                            {/* Dynamic Status Badge */}
                            <span className="verification-badge">
                                <StatusIcon /> {statusText}
                            </span>
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                            <p>🌱 **Farmer:** {activeHerb.farmerName}</p>
                            <p>📍 **Region:** {activeHerb.farmLocation}</p>
                        </div>
                    </div>
                </div>

                {/* Timeline Section (Unchanged) */}
                <section className="timeline-section">
                    <h3 className="section-title">
                        <FaLeaf /> Processing Journey Timeline
                    </h3>
                    <p className="section-subtitle">Click on any stage to view photo evidence and details.</p>

                    <div className="timeline-container">
                        {activeHerb.processingStages.map((stage) => (
                           // ... (Stage mapping logic remains the same) ...
                           <div 
                                key={stage.id}
                                className={`timeline-stage ${expandedStage === stage.id ? 'active' : ''}`}
                                onClick={() => handleStageClick(stage.id)}
                            >
                                <div className="stage-header">
                                    <div className="stage-icon">
                                        {getStageIcon(stage.name)}
                                    </div>
                                    <div className="stage-info">
                                        <h4>{stage.name}</h4>
                                        <p className="stage-date">{stage.date}</p>
                                        <p className="stage-location">{stage.location}</p>
                                    </div>
                                    <div className="stage-media-indicator">
                                        {stage.photos && stage.photos.length > 0 && (
                                            <span className="photo-count">
                                                <FaCamera /> {stage.photos.length}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {expandedStage === stage.id && (
                                    <div className="stage-details">
                                        <div className="details-header">
                                            <h5>{stage.description}</h5>
                                        </div>
                                        
                                        {/* Photos Grid */}
                                        {stage.photos && stage.photos.length > 0 && (
                                            <div className="photos-section">
                                                <h6>
                                                    <FaCamera /> Photo Evidence ({stage.photos.length} photos)
                                                </h6>
                                                <div className="photos-grid">
                                                    {stage.photos.map((photo) => (
                                                        <div 
                                                            key={photo.id}
                                                            className={`photo-card ${selectedPhoto?.id === photo.id ? 'selected' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePhotoClick(photo);
                                                            }}
                                                        >
                                                            <div className="photo-thumbnail">
                                                                <div className="thumbnail-placeholder">
                                                                    <FaCamera />
                                                                </div>
                                                            </div>
                                                            <div className="photo-info">
                                                                <strong>{photo.title}</strong>
                                                                <p>{photo.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Selected Photo Display */}
                                        {selectedPhoto && (
                                            <div className="selected-photo-display">
                                                <div className="selected-photo-header">
                                                    <h5>📸 {selectedPhoto.title}</h5>
                                                    <button 
                                                        className="close-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedPhoto(null);
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="photo-preview">
                                                    <div className="image-container">
                                                        <img
                                                            src={selectedPhoto.url.trim()}
                                                            alt={selectedPhoto.title}
                                                            className="selected-photo-image"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://via.placeholder.com/400x400?text=Image+Not+Found";
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="photo-description">
                                                        <p>{selectedPhoto.description}</p>
                                                        <div className="photo-meta">
                                                            <span>📅 {stage.date}</span>
                                                            <span>📍 {stage.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="app-footer">
                <div className="footer-content">
                    <div className="verification-note">
                        <FaCheckCircle className="verify-icon" />
                        {/* Dynamic Footer Text based on status */}
                        <span>
                            {statusText} | All data anchored to Hyperledger Fabric.
                        </span>
                    </div>
                    
                    {/* Display Blockchain TX Hash as a clickable link */}
                    {activeHerb.blockchainTxHash && (
                        <p className="blockchain-tx-hash" style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                            **Proof of Anchor:** <a 
                                href={`${BLOCK_EXPLORER_URL}${activeHerb.blockchainTxHash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: 'var(--primary-green)', marginLeft: '5px', fontWeight: '600' }}
                            >
                                {activeHerb.blockchainTxHash.substring(0, 10)}... (View on Explorer)
                            </a>
                        </p>
                    )}
                    <p className="timestamp">
                        Data Fetched: {new Date().toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default ConsumerVerificationPage;