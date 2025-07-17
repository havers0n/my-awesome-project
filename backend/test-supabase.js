require('dotenv').config();
const { supabaseAdmin } = require('./dist/supabaseAdminClient.js');
const { randomUUID } = require('crypto');

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can query users table structure
    console.log('\n1. Testing users table query...');
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('Users table error:', usersError);
    } else {
      console.log('Users table sample:', JSON.stringify(users, null, 2));
      if (users && users.length > 0) {
        console.log('User table columns:', Object.keys(users[0]));
      }
    }

    // Test 2: Check organizations table
    console.log('\n2. Testing organizations table query...');
    const { data: orgs, error: orgsError } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .limit(1);
    
    if (orgsError) {
      console.error('Organizations table error:', orgsError);
    } else {
      console.log('Organizations table sample:', JSON.stringify(orgs, null, 2));
    }

    // Test 3: Try creating Auth user first, then DB record
    console.log('\n3. Testing proper Auth -> DB flow...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    // Step 1: Create Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User'
      }
    });

    if (authError) {
      console.error('Auth creation failed:', authError);
      console.error('Auth error details:', {
        status: authError.status,
        code: authError.code,
        message: authError.message
      });
    } else {
      console.log('Auth user created successfully with ID:', authData.user.id);
      
      // Step 2: Try to create DB record with that ID
      const { data: dbInsert, error: dbError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id, // Use the auth user ID
          email: testEmail,
          full_name: 'Test User',
          organization_id: 1,
          role: 'EMPLOYEE',
          is_active: true
        })
        .select()
        .single();

      if (dbError) {
        console.error('DB insert after auth creation failed:', dbError);
      } else {
        console.log('DB insert successful:', dbInsert);
      }
      
      // Clean up: delete the test user (this should also remove DB record if there's a cascade)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.log('Test user cleaned up');
    }

    // Test 4: Check what happens if we try without metadata
    console.log('\n4. Testing Auth creation without user_metadata...');
    const testEmail2 = `test2-${Date.now()}@example.com`;
    const { data: authData2, error: authError2 } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail2,
      password: 'testpassword123',
      email_confirm: true
      // No user_metadata
    });

    if (authError2) {
      console.error('Auth creation without metadata failed:', authError2);
    } else {
      console.log('Auth user created without metadata:', authData2.user.id);
      await supabaseAdmin.auth.admin.deleteUser(authData2.user.id);
      console.log('Test user 2 cleaned up');
    }

  } catch (error) {
    console.error('Exception during test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSupabaseConnection(); 