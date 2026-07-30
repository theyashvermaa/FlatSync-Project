import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useLocation } from 'react-router-dom';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { X, Search, Map, List, MapPin, Sparkles, Building, Lock, Info, Eye, EyeOff, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MatchScoreBadge from '../components/MatchScoreBadge';
import { calculateCompatibility } from '../utils/compatibility';
import ProfileNudgeBanner from '../components/ProfileNudgeBanner';

const mapContainerStyle = { width: '100%', height: '100%', minHeight: '500px' };
const center = { lat: 28.6139, lng: 77.2090 };

const defaultMarkerIcon = L.divIcon({
  html: `
    <div class="flex items-center justify-center">
      <div class="relative w-7 h-7">
        <div class="relative flex items-center justify-center w-7 h-7 bg-rose-500 rounded-full border-2 border-white shadow-md text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
      </div>
    </div>
  `,
  className: 'flat-default-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

const activeMarkerIcon = L.divIcon({
  html: `
    <div class="flex items-center justify-center">
      <div class="relative w-9 h-9">
        <span class="absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 animate-ping"></span>
        <div class="relative flex items-center justify-center w-9 h-9 bg-primary-600 rounded-full border-2 border-white shadow-xl text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/></svg>
        </div>
      </div>
    </div>
  `,
  className: 'flat-active-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

const pinnedMarkerIcon = L.divIcon({
  html: `
    <div class="flex items-center justify-center">
      <div class="relative w-8 h-8">
        <span class="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping"></span>
        <div class="relative flex items-center justify-center w-8 h-8 bg-amber-500 rounded-full border-2 border-white shadow-xl text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
    </div>
  `,
  className: 'user-pinned-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

function MapController({ center }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [map]);

  useEffect(() => {
    if (center && map) {
      const targetZoom = map.getZoom() < 15 ? 15 : map.getZoom();
      map.setView([center.lat, center.lng], targetZoom);
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const CircularArrowsMagnifierLoader = ({ title = "Fetching listings..." }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center mt-8 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all duration-300">
    <div className="relative w-24 h-24 flex items-center justify-center mb-6">
      <svg
        className="absolute inset-0 w-full h-full animate-spin text-primary-500"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 50 14 A 36 36 0 0 1 86 50"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M 79 43 L 86 51 L 92 43"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 50 86 A 36 36 0 0 1 14 50"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M 8 57 L 14 49 L 21 57"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="relative z-10 p-3.5 bg-white dark:bg-zinc-900 rounded-full shadow-md border border-gray-100 dark:border-zinc-800 flex items-center justify-center">
        <Search className="w-8 h-8 text-primary-600 dark:text-primary-400" />
      </div>
    </div>
    <h3 className="text-xl font-extrabold text-gray-900 dark:text-zinc-100 mb-1 tracking-tight animate-pulse">
      {title}
    </h3>
    <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500">
      Locating available places & checking compatibility...
    </p>
  </div>
);

const FindFlat = () => {
  const [listings, setListings] = useState([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [location, setLocation] = useState(center);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [activeListing, setActiveListing] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedModalPhotoIdx, setSelectedModalPhotoIdx] = useState(0);
  const [reqStatus, setReqStatus] = useState({});
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [mobileTab, setMobileTab] = useState('list');
  
  // Fullscreen Lightbox Photo state
  const [lightboxPhotos, setLightboxPhotos] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const { user } = useAuth();

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const isLocationSelectedRef = useRef(false);

  const [initialLocation, setInitialLocation] = useState(center);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const currentLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setInitialLocation(currentLoc);
          setLocation(currentLoc);
          fetchListings(currentLoc.lat, currentLoc.lng, '');
        },
        () => {
          fetchListings(null, null, '');
        }
      );
    } else {
      fetchListings(null, null, '');
    }
  }, []);

  const fetchListings = async (lat = null, lng = null, searchKeyword = null) => {
    setIsLoadingListings(true);
    try {
      let url = '/listings';
      const params = new URLSearchParams();
      if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
        params.append('lat', lat);
        params.append('lng', lng);
        params.append('radius', '40');
      }
      const q = searchKeyword !== null ? searchKeyword : searchText;
      if (q && q.trim()) {
        params.append('search', q.trim());
      }
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      const { data } = await api.get(url);
      setListings(data);
      checkSentRequests();
    } catch {
      toast.error('Failed to load flats');
    } finally {
      setIsLoadingListings(false);
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    setPinnedLocation(null);
    if (initialLocation) {
      setLocation(initialLocation);
    }
    fetchListings(null, null, '');
  };

  const handleMapClick = async ({ lat, lng }) => {
    setPinnedLocation({ lat, lng });
    setLocation({ lat, lng });
    fetchListings(lat, lng, '');

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: { 'User-Agent': 'FlatSyncApp/1.0' }
      });
      const data = await res.json();
      if (data && data.display_name) {
        setSearchText(data.display_name);
        const namePart = data.display_name.split(',')[0];
        toast.success(`Pinned location: ${namePart}! Fetching nearby flats...`, { id: 'pinned-loc' });
      }
    } catch {
      toast.success('Pinned location on map!', { id: 'pinned-loc' });
    }
  };

  const checkSentRequests = async () => {
    try {
      const { data } = await api.get('/requests/outgoing');
      const statuses = {};
      data.forEach(req => statuses[req.listingId._id] = req.status);
      setReqStatus(statuses);
    } catch (e) { console.error(e); }
  };

  const handleSendRequest = async (listingId) => {
    try {
      await api.post('/requests/send', { listingId });
      toast.success('Request Sent!');
      setReqStatus(prev => ({ ...prev, [listingId]: 'pending' }));
      setSelectedListing(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending request');
    }
  };

  // Nominatim search suggestions
  useEffect(() => {
    if (!searchText || searchText.length < 3 || isLocationSelectedRef.current) {
      setSearchResults([]);
      isLocationSelectedRef.current = false;
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=5&addressdetails=1`,
          { headers: { 'User-Agent': 'FlatSyncApp/1.0' } }
        );
        const data = await response.json();
        setSearchResults(data.map(item => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon)
        })));
      } catch (err) {
        console.error("Geocoding error", err);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const filledPrefsCount = user?.preferences ? Object.values(user.preferences).filter(v => v && v !== '').length : 0;
  const isProfileIncomplete = filledPrefsCount < 3;

  // Filter out the logged-in user's own flat listing from the browse feed & map
  const displayListings = listings.filter((item) => {
    if (!user) return true;
    const ownerId = item.owner?._id || item.owner;
    if (!ownerId) return true;
    return ownerId.toString() !== user._id.toString();
  });

  const renderGridListingCard = (item) => {
    const compScore = user?.preferences && item.owner?.preferences
      ? calculateCompatibility(user.preferences, item.owner.preferences)
      : null;

    const isActive = activeListing === item._id;

    return (
      <div
        key={item._id}
        id={`card-${item._id}`}
        className={`bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer ${isActive ? 'border-primary-500 ring-2 ring-primary-500/40 shadow-primary-500/10' : 'border-gray-100 dark:border-zinc-800'}`}
        onClick={() => {
          setActiveListing(item._id);
          if (item.location?.coordinates) {
            setLocation({ lat: item.location.coordinates[1], lng: item.location.coordinates[0] });
          }
          setSelectedModalPhotoIdx(0);
          setSelectedListing(item);
        }}
      >
        <div
          className="relative h-56 sm:h-60 overflow-hidden bg-gray-100 dark:bg-zinc-850 cursor-pointer group/img"
          onClick={(e) => {
            e.stopPropagation();
            if (item.photoUrls && item.photoUrls.length > 0) {
              setLightboxPhotos(item.photoUrls);
              setActivePhotoIdx(0);
            }
          }}
        >
          <img
            src={(item.photoUrls && item.photoUrls.length > 0) ? item.photoUrls[0] : 'https://via.placeholder.com/400x300'}
            alt="flat"
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
          />

          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-gray-950/85 text-[#60A5FA] text-xs font-extrabold px-3.5 py-2 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-xl border border-[#60A5FA]/40">
              <Maximize2 className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>View Full Photo</span>
            </span>
          </div>

          <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-primary-700 dark:text-primary-400 shadow-sm border border-gray-100/10">
            {item.vacancyCount} Spot{item.vacancyCount > 1 ? 's' : ''} Open
          </div>

          {compScore !== null && (
            <div className="absolute top-3 right-3 z-10 group/badge" onClick={(e) => e.stopPropagation()}>
              <div className="bg-primary-600/95 dark:bg-primary-600/95 text-white px-2.5 py-1 rounded-xl text-[11px] font-extrabold shadow-md flex items-center gap-1.5 cursor-help">
                <span>{compScore}% Habit Match</span>
                <Info className="w-3.5 h-3.5 text-primary-200 shrink-0" />
              </div>

              {/* Hover Tooltip */}
              <div className="pointer-events-none opacity-0 group-hover/badge:opacity-100 group-hover/badge:pointer-events-auto transition-all duration-200 absolute top-full right-0 mt-1.5 w-64 p-3 bg-gray-900/95 dark:bg-zinc-900/95 text-white text-[11px] rounded-xl shadow-2xl border border-gray-700/80 z-[1002] leading-relaxed text-left">
                <p className="font-extrabold text-amber-300 mb-1 flex items-center gap-1 text-xs">
                  <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>Habit Match Score</span>
                </p>
                <p className="text-gray-300 mb-2 leading-normal">
                  Calculated instantly based on 10 shared lifestyle habits (food, sleep, cleanliness, etc.).
                </p>
                <div className="pt-1.5 border-t border-gray-700/60 text-primary-300 font-semibold leading-normal">
                  💡 Tip: Click <strong>"View Details"</strong> for full AI Match Score & breakdown!
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1 text-left">
          <h3 className="font-extrabold text-gray-900 dark:text-zinc-100 text-lg mb-1 truncate">
            {item.owner?.name || item.fullName}'s Flat
          </h3>
          {item.rentAmount && (
            <p className="text-sm font-black text-primary-600 dark:text-primary-400 mb-1">
              ₹{item.rentAmount} / month
            </p>
          )}
          <p className="text-gray-500 dark:text-zinc-400 text-xs mb-4 line-clamp-2 min-h-[2rem]">
            {item.address}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-zinc-800/50">
            <span className="text-xs font-bold text-gray-400 dark:text-zinc-500">
              Age preference: {item.owner?.preferences?.agePreference || item.agePreference || (typeof item.age === 'number' ? `${item.age} yrs` : item.age) || 'Any Age'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedModalPhotoIdx(0);
                setSelectedListing(item);
              }}
              className="text-xs bg-primary-600 hover:bg-primary-500 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLightboxModal = () => {
    if (!lightboxPhotos || lightboxPhotos.length === 0) return null;
    const currentPhoto = lightboxPhotos[activePhotoIdx] || lightboxPhotos[0];

    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[10000] flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between z-10 max-w-6xl w-full mx-auto">
          <span className="text-gray-900 font-black text-xs sm:text-sm bg-white/90 px-4 py-2 rounded-full backdrop-blur-md shadow-xl border border-white/60">
            Photo {activePhotoIdx + 1} of {lightboxPhotos.length}
          </span>
          <button
            onClick={() => setLightboxPhotos(null)}
            className="p-2.5 text-gray-900 dark:text-zinc-100 hover:text-primary-600 bg-white/90 hover:bg-white rounded-full transition cursor-pointer shadow-xl border border-white/40"
            title="Close Fullscreen View"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Main Photo View Stage */}
        <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden max-w-6xl w-full mx-auto">
          {lightboxPhotos.length > 1 && (
            <button
              onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? lightboxPhotos.length - 1 : prev - 1))}
              className="absolute left-2 sm:left-6 z-20 p-3 text-gray-900 bg-white/90 hover:bg-white rounded-full backdrop-blur-md transition cursor-pointer shadow-2xl border border-white/60 hover:scale-110"
              title="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
          )}

          <img
            src={currentPhoto}
            alt="Flat preview"
            className="max-h-[78vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl border border-white/10"
          />

          {lightboxPhotos.length > 1 && (
            <button
              onClick={() => setActivePhotoIdx((prev) => (prev === lightboxPhotos.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 sm:right-6 z-20 p-3 text-gray-900 bg-white/90 hover:bg-white rounded-full backdrop-blur-md transition cursor-pointer shadow-2xl border border-white/60 hover:scale-110"
              title="Next Photo"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        {lightboxPhotos.length > 1 && (
          <div className="flex justify-center items-center gap-2.5 overflow-x-auto py-2 z-10 max-w-6xl w-full mx-auto custom-scrollbar">
            {lightboxPhotos.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="thumb"
                onClick={() => setActivePhotoIdx(idx)}
                className={`w-16 h-12 sm:w-20 sm:h-14 object-cover rounded-xl cursor-pointer transition-all ${
                  activePhotoIdx === idx
                    ? 'ring-2 ring-primary-500 scale-105 opacity-100 border border-white'
                    : 'opacity-50 hover:opacity-90'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDetailsModal = () => {
    if (!selectedListing) return null;
    const isOwner = user && (selectedListing.owner?._id === user._id || selectedListing.owner === user._id);
    const hasRequested = reqStatus[selectedListing._id];

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-zinc-800 p-6 relative flex flex-col gap-6 text-left my-auto">
          
          <button
            onClick={() => setSelectedListing(null)}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 bg-gray-100 dark:bg-zinc-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header info */}
          <div className="flex items-start gap-4 pr-10">
            <img
              src={selectedListing.owner?.photoUrl || 'https://via.placeholder.com/60'}
              alt="Owner"
              className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-100 dark:border-zinc-800"
            />
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-zinc-100">
                {selectedListing.owner?.name || selectedListing.fullName}'s Flat
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium mt-0.5">
                Posted by {selectedListing.owner?.name || 'Flat Owner'}
              </p>
              {selectedListing.rentAmount && (
                <p className="text-lg font-black text-primary-600 dark:text-primary-400 mt-1">
                  ₹{selectedListing.rentAmount} / month
                </p>
              )}
            </div>
          </div>

          {/* Featured Image + Thumbnail Grid (NO internal scrollbars) */}
          {selectedListing.photoUrls && selectedListing.photoUrls.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div
                className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden cursor-pointer group/modalimg shadow-md border border-gray-100 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-850"
                onClick={() => {
                  setLightboxPhotos(selectedListing.photoUrls);
                  setActivePhotoIdx(selectedModalPhotoIdx);
                }}
              >
                <img
                  src={selectedListing.photoUrls[selectedModalPhotoIdx] || selectedListing.photoUrls[0]}
                  alt="Flat main"
                  className="w-full h-full object-cover group-hover/modalimg:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/modalimg:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-gray-950/85 text-[#60A5FA] text-xs font-extrabold px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 shadow-xl border border-[#60A5FA]/40">
                    <Maximize2 className="w-4 h-4 text-[#60A5FA]" />
                    <span>View Full Photo</span>
                  </span>
                </div>
              </div>

              {/* Thumbnails row */}
              {selectedListing.photoUrls.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                  {selectedListing.photoUrls.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedModalPhotoIdx(idx)}
                      className={`h-16 sm:h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedModalPhotoIdx === idx
                          ? 'border-primary-500 ring-2 ring-primary-500/30 scale-105'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Location & Details */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-gray-900 dark:text-zinc-100 text-sm">Location</h4>
            <p className="text-sm text-gray-600 dark:text-zinc-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
              <span>{selectedListing.address}</span>
            </p>
          </div>

          {/* AI Compatibility Badge Card */}
          {!isOwner && (
            <div className="bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-zinc-850 dark:to-zinc-900 p-4 rounded-2xl border border-primary-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h4 className="font-extrabold text-gray-900 dark:text-zinc-100 text-sm">AI Match Compatibility</h4>
                </div>
              </div>
              <MatchScoreBadge listingId={selectedListing._id} listingOwnerId={selectedListing.owner?._id || selectedListing.owner} />
            </div>
          )}

          {/* Listing Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 dark:bg-zinc-850 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 text-xs">
            <div>
              <span className="text-gray-400 dark:text-zinc-500 font-medium">Spots Open</span>
              <p className="font-extrabold text-gray-900 dark:text-zinc-100 text-sm mt-0.5">{selectedListing.vacancyCount}</p>
            </div>
            <div>
              <span className="text-gray-400 dark:text-zinc-500 font-medium">Age Preference</span>
              <p className="font-extrabold text-gray-900 dark:text-zinc-100 text-sm mt-0.5">{selectedListing.owner?.preferences?.agePreference || selectedListing.agePreference || (typeof selectedListing.age === 'number' ? `${selectedListing.age} yrs` : selectedListing.age) || 'Any Age'}</p>
            </div>
            <div>
              <span className="text-gray-400 dark:text-zinc-500 font-medium">Occupancy</span>
              <p className="font-extrabold text-gray-900 dark:text-zinc-100 text-sm mt-0.5">{selectedListing.occupancy || 'Shared'}</p>
            </div>
          </div>

          {/* Description */}
          {selectedListing.aboutFlat && (
            <div className="flex flex-col gap-1.5">
              <h4 className="font-bold text-gray-900 dark:text-zinc-100 text-sm">About the Flat</h4>
              <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">{selectedListing.aboutFlat}</p>
            </div>
          )}

          {/* Preferences */}
          {selectedListing.owner?.preferences && (
            <div className="flex flex-col gap-2.5">
              <h4 className="font-bold text-gray-900 dark:text-zinc-100 text-sm">Owner Preferences</h4>
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(selectedListing.owner.preferences).map(([key, val]) => {
                  if (!val) return null;
                  const formattedKey = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase());
                  return (
                    <span key={key} className="px-3.5 py-2 bg-gray-100 dark:bg-zinc-800/90 text-gray-800 dark:text-zinc-200 rounded-xl text-sm font-bold border border-gray-200/60 dark:border-zinc-700/60 shadow-xs">
                      {formattedKey}: <strong className="text-primary-600 dark:text-primary-400 font-extrabold">{val}</strong>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button */}
          {!isOwner && (
            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
              {hasRequested ? (
                <button disabled className="w-full sm:w-auto px-6 py-3 bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 font-extrabold rounded-2xl text-sm cursor-not-allowed">
                  Request Sent ({hasRequested})
                </button>
              ) : (
                <button
                  onClick={() => handleSendRequest(selectedListing._id)}
                  className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-extrabold rounded-2xl text-sm transition shadow-lg shadow-primary-600/30"
                >
                  Send Contact Request
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-zinc-950 min-h-[calc(100vh-64px)] flex flex-col transition-colors duration-200 relative overflow-hidden">
      
      {/* ── TOP HEADER & LOCATION SEARCH CONTROLS ── */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-4 z-20 shadow-xs shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100 tracking-tight">
              Browse & Match Using AI
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 text-xs mt-0.5">
              Explore User-Posted Flat Vacancies And See Your AI Compatibility Score With A Single Click.
            </p>
          </div>

          {/* Search Box & Map Toggle Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto relative">
            <div className="relative flex-1 md:w-80 lg:w-96">
              <div className="w-full bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 flex items-center px-3.5 py-2 shadow-xs focus-within:ring-2 focus-within:ring-primary-500/40 transition-all">
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search locality or city..."
                  value={searchText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchText(val);
                    if (!val.trim()) {
                      handleClearSearch();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchResults.length > 0) {
                      const first = searchResults[0];
                      isLocationSelectedRef.current = true;
                      setLocation({ lat: first.lat, lng: first.lon });
                      setPinnedLocation({ lat: first.lat, lng: first.lon });
                      fetchListings(first.lat, first.lon, first.display_name);
                      setSearchText(first.display_name);
                      setSearchResults([]);
                    }
                  }}
                  className="w-full bg-transparent outline-none text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 text-xs sm:text-sm font-medium border-0 focus:ring-0"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors ml-1 cursor-pointer shrink-0"
                    title="Clear location search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {isSearching && (
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin ml-2 shrink-0"></div>
                )}
              </div>

              {/* Nominatim Search Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-14 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-[1005] text-left">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        isLocationSelectedRef.current = true;
                        setLocation({ lat: result.lat, lng: result.lon });
                        setPinnedLocation({ lat: result.lat, lng: result.lon });
                        fetchListings(result.lat, result.lon, result.display_name);
                        setSearchText(result.display_name);
                        setSearchResults([]);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 border-b border-gray-100 dark:border-zinc-800 last:border-b-0 text-xs sm:text-sm text-gray-800 dark:text-zinc-200 transition-colors truncate"
                    >
                      {result.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Map Toggle Pill Button */}
            <button
              onClick={() => setIsMapVisible(!isMapVisible)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-primary-600/20 transition-all shrink-0 cursor-pointer"
            >
              {isMapVisible ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Hide Map</span>
                </>
              ) : (
                <>
                  <Map className="w-4 h-4" />
                  <span>Show Map</span>
                </>
              )}
            </button>

            {/* Mobile Tab Switcher Pill Button */}
            <div className="md:hidden flex items-center bg-gray-100 dark:bg-zinc-800 rounded-2xl p-1 shrink-0">
              <button
                onClick={() => setMobileTab('list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${mobileTab === 'list' ? 'bg-primary-600 text-white shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
              >
                Listings ({displayListings.length})
              </button>
              <button
                onClick={() => setMobileTab('map')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${mobileTab === 'map' ? 'bg-primary-600 text-white shadow-xs' : 'text-gray-600 dark:text-zinc-400'}`}
              >
                Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT (SPLIT VIEW vs EXPANDED GRID) ── */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        
        {/* ── LISTINGS FEED (Left panel) ── */}
        <div
          className={`overflow-y-auto p-4 sm:p-6 transition-all duration-300 custom-scrollbar h-full ${
            isMapVisible ? 'md:w-1/2 lg:w-7/12' : 'w-full max-w-7xl mx-auto'
          } ${mobileTab === 'map' ? 'hidden md:block' : 'block w-full'}`}
        >
          {isProfileIncomplete && ProfileNudgeBanner && <ProfileNudgeBanner />}

          {isLoadingListings ? (
            <CircularArrowsMagnifierLoader title="Fetching flat vacancies near location..." />
          ) : displayListings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm my-6 max-w-md mx-auto px-6">
              <div className="w-14 h-14 bg-primary-50 dark:bg-primary-950/50 rounded-3xl flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-4 border border-primary-100 dark:border-primary-900/50">
                <Building className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-zinc-100 mb-2">No Listings in this Location</h3>
              <p className="text-gray-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
                No flat vacancies found near <strong className="text-gray-800 dark:text-zinc-200">{searchText.split(',')[0] || 'your pinned location'}</strong>. Try clicking another location on the map or search above!
              </p>
            </div>
          ) : (
            <div
              className={`grid gap-5 ${
                isMapVisible
                  ? 'grid-cols-1 xl:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {displayListings.map(item => renderGridListingCard(item))}
            </div>
          )}
        </div>

        {/* ── INTERACTIVE FULL-HEIGHT MAP PANEL (Right panel) ── */}
        {(isMapVisible || mobileTab === 'map') && (
          <div
            className={`md:w-1/2 lg:w-5/12 h-full min-h-[500px] relative z-0 border-l border-gray-200/80 dark:border-zinc-800/80 ${
              mobileTab === 'list' ? 'hidden md:flex flex-col' : 'flex flex-col w-full h-full min-h-[500px]'
            }`}
          >
            {/* Subheading Callout Badge inside Map Header */}
            <div className="absolute top-3 left-3 right-3 z-[1000] px-3 py-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-md border border-gray-200/80 dark:border-zinc-800 text-xs font-semibold text-gray-700 dark:text-zinc-300 text-left flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
              <span className="truncate">💡 Click ANY location on map to pin & see flats in real-time!</span>
            </div>



            {/* Leaflet Map filling full vertical space */}
            <MapContainer
              style={mapContainerStyle}
              center={[location.lat, location.lng]}
              zoom={15}
              zoomControl={true}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                maxZoom={20}
              />

              <MapClickHandler onMapClick={handleMapClick} />

              {/* Pinned location marker */}
              {pinnedLocation && (
                <Marker position={[pinnedLocation.lat, pinnedLocation.lng]} icon={pinnedMarkerIcon} />
              )}

              {displayListings.map((item) => (
                <Marker
                  key={item._id}
                  position={[item.location.coordinates[1], item.location.coordinates[0]]}
                  eventHandlers={{
                    click: () => {
                      setActiveListing(item._id);
                      if (item.location?.coordinates) {
                        setLocation({ lat: item.location.coordinates[1], lng: item.location.coordinates[0] });
                      }
                      const cardEl = document.getElementById(`card-${item._id}`);
                      if (cardEl) {
                        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }
                  }}
                  icon={activeListing === item._id ? activeMarkerIcon : defaultMarkerIcon}
                />
              ))}
              <MapController center={location} />
            </MapContainer>
          </div>
        )}
      </div>

      {selectedListing && renderDetailsModal()}
      {renderLightboxModal()}
    </div>
  );
};

export default FindFlat;
