const mongoose = require('mongoose');
const Profile = require('../src/models/Profile');
require('dotenv').config();

async function fixProfilePictures() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find all profiles with the broken image URL
    const brokenProfiles = await Profile.find({
      profilePicture: "/uploads/profile-pictures/profile-68889a3bc09a68b166e8e515-1757001163336.jpg"
    });

    console.log(`Found ${brokenProfiles.length} profiles with broken image`);

    if (brokenProfiles.length === 0) {
      console.log('No profiles with broken images found');
      process.exit(0);
    }

    // Update all matching profiles to use a working image
    const result = await Profile.updateMany(
      { profilePicture: "/uploads/profile-pictures/profile-68889a3bc09a68b166e8e515-1757001163336.jpg" },
      { $set: { profilePicture: "/uploads/profile-pictures/profile-68889a3bc09a68b166e8e515-1754933639536.jpg" } }
    );

    console.log(`Successfully updated ${result.modifiedCount} profiles`);
    process.exit(0);
    
  } catch (error) {
    console.error('Error fixing profile pictures:', error);
    process.exit(1);
  }
}

fixProfilePictures();
