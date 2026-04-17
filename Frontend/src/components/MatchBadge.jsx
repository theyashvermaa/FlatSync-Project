// src/components/MatchBadge.jsx
// Props: score (number)
// Automatically picks green / orange / red based on score
import React from "react";
function MatchBadge({ score }) {
  const getStyle = () => {
    if (score >= 85) return { background: "#d4f5eb", color: "#1a7a54" };
    if (score >= 70) return { background: "#fef3d9", color: "#a36a00" };
    return             { background: "#fde8e8", color: "#a33030" };
  };

  return (
    <span style={{ ...styles.badge, ...getStyle() }}>
      {score}% Match
    </span>
  );
}

const styles = {
  badge: {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "6px",
  },
};

export default MatchBadge;