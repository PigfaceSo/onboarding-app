// Simple API test script
const axios = require('axios');

const API_URL = 'http://localhost:8080/api';

async function testAPI() {
  console.log('=== Villa Onboarding API Test ===');
  
  try {
    // Step 1: Seed data
    console.log('\n1. Testing seed data endpoint...');
    const seedResponse = await axios.get(`${API_URL}/seed-data`);
    console.log('Seed response status:', seedResponse.status);
    console.log('Categories created:', seedResponse.data.categoriesCreated);
    console.log('Items created:', seedResponse.data.itemsCreated);
    
    // Step 2: Get all categories and items
    console.log('\n2. Testing get items endpoint...');
    const itemsResponse = await axios.get(`${API_URL}/items`);
    console.log('Items response status:', itemsResponse.status);
    console.log('Categories returned:', itemsResponse.data.length);
    
    // Count total items across all categories
    let totalItems = 0;
    itemsResponse.data.forEach(category => {
      if (category.items && Array.isArray(category.items)) {
        totalItems += category.items.length;
      }
    });
    console.log('Total items across all categories:', totalItems);
    
    // Display first few categories and items for verification
    console.log('\n3. Sample of returned data:');
    itemsResponse.data.slice(0, 2).forEach(category => {
      console.log(`Category: ${category.name} (${category.items?.length || 0} items)`);
      if (category.items && category.items.length > 0) {
        console.log('  Sample items:');
        category.items.slice(0, 3).forEach(item => {
          console.log(`  - ${item.name}`);
        });
      }
    });
    
    console.log('\n✅ API Test Completed Successfully!');
    
  } catch (error) {
    console.error('\n❌ API Test Failed:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Is the server running?');
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
    
    console.error('\nTIP: Make sure the backend server is running on port 8080');
    console.error('To start the server, run: cd backend && node server.js');
  }
}

testAPI();
