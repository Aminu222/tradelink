# Bis-Connect B2B Trading Platform

## Overview
Bis-Connect is a comprehensive B2B trading platform that connects Nigerian sellers (formerly producers) with buyers, facilitating secure and transparent global trade. The platform features a modern Next.js/React frontend and a robust Flask/MySQL backend with real-time capabilities.

---

## Key Features

### 🔐 **Authentication & User Management**
- Multi-role user system (Buyers, Sellers, Admin)
- JWT-based authentication with secure password hashing
- Simplified seller registration (username, name, email, phone, password)
- Profile management with account settings

### 🛍️ **Product Management**
- Rich product catalog with image uploads and management
- Product categories and detailed specifications
- Real-time stock tracking with low stock notifications
- Product search, filtering, and sorting capabilities
- Mobile-responsive product displays

### 🛒 **Shopping Experience**
- Advanced shopping cart with real-time synchronization
- Wishlist functionality with add/remove capabilities
- Secure checkout process with multiple payment options
- Bank transfer integration with seller bank details
- Order tracking and status management

### 💰 **Financial Management**
- Commission tracking for sellers
- Payment status monitoring
- Financial dashboards with spending analytics
- Currency support (Nigerian Naira - ₦)
- Bank account management for sellers

### 💬 **Communication & Notifications**
- Real-time messaging system between buyers and sellers
- In-app notifications for orders, payments, and messages
- WebSocket-based live updates
- Inquiry management system

### 📊 **Admin Dashboard**
- Comprehensive user management
- Product oversight and approval
- Order monitoring and analytics
- Financial reporting and insights
- Platform-wide notification management

### 📱 **User Experience**
- Responsive design for mobile and desktop
- Intuitive navigation with role-based menus
- Real-time data synchronization
- Error handling and user feedback
- Modern UI with consistent branding

---

## Tech Stack

### **Frontend**
- **Framework:** Next.js 14 with React 18
- **Language:** TypeScript
- **Styling:** Inline styles with responsive design
- **State Management:** React hooks (useState, useEffect)
- **Real-time:** WebSocket client integration
- **Icons:** React Icons (FontAwesome)

### **Backend**
- **Framework:** Flask with Flask-CORS
- **Database:** MySQL with SQLAlchemy
- **Authentication:** JWT with bcrypt password hashing
- **Real-time:** Flask-SocketIO
- **File Upload:** FormData handling with validation
- **API:** RESTful endpoints with JSON responses

### **Database**
- **Engine:** MySQL
- **Schema:** Comprehensive tables for users, products, orders, messages, notifications, wishlist, cart, and financial data
- **Relationships:** Foreign key constraints and proper indexing

---

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Flask)       │◄──►│   (MySQL)       │
│                 │    │                 │    │                 │
│ • React/TS      │    │ • REST API      │    │ • Users         │
│ • WebSocket     │    │ • JWT Auth      │    │ • Products      │
│ • Responsive UI │    │ • File Upload   │    │ • Orders        │
│ • State Mgmt    │    │ • Real-time     │    │ • Messages      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TradeLink2
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Database Configuration
- Create a MySQL database
- Update database credentials in `backend/config.py` or environment variables
- Initialize the database schema:
```bash
mysql -u <username> -p < database_name < backend/schema.sql
```

### 4. Environment Variables
Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-secret-key-here
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
```

### 5. Start Backend Server
```bash
python app.py
```
The backend will be available at `http://localhost:5000`

### 6. Frontend Setup
```bash
cd ../bis-frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`

---

## User Roles & Permissions

### **Buyers**
- Browse and search products
- Add items to cart and wishlist
- Place orders and track status
- Message sellers directly
- View order history and financials
- Manage account settings

### **Sellers (formerly Producers)**
- Create and manage product listings
- Upload product images
- Manage bank account details
- Track orders and commissions
- Communicate with buyers
- View financial analytics

### **Admin**
- Manage all users and products
- Monitor platform activity
- View financial reports
- Handle system notifications
- Oversee order management

---

## API Endpoints

### **Authentication**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### **Products**
- `GET /products` - Get all products
- `POST /products` - Create new product (sellers only)
- `GET /products/<id>` - Get product details
- `PUT /products/<id>` - Update product
- `DELETE /products/<id>` - Delete product

### **Orders**
- `GET /orders` - Get user orders
- `POST /orders` - Create new order
- `PUT /orders/<id>/status` - Update order status
- `PUT /orders/<id>/payment` - Update payment status

### **Cart & Wishlist**
- `GET /cart` - Get user cart
- `POST /cart` - Add to cart
- `PUT /cart/<id>` - Update cart item
- `DELETE /cart/<id>` - Remove from cart
- `GET /wishlist` - Get user wishlist
- `POST /wishlist` - Add to wishlist
- `DELETE /wishlist/<id>` - Remove from wishlist

### **Messaging**
- `GET /conversations` - Get user conversations
- `GET /conversations/<id>/messages` - Get conversation messages
- `POST /conversations/<id>/messages` - Send message

### **Notifications**
- `GET /notifications` - Get user notifications
- `PUT /notifications/<id>/read` - Mark as read
- `DELETE /notifications/<id>` - Delete notification

---

## Key Features Implementation

### **Real-time Notifications**
- WebSocket-based live updates
- Automatic notifications for orders, payments, and messages
- Persistent notification storage
- Read/unread status tracking

### **File Upload System**
- Secure image upload for products
- File type validation (PNG, JPG, JPEG, GIF)
- Automatic directory creation
- Error handling and fallbacks

### **Shopping Cart**
- Real-time cart synchronization
- Quantity management
- Stock validation
- Persistent cart state

### **Wishlist Management**
- Add/remove products from wishlist
- Wishlist state synchronization
- Error recovery and fallback handling

### **Bank Transfer Integration**
- Seller bank details management
- Secure bank information display
- Payment instruction generation

---

## Database Schema

### **Core Tables**
- `users` - User accounts and profiles
- `products` - Product catalog with images
- `orders` - Order management and tracking
- `cart` - Shopping cart items
- `wishlist` - User wishlist items
- `messages` - Real-time messaging
- `notifications` - System notifications
- `producer_bank_details` - Seller bank information

### **Relationships**
- Users can have multiple products (sellers)
- Users can have multiple orders (buyers)
- Products belong to sellers
- Orders link buyers, sellers, and products
- Messages connect users in conversations

---

## Development Guidelines

### **Frontend**
- Use TypeScript for type safety
- Implement responsive design patterns
- Handle loading and error states
- Maintain consistent UI/UX patterns
- Use proper state management

### **Backend**
- Follow RESTful API conventions
- Implement proper error handling
- Use JWT for authentication
- Validate all inputs
- Log important operations

### **Database**
- Use proper indexing for performance
- Maintain referential integrity
- Implement soft deletes where appropriate
- Use transactions for critical operations

---

## Deployment

### **Backend Deployment**
- Use a production WSGI server (Gunicorn)
- Set up proper environment variables
- Configure database connections
- Enable HTTPS for security

### **Frontend Deployment**
- Build for production: `npm run build`
- Deploy to Vercel, Netlify, or similar
- Configure API endpoints for production
- Set up proper CORS settings

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For technical support or questions, please contact the development team.

---

## Version History

### **Current Version: 2.0**
- Complete system rebrand to Bis-Connect
- Enhanced user experience and mobile responsiveness
- Improved real-time features and notifications
- Comprehensive financial tracking
- Advanced product management
- Secure payment integration 