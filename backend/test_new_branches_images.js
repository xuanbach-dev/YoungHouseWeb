const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:5000';

// Test cases for new branches
const testCases = [
  // Branch 4 - Type12 (6 images)
  { branchId: 4, roomType: 'Type12', imageCount: 6, description: 'Young House 4' },
  
  // Branch 9 - Type10 (9 images)
  { branchId: 9, roomType: 'Type10', imageCount: 9, description: 'Young House 9' },
  
  // Branch 10 - Type11 (6 images)
  { branchId: 10, roomType: 'Type11', imageCount: 6, description: 'Young House 10' },
  
  // Branch 11 - Type8 (7 images)
  { branchId: 11, roomType: 'Type8', imageCount: 7, description: 'Young House 11' },
  
  // Branch 14 - Type13 (8 images)
  { branchId: 14, roomType: 'Type13', imageCount: 8, description: 'Young House 14' }
];

async function testImageAPI() {
  console.log('🧪 Testing new branches image API...\n');
  
  for (const testCase of testCases) {
    console.log(`\n📍 Testing ${testCase.description} (Branch ${testCase.branchId}, ${testCase.roomType})`);
    console.log(`Expected images: ${testCase.imageCount}`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 1; i <= testCase.imageCount; i++) {
      const url = `${BASE_URL}/api/images/rooms/${testCase.branchId}/${testCase.roomType}/${i}?size=medium`;
      
      try {
        const response = await axios.get(url, { 
          timeout: 5000,
          responseType: 'arraybuffer' // Don't try to parse as JSON
        });
        
        if (response.status === 200) {
          console.log(`  ✅ Image ${i}: ${url} (${response.headers['content-type']})`);
          successCount++;
        } else {
          console.log(`  ❌ Image ${i}: HTTP ${response.status}`);
          failureCount++;
        }
      } catch (error) {
        if (error.response) {
          console.log(`  ❌ Image ${i}: HTTP ${error.response.status} - ${error.response.statusText}`);
        } else if (error.code === 'ECONNREFUSED') {
          console.log(`  ❌ Image ${i}: Server not running`);
        } else {
          console.log(`  ❌ Image ${i}: ${error.message}`);
        }
        failureCount++;
      }
    }
    
    console.log(`\n📊 Summary for ${testCase.description}:`);
    console.log(`   ✅ Success: ${successCount}/${testCase.imageCount}`);
    console.log(`   ❌ Failed: ${failureCount}/${testCase.imageCount}`);
    console.log(`   📈 Success Rate: ${((successCount / testCase.imageCount) * 100).toFixed(1)}%`);
  }
}

async function verifyFileStructure() {
  console.log('\n🗂️  Verifying file structure...\n');
  
  for (const testCase of testCases) {
    console.log(`\n📁 Checking ${testCase.description} file structure:`);
    
    const branchPath = path.join(__dirname, 'uploads', 'rooms', `branch-${testCase.branchId}`, testCase.roomType);
    
    try {
      const files = await fs.readdir(branchPath);
      console.log(`  📂 Directory: ${branchPath}`);
      console.log(`  📁 Files found: ${files.length}`);
      
      files.forEach((file, index) => {
        console.log(`     ${index + 1}. ${file}`);
      });
      
      if (files.length === testCase.imageCount) {
        console.log(`  ✅ File count matches expected (${testCase.imageCount})`);
      } else {
        console.log(`  ⚠️  File count mismatch: found ${files.length}, expected ${testCase.imageCount}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Error reading directory: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🎯 YoungHouse New Branches Image Test\n');
  console.log('This script tests the image API for branches 4, 9, 10, 11, and 14\n');
  
  // First verify file structure
  await verifyFileStructure();
  
  // Then test API endpoints
  await testImageAPI();
  
  console.log('\n🏁 Test completed!');
  console.log('\nNotes:');
  console.log('- If server is not running, start it with: npm start');
  console.log('- Check server logs for detailed error information');
  console.log('- Image optimization may take time on first load');
}

// Run the test
main().catch(console.error);