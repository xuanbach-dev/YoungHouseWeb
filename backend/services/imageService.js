const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ImageService {
  constructor() {
    this.cachePath = path.join(__dirname, '../uploads/cache');
    this.ensureCacheDir();
  }

  async ensureCacheDir() {
    try {
      await fs.access(this.cachePath);
    } catch (error) {
      await fs.mkdir(this.cachePath, { recursive: true });
    }
  }

  /**
   * Generate optimized image with multiple sizes
   * @param {string} imagePath - Path to original image
   * @param {string} size - Size variant (thumbnail, medium, large)
   * @returns {string} - Path to optimized image
   */
  async getOptimizedImage(imagePath, size = 'medium') {
    try {
      const sizes = {
        thumbnail: { width: 300, height: 200, quality: 70 },
        medium: { width: 600, height: 400, quality: 80 },
        large: { width: 1200, height: 800, quality: 85 }
      };

      const config = sizes[size] || sizes.medium;
      const fileName = path.basename(imagePath, path.extname(imagePath));
      const ext = path.extname(imagePath);
      const cachedFileName = `${fileName}_${size}_${config.width}x${config.height}.webp`;
      const cachedPath = path.join(this.cachePath, cachedFileName);

      // Check if cached version exists
      try {
        await fs.access(cachedPath);
        return cachedPath;
      } catch (error) {
        // File doesn't exist, create it
      }

      // Check if original file exists
      try {
        await fs.access(imagePath);
      } catch (error) {
        throw new Error(`Original image not found: ${imagePath}`);
      }

      // Use Sharp for fast image processing (preferred over ImageMagick for Node.js)
      await sharp(imagePath)
        .resize(config.width, config.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({
          quality: config.quality,
          effort: 6 // Max compression effort
        })
        .toFile(cachedPath);

      console.log(`✅ Optimized image created: ${cachedFileName}`);
      return cachedPath;

    } catch (error) {
      console.error('Error optimizing image:', error);
      return imagePath; // Return original on error
    }
  }

  /**
   * Optimize all room images in a directory
   * @param {string} sourceDir - Source directory path
   */
  async optimizeRoomImages(sourceDir) {
    try {
      const files = await fs.readdir(sourceDir);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|bmp)$/i.test(file)
      );

      console.log(`🖼️  Found ${imageFiles.length} images to optimize in ${sourceDir}`);

      for (const file of imageFiles) {
        const filePath = path.join(sourceDir, file);
        console.log(`Processing: ${file}`);
        
        // Create all size variants
        await Promise.all([
          this.getOptimizedImage(filePath, 'thumbnail'),
          this.getOptimizedImage(filePath, 'medium'),
          this.getOptimizedImage(filePath, 'large')
        ]);
      }

      console.log(`✅ Completed optimization for ${sourceDir}`);
    } catch (error) {
      console.error('Error optimizing room images:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      const files = await fs.readdir(this.cachePath);
      const stats = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.cachePath, file);
          const stat = await fs.stat(filePath);
          return {
            name: file,
            size: stat.size,
            created: stat.ctime
          };
        })
      );

      const totalSize = stats.reduce((sum, file) => sum + file.size, 0);
      
      return {
        totalFiles: files.length,
        totalSize: Math.round(totalSize / 1024 / 1024 * 100) / 100, // MB
        files: stats
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalFiles: 0, totalSize: 0, files: [] };
    }
  }

  /**
   * Clear cache
   */
  async clearCache() {
    try {
      const files = await fs.readdir(this.cachePath);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cachePath, file)))
      );
      console.log(`🗑️  Cleared ${files.length} cached images`);
      return { cleared: files.length };
    } catch (error) {
      console.error('Error clearing cache:', error);
      return { cleared: 0, error: error.message };
    }
  }

  /**
   * Get room image with automatic optimization
   * @param {string} branchId - Branch ID (database BranchID)
   * @param {string} roomType - Room type (Type1, Type3, Type4, Type5, Type7)
   * @param {string} imageIndex - Image index
   * @param {string} size - Size variant
   */
  async getRoomImage(branchId, roomType, imageIndex = '1', size = 'medium') {
    // Map database branchId to actual folder structure
    const branchPath = `branch-${branchId}`;
    let originalPath;

    if (branchId === '2') {
      // Young House 2: Direct room type folders (Type3, Type4, Type5)
      let fileName;
      
      if (roomType === 'Type5') {
        fileName = `branch2-1-${imageIndex}.JPG`; // Type5 uses branch2-1-x pattern
      } else if (roomType === 'Type3') {
        fileName = `branch2-2-${imageIndex}.JPG`; // Type3 uses branch2-2-x pattern
      } else if (roomType === 'Type4') {
        fileName = `branch2-3-${imageIndex}.JPG`; // Type4 uses branch2-3-x pattern
      } else {
        // Default to Type5 if invalid type provided
        fileName = `branch2-1-${imageIndex}.JPG`;
      }
      
      originalPath = path.join(__dirname, '../uploads/rooms', branchPath, roomType, fileName);
    } else if (branchId === '4') {
      // Young House 4: database branchId=4, uses branch-4 folder with Type12
      const fileName = `branch4-${imageIndex}.jpg`; // Type12 uses branch4-x pattern
      originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type12', fileName);
    } else if (branchId === '9') {
      // Young House 9: database branchId=9, uses branch-9 folder with Type10
      const extension = (imageIndex === '8' || imageIndex === '9') ? 'JPG' : 'jpg'; // branch9-8.JPG and branch9-9.JPG are uppercase
      const fileName = `branch9-${imageIndex}.${extension}`;
      originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type10', fileName);
    } else if (branchId === '10') {
      // Young House 10: database branchId=10, uses branch-10 folder with Type11
      let fileName;
      if (imageIndex === '2') {
        fileName = `branch10_${imageIndex}.jpg`; // Special case: branch10_2.jpg (underscore instead of dash)
      } else {
        fileName = `branch10-${imageIndex}.jpg`; // Normal pattern: branch10-x.jpg
      }
      originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type11', fileName);
    } else if (branchId === '11') {
      // Young House 11: database branchId=11, uses branch-11 folder with Type8
      const fileName = `branch11-${imageIndex}.jpg`; // Type8 uses branch11-x pattern
      originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type8', fileName);
    } else if (branchId === '12') {
      // Young House 12: database branchId=12, uses branch-12 folder with Type7
      const fileName = `branch12-${imageIndex}.jpg`; // Type7 uses branch12-x pattern
      originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type7', fileName);
    } else if (branchId === '14') {
      // Young House 14: database branchId=14, uses branch-14 folder with Type13
      const fileName = `branch14-${imageIndex}.png`; // Type13 uses branch14-x.png pattern
      originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type13', fileName);
    } else {
      // Young House 1: Only Type1 folder
      const extension = imageIndex === '9' ? 'JPG' : 'jpg'; // branch1-9.JPG is uppercase
      const fileName = `branch1-${imageIndex}.${extension}`;
      originalPath = path.join(__dirname, '../uploads/rooms', branchPath, 'Type1', fileName);
    }

    return await this.getOptimizedImage(originalPath, size);
  }
}

module.exports = new ImageService();