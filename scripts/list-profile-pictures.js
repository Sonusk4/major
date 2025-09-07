const mongoose = require('mongoose');
const User = require('../src/models/User');
const Profile = require('../src/models/Profile');
require('dotenv').config();

async function listProfilePictures() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const profiles = await Profile.find({}).populate('user', 'email');
    
    console.log('\nProfile Pictures:');
    console.log('----------------');
    
    profiles.forEach(profile => {
      console.log(`User: ${profile.user?.email || 'N/A'}`);
      console.log(`Profile Picture: ${profile.profilePicture || 'None'}`);
      console.log('----------------');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listProfilePictures();
