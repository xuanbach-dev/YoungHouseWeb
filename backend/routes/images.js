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
        
        originalPath = path.join(__dirname, '../uploads/rooms', `branch-${branchId}`, roomType, fileName);
      } else {
        // Young House 1: Only Type1 folder
        const extension = index === '9' ? 'JPG' : 'jpg'; // branch1-9.JPG is uppercase
        const fileName = `branch1-${index}.${extension}`;
        originalPath = path.join(__dirname, '../uploads/rooms', `branch-${branchId}`, 'Type1', fileName);
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