const express = require('express');
const router = express.Router();
const { createListing, getListings, getListingById, updateListing, deleteListing, getMyListings } = require('../controllers/listingController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.post('/', protect, upload.array('photos', 5), createListing);
router.get('/', getListings);
router.get('/my-listings', protect, getMyListings);
router.get('/:id', protect, getListingById);
router.put('/:id', protect, upload.array('photos', 5), updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
