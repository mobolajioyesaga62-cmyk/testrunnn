import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function makeUserAdmin(email) {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Since we can't use admin API with anon key, let's try a different approach
    // We'll need to manually create/update the profile if we know the user ID
    
    // First, let's try to find the user by trying to sign in (this won't work without password)
    // Instead, we'll create a simple approach using the service role key
    
    console.log('Note: This script requires the service role key for admin operations.');
    console.log('Please add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file for full admin functionality.');
    
    // For now, let's try to create a profile with a hardcoded user ID
    // You'll need to get the actual user ID from your Supabase dashboard
    
    const userId = 'YOUR_USER_ID_HERE'; // Replace with actual user ID from Supabase dashboard
    
    if (userId === 'YOUR_USER_ID_HERE') {
      console.log('\n⚠️  To complete this process:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to Authentication > Users');
      console.log('3. Find the user mobolajioyesaga@gmail.com');
      console.log('4. Copy their ID (it looks like: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)');
      console.log('5. Update the userId variable in this script');
      console.log('6. Run the script again');
      return;
    }
    
    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error checking profile:', profileError);
      return;
    }
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select();
      
      if (error) {
        console.error('Error updating profile:', error);
        return;
      }
      
      console.log('✅ Successfully updated user role to admin!');
      console.log('Profile:', data[0]);
    } else {
      // Create new profile with admin role
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: 'mobolajioyesaga@gmail.com',
          role: 'admin',
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Error creating profile:', error);
        return;
      }
      
      console.log('✅ Successfully created admin profile!');
      console.log('Profile:', data[0]);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
const email = process.argv[2] || 'mobolajioyesaga@gmail.com';
makeUserAdmin(email);
