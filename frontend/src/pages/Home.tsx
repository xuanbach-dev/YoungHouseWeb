import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI, roomsAPI, branchesAPI } from '../services/api';
import { Post, Room } from '../types';
import { Search, MapPin, Calendar, DollarSign, Eye, Loader2, Leaf, Lightbulb, Utensils, WashingMachine, Shirt, Gift, Sofa, Briefcase, Bed, Shield, Building2, Users, MessageSquare, Headphones } from 'lucide-react';
import ViewingAppointmentForm from '../components/ViewingAppointmentForm';
import './Home.css';

interface Branch {
  BranchID: number;
  BranchName: string;
  Address: string;
  City: string;
}

interface RoomType {
  RoomTypeID: number;
  TypeName: string;
  Price: number;
  Description: string;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchResults, setSearchResults] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [searchForm, setSearchForm] = useState({
    branchId: '',
    roomTypeId: '',
    priceRange: '',
    status: 'Available'
  });
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchRooms();
    fetchBranches();
    fetchRoomTypes();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await postsAPI.getPosts(1, 10);
      setPosts(response.data.posts);
    } catch (err: any) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.getRooms(1, 20);
      setRooms(response.data.data.rooms || []);
    } catch (err: any) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await branchesAPI.getBranches();
      setBranches(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching branches:', err);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await roomsAPI.getRoomTypes();
      setRoomTypes(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching room types:', err);
    }
  };

  const handleSearchFormChange = (field: string, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      setError(null);
      
      const filters: any = {};
      
      if (searchForm.branchId) {
        filters.branchId = parseInt(searchForm.branchId);
      }
      
      if (searchForm.roomTypeId) {
        filters.roomTypeId = parseInt(searchForm.roomTypeId);
      }
      
      if (searchForm.priceRange) {
        const [min, max] = searchForm.priceRange.split('-').map(Number);
        if (min !== undefined) filters.minPrice = min * 1000000; // Convert to VND
        if (max !== undefined && max > 0) filters.maxPrice = max * 1000000;
      }
      
      if (searchForm.status) {
        filters.status = searchForm.status;
      }
      
      filters.limit = 50; // Increase limit for search results
      
      const response = await roomsAPI.advancedSearchRooms(filters);
      setSearchResults(response.data.data.rooms || []);
      setHasSearched(true);
      
      // Scroll to results
      setTimeout(() => {
        const resultsSection = document.getElementById('search-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (err: any) {
      setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      console.error('Error searching rooms:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const resetSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
    setSearchForm({
      branchId: '',
      roomTypeId: '',
      priceRange: '',
      status: 'Available'
    });
  };

  const handleViewingAppointment = (room: Room) => {
    setSelectedRoom(room);
    setIsAppointmentFormOpen(true);
  };

  const closeAppointmentForm = () => {
    setIsAppointmentFormOpen(false);
    setSelectedRoom(null);
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Nhà trọ tiện nghi</h1>
            <h2>Cư dân YoungHouse</h2>
            <p>
              Khi nhà trọ cũng là nhà, YoungHouse tin rằng một không gian tiện nghi, 
              lối sống văn minh là nền móng để cư dân trẻ có thể tự do sống tích cực 
              và thành công trong cuộc sống.
            </p>
            <p className="hero-subtitle">
            Young House - Hệ thống nhà cho thuê Lớn và Uy tín nhất Hòa Lạc ❤️

            </p>
            
            <div className="search-form">
              <div className="search-field">
                <label>Chi nhánh</label>
                <select 
                  value={searchForm.branchId}
                  onChange={(e) => handleSearchFormChange('branchId', e.target.value)}
                >
                  <option value="">Tất cả chi nhánh</option>
                  {branches.map((branch) => (
                    <option key={branch.BranchID} value={branch.BranchID}>
                      {branch.BranchName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="search-field">
                <label>Loại phòng</label>
                <select 
                  value={searchForm.roomTypeId}
                  onChange={(e) => handleSearchFormChange('roomTypeId', e.target.value)}
                >
                  <option value="">Tất cả loại phòng</option>
                  {roomTypes.map((roomType) => (
                    <option key={roomType.RoomTypeID} value={roomType.RoomTypeID}>
                      {roomType.TypeName} - {roomType.Price?.toLocaleString('vi-VN')} VND
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="search-field">
                <label>Khoảng giá</label>
                <select 
                  value={searchForm.priceRange}
                  onChange={(e) => handleSearchFormChange('priceRange', e.target.value)}
                >
                  <option value="">Tất cả mức giá</option>
                  <option value="0-2">Dưới 2 triệu</option>
                  <option value="2-3">2-3 triệu</option>
                  <option value="3-4">3-4 triệu</option>
                  <option value="4-5">4-5 triệu</option>
                  <option value="5-0">Trên 5 triệu</option>
                </select>
              </div>
              
              <div className="search-field">
                <label>Trạng thái</label>
                <select 
                  value={searchForm.status}
                  onChange={(e) => handleSearchFormChange('status', e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Available">Có sẵn</option>
                  <option value="Occupied">Đã thuê</option>
                  <option value="Maintenance">Bảo trì</option>
                  <option value="Reserved">Đã đặt</option>
                </select>
              </div>
              
              <button 
                className="search-button" 
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Search size={20} />
                )}
                {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>

              {hasSearched && (
                <button 
                  className="reset-button" 
                  onClick={resetSearch}
                  style={{ 
                    marginLeft: '10px',
                    padding: '10px 15px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
          
          <div className="hero-image">
            <div className="room-showcase">
              <div className="room-image-placeholder">
                <img 
                  src="/logo.png" 
                  alt="Young House Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    // e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
                    // e.currentTarget.parentElement!.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:1.2rem;">Young House</div>';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities Section */}
      <div className="amenities-section">
        <div className="container">
          <h2 className="amenities-title">Không gian sống tiện nghi</h2>
          <p className="amenities-subtitle">
            Môi trường sống phát triển, văn minh, hiện đại làm nên tăng sống cho mỗi người thức 
            hiện mọi mục tiêu các nhân trong cuộc sống
          </p>
          
          <div className="amenities-grid">
            <div className="amenity-item">
              <div className="amenity-icon">
                <Leaf size={24} />
              </div>
              <span>Cây xanh</span>
            </div>
            
            <div className="amenity-item">
              <div className="amenity-icon">
                <Lightbulb size={24} />
              </div>
              <span>Toilet</span>
            </div>
            
            <div className="amenity-item">
              <div className="amenity-icon">
                <Utensils size={24} />
              </div>
              <span>Phòng tắm</span>
            </div>
            
            <div className="amenity-item">
              <div className="amenity-icon">
                <WashingMachine size={24} />
              </div>
              <span>Máy giặt</span>
            </div>
            
            <div className="amenity-item">
              <div className="amenity-icon">
                <Shirt size={24} />
              </div>
              <span>Tủ quần áo</span>
            </div>
            
            <div className="amenity-item">
              <div className="amenity-icon">
                <Gift size={24} />
              </div>
              <span>Bếp nấu ăn</span>
            </div>
            
            <div className="amenity-item">
              <div className="amenity-icon">
                <Sofa size={24} />
              </div>
              <span>Kê ti vi</span>
            </div>
            
            <div className="amenity-item">
              <div className="amenity-icon">
                <Briefcase size={24} />
              </div>
              <span>Bàn làm việc</span>
            </div>
            
            <div className="amenity-item">
              <div className="amenity-icon">
                <Bed size={24} />
              </div>
              <span>Giường</span>
            </div>
            
            <div className="amenity-item">
              <div className="amenity-icon">
                <Shield size={24} />
              </div>
              <span>An ninh 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="values-section">
        <div className="container">
          <h2 className="values-title">Giá trị Young House</h2>
          
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">
                <Building2 size={32} />
              </div>
              <h3>Nhà trọ sáng, thoáng, kết cấu chắc chắn</h3>
            </div>
            
            <div className="value-item">
              <div className="value-icon">
                <Users size={32} />
              </div>
              <h3>Phòng trọ tiện nghi, thiết kế tối giản, gọn gàng</h3>
            </div>
            
            <div className="value-item">
              <div className="value-icon">
                <MessageSquare size={32} />
              </div>
              <h3>Cộng đồng sinh viên FPT năng động, hoà đồng</h3>
            </div>
            
            <div className="value-item">
              <div className="value-icon">
                <Headphones size={32} />
              </div>
              <h3>Quản lý hỗ trợ 24/7, luôn có mặt hỗ trợ cư dân Young House</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Section */}
      {hasSearched && (
        <div id="search-results" className="search-results-section">
          <div className="container">
            <h2>
              Kết quả tìm kiếm 
              {searchResults.length > 0 && (
                <span style={{ color: '#666', fontSize: '0.9em', fontWeight: 'normal' }}>
                  ({searchResults.length} phòng)
                </span>
              )}
            </h2>
            
            {error && (
              <div style={{ 
                color: '#dc3545', 
                background: '#f8d7da', 
                padding: '10px', 
                borderRadius: '5px', 
                marginBottom: '20px' 
              }}>
                {error}
              </div>
            )}
            
            {searchResults.length === 0 && !isSearching && !error && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666' 
              }}>
                <p>Không tìm thấy phòng nào phù hợp với tiêu chí tìm kiếm.</p>
                <p>Vui lòng thử điều chỉnh bộ lọc tìm kiếm.</p>
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="rooms-grid">
                {searchResults.map((room) => (
                  <div key={room.RoomID || room.roomId} className="room-card">
                    <div className="room-image">
                      <img 
                        src={`/api/images/rooms/${room.BranchID || room.branchId}/${
                          (room.RoomTypeID || room.roomTypeId) === 1 ? 'Type1' : 
                          (room.RoomTypeID || room.roomTypeId) === 3 ? 'Type3' : 
                          (room.RoomTypeID || room.roomTypeId) === 4 ? 'Type4' : 
                          (room.RoomTypeID || room.roomTypeId) === 5 ? 'Type5' :
                          (room.RoomTypeID || room.roomTypeId) === 7 ? 'Type7' :
                          (room.RoomTypeID || room.roomTypeId) === 8 ? 'Type8' :
                          (room.RoomTypeID || room.roomTypeId) === 10 ? 'Type10' :
                          (room.RoomTypeID || room.roomTypeId) === 11 ? 'Type11' :
                          (room.RoomTypeID || room.roomTypeId) === 12 ? 'Type12' :
                          (room.RoomTypeID || room.roomTypeId) === 13 ? 'Type13' :
                          'Type1'  // Default fallback
                        }/1?size=medium`}
                        alt={`Phòng ${room.RoomNumber || room.roomNumber}`}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
                          e.currentTarget.parentElement!.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;">Hình ảnh phòng</div>';
                        }}
                      />
                    </div>
                    <div className="room-info">
                      <h3>Phòng {room.RoomNumber || room.roomNumber}</h3>
                      <p className="room-type">{room.TypeName || room.typeName}</p>
                      <p className="room-location">
                        <MapPin size={14} />
                        {room.BranchName || room.branchName}
                      </p>
                      <p className="room-price">
                        <DollarSign size={14} />
                        {(room.Price || room.price)?.toLocaleString('vi-VN')} VND/tháng
                      </p>
                      <p className={`room-status ${room.Status?.toLowerCase()}`}>
                        Trạng thái: {
                          room.Status === 'Available' ? 'Có sẵn' :
                          room.Status === 'Occupied' ? 'Đã thuê' :
                          room.Status === 'Maintenance' ? 'Bảo trì' :
                          room.Status === 'Reserved' ? 'Đã đặt' :
                          room.Status
                        }
                      </p>
                      <div className="room-actions">
                        <button 
                          className="appointment-button"
                          onClick={() => handleViewingAppointment(room)}
                          disabled={room.Status !== 'Available'}
                        >
                          <Eye size={16} />
                          {room.Status === 'Available' ? 'Hẹn lịch xem phòng' : 'Không khả dụng'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!isLoading && !error && rooms.length > 0 && !hasSearched && (
        <div className="featured-rooms">
          <div className="container">
            <h2>Phòng nổi bật</h2>
            <div className="rooms-grid">
              {rooms.slice(0, 6).map((room) => (
                <div key={room.roomId} className="room-card">
                  <div className="room-image">
                    <img 
                      src={`/api/images/rooms/${room.branchId}/${
                        room.roomTypeId === 1 ? 'Type1' : 
                        room.roomTypeId === 3 ? 'Type3' : 
                        room.roomTypeId === 4 ? 'Type4' : 
                        room.roomTypeId === 5 ? 'Type5' :
                        room.roomTypeId === 7 ? 'Type7' :
                        room.roomTypeId === 8 ? 'Type8' :
                        room.roomTypeId === 10 ? 'Type10' :
                        room.roomTypeId === 11 ? 'Type11' :
                        room.roomTypeId === 12 ? 'Type12' :
                        room.roomTypeId === 13 ? 'Type13' :
                        'Type1'  // Default fallback
                      }/1?size=medium`}
                      alt={`Phòng ${room.roomNumber}`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
                        e.currentTarget.parentElement!.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;">Hình ảnh phòng</div>';
                      }}
                    />
                  </div>
                  <div className="room-info">
                    <h3>Phòng {room.roomNumber}</h3>
                    <p className="room-type">{room.typeName}</p>
                    <p className="room-location">
                      <MapPin size={14} />
                      {room.branchName}
                    </p>
                    <p className="room-price">
                      <DollarSign size={14} />
                      {room.price?.toLocaleString('vi-VN')} VND/tháng
                    </p>
                    <div className="room-actions">
                      <button 
                        className="appointment-button"
                        onClick={() => handleViewingAppointment(room)}
                      >
                        <Eye size={16} />
                        Hẹn lịch xem phòng
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ViewingAppointmentForm
        isOpen={isAppointmentFormOpen}
        onClose={closeAppointmentForm}
        roomId={selectedRoom?.RoomID || selectedRoom?.roomId}
        room={selectedRoom || undefined}
      />
    </div>
  );
};

export default Home;