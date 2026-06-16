import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import api from '../utils/axiosInstance';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home = ({ onRegisterClick }) => {
  const navigate = useNavigate();
  const container = useRef(null);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/listings');
        // Get 5-6 listings for featured
        setFeaturedListings(data.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch featured listings:', error);
      } finally {
        setLoadingListings(false);
      }
    };
    fetchFeatured();
  }, []);

  const developers = [
    { initials: 'SM', name: 'Somesh', role: 'Backend & DB', color: 'bg-blue-500' },
    { initials: 'KD', name: 'Kandarp', role: 'Web Sockets', color: 'bg-purple-500' },
    { initials: 'YS', name: 'Yash', role: 'Frontend', color: 'bg-green-500' },
    { initials: 'AS', name: 'Aashish', role: 'Design', color: 'bg-rose-500' },
    { initials: 'TR', name: 'Tarang', role: 'Deployment', color: 'bg-amber-500' }
  ];

  useGSAP(() => {
    // Hero Animations
    const tl = gsap.timeline();
    tl.fromTo('.hero-element', {
      y: 50,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 0.2
    });

    // About Section Animations
    gsap.utils.toArray('.dev-card').forEach((card, i) => {
      gsap.fromTo(card, {
        y: 50,
        opacity: 0
      }, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%'
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.5)',
        delay: i * 0.1
      });
    });

    // Contact Section Animations
    gsap.utils.toArray('.contact-card').forEach((card, i) => {
      gsap.fromTo(card, {
        y: 40,
        opacity: 0
      }, {
        scrollTrigger: {
          trigger: card,
          start: 'top 90%'
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        delay: i * 0.15
      });
    });
  }, { scope: container });

  return (
    <div ref={container} className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100/50 via-white to-white"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl pt-16">
          <h1 className="hero-element text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 drop-shadow-sm">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Perfect Flatmate</span>
          </h1>
          <p className="hero-element text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            FlatSync helps you connect with compatible flatmates and find the perfect place to live, tailored specifically to your lifestyle and preferences.
          </p>
          
          <div className="hero-element flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/find-flat')} 
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-bold text-lg shadow-xl shadow-primary-500/40 transition-all flex items-center justify-center gap-2 group transform hover:-translate-y-1 hover:shadow-primary-500/60"
            >
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/list-flat')} 
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-primary-300 rounded-full font-bold text-lg transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              List a New Flat
            </button>
          </div>
        </div>
      </section>

      {/* How FlatSync Works Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">How FlatSync Works</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-600 text-lg">Your perfect flatmate is just three simple steps away.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors shadow-sm">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">1. Create Profile</h3>
              <p className="text-gray-600 leading-relaxed">Tell us about yourself, your habits, and what you're looking for in a flatmate or a flat.</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors shadow-sm">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">2. Find Matches</h3>
              <p className="text-gray-600 leading-relaxed">Browse through curated listings and compatible flatmates based on your preferences.</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors shadow-sm">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">3. Connect</h3>
              <p className="text-gray-600 leading-relaxed">Send requests, chat securely, and meet your new flatmate. It's that simple!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Featured Listings</h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"></div>
            </div>
          </div>
          
          {loadingListings ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : featuredListings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No listings available</h3>
              <p className="text-gray-500 mb-6">Be the first to list a flat in your area!</p>
              <button 
                onClick={() => navigate('/list-flat')} 
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-semibold transition-all shadow-md"
              >
                List a Flat
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex overflow-x-auto gap-6 pb-8 custom-scrollbar snap-x">
                {featuredListings.map((listing) => (
                  <div 
                    key={listing._id} 
                    className="min-w-[300px] md:min-w-[350px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col snap-start group cursor-pointer"
                    onClick={() => navigate('/find-flat')}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={(listing.photoUrls && listing.photoUrls.length > 0) ? listing.photoUrls[0] : 'https://via.placeholder.com/400x300'} 
                        alt="flat" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary-700 shadow-sm">
                        {listing.vacancyCount} Spot{listing.vacancyCount > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 text-xl mb-2 line-clamp-1">{listing.owner?.name || listing.fullName}'s Place</h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{listing.address}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                        <span className="text-sm font-semibold text-gray-700">Explore Details</span>
                        <span className="text-primary-600 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">
                          View <ArrowRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Show More Card */}
                <div 
                  onClick={() => navigate('/find-flat')}
                  className="min-w-[200px] bg-primary-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary-100 transition-colors border border-primary-100 snap-start group"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-8 h-8 text-primary-600" />
                  </div>
                  <span className="font-bold text-primary-800 text-lg">Show More</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50 border-t border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50/80 via-transparent to-transparent"></div>
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Meet the Team</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {developers.map((dev, i) => (
              <div key={i} className="dev-card bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-2 transition-all border border-gray-100 flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full ${dev.color} text-white flex items-center justify-center text-2xl font-bold mb-5 shadow-inner shadow-black/20 ring-4 ring-white/50`}>
                  {dev.initials}
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg mb-1">{dev.name}</h3>
                <p className="text-primary-600 font-semibold text-sm mb-3">{dev.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">Building the core of FlatSync.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white border-t border-gray-100 mt-auto relative">
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-12 tracking-tight">Get in Touch</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-3xl mx-auto">
            <div className="contact-card p-8 bg-gray-50 hover:bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center group transform hover:-translate-y-1">
               <div className="w-16 h-16 bg-primary-100 group-hover:bg-primary-500 group-hover:text-white transition-colors rounded-2xl flex items-center justify-center mb-6 shadow-sm"><span className="text-2xl">✉️</span></div>
               <h3 className="font-bold text-gray-900 mb-2 text-lg">Email</h3>
               <p className="text-gray-600 font-medium">support@flatsync.in</p>
            </div>
            <div className="contact-card p-8 bg-gray-50 hover:bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center group transform hover:-translate-y-1">
               <div className="w-16 h-16 bg-primary-100 group-hover:bg-primary-500 group-hover:text-white transition-colors rounded-2xl flex items-center justify-center mb-6 shadow-sm"><span className="text-2xl">📞</span></div>
               <h3 className="font-bold text-gray-900 mb-2 text-lg">Phone</h3>
               <p className="text-gray-600 font-medium">+91 98765 43210</p>
            </div>
            <div className="contact-card p-8 bg-gray-50 hover:bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center group transform hover:-translate-y-1">
               <div className="w-16 h-16 bg-primary-100 group-hover:bg-primary-500 group-hover:text-white transition-colors rounded-2xl flex items-center justify-center mb-6 shadow-sm"><span className="text-2xl">📍</span></div>
               <h3 className="font-bold text-gray-900 mb-2 text-lg">Office</h3>
               <p className="text-gray-600 font-medium">204 Tech Park Sector 62<br/>Noida UP 201309</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
