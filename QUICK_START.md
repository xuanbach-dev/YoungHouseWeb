# ⚡ Quick Start Guide - YoungHouse Web

## 🎯 Triển khai nhanh trong 15 phút

### Bước 1: Chuẩn bị server (5 phút)
```bash
# Kết nối SSH vào server
ssh root@YOUR_SERVER_IP

# Chạy script setup tự động
curl -fsSL https://raw.githubusercontent.com/your-repo/YoungHouseWeb/main/server-setup.sh -o setup.sh
chmod +x setup.sh
./setup.sh

# Khởi động lại server
sudo reboot
```

### Bước 2: Deploy project (5 phút)
```bash
# SSH lại sau khi reboot
ssh root@YOUR_SERVER_IP

# Chuyển sang user younghouse
sudo su - younghouse

# Clone project
cd /var/www
git clone https://github.com/your-username/YoungHouseWeb.git younghouse
cd younghouse

# Cấu hình environment
cp env.production.example .env
nano .env  # Sửa thông tin database, JWT secret

# Deploy
chmod +x deploy.sh
./deploy.sh
```

### Bước 3: Cấu hình domain (5 phút)
```bash
# Thêm A record trong DNS của domain provider:
# Type: A, Name: @, Value: YOUR_SERVER_IP
# Type: A, Name: www, Value: YOUR_SERVER_IP

# Đợi DNS propagation (2-5 phút)
# Kiểm tra: nslookup yourdomain.com

# Setup SSL miễn phí
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Cấu hình Nginx
sudo nano /etc/nginx/sites-enabled/default
# Copy nội dung từ nginx/nginx.conf

sudo nginx -t && sudo systemctl reload nginx
```

## 🚀 Xong! Website đã live

- **Website**: https://yourdomain.com
- **API**: https://yourdomain.com/api
- **Admin**: https://yourdomain.com/admin

## 🔧 Commands hữu ích

```bash
# Kiểm tra status
docker-compose ps
system-info

# Xem logs
docker-compose logs -f
tail -f /var/log/nginx/access.log

# Deploy update
./deploy.sh

# Backup database
docker exec younghouse-web_db_1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "PASSWORD" -Q "BACKUP DATABASE YoungHouseDB TO DISK = '/backup/backup.bak'"

# Restore
docker cp backup.bak younghouse-web_db_1:/backup/
docker exec younghouse-web_db_1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "PASSWORD" -Q "RESTORE DATABASE YoungHouseDB FROM DISK = '/backup/backup.bak'"
```

## 🆘 Troubleshooting

### Website không truy cập được
```bash
# Kiểm tra containers
docker-compose ps

# Restart tất cả services  
docker-compose restart

# Kiểm tra logs
docker-compose logs
```

### Database connection error
```bash
# Kiểm tra database container
docker-compose logs db

# Restart database
docker-compose restart db

# Kiểm tra connection string trong .env
```

### SSL certificate error
```bash
# Renew certificate
sudo certbot renew

# Kiểm tra certificate
sudo certbot certificates

# Test SSL
curl -I https://yourdomain.com
```

## 📞 Support
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)
- Email: support@yourdomain.com