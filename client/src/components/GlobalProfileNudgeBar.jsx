import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isProfileIncomplete } from '../utils/profileCheck';
import { UserCheck, Sparkles, ArrowRight, X } from 'lucide-react';

const GlobalProfileNudgeBar = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissal whenever active user changes
  useEffect(() => {
    setDismissed(false);
  }, [user?._id]);

  // Don't show if user is not logged in
  if (!isAuthenticated || !user) return null;

  // Don't show on /profile page (profile page has its own full-fledged banner)
  if (location.pathname === '/profile') return null;

  // Don't show if profile is complete
  if (!isProfileIncomplete(user)) return null;

  // Don't show if user dismissed for current view session
  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-xs sm:text-sm font-medium py-2.5 px-4 sm:px-6 shadow-md relative z-40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2.5 mx-auto sm:mx-0 overflow-hidden">
        <Sparkles className="w-4 h-4 text-yellow-200 flex-shrink-0 animate-pulse" />
        <p className="truncate">
          <strong className="font-extrabold text-white">Your Profile is Incomplete!</strong> Complete your age, bio, and photo to get matched <span className="underline decoration-yellow-300 font-bold">3x faster</span>.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => navigate('/profile?edit=true')}
          className="bg-white hover:bg-amber-100 text-gray-900 dark:bg-white dark:hover:bg-amber-100 dark:text-gray-900 font-bold px-3.5 py-1 sm:py-1.5 rounded-lg shadow-sm hover:shadow transition active:scale-95 text-xs flex items-center gap-1.5 whitespace-nowrap"
        >
          <UserCheck className="w-3.5 h-3.5 text-orange-600 dark:text-orange-600" />
          Update Profile
          <ArrowRight className="w-3 h-3" />
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/20 rounded-md text-white/80 hover:text-white transition"
          title="Dismiss for now (reappears on refresh/login)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GlobalProfileNudgeBar;
