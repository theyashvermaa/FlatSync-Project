import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { X, MapPin, Upload, PlusCircle, Search, Home, DollarSign, Calendar, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const customMarkerIcon = L.divIcon({
  html: `
    <div class="flex items-center justify-center">
      <div class="relative w-8 h-8">
        <span class="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping"></span>
        <div class="relative flex items-center justify-center w-8 h-8 bg-rose-600 rounded-full border-2 border-white shadow-lg text-white text-xs">
          📍
        </div>
      </div>
    </div>
  `,
  className: 'custom-marker-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

function MapController({ center, onMapClick }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      const targetZoom = map.getZoom() < 16 ? 16 : map.getZoom();
      map.setView([center.lat, center.lng], targetZoom);
    }
  }, [center, map]);

  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });

  return null;
}

const defaultCenter = { lat: 28.6139, lng: 77.2090 };

const ListingModal = ({ isOpen, onClose, initialListing = null, onSaveSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialListing && initialListing._id);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    address: '',
    age: '',
    aboutYourself: '',
    nearbyPlaces: '',
    facilities: '',
    restrictions: '',
    flatmatePreferences: '',
    vacancyCount: 1,
    rentAmount: '',
    moveInDate: '',
    photos: []
  });

  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [mapLocation, setMapLocation] = useState(defaultCenter);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const isLocationSelectedRef = useRef(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialListing) {
      setFormData({
        fullName: initialListing.fullName || user?.name || '',
        email: initialListing.email || user?.email || '',
        mobileNumber: initialListing.mobileNumber || user?.mobileNumber || '',
        address: initialListing.address || user?.address || '',
        age: initialListing.age || user?.age || '',
        aboutYourself: initialListing.aboutYourself || user?.aboutMe || '',
        nearbyPlaces: initialListing.nearbyPlaces || '',
        facilities: initialListing.facilities || '',
        restrictions: initialListing.restrictions || '',
        flatmatePreferences: initialListing.flatmatePreferences || '',
        vacancyCount: initialListing.vacancyCount || 1,
        rentAmount: initialListing.rentAmount || '',
        moveInDate: initialListing.moveInDate ? initialListing.moveInDate.split('T')[0] : '',
        photos: []
      });
      setPhotoPreviews(initialListing.photoUrls || []);

      if (initialListing.location && initialListing.location.coordinates) {
        setMapLocation({
          lat: initialListing.location.coordinates[1],
          lng: initialListing.location.coordinates[0]
        });
      }
    } else {
      setFormData({
        fullName: user?.name || '',
        email: user?.email || '',
        mobileNumber: user?.mobileNumber || '',
        address: user?.address || '',
        age: user?.age || '',
        aboutYourself: user?.aboutMe || '',
        nearbyPlaces: '',
        facilities: '',
        restrictions: '',
        flatmatePreferences: '',
        vacancyCount: 1,
        rentAmount: '',
        moveInDate: '',
        photos: []
      });
      setPhotoPreviews([]);
      setMapLocation(defaultCenter);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setMapLocation({ lat, lng });
            fetchAddressFromCoords(lat, lng);
          },
          (err) => console.log('Geolocation disabled/failed, using default center.', err)
        );
      }
    }
  }, [isOpen, initialListing, user]);

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.display_name) {
        isLocationSelectedRef.current = true;
        setFormData(prev => ({ ...prev, address: data.display_name }));
      }
    } catch (err) {
      console.error("Reverse geocoding error", err);
    }
  };

  const triggerNominatimSearch = (query) => {
    if (!query || query.length < 3 || isLocationSelectedRef.current) {
      setSearchResults([]);
      isLocationSelectedRef.current = false;
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
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
  };

  const onMapClick = useCallback((latlng) => {
    const { lat, lng } = latlng;
    setMapLocation({ lat, lng });
    fetchAddressFromCoords(lat, lng);
  }, []);

  const onMarkerDragEnd = (e) => {
    const marker = e.target;
    if (marker != null) {
      const latLng = marker.getLatLng();
      setMapLocation({ lat: latLng.lat, lng: latLng.lng });
      fetchAddressFromCoords(latLng.lat, latLng.lng);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, photos: files }));
    const previews = files.map(file => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'photos') {
          Array.from(formData.photos).forEach(file => {
            payload.append('photos', file);
          });
        } else if (formData[key] !== null && formData[key] !== undefined) {
          payload.append(key, formData[key]);
        }
      });
      payload.append('lat', mapLocation.lat);
      payload.append('lng', mapLocation.lng);

      let savedListing;
      if (isEditing) {
        const { data } = await api.put(`/listings/${initialListing._id}`, payload);
        savedListing = data;
        toast.success('Listing updated successfully!');
      } else {
        const { data } = await api.post('/listings', payload);
        savedListing = data;
        toast.success('Flat listing published successfully!');
      }

      if (onSaveSuccess) onSaveSuccess(savedListing, isEditing);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving listing');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-2xl">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
              {isEditing ? 'Edit Flat Listing' : 'Post New Flat Listing'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {isEditing ? 'Update details of your existing flat.' : 'List your flat to find flatmates or tenants faster.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Full Name / Owner Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                required
                value={formData.mobileNumber}
                onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Your Age *
              </label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
                className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Section 2: Rent & Vacancy */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Monthly Rent (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 12000"
                  value={formData.rentAmount}
                  onChange={e => setFormData({ ...formData, rentAmount: e.target.value })}
                  className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl pl-8 p-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Available Vacancies *
              </label>
              <select
                value={formData.vacancyCount}
                onChange={e => setFormData({ ...formData, vacancyCount: Number(e.target.value) })}
                className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value={1}>1 Spot Available</option>
                <option value={2}>2 Spots Available</option>
                <option value={3}>3+ Spots Available</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Available Move-in Date
              </label>
              <input
                type="date"
                value={formData.moveInDate}
                onChange={e => setFormData({ ...formData, moveInDate: e.target.value })}
                className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Section 3: Address & Location Pin */}
          <div className="flex flex-col gap-2 relative z-10">
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300">
              Address & Location Search *
            </label>
            <div className="relative">
              <div className="flex items-center border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Search address or enter full address..."
                  value={formData.address}
                  onChange={e => {
                    setFormData({ ...formData, address: e.target.value });
                    triggerNominatimSearch(e.target.value);
                  }}
                  className="w-full bg-transparent outline-none text-gray-900 dark:text-zinc-100 text-sm"
                />
                {isSearching && (
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin ml-2"></div>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-48 overflow-y-auto z-[99999] text-left">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        isLocationSelectedRef.current = true;
                        setMapLocation({ lat: result.lat, lng: result.lon });
                        setFormData({ ...formData, address: result.display_name });
                        setSearchResults([]);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 border-b border-gray-100 dark:border-zinc-800 last:border-b-0 text-xs sm:text-sm text-gray-800 dark:text-zinc-200 truncate"
                    >
                      {result.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map Preview */}
            <div className="h-56 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 mt-2 relative z-0">
              <MapContainer
                style={{ width: '100%', height: '100%' }}
                center={[mapLocation.lat, mapLocation.lng]}
                zoom={15}
                zoomControl={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <MapController center={mapLocation} onMapClick={onMapClick} />
                <Marker
                  position={[mapLocation.lat, mapLocation.lng]}
                  icon={customMarkerIcon}
                  draggable={true}
                  eventHandlers={{ dragend: onMarkerDragEnd }}
                />
              </MapContainer>
            </div>
            <p className="text-xs text-gray-400 dark:text-zinc-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary-500" /> Click on the map or drag the pin to set exact flat location.
            </p>
          </div>

          {/* Section 4: Details & Facilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                About the Flat & Yourself
              </label>
              <textarea
                rows="3"
                placeholder="Describe your flat environment, room layout, and bio..."
                value={formData.aboutYourself}
                onChange={e => setFormData({ ...formData, aboutYourself: e.target.value })}
                className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Facilities & Amenities
              </label>
              <textarea
                rows="3"
                placeholder="e.g. WiFi, AC, Washing Machine, Power Backup, Gym..."
                value={formData.facilities}
                onChange={e => setFormData({ ...formData, facilities: e.target.value })}
                className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Flatmate Preferences
              </label>
              <input
                type="text"
                placeholder="e.g. Working professional, Non-smoker, Quiet..."
                value={formData.flatmatePreferences}
                onChange={e => setFormData({ ...formData, flatmatePreferences: e.target.value })}
                className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Restrictions & Rules
              </label>
              <input
                type="text"
                placeholder="e.g. No late night music, Vegetarian only kitchen..."
                value={formData.restrictions}
                onChange={e => setFormData({ ...formData, restrictions: e.target.value })}
                className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Section 5: Photos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
              Flat Photos
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {photoPreviews.length > 0 && (
              <div className="flex gap-3 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                {photoPreviews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-zinc-800 flex-shrink-0"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary-500/30 transition disabled:opacity-50 text-sm flex items-center gap-2"
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Flat Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListingModal;
