# 🚀 Hướng dẫn Deploy YoungHouse Web

## Yêu cầu hệ thống

### Server Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **CPU**: 2 cores trở lên
- **Storage**: 20GB+ SSD
- **Network**: Public IP với port 80, 443 mở

### Software Requirements
- Docker & Docker Compose
- Git
- Domain name (tùy chọn)

## 📋 Cách triển khai

### Phương án 1: VPS/Server riêng (Khuyến nghị)

#### Bước 1: Chuẩn bị server
```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Khởi động lại để áp dụng quyền
sudo reboot
```

#### Bước 2: Clone và cấu hình project
```bash
# Clone project
git clone <your-repo-url> younghouse-web
cd younghouse-web

# Cấu hình environment
cp env.production.example .env
nano .env  # Chỉnh sửa cấu hình

# Cấp quyền thực thi cho script deploy
chmod +x deploy.sh
```

#### Bước 3: Deploy
```bash
# Chạy script deploy
./deploy.sh

# Hoặc deploy thủ công
docker-compose up -d
```

### Phương án 2: Cloud Platforms

#### A. DigitalOcean (Khuyến nghị cho người mới)
1. **Tạo Droplet**:
   - Chọn Ubuntu 22.04
   - Basic plan: $6/tháng (1GB RAM)
   - Thêm SSH key

2. **Deploy**:
   ```bash
   ssh root@your-server-ip
   # Thực hiện các bước như Phương án 1
   ```

#### B. AWS EC2
1. **Tạo EC2 Instance**:
   - AMI: Ubuntu Server 22.04
   - Instance type: t3.micro (Free tier)
   - Security Groups: HTTP (80), HTTPS (443), SSH (22)

2. **Deploy tương tự Phương án 1**

#### C. Google Cloud Platform
1. **Tạo Compute Engine VM**
2. **Cấu hình Firewall rules**
3. **Deploy tương tự**

#### D. Vercel + PlanetScale (Serverless)
```bash
# Frontend trên Vercel
npm install -g vercel
cd frontend
vercel

# Database trên PlanetScale
# Tạo database tại planetscale.com
# Cập nhật connection string trong .env
```

## 🌐 Cấu hình Domain

### Bước 1: Mua domain
**Nhà cung cấp uy tín ở Việt Nam**:
- **INET**: inet.vn (150,000₫ - 300,000₫/năm)
- **Tenten**: tenten.vn (199,000₫ - 399,000₫/năm)
- **MatBao**: matbao.net (199,000₫ - 499,000₫/năm)
- **P.A Vietnam**: pavietnam.vn (200,000₫ - 400,000₫/năm)

**Quốc tế**:
- **Namecheap**: namecheap.com ($8-15/năm)
- **GoDaddy**: godaddy.com ($12-20/năm)
- **Cloudflare**: cloudflare.com ($8-10/năm)

### Bước 2: Cấu hình DNS
1. **Truy cập DNS Management**
2. **Thêm A Records**:
   ```
   Type: A
   Name: @
   Value: YOUR_SERVER_IP
   TTL: 300
   
   Type: A  
   Name: www
   Value: YOUR_SERVER_IP
   TTL: 300
   ```

3. **Đợi DNS propagation** (5-60 phút)

### Bước 3: Cấu hình SSL
```bash
# Sử dụng Let's Encrypt (miễn phí)
sudo apt install certbot python3-certbot-nginx

# Tạo SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Tự động gia hạn
sudo crontab -e
# Thêm dòng sau:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Cấu hình bảo mật

### Firewall
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

### Backup tự động
```bash
# Tạo script backup
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec younghouse-web_db_1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$DB_SA_PASSWORD" -Q "BACKUP DATABASE YoungHouseDB TO DISK = '/var/opt/mssql/backup/younghouse_$DATE.bak'"
EOF

chmod +x backup.sh

# Thêm vào crontab
sudo crontab -e
# Backup hàng ngày lúc 2h sáng
0 2 * * * /path/to/backup.sh
```

## 📊 Monitoring

### Check status
```bash
# Kiểm tra containers
docker-compose ps

# Xem logs
docker-compose logs -f

# Kiểm tra resource usage
docker stats
```

### Health checks
```bash
# API health
curl http://localhost/api/health

# Website health  
curl -I http://localhost
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   sudo lsof -i :80
   sudo kill -9 PID
   ```

2. **Database connection failed**:
   - Kiểm tra .env file
   - Restart database container: `docker-compose restart db`

3. **SSL certificate issues**:
   ```bash
   sudo certbot renew --dry-run
   ```

4. **Low disk space**:
   ```bash
   # Clean Docker
   docker system prune -a
   
   # Clean logs
   sudo journalctl --vacuum-time=7d
   ```

## 💰 Chi phí ước tính

### Option 1: VPS tự quản
- **VPS**: $5-20/tháng
- **Domain**: $8-15/năm  
- **Total**: ~$60-250/năm

### Option 2: Cloud managed
- **Vercel**: $0-20/tháng
- **Database**: $0-10/tháng
- **Domain**: $8-15/năm
- **Total**: ~$8-375/năm

## 📞 Support
- Tạo issue trên GitHub
- Email: support@younghouse.com
- Documentation: docs.younghouse.com