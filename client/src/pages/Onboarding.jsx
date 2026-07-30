import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, ArrowLeft, X, Send, Camera, MapPin, Upload, Calendar, DollarSign, Home, Settings, Key, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const mapContainerStyle = { width: '100%', height: '350px', borderRadius: '1.5rem', overflow: 'hidden', zIndex: 10 };
const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // Delhi default

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
    if (center) {
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

const questions = [
  { id: 'foodPreference', title: 'What is your food preference?', description: 'Important in India—can be a dealbreaker.', options: ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'No Preference'] },
  { id: 'smokingHabit', title: 'Do you smoke?', description: 'Be honest about your smoking habits.', options: ['Regularly', 'Occasionally', 'No', 'Comfortable with smokers'] },
  { id: 'alcoholConsumption', title: 'Do you drink alcohol?', description: 'Let your potential flatmates know.', options: ['Regularly', 'Occasionally', 'No', 'Okay with others drinking'] },
  { id: 'cleanlinessLevel', title: 'How would you describe your cleanliness habits?', description: 'A clean house is a happy house.', options: ['Very Clean', 'Moderately Clean', 'Okay with some mess', 'Messy'] },
  { id: 'sleepSchedule', title: 'What is your usual sleep schedule?', description: 'Matching sleep schedules helps avoid disturbances.', options: ['Early sleeper (before 11 PM)', 'Moderate (11 PM – 1 AM)', 'Night owl (after 1 AM)'] },
  { id: 'workStudyRoutine', title: 'What is your daily routine?', description: 'This helps in understanding daily presence in the flat.', options: ['Work from home', 'Office/College (daytime)', 'Hybrid', 'Night shifts'] },
  { id: 'guestFrequency', title: 'How often do you have guests over?', description: 'Some like it quiet, some like it lively.', options: ['Frequently', 'Occasionally', 'Rarely', 'Never'] },
  { id: 'noiseTolerance', title: 'What is your noise preference?', description: 'From pin-drop silence to house parties.', options: ['Prefer quiet environment', 'Moderate noise is fine', 'Comfortable with loud environment'] },
  { id: 'sharingExpenses', title: 'How do you prefer handling shared responsibilities (rent, chores, bills)?', description: 'Money and chores are top reasons for conflicts.', options: ['Strictly divided', 'Flexible sharing', 'I prefer someone else to manage', 'Discuss and decide'] },
  { id: 'lifestylePersonality', title: 'Which best describes your lifestyle?', description: 'Finding the right vibe is key.', options: ['Social & outgoing', 'Balanced', 'Private & reserved'] },
  { id: 'agePreference', title: 'What is your age group preference for flatmates?', description: 'Find roomies or flatmates within your preferred age bracket.', options: ['18 - 25 years', '20 - 30 years', '25 - 35 years', '30+ years', 'Any Age'] }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  // Read selected userType (1: I have flat, 2: I need flat)
  const [selectedUserType, setSelectedUserType] = useState(() => {
    return localStorage.getItem('onboardingUserType') || (user?.userType ? String(user.userType) : '');
  });

  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Type 1 Flat Details State
  const [flatData, setFlatData] = useState({
    rentAmount: '',
    vacancyCount: 1,
    facilities: '',
    restrictions: '',
    photos: [],
    moveInDate: ''
  });
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Map Pinning State
  const [pinnedLocation, setPinnedLocation] = useState(defaultCenter);
  const [pinnedAddress, setPinnedAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const isLocationSelectedRef = useRef(false);

  const containerRef = useRef(null);

  // Steps Configuration
  const totalLifestyleSteps = questions.length;
  const isType1 = selectedUserType === '1';
  
  // If Type 1: 10 lifestyle + 1 flat info form + 1 map pinning = 12 steps (indices 0-11)
  // If Type 2: 10 lifestyle + 1 map pinning = 11 steps (indices 0-10)
  const mapStepIndex = isType1 ? totalLifestyleSteps + 1 : totalLifestyleSteps;
  const totalSteps = isType1 ? totalLifestyleSteps + 2 : totalLifestyleSteps + 1;

  useGSAP(() => {
    gsap.fromTo('.question-container', 
      { opacity: 0, x: 50 }, 
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, { scope: containerRef, dependencies: [currentStep] });

  // Get current browser location to default map center on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPinnedLocation({ lat, lng });
          fetchAddressFromCoords(lat, lng);
        },
        () => {
          console.log('Location access denied or unavailable. Using default Delhi coordinates.');
        }
      );
    }
  }, []);

  const handleSelect = (option) => {
    setFormData({ ...formData, [questions[currentStep].id]: option });
    if (currentStep < totalSteps - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 400);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      setSelectedUserType('');
      localStorage.removeItem('onboardingUserType');
    }
  };

  const handleNext = () => {
    if (currentStep === totalLifestyleSteps && isType1) {
      // Validate flat info step
      if (!flatData.rentAmount) {
        toast.error('Please enter the rent amount');
        return;
      }
      if (flatData.photos.length === 0) {
        toast.error('Please upload at least 1 photo of the flat');
        return;
      }
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleAmenityToggle = (amenity) => {
    let updated;
    if (selectedAmenities.includes(amenity)) {
      updated = selectedAmenities.filter(a => a !== amenity);
    } else {
      updated = [...selectedAmenities, amenity];
    }
    setSelectedAmenities(updated);
    setFlatData({ ...flatData, facilities: updated.join(', ') });
  };

  const handleRemovePhoto = (index) => {
    const updatedPhotos = flatData.photos.filter((_, i) => i !== index);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    setFlatData({ ...flatData, photos: updatedPhotos });
    setPhotoPreviews(updatedPreviews);
  };

  // Nominatim search effect
  useEffect(() => {
    if (!pinnedAddress || pinnedAddress.length < 3 || isLocationSelectedRef.current) {
      setSearchResults([]);
      isLocationSelectedRef.current = false;
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pinnedAddress)}&limit=5&addressdetails=1`
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
  }, [pinnedAddress]);

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.display_name) {
        isLocationSelectedRef.current = true;
        setPinnedAddress(data.display_name);
      }
    } catch (err) {
      console.error("Reverse geocoding error", err);
    }
  };

  const onMapClick = useCallback((latlng) => {
    const { lat, lng } = latlng;
    setPinnedLocation({ lat, lng });
    fetchAddressFromCoords(lat, lng);
  }, []);

  const onMarkerDragEnd = (e) => {
    const marker = e.target;
    if (marker != null) {
      const latLng = marker.getLatLng();
      setPinnedLocation({ lat: latLng.lat, lng: latLng.lng });
      fetchAddressFromCoords(latLng.lat, latLng.lng);
    }
  };

  const handleSubmit = async () => {
    if (!pinnedAddress) {
      toast.error('Please specify or search your location/address on the map.');
      return;
    }

    setLoading(true);
    try {
      // 1. Submit Onboarding Preferences to Backend
      const onboardingPayload = {
        ...formData,
        userType: Number(selectedUserType),
        address: pinnedAddress,
        lat: pinnedLocation.lat,
        lng: pinnedLocation.lng
      };

      const { data: updatedUser } = await api.post('/auth/onboarding', onboardingPayload);
      
      // 2. If Type 1, Create the Flat Listing
      if (isType1) {
        const listingPayload = new FormData();
        listingPayload.append('fullName', updatedUser.name || 'My Flat');
        listingPayload.append('email', updatedUser.email || '');
        listingPayload.append('mobileNumber', updatedUser.mobileNumber || flatData.mobileNumber || 'Not specified');
        listingPayload.append('address', pinnedAddress);
        listingPayload.append('age', updatedUser.age || 21);
        listingPayload.append('aboutYourself', updatedUser.aboutMe || '');
        listingPayload.append('vacancyCount', flatData.vacancyCount);
        listingPayload.append('facilities', flatData.facilities);
        listingPayload.append('restrictions', flatData.restrictions);
        listingPayload.append('rentAmount', flatData.rentAmount);
        listingPayload.append('moveInDate', flatData.moveInDate);
        listingPayload.append('lat', pinnedLocation.lat);
        listingPayload.append('lng', pinnedLocation.lng);

        flatData.photos.forEach(photo => {
          listingPayload.append('photos', photo);
        });

        await api.post('/listings', listingPayload);
        toast.success('Preferences saved and Flat vacancy listed!');
      } else {
        toast.success('Onboarding complete! Preferences saved.');
      }

      // Sync user profile state in Auth Context
      setUser(updatedUser);
      localStorage.removeItem('onboardingUserType'); // Clean up choice

      // Navigate straight to Matches view
      navigate('/matches');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const renderUserTypeSelector = () => {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gray-50 dark:bg-zinc-950 transition-colors duration-200 w-full z-10">
        <div className="w-full max-w-4xl relative z-10 text-center px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight mb-3">
            Choose Your <span className="text-primary-600 dark:text-primary-400">FlatSync Mode</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-zinc-400 mb-10 max-w-2xl mx-auto font-medium">
            To customize your experience, please select how you would like to use FlatSync.
          </p>

          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-3xl mx-auto">
            {/* Card 1: I have a flat */}
            <div
              onClick={() => {
                setSelectedUserType('1');
                localStorage.setItem('onboardingUserType', '1');
              }}
              className="flex-1 bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 hover:border-primary-500 dark:hover:border-primary-500 p-8 rounded-3xl cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all text-left flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-950/30 text-primary-500 dark:text-primary-500 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <Key className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-zinc-100 mb-2">1. I have a flat</h3>
                <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                  List your available flat vacancy, outline lifestyle preferences, and match with the ideal flatmate.
                </p>
              </div>
              <span className="text-primary-600 dark:text-primary-400 font-bold text-lg flex items-center gap-2 mt-auto">
                Find a flatmate <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </div>

            {/* Card 2: I don't have a flat */}
            <div
              onClick={() => {
                setSelectedUserType('2');
                localStorage.setItem('onboardingUserType', '2');
              }}
              className="flex-1 bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 hover:border-primary-500 dark:hover:border-primary-500 p-8 rounded-3xl cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all text-left flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-950/30 text-primary-500 dark:text-primary-500 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-zinc-100 mb-2">2. I don't have a flat</h3>
                <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                  Browse flat vacancies, discover AI compatibility scores, and pinpoint rooms on our location map.
                </p>
              </div>
              <span className="text-primary-600 dark:text-primary-400 font-bold text-lg flex items-center gap-2 mt-auto">
                Find flat + flatmate <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rendering Helper for Questionnaire step
  const renderQuestionnaire = () => {
    const currentQuestion = questions[currentStep];
    return (
      <div className="w-full max-w-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8 md:p-12 min-h-[500px] flex flex-col question-container z-10 transition-colors">
        <button onClick={handleBack} className="self-start text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200 transition flex items-center gap-1 mb-8 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-zinc-100 mb-3 leading-tight">{currentQuestion.title}</h2>
          {currentQuestion.description && <p className="text-lg text-gray-500 dark:text-zinc-400 mb-10 font-medium">{currentQuestion.description}</p>}

          <div className="flex flex-col gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = formData[currentQuestion.id] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-6 py-5 rounded-2xl border-2 transition-all duration-300 transform active:scale-[0.98] group ${
                    isSelected 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 shadow-md shadow-primary-500/10' 
                      : 'border-gray-200 dark:border-zinc-800 hover:border-primary-400 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-semibold transition-colors ${isSelected ? 'text-primary-800 dark:text-primary-400' : 'text-gray-700 dark:text-zinc-300 group-hover:text-primary-800 dark:group-hover:text-primary-400'}`}>{option}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300 dark:border-zinc-650 group-hover:border-primary-400'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Rendering Helper for Extra Flat Info (Type 1 only)
  const renderFlatInfoForm = () => {
    const amenities = ['WiFi', 'AC', 'Washing Machine', 'Gym', 'Parking', 'Kitchen', 'Gated Security', 'TV'];
    return (
      <div className="w-full max-w-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8 md:p-10 min-h-[500px] flex flex-col question-container z-10 transition-colors">
        <button onClick={handleBack} className="self-start text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200 transition flex items-center gap-1 mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-100 mb-2 leading-tight">Tell us about your Flat</h2>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6 font-medium">Provide rent details and list amenities to help potential matches find your space.</p>

        <div className="flex-1 flex flex-col gap-5 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-primary-500"/> Monthly Rent Amount (₹)
              </label>
              <input 
                required 
                type="number" 
                placeholder="e.g. 12000"
                value={flatData.rentAmount} 
                onChange={e => setFlatData({...flatData, rentAmount: e.target.value})} 
                className="w-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-850 rounded-xl p-3 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 outline-none transition" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-primary-500"/> Estimated Move-in Date
              </label>
              <input 
                type="date" 
                value={flatData.moveInDate} 
                onChange={e => setFlatData({...flatData, moveInDate: e.target.value})} 
                className="w-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-850 rounded-xl p-3 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 outline-none transition" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-1">
                <Home className="w-4 h-4 text-primary-500"/> Vacant Spots Available
              </label>
              <select 
                value={flatData.vacancyCount} 
                onChange={e => setFlatData({...flatData, vacancyCount: parseInt(e.target.value)})} 
                className="w-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-850 rounded-xl p-3 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 outline-none transition"
              >
                <option value={1}>1 Room / Spot</option>
                <option value={2}>2 Rooms / Spots</option>
                <option value={3}>3 Rooms / Spots</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-1">
                <Camera className="w-4 h-4 text-primary-500"/> Flat Restrictions
              </label>
              <input 
                type="text" 
                placeholder="e.g. No smoking, Veg only, No pets" 
                value={flatData.restrictions} 
                onChange={e => setFlatData({...flatData, restrictions: e.target.value})} 
                className="w-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-850 rounded-xl p-3 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 outline-none transition" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-1">
              <Settings className="w-4 h-4 text-primary-500"/> Flat Amenities / Facilities
            </label>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, i) => {
                const isActive = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      isActive 
                        ? 'bg-primary-500 border-primary-500 text-white shadow-sm' 
                        : 'bg-white dark:bg-zinc-850 border-gray-200 dark:border-zinc-700 text-gray-755 text-gray-600 dark:text-zinc-400 hover:border-primary-400'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-1">
              <Upload className="w-4 h-4 text-primary-500"/> Upload Flat Photos (Up to 5)
            </label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  const newFiles = Array.from(e.target.files);
                  const combinedPhotos = [...flatData.photos, ...newFiles].slice(0, 5);
                  setFlatData({ ...flatData, photos: combinedPhotos });
                  setPhotoPreviews(combinedPhotos.map(file => typeof file === 'string' ? file : URL.createObjectURL(file)));
                }
              }} 
              className="w-full border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-3 bg-gray-50/50 dark:bg-zinc-850/50 cursor-pointer text-gray-550 dark:text-zinc-400" 
            />
            {photoPreviews.length > 0 && (
              <div className="flex overflow-x-auto gap-3 mt-3 pb-2 pt-1 custom-scrollbar">
                {photoPreviews.map((preview, i) => (
                  <div key={i} className="relative group flex-shrink-0">
                    <img src={preview} alt={`flat preview ${i + 1}`} className="w-24 h-24 object-cover rounded-xl border border-gray-250 dark:border-zinc-700 shadow-sm" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-all scale-90 hover:scale-110 flex items-center justify-center cursor-pointer z-10"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNext}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-primary-500/30 transition-all active:scale-[0.98] flex items-center gap-2 group"
          >
            Next: Location Map <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  };

  // Rendering Helper for Leaflet Location Pinning
  const renderLocationPinning = () => {
    return (
      <div className="w-full max-w-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8 md:p-10 min-h-[500px] flex flex-col question-container z-10 transition-colors">
        <button onClick={handleBack} className="self-start text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200 transition flex items-center gap-1 mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-100 mb-2 leading-tight">
          {isType1 ? "Where is your Flat?" : "Set your Preferred Area"}
        </h2>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6 font-medium">
          {isType1 
            ? "Pin the exact location of your flat vacancy on the map." 
            : "Pin your preferred search area to match with flats nearby."}
        </p>

        <div className="flex-1 flex flex-col gap-4 text-left">
          {/* Autocomplete Search input */}
          <div className="relative w-full z-[1000]">
            <div className="w-full bg-white dark:bg-zinc-850 rounded-xl shadow-sm border border-gray-250 dark:border-zinc-700 overflow-hidden flex items-center px-4 py-2.5">
              <MapPin className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder={isType1 ? "Search address of your flat..." : "Search preferred location or suburb..."}
                value={pinnedAddress}
                onChange={e => setPinnedAddress(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 font-semibold text-sm border-0 focus:ring-0"
              />
              {isSearching && (
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin ml-2"></div>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-60 overflow-y-auto z-[9999] text-left">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      isLocationSelectedRef.current = true;
                      setPinnedLocation({ lat: result.lat, lng: result.lon });
                      setPinnedAddress(result.display_name);
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 border-b border-gray-150 dark:border-zinc-800 last:border-b-0 text-sm text-gray-800 dark:text-zinc-200 transition-colors truncate"
                  >
                    {result.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border border-gray-200 dark:border-zinc-700 rounded-[1.5rem] overflow-hidden relative shadow-inner">
            <MapContainer
              style={mapContainerStyle}
              center={[pinnedLocation.lat, pinnedLocation.lng]}
              zoom={16}
              zoomControl={true}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                maxZoom={20}
              />
              <Marker
                position={[pinnedLocation.lat, pinnedLocation.lng]}
                draggable={true}
                eventHandlers={{
                  dragend: onMarkerDragEnd
                }}
                icon={customMarkerIcon}
              />
              <MapController center={pinnedLocation} onMapClick={onMapClick} />
            </MapContainer>
          </div>
          
          <p className="text-xs text-gray-450 dark:text-zinc-500 italic mt-1 font-medium">
            * You can drag the red map marker or click directly on the map to fine-tune your pinned spot.
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-primary-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center gap-2 group"
          >
            {loading ? 'Processing...' : (isType1 ? 'Finish & List Flat' : 'Finish & Match Me')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  };

  // Decide current step rendering view
  const renderCurrentStep = () => {
    if (currentStep < totalLifestyleSteps) {
      return renderQuestionnaire();
    } else if (currentStep === totalLifestyleSteps && isType1) {
      return renderFlatInfoForm();
    } else {
      return renderLocationPinning();
    }
  };

  if (!selectedUserType) {
    return renderUserTypeSelector();
  }

  const progress = ((currentStep) / totalSteps) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gray-50 dark:bg-zinc-950 transition-colors duration-200" ref={containerRef}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50/30 dark:from-primary-950/10 via-gray-50 dark:via-zinc-950 to-gray-50 dark:to-zinc-950 z-0"></div>
      
      {/* Progress Header */}
      <div className="w-full max-w-3xl absolute top-8 px-6 z-10">
        <div className="h-2 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-right text-sm text-gray-550 dark:text-zinc-405 mt-2 font-semibold">Step {currentStep + 1} of {totalSteps}</p>
      </div>

      {renderCurrentStep()}
    </div>
  );
};

export default Onboarding;
