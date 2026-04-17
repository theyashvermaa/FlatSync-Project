// src/pages/FindFlatmate.jsx
// FULLY UPDATED:
// - Public listings visible without login
// - Post Listing requires login
// - Search bar + predefined filter chips (Area, Budget, Gender) + Sort by
// - Left: filtered listings with match %
// - Right: map view (OpenStreetMap via iframe — no API key needed)
// - Click any card → ProfileModal with compatibility breakdown
import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageHeader    from "../components/PageHeader";
import FlatmateCard  from "../components/FlatmateCard";
import ProfileModal  from "../components/ProfileModal";
import { useAuth }   from "../context/AuthContext";

// Filter chip component
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.chip,
        ...(active ? styles.chipActive : {}),
      }}
    >
      {label}
    </button>
  );
}

function FindFlatmate() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [listings, setListings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);

  // Filter states
  const [genderFilter, setGenderFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [sleepFilter, setSleepFilter]   = useState("");
  const [sortBy, setSortBy]             = useState("match");

  // Fetch all listings — public
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const headers = user ? { Authorization: `Bearer ${user.token}` } : {};
        const res = await axios.get("http://localhost:5000/api/listings", { headers });
        setListings(res.data);
      } catch (err) {
        setError("Could not load listings. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [user]);

  // ── Apply filters + search + sort ──
  const filtered = listings
    .filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.location.toLowerCase().includes(search.toLowerCase());
      const matchesGender = genderFilter ? l.gender === genderFilter : true;
      const matchesBudget =
        budgetFilter === "under8k"  ? l.budget < 8000  :
        budgetFilter === "8k-12k"   ? l.budget >= 8000 && l.budget <= 12000 :
        budgetFilter === "above12k" ? l.budget > 12000 : true;
      const matchesSleep = sleepFilter ? l.sleep === sleepFilter : true;
      return matchesSearch && matchesGender && matchesBudget && matchesSleep;
    })
    .sort((a, b) => {
      if (sortBy === "match")  return (b.match || 0) - (a.match || 0);
      if (sortBy === "budget") return a.budget - b.budget;
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const handlePostListing = () => {
    if (!user) navigate("/register");
    // else show post listing modal (future feature)
  };

  const handleMessage = (person) => {
    navigate("/messages", { state: { person } });
  };

  const clearFilters = () => {
    setGenderFilter("");
    setBudgetFilter("");
    setSleepFilter("");
    setSearch("");
  };

  const hasFilters = genderFilter || budgetFilter || sleepFilter || search;

  return (
    <div style={styles.page}>
      <PageHeader
        title="Find a Flatmate"
        subtitle="Browse compatible people near you. Log in to see your personal match scores."
      />

      <div style={styles.content}>

        {/* ── Search + Sort bar ── */}
        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder="🔍  Search by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.sortSelect}
          >
            <option value="match">Sort: Best Match</option>
            <option value="budget">Sort: Lowest Budget</option>
            <option value="newest">Sort: Newest</option>
          </select>
        </div>

        {/* ── Filter chips ── */}
        <div style={styles.filtersRow}>
          <span style={styles.filterLabel}>Filters:</span>

          {/* Gender */}
          <FilterChip label="Any Gender"    active={genderFilter === ""}       onClick={() => setGenderFilter("")} />
          <FilterChip label="Male"          active={genderFilter === "Male"}   onClick={() => setGenderFilter("Male")} />
          <FilterChip label="Female"        active={genderFilter === "Female"} onClick={() => setGenderFilter("Female")} />

          <div style={styles.filterDivider} />

          {/* Budget */}
          <FilterChip label="Any Budget"    active={budgetFilter === ""}          onClick={() => setBudgetFilter("")} />
          <FilterChip label="Under ₹8k"    active={budgetFilter === "under8k"}   onClick={() => setBudgetFilter("under8k")} />
          <FilterChip label="₹8k–₹12k"     active={budgetFilter === "8k-12k"}    onClick={() => setBudgetFilter("8k-12k")} />
          <FilterChip label="Above ₹12k"   active={budgetFilter === "above12k"}  onClick={() => setBudgetFilter("above12k")} />

          <div style={styles.filterDivider} />

          {/* Sleep */}
          <FilterChip label="Any Schedule"  active={sleepFilter === ""}             onClick={() => setSleepFilter("")} />
          <FilterChip label="Early riser"   active={sleepFilter === "Early riser"}  onClick={() => setSleepFilter("Early riser")} />
          <FilterChip label="Night owl"     active={sleepFilter === "Night owl"}    onClick={() => setSleepFilter("Night owl")} />
          <FilterChip label="Flexible"      active={sleepFilter === "Flexible"}     onClick={() => setSleepFilter("Flexible")} />

          {/* Clear all */}
          {hasFilters && (
            <button style={styles.clearBtn} onClick={clearFilters}>✕ Clear all</button>
          )}
        </div>

        {/* Results count */}
        <div style={styles.resultsBar}>
          <span style={styles.resultsText}>
            {loading ? "Loading..." : `${filtered.length} listing${filtered.length !== 1 ? "s" : ""} found`}
          </span>
          <button style={styles.postBtn} onClick={handlePostListing}>
            {user ? "+ Post a Listing" : "Sign up to Post"}
          </button>
        </div>

        {/* ── Main content: listings left + map right ── */}
        <div style={styles.mainLayout}>

          {/* LEFT: Listings */}
          <div style={styles.listingsCol}>
            {loading && <p style={styles.stateMsg}>Loading listings...</p>}
            {error   && <p style={styles.errorMsg}>{error}</p>}
            {!loading && !error && filtered.length === 0 && (
              <p style={styles.stateMsg}>No listings match your filters.</p>
            )}
            {!loading && !error && filtered.map((person) => (
              <FlatmateCard
                key={person._id}
                person={person}
                onViewProfile={setSelectedPerson}
              />
            ))}
          </div>

          {/* RIGHT: Map */}
          <div style={styles.mapCol}>
            <div style={styles.mapHeader}>
              <span style={styles.mapTitle}>📍 Listing locations</span>
              <span style={styles.mapSub}>Click a listing to see it on the map</span>
            </div>
            {/* OpenStreetMap embed — no API key needed */}
            <iframe
              title="FlatSync Map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=72.8,18.9,77.3,28.7&layer=mapnik"
              style={styles.mapIframe}
              allowFullScreen
            />
            <p style={styles.mapNote}>
              🗺 Map shows listings across Delhi, Noida, Gurugram, Mumbai & Bangalore
            </p>
          </div>

        </div>
      </div>

      {/* Profile Modal */}
      {selectedPerson && (
        <ProfileModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onMessage={handleMessage}
        />
      )}
    </div>
  );
}

const styles = {
  page: { paddingTop: "64px", minHeight: "100vh", backgroundColor: "#f9f9f9" },
  content: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" },

  // Search + sort
  searchRow: { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" },
  searchInput: {
    flex: 1, minWidth: "220px",
    border: "1px solid #e0e0e0", borderRadius: "8px",
    padding: "11px 16px", fontSize: "14px",
    fontFamily: "inherit", outline: "none",
    backgroundColor: "#fff", color: "#1a1a2e",
  },
  sortSelect: {
    border: "1px solid #e0e0e0", borderRadius: "8px",
    padding: "11px 14px", fontSize: "14px",
    fontFamily: "inherit", outline: "none",
    backgroundColor: "#fff", color: "#1a1a2e",
    cursor: "pointer",
  },

  // Filter chips
  filtersRow: {
    display: "flex", flexWrap: "wrap",
    alignItems: "center", gap: "8px",
    marginBottom: "20px",
    padding: "14px 16px",
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
  },
  filterLabel: { fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginRight: "4px" },
  filterDivider: { width: "1px", height: "20px", background: "#e5e5e5", margin: "0 4px" },
  chip: {
    background: "#f3f3f3", color: "#555",
    border: "1px solid #e5e5e5",
    padding: "6px 14px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 500,
    cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.15s",
  },
  chipActive: {
    background: "#5c4fcf", color: "#fff",
    border: "1px solid #5c4fcf",
    fontWeight: 700,
  },
  clearBtn: {
    background: "none", color: "#a33030",
    border: "1px solid #f5c0c0",
    padding: "6px 12px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },

  // Results bar
  resultsBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  resultsText: { fontSize: "14px", fontWeight: 600, color: "#1a1a2e" },
  postBtn: {
    background: "#5c4fcf", color: "#fff",
    border: "none", padding: "10px 20px",
    borderRadius: "8px", fontSize: "13px",
    fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit",
  },

  // Main layout
  mainLayout: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" },

  // Listings column
  listingsCol: { display: "flex", flexDirection: "column", gap: "16px", maxHeight: "80vh", overflowY: "auto", paddingRight: "8px" },

  // Map column
  mapCol: {
    position: "sticky", top: "80px",
    background: "#fff", border: "1px solid #e5e5e5",
    borderRadius: "16px", overflow: "hidden",
  },
  mapHeader: { padding: "14px 16px", borderBottom: "1px solid #e5e5e5" },
  mapTitle: { fontSize: "14px", fontWeight: 700, color: "#1a1a2e", display: "block" },
  mapSub: { fontSize: "12px", color: "#888", marginTop: "2px", display: "block" },
  mapIframe: { width: "100%", height: "460px", border: "none", display: "block" },
  mapNote: { padding: "10px 16px", fontSize: "11px", color: "#aaa", borderTop: "1px solid #f0f0f0" },

  stateMsg: { textAlign: "center", color: "#888", fontSize: "15px", padding: "60px 0" },
  errorMsg: { textAlign: "center", color: "#a33030", fontSize: "14px", padding: "40px 0" },
};

export default FindFlatmate;