import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { Post } from '../types';
import { Search, MapPin, Calendar, DollarSign } from 'lucide-react';
import './Home.css';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchForm, setSearchForm] = useState({
    district: '',
    roomType: '',
    priceRange: '',
    dateRange: ''
  });

  useEffect(() => {
    fetchPosts();
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

  const handleSearchFormChange = (field: string, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    console.log('Searching with:', searchForm);
    // Implement search logic here
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
              Tìm trọ Hoà Lạc, Tìm ngay tại YoungHouse!
            </p>
            
            <div className="search-form">
              <div className="search-field">
                <label>Quận</label>
                <select 
                  value={searchForm.district}
                  onChange={(e) => handleSearchFormChange('district', e.target.value)}
                >
                  <option value="">Chọn khu vực</option>
                  <option value="tan-xa">Tân Xã</option>
                  <option value="phu-huu">Phú Hứu</option>
                  
                </select>
              </div>
              
              <div className="search-field">
                <label>Loại phòng</label>
                <select 
                  value={searchForm.roomType}
                  onChange={(e) => handleSearchFormChange('roomType', e.target.value)}
                >
                  <option value="">Chọn loại phòng</option>
                  <option value="101">Giường đôi</option>
                  <option value="201">2 giường đơn</option>
                  <option value="301">1 giường đôi</option>
                  <option value="401">2 giường đơn</option>
                </select>
              </div>
              
              <div className="search-field">
                <label>Khoảng giá</label>
                <select 
                  value={searchForm.priceRange}
                  onChange={(e) => handleSearchFormChange('priceRange', e.target.value)}
                >
                  <option value="">Chọn khoảng giá</option>
                  <option value="0-2">Dưới 2 triệu</option>
                  <option value="2-3">2-3 triệu</option>
                  <option value="3-5">3-5 triệu</option>
                 
                </select>
              </div>
              
              <div className="search-field">
                <label>Tìm phòng trống</label>
                <select 
                  value={searchForm.dateRange}
                  onChange={(e) => handleSearchFormChange('dateRange', e.target.value)}
                >
                  <option value="">Chọn ngày bắt đầu</option>
                  <option value="now">Ngay bây giờ</option>
                  <option value="1week">Trong 1 tuần</option>
                  <option value="1month">Trong 1 tháng</option>
                  <option value="flexible">Linh hoạt</option>
                </select>
              </div>
              
              <button className="search-button" onClick={handleSearch}>
                <Search size={20} />
                Tìm kiếm
              </button>
            </div>
          </div>
          
          <div className="hero-image">
            <div className="room-showcase">
              <div className="room-image-placeholder">
                <img 
                  src="/api/images/logo/logo.jpg" 
                  alt="Young House Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
                    e.currentTarget.parentElement!.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:1.2rem;">Young House</div>';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isLoading && !error && posts.length > 0 && (
        <div className="featured-rooms">
          <div className="container">
            <h2>Phòng nổi bật</h2>
            <div className="rooms-grid">
              {posts.slice(0, 6).map((post) => (
                <div key={post.id} className="room-card">
                  <div className="room-image">
                    <img 
                      src={`/api/placeholder/300/200`} 
                      alt={post.title}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
                        e.currentTarget.parentElement!.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;">Hình ảnh phòng</div>';
                      }}
                    />
                  </div>
                  <div className="room-info">
                    <h3>{post.title}</h3>
                    <p className="room-location">
                      <MapPin size={14} />
                      Hoà Lạc
                    </p>
                    <p className="room-price">
                      <DollarSign size={14} />
                      Từ 2.5 triệu/tháng
                    </p>
                    <Link to={`/posts/${post.id}`} className="view-details">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;