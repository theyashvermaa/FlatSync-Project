import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Key, Search, MapPin, Sparkles, ShieldCheck, Heart, MessageCircle, Star, ArrowRight } from 'lucide-react';
import fsLogo from '../assets/FS Logo.png';

gsap.registerPlugin(ScrollTrigger);

const AppleScrollStory = ({ onRegisterClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const containerRef = useRef(null);
  const skylineRef = useRef(null);
  const buildingRef = useRef(null);
  const interiorRef = useRef(null);
  const pinMarkersRef = useRef(null);
  const cardsRef = useRef(null);

  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const text3Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=300%',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1
        }
      });

      // Initial Setup
      gsap.set(skylineRef.current, { scale: 1, opacity: 1 });
      gsap.set(buildingRef.current, { scale: 0.4, opacity: 0 });
      gsap.set(interiorRef.current, { scale: 0.5, opacity: 0 });
      gsap.set(pinMarkersRef.current.children, { scale: 0, opacity: 0, y: 30 });
      gsap.set(cardsRef.current.children, { scale: 0.7, opacity: 0, y: 50, rotateX: 15 });

      gsap.set(text1Ref.current, { opacity: 1, y: 0 });
      gsap.set(text2Ref.current, { opacity: 0, y: 40 });
      gsap.set(text3Ref.current, { opacity: 0, y: 40 });

      // ── STAGE 1: Skyline Zoom -> Transition to Building (0% to 35%) ──
      tl.to(text1Ref.current, { opacity: 0, y: -40, duration: 1 }, 0.5)
        .to(skylineRef.current, { scale: 2.5, opacity: 0.2, duration: 2, ease: 'power2.inOut' }, 0)
        .to(buildingRef.current, { scale: 1, opacity: 1, duration: 2, ease: 'power2.out' }, 0.8)
        .to(text2Ref.current, { opacity: 1, y: 0, duration: 1 }, 1.2);

      // ── STAGE 2: Building Zoom + Map Pin Markers Pop-in (35% to 70%) ──
      tl.to(pinMarkersRef.current.children, {
        scale: 1,
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'back.out(1.7)'
      }, 1.5)
        .to(text2Ref.current, { opacity: 0, y: -40, duration: 1 }, 2.2)
        .to(buildingRef.current, { scale: 2.8, opacity: 0.1, duration: 2, ease: 'power2.inOut' }, 2.0)
        .to(pinMarkersRef.current, { opacity: 0, duration: 1 }, 2.5)

      // ── STAGE 3: Enter Flat Interior + Cards & Compatibility Float-in (70% to 100%) ──
        .to(interiorRef.current, { scale: 1, opacity: 1, duration: 2, ease: 'power2.out' }, 2.6)
        .to(text3Ref.current, { opacity: 1, y: 0, duration: 1 }, 3.0)
        .to(cardsRef.current.children, {
          scale: 1,
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.25,
          duration: 1.5,
          ease: 'power3.out'
        }, 3.2);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleIHaveFlat = () => {
    localStorage.setItem('onboardingUserType', '1');
    if (isAuthenticated) {
      navigate('/onboarding');
    } else {
      onRegisterClick();
    }
  };

  const handleIDontHaveFlat = () => {
    localStorage.setItem('onboardingUserType', '2');
    if (isAuthenticated) {
      navigate('/onboarding');
    } else {
      onRegisterClick();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full bg-zinc-950 text-white overflow-hidden select-none">
      {/* Sticky Viewport Container */}
      <div className="h-screen w-full sticky top-0 flex items-center justify-center overflow-hidden">
        
        {/* ── STAGE 1 BACKGROUND: City Skyline ── */}
        <div
          ref={skylineRef}
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none transform-gpu origin-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-zinc-950/70 to-zinc-950 z-10"></div>
          {/* Panoramic Skyline Graphic */}
          <div className="w-full h-full opacity-60 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-zinc-950 flex items-end justify-center pb-20">
            <svg className="w-full h-96 text-indigo-500/20 fill-current" viewBox="0 0 1200 400" preserveAspectRatio="none">
              <path d="M0,400 L0,250 L40,250 L40,180 L80,180 L80,250 L120,250 L120,120 L160,120 L160,250 L220,250 L220,90 L260,90 L260,250 L320,250 L320,150 L380,150 L380,250 L450,250 L450,70 L500,70 L500,250 L560,250 L560,130 L620,130 L620,250 L700,250 L700,110 L760,110 L760,250 L840,250 L840,160 L900,160 L900,250 L980,250 L980,80 L1040,80 L1040,250 L1120,250 L1120,190 L1200,190 L1200,400 Z" />
            </svg>
          </div>
        </div>

        {/* ── STAGE 2 BACKGROUND: Apartment Building Facade ── */}
        <div
          ref={buildingRef}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none transform-gpu origin-center"
        >
          <div className="w-full max-w-4xl h-[70vh] rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/60 to-zinc-950/90 shadow-2xl backdrop-blur-md p-6 grid grid-cols-4 gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent"></div>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-indigo-400/20 bg-zinc-900/60 p-4 flex flex-col justify-between shadow-inner relative group">
                <div className="w-full h-2 bg-indigo-500/20 rounded-full"></div>
                <div className="flex justify-between items-center text-[10px] text-indigo-300/60">
                  <span>Unit {101 + i}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── STAGE 2 INTERACTIVE MAP PIN MARKERS ── */}
        <div ref={pinMarkersRef} className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          <div className="absolute top-1/4 left-1/5 bg-zinc-900/90 border border-primary-500/40 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            📍 Connaught Place (12 Flats Available)
          </div>
          <div className="absolute top-1/3 right-1/4 bg-zinc-900/90 border border-emerald-500/40 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            📍 Cyber City (8 Verified Matches)
          </div>
          <div className="absolute bottom-1/3 left-1/3 bg-zinc-900/90 border border-indigo-500/40 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
            📍 Indiranagar (95% Lifestyle Fit)
          </div>
        </div>

        {/* ── STAGE 3 BACKGROUND: Modern Flat Room Interior ── */}
        <div
          ref={interiorRef}
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none transform-gpu origin-center"
        >
          <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-950/30 via-zinc-950 to-zinc-950"></div>
          </div>
        </div>

        {/* ── FLOATING HEADINGS FOR EACH STAGE ── */}
        <div className="absolute top-20 z-40 text-center max-w-3xl px-6 pointer-events-none">
          <div ref={text1Ref} className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="px-3.5 py-1 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-full text-xs font-black tracking-widest uppercase mb-4">
              Urban Living Reimagined
            </span>
            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-2xl">
              Every City Has a Story.
            </h2>
            <p className="text-base sm:text-lg text-gray-400 mt-3 max-w-xl font-medium leading-relaxed">
              Over 80% of young professionals struggle to find compatible flatmates nearby. FlatSync changes everything.
            </p>
          </div>

          <div ref={text2Ref} className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black tracking-widest uppercase mb-4">
              Precision Location Engine
            </span>
            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-2xl">
              Zoom Into Verified Flats.
            </h2>
            <p className="text-base sm:text-lg text-gray-400 mt-3 max-w-xl font-medium leading-relaxed">
              Pinpoint real vacancy rooms on interactive OpenStreetMap coordinates with transparent rent & vacancy details.
            </p>
          </div>

          <div ref={text3Ref} className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="px-3.5 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-black tracking-widest uppercase mb-4">
              AI Lifestyle Compatibility
            </span>
            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-2xl">
              Meet Your Ideal Flatmate.
            </h2>
            <p className="text-base sm:text-lg text-gray-400 mt-3 max-w-xl font-medium leading-relaxed">
              Matching habits, sleep schedules, food choices & budgets before you move in.
            </p>
          </div>
        </div>

        {/* ── STAGE 3 INTERACTIVE 3D CARDS ── */}
        <div ref={cardsRef} className="relative z-50 max-w-5xl w-full px-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-24 pointer-events-auto">
          
          {/* Card 1: AI Match Badge Card */}
          <div className="bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between hover:border-primary-500/50 transition-all hover:-translate-y-2 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary-500/20 text-primary-400 rounded-2xl border border-primary-500/30">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-500/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                94% AI Match
              </span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-white mb-1">Lifestyle Alignment</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Both early risers, vegetarian kitchen preference, non-smokers, and flexible bill splitters.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary-400">
                <ShieldCheck className="w-4 h-4" /> Verified Profile Score
              </div>
            </div>
          </div>

          {/* Card 2: Active Listing Card */}
          <div className="bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between hover:border-indigo-500/50 transition-all hover:-translate-y-2 group">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                  1 Vacancy Available
                </span>
                <span className="text-xs font-bold text-gray-400">₹14,000 / mo</span>
              </div>
              <h3 className="font-bold text-xl text-white mb-1">Luxury 2BHK Apartment</h3>
              <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                Connaught Place • High-speed WiFi, Gym, Washing Machine & Power Backup included.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary-400" /> 1.2 km away
              </span>
              <span className="text-emerald-400 font-bold">Move-in Ready</span>
            </div>
          </div>

          {/* Card 3: Live Chat Preview */}
          <div className="bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between hover:border-purple-500/50 transition-all hover:-translate-y-2 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
                YV
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Yash Verma</h4>
                <p className="text-[10px] text-emerald-400 font-semibold">Active Now • Flat Owner</p>
              </div>
            </div>
            <div className="bg-zinc-800/80 rounded-2xl p-3 text-xs text-gray-300 italic mb-4 border border-zinc-700/50">
              "Hey! I noticed we match 94% on lifestyle. Would you like to check out the flat this weekend?"
            </div>
            <button
              onClick={handleIDontHaveFlat}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Start Conversation
            </button>
          </div>

        </div>

        {/* ── ACTION CTA BUTTONS AT BOTTOM ── */}
        <div className="absolute bottom-8 z-50 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleIHaveFlat}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl shadow-primary-600/30 transition active:scale-95 text-sm"
          >
            <Key className="w-4 h-4" /> I Have a Flat
          </button>
          <button
            onClick={handleIDontHaveFlat}
            className="flex items-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 text-white border border-zinc-700/80 font-bold px-6 py-3 rounded-2xl shadow-xl backdrop-blur-xl transition active:scale-95 text-sm"
          >
            <Search className="w-4 h-4" /> I Don't Have a Flat
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default AppleScrollStory;
