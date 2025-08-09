const imageService = require('./services/imageService');

async function testImageGeneration() {
  try {
    console.log('🔍 Testing image service for Type3 room...');
    
    // Test Type3 room from branch 2
    const optimizedPath = await imageService.getRoomImage('2', 'Type3', '1', 'large');
    console.log('✅ Optimized image path:', optimizedPath);
    
    // Check if the optimized image was created
    const fs = require('fs').promises;
    try {
      await fs.access(optimizedPath);
      console.log('✅ Optimized image exists and was created successfully!');
      
      // Get file stats
      const stats = await fs.stat(optimizedPath);
      console.log(`📊 File size: ${Math.round(stats.size / 1024)} KB`);
      console.log(`📅 Created: ${stats.birthtime}`);
    } catch (error) {
      console.log('❌ Optimized image not found');
    }
    
  } catch (error) {
    console.error('❌ Error testing image service:', error);
  }
}

testImageGeneration();