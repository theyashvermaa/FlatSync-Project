import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { useLocation } from 'react-router-dom';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { X, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MatchScoreBadge from '../components/MatchScoreBadge';
import { calculateCompatibility } from '../utils/compatibility';

const libraries = ['places'];

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 28.6139, lng: 77.2090 };

const FindFlat = ({ defaultView }) => {
  const locationPath = useLocation();
  const currentView = defaultView || (locationPath.pathname === '/browse' ? 'browse' : (locationPath.pathname === '/matches' ? 'matches' : 'map'));

  const [listings, setListings] = useState([]);
  const [location, setLocation] = useState(center);
  const [activeListing, setActiveListing] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [reqStatus, setReqStatus] = useState({});
  const { user, isAuthenticated } = useAuth();

  const [autocomplete, setAutocomplete] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const currentLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(currentLoc);
          fetchListings(currentLoc.lat, currentLoc.lng);
        },
        () => {
          toast.error('Location access denied. Showing default area.');
          fetchListings(center.lat, center.lng);
        }
      );
    } else {
      fetchListings(center.lat, center.lng);
    }
  }, []);

  const fetchListings = async (lat, lng) => {
    try {
      const { data } = await api.get(`/listings?lat=${lat}&lng=${lng}`);
      setListings(data);
      checkSentRequests();
    } catch {
      toast.error('Failed to load flats');
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

  const onLoadAutocomplete = (ac) => {
    setAutocomplete(ac);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setLocation({ lat, lng });
        fetchListings(lat, lng);
      }
    }
  };

  // Preference completion status check
  const filledPrefsCount = user?.preferences ? Object.values(user.preferences).filter(v => v && v !== '').length : 0;
  const isProfileIncomplete = filledPrefsCount < 3;

  // Filter listings based on view type
  const filteredListings = currentView === 'matches'
    ? listings.filter(item => {
      if (!user?.preferences || !item.owner?.preferences) return false;
      // Don't show user's own listing in matches list
      const ownerId = item.owner._id || item.owner;
      if (ownerId.toString() === user._id.toString()) return false;
      return calculateCompatibility(user.preferences, item.owner.preferences) >= 50;
    })
    : listings;

  const renderGridListingCard = (item) => {
    const compScore = user?.preferences && item.owner?.preferences
      ? calculateCompatibility(user.preferences, item.owner.preferences)
      : null;

    return (
      <div
        key={item._id}
        className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer"
        onClick={() => setSelectedListing(item)}
      >
        <div className="relative h-48 overflow-hidden bg-gray-50 dark:bg-zinc-850">
          <img
            src={(item.photoUrls && item.photoUrls.length > 0) ? item.photoUrls[0] : 'https://via.placeholder.com/400x300'}
            alt="flat"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-primary-700 dark:text-primary-400 shadow-sm border border-gray-100/10">
            {item.vacancyCount} Spot{item.vacancyCount > 1 ? 's' : ''} Open
          </div>

          {compScore !== null && (
            <div className="absolute top-3 right-3 bg-primary-500/95 dark:bg-primary-600/95 text-white px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-md flex items-center gap-1">
              <span>✨</span> {compScore}% Match
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-extrabold text-gray-900 dark:text-zinc-100 text-lg mb-1 truncate">
            {item.owner?.name || item.fullName}'s Flat
          </h3>
          {item.rentAmount && (
            <p className="text-sm font-black text-primary-600 dark:text-primary-400 mb-1">
              ₹{item.rentAmount} / month
            </p>
          )}
          <p className="text-gray-505 text-gray-500 dark:text-zinc-400 text-xs mb-4 line-clamp-2 min-h-[2rem]">
            {item.address}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-zinc-800/50">
            <span className="text-xs font-bold text-gray-400 dark:text-zinc-500">
              Age preference: {item.age || 'Any'}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedListing(item); }}
              className="text-xs bg-primary-600 hover:bg-primary-500 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm font-semibold"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loadError) return <div className="p-10 text-center font-semibold text-rose-500">Map Loading Error: Please ensure you have a valid Google Maps API Key configured in your .env file.</div>;
  if (!isLoaded) return <div className="p-10 text-center font-semibold animate-pulse text-gray-500">Loading Map Engine...</div>;

  // Grid views: Browse or Matches
  if (currentView === 'browse' || currentView === 'matches') {
    return (
      <div className="flex-1 bg-gray-55 dark:bg-zinc-950 min-h-[calc(100vh-64px)] overflow-y-auto p-8 transition-colors duration-200">
        <div className="max-w-6xl mx-auto">
          {/* Search & Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="text-left">
              <h1 className="text-3xl font-black text-gray-900 dark:text-zinc-100">
                {currentView === 'browse' ? 'Browse Flat Vacancies' : 'Your Best Roommate Matches'}
              </h1>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
                {currentView === 'browse'
                  ? 'Explore all flat vacancies listed by users in the platform.'
                  : 'Listings sorted by your compatibility percentage based on profile habits.'}
              </p>
            </div>

            <div className="w-full md:max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden flex items-center px-4 py-2">
              <Search className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
              <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged} className="w-full">
                <input
                  type="text"
                  placeholder="Search location (e.g. Connaught Place)..."
                  className="w-full bg-transparent outline-none text-gray-700 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 font-medium text-sm border-0 focus:ring-0"
                />
              </Autocomplete>
            </div>
          </div>

          {/* Warning for incomplete profile in Matches */}
          {currentView === 'matches' && isProfileIncomplete && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-amber-800 dark:text-amber-300 text-sm font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>You haven't completed your lifestyle profile! Go to your profile page to fill in habits for more accurate match scores.</span>
            </div>
          )}

          {/* Grid Listings */}
          {filteredListings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm mt-8">
              <span className="text-5xl">🏠</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mt-4 mb-2">No flats found</h3>
              <p className="text-gray-500 dark:text-zinc-400 text-sm">
                {currentView === 'matches'
                  ? 'No listings meet the compatibility threshold. Try filling out more preferences.'
                  : 'Try searching for a different location in the box above.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map(item => renderGridListingCard(item))}
            </div>
          )}
        </div>

        {/* Details Modal Overlay */}
        {selectedListing && renderDetailsModal()}
      </div>
    );
  }

  // Classic Map View (default)
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
      <div className="w-[40%] bg-gray-50 dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
        {listings.length === 0 ? <p className="text-center text-gray-500 dark:text-zinc-400 mt-10">No flats found nearby.</p> :
          listings.map((item) => (
            <div
              key={item._id}
              className={`bg-white dark:bg-zinc-900 rounded-xl shadow-sm border p-4 cursor-pointer transition-all duration-200 ${activeListing === item._id ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-20' : 'border-gray-200 dark:border-zinc-800 hover:shadow-md'}`}
              onClick={() => setActiveListing(item._id)}
            >
              <div className="flex gap-4 animate-all">
                <img src={(item.photoUrls && item.photoUrls.length > 0) ? item.photoUrls[0] : 'https://via.placeholder.com/100'} alt="flat" className="w-24 h-24 rounded-lg object-cover bg-gray-100 dark:bg-zinc-850" />
                <div className="flex-1 min-w-0 flex flex-col text-left">
                  <h3 className="font-bold text-gray-900 dark:text-zinc-100 truncate">{item.owner?.name || item.fullName}'s Flat</h3>
                  {item.rentAmount && (
                    <p className="text-xs font-black text-primary-600 dark:text-primary-400 mb-1">
                      ₹{item.rentAmount} / month
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-zinc-400 truncate mb-auto pb-2">{item.address}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="inline-block px-2.5 py-1 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 text-xs font-bold rounded-lg mb-0.5">
                      {item.vacancyCount} Vacanc{item.vacancyCount > 1 ? 'ies' : 'y'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedListing(item); }}
                      className="text-xs bg-gray-900 dark:bg-zinc-800 text-white dark:text-zinc-200 px-3 py-1.5 rounded-lg hover:bg-gray-800 dark:hover:bg-zinc-700 transition shadow-sm font-semibold"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      <div className="w-[60%] relative">
        <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
          <div className="flex-1 max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-850 overflow-hidden flex items-center px-4 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
            <Autocomplete
              onLoad={onLoadAutocomplete}
              onPlaceChanged={onPlaceChanged}
              className="w-full"
            >
              <input
                type="text"
                placeholder="Search for a location (e.g., Connaught Place)..."
                className="w-full bg-transparent outline-none text-gray-700 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 font-medium text-sm border-0 focus:ring-0"
              />
            </Autocomplete>
          </div>
        </div>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={location}
          zoom={12}
          options={{ disableDefaultUI: true, zoomControl: true }}
        >
          {listings.map((item) => (
            <Marker
              key={item._id}
              position={{ lat: item.location.coordinates[1], lng: item.location.coordinates[0] }}
              onClick={() => {
                setActiveListing(item._id);
              }}
              icon={activeListing === item._id ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'}
            />
          ))}
        </GoogleMap>
      </div>

      {/* Details Modal Overlay */}
      {selectedListing && renderDetailsModal()}
    </div>
  );

  // Helper to render details modal cleanly
  function renderDetailsModal() {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden border border-gray-100 dark:border-zinc-800">
          <button onClick={() => setSelectedListing(null)} className="absolute top-4 right-4 bg-white/80 dark:bg-zinc-800/80 p-1.5 rounded-full z-10 hover:bg-white dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 transition">
            <X className="w-5 h-5" />
          </button>
          <div className="overflow-y-auto w-full custom-scrollbar">
            <div className="w-full flex overflow-x-auto snap-x custom-scrollbar">
              {selectedListing.photoUrls && selectedListing.photoUrls.length > 0 ? (
                selectedListing.photoUrls.map((url, i) => (
                  <img key={i} src={url} className="w-full h-64 md:h-80 object-cover flex-none snap-center" />
                ))
              ) : (
                <img src="https://via.placeholder.com/800x400" className="w-full h-64 md:h-80 object-cover flex-none snap-center" />
              )}
            </div>
            <div className="p-8 text-left">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{selectedListing.owner?.name || selectedListing.fullName}'s Place</h2>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">{selectedListing.address}</p>
                </div>
                <span className="bg-primary-100 dark:bg-primary-950/40 text-primary-800 dark:text-primary-400 font-bold px-3 py-1 rounded-full text-sm">
                  {selectedListing.vacancyCount} Spot{selectedListing.vacancyCount > 1 ? 's' : ''} Open
                </span>
              </div>

              {/* Rent & Move-In Date Details */}
              {(selectedListing.rentAmount || selectedListing.moveInDate) && (
                <div className="flex flex-wrap gap-4 mb-6">
                  {selectedListing.rentAmount && (
                    <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/30 px-4 py-2.5 rounded-xl text-left shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400">Monthly Rent</p>
                      <p className="text-lg font-black text-primary-700 dark:text-primary-400">₹{selectedListing.rentAmount}</p>
                    </div>
                  )}
                  {selectedListing.moveInDate && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 rounded-xl text-left shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Move-In Date</p>
                      <p className="text-sm font-bold text-zinc-755 text-zinc-700 dark:text-zinc-300">
                        {new Date(selectedListing.moveInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <p className="text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 mb-6 leading-relaxed whitespace-pre-wrap">{selectedListing.aboutYourself}</p>

              {/* Gemini AI Match Score — only for signed-in non-owners */}
              {isAuthenticated && user && selectedListing.owner && user._id !== (selectedListing.owner._id || selectedListing.owner) && (
                <div className="mb-6">
                  <MatchScoreBadge
                    listingId={selectedListing._id}
                    ownerId={selectedListing.owner._id || selectedListing.owner}
                    viewerId={user._id}
                  />
                </div>
              )}

              {selectedListing.facilities && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-2 text-lg">Facilities in Flat</h3>
                  <p className="text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 whitespace-pre-wrap">{selectedListing.facilities}</p>
                </div>
              )}

              {selectedListing.nearbyPlaces && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-2 text-lg">Nearby Places</h3>
                  <p className="text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 whitespace-pre-wrap">{selectedListing.nearbyPlaces}</p>
                </div>
              )}

              {selectedListing.restrictions && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-2 text-lg">Restrictions</h3>
                  <p className="text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 whitespace-pre-wrap">{selectedListing.restrictions}</p>
                </div>
              )}

              {selectedListing.flatmatePreferences && (
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-2 text-lg">Specific Flatmate Preferences</h3>
                  <p className="text-gray-605 text-gray-600 dark:text-zinc-300 bg-primary-50 dark:bg-primary-950/20 p-4 rounded-xl border border-primary-100 dark:border-primary-900/30 whitespace-pre-wrap text-primary-850 dark:text-primary-400 font-medium">{selectedListing.flatmatePreferences}</p>
                </div>
              )}

              <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-3 text-lg">Owner Preferences</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 shadow-sm rounded-xl p-3 text-center flex flex-col justify-center">
                  <p className="text-xs text-gray-505 text-gray-500 dark:text-zinc-400 mb-1">Food</p>
                  <p className="font-semibold text-gray-805 text-gray-800 dark:text-zinc-200 text-sm">{selectedListing.owner?.preferences?.foodPreference || 'N/A'}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 shadow-sm rounded-xl p-3 text-center flex flex-col justify-center">
                  <p className="text-xs text-gray-505 text-gray-500 dark:text-zinc-400 mb-1">Smoking</p>
                  <p className="font-semibold text-gray-805 text-gray-800 dark:text-zinc-200 text-sm">{selectedListing.owner?.preferences?.smokingHabit || 'N/A'}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 shadow-sm rounded-xl p-3 text-center flex flex-col justify-center">
                  <p className="text-xs text-gray-550 text-gray-505 text-gray-500 dark:text-zinc-400 mb-1">Alcohol</p>
                  <p className="font-semibold text-gray-805 text-gray-800 dark:text-zinc-200 text-sm">{selectedListing.owner?.preferences?.alcoholConsumption || 'N/A'}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  disabled={reqStatus[selectedListing._id]}
                  onClick={() => handleSendRequest(selectedListing._id)}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none font-semibold"
                >
                  {reqStatus[selectedListing._id] ? 'Request Already Sent' : 'Send Flatmate Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default FindFlat;
