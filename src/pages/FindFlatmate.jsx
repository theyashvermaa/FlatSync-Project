// src/pages/FindFlatmate.jsx
// MAP FEATURES:
//   1. Type a location → press Enter or "Go" → map flies there, saves to history
//   2. Click anywhere on map → reverse geocodes to get place name, saves to history
//   3. GPS button → detects device location, reverse geocodes, saves to history
//   4. Click a listing card → map flies to that listing's location
//   5. Location history dropdown → click any past location to revisit it

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import PageHeader   from "../components/PageHeader";
import FlatmateCard from "../components/FlatmateCard";
import ProfileModal from "../components/ProfileModal";
import { useAuth }  from "../context/AuthContext";

// Fix broken marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Fly to a position whenever it changes
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position?.lat && position?.lng) {
      map.flyTo([position.lat, position.lng], 13, { animate: true, duration: 1 });
    }
  }, [position, map]);
  return null;
}

// Click anywhere on the map → trigger callback
function ClickToMark({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Reverse geocode lat/lng → readable place name using Nominatim
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (data?.address) {
      const a = data.address;
      // Build a short readable name: neighbourhood/suburb, city/town, state
      const parts = [
        a.neighbourhood || a.suburb || a.village || a.county,
        a.city || a.town || a.district,
        a.state,
      ].filter(Boolean);
      return parts.slice(0, 2).join(", ") || data.display_name?.split(",")[0] || "Unknown location";
    }
    return "Unknown location";
  } catch {
    return "Unknown location";
  }
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}
    >
      {label}
    </button>
  );
}

