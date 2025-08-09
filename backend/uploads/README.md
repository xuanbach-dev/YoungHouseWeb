# 📁 Uploads Directory Structure

## 🏗️ Folder Organization

```
uploads/
├── rooms/
│   ├── branch-1/
│   │   ├── room-101-1.jpg
│   │   ├── room-101-2.jpg
│   │   ├── room-102-1.jpg
│   │   └── ...
│   ├── branch-2/
│   │   ├── room-201-1.jpg
│   │   ├── room-201-2.jpg
│   │   └── ...
│   └── branch-N/
├── avatars/
└── documents/
```

## 🖼️ Image Naming Convention

### Room Images:
- **Format**: `room-{RoomNumber}-{ImageIndex}.jpg`
- **Examples**:
  - `room-101-1.jpg` (First image of room 101)
  - `room-101-2.jpg` (Second image of room 101)
  - `room-202-1.jpg` (First image of room 202)

### Branch Folders:
- **Format**: `branch-{BranchID}`
- **Examples**:
  - `branch-1/` (Images for Branch ID 1)
  - `branch-2/` (Images for Branch ID 2)

## 🔗 URL Structure

Images are served at:
```
http://localhost:5000/uploads/rooms/branch-{BranchID}/room-{RoomNumber}-{ImageIndex}.jpg
```

### Examples:
- `http://localhost:5000/uploads/rooms/branch-1/room-101-1.jpg`
- `http://localhost:5000/uploads/rooms/branch-2/room-201-1.jpg`

## 📤 How to Add Images

1. **Organize by Branch**: Place images in the correct `branch-{ID}` folder
2. **Follow Naming**: Use the `room-{number}-{index}.jpg` format
3. **Recommended Sizes**: 
   - Width: 300-600px
   - Height: 200-400px
   - Format: JPG, PNG, WebP
   - Max size: 2MB per image

## 🔄 Fallback System

The system uses a 3-tier fallback:
1. **Database Media**: Images stored in `Media` table
2. **File System**: Images in `uploads/rooms/branch-X/`
3. **Placeholder**: Default placeholder if no image found

## 💡 Tips

- Keep file names lowercase
- Use hyphens instead of spaces
- Compress images for web (recommended: 80-90% quality)
- Multiple images per room: increment the image index (1, 2, 3...)