const Listing = require('../models/Listing');
const { streamUpload } = require('../utils/cloudinaryUpload');

const createListing = async (req, res) => {
  try {
    const { 
      fullName, email, mobileNumber, address, age, aboutYourself, vacancyCount, 
      nearbyPlaces, facilities, restrictions, flatmatePreferences, lat, lng,
      rentAmount, moveInDate
    } = req.body;
    let photoUrls = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => streamUpload(file.buffer));
      const results = await Promise.all(uploadPromises);
      photoUrls = results.map(result => result.secure_url);
    }

    const listing = await Listing.create({
      owner: req.user._id,
      photoUrls,
      fullName,
      email,
      mobileNumber,
      address,
      age,
      aboutYourself,
      nearbyPlaces,
      facilities,
      restrictions,
      flatmatePreferences,
      vacancyCount,
      rentAmount: rentAmount ? Number(rentAmount) : undefined,
      moveInDate: moveInDate || undefined,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      }
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getListings = async (req, res) => {
  try {
    const { lat, lng, radius, search } = req.query;

    const hasCoords = lat != null && lng != null && lat !== '' && lng !== '' && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
    const searchKeyword = search ? search.trim() : '';

    // If no coordinates and no search keyword, return all listings
    if (!hasCoords && !searchKeyword) {
      const listings = await Listing.find().populate('owner', 'name photoUrl preferences');
      return res.json(listings);
    }

    const parsedLat = hasCoords ? parseFloat(lat) : null;
    const parsedLng = hasCoords ? parseFloat(lng) : null;
    const searchRadiusKm = radius ? parseFloat(radius) : 40;
    const maxDistanceMeters = searchRadiusKm * 1000;

    let textListings = [];
    if (searchKeyword) {
      const cleanKeyword = searchKeyword.split(',')[0].trim();
      if (cleanKeyword) {
        const regexPattern = new RegExp(cleanKeyword, 'i');
        textListings = await Listing.find({
          $or: [
            { address: { $regex: regexPattern } },
            { nearbyPlaces: { $regex: regexPattern } },
            { fullName: { $regex: regexPattern } }
          ]
        }).populate('owner', 'name photoUrl preferences');
      }
    }

    let geoListings = [];
    if (hasCoords) {
      geoListings = await Listing.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parsedLng, parsedLat]
            },
            distanceField: 'dist.calculated',
            maxDistance: maxDistanceMeters,
            spherical: true
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner'
          }
        },
        {
          $unwind: '$owner'
        }
      ]);
    }

    // If search keyword is explicitly provided by the user:
    if (searchKeyword) {
      // If we have direct text matches for the searched location (e.g. "Greater Noida")
      if (textListings.length > 0) {
        const combinedMap = new Map();
        textListings.forEach(item => {
          combinedMap.set(item._id.toString(), item.toObject ? item.toObject() : item);
        });

        // Also add geoListings if their address/nearby places match the search keyword
        geoListings.forEach(item => {
          const cleanKw = searchKeyword.split(',')[0].trim().toLowerCase();
          const addr = (item.address || '').toLowerCase();
          const near = (item.nearbyPlaces || '').toLowerCase();
          if (addr.includes(cleanKw) || near.includes(cleanKw)) {
            combinedMap.set(item._id.toString(), item);
          }
        });

        return res.json(Array.from(combinedMap.values()));
      } else if (geoListings.length > 0) {
        // No direct text match, but geoListings found within 40km of searched location coordinates
        return res.json(geoListings);
      } else {
        // Location search yielded 0 text matches and 0 geo matches -> Return empty []
        return res.json([]);
      }
    }

    // If no search keyword specified, return geoListings for location/pin click
    return res.json(geoListings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('owner', '-password');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { 
      fullName, email, mobileNumber, address, age, aboutYourself, vacancyCount,
      nearbyPlaces, facilities, restrictions, flatmatePreferences, lat, lng,
      rentAmount, moveInDate
    } = req.body;
    
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => streamUpload(file.buffer));
      const results = await Promise.all(uploadPromises);
      listing.photoUrls = results.map(result => result.secure_url);
    }

    listing.fullName = fullName || listing.fullName;
    listing.email = email || listing.email;
    listing.mobileNumber = mobileNumber || listing.mobileNumber;
    listing.address = address || listing.address;
    listing.age = age || listing.age;
    listing.aboutYourself = aboutYourself || listing.aboutYourself;
    listing.nearbyPlaces = nearbyPlaces || listing.nearbyPlaces;
    listing.facilities = facilities || listing.facilities;
    listing.restrictions = restrictions || listing.restrictions;
    listing.flatmatePreferences = flatmatePreferences || listing.flatmatePreferences;
    listing.vacancyCount = vacancyCount || listing.vacancyCount;
    if (rentAmount !== undefined) listing.rentAmount = Number(rentAmount);
    if (moveInDate !== undefined) listing.moveInDate = moveInDate;
    
    if (lat && lng) {
      listing.location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      };
    }

    const updatedListing = await listing.save();
    res.json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createListing, getListings, getListingById, updateListing, deleteListing, getMyListings };
