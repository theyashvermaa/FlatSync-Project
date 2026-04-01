import { Component } from "react";
 
class FindFlatmate extends Component {
  render() {
    return (
      <div style={styles.page}>
 
        {/* Page Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Find a Flatmate</h1>
          <p style={styles.subtitle}>
            Tell us what you're looking for. We'll match you with
            compatible people based on your preferences.
          </p>
        </div>
 
        {/* Two columns: form + info panel */}
        <div style={styles.layout}>
 
          {/* ── LEFT: Preference Form ── */}
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Your Preferences</h2>
            <p style={styles.formNote}>
              Fill this in and we'll find your best matches.
            </p>
 
            {/* Row 1 */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Age</label>
                <input
                  type="number"
                  placeholder="e.g. 22"
                  style={styles.input}
                />
              </div>
            </div>
 
            {/* Row 2 */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Preferred City / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Koramangala, Bangalore"
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Monthly Budget (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  style={styles.input}
                />
              </div>
            </div>
 
            {/* Row 3 */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Gender</label>
                <select style={styles.input}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Any</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Sleep Schedule</label>
                <select style={styles.input}>
                  <option value="">Select</option>
                  <option>Early riser</option>
                  <option>Night owl</option>
                  <option>Flexible</option>
                </select>
              </div>
            </div>
 
            {/* Row 4 */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Diet Preference</label>
                <select style={styles.input}>
                  <option value="">Select</option>
                  <option>Vegetarian</option>
                  <option>Non-vegetarian</option>
                  <option>Vegan</option>
                  <option>No preference</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Profession</label>
                <select style={styles.input}>
                  <option value="">Select</option>
                  <option>Student</option>
                  <option>Professional</option>
                  <option>Freelancer</option>
                </select>
              </div>
            </div>
 
            {/* Habits */}
            <div style={styles.field}>
              <label style={styles.label}>Habits / Preferences</label>
              <textarea
                placeholder="e.g. I prefer a clean space, no smoking indoors, okay with pets..."
                style={{ ...styles.input, height: "90px", resize: "vertical" }}
              />
            </div>
 
            {/* Submit */}
            <button style={styles.submitBtn}>
              Find My Matches →
            </button>
 
            <p style={styles.disclaimer}>
              * Matching results will appear here once the AI engine is connected.
            </p>
          </div>
 
          {/* ── RIGHT: Info Panel ── */}
          <div style={styles.infoPanel}>
 
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>🏠</div>
              <h3 style={styles.infoHeading}>How matching works</h3>
              <p style={styles.infoText}>
                RoomSync scores compatibility across 6 dimensions:
                budget, area, sleep schedule, diet, cleanliness, and
                social habits. The higher the score, the better the match.
              </p>
            </div>
 
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>✦</div>
              <h3 style={styles.infoHeading}>AI-powered results</h3>
              <p style={styles.infoText}>
                Our algorithm weighs each preference differently based
                on how much it affects day-to-day life. Deal breakers
                are filtered out completely before scoring.
              </p>
            </div>
 
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>💬</div>
              <h3 style={styles.infoHeading}>Connect directly</h3>
              <p style={styles.infoText}>
                Once matched, you can message your potential flatmate
                directly inside RoomSync. No sharing phone numbers
                until you're comfortable.
              </p>
            </div>
 
            {/* Stats */}
            <div style={styles.statsBox}>
              <div style={styles.statItem}>
                <span style={styles.statNum}>92%</span>
                <span style={styles.statLabel}>Avg match accuracy</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNum}>2 days</span>
                <span style={styles.statLabel}>Avg time to match</span>
              </div>
            </div>
 
          </div>
 
        </div>
      </div>
    );
  }
}
 
const styles = {
  page: {
    paddingTop: "64px", // offset for fixed navbar
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
    maxWidth: "500px",
    margin: "0 auto",
    lineHeight: 1.7,
  },
  layout: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "48px 24px",
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: "40px",
    alignItems: "start",
  },
 
  /* Form card */
  formCard: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "20px",
    padding: "36px",
  },
  formTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#1a1a2e",
    marginBottom: "6px",
    letterSpacing: "-0.5px",
  },
  formNote: {
    fontSize: "14px",
    color: "#888",
    marginBottom: "28px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "4px",
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
    width: "100%",
    boxSizing: "border-box",
  },
  submitBtn: {
    width: "100%",
    backgroundColor: "#00d0ff",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: "8px",
  },
  disclaimer: {
    fontSize: "12px",
    color: "#bbb",
    marginTop: "12px",
    textAlign: "center",
  },
 
  /* Info panel */
  infoPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  infoCard: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "16px",
    padding: "24px",
  },
  infoIcon: {
    fontSize: "24px",
    marginBottom: "12px",
  },
  infoHeading: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: "8px",
  },
  infoText: {
    fontSize: "13px",
    color: "#777",
    lineHeight: 1.7,
    margin: 0,
  },
  statsBox: {
    background: "#00d0ff",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-around",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  statNum: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#fff",
  },
  statLabel: {
    fontSize: "11px",
    color: "#c5bfff",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    textAlign: "center",
  },
};
 
export default FindFlatmate;
 