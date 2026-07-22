import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { Camera, Edit, Settings, Home, PlusCircle, Trash2, AlertTriangle, X } from 'lucide-react';
import ProfileNudgeBanner from '../components/ProfileNudgeBanner';
import ListingModal from '../components/ListingModal';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    mobileNumber: user?.mobileNumber || '',
    address: user?.address || '',
    aboutMe: user?.aboutMe || '',
    photo: null,
    preferences: user?.preferences ? JSON.stringify(user.preferences) : ''
  });
  const [photoPreview, setPhotoPreview] = useState(user?.photoUrl);
  const [myListings, setMyListings] = useState([]);

  // Listing modal states
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [selectedListingForEdit, setSelectedListingForEdit] = useState(null);

  // Listing deletion confirmation state
  const [deleteConfirmListing, setDeleteConfirmListing] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMyListings();
  }, []);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      age: user?.age || '',
      mobileNumber: user?.mobileNumber || '',
      address: user?.address || '',
      aboutMe: user?.aboutMe || '',
      photo: null,
      preferences: user?.preferences ? JSON.stringify(user.preferences) : ''
    });
    setPhotoPreview(user?.photoUrl);
  }, [user]);

  const fetchMyListings = async () => {
    try {
      const { data } = await api.get('/listings/my-listings');
      setMyListings(data);
    } catch {
      toast.error('Failed to load listings');
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setFormData({
        name: user?.name || '',
        age: user?.age || '',
        mobileNumber: user?.mobileNumber || '',
        address: user?.address || '',
        aboutMe: user?.aboutMe || '',
        photo: null,
        preferences: user?.preferences ? JSON.stringify(user.preferences) : ''
      });
      setPhotoPreview(user?.photoUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        payload.append(key, formData[key]);
      }
    });

    try {
      const { data } = await api.put('/users/profile', payload);
      setUser({ ...user, ...data });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddListing = () => {
    setSelectedListingForEdit(null);
    setIsListingModalOpen(true);
  };

  const handleOpenEditListing = (listing) => {
    setSelectedListingForEdit(listing);
    setIsListingModalOpen(true);
  };

  const handleSaveListingSuccess = (savedListing, isEditingListing) => {
    if (isEditingListing) {
      setMyListings(prev => prev.map(item => item._id === savedListing._id ? savedListing : item));
    } else {
      setMyListings(prev => [savedListing, ...prev]);
    }
  };

  const handleDeleteListingConfirm = async () => {
    if (!deleteConfirmListing) return;
    setDeleting(true);
    try {
      await api.delete(`/listings/${deleteConfirmListing._id}`);
      setMyListings(prev => prev.filter(item => item._id !== deleteConfirmListing._id));
      toast.success('Listing deleted permanently');
      setDeleteConfirmListing(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      {/* Profile Completion Nudge Banner */}
      <ProfileNudgeBanner />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: User Profile Card & Preferences */}
        <div className="w-full md:w-[35%] flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary-500 to-primary-600 z-0"></div>
            
            <div className="relative mt-8 mb-6 z-10 w-32 h-32">
               <img src={photoPreview || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white dark:border-zinc-900 bg-gray-100 dark:bg-zinc-800 shadow-md" />
               {isEditing && (
                 <label className="absolute bottom-0 right-0 bg-primary-600 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition shadow-lg text-white border-2 border-white dark:border-zinc-900">
                    <Camera className="w-5 h-5"/>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                       if (e.target.files[0]) {
                         setFormData({...formData, photo: e.target.files[0]});
                         setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                       }
                    }} />
                 </label>
               )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-1 z-10">{user?.name}</h2>
            <p className="text-gray-500 dark:text-zinc-400 mb-6 z-10 font-medium">{user?.email}</p>
            
            <button onClick={handleEditToggle} className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition shadow-sm ${isEditing ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700' : 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950/30 dark:text-primary-400 dark:hover:bg-primary-900/50 dark:hover:shadow-none'}`}>
              <Edit className="w-4 h-4"/> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
          
          {!isEditing && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-sm">
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2 text-gray-900 dark:text-zinc-100"><Settings className="w-5 h-5 text-primary-500" /> My Preferences</h3>
              {user?.preferences && Object.keys(user.preferences).filter(k => k !== '_id').length > 0 ? (
                <div className="flex flex-col gap-3">
                  {Object.entries(user.preferences)
                    .filter(([key]) => key !== '_id')
                    .map(([key, value], i) => {
                      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      return (
                        <div key={i} className="flex flex-col border-b border-gray-50 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                          <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{formattedKey}</span>
                          <span className="font-semibold text-gray-800 dark:text-zinc-200">{value}</span>
                        </div>
                      );
                  })}
                </div>
              ) : <p className="text-gray-500 dark:text-zinc-400 text-sm italic">No preferences set.</p>}
            </div>
          )}
        </div>

        {/* Right Column: User Bio/Details & Listing Management */}
        <div className="w-full md:w-[65%] flex flex-col gap-6">
          {isEditing ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-sm mb-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-zinc-100">Edit Information</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Display Name</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Age</label>
                    <input type="number" value={formData.age || ''} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Mobile</label>
                    <input type="text" value={formData.mobileNumber || ''} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Full Address</label>
                    <input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">About Me</label>
                    <textarea rows="4" value={formData.aboutMe || ''} onChange={e => setFormData({...formData, aboutMe: e.target.value})} className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition resize-none" placeholder="Tell potential flatmates about your hobbies, routine, or personality..."></textarea>
                  </div>
                </div>
                <button disabled={loading} type="submit" className="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Processing...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col gap-8 mb-6">
              <div>
                <h3 className="font-bold text-xl mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3 text-gray-800 dark:text-zinc-100">About Me</h3>
                <p className="text-gray-600 dark:text-zinc-300 leading-relaxed">{user?.aboutMe || <span className="italic text-gray-400 dark:text-zinc-500">No details provided yet. Add an about me section to help flatmates know you better.</span>}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800">
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1 font-bold uppercase tracking-wider">Age</p>
                  <p className="font-semibold text-gray-900 dark:text-zinc-100 text-lg">{user?.age || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800">
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1 font-bold uppercase tracking-wider">Mobile Number</p>
                  <p className="font-semibold text-gray-900 dark:text-zinc-100 text-lg">{user?.mobileNumber || 'Not specified'}</p>
                </div>
                <div className="col-span-1 sm:col-span-2 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800">
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1 font-bold uppercase tracking-wider">Located At</p>
                  <p className="font-semibold text-gray-900 dark:text-zinc-100 text-lg">{user?.address || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}

          {/* My Posted Flats Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-zinc-100">
                  <Home className="w-6 h-6 text-primary-500"/> My Posted Flats
                </h3>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                  Manage your active listings, edit information, or add another flat.
                </p>
              </div>
              <button
                onClick={handleOpenAddListing}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 text-xs sm:text-sm whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" /> Add Another Flat Listing
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {myListings.length === 0 ? (
                <div className="col-span-full bg-gray-50 dark:bg-zinc-900/50 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center">
                  <Home className="w-12 h-12 text-gray-300 dark:text-zinc-700 mb-3" />
                  <p className="text-gray-500 dark:text-zinc-400 font-medium mb-4">
                    No active flat listings posted by you yet.
                  </p>
                  <button
                    onClick={handleOpenAddListing}
                    className="text-primary-600 dark:text-primary-400 font-bold hover:underline text-sm flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> Post a flat listing to find a flatmate
                  </button>
                </div>
              ) : (
                myListings.map(item => (
                  <div
                    key={item._id}
                    className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <img
                        src={(item.photoUrls && item.photoUrls.length > 0) ? item.photoUrls[0] : (item.photoUrl || 'https://via.placeholder.com/400x200')}
                        className="w-full h-36 object-cover bg-gray-50 dark:bg-zinc-800"
                        alt={item.fullName}
                      />
                      <div className="p-4 flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 dark:text-zinc-100 truncate text-base">
                            {item.fullName}
                          </h4>
                          <span className="text-xs font-bold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 px-2 py-0.5 rounded-md whitespace-nowrap">
                            {item.vacancyCount} Spot{item.vacancyCount > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                          {item.address}
                        </p>
                        {item.rentAmount && (
                          <p className="text-xs font-black text-primary-600 dark:text-primary-400 mt-1">
                            ₹{item.rentAmount} / month
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800/80 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditListing(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-xs font-bold py-2 rounded-xl transition"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmListing(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold py-2 rounded-xl transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Listing Modal for Adding & Editing */}
      <ListingModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        initialListing={selectedListingForEdit}
        onSaveSuccess={handleSaveListingSuccess}
      />

      {/* Permanent Delete Confirmation Dialog */}
      {deleteConfirmListing && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setDeleteConfirmListing(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-500 mb-4">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                Delete Listing Permanently?
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-6">
              Are you sure you want to permanently remove <strong className="text-gray-900 dark:text-zinc-100">"{deleteConfirmListing.fullName}"</strong> from FlatSync? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmListing(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs sm:text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteListingConfirm}
                disabled={deleting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-500/30 transition text-xs sm:text-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
