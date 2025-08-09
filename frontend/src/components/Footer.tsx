import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-brand">
              <h3>YoungHouse</h3>
              <p>Nhà trọ tiện nghi dành cho cư dân trẻ</p>
            </div>
            <p className="footer-description">
              Khi nhà trọ cũng là nhà, YoungHouse tin rằng một không gian tiện nghi, 
              lối sống hiện đại là nền móng để cư dân trẻ có thể tự do sống tích cực 
              và thành công trong cuộc sống.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-link">
                <Instagram size={20} />
              </a>
              <a href="#" className="social-link">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Liên kết nhanh</h4>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/system-home">Hệ thống nhà trọ</Link></li>
              <li><Link to="/dashboard">Lối sống hiện đại</Link></li>
              <li><Link to="/create-post">Sự kiện</Link></li>
              <li><Link to="/profile">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h4>Dịch vụ</h4>
            <ul className="footer-links">
              <li><a href="#">Cho thuê phòng trọ</a></li>
              <li><a href="#">Tìm kiếm phòng trọ</a></li>
              <li><a href="#">Dịch vụ dọn phòng</a></li>
              <li><a href="#">Bảo trì kỹ thuật</a></li>
              <li><a href="#">Tư vấn pháp lý</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Thông tin liên hệ</h4>
            <div className="contact-info">
              <div className="contact-item">
                <MapPin size={16} />
                <span>Khu đô thị Hoà Lạc, Thạch Thất, Hà Nội</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>0123 456 789</span>
              </div>
              <div className="contact-item">
                <Mail size={16} />
                <span>contact@younghouse.com</span>
              </div>
            </div>
            
            <div className="newsletter">
              <h5>Đăng ký nhận tin</h5>
              <div className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Email của bạn"
                  className="newsletter-input"
                />
                <button className="newsletter-button">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 YoungHouse. Tất cả quyền được bảo lưu.</p>
            <div className="footer-bottom-links">
              <a href="#">Chính sách bảo mật</a>
              <a href="#">Điều khoản sử dụng</a>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;