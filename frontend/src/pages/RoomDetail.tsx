import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Wifi, 
  AirVent, 
  Fingerprint, 
  Droplets,
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
import ViewingAppointmentForm from '../components/ViewingAppointmentForm';
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
  const [showViewingAppointmentForm, setShowViewingAppointmentForm] = useState(false);
  
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
    } else if (room.BranchID === 4) {
      // Young House 4: Type12 folder with branch4-{index}.jpg pattern (6 images)
      const imageCount = 6;
      
      for (let i = 1; i <= imageCount; i++) {
        images.push(`${baseUrl}/api/images/rooms/4/Type12/${i}?size=large`);
      }
    } else if (room.BranchID === 9) {
      // Young House 9: Type10 folder with branch9-{index}.jpg/JPG pattern (9 images)
      const imageCount = 9;
      
      for (let i = 1; i <= imageCount; i++) {
        images.push(`${baseUrl}/api/images/rooms/9/Type10/${i}?size=large`);
      }
    } else if (room.BranchID === 10) {
      // Young House 10: Type11 folder with branch10-{index}.jpg pattern (6 images)
      const imageCount = 6;
      
      for (let i = 1; i <= imageCount; i++) {
        images.push(`${baseUrl}/api/images/rooms/10/Type11/${i}?size=large`);
      }
    } else if (room.BranchID === 11) {
      // Young House 11: Type8 folder with branch11-{index}.jpg pattern (7 images)
      const imageCount = 7;
      
      for (let i = 1; i <= imageCount; i++) {
        images.push(`${baseUrl}/api/images/rooms/11/Type8/${i}?size=large`);
      }
    } else if (room.BranchID === 12) {
      // Young House 12: Type7 folder with branch12-{index}.jpg pattern (9 images)
      const imageCount = 9;
      
      for (let i = 1; i <= imageCount; i++) {
        images.push(`${baseUrl}/api/images/rooms/12/Type7/${i}?size=large`);
      }
    } else if (room.BranchID === 14) {
      // Young House 14: Type13 folder with branch14-{index}.png pattern (8 images)
      const imageCount = 8;
      
      for (let i = 1; i <= imageCount; i++) {
        images.push(`${baseUrl}/api/images/rooms/14/Type13/${i}?size=large`);
      }
    } else {
      // Fallback for unknown branches - try to use the generic API
      console.warn(`Unknown BranchID: ${room.BranchID}, using fallback image logic`);
      // Return a single placeholder or try to get a random image
      images.push(`${baseUrl}/api/images/rooms/${room.BranchID}/random?size=large`);
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

  // Get service fee based on branch (Young House 10 and 14 have special rate)
  const getServiceFee = (room: Room): number => {
    if (room.ServiceFee || room.serviceFee) {
      return room.ServiceFee || room.serviceFee || 0;
    }
    
    // Young House 10 and Young House 14 have special service fee
    if (room.BranchID === 10 || room.BranchID === 14) {
      return 1800000;
    }
    
    // Default service fee for other branches
    return 2300000;
  };

  // Get electricity fee
  const getElectricityFee = (room: Room): number => {
    if (room.ElectricityFee || room.electricityFee) {
      return room.ElectricityFee || room.electricityFee || 0;
    }
    
    // Default electricity fee per kWh
    return 3200;
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
              <span className="price">{formatPrice(room.Price || room.price || 0)}</span>
              <span className="period">/tháng</span>
            </div>
          </div>

          <div className="room-location">
            <MapPin size={18} />
            <span>{room.Address}, {room.City}</span>
          </div>

          <div className="room-status">
            <span className={`status-badge ${(room.Status || 'Available').toLowerCase()}`}>
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
            <div className="detail-item">
              <strong>Giá dịch vụ:</strong> {formatPrice(getServiceFee(room))}<span className="fee-period">/tháng</span>
            </div>
            <div className="detail-item">
              <strong>Giá điện:</strong> {formatPrice(getElectricityFee(room))}<span className="fee-period">/số</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="room-amenities">
            <h3>Tiện nghi</h3>
            <div className="amenities-grid">
              <div className="amenity-item">
                <Wifi size={20} />
                <span>WiFi từng phòng</span>
              </div>
              <div className="amenity-item">
                <AirVent size={20} />
                <span>Điều hòa</span>
              </div>
              <div className="amenity-item">
                <Fingerprint size={20} />
                <span>Vân tay toà nhà</span>
              </div>
              <div className="amenity-item">
                <Droplets size={20} />
                <span>Nóng lạnh</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-info">
            <h3>Thông tin liên hệ</h3>
            {room.Phone && (
              <div className="contact-item">
                <Phone size={18} />
                <span>0372858098</span>
              </div>
            )}
            <div className="contact-item">
              <Mail size={18} />
              <span>bachqxhe180125@fpt.edu.vn</span>
            </div>
          </div>
        </div>

        {/* Viewing Appointment Section */}
        <div className="viewing-appointment-section">
          <div className="viewing-appointment-card">
            <div className="viewing-appointment-header">
              <h3>Đặt lịch xem phòng</h3>
              <p>Tham quan phòng trước khi quyết định thuê</p>
            </div>
            
            <div className="viewing-appointment-content">
              <div className="appointment-benefits">
                <div className="benefit-item">
                  <Calendar size={20} />
                  <span>Linh hoạt thời gian</span>
                </div>
                <div className="benefit-item">
                  <Users size={20} />
                  <span>Hỗ trợ tận tình</span>
                </div>
                <div className="benefit-item">
                  <Star size={20} />
                  <span>Miễn phí</span>
                </div>
              </div>
              
              <button 
                className="viewing-appointment-button"
                onClick={() => setShowViewingAppointmentForm(true)}
              >
                Đặt lịch xem phòng
              </button>
              
              <div className="appointment-note">
                <small>
                  Đặt lịch hẹn để được tư vấn và tham quan phòng trọ miễn phí.
                  Nhân viên sẽ liên hệ xác nhận trong vòng 24h.
                </small>
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

      {/* Viewing Appointment Form Modal */}
      <ViewingAppointmentForm
        isOpen={showViewingAppointmentForm}
        onClose={() => setShowViewingAppointmentForm(false)}
        roomId={room?.RoomID}
        room={room || undefined}
      />
    </div>
  );
};

export default RoomDetail;