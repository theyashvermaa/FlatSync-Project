import { NavLink } from "react-router-dom";
 
function Navbar() {
  return (
    <nav style={styles.navbar}>
      <div style={styles.navContainer}>
 
        <NavLink to="/" style={styles.logo}>
          RoomSync
        </NavLink>
 
        
        <ul style={styles.navLinks}>
          <li>
            <NavLink
              to="/"
              end
              style={({ isActive }) =>
                isActive ? { ...styles.link, ...styles.activeLink } : styles.link
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/find"
              style={({ isActive }) =>
                isActive ? { ...styles.link, ...styles.activeLink } : styles.link
              }
            >
              Find Flatmate
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              style={({ isActive }) =>
                isActive ? { ...styles.link, ...styles.activeLink } : styles.link
              }
            >
              About
            </NavLink>
          </li>
          <li>
            {/* Contact stays on the home page footer */}
            {/* So we use a normal anchor tag with a hash */}
            <a href="/#contact" style={styles.link}>
              Contact
            </a>
          </li>
        </ul>
 
        {/* Login / Signup buttons */}
        <div style={styles.navButtons}>
          <button style={styles.btnOutline}>Login</button>
          <button style={styles.btnFilled}>Sign Up</button>
        </div>
 
      </div>
    </nav>
  );
}
 
const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e5e5",
    height: "64px",
  },
  navContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 24px",
    height: "100%",
    display: "flex",
    alignItems: "center",
    gap: "32px",
  },
  logo: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#43b0de",
    textDecoration: "none",
    letterSpacing: "-0.5px",
  },
  navLinks: {
    display: "flex",
    gap: "4px",
    flex: 1,
    justifyContent: "center",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  link: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#555555",
    padding: "6px 14px",
    borderRadius: "6px",
    textDecoration: "none",
    display: "inline-block",
  },
  // This style gets MERGED on top of "link"
  // when the page is active
  activeLink: {
    color: "#43b0de",
    backgroundColor: "#eefbff",
    fontWeight: 700,
  },
  navButtons: {
    display: "flex",
    gap: "10px",
  },
  btnOutline: {
    backgroundColor: "transparent",
    color: "#43b0de",
    border: "2px solid #43b0de",
    padding: "8px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnFilled: {
    backgroundColor: "#43b0de",
    color: "#ffffff",
    border: "none",
    padding: "8px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
 
export default Navbar;