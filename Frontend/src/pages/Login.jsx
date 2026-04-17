// src/pages/Login.jsx
import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      login(res.data);       // save user to context + localStorage
      navigate("/find");     // redirect to find page after login
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logoText}>FlatSync</div>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Login to see your compatibility matches.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
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
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {error && <p style={styles.errorMsg}>{error}</p>}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Logging in..." : "Login →"}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.switchLink}>Sign up free</Link>
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
    maxWidth: "420px",
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

export default Login;