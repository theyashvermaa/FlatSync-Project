function About() {
  const team = [
    { initials: "TYV", name: "Yash Verma",   role: "Backend Developer", desc: "Builds all pages and components users see and interact with.", color: "#7C6FCD" },
    { initials: "TKS", name: "Tarang K Srivastava",   role: "Frontend Developer",  desc: "Builds the server, APIs and handles all business logic.",    color: "#2E9E7E" },
    { initials: "KS", name: "Kandarp Sharma", role: "Database & AI",      desc: "Designs the database schema and compatibility scoring engine.", color: "#D06B3B" },
    { initials: "AP", name: "Ashish Pathak",  role: "UI/UX & Chat",       desc: "Designs the look, integrates maps and builds in-app messaging.", color: "#3B8BD4" },
  ];
 
  return (
    <div style={styles.page}>
 
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>About RoomSync</h1>
        <p style={styles.subtitle}>
          Built by students, for students and professionals.
          We know how stressful finding safe, compatible accommodation
          can be — RoomSync uses AI to remove the guesswork.
        </p>
      </div>
 
      {/* Mission */}
      <section style={styles.section}>
        <div style={styles.missionGrid}>
          <div style={styles.missionCard}>
            <div style={styles.missionIcon}>🎯</div>
            <h3 style={styles.missionTitle}>Our Mission</h3>
            <p style={styles.missionText}>
              To make finding a flatmate as simple and stress-free as
              possible by matching people on what actually matters —
              lifestyle compatibility, not just location and budget.
            </p>
          </div>
          <div style={styles.missionCard}>
            <div style={styles.missionIcon}>🤖</div>
            <h3 style={styles.missionTitle}>How the AI works</h3>
            <p style={styles.missionText}>
              Our algorithm scores compatibility across 6 dimensions:
              budget, area, sleep schedule, diet, cleanliness, and social
              habits. Deal breakers are filtered out before scoring begins.
            </p>
          </div>
          <div style={styles.missionCard}>
            <div style={styles.missionIcon}>🔒</div>
            <h3 style={styles.missionTitle}>Safety first</h3>
            <p style={styles.missionText}>
              Every profile is verified. Trust badges show ID-verified users,
              student-verified members, and response rate scores so you
              always know who you're talking to.
            </p>
          </div>
        </div>
      </section>
 
      {/* Team */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Meet the Team</h2>
        <div style={styles.teamGrid}>
          {team.map(function (member) {
            return (
              <div key={member.name} style={styles.teamCard}>
                <div
                  style={{
                    ...styles.avatar,
                    backgroundColor: member.color,
                  }}
                >
                  {member.initials}
                </div>
                <h3 style={styles.memberName}>{member.name}</h3>
                <span style={styles.memberRole}>{member.role}</span>
                <p style={styles.memberDesc}>{member.desc}</p>
              </div>
            );
          })}
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
  section: {
    maxWidth: "1100px",
    margin: "0 auto",
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
 
  /* Mission cards */
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
  missionIcon: {
    fontSize: "28px",
    marginBottom: "14px",
  },
  missionTitle: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: "10px",
  },
  missionText: {
    fontSize: "14px",
    color: "#777",
    lineHeight: 1.7,
    margin: 0,
  },
 
  /* Team */
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
  memberName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  memberRole: {
    display: "block",
    fontSize: "12px",
    color: "#5c4fcf",
    fontWeight: 600,
    letterSpacing: "0.5px",
    marginBottom: "10px",
  },
  memberDesc: {
    fontSize: "13px",
    color: "#888",
    lineHeight: 1.6,
    margin: 0,
  },
};
 
export default About;