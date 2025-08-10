#!/bin/bash

# YoungHouse Web Server Setup Script
# Ubuntu 20.04+ / CentOS 8+

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}===============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===============================================${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

print_header "🚀 YoungHouse Web Server Setup"

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    htop \
    nano \
    ufw

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
print_status "Node.js version: $node_version"
print_status "NPM version: $npm_version"

# Install Docker
print_status "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

# Install Docker Compose
print_status "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION="v2.23.0"
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create symbolic link for docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

# Setup firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Create younghouse user
print_status "Creating younghouse user..."
if ! id "younghouse" &>/dev/null; then
    sudo adduser --disabled-password --gecos "" younghouse
    sudo usermod -aG docker younghouse
    sudo usermod -aG sudo younghouse
fi

# Create project directory
print_status "Creating project directories..."
sudo mkdir -p /var/www/younghouse
sudo chown younghouse:younghouse /var/www/younghouse

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/younghouse > /dev/null <<EOF
/var/www/younghouse/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 younghouse younghouse
    postrotate
        /bin/kill -USR1 \$(cat /var/www/younghouse/logs/app.pid 2> /dev/null) 2> /dev/null || true
    endscript
}
EOF

# Install and configure fail2ban
print_status "Installing fail2ban for security..."
sudo apt install -y fail2ban

sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Install Nginx (for reverse proxy)
print_status "Installing Nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx

# Install Certbot for SSL
print_status "Installing Certbot for SSL..."
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

# Create swap file if doesn't exist (for low RAM servers)
if [ ! -f /swapfile ]; then
    print_status "Creating swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Configure system limits
print_status "Configuring system limits..."
sudo tee -a /etc/security/limits.conf > /dev/null <<EOF
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
EOF

# Setup monitoring script
print_status "Creating monitoring script..."
sudo tee /usr/local/bin/monitor-younghouse > /dev/null <<'EOF'
#!/bin/bash
LOG_FILE="/var/log/younghouse-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory usage
MEM_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEM_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Memory usage is ${MEM_USAGE}%" >> $LOG_FILE
fi

# Check if Docker containers are running
if ! docker-compose -f /var/www/younghouse/docker-compose.yml ps | grep -q "Up"; then
    echo "[$DATE] ERROR: Some Docker containers are not running" >> $LOG_FILE
fi

# Check if website is responsive
if ! curl -f -s http://localhost > /dev/null; then
    echo "[$DATE] ERROR: Website is not responding" >> $LOG_FILE
fi
EOF

sudo chmod +x /usr/local/bin/monitor-younghouse

# Add monitoring to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-younghouse") | sudo crontab -

# Create deployment script for younghouse user
sudo tee /home/younghouse/deploy-younghouse.sh > /dev/null <<'EOF'
#!/bin/bash
cd /var/www/younghouse

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to start
sleep 30

# Check if deployment was successful
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    
    # Send notification (optional)
    # curl -X POST -H 'Content-type: application/json' \
    #     --data '{"text":"YoungHouse deployment successful!"}' \
    #     YOUR_SLACK_WEBHOOK_URL
else
    echo "❌ Deployment failed!"
    docker-compose logs
fi
EOF

sudo chown younghouse:younghouse /home/younghouse/deploy-younghouse.sh
sudo chmod +x /home/younghouse/deploy-younghouse.sh

# Create system info script
sudo tee /usr/local/bin/system-info > /dev/null <<'EOF'
#!/bin/bash
echo "=== System Information ==="
echo "Hostname: $(hostname)"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Uptime: $(uptime -p)"
echo "Load: $(uptime | awk -F'load average:' '{ print $2 }')"
echo ""
echo "=== Memory Usage ==="
free -h
echo ""
echo "=== Disk Usage ==="
df -h
echo ""
echo "=== Docker Containers ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "=== Network Connections ==="
ss -tuln | grep LISTEN
EOF

sudo chmod +x /usr/local/bin/system-info

print_header "🎉 Server setup completed successfully!"

print_status "✅ Installed packages:"
echo "   - Node.js $(node --version)"
echo "   - NPM $(npm --version)"
echo "   - Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
echo "   - Docker Compose $(docker-compose --version | cut -d' ' -f4 | tr -d ',')"
echo "   - PM2 $(pm2 --version)"
echo "   - Nginx $(nginx -v 2>&1 | cut -d' ' -f3)"

print_status "✅ Security configurations:"
echo "   - UFW firewall enabled"
echo "   - Fail2ban installed and configured"
echo "   - System limits optimized"
echo "   - Swap file created (2GB)"

print_status "✅ Monitoring setup:"
echo "   - System monitoring script: /usr/local/bin/monitor-younghouse"
echo "   - System info script: /usr/local/bin/system-info"
echo "   - Log rotation configured"

print_warning "⚠️  Important next steps:"
echo "1. Reboot the server: sudo reboot"
echo "2. SSH back and switch to younghouse user: sudo su - younghouse"
echo "3. Clone your project to /var/www/younghouse"
echo "4. Configure your domain DNS settings"
echo "5. Run SSL setup: sudo certbot --nginx -d yourdomain.com"

print_status "📋 Useful commands:"
echo "   - Check system info: system-info"
echo "   - Monitor logs: tail -f /var/log/younghouse-monitor.log"
echo "   - Deploy updates: /home/younghouse/deploy-younghouse.sh"
echo "   - Docker logs: docker-compose logs -f"

print_header "🚀 Your server is ready for YoungHouse deployment!"
EOF