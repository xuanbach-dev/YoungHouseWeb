import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Filter, Grid, List, ChevronDown } from 'lucide-react';
import { roomsAPI, branchesAPI } from '../services/api';
import { Room, Branch } from '../types';
import './SystemHome.css';

interface RoomSearchFilters {
  search?: string;
  branchId?: number;
  roomTypeId?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  page?: number;
  limit?: number;
}

const SystemHome: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
    totalItems: 0
  });

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [statusFilter, setStatusFilter] = useState<string>('Available');

  // Available areas and their corresponding branch IDs
  const availableAreas = [
    { name: 'Tân Xã', branchIds: [1,4] }, // Young House 1, Young House 2
    { name: 'Phú Hữu', branchIds: [2,11, 12, 14] }, // Young House 4, Young House 9, Young House 10
    { name: 'Bình Yên', branchIds: [9,10] } // Young House 11, Young House 12, Young House 14
  ];

  // Function to get area name from branch ID
  const getAreaFromBranchId = (branchId: number): string | null => {
    const area = availableAreas.find(area => area.branchIds.includes(branchId));
    return area ? area.name : null;
  };
  const availableRoomTypes = [
    'Giường đôi',
    'Giường đôi gác xép',
    '2 giường đơn có ban công',
    '2 giường đơn có giếng trời',
    '1 giường đôi căn góc',
    'Phòng 2 giường 1 khách',
    'Giường gác xép'
  ];

  // Fetch branches from API
  const fetchBranches = async () => {
    try {
      const response = await branchesAPI.getBranches();
      if (response.data.success) {
        setBranches(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching branches:', err);
      // Continue with hardcoded areas if API fails
    }
  };

  // Fetch room types from API
  const fetchRoomTypes = async () => {
    try {
      const response = await roomsAPI.getRoomTypes();
      if (response.data.success) {
        const typeNames = response.data.data.map((type: any) => type.TypeName);
        setRoomTypes(typeNames);
      }
    } catch (err: any) {
      console.error('Error fetching room types:', err);
      // Continue with hardcoded room types if API fails
      setRoomTypes(availableRoomTypes);
    }
  };

  // Fetch rooms from API
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await roomsAPI.getRooms(
        pagination.page, 
        pagination.limit, 
        undefined, // branchId - could filter later
        statusFilter
      );
      
      if (response.data.success) {
        setRooms(response.data.data);
        setFilteredRooms(response.data.data);
        // Update pagination if API provides it
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            totalItems: response.data.data.length
          }));
        }
      }
    } catch (err: any) {
      console.error('Error fetching rooms:', err);
      setError('Không thể tải danh sách phòng. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Search rooms
  const searchRooms = async () => {
    if (!searchQuery.trim()) {
      fetchRooms();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await roomsAPI.searchRooms(searchQuery);
      
      if (response.data.success) {
        setRooms(response.data.data);
        setFilteredRooms(response.data.data);
      }
    } catch (err: any) {
      console.error('Error searching rooms:', err);
      setError('Không thể tìm kiếm phòng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchRoomTypes();
    fetchRooms();
  }, [pagination.page, statusFilter]);

  useEffect(() => {
    filterRooms();
  }, [selectedBranches, selectedAreas, selectedRoomTypes, priceRange, rooms]);

  const filterRooms = () => {
    let filtered = rooms.filter(room => {
      // Check if room matches selected areas
      let matchesArea = true;
      if (selectedAreas.length > 0) {
        matchesArea = selectedAreas.some(areaName => {
          const area = availableAreas.find(a => a.name === areaName);
          return area && area.branchIds.includes(room.BranchID || room.branchId);
        });
      }

      const matchesBranch = selectedBranches.length === 0 || selectedBranches.includes(room.BranchID || room.branchId);
      const matchesRoomType = selectedRoomTypes.length === 0 || selectedRoomTypes.includes(room.TypeName || room.typeName || '');
      const matchesPrice = (room.Price || room.price || 0) >= priceRange.min && (room.Price || room.price || 0) <= priceRange.max;

      return matchesArea && matchesBranch && matchesRoomType && matchesPrice;
    });

    setFilteredRooms(filtered);
  };

  const handleAreaChange = (areaName: string) => {
    setSelectedAreas(prev => 
      prev.includes(areaName) 
        ? prev.filter(area => area !== areaName)
        : [...prev, areaName]
    );
  };

  const handleBranchChange = (branchName: string) => {
    // In a real app, you'd map branchName to branchId
    // For now, we'll simulate this
    const branchId = branchName === 'Tân Xã' ? 1 : 2;
    setSelectedBranches(prev => 
      prev.includes(branchId) 
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  const handleRoomTypeChange = (roomType: string) => {
    if (roomType) {
      setSelectedRoomTypes([roomType]);
    } else {
      setSelectedRoomTypes([]);
    }
  };

  const clearFilters = () => {
    setSelectedBranches([]);
    setSelectedAreas([]);
    setSelectedRoomTypes([]);
    setPriceRange({ min: 0, max: 10000000 });
    setSearchQuery('');
    setStatusFilter('Available');
  };

  const handleSearch = () => {
    searchRooms();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Get optimized image path based on branch and room
  const getImagePath = (room: Room, size: 'thumbnail' | 'medium' | 'large' = 'medium') => {
    try {
      // Priority: 1. Real media from database, 2. Optimized images by API, 3. Fallback
      if (room.Media && room.Media.length > 0 && room.Media[0].FilePath) {
        // Use image from database - ensure FilePath starts with /
        const filePath = room.Media[0].FilePath.startsWith('/') 
          ? room.Media[0].FilePath 
          : `/${room.Media[0].FilePath}`;
        return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${filePath}`;
      } else {
        // Use optimized images API - this will correctly handle branch-specific folder structures
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const roomNumber = room.RoomNumber || room.roomNumber || '101';
        
        let apiPath = '';
        let imageIndex = 1;
        
        if ((room.BranchID || room.branchId) === 1) {
          // Young House 1: Only Type1 folder - branch1-{index}.jpg/JPG (9 images)
          imageIndex = Math.floor(Math.random() * 9) + 1;
          apiPath = `${baseUrl}/api/images/rooms/1/Type1/${imageIndex}?size=${size}`;
        } else if ((room.BranchID || room.branchId) === 2) {
          // Young House 2: Direct room type folders (Type3, Type4, Type5)
          // RoomTypeID 5 = Type5 (1 giường đôi căn góc), 3 = Type3 (2 giường đơn có ban công), 4 = Type4 (2 giường đơn có giếng trời)
          
          if ((room.RoomTypeID || room.roomTypeId) === 5) {
            // RoomTypeID 5: "1 giường đôi căn góc" → Type5/branch2-1-{index}.JPG (7 images)
            imageIndex = Math.floor(Math.random() * 7) + 1;
            apiPath = `${baseUrl}/api/images/rooms/2/Type5/${imageIndex}?size=${size}`;
          } else if ((room.RoomTypeID || room.roomTypeId) === 3) {
            // RoomTypeID 3: "2 giường đơn có ban công" → Type3/branch2-2-{index}.JPG (4 images)
            imageIndex = Math.floor(Math.random() * 4) + 1;
            apiPath = `${baseUrl}/api/images/rooms/2/Type3/${imageIndex}?size=${size}`;
          } else if ((room.RoomTypeID || room.roomTypeId) === 4) {
            // RoomTypeID 4: "2 giường đơn có giếng trời" → Type4/branch2-3-{index}.JPG (2 images)
            imageIndex = Math.floor(Math.random() * 2) + 1;
            apiPath = `${baseUrl}/api/images/rooms/2/Type4/${imageIndex}?size=${size}`;
          } else {
            // Default to Type5 for other Young House 2 room types
            imageIndex = Math.floor(Math.random() * 7) + 1;
            apiPath = `${baseUrl}/api/images/rooms/2/Type5/${imageIndex}?size=${size}`;
          }
        } else if ((room.BranchID || room.branchId) === 4) {
          // Young House 4: Type12 folder with branch4-{index}.jpg pattern (6 images)
          if ((room.RoomTypeID || room.roomTypeId) === 12) {
            imageIndex = Math.floor(Math.random() * 6) + 1;
            apiPath = `${baseUrl}/api/images/rooms/4/Type12/${imageIndex}?size=${size}`;
          } else {
            // Default to Type12 for other Young House 4 room types
            imageIndex = Math.floor(Math.random() * 6) + 1;
            apiPath = `${baseUrl}/api/images/rooms/4/Type12/${imageIndex}?size=${size}`;
          }
        } else if ((room.BranchID || room.branchId) === 9) {
          // Young House 9: Type10 folder with branch9-{index}.jpg/JPG pattern (9 images)
          if ((room.RoomTypeID || room.roomTypeId) === 10) {
            imageIndex = Math.floor(Math.random() * 9) + 1;
            apiPath = `${baseUrl}/api/images/rooms/9/Type10/${imageIndex}?size=${size}`;
          } else {
            // Default to Type10 for other Young House 9 room types
            imageIndex = Math.floor(Math.random() * 9) + 1;
            apiPath = `${baseUrl}/api/images/rooms/9/Type10/${imageIndex}?size=${size}`;
          }
        } else if ((room.BranchID || room.branchId) === 10) {
          // Young House 10: Type11 folder with branch10-{index}.jpg pattern (6 images)
          if ((room.RoomTypeID || room.roomTypeId) === 11) {
            imageIndex = Math.floor(Math.random() * 6) + 1;
            apiPath = `${baseUrl}/api/images/rooms/10/Type11/${imageIndex}?size=${size}`;
          } else {
            // Default to Type11 for other Young House 10 room types
            imageIndex = Math.floor(Math.random() * 6) + 1;
            apiPath = `${baseUrl}/api/images/rooms/10/Type11/${imageIndex}?size=${size}`;
          }
        } else if ((room.BranchID || room.branchId) === 11) {
          // Young House 11: Type8 folder with branch11-{index}.jpg pattern (7 images)
          if ((room.RoomTypeID || room.roomTypeId) === 8) {
            imageIndex = Math.floor(Math.random() * 7) + 1;
            apiPath = `${baseUrl}/api/images/rooms/11/Type8/${imageIndex}?size=${size}`;
          } else {
            // Default to Type8 for other Young House 11 room types
            imageIndex = Math.floor(Math.random() * 7) + 1;
            apiPath = `${baseUrl}/api/images/rooms/11/Type8/${imageIndex}?size=${size}`;
          }
        } else if ((room.BranchID || room.branchId) === 12) {
          // Young House 12: Type7 folder with branch12-{index}.jpg pattern (9 images)
          if ((room.RoomTypeID || room.roomTypeId) === 7) {
            imageIndex = Math.floor(Math.random() * 9) + 1;
            apiPath = `${baseUrl}/api/images/rooms/12/Type7/${imageIndex}?size=${size}`;
          } else {
            // Default to Type7 for other Young House 12 room types
            imageIndex = Math.floor(Math.random() * 9) + 1;
            apiPath = `${baseUrl}/api/images/rooms/12/Type7/${imageIndex}?size=${size}`;
          }
        } else if ((room.BranchID || room.branchId) === 14) {
          // Young House 14: Type13 folder with branch14-{index}.png pattern (8 images)
          if ((room.RoomTypeID || room.roomTypeId) === 13) {
            imageIndex = Math.floor(Math.random() * 8) + 1;
            apiPath = `${baseUrl}/api/images/rooms/14/Type13/${imageIndex}?size=${size}`;
          } else {
            // Default to Type13 for other Young House 14 room types
            imageIndex = Math.floor(Math.random() * 8) + 1;
            apiPath = `${baseUrl}/api/images/rooms/14/Type13/${imageIndex}?size=${size}`;
          }
        } else {
          // Default fallback
          apiPath = `${baseUrl}/api/images/rooms/1/Type1/1?size=${size}`;
        }
        
        if ((room.BranchID || room.branchId) === 2) {
          console.log(`🔍 BRANCH 2 DEBUG: TypeName="${room.TypeName || room.typeName}", RoomTypeID=${room.RoomTypeID || room.roomTypeId}, Match Result: ${
            (room.RoomTypeID || room.roomTypeId) === 5 ? 'Type1→101' :
            (room.RoomTypeID || room.roomTypeId) === 3 ? 'Type2→201' :
            (room.RoomTypeID || room.roomTypeId) === 4 ? 'Type3→301' : 'default→101'
          }`);
        }
        console.log(`🖼️ BRANCH ${room.BranchID || room.branchId} ROOM: ${roomNumber}, TYPE: "${room.TypeName || room.typeName}" → IMAGE: ${apiPath}`);
        return apiPath;
      }
    } catch (error) {
      console.warn('Error generating image path:', error);
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      return `${baseUrl}/api/images/rooms/1/101/1?size=${size}`;
    }
  };

  return (
    <div className="system-home">
      {/* Header Search */}
      <div className="search-header">
        <div className="container">
          <div className="breadcrumb">
            <span>Trang chủ</span>
            <span className="separator">&gt;</span>
            <span>Kết quả tìm kiếm</span>
          </div>
          
          <div className="search-bar">
            <div className="search-input-wrapper">
              <Search size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo địa chỉ hoặc tên khôn gian"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="search-button">Tìm kiếm</button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="system-content">
          {/* Sidebar Filters */}
          <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h3>Tìm phòng trống</h3>
            </div>

            {/* Date Picker */}
            <div className="filter-section">
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="date-input"
                placeholder="mm/dd/yyyy"
              />
            </div>

            {/* Main Filter Section */}
            <div className="filter-section">
              <h4>Lọc</h4>
              
              {/* Area Filter */}
              <div className="filter-subsection">
                <h5>Khu vực</h5>
                <div className="checkbox-group">
                  {availableAreas.map(area => (
                    <label key={area.name} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedAreas.includes(area.name)}
                        onChange={() => handleAreaChange(area.name)}
                      />
                      <span>{area.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Room Type Filter */}
              <div className="filter-subsection">
                <h5>Loại phòng</h5>
                <select 
                  value={selectedRoomTypes[0] || ''} 
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedRoomTypes([e.target.value]);
                    } else {
                      setSelectedRoomTypes([]);
                    }
                  }}
                  className="filter-select"
                >
                  <option value="">Tất cả loại phòng</option>
                  {roomTypes.map(roomType => (
                    <option key={roomType} value={roomType}>
                      {roomType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="filter-subsection">
                <h5>Trạng thái</h5>
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input
                      type="radio"
                      name="status"
                      checked={statusFilter === 'Available'}
                      onChange={() => setStatusFilter('Available')}
                    />
                    <span>Còn trống</span>
                  </label>
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-subsection">
                <h5>Khoảng giá</h5>
                <div className="price-range">
                  <div className="price-slider">
                    <input
                      type="range"
                      min="0"
                      max="10000000"
                      step="100000"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="price-slider-input"
                    />
                    <input
                      type="range"
                      min="0"
                      max="10000000"
                      step="100000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="price-slider-input"
                    />
                  </div>
                  <div className="price-labels">
                    <span>{formatPrice(priceRange.min)}</span>
                    <span>-</span>
                    <span>{formatPrice(priceRange.max)}</span>
                  </div>
                </div>
              </div>
            </div>

            <button className="clear-filters" onClick={clearFilters}>
              Xóa bỏ lọc
            </button>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <div className="results-header">
              <div className="results-info">
                <h2>Tìm phòng trống</h2>
                <p>Tổng cộng <strong>{filteredRooms.length}</strong> phòng trống</p>
              </div>
              
              <div className="view-controls">
                <div className="sort-options">
                  <span>Sắp xếp theo:</span>
                  <button className="sort-btn active">Phòng trống</button>
                  <button className="sort-btn">Danh sách</button>
                  <button className="sort-btn">Lướt</button>
                  <button className="sort-btn">Bản đồ</button>
                </div>
                
                <div className="view-mode">
                  <button 
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={20} />
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
              
              <button 
                className="mobile-filter-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} />
                Lọc
              </button>
            </div>

            {/* Room Results */}
            {isLoading ? (
              <div className="loading">Đang tải...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className={`rooms-grid ${viewMode}`}>
                {filteredRooms.map(room => (
                  <div 
                    key={room.RoomID || room.roomId} 
                    className="room-card"
                    onClick={(e) => {
                      // Sử dụng window.open để mở trong tab mới nếu Ctrl được giữ
                      if (e.ctrlKey || e.metaKey) {
                        window.open(`/rooms/${room.RoomID || room.roomId}`, '_blank');
                      } else {
                        window.location.href = `/rooms/${room.RoomID || room.roomId}`;
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="room-image">
                      <img 
                        src={getImagePath(room, viewMode === 'grid' ? 'medium' : 'large')} 
                        alt={`${room.BranchName || room.branchName} - Phòng ${room.RoomNumber || room.roomNumber}`}
                        loading="lazy"
                        onLoad={(e) => {
                          // Image loaded successfully
                          const imgElement = e.currentTarget;
                          console.log('Image loaded successfully:', getImagePath(room, viewMode === 'grid' ? 'medium' : 'large'));
                          if (imgElement) {
                            imgElement.style.opacity = '1';
                          }
                        }}
                        onError={(e) => {
                          const imgElement = e.currentTarget;
                          const parentElement = imgElement.parentElement;
                          console.error('Image failed to load:', getImagePath(room, viewMode === 'grid' ? 'medium' : 'large'));
                          
                          if (imgElement && parentElement) {
                            // Hide the broken image
                            imgElement.style.display = 'none';
                            
                            // Set background and content for parent
                            parentElement.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
                            parentElement.innerHTML = `
                              <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:0.9rem;text-align:center;">
                                <div>
                                  <div>Phòng ${room.RoomNumber || room.roomNumber}</div>
                                  <div style="font-size:0.8rem;margin-top:4px;">(${room.BranchName || room.branchName})</div>
                                </div>
                              </div>
                            `;
                          }
                        }}
                        style={{ 
                          opacity: 1, // Changed from 0 to 1 để hiển thị ngay
                          transition: 'opacity 0.3s ease',
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                      />
                      <div className="availability-badge">
                        {(room.Status || 'Available') === 'Available' ? 'Còn trống' : 
                         (room.Status || 'Available') === 'Occupied' ? 'Đã thuê' :
                         (room.Status || 'Available') === 'Reserved' ? 'Đã đặt' : 'Bảo trì'}
                      </div>
                    </div>
                    
                    <div className="room-content">
                      <div className="room-price">
                        {formatPrice(room.Price || room.price || 0)}/tháng
                      </div>
                      
                      <h3 className="room-name">{room.BranchName || room.branchName} - Phòng {room.RoomNumber || room.roomNumber}</h3>
                      
                      <div className="room-location">
                        <MapPin size={14} />
                        <span>{room.Address || room.address}, {room.City || 'Hà Nội'}</span>
                      </div>
                      
                      <div className="room-amenities">
                        <span className="amenity-tag">{room.TypeName || room.typeName}</span>
                        {(room.RoomDescription || room.description) && (
                          <span className="amenity-tag">{room.RoomDescription || room.description}</span>
                        )}
                        {(room.TypeDescription || room.typeDescription) && (
                          <span className="amenity-tag">{room.TypeDescription || room.typeDescription}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredRooms.length === 0 && !isLoading && !error && (
              <div className="no-results">
                <p>Không tìm thấy phòng nào phù hợp với tiêu chí của bạn.</p>
                <button onClick={clearFilters} className="clear-filters-btn">
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Pagination */}
            <div className="pagination">
              <button className="page-btn active">1</button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SystemHome;