import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, ArrowLeft, BookmarkPlus, X, Send } from 'lucide-react';

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
  { id: 'lifestylePersonality', title: 'Which best describes your lifestyle?', description: 'Finding the right vibe is key.', options: ['Social & outgoing', 'Balanced', 'Private & reserved'] }
];

const calculateCompatibility = (userPrefs, ownerPrefs) => {
  if (!ownerPrefs || !userPrefs) return { overall: 0, breakdowns: [] };
  let totalScore = 0;
  const breakdowns = [];
  
  questions.forEach(q => {
    const userVal = userPrefs[q.id];
    const ownerVal = ownerPrefs[q.id];
    
    let score = 0;
    if (userVal === ownerVal) {
      score = 100;
    } else if (userVal === 'No Preference' || ownerVal === 'No Preference' || userVal === 'Comfortable with smokers' || ownerVal === 'Comfortable with smokers') {
      score = 80;
    } else if (userVal && ownerVal) {
      score = 25; // Partial compatibility
    }
    
    totalScore += score;
    breakdowns.push({
      label: q.title.split(' ')[q.title.split(' ').length - 1].replace('?', ''), // rough short label
      fullLabel: q.title,
      score,
      id: q.id
    });
  });
  
  return {
    overall: Math.round(totalScore / questions.length),
    breakdowns
  };
};

const Onboarding = () => {
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showMatching, setShowMatching] = useState(false);
  const [listings, setListings] = useState([]);
  const [currentListingIndex, setCurrentListingIndex] = useState(0);
  
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const containerRef = useRef(null);

  useGSAP(() => {
    if (!showMatching) {
      gsap.fromTo('.question-container', 
        { opacity: 0, x: 50 }, 
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
      );
    } else {
      gsap.fromTo('.match-card', 
        { opacity: 0, y: 50, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.2)' }
      );
    }
  }, { scope: containerRef, dependencies: [currentStep, showMatching, currentListingIndex] });

  const fetchListings = async () => {
    try {
      const { data } = await api.get('/listings');
      // Filter out own listings
      const othersListings = data.filter(l => l.owner?._id !== user._id);
      setListings(othersListings);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load potential matches');
    }
  };

  const handleSelect = (option) => {
    setFormData({ ...formData, [questions[currentStep].id]: option });
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 400);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/onboarding', formData);
      toast.success('Preferences saved! Finding matches...');
      setUser((prev) => ({ ...prev, onboardingComplete: true, preferences: formData }));
      await fetchListings();
      setShowMatching(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to finish onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (currentListingIndex < listings.length - 1) {
      setCurrentListingIndex(prev => prev + 1);
    } else {
      navigate('/');
    }
  };

  const handleSave = async (id) => {
    try {
      await api.post(`/users/save-listing/${id}`);
      toast.success('Listing Saved!');
      handleSkip();
    } catch (error) {
      toast.error('Failed to save listing');
    }
  };

  const handleSendMessage = async (id) => {
    try {
      await api.post('/requests/send', { listingId: id });
      toast.success('Connection Request Sent!');
      handleSkip();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
      handleSkip();
    }
  };

  if (showMatching) {
    if (listings.length === 0 || currentListingIndex >= listings.length) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">You're all caught up!</h2>
          <p className="text-gray-500 mb-8">We showed you all available flats. Check back later for more.</p>
          <button onClick={() => navigate('/')} className="bg-primary-600 text-white px-8 py-3 rounded-full font-bold shadow-lg">Go to Homepage</button>
        </div>
      );
    }

    const listing = listings[currentListingIndex];
    const matchData = calculateCompatibility(formData, listing.owner?.preferences);

    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden" ref={containerRef}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/40 via-gray-900 to-black z-0"></div>
        
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col match-card z-10">
          
          {/* Header - Avatars */}
          <div className="relative h-48 bg-gray-100 flex items-center justify-center pt-8">
            <img src={(listing.photoUrls && listing.photoUrls.length > 0) ? listing.photoUrls[0] : 'https://via.placeholder.com/400'} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            
            <div className="relative z-10 flex items-center gap-2">
              <div className="flex flex-col items-center">
                <img src={user?.photoUrl || 'https://via.placeholder.com/100'} className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover bg-gray-200" />
                <span className="text-white font-bold text-xs mt-2 bg-black/50 px-2 py-0.5 rounded-full">You</span>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-500 text-white font-black text-lg shadow-lg z-20 -mx-4 border-4 border-white">
                {matchData.overall}%
              </div>
              <div className="flex flex-col items-center">
                <img src={listing.owner?.photoUrl || 'https://via.placeholder.com/100'} className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover bg-gray-200" />
                <span className="text-white font-bold text-xs mt-2 bg-black/50 px-2 py-0.5 rounded-full">{listing.owner?.name?.split(' ')[0] || 'Owner'}</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 flex-1 flex flex-col bg-white">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">{listing.fullName}'s Flat</h2>
              <p className="text-gray-500 text-sm">{listing.address}</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6 max-h-[250px]">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Compatibility Breakdown</h3>
              <div className="space-y-3">
                {matchData.breakdowns.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2 flex-1" title={b.fullLabel}>{b.fullLabel}</span>
                    <span className={`font-bold px-2 py-1 rounded-md ${b.score === 100 ? 'bg-green-100 text-green-700' : b.score > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-rose-100 text-rose-700'}`}>
                      {b.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <button onClick={handleSkip} className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-3 rounded-2xl transition">
                <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center mb-1"><X className="w-6 h-6" /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Skip</span>
              </button>
              
              <button onClick={() => handleSave(listing._id)} className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-3 rounded-2xl transition">
                <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center mb-1"><BookmarkPlus className="w-5 h-5" /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Save</span>
              </button>
              
              <button onClick={() => handleSendMessage(listing._id)} className="flex flex-col items-center justify-center gap-1 text-primary-500 hover:bg-primary-50 p-3 rounded-2xl transition">
                <div className="w-12 h-12 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/40 flex items-center justify-center mb-1"><Send className="w-5 h-5 ml-1" /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Message</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original Form View
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep) / questions.length) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden" ref={containerRef}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50/50 via-gray-50 to-gray-50 z-0"></div>
      
      <div className="w-full max-w-3xl absolute top-8 px-6 z-10">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-right text-sm text-gray-500 mt-2 font-medium">Step {currentStep + 1} of {questions.length}</p>
      </div>

      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 min-h-[500px] flex flex-col question-container z-10">
        {currentStep > 0 && (
          <button onClick={handleBack} className="self-start text-gray-400 hover:text-gray-900 transition flex items-center gap-1 mb-8 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">{currentQuestion.title}</h2>
          {currentQuestion.description && <p className="text-lg text-gray-500 mb-10">{currentQuestion.description}</p>}

          <div className="flex flex-col gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = formData[currentQuestion.id] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-6 py-5 rounded-2xl border-2 transition-all duration-300 transform active:scale-[0.98] ${
                    isSelected ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-500/10' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-semibold ${isSelected ? 'text-primary-800' : 'text-gray-700'}`}>{option}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          {currentStep === questions.length - 1 && formData[currentQuestion.id] && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-primary-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center gap-2 group"
            >
              {loading ? 'Processing...' : 'Finish & Match Me'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
