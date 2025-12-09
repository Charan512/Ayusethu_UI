import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/Login.module.css";

export default function LoginPage() {
    const roles = ["User", "Collector", "Tester", "Manufacturer", "Admin"];
    const [activeRole, setActiveRole] = useState("User");
    const [showRegister, setShowRegister] = useState(false);

    const navigate = useNavigate();

    const handleLogin = () => {
        switch (activeRole) {
            case "Collector":
                navigate("/Collector");
                break;
            case "Tester":
                navigate("/Labtest");
                break;
            case "Manufacturer":
                navigate("/Manufacturer");
                break;
            case "Admin":
                navigate("/Admin");
                break;
            default:
                navigate("/User");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginWrapper}>
                <div className={styles.authCard}>
                    <AnimatePresence mode="wait">
                        {showRegister ? (
                            <motion.div
                                key="register"
                                className={styles.form}
                                initial={{ x: 300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -300, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h2 className={styles.title}>Register</h2>

                                {/* Role Selector */}
                                <label htmlFor="roleSelect" className={styles.label}>Select Role:</label>
                                <select
                                    id="roleSelect"
                                    value={activeRole}
                                    onChange={(e) => setActiveRole(e.target.value)}
                                    className={styles.select}
                                >
                                    {roles.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>

                                {/* COMMON FIELDS */}
                                <input type="text" placeholder="Full Name" />
                                <input type="email" placeholder="Email" />
                                <input type="password" placeholder="Password" />

                                {/* ROLE-BASED FIELDS */}
                                {activeRole === "User" && <input type="text" placeholder="Phone Number" />}
                                {activeRole === "Collector" && (
                                    <>
                                        <input type="text" placeholder="Phone Number" />
                                        <input type="file" accept="image/*" />
                                        <input type="text" placeholder="Organization" />
                                    </>
                                )}
                                {activeRole === "Tester" && (
                                    <>
                                        <input type="text" placeholder="Lab Name" />
                                        <input type="text" placeholder="Lab License Number" />
                                        <input type="text" placeholder="Location" />

                                        <div className={styles.uploadBox}>
                                            <label htmlFor="testerPhoto1" className={styles.uploadLabel}>
                                                Upload Photo
                                            </label>
                                            <input id="testerPhoto1" type="file" accept="image/*" className={styles.hiddenInput} />
                                        </div>

                                        <div className={styles.uploadBox}>
                                            <label htmlFor="testerLicense" className={styles.uploadLabel}>
                                                Lab License
                                            </label>
                                            <input id="testerLicense" type="file" accept="image/*" className={styles.hiddenInput} />
                                        </div>
                                    </>
                                )}
                                {activeRole === "Manufacturer" && (
                                    <>
                                        <input type="text" placeholder="Company Name" />
                                        <input type="text" placeholder="Manufacturing License Number" />
                                        <input type="text" placeholder="Factory Location" />
                                        <input type="file" accept="image/*" />
                                    </>
                                )}
                            </motion.div>
                        ) : (
                            // LOGIN SECTION
                            <motion.div
                                key="login"
                                className={styles.form}
                                initial={{ x: -300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 300, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h2 className={styles.title}>Login</h2>

                                {/* Role Selector */}

                                <input type="email" placeholder="Email" className={styles.input} />
                                <input type="password" placeholder="Password" className={styles.input} />

                                <label htmlFor="roleSelectLogin" className={styles.label}>Select Role:</label>
                                <select
                                    id="roleSelectLogin"
                                    value={activeRole}
                                    onChange={(e) => setActiveRole(e.target.value)}
                                    className={styles.input}   // Use same class as input
                                >
                                    {roles.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>

                                <button className={styles.btn} onClick={handleLogin}>Login</button>

                                <p className={styles.switchText}>
                                    New here? <span onClick={() => setShowRegister(true)}>Register Now</span>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
