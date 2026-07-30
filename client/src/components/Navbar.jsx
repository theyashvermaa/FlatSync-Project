import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Bell, LogOut, MessageCircle, Sun, Moon, LayoutGrid, X, Home, Compass, Users, MapPin, Info, PhoneCall, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import fsLogo from '../assets/FS Logo.png';
import { isProfileIncomplete } from '../utils/profileCheck';

const Navbar = ({ onLoginClick, onRegisterClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, setNotifications } = useSocket();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const navRef = useRef(null);

  // Theme support
  const [theme, setTheme] = useState(
    localStorage.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Lock body scroll when mobile side menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -100, opacity: 0, duration: 0.8, ease: "back.out(1.7)"
    });
    gsap.from(".nav-item", {
      y: -20, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.4, ease: "power2.out"
    });
  }, { scope: navRef });

  useEffect(() => {
    if (!isAuthenticated || !showDropdown) return;

    const fetchAll = async () => {
      try {
        const incomingRes = await api.get('/requests/incoming');
        setPendingRequests(incomingRes.data.filter(r => r.status === 'pending'));

        const incoming = incomingRes.data.filter(r => r.status === 'accepted');
        const outgoingRes = await api.get('/requests/outgoing');
        const outgoing = outgoingRes.data.filter(r => r.status === 'accepted');

        const seen = new Set();
        const merged = [];

        incoming.forEach(r => {
          const otherId = r.fromUser._id;
          if (!seen.has(otherId)) {
            seen.add(otherId);
            merged.push({ _id: r._id, otherUser: r.fromUser });
          }
        });

        outgoing.forEach(r => {
          const otherId = r.toUser._id;
          if (!seen.has(otherId)) {
            seen.add(otherId);
            merged.push({ _id: r._id, otherUser: r.toUser });
          }
        });

        setAcceptedConnections(merged);
      } catch (err) {
        console.error('Failed to fetch requests:', err);
      }
    };

    fetchAll();
  }, [showDropdown, isAuthenticated]);

  const handleAccept = async (id) => {
    try {
      await api.put(`/requests/${id}/accept`);
      toast.success('Request accepted');

      const justAccepted = pendingRequests.find(r => r._id === id);
      if (justAccepted) {
        const otherId = justAccepted.fromUser._id;
        setAcceptedConnections(prev => {
          const alreadyThere = prev.find(c => c.otherUser._id === otherId);
          if (alreadyThere) return prev;
          return [...prev, { _id: id, otherUser: justAccepted.fromUser }];
        });
      }

      setPendingRequests(prev => prev.filter(r => r._id !== id));
      setNotifications(prev => Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to accept');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/requests/${id}/reject`);
      toast.success('Request rejected');
      setPendingRequests(prev => prev.filter(r => r._id !== id));
      setNotifications(prev => Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to reject');
    }
  };

  const handleGoHome = (e) => {
    setIsMobileMenuOpen(false);
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const openChat = (otherUserId) => {
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
    navigate(`/chats/${otherUserId}`);
  };

  const handleScrollToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  return (
    <>
      <nav ref={navRef} className="fixed top-0 left-0 right-0 h-18 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-gray-100/50 dark:border-zinc-800/50 shadow-xs z-50 px-4 sm:px-6 flex items-center justify-between transition-all duration-300">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 nav-item">
          <Link to="/" onClick={handleGoHome} className="flex items-center gap-2 sm:gap-2.5 group">
            <img src={fsLogo} alt="FlatSync Logo" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain rounded-xl transition-transform group-hover:scale-105" />
            <span className="text-xl sm:text-2xl md:text-[1.65rem] font-black tracking-tight text-primary-600 dark:text-primary-500 drop-shadow-xs">FlatSync</span>
          </Link>
        </div>

        {/* Desktop Navigation Links (Hidden on mobile/phone screens to prevent overlap) */}
        <div className="hidden md:flex items-center gap-5 lg:gap-7 nav-item">
          <Link to="/" onClick={handleGoHome} className="nav-item-animated text-gray-700 dark:text-zinc-300 font-bold text-sm lg:text-[1.05rem] transition-colors hover:text-primary-600 dark:hover:text-primary-400">
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/browse" className="nav-item-animated text-gray-700 dark:text-zinc-300 font-bold text-sm lg:text-[1.05rem] transition-colors hover:text-primary-600 dark:hover:text-primary-400">
                Browse Flats
              </Link>
              <Link to="/chats" className="nav-item-animated text-gray-700 dark:text-zinc-300 font-bold text-sm lg:text-[1.05rem] transition-colors hover:text-primary-600 dark:hover:text-primary-400">
                Messages
              </Link>
            </>
          )}
          <button
            onClick={() => handleScrollToSection('about')}
            className="nav-item-animated text-gray-700 dark:text-zinc-300 font-bold text-sm lg:text-[1.05rem] transition-colors bg-transparent border-none cursor-pointer p-0 font-sans hover:text-primary-600 dark:hover:text-primary-400"
          >
            About
          </button>
          <button
            onClick={() => handleScrollToSection('contact')}
            className="nav-item-animated text-gray-700 dark:text-zinc-300 font-bold text-sm lg:text-[1.05rem] transition-colors bg-transparent border-none cursor-pointer p-0 font-sans hover:text-primary-600 dark:hover:text-primary-400"
          >
            Contact
          </button>
        </div>

        {/* Right Section Actions & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3.5 relative nav-item">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-primary-500" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAuthenticated ? (
            <>
              <div className="relative cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowDropdown(!showDropdown)}>
                <Bell className="w-6 h-6 text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-500 transition" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-xs shadow-rose-500/50">
                    {notifications}
                  </span>
                )}
              </div>

              {showDropdown && (
                <div className="absolute top-12 right-0 w-72 sm:w-80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 transform transition-all duration-200 origin-top-right max-h-[80vh] overflow-y-auto z-[9999]">
                  <h4 className="font-bold text-gray-800 dark:text-zinc-100 border-b border-gray-100 dark:border-zinc-800 pb-2">Incoming Requests</h4>
                  {pendingRequests.length === 0
                    ? <p className="text-sm text-gray-500 dark:text-zinc-400">No new requests</p>
                    : pendingRequests.map(req => (
                      <div key={req._id} className="flex gap-3 items-center p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-transparent hover:border-gray-100 dark:hover:border-zinc-700">
                        <img src={req.fromUser.photoUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover shadow-xs" alt={req.fromUser.name} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-gray-900 dark:text-zinc-100">{req.fromUser.name}</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{req.listingId?.fullName}'s listing</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => handleAccept(req._id)} className="bg-primary-500 hover:bg-primary-600 text-white text-xs px-2 py-1 rounded-lg transition shadow-xs font-semibold">Accept</button>
                          <button onClick={() => handleReject(req._id)} className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 text-xs px-2 py-1 rounded-lg transition">Reject</button>
                        </div>
                      </div>
                    ))
                  }
                  {acceptedConnections.length > 0 && (
                    <>
                      <h4 className="font-bold text-gray-800 dark:text-zinc-100 border-b border-gray-100 dark:border-zinc-800 pb-2 mt-2">💬 Your Connections</h4>
                      {acceptedConnections.map(conn => (
                        <div key={conn._id} className="flex gap-3 items-center p-2 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl transition-colors border border-transparent hover:border-amber-100 dark:hover:border-amber-900/40">
                          <img src={conn.otherUser.photoUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover shadow-xs" alt={conn.otherUser.name} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-gray-900 dark:text-zinc-100">{conn.otherUser.name}</p>
                            <p className="text-xs text-primary-600 dark:text-primary-400">Connected ✓</p>
                          </div>
                          <button
                            onClick={() => openChat(conn.otherUser._id)}
                            className="flex items-center gap-1 bg-primary-500 hover:bg-primary-600 text-white text-xs px-2 py-1.5 rounded-lg transition shadow-xs font-semibold"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Chat
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              <Link to="/profile" className="hidden sm:flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800 py-1.5 px-2.5 rounded-full transition-all group">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-xs bg-gray-100 dark:bg-zinc-800 group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold group-hover:scale-105 transition-transform">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="font-semibold text-sm text-gray-700 dark:text-zinc-300 hidden md:block">{user.name}</span>
                {isProfileIncomplete(user) && (
                  <span className="bg-amber-400 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                    Update
                  </span>
                )}
              </Link>

              <button onClick={() => { logout(); navigate('/'); }} className="hidden sm:block p-2 text-gray-500 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 rounded-full transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button onClick={onLoginClick} className="text-gray-700 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 font-semibold px-4 py-2 transition-colors text-sm">Log In</button>
              <button onClick={onRegisterClick} className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-full font-bold transition-all shadow-md shadow-primary-600/20 hover:shadow-primary-600/40 hover:-translate-y-0.5 text-sm">Sign Up</button>
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-gray-100/90 dark:bg-zinc-800/90 text-gray-700 dark:text-zinc-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all duration-200 border border-gray-200/60 dark:border-zinc-700/60 flex items-center gap-1.5 shadow-xs"
            aria-label="Open Navigation Menu"
          >
            <LayoutGrid className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </button>
        </div>
      </nav>

      {/* Mobile Side Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9998] md:hidden transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed top-0 right-0 h-full w-[82vw] max-w-[320px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-l border-gray-200/80 dark:border-zinc-800/80 shadow-2xl z-[9999] p-6 flex flex-col justify-between overflow-y-auto md:hidden animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-zinc-800/80 mb-6">
                <Link to="/" onClick={handleGoHome} className="flex items-center gap-2">
                  <img src={fsLogo} alt="FlatSync Logo" className="w-8 h-8 object-contain rounded-lg" />
                  <span className="text-xl font-black text-primary-600 dark:text-primary-500">FlatSync</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <Link to="/" onClick={handleGoHome} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-gray-800 dark:text-zinc-200 hover:bg-primary-50 dark:hover:bg-zinc-900 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                  <Home className="w-5 h-5 text-primary-500" />
                  <span>Home</span>
                </Link>
                {isAuthenticated && (
                  <>
                    <Link to="/browse" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-gray-800 dark:text-zinc-200 hover:bg-primary-50 dark:hover:bg-zinc-900 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                      <Compass className="w-5 h-5 text-primary-500" />
                      <span>Browse Flats</span>
                    </Link>
                    <Link to="/chats" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-gray-800 dark:text-zinc-200 hover:bg-primary-50 dark:hover:bg-zinc-900 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                      <MessageCircle className="w-5 h-5 text-primary-500" />
                      <span>Messages</span>
                    </Link>
                  </>
                )}
                <button onClick={() => handleScrollToSection('about')} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-gray-800 dark:text-zinc-200 hover:bg-primary-50 dark:hover:bg-zinc-900 hover:text-primary-600 dark:hover:text-primary-400 transition-all text-left w-full bg-transparent border-none font-sans cursor-pointer">
                  <Info className="w-5 h-5 text-primary-500" />
                  <span>About</span>
                </button>
                <button onClick={() => handleScrollToSection('contact')} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-gray-800 dark:text-zinc-200 hover:bg-primary-50 dark:hover:bg-zinc-900 hover:text-primary-600 dark:hover:text-primary-400 transition-all text-left w-full bg-transparent border-none font-sans cursor-pointer">
                  <PhoneCall className="w-5 h-5 text-primary-500" />
                  <span>Contact</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800/80 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:bg-primary-50 dark:hover:bg-zinc-800/80 transition-colors">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-xs" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
                        {user?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-bold text-sm text-gray-900 dark:text-zinc-100 truncate">{user.name}</p>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">View Profile</p>
                    </div>
                  </Link>
                  <button onClick={() => { setIsMobileMenuOpen(false); logout(); navigate('/'); }} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <button onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }} className="w-full py-3 px-4 rounded-2xl border-2 border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                    Log In
                  </button>
                  <button onClick={() => { setIsMobileMenuOpen(false); onRegisterClick(); }} className="w-full py-3 px-4 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-lg shadow-primary-600/30 transition-all cursor-pointer">
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Navbar;