function FindFlatmate() {
  const [activePin, setActivePin]           = useState(null);   // { lat, lng, name }
  const [locating, setLocating]             = useState(false);
  const [locError, setLocError]             = useState("");

  const [locationSearch, setLocationSearch] = useState("");
  const [searching, setSearching]           = useState(false);
  const [searchError, setSearchError]       = useState("");

  // History: array of { lat, lng, name }
  const [locationHistory, setLocationHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("flatmap_history") || "[]");
    } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef(null);

  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [listings, setListings]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [search, setSearch]                 = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);

  const [genderFilter, setGenderFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [sleepFilter, setSleepFilter]   = useState("");
  const [sortBy, setSortBy]             = useState("match");

  // Save a location to history (deduplicates by name)
  const saveToHistory = (entry) => {
    setLocationHistory((prev) => {
      const filtered = prev.filter((h) => h.name !== entry.name);
      const updated = [entry, ...filtered].slice(0, 10); // keep last 10
      localStorage.setItem("flatmap_history", JSON.stringify(updated));
      return updated;
    });
  };

  // Set active pin + save to history
  const pinLocation = (lat, lng, name) => {
    const entry = { lat, lng, name };
    setActivePin(entry);
    saveToHistory(entry);
    setShowHistory(false);
  };

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (historyRef.current && !historyRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // GPS
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const name = await reverseGeocode(lat, lng);
        pinLocation(lat, lng, name);
        setLocating(false);
      },
      () => {
        setLocError("Could not get location. Please allow location access.");
        setLocating(false);
      }
    );
  };

  // Forward geocode: search place name → lat/lng
  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.length === 0) {
        setSearchError("Location not found. Try a different name.");
      } else {
        const { lat, lon, display_name } = data[0];
        // Use first 2 parts of display_name as readable short name
        const shortName = display_name.split(",").slice(0, 2).join(",").trim();
        pinLocation(parseFloat(lat), parseFloat(lon), shortName);
        setLocationSearch("");
      }
    } catch {
      setSearchError("Could not search location. Check your connection.");
    } finally {
      setSearching(false);
    }
  };

  const handleLocationKeyDown = (e) => {
    if (e.key === "Enter") handleLocationSearch();
  };

  // Map click → reverse geocode → pin
  const handleMapClick = async ({ lat, lng }) => {
    const name = await reverseGeocode(lat, lng);
    pinLocation(lat, lng, name);
  };

  // Fetch listings
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

  const filtered = listings
    .filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        (typeof l.location === "string" &&
          l.location.toLowerCase().includes(search.toLowerCase()));
      const matchesGender = genderFilter ? l.gender === genderFilter : true;
      const matchesBudget =
        budgetFilter === "under8k"  ? l.budget < 8000 :
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

  const handlePostListing = () => { if (!user) navigate("/register"); };
  const handleMessage = (person) => { navigate("/messages", { state: { person } }); };
  const clearFilters = () => { setGenderFilter(""); setBudgetFilter(""); setSleepFilter(""); setSearch(""); };
  const hasFilters = genderFilter || budgetFilter || sleepFilter || search;

  const clearHistory = () => {
    setLocationHistory([]);
    localStorage.removeItem("flatmap_history");
    setShowHistory(false);
  };

  return (
    <div style={styles.page}>
      <PageHeader
        title="Find a Flatmate"
        subtitle="Browse compatible people near you. Log in to see your personal match scores."
      />

      <div style={styles.content}>

        {/* Listing search + sort */}
        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder="🔍  Search by name or listing..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.sortSelect}>
            <option value="match">Sort: Best Match</option>
            <option value="budget">Sort: Lowest Budget</option>
            <option value="newest">Sort: Newest</option>
          </select>
        </div>

        {/* Filter chips */}
        <div style={styles.filtersRow}>
          <span style={styles.filterLabel}>Filters:</span>
          <FilterChip label="Any Gender"   active={genderFilter === ""}       onClick={() => setGenderFilter("")} />
          <FilterChip label="Male"         active={genderFilter === "Male"}   onClick={() => setGenderFilter("Male")} />
          <FilterChip label="Female"       active={genderFilter === "Female"} onClick={() => setGenderFilter("Female")} />
          <div style={styles.filterDivider} />
          <FilterChip label="Any Budget"   active={budgetFilter === ""}          onClick={() => setBudgetFilter("")} />
          <FilterChip label="Under ₹8k"   active={budgetFilter === "under8k"}   onClick={() => setBudgetFilter("under8k")} />
          <FilterChip label="₹8k–₹12k"    active={budgetFilter === "8k-12k"}    onClick={() => setBudgetFilter("8k-12k")} />
          <FilterChip label="Above ₹12k"  active={budgetFilter === "above12k"}  onClick={() => setBudgetFilter("above12k")} />
          <div style={styles.filterDivider} />
          <FilterChip label="Any Schedule" active={sleepFilter === ""}             onClick={() => setSleepFilter("")} />
          <FilterChip label="Early riser"  active={sleepFilter === "Early riser"}  onClick={() => setSleepFilter("Early riser")} />
          <FilterChip label="Night owl"    active={sleepFilter === "Night owl"}    onClick={() => setSleepFilter("Night owl")} />
          <FilterChip label="Flexible"     active={sleepFilter === "Flexible"}     onClick={() => setSleepFilter("Flexible")} />
          {hasFilters && (
            <button style={styles.clearBtn} onClick={clearFilters}>✕ Clear all</button>
          )}
        </div>

        {/* Results bar */}
        <div style={styles.resultsBar}>
          <span style={styles.resultsText}>
            {loading ? "Loading..." : `${filtered.length} listing${filtered.length !== 1 ? "s" : ""} found`}
          </span>
          <button style={styles.postBtn} onClick={handlePostListing}>
            {user ? "+ Post a Listing" : "Sign up to Post"}
          </button>
        </div>

        {/* Main layout */}
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
                onViewProfile={(person) => {
                  setSelectedPerson(person);
                  if (person.location?.lat) {
                    pinLocation(person.location.lat, person.location.lng, person.name);
                  }
                }}
              />
            ))}
          </div>

          {/* RIGHT: Map */}
          <div style={styles.mapCol}>
            <div style={styles.mapHeader}>
              <span style={styles.mapTitle}>📍 Listing locations</span>
              <span style={styles.mapSub}>Search a place, click the map, or use GPS</span>
            </div>

            {/* Location search + history */}
            <div style={styles.mapSearchRow}>
              <div style={{ position: "relative", flex: 1 }} ref={historyRef}>
                <input
                  type="text"
                  placeholder="🔍 Search location e.g. Delhi, Noida, Mumbai..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  onKeyDown={handleLocationKeyDown}
                  onFocus={() => locationHistory.length > 0 && setShowHistory(true)}
                  style={styles.mapSearchInput}
                />

                {/* History dropdown */}
                {showHistory && locationHistory.length > 0 && (
                  <div style={styles.historyDropdown}>
                    <div style={styles.historyHeader}>
                      <span style={styles.historyLabel}>🕐 Recent locations</span>
                      <button style={styles.clearHistoryBtn} onClick={clearHistory}>Clear</button>
                    </div>
                    {locationHistory.map((h, i) => (
                      <button
                        key={i}
                        style={styles.historyItem}
                        onClick={() => {
                          pinLocation(h.lat, h.lng, h.name);
                          setLocationSearch("");
                        }}
                      >
                        <span style={styles.historyIcon}>📍</span>
                        <span style={styles.historyName}>{h.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleLocationSearch}
                style={styles.mapSearchBtn}
                disabled={searching}
              >
                {searching ? "…" : "Go"}
              </button>

              {/* History toggle button */}
              {locationHistory.length > 0 && (
                <button
                  style={styles.historyToggleBtn}
                  onClick={() => setShowHistory((v) => !v)}
                  title="Recent locations"
                >
                  🕐
                </button>
              )}
            </div>
            {searchError && <p style={styles.searchErr}>{searchError}</p>}

            {/* GPS + active pin display */}
            <div style={styles.gpsRow}>
              <button onClick={getLocation} style={styles.gpsBtn} disabled={locating}>
                {locating ? "📡 Detecting…" : "📍 Use My Location"}
              </button>
              {locError && <span style={styles.locError}>{locError}</span>}
              {activePin && (
                <span style={styles.activePinLabel}>
                  📌 {activePin.name}
                </span>
              )}
            </div>

            <MapContainer center={[28.6139, 77.2090]} zoom={5} style={styles.mapIframe}>
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FlyToLocation position={activePin} />
              <ClickToMark onMapClick={handleMapClick} />

              {/* Listing markers */}
              {filtered.map((person) =>
                person.location?.lat ? (
                  <Marker key={person._id} position={[person.location.lat, person.location.lng]}>
                    <Popup>
                      <strong>{person.name}</strong><br />₹{person.budget}
                    </Popup>
                  </Marker>
                ) : null
              )}

              {/* Active pin marker */}
              {activePin?.lat && (
                <Marker position={[activePin.lat, activePin.lng]}>
                  <Popup>📌 {activePin.name}</Popup>
                </Marker>
              )}
            </MapContainer>

            <p style={styles.mapNote}>
              💡 Type a city and press Enter, or click anywhere on the map to pin a location
            </p>
          </div>

        </div>
      </div>

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
  searchRow: { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" },
  searchInput: {
    flex: 1, minWidth: "220px", border: "1px solid #e0e0e0", borderRadius: "8px",
    padding: "11px 16px", fontSize: "14px", fontFamily: "inherit", outline: "none",
    backgroundColor: "#fff", color: "#1a1a2e",
  },
  sortSelect: {
    border: "1px solid #e0e0e0", borderRadius: "8px", padding: "11px 14px",
    fontSize: "14px", fontFamily: "inherit", outline: "none",
    backgroundColor: "#fff", color: "#1a1a2e", cursor: "pointer",
  },
  filtersRow: {
    display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px",
    marginBottom: "20px", padding: "14px 16px", background: "#fff",
    border: "1px solid #e5e5e5", borderRadius: "12px",
  },
  filterLabel: { fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginRight: "4px" },
  filterDivider: { width: "1px", height: "20px", background: "#e5e5e5", margin: "0 4px" },
  chip: {
    background: "#f3f3f3", color: "#555", border: "1px solid #e5e5e5",
    padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
  },
  chipActive: { background: "#5c4fcf", color: "#fff", border: "1px solid #5c4fcf", fontWeight: 700 },
  clearBtn: {
    background: "none", color: "#a33030", border: "1px solid #f5c0c0",
    padding: "6px 12px", borderRadius: "20px", fontSize: "12px",
    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
  resultsBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  resultsText: { fontSize: "14px", fontWeight: 600, color: "#1a1a2e" },
  postBtn: {
    background: "#5c4fcf", color: "#fff", border: "none", padding: "10px 20px",
    borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
  mainLayout: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" },
  listingsCol: { display: "flex", flexDirection: "column", gap: "16px", maxHeight: "80vh", overflowY: "auto", paddingRight: "8px" },
  mapCol: {
    position: "sticky", top: "90px", background: "#fff",
    border: "1px solid #e5e5e5", borderRadius: "16px", overflow: "hidden",
  },
  mapHeader: { padding: "14px 16px", borderBottom: "1px solid #e5e5e5" },
  mapTitle: { fontSize: "14px", fontWeight: 700, color: "#1a1a2e", display: "block" },
  mapSub: { fontSize: "12px", color: "#888", marginTop: "2px", display: "block" },

  // Map search
  mapSearchRow: {
    display: "flex", gap: "8px", padding: "10px 16px",
    borderBottom: "1px solid #f0f0f0", background: "#fafafa", position: "relative",
  },
  mapSearchInput: {
    width: "100%", border: "1px solid #e0e0e0", borderRadius: "8px",
    padding: "8px 12px", fontSize: "13px", fontFamily: "inherit",
    outline: "none", backgroundColor: "#fff", color: "#1a1a2e", boxSizing: "border-box",
  },
  mapSearchBtn: {
    background: "#5c4fcf", color: "#fff", border: "none",
    borderRadius: "8px", padding: "8px 16px", fontSize: "13px",
    fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
  },
  historyToggleBtn: {
    background: "#f0eeff", border: "1px solid #d5cff5", borderRadius: "8px",
    padding: "8px 10px", fontSize: "14px", cursor: "pointer", lineHeight: 1,
  },
  searchErr: { fontSize: "12px", color: "#a33030", margin: 0, padding: "4px 16px" },

  // History dropdown
  historyDropdown: {
    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
    background: "#fff", border: "1px solid #e5e5e5", borderRadius: "10px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 1000, overflow: "hidden",
  },
  historyHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 14px", borderBottom: "1px solid #f0f0f0", background: "#fafafa",
  },
  historyLabel: { fontSize: "11px", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" },
  clearHistoryBtn: {
    background: "none", border: "none", fontSize: "12px",
    color: "#a33030", cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
  },
  historyItem: {
    display: "flex", alignItems: "center", gap: "10px",
    width: "100%", padding: "9px 14px", border: "none",
    background: "none", textAlign: "left", cursor: "pointer",
    fontFamily: "inherit", borderBottom: "1px solid #f5f5f5",
    transition: "background 0.1s",
  },
  historyIcon: { fontSize: "14px", flexShrink: 0 },
  historyName: { fontSize: "13px", color: "#1a1a2e", fontWeight: 500 },

  // GPS row
  gpsRow: {
    display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
    padding: "8px 16px", borderBottom: "1px solid #f0f0f0", background: "#fafafa",
  },
  gpsBtn: {
    background: "#5c4fcf", color: "#fff", border: "none", borderRadius: "8px",
    padding: "7px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
  locError: { fontSize: "12px", color: "#a33030" },
  activePinLabel: {
    fontSize: "12px", color: "#5c4fcf", fontWeight: 600,
    background: "#f0eeff", padding: "4px 10px", borderRadius: "20px",
  },

  mapIframe: { width: "100%", height: "340px", border: "none", display: "block" },
  mapNote: { padding: "8px 16px", fontSize: "11px", color: "#aaa", borderTop: "1px solid #f0f0f0" },
  stateMsg: { textAlign: "center", color: "#888", fontSize: "15px", padding: "60px 0" },
  errorMsg: { textAlign: "center", color: "#a33030", fontSize: "14px", padding: "40px 0" },
};

export default FindFlatmate;