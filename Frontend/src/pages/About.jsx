// src/pages/About.jsx
import React from "react";
import PageHeader from "../components/PageHeader";

function TeamMemberCard({ initials, name, role, desc, color }) {
  return (
    <div style={styles.teamCard}>
      <div style={{ ...styles.avatar, backgroundColor: color }}>{initials}</div>
      <h3 style={styles.memberName}>{name}</h3>
      <span style={styles.memberRole}>{role}</span>
      <p style={styles.memberDesc}>{desc}</p>
    </div>
  );
}

function MissionCard({ icon, title, text }) {
  return (
    <div style={styles.missionCard}>
      <div style={styles.missionIcon}>{icon}</div>
      <h3 style={styles.missionTitle}>{title}</h3>
      <p style={styles.missionText}>{text}</p>
    </div>
  );
}

function About() {
  // ── UPDATE these with your real names! ──
  const team = [
    { initials: "TKS", name: "Tarang Kumar Srivastava",   role: "Frontend Developer", desc: "Builds all pages and components users see and interact with.", color: "#43cbf1" },
    { initials: "TYV", name: "Yash Verma",   role: "Backend Developer",  desc: "Builds the server, APIs and handles all business logic.",    color: "#c4246c" },
    { initials: "KS", name: "Kandarp Sharma", role: "Database & AI",      desc: "Designs the database schema and compatibility scoring engine.", color: "#43cbf1" },
    { initials: "SS", name: "Somesh Sharma",  role: "UI/UX & Chat",       desc: "Designs the look, integrates maps and builds in-app messaging.", color: "#c4246c" },
    { initials: "AP", name: "Ashish Pathak",  role: "UI/UX & Chat",       desc: "Designs the look, integrates maps and builds in-app messaging.", color: "#43cbf1" },
  ];

  const missions = [
    { icon: "🎯", title: "Our Mission",      text: "To make finding a flatmate stress-free by matching people on lifestyle compatibility, not just location and budget." },
    { icon: "🤖", title: "How the AI works", text: "Our algorithm scores compatibility across 5 dimensions: budget, area, sleep schedule, diet, and profession. Deal breakers are filtered out before scoring." },
    { icon: "🔒", title: "Safety first",     text: "Every profile is verified. Trust badges show ID-verified users, student-verified members, and response rates." },
  ];

  return (
    <div style={styles.page}>
      <PageHeader
        title="About FlatSync"
        subtitle="Built by students, for students and professionals. We use AI to remove the guesswork from finding a compatible flatmate."
      />

      {/* Mission */}
      <section style={styles.section}>
        <div style={styles.missionGrid}>
          {missions.map((m) => (
            <MissionCard key={m.title} icon={m.icon} title={m.title} text={m.text} />
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ ...styles.section, backgroundColor: "#f0eeff", borderRadius: "20px", margin: "0 24px 60px" }}>
        <h2 style={styles.sectionTitle}>Meet the Team</h2>
        <div style={styles.teamGrid}>
          {team.map((m) => (
            <TeamMemberCard key={m.name} {...m} />
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    paddingTop: "64px",
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
  },
  section: {
    //maxWidth: "1100px",
    margin: "0px auto",
    padding: "60px 24px",
  },
  sectionTitle: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#1a1a2e",
    letterSpacing: "-1px",
    marginBottom: "32px",
    textAlign: "center",
  },
  missionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  missionCard: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "16px",
    padding: "28px",
  },
  missionIcon:  { fontSize: "28px", marginBottom: "14px" },
  missionTitle: { fontSize: "17px", fontWeight: 700, color: "#1a1a2e", marginBottom: "10px" },
  missionText:  { fontSize: "14px", color: "#777", lineHeight: 1.7, margin: 0 },
  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
  },
  teamCard: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "16px",
    padding: "28px 20px",
    textAlign: "center",
  },
  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    color: "#fff",
    fontWeight: 700,
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  memberName: { fontSize: "15px", fontWeight: 700, color: "#1a1a2e", marginBottom: "4px" },
  memberRole: {
    display: "block",
    fontSize: "12px",
    color: "#5c4fcf",
    fontWeight: 600,
    marginBottom: "10px",
  },
  memberDesc: { fontSize: "13px", color: "#888", lineHeight: 1.6, margin: 0 },
};

export default About;