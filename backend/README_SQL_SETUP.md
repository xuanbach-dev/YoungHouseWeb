# SQL Server Configuration Guide

## 🗄️ Database Setup

### Prerequisites
- Microsoft SQL Server (Express/Developer/Standard)
- SQL Server Management Studio (SSMS) hoặc Azure Data Studio
- Đã tạo database `nhatro_db` với script có sẵn

### Configuration Steps

1. **Copy Environment File**
   ```bash
   cd backend
   copy env.example .env
   ```

2. **Update .env File**
   Mở file `.env` và cập nhật thông tin kết nối:
   ```env
   # Database Configuration (SQL Server)
   DB_SERVER=localhost
   DB_USER=sa
   DB_PASSWORD=123
   DB_DATABASE=nhatro_db
   DB_ENCRYPT=false
   DB_TRUST_CERT=true
   ```

3. **Test Connection**
   ```bash
   npm run dev
   ```
   Kiểm tra console log để đảm bảo kết nối database thành công.

4. **Health Check**
   Truy cập: http://localhost:5000/api/health
   
   Response should include database status:
   ```json
   {
     "status": "OK",
     "message": "YoungHouse Backend is running!",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "database": {
       "status": "healthy",
       "timestamp": "2024-01-01T00:00:00.000Z",
       "database": "nhatro_db"
     }
   }
   ```

## 📊 Database Schema Overview

### Tables Created:
- **Branch**: Chi nhánh/cơ sở
- **RoomType**: Loại phòng và giá
- **Room**: Phòng trọ
- **Customer**: Khách hàng
- **Booking**: Đặt phòng
- **Media**: Ảnh/video phòng

### Sample Data:
- 2 branches: Young House 1 & 2
- 6 room types với giá khác nhau
- 7 sample rooms
- 5 sample media files

## 🔗 API Endpoints

### Branches
- `GET /api/branches` - Get all branches
- `GET /api/branches/with-rooms` - Get branches with room count
- `GET /api/branches/:id` - Get branch by ID
- `POST /api/branches` - Create new branch
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch

### Rooms
- `GET /api/rooms` - Get all rooms (with pagination & filters)
- `GET /api/rooms/available/:branchId` - Get available rooms by branch
- `GET /api/rooms/search/:query` - Search rooms
- `GET /api/rooms/:id` - Get room by ID with media
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/:id` - Update room
- `PATCH /api/rooms/:id/status` - Update room status only
- `DELETE /api/rooms/:id` - Delete room

### Customers
- `GET /api/customers` - Get all customers (with pagination)
- `GET /api/customers/statistics` - Get customer statistics
- `GET /api/customers/search/:query` - Search customers
- `GET /api/customers/:id` - Get customer with booking history
- `GET /api/customers/phone/:phone` - Get customer by phone
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Bookings
- `GET /api/bookings` - Get all bookings (with pagination & filters)
- `GET /api/bookings/statistics` - Get booking statistics
- `GET /api/bookings/revenue` - Get revenue statistics
- `POST /api/bookings/check-availability` - Check room availability
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings/customer/:customerId` - Get bookings by customer
- `GET /api/bookings/room/:roomId` - Get bookings by room
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `PATCH /api/bookings/:id/status` - Update booking status only
- `DELETE /api/bookings/:id` - Delete booking

## 🧪 Testing with Postman/Thunder Client

### 1. Test Database Connection
```
GET http://localhost:5000/api/health
```

### 2. Get All Branches
```
GET http://localhost:5000/api/branches
```

### 3. Get Available Rooms in Branch 1
```
GET http://localhost:5000/api/rooms/available/1
```

### 4. Create New Customer
```
POST http://localhost:5000/api/customers
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A",
  "phone": "0987654321",
  "email": "nguyenvana@email.com",
  "note": "Khách hàng VIP"
}
```

### 5. Create New Booking
```
POST http://localhost:5000/api/bookings
Content-Type: application/json

{
  "customerId": 1,
  "roomId": 1,
  "checkIn": "2024-02-01",
  "checkOut": "2024-02-15",
  "status": "Pending"
}
```

### 6. Check Room Availability
```
POST http://localhost:5000/api/bookings/check-availability
Content-Type: application/json

{
  "roomId": 1,
  "checkIn": "2024-02-01",
  "checkOut": "2024-02-15"
}
```

## 🔧 Features Implemented

### ✅ Database Features:
- **Connection Pool**: Efficient connection management
- **Error Handling**: Comprehensive error catching
- **Parameterized Queries**: SQL injection protection
- **Transaction Support**: Data consistency
- **Health Monitoring**: Database status checking

### ✅ Business Logic:
- **Room Availability**: Smart conflict detection
- **Booking Validation**: Date and business rule validation
- **Search Functionality**: Full-text search across entities
- **Statistics**: Revenue and occupancy analytics
- **Data Relationships**: Proper foreign key handling

### ✅ API Features:
- **Pagination**: Efficient data loading
- **Filtering**: Status and date filtering
- **Sorting**: Configurable result ordering
- **Validation**: Input data validation
- **Error Responses**: Consistent error format

## 🚀 Next Steps

1. **Test All Endpoints**: Use provided examples above
2. **Frontend Integration**: Update React components to use new APIs
3. **Authentication**: Add JWT protection to sensitive endpoints
4. **File Upload**: Implement media upload for room images
5. **Reports**: Add detailed reporting features
6. **Notifications**: Email/SMS notifications for bookings

## 🆘 Troubleshooting

### Common Issues:

1. **Connection Failed**
   - Check SQL Server is running
   - Verify credentials in `.env`
   - Ensure database `nhatro_db` exists

2. **Permission Denied**
   - Check user `sa` has necessary permissions
   - Try using Windows Authentication if possible

3. **Port Issues**
   - Default SQL Server port: 1433
   - Check firewall settings

4. **SSL/Certificate Issues**
   - Set `DB_TRUST_CERT=true` for development
   - For production, configure proper SSL certificates

### Connection String Format:
```
Server: localhost
User: sa
Password: 123
Database: nhatro_db
Options: encrypt=false, trustServerCertificate=true
```

---

**Built with love for Young House Management System** 🏠💚