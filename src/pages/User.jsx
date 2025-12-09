import React, { useState } from "react";
import "../styles/User.css";

// Icons
import { FaCamera, FaMicrophone, FaCheckCircle, FaLeaf, FaSeedling, FaCertificate, FaFlask, FaIndustry } from 'react-icons/fa';

const HERB_JOURNEY = {
  "1": {
    name: "Tulasi Drops",
    batchId: "TUL-AP-2025-01-12-07",
    
    // Focused processing stages with photos and audio
    processingStages: [
      {
        id: 1,
        name: "Seed Selection Certificate",
        date: "2024-09-01",
        location: "Organic Seed Bank, Karnataka",
        description: "Certified organic seeds with purity verification",
        photos: [
          {
            id: 1,
            title: "Seed Certificate",
            url: "https://signetseeds.com/assets/images/our-project/certificate1.jpg    ",
            description: "Official certification document"
          },
        ],
      },
      {
        id: 2,
        name: "Cultivation Process",
        date: "2024-09-15 to 2025-01-10",
        location: "Farm Plot A-12, Andhra Pradesh",
        description: "5-stage cultivation monitoring",
        photos: [
          {
            id: 1,
            title: "Stage 1:",
            url: "https://content.jdmagicbox.com/quickquotes/images_main/tulsi-seeds-383340095-hvzre.jpg?impolicy=queryparam&im=Resize=(360,360),aspect=fit ",
            description: "Initial germination phase"
          },
          {
            id: 2,
            title: "Stage 2:",
            url: "https://www.99acres.com/microsite/articles/files/2021/12/How-to-maintain-a-Tulsi-plant-1.png",
            description: "First month growth"
          },
          {
            id: 3,
            title: "Stage 3:",
            url: "https://practicalselfreliance.com/wp-content/uploads/2018/10/How-to-Grow-Tulsi-Holy-Basil-1-of-2.jpg",
            description: "Leaf development phase"
          },
          {
            id: 4,
            title: "Stage 4:",
            url: "https://cdn.shopify.com/s/files/1/0489/5922/6015/files/121_480x480.jpg?v=1659352848",
            description: "Final growth before harvest"
          },
          {
            id: 5,
            title: "Stage 5:",
            url: "https://www.prabhupada-iskcon.de/tulasi/fotos/Tulasi-Manjari_2.jpg",
            description: "Quality check in field"
          }
        ],
        audio: {
          title: "Farmer's Cultivation Log",
          duration: "3:45",
          description: "Daily cultivation observations"
        }
      },
      {
        id: 3,
        name: "Quality Testing Results",
        date: "2025-01-15",
        location: "Certified Laboratory, Chennai",
        description: "Laboratory analysis and purity tests",
        photos: [
          {
            id: 1,
            title: "Lab Test Report",
            url: "https://examinechina.com/wp-content/uploads/2020/10/test-report-emc-certification-pass.png",
            description: "Official test results document"
          },
        ],
        // audio: {
        //   title: "Lab Technician Notes",
        //   duration: "1:45",
        //   description: "Detailed test procedure explanation"
        // }
      },
      {
        id: 4,
        name: "Manufacturing Process",
        date: "2025-01-20",
        location: "GMP Facility, Hyderabad",
        description: "Production under controlled conditions",
        photos: [
          {
            id: 1,
            title: "Extraction Process",
            url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3AoqKeERZWxkmpYoE4KtN3O3kDBHHtULs2w&s",
            description: "Herb extraction in progress"
          },
        ],
      }
    ]
  }
};

