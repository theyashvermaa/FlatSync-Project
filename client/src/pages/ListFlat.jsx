import { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { PlusCircle, Edit, Trash2, Home, AlertTriangle, X } from 'lucide-react';
import ListingModal from '../components/ListingModal';
import ProfileNudgeBanner from '../components/ProfileNudgeBanner';

const ListFlat = () => {
  const [listings, setListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [deleteConfirmListing, setDeleteConfirmListing] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const { data } = await api.get('/listings/my-listings');
      setListings(data);
    } catch {
      toast.error('Failed to load listings');
    }
  };

  const handleCreateNew = () => {
    setSelectedListing(null);
    setIsModalOpen(true);
  };

  const handleEdit = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleSaveSuccess = (savedListing, isEditing) => {
    if (isEditing) {
      setListings(prev => prev.map(l => l._id === savedListing._id ? savedListing : l));
    } else {
      setListings(prev => [savedListing, ...prev]);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmListing) return;
    setDeleting(true);
    try {
      await api.delete(`/listings/${deleteConfirmListing._id}`);
      setListings(prev => prev.filter(l => l._id !== deleteConfirmListing._id));
      toast.success('Listing permanently deleted');
      setDeleteConfirmListing(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl">
      <ProfileNudgeBanner />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <Home className="w-8 h-8 text-primary-500" /> My Flat Listings
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1 text-sm">
            Manage all your active flats, post new listings, or edit existing flat details.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/30 transition active:scale-[0.98] text-sm"
        >
          <PlusCircle className="w-5 h-5" /> Post New Flat
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800 shadow-sm flex flex-col items-center">
            <Home className="w-16 h-16 text-gray-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-2">No Active Listings Yet</h3>
            <p className="text-gray-500 dark:text-zinc-400 mb-6 text-sm max-w-md">
              Posting your flat allows flatmates and seekers to discover your location and connect with you faster.
            </p>
            <button
              onClick={handleCreateNew}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition text-sm flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" /> Create Your First Flat Listing
            </button>
          </div>
        ) : (
          listings.map(item => (
            <div
              key={item._id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <img
                  src={(item.photoUrls && item.photoUrls.length > 0) ? item.photoUrls[0] : (item.photoUrl || 'https://via.placeholder.com/400x200')}
                  className="w-full h-48 object-cover bg-gray-50 dark:bg-zinc-800"
                  alt={item.fullName}
                />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-lg truncate pr-2">
                      {item.fullName}
                    </h3>
                    <span className="bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-bold px-2.5 py-1 rounded-md border border-primary-100 dark:border-primary-900/50 whitespace-nowrap">
                      {item.vacancyCount} Vacanc{item.vacancyCount > 1 ? 'ies' : 'y'}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm mb-3 line-clamp-2">
                    {item.address}
                  </p>
                  {item.rentAmount && (
                    <p className="text-sm font-black text-primary-600 dark:text-primary-400 mb-2">
                      ₹{item.rentAmount} / month
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800 flex gap-3">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirmListing(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Listing Modal */}
      <ListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialListing={selectedListing}
        onSaveSuccess={handleSaveSuccess}
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
              Are you sure you want to permanently remove <strong className="text-gray-900 dark:text-zinc-100">"{deleteConfirmListing.fullName}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmListing(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs sm:text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
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

export default ListFlat;
