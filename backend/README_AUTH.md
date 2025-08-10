# 🔐 Hệ thống Authentication & Authorization

## Tổng quan

Hệ thống phân quyền YoungHouse được xây dựng với:
- **Backend**: Node.js + Express + SQL Server
- **Frontend**: React + TypeScript
- **Authentication**: JWT Token
- **Authorization**: Role-based Access Control

## 🏗️ Cấu trúc Database

### Bảng Role
```sql
CREATE TABLE Role (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255)
);
```

### Bảng Users
```sql
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100),
    Email NVARCHAR(100),
    RoleID INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID) ON DELETE CASCADE
);
```

## 🚀 Cài đặt và Chạy

### 1. Cấu hình Database
```bash
# Copy file env.example thành .env
cp env.example .env

# Chỉnh sửa thông tin database trong .env
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=your_password
DB_NAME=younghouse_db
```

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Khởi tạo Database
```bash
# Tạo tables và dữ liệu mẫu
npm run init-data
```

### 4. Chạy Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Test Authentication
```bash
npm run test-auth
```

## 👤 Tài khoản mặc định

Hệ thống tự động tạo 2 tài khoản mẫu:

### Admin Account
- **Email**: `admin@younghouse.com`
- **Password**: `password123`
- **Role**: Admin (RoleID: 1)
- **Quyền**: Toàn quyền truy cập

### User Account  
- **Email**: `user@younghouse.com`
- **Password**: `user123`
- **Role**: User (RoleID: 2)
- **Quyền**: Quyền hạn giới hạn

## 🔑 API Endpoints

### Authentication
```
POST /api/auth/register    - Đăng ký tài khoản mới
POST /api/auth/login       - Đăng nhập
GET  /api/auth/profile     - Lấy thông tin profile (yêu cầu token)
```

### User Management (Admin only)
```
GET    /api/users          - Lấy danh sách users
GET    /api/users/:id      - Lấy thông tin user theo ID
PUT    /api/users/:id      - Cập nhật thông tin user
DELETE /api/users/:id      - Xóa user
PATCH  /api/users/:id/role - Thay đổi role của user
GET    /api/users/roles/all - Lấy danh sách roles
```

### Posts Management (Admin only)
```
POST   /api/posts          - Tạo bài viết mới
PUT    /api/posts/:id      - Cập nhật bài viết
DELETE /api/posts/:id      - Xóa bài viết
```

## 🛡️ Middleware Bảo mật

### 1. authenticateToken
Xác thực JWT token trong header

### 2. requireAdmin  
Chỉ cho phép Admin (RoleID = 1) truy cập

### 3. requireUser
Cho phép cả User và Admin truy cập

### 4. requireRole(roleId)
Kiểm tra role cụ thể

### 5. requireAnyRole([roleIds])
Kiểm tra nhiều role khác nhau

## 📱 Frontend Integration

### AuthContext
```typescript
const { user, token, login, register, logout, isAdmin, isUser, hasRole } = useAuth();

// Kiểm tra quyền
if (isAdmin()) {
  // Hiển thị menu admin
}

if (hasRole(1)) {
  // User có role Admin
}
```

### Protected Routes
```typescript
// Route chỉ dành cho Admin
<AdminRoute>
  <Dashboard />
</AdminRoute>

// Route có thể tùy chỉnh role
<ProtectedRoute requireAdmin={true}>
  <UserManagement />
</ProtectedRoute>

<ProtectedRoute allowedRoles={[1, 2]}>
  <Profile />
</ProtectedRoute>
```

## 🔄 Luồng hoạt động

### 1. Đăng ký
1. User điền form đăng ký
2. Backend validate dữ liệu
3. Hash password với bcrypt
4. Lưu user vào database với role mặc định = 2 (User)
5. Tạo JWT token
6. Trả về token và thông tin user

### 2. Đăng nhập
1. User nhập email/password
2. Backend tìm user theo email
3. So sánh password đã hash
4. Tạo JWT token có chứa thông tin role
5. Trả về token và thông tin user

### 3. Phân quyền
1. Frontend gửi request với JWT token trong header
2. Middleware xác thực token
3. Kiểm tra role trong token
4. Cho phép hoặc từ chối truy cập

## 🧪 Testing

### Manual Testing
```bash
# Test các chức năng auth
npm run test-auth
```

### API Testing với curl
```bash
# Đăng ký
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456"}'

# Đăng nhập  
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@younghouse.com","password":"password123"}'

# Truy cập route protected (thay YOUR_TOKEN)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚨 Bảo mật

### Mật khẩu
- Minimum 6 ký tự
- Hash với bcrypt (10 rounds)
- Không lưu plain text

### JWT Token
- Expires sau 7 ngày
- Chứa userId, username, roleId, roleName
- Secret key từ environment variable

### Validation
- Email format validation
- Username length validation  
- Password strength check
- SQL injection protection

## 🔧 Troubleshooting

### Lỗi database connection
```bash
# Kiểm tra SQL Server đang chạy
# Kiểm tra thông tin kết nối trong .env
# Kiểm tra firewall và port 1433
```

### Lỗi JWT token
```bash
# Kiểm tra JWT_SECRET trong .env
# Kiểm tra token expiration
# Kiểm tra format Authorization header
```

### Lỗi role permission
```bash
# Kiểm tra RoleID trong database
# Kiểm tra middleware order
# Kiểm tra token payload
```

## 📖 Tài liệu thêm

- [Express.js Documentation](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [bcrypt.js](https://github.com/dcodeIO/bcrypt.js)
- [mssql package](https://github.com/tediousjs/node-mssql)