function HerbJourneyTracker() {
  const [activeHerb] = useState(HERB_JOURNEY["1"]);
  const [expandedStage, setExpandedStage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);

  const handleStageClick = (stageId) => {
    setExpandedStage(stageId);
    setSelectedPhoto(null);
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleAudioPlay = (stageId) => {
    setPlayingAudio(stageId);
    // In real app: play audio here
    console.log(`Playing audio for stage ${stageId}`);
  };

  return (
    <div className="herb-journey-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-section">
            <h1 className="logo-title">🌿 HerbTrack</h1>
            <p className="logo-subtitle">Blockchain-Verified Herb Journey</p>
          </div>
          <div className="stats-section">
            <div className="stat">
              <FaCamera className="stat-icon" />
              <span>12 Photos</span>
            </div>
            <div className="stat">
              <FaMicrophone className="stat-icon" />
              <span>4 Audio Logs</span>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Herb Info Banner */}
        <div className="herb-banner">
          <div className="banner-content">
            <h2>{activeHerb.name}</h2>
            <div className="banner-details">
              <span className="batch-badge">Batch: {activeHerb.batchId}</span>
              <span className="verification-badge">
                <FaCheckCircle /> Blockchain Verified
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <section className="timeline-section">
          <h3 className="section-title">
            <FaLeaf /> Processing Journey Timeline
          </h3>
          <p className="section-subtitle">Click on any stage to view photos and audio evidence</p>

          <div className="timeline-container">
            {activeHerb.processingStages.map((stage) => (
              <div 
                key={stage.id}
                className={`timeline-stage ${expandedStage === stage.id ? 'active' : ''}`}
                onClick={() => handleStageClick(stage.id)}
              >
                <div className="stage-header">
                  <div className="stage-icon">
                    {stage.id === 1 && <FaCertificate />}
                    {stage.id === 2 && <FaSeedling />}
                    {stage.id === 3 && <FaFlask />}
                    {stage.id === 4 && <FaIndustry />}
                  </div>
                  <div className="stage-info">
                    <h4>{stage.name}</h4>
                    <p className="stage-date">{stage.date}</p>
                    <p className="stage-location">{stage.location}</p>
                  </div>
                  <div className="stage-media-indicator">
                    <span className="photo-count">
                      <FaCamera /> {stage.photos.length}
                    </span>
                    {stage.audio && (
                      <span className="audio-indicator">
                        <FaMicrophone />
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

                    {/* Audio Section */}
                    {stage.audio && (
                      <div className="audio-section">
                        <h6>
                          <FaMicrophone /> Audio Log
                        </h6>
                        <div className="audio-card">
                          <div className="audio-info">
                            <h4>{stage.audio.title}</h4>
                            <p>{stage.audio.description}</p>
                            <span className="audio-duration">⏱️ {stage.audio.duration}</span>
                          </div>
                          <button 
                            className={`audio-play-btn ${playingAudio === stage.id ? 'playing' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAudioPlay(stage.id);
                            }}
                          >
                            <FaMicrophone />
                            {playingAudio === stage.id ? 'Listening...' : 'Play Audio'}
                          </button>
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

        {/* Media Summary */}
        <section className="media-summary">
          <h3 className="section-title">
            <FaCamera /> Media Evidence Summary
          </h3>
          <div className="summary-grid">
            {activeHerb.processingStages.map((stage) => (
              <div key={stage.id} className="summary-card">
                <div className="summary-header">
                  <div className="summary-icon">
                    {stage.id === 1 && <FaCertificate />}
                    {stage.id === 2 && <FaSeedling />}
                    {stage.id === 3 && <FaFlask />}
                    {stage.id === 4 && <FaIndustry />}
                  </div>
                  <h4>{stage.name}</h4>
                </div>
                <div className="summary-body">
                  <div className="media-count">
                    <span><FaCamera /> {stage.photos.length} Photos</span>
                    {stage.audio && <span><FaMicrophone /> 1 Audio</span>}
                  </div>
                  <button 
                    className="view-stage-btn"
                    onClick={() => handleStageClick(stage.id)}
                  >
                    View Details →
                  </button>
                </div>
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
            <span>All evidence timestamped and stored on blockchain</span>
          </div>
          <p className="timestamp">
            Last updated: {new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HerbJourneyTracker;