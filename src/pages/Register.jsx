// src/pages/Register.jsx
// FIXED:
//   - Removed unreachable JSX block that appeared after the return statement
//   - Location (lat/lng) from MapPicker is now included in the register API call
//   - MapPicker has its own "Use My Location" button — no duplication needed here

import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import MapPicker from "../components/MapPicker";

function Register() {
  const [location, setLocation] = useState(null);
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Include location in registration payload if the user picked one
      const payload = { ...form, ...(location ? { location } : {}) };
      const res = await axios.post("http://localhost:5000/api/auth/register", payload);
      login(res.data);      // auto-login after register
      navigate("/find");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logoText}>FlatSync</div>
        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.sub}>Find your perfect flatmate in minutes.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              name="name"
              type="text"
              placeholder="Priya Sharma"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              required
              minLength={6}
            />
          </div>

          {error && <p style={styles.errorMsg}>{error}</p>}

          {/* 📍 LOCATION PICKER — click on map OR use GPS button */}
          <div style={styles.field}>
            <label style={styles.label}>Your Location <span style={styles.optional}>(optional)</span></label>
            <MapPicker setPosition={setLocation} />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Creating account..." : "Sign Up Free →"}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.switchLink}>Login</Link>
        </p>

      </div>
    </div>
  );
}

const styles = {
  page: {
    paddingTop: "64px",
    minHeight: "100vh",
    backgroundColor: "#f0eeff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 24px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "20px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "480px",   // slightly wider to fit map comfortably
  },
  logoText: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#5c4fcf",
    marginBottom: "20px",
  },
  title: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#1a1a2e",
    letterSpacing: "-0.5px",
    marginBottom: "6px",
  },
  sub: {
    fontSize: "14px",
    color: "#888",
    marginBottom: "28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#333",
  },
  optional: {
    fontWeight: 400,
    color: "#aaa",
    fontSize: "12px",
  },
  input: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "11px 14px",
    fontSize: "14px",
    color: "#1a1a2e",
    fontFamily: "inherit",
    outline: "none",
    backgroundColor: "#fafafa",
  },
  errorMsg: {
    color: "#a33030",
    fontSize: "13px",
    margin: 0,
  },
  submitBtn: {
    backgroundColor: "#5c4fcf",
    color: "#fff",
    border: "none",
    padding: "13px",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: "4px",
  },
  switchText: {
    fontSize: "13px",
    color: "#888",
    textAlign: "center",
    marginTop: "20px",
  },
  switchLink: {
    color: "#5c4fcf",
    fontWeight: 600,
    textDecoration: "none",
  },
};

export default Register;