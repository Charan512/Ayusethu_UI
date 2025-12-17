import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/Login.module.css";
import { useAuth } from "../context/AuthContext";
const API_BASE = import.meta.env.VITE_API_BASE;
export default function LoginPage() {
  // ---------------- STATES ----------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [labName, setLabName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const { login } = useAuth();
  const registerRoles = ["Collector", "Tester", "Manufacturer"];
  

  const loginRoles = ["Admin", ...registerRoles]; 
  

  const [activeRole, setActiveRole] = useState(""); 
  const [showRegister, setShowRegister] = useState(false);

  const navigate = useNavigate();

  // ---------------- HELPERS ----------------
  const resetFields = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setOrganization("");
    setLabName("");
    setCompanyName("");
    setLicenseNumber("");
  };

  // ---------------- LOGIN ----------------
const handleLogin = async () => {
  try {
    await login({ 
        email, 
        password, 
        role: activeRole 
    });
  } catch (error) {
    const errorDetail = error.response?.data?.detail || "Login failed";
    console.error("Login Error:", error);
    alert(errorDetail);
  }
};
  // ---------------- REGISTER ----------------
  const handleRegister = async () => {
    try {
      const payload = {
        role: activeRole,
        fullName,
        email,
        password,
      };

      if (activeRole === "Collector") {
        payload.phone = phone;
        payload.organization = organization;
      }

      if (activeRole === "Tester") {
        payload.labName = labName;
        payload.licenseNumber = licenseNumber;
      }

      if (activeRole === "Manufacturer") {
        payload.companyName = companyName;
        payload.licenseNumber = licenseNumber;
      }

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Registration failed");
        return;
      }

      alert("Registered successfully. Please login.");
      resetFields();
      setShowRegister(false);
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // ---------------- UI ----------------
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

                <label className={styles.label}>Select Role:</label>
                <select
                    value={activeRole}
                    onChange={(e) => setActiveRole(e.target.value)}
                    className={styles.input}
                  >
                    <option value="" disabled hidden>Select Role</option> 
                    {registerRoles.map((role) => ( 
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>

                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {activeRole === "Collector" && (
                  <>
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Organization"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                  </>
                )}

                {activeRole === "Tester" && (
                  <>
                    <input
                      type="text"
                      placeholder="Lab Name"
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="License Number"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                  </>
                )}

                {activeRole === "Manufacturer" && (
                  <>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="License Number"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                  </>
                )}

                <button className={styles.btn} onClick={handleRegister}>
                  Register
                </button>

                <p className={styles.switchText}>
                  Already have an account?{" "}
                  <span
                    onClick={() => {
                      resetFields();
                      setShowRegister(false);
                    }}
                  >
                    Login
                  </span>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="login"
                className={styles.form}
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className={styles.title}>Login</h2>

                <input
                  type="email"
                  placeholder="Email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <label className={styles.label}>Select Role:</label>
                <select
                    value={activeRole}
                    onChange={(e) => setActiveRole(e.target.value)}
                    className={styles.input}
                  >
                    <option value="" disabled hidden>Select Role</option> {/* Default Placeholder */}
                    {loginRoles.map((role) => ( // Use loginRoles (includes Admin)
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                <button className={styles.btn} onClick={handleLogin}>
                  Login
                </button>

                <p className={styles.switchText}>
                  New here?{" "}
                  <span
                    onClick={() => {
                      resetFields();
                      setShowRegister(true);
                    }}
                  >
                    Register Now
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
