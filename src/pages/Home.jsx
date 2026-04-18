// src/pages/Home.jsx — featured listings + UI 
// UPDATED: Added Featured Listings section below How It Works
// - Shows top 6 listings fetched from backend (public, no login needed)
// - Horizontal scroll with Show More → redirects to /find
// - View Profile opens ProfileModal
// - Post Listing requires login

import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import FlatmateCard  from "../components/FlatmateCard";
import ProfileModal  from "../components/ProfileModal";
import { useAuth }   from "../context/AuthContext";

function StatBadge({ number, label }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statNum}>{number}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div style={styles.stepCard}>
      <div style={styles.stepNum}>{number}</div>
      <h3 style={styles.stepTitle}>{title}</h3>
      <p style={styles.stepDesc}>{desc}</p>
    </div>
  );
}

function Home() {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  // Contact form state
  const [form, setForm]           = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]     = useState("");

  // Featured listings state
  const [featured, setFeatured]       = useState([]);
  const [listLoading, setListLoading] = useState(true);

  // Profile modal state
  const [selectedPerson, setSelectedPerson] = useState(null);

  const stats = [
    { number: "3,200+", label: "Matches Made" },
    { number: "120",    label: "Cities" },
    { number: "98%",    label: "Satisfaction" },
  ];

  const steps = [
    { number: "1", title: "Create Profile",  desc: "Tell us your budget, area, habits and sleep schedule." },
    { number: "2", title: "AI Matches You",  desc: "Our algorithm scores compatibility across lifestyle factors." },
    { number: "3", title: "Connect & Chat",  desc: "Message compatible flatmates directly in the app." },
    { number: "4", title: "Move In!",        desc: "Confirm your listing and start your new life." },
  ];

  // Fetch featured listings on load — public, no auth needed
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const headers = user ? { Authorization: `Bearer ${user.token}` } : {};
        const res = await axios.get("http://localhost:5000/api/listings", { headers });
        setFeatured(res.data.slice(0, 6)); // show top 6
      } catch (err) {
        console.error("Could not load featured listings");
      } finally {
        setListLoading(false);
      }
    };
    fetchFeatured();
  }, [user]);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      await axios.post("http://localhost:5000/api/contact", form);
      setSubmitted(true);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // Post listing: if not logged in → redirect to register
  const handlePostListing = () => {
    if (!user) {
      navigate("/register");
    } else {
      navigate("/find");
    }
  };

  const handleMessage = (person) => {
    navigate("/messages", { state: { person } });
  };

  return (
    <div>

      {/* ── HERO ── */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Find Your Perfect{" "}
          <span style={styles.accent}>Flatmate</span>
        </h1>
        <p style={styles.heroSub}>
          FlatSync matches you with compatible roommates based on budget,
          lifestyle, sleep schedule, and habits — not just location.
        </p>
        <div style={styles.heroBtns}>
          <Link to="/find" style={styles.btnFilled}>Find Flatmate →</Link>
          <button style={styles.btnOutline} onClick={handlePostListing}>
            Post a Listing
          </button>
        </div>
        <div style={styles.statsRow}>
          {stats.map((s) => (
            <StatBadge key={s.label} number={s.number} label={s.label} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={styles.howSection}>
        <h2 style={styles.sectionTitle}>How FlatSync works</h2>
        <div style={styles.stepsRow}>
          {steps.map((s) => (
            <StepCard key={s.number} number={s.number} title={s.title} desc={s.desc} />
          ))}
        </div>
      </section>

      {/* ── FEATURED LISTINGS ── */}
      <section style={styles.featuredSection}>
        <div style={styles.featuredHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Featured listings</h2>
            <p style={styles.featuredSub}>People actively looking for flatmates right now</p>
          </div>
          <Link to="/find" style={styles.showMoreBtn}>
            Show More →
          </Link>
        </div>

        {listLoading ? (
          <p style={styles.loadingText}>Loading listings...</p>
        ) : featured.length === 0 ? (
          <p style={styles.loadingText}>No listings yet. Be the first to post!</p>
        ) : (
          /* Horizontal scroll row */
          <div style={styles.scrollRow}>
            {featured.map((person) => (
              <FlatmateCard
                key={person._id}
                person={person}
                onViewProfile={setSelectedPerson}
                compact={true}
              />
            ))}
            {/* Show More card at the end */}
            <div style={styles.showMoreCard} onClick={() => navigate("/find")}>
              <span style={styles.showMoreArrow}>→</span>
              <span style={styles.showMoreText}>View all listings</span>
            </div>
          </div>
        )}
      </section>

      {/* Profile Modal */}
      {selectedPerson && (
        <ProfileModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onMessage={handleMessage}
        />
      )}

      {/* ── FOOTER + CONTACT ── */}
      <footer id="contact" style={styles.footer}>
        <div style={styles.footerInner}>

          <div style={styles.footerLeft}>
            <div style={styles.footerLogo}>FlatSync</div>
            <p style={styles.footerTagline}>
              AI-powered flatmate matching for students and professionals across India.
            </p>
            <div style={styles.footerLinks}>
              <Link to="/"      style={styles.footerLink}>Home</Link>
              <Link to="/find"  style={styles.footerLink}>Find Flatmate</Link>
              <Link to="/about" style={styles.footerLink}>About</Link>
            </div>
            <p style={styles.copyright}>© 2025 FlatSync. All rights reserved.</p>
          </div>

          <div style={styles.contactBox}>
            <h3 style={styles.contactTitle}>Contact Us</h3>
            <p style={styles.contactSub}>Have a question? We'd love to hear from you.</p>
            {submitted ? (
              <div style={styles.successMsg}>✓ Thanks {form.name}! We'll get back to you soon.</div>
            ) : (
              <form onSubmit={handleFormSubmit} style={styles.form}>
                <input name="name"    type="text"  placeholder="Your name"    value={form.name}    onChange={handleFormChange} style={styles.input} required />
                <input name="email"   type="email" placeholder="Your email"   value={form.email}   onChange={handleFormChange} style={styles.input} required />
                <textarea name="message"            placeholder="Your message" value={form.message} onChange={handleFormChange} style={{ ...styles.input, height: "100px", resize: "vertical" }} required />
                {formError && <p style={styles.errorMsg}>{formError}</p>}
                <button type="submit" style={styles.submitBtn} disabled={formLoading}>
                  {formLoading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

        </div>
      </footer>
    </div>
  );
}



const styles = {
  hero: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "100px 24px 60px",
    background: "linear-gradient(160deg, #f0eeff 0%, #f9f9f9 60%)",
  },
  heroTitle: { fontSize: "52px", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.15, marginBottom: "20px", color: "#1a1a2e" },
  accent: { color: "#5c4fcf" },
  heroSub: { fontSize: "17px", color: "#666", maxWidth: "520px", marginBottom: "32px", lineHeight: 1.7 },
  heroBtns: { display: "flex", gap: "14px", marginBottom: "60px", flexWrap: "wrap", justifyContent: "center" },
  btnFilled: { backgroundColor: "#5c4fcf", color: "#fff", padding: "12px 28px", borderRadius: "8px", fontWeight: 600, fontSize: "15px", textDecoration: "none" },
  btnOutline: { backgroundColor: "transparent", color: "#5c4fcf", border: "2px solid #5c4fcf", padding: "12px 28px", borderRadius: "8px", fontWeight: 600, fontSize: "15px", cursor: "pointer", fontFamily: "inherit" },
  statsRow: { display: "flex", gap: "60px", borderTop: "1px solid #ddd", paddingTop: "32px", flexWrap: "wrap", justifyContent: "center" },
  stat: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  statNum: { fontSize: "28px", fontWeight: 800, color: "#1a1a2e", letterSpacing: "-1px" },
  statLabel: { fontSize: "12px", color: "#999", textTransform: "uppercase", letterSpacing: "1px" },

  howSection: { maxWidth: "1100px", margin: "0 auto", padding: "80px 24px", textAlign: "center" },
  sectionTitle: { fontSize: "34px", fontWeight: 800, color: "#1a1a2e", letterSpacing: "-1px", marginBottom: "12px" },
  stepsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginTop: "40px" },
  stepCard: { background: "#fff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "28px 20px", textAlign: "left" },
  stepNum: { width: "36px", height: "36px", background: "#5c4fcf", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "15px", marginBottom: "16px" },
  stepTitle: { fontSize: "16px", fontWeight: 700, color: "#1a1a2e", marginBottom: "8px" },
  stepDesc: { fontSize: "13px", color: "#888", lineHeight: 1.6, margin: 0 },

  // Featured listings
  featuredSection: { background: "#f0eeff", padding: "80px 24px" },
  featuredHeader: { maxWidth: "1100px", margin: "0 auto 32px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" },
  featuredSub: { fontSize: "15px", color: "#777", marginTop: "4px" },
  showMoreBtn: { backgroundColor: "#5c4fcf", color: "#fff", padding: "10px 22px", borderRadius: "8px", fontWeight: 600, fontSize: "14px", textDecoration: "none", whiteSpace: "nowrap" },
  scrollRow: { maxWidth: "1100px", margin: "0 auto", display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "12px" },
  showMoreCard: {
    minWidth: "160px",
    maxWidth: "160px",
    background: "#5c4fcf",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    flexShrink: 0,
  },
  showMoreArrow: { fontSize: "32px", color: "#fff" },
  showMoreText: { fontSize: "13px", fontWeight: 600, color: "#fff", textAlign: "center", padding: "0 12px" },
  loadingText: { textAlign: "center", color: "#888", fontSize: "15px", padding: "40px 0" },

  // Footer
  footer: { backgroundColor: "#1a1a2e", color: "#ccc", padding: "64px 24px 32px" },
  footerInner: { maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", marginBottom: "32px" },
  footerLeft: { display: "flex", flexDirection: "column", gap: "16px" },
  footerLogo: { fontSize: "22px", fontWeight: 800, color: "#fff" },
  footerTagline: { fontSize: "14px", color: "#aaa", lineHeight: 1.7, maxWidth: "320px", margin: 0 },
  footerLinks: { display: "flex", gap: "20px", flexWrap: "wrap" },
  footerLink: { fontSize: "13px", color: "#aaa", textDecoration: "none" },
  copyright: { fontSize: "12px", color: "#555", margin: 0 },
  contactBox: { background: "#252540", borderRadius: "16px", padding: "28px" },
  contactTitle: { fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "6px" },
  contactSub: { fontSize: "13px", color: "#aaa", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { background: "#1a1a2e", border: "1px solid #333355", borderRadius: "8px", color: "#fff", fontSize: "14px", padding: "12px 14px", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  submitBtn: { backgroundColor: "#5c4fcf", color: "#fff", border: "none", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  successMsg: { background: "#d4f5eb", color: "#1a7a54", borderRadius: "8px", padding: "14px 18px", fontSize: "14px", fontWeight: 600 },
  errorMsg: { color: "#a33030", fontSize: "13px", margin: 0 },
};

export default Home;