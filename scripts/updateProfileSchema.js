import mongoose from 'mongoose';
import { dbConnect } from '../src/lib/dbConnect';
import Profile from '../src/models/Profile';

async function updateSchema() {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Connected to database');
    
    console.log('Checking for profiles that need updating...');
    const profilesToUpdate = await Profile.find({ parsedResumeText: { $exists: false } });
    console.log(`Found ${profilesToUpdate.length} profiles to update`);
    
    // Update all profiles to include parsedResumeText if it doesn't exist
    console.log('Updating profiles...');
    const result = await Profile.updateMany(
      { parsedResumeText: { $exists: false } },
      { $set: { parsedResumeText: '' } },
      { upsert: false }
    );
    
    console.log('Schema update result:', result);
    console.log('Successfully updated schema for profiles');
    
    // Verify the update
    const updatedProfiles = await Profile.find({ parsedResumeText: { $exists: true } });
    console.log(`Total profiles with parsedResumeText field: ${updatedProfiles.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

updateSchema();
