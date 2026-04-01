import { Link } from "react-router-dom";
 
function Home() {
  return (
    <div>
 
      {/* ── HERO ── */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Find Your Perfect{" "}
          <span style={styles.accent}>Flatmate</span>
        </h1>
        <p style={styles.heroSub}>
          RoomSync matches you with compatible roommates based on budget,
          lifestyle, sleep schedule, and habits — not just location.
        </p>
        <div style={styles.heroBtns}>
          {/* Link goes to the /find page */}
          <Link to="/find" style={styles.btnFilled}>
            Find Flatmate →
          </Link>
          <Link to="/about" style={styles.btnOutline}>
            How it works
          </Link>
        </div>
 
        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <span style={styles.statNum}>3,200+</span>
            <span style={styles.statLabel}>Matches Made</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNum}>120</span>
            <span style={styles.statLabel}>Cities</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNum}>98%</span>
            <span style={styles.statLabel}>Satisfaction</span>
          </div>
        </div>
      </section>
 
      {/* ── HOW IT WORKS ── */}
      <section style={styles.howSection}>
        <h2 style={styles.sectionTitle}>How RoomSync works</h2>
        <div style={styles.stepsRow}>
 
          <div style={styles.stepCard}>
            <div style={styles.stepNum}>1</div>
            <h3 style={styles.stepTitle}>Create Profile</h3>
            <p style={styles.stepDesc}>
              Tell us your budget, area, sleep schedule and habits.
            </p>
          </div>
 
          <div style={styles.stepCard}>
            <div style={styles.stepNum}>2</div>
            <h3 style={styles.stepTitle}>AI Matches You</h3>
            <p style={styles.stepDesc}>
              Our algorithm scores compatibility across lifestyle factors.
            </p>
          </div>
 
          <div style={styles.stepCard}>
            <div style={styles.stepNum}>3</div>
            <h3 style={styles.stepTitle}>Connect & Chat</h3>
            <p style={styles.stepDesc}>
              Message compatible flatmates directly in the app.
            </p>
          </div>
 
          <div style={styles.stepCard}>
            <div style={styles.stepNum}>4</div>
            <h3 style={styles.stepTitle}>Move In!</h3>
            <p style={styles.stepDesc}>
              Confirm your listing and start your new life.
            </p>
          </div>
 
        </div>
      </section>
 
      {/* ── FOOTER WITH CONTACT ── */}
      <footer id="contact" style={styles.footer}>
        <div style={styles.footerInner}>
 
          {/* Left: Brand */}
          <div style={styles.footerLeft}>
            <div style={styles.footerLogo}>RoomSync</div>
            <p style={styles.footerTagline}>
              AI-powered flatmate matching for students and
              professionals across India.
            </p>
            <div style={styles.footerLinks}>
              <Link to="/"      style={styles.footerLink}>Home</Link>
              <Link to="/find"  style={styles.footerLink}>Find Flatmate</Link>
              <Link to="/about" style={styles.footerLink}>About</Link>
            </div>
            <p style={styles.copyright}>© 2025 RoomSync. All rights reserved.</p>
          </div>
 
          {/* Right: Contact form */}
          <div style={styles.contactBox}>
            <h3 style={styles.contactTitle}>Contact Us</h3>
            <p style={styles.contactSub}>Have a question? We'd love to hear from you.</p>
            <div style={styles.form}>
              <input
                type="text"
                placeholder="Your name"
                style={styles.input}
              />
              <input
                type="email"
                placeholder="Your email"
                style={styles.input}
              />
              <textarea
                placeholder="Your message..."
                style={{ ...styles.input, height: "100px", resize: "vertical" }}
              />
              <button style={styles.submitBtn}>Send Message</button>
            </div>
          </div>
 
        </div>
      </footer>
 
    </div>
  );
}
 
const styles = {
  /* HERO */
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
  heroTitle: {
    fontSize: "52px",
    fontWeight: 800,
    letterSpacing: "-2px",
    lineHeight: 1.15,
    marginBottom: "20px",
    color: "#1a1a2e",
  },
  accent: {
    color: "#4fa9cf",
  },
  heroSub: {
    fontSize: "17px",
    color: "#666",
    maxWidth: "520px",
    marginBottom: "32px",
    lineHeight: 1.7,
  },
  heroBtns: {
    display: "flex",
    gap: "14px",
    marginBottom: "60px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  btnFilled: {
    backgroundColor: "#39aadb",
    color: "#fff",
    padding: "12px 28px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "15px",
    textDecoration: "none",
  },
  btnOutline: {
    backgroundColor: "transparent",
    color: "#4fa9cf",
    border: "2px solid #39aadb",
    padding: "12px 28px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "15px",
    textDecoration: "none",
  },
  statsRow: {
    display: "flex",
    gap: "60px",
    borderTop: "1px solid #b5e7f3",
    paddingTop: "32px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  statNum: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#21343f",
    letterSpacing: "-1px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
 
  /* HOW IT WORKS */
  howSection: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "80px 24px",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: "34px",
    fontWeight: 800,
    color: "#1a1a2e",
    letterSpacing: "-1px",
    marginBottom: "40px",
  },
  stepsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px",
  },
  stepCard: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "16px",
    padding: "28px 20px",
    textAlign: "left",
  },
  stepNum: {
    width: "36px",
    height: "36px",
    background: "#0db6cd",
    color: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "15px",
    marginBottom: "16px",
  },
  stepTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#377995",
    marginBottom: "8px",
  },
  stepDesc: {
    fontSize: "13px",
    color: "#888",
    lineHeight: 1.6,
    margin: 0,
  },
 
  /* FOOTER */
  footer: {
    backgroundColor: "#0f1e21",
    color: "#ccc",
    padding: "64px 24px 32px",
  },
  footerInner: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "64px",
    marginBottom: "32px",
  },
  footerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  footerLogo: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#fff",
  },
  footerTagline: {
    fontSize: "14px",
    color: "#aaa",
    lineHeight: 1.7,
    maxWidth: "320px",
    margin: 0,
  },
  footerLinks: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  footerLink: {
    fontSize: "13px",
    color: "#aaa",
    textDecoration: "none",
  },
  copyright: {
    fontSize: "12px",
    color: "#555",
    margin: 0,
  },
  contactBox: {
    background: "#227681",
    borderRadius: "16px",
    padding: "28px",
  },
  contactTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "6px",
  },
  contactSub: {
    fontSize: "13px",
    color: "#aaa",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    background: "#163743",
    border: "1px solid #163743",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    padding: "12px 14px",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },
  submitBtn: {
    backgroundColor: "#00d0ff",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
 
export default Home;