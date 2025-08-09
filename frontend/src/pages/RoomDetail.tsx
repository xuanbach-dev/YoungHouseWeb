import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Wifi, 
  AirVent, 
  Tv, 
  Car,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  Star,
  Heart
} from 'lucide-react';
import { roomsAPI } from '../services/api';
import { Room } from '../types';
import './RoomDetail.css';

const RoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState('');
  const [selectedCheckOut, setSelectedCheckOut] = useState('');
  
  // Get room images based on current system logic
  const getRoomImages = (room: Room): string[] => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const images: string[] = [];
    
    if (room.BranchID === 1) {
      // Young House 1: Only Type1 folder - branch1-{index}.jpg/JPG (9 images)
      const imageCount = 9;
      
      for (let i = 1; i <= imageCount; i++) {
        images.push(`${baseUrl}/api/images/rooms/1/Type1/${i}?size=large`);
      }
    } else if (room.BranchID === 2) {
      // Young House 2: Direct room type folders (Type3, Type4, Type5)
      let imageCount = 7;
      let roomType = 'Type5';
      
      if (room.RoomTypeID === 5) {
        // RoomTypeID 5: "1 giường đôi căn góc" → Type5/branch2-1-{index}.JPG (7 images)
        imageCount = 7;
        roomType = 'Type5';
      } else if (room.RoomTypeID === 3) {
        // RoomTypeID 3: "2 giường đơn có ban công" → Type3/branch2-2-{index}.JPG (4 images)
        imageCount = 4;
        roomType = 'Type3';
      } else if (room.RoomTypeID === 4) {
        // RoomTypeID 4: "2 giường đơn có giếng trời" → Type4/branch2-3-{index}.JPG (2 images)
        imageCount = 2;
        roomType = 'Type4';
      }
      // Default to Type5 (7 images) for other RoomTypeIDs
      
      for (let i = 1; i <= imageCount; i++) {
        images.push(`${baseUrl}/api/images/rooms/2/${roomType}/${i}?size=large`);
      }
    }
    
    return images;
  };

  useEffect(() => {
    if (id) {
      fetchRoomDetail(parseInt(id));
    }
  }, [id]);

  const fetchRoomDetail = async (roomId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await roomsAPI.getRoomById(roomId);
      
      if (response.data.success) {
        setRoom(response.data.data);
      } else {
        setError('Không tìm thấy thông tin phòng');
      }
    } catch (err: any) {
      console.error('Error fetching room detail:', err);
      setError('Không thể tải thông tin phòng. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    if (room) {
      const images = getRoomImages(room);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (room) {
      const images = getRoomImages(room);
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateDuration = () => {
    if (!selectedCheckIn || !selectedCheckOut) return 0;
    
    const checkIn = new Date(selectedCheckIn);
    const checkOut = new Date(selectedCheckOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotal = () => {
    const duration = calculateDuration();
    const monthlyRate = room?.Price || 0;
    const dailyRate = monthlyRate / 30; // Tính theo ngày dựa trên giá tháng
    return duration * dailyRate;
  };

  const handleBooking = () => {
    if (!selectedCheckIn || !selectedCheckOut) {
      alert('Vui lòng chọn ngày check-in và check-out');
      return;
    }
    
    const duration = calculateDuration();
    const total = calculateTotal();
    
    // Có thể navigate đến trang booking hoặc hiển thị modal xác nhận
    const confirmMessage = `
Xác nhận đặt phòng:
- Phòng: ${room?.BranchName} - Phòng ${room?.RoomNumber}
- Từ: ${selectedCheckIn}
- Đến: ${selectedCheckOut}
- Thời gian: ${duration} ngày
- Tổng tiền: ${formatPrice(total)}

Bạn có muốn tiếp tục?`;
    
    if (window.confirm(confirmMessage)) {
      alert('Đặt phòng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
    }
  };

  if (isLoading) {
    return (
      <div className="room-detail-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin phòng...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="room-detail-error">
        <div className="error-content">
          <h2>Có lỗi xảy ra</h2>
          <p>{error || 'Không tìm thấy phòng'}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={20} />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const images = getRoomImages(room);

  return (
    <div className="room-detail">
      {/* Header */}
      <div className="room-detail-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
          Quay lại
        </button>
        
        <div className="header-actions">
          <button 
            className={`favorite-button ${isFavorite ? 'active' : ''}`}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="room-images">
        <div className="main-image-container">
          <img 
            src={images[currentImageIndex]} 
            alt={`${room.BranchName} - Phòng ${room.RoomNumber}`}
            className="main-image"
            onClick={() => setShowImageModal(true)}
          />
          
          {images.length > 1 && (
            <>
              <button className="image-nav prev" onClick={prevImage}>
                <ChevronLeft size={24} />
              </button>
              <button className="image-nav next" onClick={nextImage}>
                <ChevronRight size={24} />
              </button>
              
              <div className="image-indicators">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
          
          <div className="image-count">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="thumbnail-gallery">
            {images.map((image, index) => (
              <img
                key={index}
                src={image.replace('size=large', 'size=thumbnail')}
                alt={`Ảnh ${index + 1}`}
                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Room Information */}
      <div className="room-info-container">
        <div className="room-main-info">
          <div className="room-header">
            <div className="room-title">
              <h1>{room.BranchName} - Phòng {room.RoomNumber}</h1>
              <div className="room-rating">
                <Star size={16} fill="currentColor" />
                <span>4.8 (124 đánh giá)</span>
              </div>
            </div>
            
            <div className="room-price">
              <span className="price">{formatPrice(room.Price)}</span>
              <span className="period">/tháng</span>
            </div>
          </div>

          <div className="room-location">
            <MapPin size={18} />
            <span>{room.Address}, {room.City}</span>
          </div>

          <div className="room-status">
            <span className={`status-badge ${room.Status.toLowerCase()}`}>
              {room.Status === 'Available' ? 'Còn trống' : 
               room.Status === 'Occupied' ? 'Đã thuê' :
               room.Status === 'Reserved' ? 'Đã đặt' : 'Bảo trì'}
            </span>
          </div>

          {/* Room Type & Description */}
          <div className="room-details">
            <h3>Thông tin phòng</h3>
            <div className="detail-item">
              <strong>Loại phòng:</strong> {room.TypeName}
            </div>
            {room.TypeDescription && (
              <div className="detail-item">
                <strong>Mô tả:</strong> {room.TypeDescription}
              </div>
            )}
            {room.RoomDescription && (
              <div className="detail-item">
                <strong>Chi tiết:</strong> {room.RoomDescription}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="room-amenities">
            <h3>Tiện nghi</h3>
            <div className="amenities-grid">
              <div className="amenity-item">
                <Wifi size={20} />
                <span>WiFi miễn phí</span>
              </div>
              <div className="amenity-item">
                <AirVent size={20} />
                <span>Điều hòa</span>
              </div>
              <div className="amenity-item">
                <Tv size={20} />
                <span>TV</span>
              </div>
              <div className="amenity-item">
                <Car size={20} />
                <span>Chỗ đậu xe</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-info">
            <h3>Thông tin liên hệ</h3>
            {room.Phone && (
              <div className="contact-item">
                <Phone size={18} />
                <span>{room.Phone}</span>
              </div>
            )}
            <div className="contact-item">
              <Mail size={18} />
              <span>info@younghouse.vn</span>
            </div>
          </div>
        </div>

        {/* Booking Panel */}
        <div className="booking-panel">
          <div className="booking-card">
            <div className="booking-header">
              <h3>Đặt phòng</h3>
              <div className="booking-price">
                {formatPrice(room.Price)}/tháng
              </div>
            </div>

            <div className="booking-form">
              <div className="date-inputs">
                <div className="input-group">
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={selectedCheckIn}
                    onChange={(e) => setSelectedCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="input-group">
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    value={selectedCheckOut}
                    onChange={(e) => setSelectedCheckOut(e.target.value)}
                    min={selectedCheckIn}
                  />
                </div>
              </div>

              {/* Booking Summary */}
              {selectedCheckIn && selectedCheckOut && (
                <div className="booking-summary">
                  <div className="summary-row">
                    <span>Thời gian thuê:</span>
                    <span>{calculateDuration()} ngày</span>
                  </div>
                  <div className="summary-row">
                    <span>Giá theo ngày:</span>
                    <span>{formatPrice(room.Price / 30)}</span>
                  </div>
                  <div className="summary-row total">
                    <span><strong>Tổng cộng:</strong></span>
                    <span><strong>{formatPrice(calculateTotal())}</strong></span>
                  </div>
                </div>
              )}

              <button 
                className="booking-button"
                onClick={handleBooking}
                disabled={room.Status !== 'Available'}
              >
                {room.Status === 'Available' ? 'Đặt phòng' : 'Phòng không khả dụng'}
              </button>

              <div className="booking-note">
                <small>Bạn sẽ không bị tính phí cho đến khi đặt phòng được xác nhận</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal" onClick={() => setShowImageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowImageModal(false)}
            >
              <X size={24} />
            </button>
            
            <img 
              src={images[currentImageIndex]} 
              alt={`${room.BranchName} - Phòng ${room.RoomNumber}`}
              className="modal-image"
            />
            
            {images.length > 1 && (
              <>
                <button className="modal-nav prev" onClick={prevImage}>
                  <ChevronLeft size={32} />
                </button>
                <button className="modal-nav next" onClick={nextImage}>
                  <ChevronRight size={32} />
                </button>
              </>
            )}
            
            <div className="modal-counter">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetail;