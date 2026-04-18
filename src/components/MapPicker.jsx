// src/components/MapPicker.jsx
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix broken marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 14);
  }, [position, map]);
  return null;
}

function ClickMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function MapPicker({ setPosition }) {
  const [localPos, setLocalPos] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  const handleSet = (pos) => {
    setLocalPos(pos);
    setPosition(pos);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleSet({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocError("Could not get location. Please allow location access.");
        setLocating(false);
      }
    );
  };

  return (
    <div style={styles.wrapper}>
      <button type="button" onClick={handleGPS} style={styles.gpsBtn} disabled={locating}>
        {locating ? "📡 Detecting…" : "📍 Use My Location"}
      </button>

      {locError && <p style={styles.error}>{locError}</p>}
      {localPos && (
        <p style={styles.coords}>
          ✅ Selected: {localPos.lat.toFixed(5)}, {localPos.lng.toFixed(5)}
        </p>
      )}

      <MapContainer center={[28.6139, 77.209]} zoom={5} style={styles.map}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickMarker position={localPos} setPosition={handleSet} />
        {localPos && <FlyTo position={localPos} />}
      </MapContainer>

      <p style={styles.hint}>Click the map to pin your location, or use the button above.</p>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: "8px" },
  gpsBtn: {
    backgroundColor: "#5c4fcf", color: "#fff",
    border: "none", borderRadius: "8px",
    padding: "10px 16px", fontSize: "14px",
    fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit", alignSelf: "flex-start",
  },
  map: { width: "100%", height: "260px", borderRadius: "10px", zIndex: 0 },
  coords: { fontSize: "12px", color: "#4a7c59", margin: 0, fontWeight: 600 },
  error: { fontSize: "12px", color: "#a33030", margin: 0 },
  hint: { fontSize: "11px", color: "#aaa", margin: 0 },
};