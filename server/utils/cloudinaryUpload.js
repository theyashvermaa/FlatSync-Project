const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const streamUpload = (buffer, folder = 'flatsync') => {
  return new Promise((resolve) => {
    const isConfigPlaceholder = 
      !process.env.CLOUDINARY_CLOUD_NAME || 
      process.env.CLOUDINARY_CLOUD_NAME.includes('your_') ||
      !process.env.CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY.includes('your_');

    const saveLocally = () => {
      try {
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, buffer);
        const port = process.env.PORT || 5000;
        const secure_url = `http://localhost:${port}/uploads/${filename}`;
        console.log(`✅ Saved uploaded image locally: ${secure_url}`);
        return secure_url;
      } catch (err) {
        console.error('❌ Failed to save upload locally:', err);
        // Absolute fallback to unsplash placeholders
        return folder === 'profile' || folder === 'avatars'
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
          : `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80`;
      }
    };

    if (isConfigPlaceholder) {
      console.log('⚠️ Cloudinary is not configured. Saving buffer locally.');
      const localUrl = saveLocally();
      resolve({ secure_url: localUrl });
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          console.error('❌ Cloudinary upload error, saving locally instead:', error);
          const localUrl = saveLocally();
          resolve({ secure_url: localUrl });
        }
      }
    );
    stream.end(buffer);
  });
};

module.exports = { streamUpload };
