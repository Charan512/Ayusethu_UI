import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Landing.module.css";
import { MapPin, Cog, FlaskConical, Factory, Package, User, Mail, Phone, MapPin as MapPinIcon, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const steps = [
  { icon: <MapPin size={34} />, title: "Farmer", text: "Geo-tagged harvesting with real-time capture of origin, species, and quality." },
  { icon: <Cog size={34} />, title: "Collector", text: "Centralized aggregation ensuring proper documentation, sorting, and authenticated handover." },
  { icon: <FlaskConical size={34} />, title: "Tester", text: "Laboratory validation of moisture, pesticides, DNA authentication, and purity metrics." },
  { icon: <Factory size={34} />, title: "Processing & Formulation", text: "Processed in certified facilities." },
  { icon: <Package size={34} />, title: "Manufacturer", text: "Processing, formulation, packaging, and final QR tagging powered by blockchain." },
  { icon: <User size={34} />, title: "Consumer", text: "Complete traceability access—origin, purity tests, sustainability, and batch details." }
];

const Landing = () => {
  const navigate = useNavigate();

  const partners = [
    {
      name: "Ministry of AYUSH",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUPvl0I49rSjyNFVwwL5hT36Kts_96fNsmMw&s"
    },
    {
      name: "AICTE",
      logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/All_India_Council_for_Technical_Education_logo.png"
    },
    {
      name: "Ministry of Education",
      logo: "https://yt3.googleusercontent.com/ytc/AIdro_nvbN77Rr10PMOE14-VSDSpoobmph5fTY87bMyfCTg2twI=s900-c-k-c0x00ffffff-no-rj"
    },
    {
      name: "Smart India Hackathon",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk6H0AVFvn7QLD3oVo1RamBHA4sldUTQxYFw&s"
    },
    {
      name: "National Medical Board",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8ZbOlzYwzsI5WjOGJaY6QVKGSr2ka8V89nQ&s"
    }
  ];

  return (
    <div className={styles.container}>
      {/* NAVBAR */}
      <div className={styles.navbar}>
        <nav>
          <img 
            src="https://res.cloudinary.com/domogztsv/image/upload/v1765220874/WhatsApp_Image_2025-12-09_at_12.36.40_AM_bp8jxt.jpg" 
            alt="logo" 
            className={styles.logoImage} 
          />
          <div className={styles.logo}>AyuSethu</div>
          <ul>
            <li>About</li>
            <li>How We Work</li>
            <li>Contact</li>
          </ul>
        </nav>
      </div>

      {/* HERO SECTION */}
      <div className={styles.heroSection}>
        {/* IMAGE SLIDER */}
        <div className={styles.headerImage}>
          <img
            src="https://www.ayurorganic.com.au/cdn/shop/files/Ayurvedic_and_Organic_SIngle_and_Blended_Herbs_1.webp?v=1749389990&width=1500"
            className={styles.slide}
            alt="Herbs"
          />
          <img
            src="https://www.pharmamanch.in/wp-content/uploads/2024/09/Top-10-Herbal-Companies-In-India.jpg"
            className={styles.slide}
            alt="Herbal Companies"
          />
          <img
            src="https://t3.ftcdn.net/jpg/16/27/75/38/360_F_1627753819_TLWx2Fs1OZEc5BeHkA27IIsZkdUJerl8.jpg"
            className={styles.slide}
            alt="Ayurvedic Medicine"
          />
        </div>

        {/* HERO TEXT */}
        <div className={styles.heroText}>
          <h1>Track Every Herb</h1>
          <h2>From Farm to Formulation</h2>
          <p>Blockchain-powered traceability for authentic Ayurvedic formulations</p>
        </div>

        {/* LOGIN BUTTON */}
        <div className={styles.loginBtn}>
          <button onClick={() => navigate("/Login")}>Login</button>
        </div>

        {/* FEATURES SECTION */}
        <div className={styles.featuresSection}>
          <div className={styles.featureBox}>
            <MapPin size={42} className={styles.featureIcon} />
            <div>
              <h3 className={styles.featureTitle}>QR Code Product</h3>
              <p className={styles.featureSubtitle}>Verification</p>
            </div>
          </div>

          <div className={`${styles.featureBox} ${styles.darkBox}`}>
            <Cog size={42} className={styles.featureIcon} />
            <div>
              <h3 className={styles.featureTitle}>End-to-End</h3>
              <p className={styles.featureSubtitle}>Traceability Viewer</p>
            </div>
          </div>

          <div className={`${styles.featureBox} ${styles.greenBox}`}>
            <User size={42} className={styles.featureIcon} />
            <div>
              <h3 className={styles.featureTitle}>Multi-Language</h3>
              <p className={styles.featureSubtitle}>Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* HOW WE WORK SECTION */}
      <section className={styles.workSection}>
        <h3 className={styles.workHeading}>How We Work</h3>
        <p className={styles.workTagline}>
          Ensuring transparency, purity, and trust at every stage.
        </p>

        <div className={styles.workContainer}>
          {steps.map((step, i) => (
            <div key={i} className={styles.stepWrapper}>
              <div className={styles.iconCircle}>{step.icon}</div>
              {i !== steps.length - 1 && <div className={styles.dash}></div>}
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <div className={styles.aboutSection}>
        <h2 className={styles.aboutTitle}>Motive Of AyuSethu</h2>

        <div className={styles.aboutContentWrapper}>
          <div className={styles.aboutImageWrapper}>
            <img
              src="https://res.cloudinary.com/domogztsv/image/upload/v1765249221/WhatsApp_Image_2025-12-09_at_8.29.24_AM_um6q2w.jpg"
              className={styles.aboutImage}
              alt="Herbs"
            />
          </div>

          <div className={styles.aboutTextWrapper}>
            <p className={styles.aboutParagraph}>
              AYUSETHU aims to bring transparency, trust, and authenticity to the Ayurvedic herbal supply chain. Herbs pass through many hands—cultivators, mandis, labs, and manufacturers—and during this journey, information about origin, quality, and sustainability often gets lost.
              <br /><br />
              Our platform uses blockchain and geo-tagging to securely record every stage, from harvest to processing to the final product. Consumers can scan a QR code and see the herb's full journey, including lab tests, sustainability compliance, and fair-trade verification.
              <br /><br />
              With AYU SETHU, we ensure that every Ayurvedic product is pure, verifiable, and responsibly sourced, empowering both consumers and stakeholders with confidence in the medicine they use.
            </p>
          </div>
        </div>
      </div>

      {/* PARTNERS SECTION */}
      <div className={styles.partnersSection}>
        <h3 className={styles.partnersHeading}>Our Partners</h3>
        
        <div className={styles.partnersDisplay}>
          {partners.map((partner, index) => (
            <div key={index} className={styles.partnerItem}>
              <img
                src={partner.logo}
                alt={partner.name}
                className={styles.partnerLogo}
              />
              <p className={styles.partnerName}>{partner.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER SECTION */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.footerLogo}>
              <img 
                src="https://res.cloudinary.com/domogztsv/image/upload/v1765220874/WhatsApp_Image_2025-12-09_at_12.36.40_AM_bp8jxt.jpg" 
                alt="AyuSethu Logo" 
                className={styles.footerLogoImage}
              />
              <h3 className={styles.footerLogoText}>AyuSethu</h3>
            </div>
            <p className={styles.footerDescription}>
              Blockchain-powered traceability for authentic Ayurvedic formulations from farm to formulation.
            </p>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Quick Links</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#work">How We Work</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#login">Login</a></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Contact Us</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <MapPinIcon size={18} />
                <span>123 Ayurveda Street, Haridwar, Uttarakhand, India 249401</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={18} />
                <span>+91 98765 43210</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={18} />
                <span>info@ayusethu.com</span>
              </div>
            </div>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Follow Us</h4>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialIcon}><Facebook size={24} /></a>
              <a href="#" className={styles.socialIcon}><Twitter size={24} /></a>
              <a href="#" className={styles.socialIcon}><Instagram size={24} /></a>
              <a href="#" className={styles.socialIcon}><Linkedin size={24} /></a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} AyuSethu. All rights reserved.</p>
          <div className={styles.footerLegal}>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;