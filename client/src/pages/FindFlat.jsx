import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { X, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MatchScoreBadge from '../components/MatchScoreBadge';

const libraries = ['places'];

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 28.6139, lng: 77.2090 };

const FindFlat = () => {
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

  if (loadError) return <div className="p-10 text-center font-semibold text-rose-500">Map Loading Error: Please ensure you have a valid Google Maps API Key configured in your .env file.</div>;
  if (!isLoaded) return <div className="p-10 text-center font-semibold animate-pulse text-gray-500">Loading Map Engine...</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div className="w-[40%] bg-gray-50 border-r border-gray-200 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
        {listings.length === 0 ? <p className="text-center text-gray-500 mt-10">No flats found nearby.</p> :
          listings.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all duration-200 ${activeListing === item._id ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-20' : 'border-gray-200 hover:shadow-md'}`}
              onClick={() => setActiveListing(item._id)}
            >
              <div className="flex gap-4">
                <img src={(item.photoUrls && item.photoUrls.length > 0) ? item.photoUrls[0] : 'https://via.placeholder.com/100'} alt="flat" className="w-24 h-24 rounded-lg object-cover bg-gray-100" />
                <div className="flex-1 min-w-0 flex flex-col">
                  <h3 className="font-bold text-gray-900 truncate">{item.owner?.name || item.fullName}'s Flat</h3>
                  <p className="text-sm text-gray-500 truncate mb-auto pb-2">{item.address}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="inline-block px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg mb-0.5">
                      {item.vacancyCount} Vacanc{item.vacancyCount > 1 ? 'ies' : 'y'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedListing(item); }}
                      className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition shadow-sm"
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
          <div className="flex-1 max-w-md bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex items-center px-4 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
            <Autocomplete
              onLoad={onLoadAutocomplete}
              onPlaceChanged={onPlaceChanged}
              className="w-full"
            >
              <input
                type="text"
                placeholder="Search for a location (e.g., Connaught Place)..."
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 font-medium"
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

      {selectedListing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            <button onClick={() => setSelectedListing(null)} className="absolute top-4 right-4 bg-white/80 p-1.5 rounded-full z-10 hover:bg-white text-gray-800 transition">
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
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedListing.owner?.name || selectedListing.fullName}'s Place</h2>
                    <p className="text-gray-500 text-sm mt-1">{selectedListing.address}</p>
                  </div>
                  <span className="bg-primary-100 text-primary-800 font-bold px-3 py-1 rounded-full text-sm">
                    {selectedListing.vacancyCount} Spot{selectedListing.vacancyCount > 1 ? 's' : ''} Open
                  </span>
                </div>

                <p className="text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 leading-relaxed whitespace-pre-wrap">{selectedListing.aboutYourself}</p>

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
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Facilities in Flat</h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">{selectedListing.facilities}</p>
                  </div>
                )}
                
                {selectedListing.nearbyPlaces && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Nearby Places</h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">{selectedListing.nearbyPlaces}</p>
                  </div>
                )}
                
                {selectedListing.restrictions && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Restrictions</h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">{selectedListing.restrictions}</p>
                  </div>
                )}
                
                {selectedListing.flatmatePreferences && (
                  <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Specific Flatmate Preferences</h3>
                    <p className="text-gray-600 bg-primary-50 p-4 rounded-xl border border-primary-100 whitespace-pre-wrap text-primary-800">{selectedListing.flatmatePreferences}</p>
                  </div>
                )}

                <h3 className="font-bold text-gray-900 mb-3 text-lg">Owner Preferences</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 text-center flex flex-col justify-center">
                    <p className="text-xs text-gray-500 mb-1">Food</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedListing.owner?.preferences?.foodPreference || 'N/A'}</p>
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 text-center flex flex-col justify-center">
                    <p className="text-xs text-gray-500 mb-1">Smoking</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedListing.owner?.preferences?.smokingHabit || 'N/A'}</p>
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 text-center flex flex-col justify-center">
                    <p className="text-xs text-gray-500 mb-1">Alcohol</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedListing.owner?.preferences?.alcoholConsumption || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    disabled={reqStatus[selectedListing._id]}
                    onClick={() => handleSendRequest(selectedListing._id)}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {reqStatus[selectedListing._id] ? 'Request Already Sent' : 'Send Flatmate Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindFlat;
