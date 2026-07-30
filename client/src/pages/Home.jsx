import { ArrowRight, Key, Search, User, Mail, Phone, MapPin, Sparkles, Building, Lock, Send, X, Info, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import api from '../utils/axiosInstance';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/AuthContext';
import fsLogo from '../assets/FS Logo.png';
import toast from 'react-hot-toast';
import MatchScoreBadge from '../components/MatchScoreBadge';

gsap.registerPlugin(ScrollTrigger);

const Home = ({ onRegisterClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const container = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  // Modal and Lightbox States
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedModalPhotoIdx, setSelectedModalPhotoIdx] = useState(0);
  const [lightboxPhotos, setLightboxPhotos] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [reqStatus, setReqStatus] = useState({});

  // Scroll to top on refresh/load; scroll to section only when navigated via Navbar click
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (location.state?.scrollTo) {
      const targetId = location.state.scrollTo;
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      window.scrollTo(0, 0);
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [location.state]);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sendingContact, setSendingContact] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSendingContact(true);

    const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;

    if (!accessKey) {
      setTimeout(() => {
        toast.success('Message submitted! Add your free Web3Forms Key in .env to receive live emails.');
        setContactForm({ name: '', email: '', subject: '', message: '' });
        setSendingContact(false);
      }, 800);
      return;
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: contactForm.name,
          email: contactForm.email,
          subject: contactForm.subject,
          message: contactForm.message,
          from_name: 'FlatSync Contact Form'
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Thank you! Your message has been delivered to FlatSync Team');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(result.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setSendingContact(false);
    }
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/listings');
        if (Array.isArray(data) && data.length > 0) {
          setFeaturedListings(data.slice(0, 6));
        } else {
          const res = await fetch('http://localhost:5000/api/listings');
          const fallbackData = await res.json();
          if (Array.isArray(fallbackData)) setFeaturedListings(fallbackData.slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to fetch featured listings:', error);
        try {
          const res = await fetch('http://localhost:5000/api/listings');
          const fallbackData = await res.json();
          if (Array.isArray(fallbackData)) setFeaturedListings(fallbackData.slice(0, 6));
        } catch (e) {
          console.error('Fallback fetch error:', e);
        }
      } finally {
        setLoadingListings(false);
      }
    };
    fetchFeatured();
  }, []);

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

  const developers = [
    { initials: 'YV', name: 'Yash Verma', role: 'Core Platform & Matching', color: 'bg-green-500', bio: 'Architect of matching algorithms and core layout.' },
    { initials: 'TS', name: 'Tarang Kumar Srivastava', role: 'Engagement and Location', color: 'bg-amber-500', bio: 'Engineered location-based search and maps integration.' }
  ];

  useGSAP(() => {
    // Hero Master Entrance Animation
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.hero-logo', {
      scale: 0.6,
      opacity: 0,
      rotate: -10
    }, {
      scale: 1,
      opacity: 1,
      rotate: 0,
      duration: 0.9,
      ease: 'back.out(1.7)',
      delay: 0.1
    })
      .fromTo('.hero-title', {
        y: 45,
        opacity: 0,
        rotateX: -20,
        scale: 0.96
      }, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        scale: 1,
        duration: 1,
        ease: 'power4.out'
      }, '-=0.5')
      .fromTo('.hero-subtitle', {
        y: 30,
        opacity: 0,
        filter: 'blur(8px)'
      }, {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.8
      }, '-=0.6')
      .fromTo('.hero-card', {
        y: 40,
        opacity: 0,
        scale: 0.95
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.4)'
      }, '-=0.4')
      .to('.hero-logo', {
        y: -10,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

    // Section Headings Animation
    gsap.utils.toArray('.section-heading').forEach((heading) => {
      gsap.fromTo(heading, {
        y: 40,
        opacity: 0,
        scale: 0.96
      }, {
        scrollTrigger: {
          trigger: heading,
          start: 'top 92%',
          toggleActions: 'play none play reverse'
        },
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out'
      });
    });

    // About Section Animations
    gsap.utils.toArray('.dev-card').forEach((card, i) => {
      gsap.fromTo(card, {
        y: 50,
        opacity: 0,
        scale: 0.95
      }, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none play reverse'
        },
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: i * 0.15,
        ease: 'power3.out'
      });
    });
  }, { scope: container });

  const handleIHaveFlat = () => {
    if (!isAuthenticated) {
      onRegisterClick();
      return;
    }
    localStorage.setItem('onboardingUserType', '1');
    navigate('/onboarding');
  };

  const handleIDontHaveFlat = () => {
    if (!isAuthenticated) {
      onRegisterClick();
      return;
    }
    localStorage.setItem('onboardingUserType', '2');
    navigate('/onboarding');
  };

  const handleBrowseListings = () => {
    if (!isAuthenticated) {
      onRegisterClick();
      return;
    }
    navigate('/browse');
  };

  const handleListingCardClick = (listing) => {
    if (!isAuthenticated) {
      onRegisterClick();
      return;
    }
    setSelectedModalPhotoIdx(0);
    setSelectedListing(listing);
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
                className={`w-16 h-12 sm:w-20 sm:h-14 object-cover rounded-xl cursor-pointer transition-all ${activePhotoIdx === idx
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

          {/* Featured Image + Thumbnail Grid */}
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
                      className={`h-16 sm:h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedModalPhotoIdx === idx
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
    <div className="bg-gray-50 dark:bg-zinc-950 min-h-screen text-gray-900 dark:text-zinc-100 font-sans transition-colors duration-200 overflow-x-hidden" ref={container}>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 overflow-hidden bg-gradient-to-b from-primary-50/50 via-white to-gray-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900/40 border-b border-gray-100 dark:border-zinc-900 transition-colors duration-200">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-200/50 via-transparent to-transparent dark:from-primary-950/30"></div>

        <div className="container mx-auto px-6 max-w-5xl relative z-10 text-center">

          {/* Floating Premium AI Glass Logo Card with Radial Glow & 3D Shadow */}
          <div className="relative inline-block mb-10 hero-logo group cursor-pointer">
            {/* Soft Radial Glow Behind Logo */}
            <div className="absolute -inset-5 bg-gradient-to-r from-blue-500/40 via-indigo-500/40 to-cyan-400/40 rounded-[32px] blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

            {/* AI Halo Border Ring */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 via-indigo-500 to-cyan-400 rounded-[28px] opacity-70 blur-xs group-hover:opacity-100 transition duration-300"></div>

            {/* Floating Glass Card */}
            <div className="relative flex items-center gap-4 md:gap-5 px-7 py-4 md:px-9 md:py-5 rounded-[28px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/80 dark:border-zinc-800/80 shadow-[0_25px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_50px_rgba(0,0,0,0.5)] transform group-hover:scale-[1.07] group-hover:rotate-2 transition-all duration-300 ease-out">
              <div className="relative flex items-center justify-center">
                <img
                  src={fsLogo}
                  alt="FlatSync Logo"
                  className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary-500"></span>
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-cyan-500 dark:from-primary-400 dark:via-indigo-400 dark:to-cyan-400 drop-shadow-xs">
                  FlatSync
                </span>
                <span className="text-xs md:text-[13px] font-bold text-gray-500 dark:text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-500 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>AI-Powered Shared Living</span>
                </span>
              </div>
            </div>
          </div>

          <h1 className="hero-title text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-zinc-100 leading-[1.08] mb-6">
            Find Your Perfect <br className="hidden sm:inline" />
            <span className="text-primary-600 dark:text-primary-500">Flat & Compatible Flatmate</span>
          </h1>

          <p className="hero-subtitle text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-zinc-400 font-normal max-w-3xl mx-auto leading-relaxed mb-14">
            Connect With Roommates Based On Verified Lifestyle Habits, Sleep Routines, Cleanliness, And AI Compatibility Scores.
          </p>

          {/* Interactive Dual Mode Cards */}
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-4xl mx-auto">

            {/* Card 1: I have a flat */}
            <div
              onClick={handleIHaveFlat}
              className="hero-card flex-1 bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 hover:border-primary-500 dark:hover:border-primary-500 p-8 rounded-3xl cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all text-left flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-950/30 text-primary-500 dark:text-primary-500 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <Key className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-zinc-100 mb-2">1. I Have A Flat</h3>
                <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                  List Your Available Flat Vacancy, Outline Lifestyle Preferences, And Match With The Ideal Flatmate.
                </p>
              </div>
              <span className="text-primary-600 dark:text-primary-400 font-bold text-lg flex items-center gap-2 mt-auto">
                Find A Flatmate <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </div>

            {/* Card 2: I dont have a flat */}
            <div
              onClick={handleIDontHaveFlat}
              className="hero-card flex-1 bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 hover:border-primary-500 dark:hover:border-primary-500 p-8 rounded-3xl cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all text-left flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-950/30 text-primary-500 dark:text-primary-500 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-zinc-100 mb-2">2. I Don't Have A Flat</h3>
                <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                  Browse Flat Vacancies, Discover AI Compatibility Scores, And Pinpoint Rooms On Our Location Map.
                </p>
              </div>
              <span className="text-primary-600 dark:text-primary-400 font-bold text-lg flex items-center gap-2 mt-auto">
                Find Flat + Flatmate <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50 dark:bg-zinc-900/40 border-t border-gray-100 dark:border-zinc-900 relative overflow-hidden transition-colors duration-200">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary-50/80 via-transparent to-transparent"></div>
        <div className="container mx-auto px-6 max-w-6xl relative z-10">

          {/* Section Header */}
          <div className="text-center mb-14 section-heading">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-zinc-100 mb-4 tracking-tight">About FlatSync</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
              Intelligent Flatmate Matching Built For Modern, Stress-Free Shared Living.
            </p>
          </div>

          {/* Main About Platform Card */}
          <div className="max-w-4xl mx-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 text-xs font-bold mb-6 border border-primary-100 dark:border-primary-900/50">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>AI-Powered Matching Platform</span>
            </div>

            <p className="text-gray-700 dark:text-zinc-300 text-lg md:text-xl leading-relaxed font-normal mb-6">
              <strong className="text-gray-900 dark:text-zinc-100 font-bold">FlatSync</strong> Is An AI-Powered Flatmate Finding Platform Designed To Help Users Discover Compatible Roommates Based On Lifestyle Preferences, Budget, Location, And Personal Habits. Instead Of Randomly Choosing A Flatmate, Users Receive AI-Driven Compatibility Scores, Making Shared Living More Comfortable And Convenient.
            </p>

            <p className="text-gray-600 dark:text-zinc-400 text-base leading-relaxed mb-8">
              Built Using <span className="font-semibold text-gray-900 dark:text-zinc-200">React, Node.js, Express.js, MongoDB, Socket.io,</span> And <span className="font-semibold text-gray-900 dark:text-zinc-200">Cloudinary</span>, FlatSync Offers Secure Authentication, Real-Time Messaging, Location-Based Property Search, And Image Uploads.
            </p>

            {/* Tech Stack Pills */}
            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800/80">
              <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 dark:text-zinc-500 mb-3">Powered By Modern Stack</h4>
              <div className="flex flex-wrap gap-2">
                {['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Socket.io', 'Cloudinary'].map((tech, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 text-xs font-semibold rounded-lg">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="py-24 bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 relative overflow-hidden transition-colors duration-200">
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="flex justify-between items-end mb-12 section-heading">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-zinc-100 mb-4 tracking-tight">Featured Listings</h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"></div>
            </div>
          </div>

          {loadingListings ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : featuredListings.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-850 shadow-sm flex flex-col items-center justify-center">
              <Building className="w-12 h-12 text-primary-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-2">No Listings Available</h3>
              <p className="text-gray-500 dark:text-zinc-400 mb-6">Be The First To List A Flat In Your Area!</p>
              <button
                onClick={handleIHaveFlat}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-semibold transition-all shadow-md"
              >
                List A Flat
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex overflow-x-auto gap-6 pb-8 custom-scrollbar snap-x">
                {featuredListings.map((listing) => {
                  const imageSrc = (listing.photoUrls && listing.photoUrls.length > 0)
                    ? listing.photoUrls[0]
                    : (listing.photoUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80');

                  const facilitiesList = listing.facilities
                    ? (typeof listing.facilities === 'string' ? listing.facilities.split(',') : listing.facilities).map(f => f.trim()).filter(Boolean)
                    : [];

                  return (
                    <div
                      key={listing._id}
                      className="min-w-[300px] md:min-w-[350px] bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-zinc-800 flex flex-col snap-start group cursor-pointer"
                      onClick={() => handleListingCardClick(listing)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={imageSrc}
                          alt="flat"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-700 dark:text-primary-400 shadow-sm">
                          {listing.vacancyCount} Spot{listing.vacancyCount > 1 ? 's' : ''}
                        </div>
                        {listing.rentAmount && (
                          <div className="absolute bottom-3 left-3 bg-gray-900/80 text-white backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold shadow-md">
                            ₹{listing.rentAmount.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-gray-300">/mo</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-lg mb-1 line-clamp-1">
                          {listing.owner?.name || listing.fullName || 'Flat Lister'}'s Place
                        </h3>

                        {isAuthenticated ? (
                          <p className="text-gray-500 dark:text-zinc-400 text-xs flex items-center gap-1 mb-3 line-clamp-1">
                            <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                            {listing.address}
                          </p>
                        ) : (
                          <div className="my-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-200/60 dark:border-amber-900/50">
                            <Lock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                            <span>Address & Contact Locked • Log In To View</span>
                          </div>
                        )}

                        {facilitiesList.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 my-2">
                            {facilitiesList.slice(0, 3).map((facility, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-xs bg-primary-50 dark:bg-zinc-800 text-primary-700 dark:text-primary-300 font-medium rounded-md"
                              >
                                {facility}
                              </span>
                            ))}
                            {facilitiesList.length > 3 && (
                              <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded-md">
                                +{facilitiesList.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800/80">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 font-semibold block">Monthly Rent</span>
                            <span className="text-base font-extrabold text-gray-900 dark:text-zinc-100">
                              {listing.rentAmount ? `₹${listing.rentAmount.toLocaleString('en-IN')}` : 'Rent on request'}
                            </span>
                          </div>
                          <span className="text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center group-hover:translate-x-1 transition-transform">
                            {isAuthenticated ? 'View Details' : 'Unlock Details'} <ArrowRight className="w-4 h-4 ml-1" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Show More Card */}
                <div
                  onClick={handleBrowseListings}
                  className="min-w-[200px] bg-primary-50 dark:bg-zinc-900/60 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary-100 dark:hover:bg-zinc-800 transition-colors border border-primary-100 dark:border-zinc-800 snap-start group"
                >
                  <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-8 h-8 text-primary-600 dark:text-primary-500" />
                  </div>
                  <span className="font-bold text-primary-800 dark:text-primary-400 text-lg">Show More</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How FlatSync Works Section */}
      <section className="py-24 bg-gray-50 dark:bg-zinc-900/40 border-t border-gray-100 dark:border-zinc-900 relative transition-colors duration-200">
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16 section-heading">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-zinc-100 mb-4 tracking-tight">How FlatSync Works</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-600 dark:text-zinc-400 text-lg">Your Perfect Flatmate Match In Four Simple Steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-primary-50 dark:bg-zinc-900 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-100 dark:group-hover:bg-zinc-800 transition-colors shadow-sm">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-3">1. Create Account</h3>
              <p className="text-gray-500 dark:text-zinc-400 leading-relaxed text-sm">Register Or Log In First. Every User Needs A Verified Profile To Ensure A Secure Matching Experience.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-primary-50 dark:bg-zinc-900 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-100 dark:group-hover:bg-zinc-800 transition-colors shadow-sm">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-3">2. Share Habits</h3>
              <p className="text-gray-500 dark:text-zinc-400 leading-relaxed text-sm">Answer Lifestyle Questions. If You Own A Flat, Easily Attach Flat Rent Details, Photos, And Amenities.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-primary-50 dark:bg-zinc-900 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-100 dark:group-hover:bg-zinc-800 transition-colors shadow-sm">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-3">3. Browse & Pin Location</h3>
              <p className="text-gray-500 dark:text-zinc-400 leading-relaxed text-sm">Explore Vacancies On Our Interactive Map. Click Or Drag To Pin Any Location And Discover Real-Time Nearby Flat Listings.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-primary-50 dark:bg-zinc-900 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-100 dark:group-hover:bg-zinc-800 transition-colors shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-3">4. AI Match & Connect</h3>
              <p className="text-gray-500 dark:text-zinc-400 leading-relaxed text-sm">Check Your AI Compatibility Score With A Single Click, View Detailed Property Specs, And Connect With Roommates Directly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet The Team Section */}
      <section id="team" className="py-24 bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 relative overflow-hidden transition-colors duration-200">
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16 section-heading">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-zinc-100 mb-4 tracking-tight">Meet The Developers</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-600 dark:text-zinc-400 text-lg">The Engineers Driving FlatSync's Intelligent Matching & Platform Architecture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {developers.map((dev, idx) => (
              <div key={idx} className="dev-card bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-3xl text-left shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-14 h-14 ${dev.color} text-white font-extrabold text-xl rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      {dev.initials}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">{dev.name}</h3>
                      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">{dev.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed mb-6 font-normal">
                    {dev.bio}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200/60 dark:border-zinc-800 text-xs font-semibold text-gray-400 dark:text-zinc-500">
                  FlatSync Development Team
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-50 dark:bg-zinc-900/40 border-t border-gray-100 dark:border-zinc-900 relative transition-colors duration-200">
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16 section-heading">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-zinc-100 mb-4 tracking-tight">Contact Us</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-600 dark:text-zinc-400 text-lg">Have Questions, Feedback, Or Business Inquiries? Reach Out To The FlatSync Team.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-3xl text-center shadow-sm flex flex-col items-center">
              <div className="w-14 h-14 bg-primary-50 dark:bg-zinc-800 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-4">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-lg mb-1">Email Us</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">We'll Respond Within 24 Hours</p>
              <a href="mailto:support@flatsync.com" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                support@flatsync.com
              </a>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-3xl text-center shadow-sm flex flex-col items-center">
              <div className="w-14 h-14 bg-primary-50 dark:bg-zinc-800 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-4">
                <Phone className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-lg mb-1">Call Us</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">Mon-Fri From 9am To 6pm</p>
              <a href="tel:+9198XXX12XXX" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                +91 98XXX 12XXX
              </a>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-3xl text-center shadow-sm flex flex-col items-center">
              <div className="w-14 h-14 bg-primary-50 dark:bg-zinc-800 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-lg mb-1">Our Location</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">FlatSync Headquarters</p>
              <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                New Delhi, India
              </span>
            </div>
          </div>

          {/* Web3Forms Contact Form */}
          <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 md:p-12 rounded-3xl shadow-xl text-left">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Send Us A Message</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mb-8">Fill Out The Form Below And We'll Get Back To You Shorty.</p>

            <form onSubmit={handleContactSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-zinc-300 mb-2">Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Ajay Kapoor"
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-zinc-300 mb-2">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-zinc-300 mb-2">Subject</label>
                <input
                  required
                  type="text"
                  placeholder="How can we help?"
                  value={contactForm.subject}
                  onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-zinc-300 mb-2">Message</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Type your message here..."
                  value={contactForm.message}
                  onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition resize-none"
                ></textarea>
              </div>

              <button
                disabled={sendingContact}
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendingContact ? 'Sending Message...' : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 transition-colors duration-200">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src={fsLogo} alt="FlatSync Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">FlatSync</span>
          </div>

          <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">
            © {new Date().getFullYear()} FlatSync Inc. All Rights Reserved. Built For Smarter Shared Living.
          </p>
        </div>
      </footer>

      {selectedListing && renderDetailsModal()}
      {renderLightboxModal()}
    </div>
  );
};

export default Home;
