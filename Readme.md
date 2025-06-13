## Streamify-Backend
This backend server powers a video sharing platform with social features, built with Node.js, Express, and MongoDB. It provides user authentication, video uploads, community interactions, and subscription functionality.

## Features
- 🔐 User Authentication
  - 🛡️ JWT auth with access/refresh tokens and bcrypt password security
- 🎥 Video Management
  - 📤 Multer + Cloudinary video uploads with likes/comments and metadata
- 💬 Community Posts
  - ✍️ Tweet-style posts with media attachments and engagement features
- 🔔 Subscription System
  - 📊 Real-time subscriber tracking with MongoDB aggregations and channel feeds

## Tech Stack
- 🌐 Core Framework
  - ⚡ Node.js + Express.js REST API architecture

- 🗃️ Database
  - 🍃 MongoDB with Mongoose ODM for flexible data modeling
  - 🔄 Aggregation pipelines for real-time analytics

- 🔐 Authentication
  - 🎫 JWT (Access + Refresh tokens) with secure rotation
  - 🔑 Bcrypt password hashing + salting

- ☁️ Cloud Services
   - 🖼️ Cloudinary CDN for media storage & optimization
   - 🚀 Multer middleware for seamless file uploads
   - 🍃 MongoDB Atlas Cloud Storage
     
- 🔄 Dev Tools
   - 🔍 Postman for API testing
   - 🔄 Nodemon for dev hot-reloading

## Installation
- Node.js 18.x or higher
- MongoDB Atlas account or local MongoDB instance
- Cloudinary account for media storage

**Clone the Repository**
  ```bash
     git clone https://github.com/<your-username>/Streamify-backend.git
     cd Streamify
  ```
  
**Setup**
```bash
   npm install
```

**Create a .env file:**
```bash
  PORT=8000                      
  CORS_ORIGIN=*
  MONGODB_URI=<your_mongodb_uri>
  ACCESS_TOKEN_SECRET=<your_access_token_secret>
  ACCESS_TOKEN_EXPIRY=15m   
  REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
  REFRESH_TOKEN_EXPIRY=7d           
  CLOUDINARY_NAME=<your_cloud_name>
  CLOUDINARY_API_KEY=<your_api_key>
  CLOUDINARY_API_SECRET=<your_api_secret>
```
  
**Run the backend:**
```bash
  npm run dev
```

## Special Thanks to
Inspired by [Chai aur Code](https://youtube.com/@chaiaurcode) YouTube tutorials.

