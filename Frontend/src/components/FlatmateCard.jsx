// src/components/FlatmateCard.jsx
// UPDATED:
// - Works for both logged-in and logged-out users
// - View Profile button opens ProfileModal
// - Save/heart button works for everyone
// - match % shown when available
import React from "react";
import { useState } from "react";
import MatchBadge from "./MatchBadge";

function FlatmateCard({ person, onViewProfile, compact = false }) {
  const [saved, setSaved] = useState(false);

  const tags = [person.sleep, person.diet, person.profession].filter(Boolean);

  return (
    <div style={{ ...styles.card, ...(compact ? styles.compactCard : {}) }}>

      {/* Top row: avatar + name + heart */}
      <div style={styles.cardTop}>
        <div style={{ ...styles.avatar, backgroundColor: person.avatarColor || "#7C6FCD" }}>
          {person.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.cardName}>{person.name}, {person.age}</div>
          <div style={styles.cardLocation}>📍 {person.location}</div>
        </div>
        <button
          onClick={() => setSaved(!saved)}
          style={{ ...styles.heartBtn, color: saved ? "#E24B4A" : "#ccc" }}
          title={saved ? "Saved" : "Save listing"}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>

      {/* Budget */}
      <div style={styles.budget}>
        💰 ₹{Number(person.budget).toLocaleString()}/mo
      </div>

      {/* Match badge */}
      {person.match !== null && person.match !== undefined && (
        <MatchBadge score={person.match} />
      )}

      {/* Tags */}
      <div style={styles.tagsRow}>
        {tags.map((tag) => (
          <span key={tag} style={styles.tag}>{tag}</span>
        ))}
      </div>

      {/* View Profile button */}
      <button
        style={styles.viewBtn}
        onClick={() => onViewProfile && onViewProfile(person)}
      >
        View Profile →
      </button>

    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  compactCard: {
    minWidth: "260px",
    maxWidth: "280px",
    flexShrink: 0,
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    color: "#fff",
    fontWeight: 700,
    fontSize: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#1a1a2e",
  },
  cardLocation: {
    fontSize: "12px",
    color: "#888",
    marginTop: "2px",
  },
  heartBtn: {
    background: "none",
    border: "none",
    fontSize: "22px",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
    transition: "color 0.2s",
  },
  budget: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#444",
  },
  tagsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  tag: {
    background: "#f3f3f3",
    color: "#555",
    fontSize: "11px",
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: "6px",
    border: "1px solid #e5e5e5",
  },
  viewBtn: {
    background: "none",
    border: "1px solid #5c4fcf",
    color: "#5c4fcf",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: "4px",
    transition: "background 0.2s",
  },
};

export default FlatmateCard;