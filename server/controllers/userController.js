const User = require('../models/User');
const MatchScore = require('../models/MatchScore');
const { streamUpload } = require('../utils/cloudinaryUpload');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const body = req.body || {};
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (body.name) user.name = body.name;
    
    // Prevent Mongoose CastError if age is empty string or invalid number
    if (body.age !== undefined && body.age !== '') {
      const numAge = Number(body.age);
      if (!isNaN(numAge)) user.age = numAge;
    }
    
    if (body.mobileNumber !== undefined) user.mobileNumber = body.mobileNumber;
    if (body.address !== undefined) user.address = body.address;
    if (body.aboutMe !== undefined) user.aboutMe = body.aboutMe;
    
    // Safely parse & merge preferences
    if (body.preferences && body.preferences !== 'undefined' && body.preferences !== '') {
      try {
        const parsedPrefs = typeof body.preferences === 'string'
          ? JSON.parse(body.preferences)
          : body.preferences;

        const validPrefKeys = [
          'foodPreference', 'smokingHabit', 'alcoholConsumption',
          'cleanlinessLevel', 'sleepSchedule', 'workStudyRoutine',
          'guestFrequency', 'noiseTolerance', 'sharingExpenses', 'lifestylePersonality'
        ];

        const currentPrefs = user.preferences ? (user.preferences.toObject ? user.preferences.toObject() : user.preferences) : {};
        const updatedPrefs = { ...currentPrefs };

        for (const key of validPrefKeys) {
          if (parsedPrefs[key] !== undefined && parsedPrefs[key] !== null && parsedPrefs[key] !== '') {
            updatedPrefs[key] = parsedPrefs[key];
          }
        }
        user.preferences = updatedPrefs;
      } catch (err) {
        console.error('Error parsing preferences:', err);
      }
    }

    // Handle File Uploads safely
    if (req.file) {
      const cloudKey = process.env.CLOUDINARY_API_KEY;
      if (!cloudKey || cloudKey === 'dummy_key' || cloudKey === 'dummy') {
        console.warn('Cloudinary API key not configured, skipping image upload.');
      } else {
        try {
          const result = await streamUpload(req.file.buffer);
          user.photoUrl = result.secure_url;
        } catch (uploadObjErr) {
          console.error('Cloudinary Upload Failed:', uploadObjErr);
        }
      }
    }

    const updatedUser = await user.save();

    // Invalidate cached match scores safely
    try {
      await MatchScore.deleteMany({ $or: [{ user1: updatedUser._id }, { user2: updatedUser._id }] });
    } catch (cacheErr) {
      console.error('MatchScore cache clearance warning:', cacheErr.message);
    }

    const returnedUser = await User.findById(updatedUser._id).select('-password');
    res.json(returnedUser);
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

const saveListing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const listingId = req.params.id;
    if (user.savedListings.includes(listingId)) {
      user.savedListings = user.savedListings.filter(id => id.toString() !== listingId);
    } else {
      user.savedListings.push(listingId);
    }
    
    await user.save();
    res.json(user.savedListings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, saveListing };
