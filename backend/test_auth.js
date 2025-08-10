const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAuthentication() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    console.log('   Database status:', healthResponse.data.database.status);
    console.log('');

    // Test 2: Register new user
    console.log('2️⃣ Testing user registration...');
    const newUser = {
      username: 'testuser',
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'test123456'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, newUser);
      console.log('✅ Registration successful');
      console.log('   User ID:', registerResponse.data.user.id);
      console.log('   Username:', registerResponse.data.user.username);
      console.log('   Role:', registerResponse.data.user.roleName);
      console.log('   Token received:', registerResponse.data.token ? 'Yes' : 'No');
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ User already exists, continuing with login test...');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 3: Login with admin credentials
    console.log('3️⃣ Testing admin login...');
    const adminLogin = {
      email: 'admin@younghouse.com',
      password: 'password123'
    };

    const adminLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, adminLogin);
    console.log('✅ Admin login successful');
    console.log('   User ID:', adminLoginResponse.data.user.id);
    console.log('   Username:', adminLoginResponse.data.user.username);
    console.log('   Role:', adminLoginResponse.data.user.roleName);
    console.log('   Role ID:', adminLoginResponse.data.user.roleId);
    console.log('');

    const adminToken = adminLoginResponse.data.token;

    // Test 4: Login with regular user
    console.log('4️⃣ Testing user login...');
    const userLogin = {
      email: 'user@younghouse.com',
      password: 'user123'
    };

    const userLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, userLogin);
    console.log('✅ User login successful');
    console.log('   User ID:', userLoginResponse.data.user.id);
    console.log('   Username:', userLoginResponse.data.user.username);
    console.log('   Role:', userLoginResponse.data.user.roleName);
    console.log('   Role ID:', userLoginResponse.data.user.roleId);
    console.log('');

    const userToken = userLoginResponse.data.token;

    // Test 5: Admin access to protected routes
    console.log('5️⃣ Testing admin access to protected routes...');
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Admin can access users list');
      console.log('   Total users:', usersResponse.data.users.length);
    } catch (error) {
      console.log('❌ Admin access failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 6: User access to protected routes (should fail)
    console.log('6️⃣ Testing user access to admin routes (should fail)...');
    try {
      await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('❌ User should not have access to users list');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ User access correctly denied');
        console.log('   Error:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message);
      }
    }
    console.log('');

    // Test 7: Profile access
    console.log('7️⃣ Testing profile access...');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Profile access successful');
      console.log('   Profile user:', profileResponse.data.user.username);
      console.log('   Role:', profileResponse.data.user.roleName);
    } catch (error) {
      console.log('❌ Profile access failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 8: Invalid token
    console.log('8️⃣ Testing invalid token...');
    try {
      await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      console.log('❌ Invalid token should be rejected');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Invalid token correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message);
      }
    }
    console.log('');

    console.log('🎉 All authentication tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run tests if script is called directly
if (require.main === module) {
  testAuthentication()
    .then(() => {
      console.log('\n✅ Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testAuthentication };