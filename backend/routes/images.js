const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const imageService = require('../services/imageService');

// Serve optimized room image
router.get('/rooms/:branchId/:roomType/:index?', async (req, res) => {
  try {
    const { branchId, roomType, index = '1' } = req.params;
    const { size = 'medium' } = req.query;

    console.log(`🖼️  Requesting optimized image: Branch ${branchId}, Type ${roomType}, Index ${index}, Size ${size}`);

    const optimizedPath = await imageService.getRoomImage(branchId, roomType, index, size);
    
    // Check if optimized image exists
    try {
      await fs.access(optimizedPath);
      
      // Set appropriate headers for caching
      res.set({
        'Cache-Control': 'public, max-age=31536000', // 1 year
        'Content-Type': 'image/webp',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      });

      return res.sendFile(path.resolve(optimizedPath));
    } catch (error) {
      console.log(`❌ Optimized image not found, falling back to original`);
      
      // Fallback to original image with correct path structure
      let originalPath;
      const branchPath = `branch-${branchId}`;
      
      if (branchId === '2') {
        // Young House 2: Direct room type folders (Type3, Type4, Type5)
        let fileName;
        
        if (roomType === 'Type5') {
          fileName = `branch2-1-${index}.JPG`; // Type5 uses branch2-1-x pattern
        } else if (roomType === 'Type3') {
          fileName = `branch2-2-${index}.JPG`; // Type3 uses branch2-2-x pattern
        } else if (roomType === 'Type4') {
          fileName = `branch2-3-${index}.JPG`; // Type4 uses branch2-3-x pattern
        } else {
          // Default to Type5 if invalid type provided
          fileName = `branch2-1-${index}.JPG`;
        }
        
        originalPath = path.join(__dirname, '../uploads/rooms', branchPath, roomType, fileName);
      } else if (branchId === '4') {
        // Young House 4: database branchId=4, uses branch-4 folder with Type12
        const fileName = `branch4-${index}.jpg`; // Type12 uses branch4-x pattern
        originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type12', fileName);
      } else if (branchId === '9') {
        // Young House 9: database branchId=9, uses branch-9 folder with Type10
        const extension = (index === '8' || index === '9') ? 'JPG' : 'jpg'; // branch9-8.JPG and branch9-9.JPG are uppercase
        const fileName = `branch9-${index}.${extension}`;
        originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type10', fileName);
      } else if (branchId === '10') {
        // Young House 10: database branchId=10, uses branch-10 folder with Type11
        let fileName;
        if (index === '2') {
          fileName = `branch10_${index}.jpg`; // Special case: branch10_2.jpg (underscore instead of dash)
        } else {
          fileName = `branch10-${index}.jpg`; // Normal pattern: branch10-x.jpg
        }
        originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type11', fileName);
      } else if (branchId === '11') {
        // Young House 11: database branchId=11, uses branch-11 folder with Type8
        const fileName = `branch11-${index}.jpg`; // Type8 uses branch11-x pattern
        originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type8', fileName);
      } else if (branchId === '12') {
        // Young House 12: database branchId=12, uses branch-12 folder with Type7
        const fileName = `branch12-${index}.jpg`; // Type7 uses branch12-x pattern
        originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type7', fileName);
      } else if (branchId === '14') {
        // Young House 14: database branchId=14, uses branch-14 folder with Type13
        const fileName = `branch14-${index}.png`; // Type13 uses branch14-x.png pattern
        originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type13', fileName);
      } else {
        // Young House 1: Only Type1 folder
        const extension = index === '9' ? 'JPG' : 'jpg'; // branch1-9.JPG is uppercase
        const fileName = `branch1-${index}.${extension}`;
        originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type1', fileName);
      }
      
      try {
        await fs.access(originalPath);
        res.set({
          'Cache-Control': 'public, max-age=3600', // 1 hour for original
          'Access-Control-Allow-Origin': '*',
          'Cross-Origin-Resource-Policy': 'cross-origin'
        });
        return res.sendFile(path.resolve(originalPath));
      } catch (originalError) {
        return res.status(404).json({ error: 'Image not found' });
      }
    }
  } catch (error) {
    console.error('Error serving room image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get random room image for a branch
router.get('/rooms/:branchId/random', async (req, res) => {
  try {
    const { branchId } = req.params;
    const { size = 'medium' } = req.query;

    // Define available images per branch organized by room types
    const availableImages = {
      '1': [
        { type: 'Type1', count: 9 } // Type1: branch1-1.jpg to branch1-9.JPG
      ],
      '2': [
        { type: 'Type5', count: 7 }, // Type5: branch2-1-{index}.JPG
        { type: 'Type3', count: 4 }, // Type3: branch2-2-{index}.JPG
        { type: 'Type4', count: 2 }  // Type4: branch2-3-{index}.JPG
      ],
      '12': [
        { type: 'Type7', count: 9 } // Young House 12: database branchId=12, Type7: branch12-1-{index}.jpg
      ]
    };

    const branchImages = availableImages[branchId] || availableImages['1'];
    const randomType = branchImages[Math.floor(Math.random() * branchImages.length)];
    const randomIndex = Math.floor(Math.random() * randomType.count) + 1;

    // Redirect to specific image
    res.redirect(`/api/images/rooms/${branchId}/${randomType.type}/${randomIndex}?size=${size}`);
  } catch (error) {
    console.error('Error serving random room image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cache management endpoints
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = await imageService.getCacheStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/cache', async (req, res) => {
  try {
    const result = await imageService.clearCache();
    res.json(result);
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch optimize images
router.post('/optimize/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    const sourceDir = path.join(__dirname, '../uploads/rooms', `branch-${branchId}`);
    
    // Start optimization in background
    imageService.optimizeRoomImages(sourceDir).catch(console.error);
    
    res.json({ 
      message: `Started optimization for branch ${branchId}`,
      sourceDir 
    });
  } catch (error) {
    console.error('Error starting image optimization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;