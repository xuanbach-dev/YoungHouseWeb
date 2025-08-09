# YoungHouse - Full-Stack Web Application

A modern full-stack web application built with Node.js backend and React.js frontend, designed for young entrepreneurs and innovators to connect, share ideas, and grow together.

## 🚀 Features

### Backend (Node.js + Express)
- **Authentication System**: JWT-based login/register
- **RESTful API**: Complete CRUD operations for users and posts
- **Security**: Helmet, CORS, rate limiting
- **Data Management**: Mock database with user and post management
- **Health Monitoring**: API health check endpoints

### Frontend (React.js + TypeScript)
- **Modern UI**: Beautiful, responsive design with gradient themes
- **User Authentication**: Login, register, and profile management
- **Post Management**: Create, view, like, and manage posts
- **Community Features**: Browse users and explore posts
- **Real-time Navigation**: React Router with protected routes
- **Type Safety**: Full TypeScript implementation

## 📁 Project Structure

```
YoungHouseWeb/
├── backend/                 # Node.js Backend
│   ├── routes/             # API routes
│   │   ├── auth.js        # Authentication endpoints
│   │   ├── users.js       # User management
│   │   └── posts.js       # Post management
│   ├── server.js          # Express server setup
│   ├── package.json       # Backend dependencies
│   └── env.example        # Environment variables template
├── frontend/               # React.js Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Main app component
│   └── package.json       # Frontend dependencies
├── package.json           # Root project configuration
└── README.md              # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd YoungHouseWeb
   npm run install-all
   ```

2. **Setup Environment Variables**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your configurations
   ```

3. **Start Development Servers**
   ```bash
   # From root directory - starts both frontend and backend
   npm run dev
   ```

   Or start individually:
   ```bash
   # Backend only (Terminal 1)
   npm run server

   # Frontend only (Terminal 2)
   npm run client
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Users
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/search/:query` - Search users
- `PUT /api/users/:id` - Update user profile (protected)

### Posts
- `GET /api/posts` - Get all posts (paginated, sortable)
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post (protected)
- `PUT /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)
- `POST /api/posts/:id/like` - Like a post (protected)
- `GET /api/posts/search/:query` - Search posts

### Health
- `GET /api/health` - API health check

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run install-all` - Install all dependencies
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production
- `npm start` - Start production server

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🎨 Key Features Demonstrated

### Authentication & Security
- JWT token-based authentication
- Protected routes on frontend
- Password hashing with bcrypt
- Request rate limiting
- CORS configuration

### Modern React Patterns
- Context API for state management
- Custom hooks for auth logic
- TypeScript for type safety
- React Router for navigation
- Responsive CSS design

### Backend Best Practices
- Express.js middleware structure
- Error handling middleware
- API versioning with /api prefix
- Environment-based configuration
- Security headers with Helmet

## 🚀 Deployment

### Backend Deployment
1. Set environment variables in production
2. Install dependencies: `npm install`
3. Start server: `npm start`

### Frontend Deployment
1. Build the project: `npm run build`
2. Serve the built files from the `build` directory

### Full Stack Deployment
The application can be deployed to platforms like:
- **Heroku** (backend) + **Netlify** (frontend)
- **Vercel** (full-stack)
- **Digital Ocean** (VPS)
- **AWS** (EC2 + S3)

## 🧪 Demo Credentials

For testing purposes, use these demo credentials:
- **Email**: admin@younghouse.com
- **Password**: password123

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Ensure all dependencies are installed correctly
3. Verify environment variables are set properly
4. Check that both frontend and backend servers are running

## 🔮 Future Enhancements

- Real database integration (MongoDB/PostgreSQL)
- Real-time chat with Socket.io
- Image upload functionality
- Email notifications
- Advanced search and filtering
- User roles and permissions
- Comment system for posts
- Social features (follow/unfollow)

---

Built with ❤️ using Node.js, Express, React, and TypeScript