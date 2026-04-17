// src/components/PageHeader.jsx
import React from "react";
function PageHeader({ title, subtitle }) {
  return (
    <div style={styles.header}>
      <h1 style={styles.title}>{title}</h1>
      <p style={styles.subtitle}>{subtitle}</p>
    </div>
  );
}

const styles = {
  header: {
    background: "linear-gradient(160deg, #f0eeff 0%, #f9f9f9 60%)",
    textAlign: "center",
    padding: "60px 24px 48px",
    borderBottom: "1px solid #e5e5e5",
  },
  title: {
    fontSize: "40px",
    fontWeight: 800,
    color: "#1a1a2e",
    letterSpacing: "-1.5px",
    marginBottom: "12px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    maxWidth: "560px",
    margin: "0 auto",
    lineHeight: 1.8,
  },
};

export default PageHeader;