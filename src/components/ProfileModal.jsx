// src/components/ProfileModal.jsx
// Full profile view shown when user clicks "View Profile"
// Shows compatibility bars, send message, save, skip buttons
// Works for both logged-in and logged-out users
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Compatibility dimension scores (calculated from matching logic)
// In real version these come from backend — for now derived from overall match
function getDimensions(match) {
  if (!match) return [];
  // Simulate breakdown scores around the overall match
  return [
    { label: "Budget",         score: Math.min(100, match + 5) },
    { label: "Sleep schedule", score: Math.min(100, match - 3) },
    { label: "Diet",           score: Math.min(100, match + 8) },
    { label: "Cleanliness",    score: Math.max(0,   match - 10) },
    { label: "Social habits",  score: Math.max(0,   match - 15) },
  ];
}

function CompatBar({ label, score }) {
  const color = score >= 80 ? "#2E9E7E" : score >= 60 ? "#D4910A" : "#C0492B";
  return (
    <div style={styles.barRow}>
      <span style={styles.barLabel}>{label}</span>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${score}%`, background: color }} />
      </div>
      <span style={{ ...styles.barPct, color }}>{score}%</span>
    </div>
  );
}

function ProfileModal({ person, onClose, onMessage }) {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const dimensions = getDimensions(person.match);

  const handleMessage = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    onMessage(person);
    onClose();
  };

  if (!person) return null;

  return (
    // Overlay backdrop
    <div style={styles.overlay} onClick={onClose}>
      {/* Modal card — stop click propagating to overlay */}
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Close button */}
        <button style={styles.closeBtn} onClick={onClose}>✕</button>

        {/* Profile header */}
        <div style={styles.profileHeader}>
          <div style={{ ...styles.avatar, backgroundColor: person.avatarColor || "#7C6FCD" }}>
            {person.initials}
          </div>
          <div>
            <h2 style={styles.profileName}>{person.name}, {person.age}</h2>
            <p style={styles.profileLocation}>📍 {person.location}</p>
            <p style={styles.profileBudget}>💰 ₹{Number(person.budget).toLocaleString()}/mo</p>
          </div>
          {/* Overall match score bubble */}
          {person.match && (
            <div style={styles.matchBubble}>
              <span style={styles.matchPct}>{person.match}%</span>
              <span style={styles.matchWord}>Match</span>
            </div>
          )}
        </div>

        {/* Tags row */}
        <div style={styles.tagsRow}>
          {[person.sleep, person.diet, person.profession, person.gender]
            .filter(Boolean)
            .map((tag) => (
              <span key={tag} style={styles.tag}>{tag}</span>
            ))}
        </div>

        {/* Habits / vibe check */}
        {person.habits && (
          <div style={styles.habitsBox}>
            <p style={styles.habitsLabel}>About them</p>
            <p style={styles.habitsText}>"{person.habits}"</p>
          </div>
        )}

        {/* Compatibility breakdown */}
        {person.match && (
          <div style={styles.compatSection}>
            <p style={styles.compatTitle}>Compatibility breakdown</p>
            {dimensions.map((d) => (
              <CompatBar key={d.label} label={d.label} score={d.score} />
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={styles.actions}>
          <button style={styles.btnMessage} onClick={handleMessage}>
            💬 {user ? "Send Message" : "Login to Message"}
          </button>
          <button style={styles.btnSave}>
            🔖 Save Profile
          </button>
          <button style={styles.btnSkip} onClick={onClose}>
            ✕ Skip
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: "20px",
  },
  modal: {
    background: "#fff",
    borderRadius: "20px",
    padding: "32px",
    width: "100%",
    maxWidth: "520px",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "#f3f3f3",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "inherit",
    color: "#555",
  },
  profileHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "16px",
  },
  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    color: "#fff",
    fontWeight: 700,
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  profileName: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1a1a2e",
    marginBottom: "4px",
    letterSpacing: "-0.5px",
  },
  profileLocation: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "2px",
  },
  profileBudget: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#444",
  },
  matchBubble: {
    marginLeft: "auto",
    background: "#f0eeff",
    border: "2px solid #5c4fcf",
    borderRadius: "12px",
    padding: "10px 16px",
    textAlign: "center",
    flexShrink: 0,
  },
  matchPct: {
    display: "block",
    fontSize: "22px",
    fontWeight: 800,
    color: "#5c4fcf",
    lineHeight: 1,
  },
  matchWord: {
    fontSize: "11px",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  tagsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "16px",
  },
  tag: {
    background: "#f3f3f3",
    color: "#555",
    fontSize: "12px",
    fontWeight: 500,
    padding: "5px 12px",
    borderRadius: "6px",
    border: "1px solid #e5e5e5",
  },
  habitsBox: {
    background: "#f9f7ff",
    border: "1px solid #e0d9ff",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "20px",
  },
  habitsLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#5c4fcf",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "6px",
  },
  habitsText: {
    fontSize: "14px",
    color: "#444",
    lineHeight: 1.6,
    fontStyle: "italic",
    margin: 0,
  },
  compatSection: {
    marginBottom: "24px",
  },
  compatTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#1a1a2e",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "14px",
  },
  barRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  barLabel: {
    fontSize: "13px",
    color: "#555",
    width: "110px",
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    height: "8px",
    background: "#f0f0f0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.4s ease",
  },
  barPct: {
    fontSize: "12px",
    fontWeight: 700,
    width: "36px",
    textAlign: "right",
    flexShrink: 0,
  },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  btnMessage: {
    flex: 1,
    background: "#5c4fcf",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    minWidth: "160px",
  },
  btnSave: {
    background: "#f0eeff",
    color: "#5c4fcf",
    border: "1px solid #c5bfff",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnSkip: {
    background: "#fff",
    color: "#888",
    border: "1px solid #e5e5e5",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

export default ProfileModal;