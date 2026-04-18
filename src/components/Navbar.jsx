// src/components/Navbar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavItem({ to, label }) {
  return (
    <li>
      <NavLink
        to={to}
        end={to === "/"}
        style={({ isActive }) =>
          isActive ? { ...styles.link, ...styles.activeLink } : styles.link
        }
      >
        {label}
      </NavLink>
    </li>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/",        label: "Home" },
    { to: "/find",    label: "Find Flatmate" },
    { to: "/about",   label: "About" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContainer}>

        <NavLink to="/" style={styles.logo}>FlatSync</NavLink>

        <ul style={styles.navLinks}>
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} />
          ))}
          <li><a href="/#contact" style={styles.link}>Contact</a></li>
          {/* Show Messages link only when logged in */}
          {user && (
            <NavItem to="/messages" label="💬 Messages" />
          )}
        </ul>

        <div style={styles.navButtons}>
          {user ? (
            <>
              <span style={styles.userName}>Hi, {user.name.split(" ")[0]} 👋</span>
              <button style={styles.btnOutline} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login"    style={styles.btnOutline}>Login</NavLink>
              <NavLink to="/register" style={styles.btnFilled}>Sign Up</NavLink>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

const styles = {
  navbar: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, backgroundColor: "#fff", borderBottom: "1px solid #e5e5e5", height: "64px" },
  navContainer: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center", gap: "32px" },
  logo: { fontSize: "20px", fontWeight: 800, color: "#5c4fcf", textDecoration: "none", letterSpacing: "-0.5px" },
  navLinks: { display: "flex", gap: "4px", flex: 1, justifyContent: "center", listStyle: "none", margin: 0, padding: 0 },
  link: { fontSize: "14px", fontWeight: 500, color: "#555", padding: "6px 14px", borderRadius: "6px", textDecoration: "none", display: "inline-block" },
  activeLink: { color: "#5c4fcf", backgroundColor: "#f0eeff", fontWeight: 700 },
  navButtons: { display: "flex", gap: "10px", alignItems: "center" },
  userName: { fontSize: "14px", fontWeight: 600, color: "#1a1a2e" },
  btnOutline: { backgroundColor: "transparent", color: "#5c4fcf", border: "2px solid #5c4fcf", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-block" },
  btnFilled: { backgroundColor: "#5c4fcf", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-block" },
};

export default Navbar;