import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Bell, LogOut, Home, PlusCircle, MessageCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const Navbar = ({ onLoginClick, onRegisterClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, setNotifications } = useSocket();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const navRef = useRef(null);

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
        // Incoming requests (User B sees these)
        const incomingRes = await api.get('/requests/incoming');
        setPendingRequests(incomingRes.data.filter(r => r.status === 'pending'));

        // ✅ Accepted from BOTH sides — User B's accepted incoming + User A's accepted outgoing
        const incoming = incomingRes.data.filter(r => r.status === 'accepted');

        // Outgoing requests that got accepted (User A sees these)
        const outgoingRes = await api.get('/requests/outgoing');
        const outgoing = outgoingRes.data.filter(r => r.status === 'accepted');

        // Merge both and deduplicate by the other person's ID
        const seen = new Set();
        const merged = [];

        // For incoming accepted — other person is fromUser
        incoming.forEach(r => {
          const otherId = r.fromUser._id;
          if (!seen.has(otherId)) {
            seen.add(otherId);
            merged.push({ _id: r._id, otherUser: r.fromUser });
          }
        });

        // For outgoing accepted — other person is toUser
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

      // Move from pending to connections
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

  const openChat = (otherUserId) => {
    setShowDropdown(false);
    navigate(`/chats/${otherUserId}`);
  };

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-xl border-b border-gray-100/50 shadow-sm z-50 px-6 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-2 nav-item">
        <Home className="w-6 h-6 text-primary-600" />
        <Link to="/" className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent drop-shadow-sm">FlatSync</Link>
      </div>

      <div className="flex items-center gap-6">
        <Link to="/" className="nav-item text-gray-600 hover:text-primary-600 transition-colors font-medium relative group">
          Home<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full"></span>
        </Link>
        <a href="#about" className="nav-item text-gray-600 hover:text-primary-600 transition-colors font-medium relative group">
          About<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full"></span>
        </a>
        <a href="#contact" className="nav-item text-gray-600 hover:text-primary-600 transition-colors font-medium relative group">
          Contact<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full"></span>
        </a>
        {isAuthenticated && user?.onboardingComplete && (
          <>
            <Link to="/find-flat" className="nav-item text-gray-600 hover:text-primary-600 transition-colors font-medium relative group">
              Find Flat<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/chats" className="nav-item text-gray-600 hover:text-primary-600 transition-colors font-medium relative group">
              Chats<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/list-flat" className="nav-item text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 hover:scale-105 transition-transform">
              <PlusCircle className="w-4 h-4"/> List a Flat Vacancy
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 relative nav-item">
        {isAuthenticated ? (
          <>
            <div className="relative cursor-pointer hover:scale-110 transition-transform" onClick={() => setShowDropdown(!showDropdown)}>
              <Bell className="w-6 h-6 text-gray-600 hover:text-primary-600 transition" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm shadow-rose-500/50">
                  {notifications}
                </span>
              )}
            </div>

            {showDropdown && (
              <div className="absolute top-10 right-10 w-80 bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-xl p-4 flex flex-col gap-3 transform transition-all duration-200 origin-top-right max-h-[80vh] overflow-y-auto">

                {/* ── PENDING REQUESTS ── */}
                <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Incoming Requests</h4>
                {pendingRequests.length === 0
                  ? <p className="text-sm text-gray-500">No new requests</p>
                  : pendingRequests.map(req => (
                    <div key={req._id} className="flex gap-3 items-center p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                      <img src={req.fromUser.photoUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-gray-900">{req.fromUser.name}</p>
                        <p className="text-xs text-gray-500 truncate">{req.listingId?.fullName}'s listing</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleAccept(req._id)} className="bg-primary-500 hover:bg-primary-600 text-white text-xs px-2 py-1 rounded transition shadow-sm">Accept</button>
                        <button onClick={() => handleReject(req._id)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded transition">Reject</button>
                      </div>
                    </div>
                  ))
                }

                {/* ── ACCEPTED CONNECTIONS — BOTH USER A AND USER B SEE THIS ── */}
                {acceptedConnections.length > 0 && (
                  <>
                    <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mt-2">💬 Your Connections</h4>
                    {acceptedConnections.map(conn => (
                      <div key={conn._id} className="flex gap-3 items-center p-2 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100">
                        <img src={conn.otherUser.photoUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-gray-900">{conn.otherUser.name}</p>
                          <p className="text-xs text-emerald-600">Connected ✓</p>
                        </div>
                        <button
                          onClick={() => openChat(conn.otherUser._id)}
                          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-2 py-1.5 rounded-lg transition shadow-sm"
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

            <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-100 py-1.5 px-2.5 rounded-full transition-all group">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm bg-gray-100 group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold group-hover:scale-105 transition-transform">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="font-semibold text-sm text-gray-700 hidden sm:block">{user.name}</span>
            </Link>
            <button onClick={() => { logout(); navigate('/'); }} className="p-2 text-gray-500 hover:bg-rose-50 hover:text-rose-600 rounded-full transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <button onClick={onLoginClick} className="text-gray-700 hover:text-primary-600 font-semibold px-4 py-2 transition-colors">Login</button>
            <button onClick={onRegisterClick} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-0.5">Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;