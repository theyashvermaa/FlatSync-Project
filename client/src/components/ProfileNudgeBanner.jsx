import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isProfileIncomplete } from '../utils/profileCheck';
import { Sparkles, ArrowRight, X, UserCheck } from 'lucide-react';

const ProfileNudgeBanner = ({ forceShow = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissal state whenever the active user changes (e.g. login/switch account)
  useEffect(() => {
    setDismissed(false);
  }, [user?._id]);

  if (!user) return null;

  const incomplete = isProfileIncomplete(user);

  // If profile is fully completed and forceShow is not set, do not show banner
  if (!incomplete && !forceShow) return null;

  // If user clicked dismiss (X) on this page view, hide until refresh or navigation
  if (dismissed && !forceShow) return null;

  const handleUpdateProfile = () => {
    navigate('/profile?edit=true');
  };

  return (
    <div className="bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden mb-6 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      {/* Background glow graphics */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute right-20 -top-10 w-32 h-32 bg-primary-400/20 rounded-full blur-xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-xl text-yellow-300 flex-shrink-0 mt-0.5 sm:mt-0 border border-white/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-base sm:text-lg text-white tracking-wide">
                Complete Your Profile for 3x Faster Matches!
              </h4>
              <span className="bg-yellow-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Recommended
              </span>
            </div>
            <p className="text-xs sm:text-sm text-primary-100 mt-1 leading-relaxed">
              Completing your profile with details like your <strong className="text-white font-semibold">age, bio, photo, and mobile number</strong> gives you a significantly higher chance of finding flats or flatmates faster.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleUpdateProfile}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-amber-100 text-primary-700 dark:bg-white dark:hover:bg-amber-100 dark:text-primary-700 font-bold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition active:scale-[0.98] text-xs sm:text-sm whitespace-nowrap"
          >
            <UserCheck className="w-4 h-4 text-primary-600" />
            Update Profile Now
            <ArrowRight className="w-4 h-4" />
          </button>
          {!forceShow && (
            <button
              onClick={() => setDismissed(true)}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition flex-shrink-0"
              title="Hide for now (reappears on refresh/login until updated)"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileNudgeBanner;
