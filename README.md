# 🌱 Sprouty - Virtual Plant Caretaker WebApp

A smart assistant to help you care for your plants with ease and intelligence.

## 🧩 Overview

Sprouty is a full-stack MERN web application that helps users manage their real-life plants by providing care reminders, growth tracking, plant identification, and disease diagnosis. Whether you're a beginner plant parent or a green-thumb enthusiast, this app is your personal assistant for a greener lifestyle.

## 📌 Features

### 🌿 Plant Management
- **Smart Identification**: Add plants via image-based identification using Plant.ID API
- **Manual Entry**: Add plants through text search or manual entry
- **Plant Gallery**: View all your plants with thumbnails, care status, and quick actions
- **Care History**: Track watering, fertilizing, pruning, and other care activities

### ⏰ Care Reminders
- **Smart Scheduling**: Set customizable recurring reminders for plant care
- **Multi-type Notifications**: Get notified for watering, fertilizing, and pruning
- **Due Reminders Dashboard**: View upcoming plant care tasks

### 🩺 Plant Health
- **Disease Diagnosis**: Identify plant diseases and get treatment recommendations
- **Health Tracking**: Monitor plant health status and history
- **Care Recommendations**: Get personalized care tips based on plant species

### 🌦️ Weather Integration
- **Weather Monitoring**: Get real-time weather data for your location
- **Weather-based Recommendations**: Adjust plant care based on local weather conditions
- **Location Search**: Find and save your location for accurate weather data

### 📊 User Features
- **User Profiles**: Manage your account details and preferences
- **Dark Mode Support**: Toggle between light and dark themes for comfortable viewing
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices

## 💻 Tech Stack

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **Routing**: React Router
- **HTTP Client**: Axios
- **Camera Integration**: React Webcam

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Google OAuth
- **File Handling**: Multer
- **Scheduled Tasks**: Node-Cron

### External APIs
- **Plant Identification**: Plant.ID API
- **Weather Data**: OpenWeatherMap API

## 🚀 Project Structure

### Frontend Structure
```
/Frontend
├── /public             # Static files
├── /src
│   ├── /assets         # Images, icons, and other static assets
│   ├── /components     # Reusable UI components
│   ├── /contexts       # Context providers (auth, notifications, theme)
│   ├── /pages          # Main page components
│   ├── /services       # API service modules
│   └── /utils          # Helper functions
├── index.html          # Entry HTML file
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Dependencies and scripts
```

### Backend Structure
```
/Backend
├── /config             # Configuration files and environment setup
├── /controllers        # Request handlers
├── /middleware         # Custom middleware (auth, error handling)
├── /models             # Database schemas
├── /routes             # API routes
├── /services           # External services (email, cron jobs, etc.)
├── /utils              # Utility functions
├── server.js           # Entry point
└── package.json        # Dependencies and scripts
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- API keys for Plant.ID and OpenWeatherMap

### Frontend Setup
```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Create .env file with necessary variables
# Example:
# VITE_API_URL=http://localhost:5000/api
# VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create .env file with necessary variables
# Example:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/sprouty
# JWT_SECRET=your_secret_key
# PLANT_ID_API_KEY=your_plant_id_api_key
# WEATHER_API_KEY=your_openweathermap_api_key

# Start development server
npm run dev
```

## 🔑 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sprouty
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PLANT_ID_API_KEY=your_plant_id_api_key
WEATHER_API_KEY=your_openweathermap_api_key
```

## 📡 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Plants
- `GET /api/plants` - Get all user plants
- `POST /api/plants` - Create a new plant
- `GET /api/plants/:id` - Get a specific plant
- `PUT /api/plants/:id` - Update a plant
- `DELETE /api/plants/:id` - Delete a plant
- `POST /api/plants/identify` - Identify plant from image

### Reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create a reminder
- `GET /api/reminders/upcoming` - Get upcoming reminders
- `PUT /api/reminders/:id/complete` - Mark reminder as completed

### Weather
- `GET /api/weather` - Get current weather
- `GET /api/weather/recommendations` - Get weather-based recommendations

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Update password

## 🌐 Deployment

### Frontend Deployment
The frontend is deployed on Vercel.
Live Link: https://frontend-sprouty.vercel.app/

### Backend Deployment
The backend is deployed on Render.
API Base URL: https://sprouty-backend.onrender.com/api

## 🧪 Testing

Detailed API testing commands are available in the `postman_tests.md` file in the Backend directory.

## 📄 License

MIT License. See LICENSE for more details.

## 🙏 Acknowledgements

- [Plant.ID](https://web.plant.id/) for plant identification services
- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [Lucide Icons](https://lucide.dev/) for the beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities

