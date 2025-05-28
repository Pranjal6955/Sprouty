# Sprouty API Testing Commands

This document contains curl commands to test all the API endpoints of the Sprouty backend application. You can run these commands in a terminal or import them into Postman.

## Base URL
Replace `http://localhost:5000` with your actual server URL if different.

## Authentication Endpoints

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5f8b77d213e3a2caef2b3",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5f8b77d213e3a2caef2b3",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Important: Using the Authentication Token

After registering or logging in, you'll receive a JWT token. Copy this token value and use it to replace `YOUR_TOKEN` in the authenticated requests below.

Example:
```bash
# If your token is eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZDVmOGI3N2QyMTNlM2EyY2FlZjJiMyIsImlhdCI6MTYyMzg1NzQ1NiwiZXhwIjoxNjI2NDQ5NDU2fQ.F3gm4bIZE8F4UxLu5OVH9AUzWDm_rF4DJW-WlNTJNxQ

# Then your request should look like:
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZDVmOGI3N2QyMTNlM2EyY2FlZjJiMyIsImlhdCI6MTYyMzg1NzQ1NiwiZXhwIjoxNjI2NDQ5NDU2fQ.F3gm4bIZE8F4UxLu5OVH9AUzWDm_rF4DJW-WlNTJNxQ"
```

### Verify Token
Use this endpoint to check if your token is valid:

```bash
curl -X GET http://localhost:5000/api/auth/verify-token \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "id": "60d5f8b77d213e3a2caef2b3",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f8b77d213e3a2caef2b3",
    "name": "Test User",
    "email": "test@example.com",
    "location": "",
    "preferences": {
      "darkMode": false,
      "notificationsEnabled": true,
      "emailNotifications": true,
      "pushNotifications": false
    },
    "avatar": "default-avatar.png",
    "createdAt": "2023-01-15T12:34:56.789Z"
  }
}
```

### Forgot Password
```bash
curl -X POST http://localhost:5000/api/auth/forgotpassword \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": "Password reset link sent to email",
  "resetToken": "5f7d8cb3a5e9f20a1c6..."
}
```

### Reset Password
```bash
curl -X PUT http://localhost:5000/api/auth/resetpassword/RESET_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newpassword123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Password reset successful"
}
```

## User Endpoints

### Get User Profile
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f8b77d213e3a2caef2b3",
    "name": "Test User",
    "email": "test@example.com",
    "location": "New York",
    "preferences": {
      "darkMode": true,
      "notificationsEnabled": true,
      "emailNotifications": true,
      "pushNotifications": false
    },
    "avatar": "default-avatar.png",
    "createdAt": "2023-01-15T12:34:56.789Z"
  }
}
```

### Update User Profile
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "location": "New York",
    "preferences": {
      "darkMode": true,
      "notificationsEnabled": true
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f8b77d213e3a2caef2b3",
    "name": "Updated Name",
    "email": "test@example.com",
    "location": "New York",
    "preferences": {
      "darkMode": true,
      "notificationsEnabled": true,
      "emailNotifications": true,
      "pushNotifications": false
    },
    "avatar": "default-avatar.png",
    "createdAt": "2023-01-15T12:34:56.789Z"
  }
}
```

### Update Password
```bash
curl -X PUT http://localhost:5000/api/users/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```

### Get User Stats
```bash
curl -X GET http://localhost:5000/api/users/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalPlants": 5,
    "upcomingReminders": 3,
    "plantsNeedingWater": 2
  }
}
```

### Delete Account
```bash
curl -X DELETE http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Account and all associated data deleted successfully"
  }
}
```

## Plant Endpoints

### Create a Plant
```bash
curl -X POST http://localhost:5000/api/plants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Snake Plant",
    "species": "Sansevieria trifasciata",
    "nickname": "My Office Plant",
    "location": "Indoor",
    "wateringFrequency": 14,
    "sunlightNeeds": "Low Light",
    "mainImage": "https://example.com/plant.jpg"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f8b77d213e3a2caef2b4",
    "name": "Snake Plant",
    "species": "Sansevieria trifasciata",
    "nickname": "My Office Plant",
    "location": "Indoor",
    "wateringFrequency": 14,
    "sunlightNeeds": "Low Light",
    "mainImage": "https://example.com/plant.jpg",
    "status": "Healthy",
    "user": "60d5f8b77d213e3a2caef2b3",
    "dateAdded": "2023-06-10T14:23:45.678Z",
    "careHistory": [],
    "growthMilestones": [],
    "goals": [],
    "needsWatering": true,
    "daysSinceWatered": null,
    "nextWateringDate": null,
    "createdAt": "2023-06-10T14:23:45.678Z",
    "updatedAt": "2023-06-10T14:23:45.678Z"
  }
}
```

### Get All Plants
```bash
curl -X GET http://localhost:5000/api/plants \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d5f8b77d213e3a2caef2b4",
      "name": "Snake Plant",
      "species": "Sansevieria trifasciata",
      "nickname": "My Office Plant",
      "location": "Indoor",
      "mainImage": "https://example.com/plant.jpg",
      "status": "Healthy",
      "needsWatering": true
    },
    {
      "_id": "60d5f8b77d213e3a2caef2b5",
      "name": "Monstera",
      "species": "Monstera deliciosa",
      "nickname": "Living Room Plant",
      "location": "Indoor",
      "mainImage": "https://example.com/monstera.jpg",
      "status": "Healthy",
      "needsWatering": false
    }
  ]
}
```

### Get a Specific Plant
```bash
curl -X GET http://localhost:5000/api/plants/PLANT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f8b77d213e3a2caef2b4",
    "name": "Snake Plant",
    "species": "Sansevieria trifasciata",
    "nickname": "My Office Plant",
    "location": "Indoor",
    "wateringFrequency": 14,
    "sunlightNeeds": "Low Light",
    "mainImage": "https://example.com/plant.jpg",
    "status": "Healthy",
    "user": "60d5f8b77d213e3a2caef2b3",
    "dateAdded": "2023-06-10T14:23:45.678Z",
    "careHistory": [
      {
        "actionType": "Watered",
        "date": "2023-06-15T10:30:00.000Z",
        "notes": "Gave it 200ml of water"
      }
    ],
    "needsWatering": false,
    "daysSinceWatered": 5,
    "nextWateringDate": "2023-06-29T10:30:00.000Z"
  }
}
```

### Update a Plant
```bash
curl -X PUT http://localhost:5000/api/plants/PLANT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "Updated Nickname",
    "notes": "This plant is growing well"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f8b77d213e3a2caef2b4",
    "name": "Snake Plant",
    "species": "Sansevieria trifasciata",
    "nickname": "Updated Nickname",
    "notes": "This plant is growing well",
    "location": "Indoor",
    "wateringFrequency": 14,
    "sunlightNeeds": "Low Light",
    "mainImage": "https://example.com/plant.jpg",
    "status": "Healthy",
    "user": "60d5f8b77d213e3a2caef2b3",
    "dateAdded": "2023-06-10T14:23:45.678Z",
    "careHistory": [
      {
        "actionType": "Watered",
        "date": "2023-06-15T10:30:00.000Z",
        "notes": "Gave it 200ml of water"
      }
    ],
    "needsWatering": false
  }
}
```

### Delete a Plant
```bash
curl -X DELETE http://localhost:5000/api/plants/PLANT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {}
}
```

### Update Plant Care History
```bash
curl -X PUT http://localhost:5000/api/plants/PLANT_ID/care \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "Watered",
    "notes": "Gave it 200ml of water"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f8b77d213e3a2caef2b4",
    "name": "Snake Plant",
    "careHistory": [
      {
        "actionType": "Watered",
        "date": "2023-06-20T15:45:30.123Z",
        "notes": "Gave it 200ml of water"
      },
      {
        "actionType": "Watered",
        "date": "2023-06-05T10:30:00.000Z",
        "notes": "Regular watering"
      }
    ],
    "lastWatered": "2023-06-20T15:45:30.123Z",
    "needsWatering": false,
    "nextWateringDate": "2023-07-04T15:45:30.123Z"
  }
}
```

### Add Growth Milestone
```bash
curl -X POST http://localhost:5000/api/plants/PLANT_ID/growth \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "height": 25,
    "notes": "Growing well after repotting",
    "imageUrl": "https://example.com/growth.jpg"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f8b77d213e3a2caef2b4",
    "name": "Snake Plant",
    "growthMilestones": [
      {
        "date": "2023-06-20T15:47:30.123Z",
        "height": 25,
        "notes": "Growing well after repotting",
        "imageUrl": "https://example.com/growth.jpg"
      }
    ]
  }
}
```

### Identify a Plant
```bash
curl -X POST http://localhost:5000/api/plants/identify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/unknown-plant.jpg"
  }'
```

# Alternative way to identify with base64 image
```bash
curl -X POST http://localhost:5000/api/plants/identify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "base64Image": "BASE64_ENCODED_IMAGE_DATA"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "result": {
      "classification": {
        "suggestions": [
          {
            "id": "123",
            "name": "Monstera deliciosa",
            "probability": 0.95,
            "details": {
              "common_names": ["Swiss cheese plant", "Split-leaf philodendron"],
              "description": "Monstera deliciosa is a species of flowering plant native to tropical forests of southern Mexico, south to Panama.",
              "taxonomy": {
                "class": "Liliopsida",
                "family": "Araceae",
                "genus": "Monstera"
              },
              "url": "https://en.wikipedia.org/wiki/Monstera_deliciosa"
            }
          }
        ]
      },
      "is_plant": {
        "probability": 0.99,
        "binary": true
      },
      "health_assessment": {
        "is_healthy": {
          "probability": 0.95,
          "binary": true
        }
      }
    }
  },
  "simplifiedData": {
    "scientificName": "Monstera deliciosa",
    "commonName": "Swiss cheese plant",
    "allCommonNames": ["Swiss cheese plant", "Split-leaf philodendron"],
    "confidence": 0.95,
    "description": "Monstera deliciosa is a species of flowering plant native to tropical forests of southern Mexico, south to Panama.",
    "taxonomy": {
      "class": "Liliopsida",
      "family": "Araceae",
      "genus": "Monstera"
    },
    "wikiUrl": "https://en.wikipedia.org/wiki/Monstera_deliciosa"
  }
}
```

## Reminder Endpoints

### Create a Reminder
```bash
curl -X POST http://localhost:5000/api/reminders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plant": "PLANT_ID",
    "type": "Watering",
    "title": "Water the Snake Plant",
    "description": "Give it a good soak",
    "scheduledDate": "2023-06-15T10:00:00Z",
    "recurring": true,
    "frequency": 14
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f8b77d213e3a2caef2c1",
    "plant": "60d5f8b77d213e3a2caef2b4",
    "user": "60d5f8b77d213e3a2caef2b3",
    "type": "Watering",
    "title": "Water the Snake Plant",
    "description": "Give it a good soak",
    "scheduledDate": "2023-06-15T10:00:00.000Z",
    "completed": false,
    "recurring": true,
    "frequency": 14,
    "active": true,
    "createdAt": "2023-06-01T09:45:23.456Z",
    "updatedAt": "2023-06-01T09:45:23.456Z"
  }
}
```

### Get All Reminders
```bash
curl -X GET http://localhost:5000/api/reminders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d5f8b77d213e3a2caef2c1",
      "plant": {
        "_id": "60d5f8b77d213e3a2caef2b4",
        "name": "Snake Plant",
        "mainImage": "https://example.com/plant.jpg"
      },
      "type": "Watering",
      "title": "Water the Snake Plant",
      "scheduledDate": "2023-06-15T10:00:00.000Z",
      "completed": false
    },
    {
      "_id": "60d5f8b77d213e3a2caef2c2",
      "plant": {
        "_id": "60d5f8b77d213e3a2caef2b5",
        "name": "Monstera",
        "mainImage": "https://example.com/monstera.jpg"
      },
      "type": "Fertilizing",
      "title": "Fertilize Monstera",
      "scheduledDate": "2023-06-20T10:00:00.000Z",
      "completed": false
    }
  ]
}
```

### Get Upcoming Reminders
```bash
curl -X GET http://localhost:5000/api/reminders/upcoming \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d5f8b77d213e3a2caef2c1",
      "plant": {
        "_id": "60d5f8b77d213e3a2caef2b4",
        "name": "Snake Plant",
        "mainImage": "https://example.com/plant.jpg"
      },
      "type": "Watering",
      "title": "Water the Snake Plant",
      "scheduledDate": "2023-06-15T10:00:00.000Z",
      "completed": false
    }
  ]
}
```

### Get a Specific Reminder
```bash
curl -X GET http://localhost:5000/api/reminders/REMINDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f8b77d213e3a2caef2c1",
    "plant": {
      "_id": "60d5f8b77d213e3a2caef2b4",
      "name": "Snake Plant",
      "mainImage": "https://example.com/plant.jpg"
    },
    "user": "60d5f8b77d213e3a2caef2b3",
    "type": "Watering",
    "title": "Water the Snake Plant",
    "description": "Give it a good soak",
    "scheduledDate": "2023-06-15T10:00:00.000Z",
    "completed": false,
    "recurring": true,
    "frequency": 14,
    "active": true,
    "createdAt": "2023-06-01T09:45:23.456Z",
    "updatedAt": "2023-06-01T09:45:23.456Z"
  }
}
```

### Update a Reminder
```bash
curl -X PUT http://localhost:5000/api/reminders/REMINDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "description": "Updated description",
    "active": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f8b77d213e3a2caef2c1",
    "plant": "60d5f8b77d213e3a2caef2b4",
    "user": "60d5f8b77d213e3a2caef2b3",
    "type": "Watering",
    "title": "Updated title",
    "description": "Updated description",
    "scheduledDate": "2023-06-15T10:00:00.000Z",
    "completed": false,
    "recurring": true,
    "frequency": 14,
    "active": true,
    "createdAt": "2023-06-01T09:45:23.456Z",
    "updatedAt": "2023-06-10T11:22:33.456Z"
  }
}
```

### Delete a Reminder
```bash
curl -X DELETE http://localhost:5000/api/reminders/REMINDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {}
}
```

### Complete a Reminder
```bash
curl -X PUT http://localhost:5000/api/reminders/REMINDER_ID/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f8b77d213e3a2caef2c1",
    "plant": "60d5f8b77d213e3a2caef2b4",
    "user": "60d5f8b77d213e3a2caef2b3",
    "type": "Watering",
    "title": "Water the Snake Plant",
    "completed": true,
    "completedDate": "2023-06-15T11:30:45.678Z",
    "scheduledDate": "2023-06-29T10:00:00.000Z",
    "recurring": true,
    "frequency": 14,
    "active": true
  }
}
```

## Weather Endpoints

### Get Weather Data
```bash
curl -X GET http://localhost:5000/api/weather \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -G \
  -d "location=New York"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "location": "New York",
    "country": "US",
    "temperature": 23.5,
    "feels_like": 24.2,
    "humidity": 65,
    "description": "partly cloudy",
    "icon": "04d",
    "wind_speed": 3.6,
    "clouds": 40,
    "timestamp": "2023-06-15T14:30:45.678Z"
  }
}
```

### Get Weather Recommendations
```bash
curl -X GET http://localhost:5000/api/weather/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -G \
  -d "location=New York"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "weather": {
      "temperature": 23.5,
      "humidity": 65,
      "windSpeed": 3.6,
      "description": "partly cloudy"
    },
    "recommendations": {
      "watering": "Current humidity levels are moderate. Maintain your regular watering schedule.",
      "sunlight": "It's cloudy today. Your shade plants will be comfortable, but sun-loving plants might need supplemental light.",
      "general": "Weather conditions are favorable for most plants today."
    }
  }
}
```

### Get Weather Forecast
```bash
curl -X GET http://localhost:5000/api/weather/forecast \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -G \
  -d "location=New York"
```

**Expected Response:**
```json
{
  "success": true,
  "location": "New York",
  "country": "US",
  "data": [
    {
      "time": "2023-06-15 18:00:00",
      "temperature": 24.2,
      "humidity": 60,
      "conditions": "Clear",
      "icon": "01d"
    },
    {
      "time": "2023-06-16 00:00:00",
      "temperature": 19.5,
      "humidity": 75,
      "conditions": "Clear",
      "icon": "01n"
    },
    {
      "time": "2023-06-16 06:00:00",
      "temperature": 17.8,
      "humidity": 80,
      "conditions": "Clear",
      "icon": "01n"
    },
    {
      "time": "2023-06-16 12:00:00",
      "temperature": 22.4,
      "humidity": 65,
      "conditions": "Partly cloudy",
      "icon": "02d"
    },
    {
      "time": "2023-06-16 18:00:00",
      "temperature": 25.7,
      "humidity": 55,
      "conditions": "Partly cloudy",
      "icon": "02d"
    }
  ]
}
```

## File Upload Examples

### Upload Single Image (Plant Image)
```bash
curl -X POST http://localhost:5000/api/plants/PLANT_ID/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://storage.googleapis.com/sprouty-app.appspot.com/uploads/60d5f8b77d213e3a2caef2b3/1623857412345-plant-image.jpg",
    "plant": {
      "_id": "60d5f8b77d213e3a2caef2b4",
      "name": "Snake Plant",
      "mainImage": "https://storage.googleapis.com/sprouty-app.appspot.com/uploads/60d5f8b77d213e3a2caef2b3/1623857412345-plant-image.jpg"
    }
  }
}
```

### Upload Multiple Images
```bash
curl -X POST http://localhost:5000/api/plants/PLANT_ID/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "urls": [
      "https://storage.googleapis.com/sprouty-app.appspot.com/uploads/60d5f8b77d213e3a2caef2b3/1623857456789-image1.jpg",
      "https://storage.googleapis.com/sprouty-app.appspot.com/uploads/60d5f8b77d213e3a2caef2b3/1623857456790-image2.jpg"
    ],
    "plant": {
      "_id": "60d5f8b77d213e3a2caef2b4",
      "name": "Snake Plant",
      "images": [
        {
          "url": "https://storage.googleapis.com/sprouty-app.appspot.com/uploads/60d5f8b77d213e3a2caef2b3/1623857456789-image1.jpg",
          "uploadedAt": "2023-06-16T14:30:56.789Z"
        },
        {
          "url": "https://storage.googleapis.com/sprouty-app.appspot.com/uploads/60d5f8b77d213e3a2caef2b3/1623857456790-image2.jpg",
          "uploadedAt": "2023-06-16T14:30:56.790Z"
        }
      ]
    }
  }
}
```

## Notes for Using the API

1. Replace `YOUR_TOKEN` with the JWT token received from login or register
2. Replace `PLANT_ID` and `REMINDER_ID` with actual IDs from your database
3. Adjust date formats as needed
4. For file uploads, replace `/path/to/image.jpg` with the actual path to your image file

## Plant Disease Diagnosis Endpoints

### Diagnose Plant Disease (Health Assessment)
Uses Plant.ID Health Assessment API for comprehensive disease and pest detection.

```bash
curl -X POST http://localhost:5000/api/diagnosis/diagnose \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plantId": "PLANT_ID",
    "base64Image": "BASE64_ENCODED_IMAGE_DATA",
    "notes": "Plant showing brown spots on leaves"
  }'
```

**Example with image URL:**
```bash
curl -X POST http://localhost:5000/api/diagnosis/diagnose \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plantId": "PLANT_ID",
    "imageUrl": "https://example.com/plant-image.jpg",
    "notes": "Suspicious spots appearing on leaves"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "diagnosis": {
      "_id": "60d5f8b77d213e3a2caef2d1",
      "plant": "60d5f8b77d213e3a2caef2b4",
      "user": "60d5f8b77d213e3a2caef2b3",
      "isHealthy": false,
      "healthProbability": 0.3,
      "diseases": [
        {
          "name": "Leaf spot disease",
          "common_names": ["Brown spot", "Leaf blight"],
          "probability": 0.85,
          "severity": "high",
          "description": "Fungal disease causing brown spots on leaves",
          "cause": "High humidity and poor air circulation",
          "treatment": {
            "chemical": "Apply copper-based fungicide",
            "organic": "Use neem oil treatment",
            "cultural": "Improve air circulation; Water at soil level"
          },
          "prevention": "Ensure good air circulation and avoid overhead watering",
          "classification": ["Fungal", "Leaf disease"]
        }
      ],
      "recommendations": {
        "immediate_actions": [
          "Isolate plant immediately to prevent spread",
          "Remove severely affected plant parts",
          "Apply appropriate treatment as soon as possible"
        ],
        "preventive_measures": [
          "Ensure proper air circulation around plant",
          "Avoid overhead watering when possible"
        ],
        "treatment_priority": "high"
      }
    },
    "summary": {
      "isHealthy": false,
      "diseaseCount": 1,
      "pestCount": 0,
      "overallHealth": "critical",
      "treatmentPriority": "high"
    },
    "serviceInfo": {
      "usingMockData": false,
      "apiAvailable": true
    }
  }
}
```

**Response when image doesn't contain a plant:**
```json
{
  "success": false,
  "error": "The uploaded image does not appear to contain a plant. Please upload a clear image of a plant."
}
```

**Response when using mock data (no API key):**
```json
{
  "success": true,
  "data": {
    "diagnosis": {
      "diseases": [
        {
          "name": "Leaf spot disease",
          "description": "This is a mock disease diagnosis result. Please configure your Plant.ID API key to get real disease identification results."
        }
      ]
    },
    "serviceInfo": {
      "usingMockData": true,
      "apiAvailable": false
    }
  }
}
```

### Environment Variables Required

For the disease diagnosis feature to work with real data, add this to your `.env` file:

```bash
# Plant.ID API for Disease Diagnosis
# Get your API key from: https://web.plant.id/
PLANT_ID_API_KEY=your_plant_id_api_key_here
```

### API Key Setup Instructions

1. Go to [https://web.plant.id/](https://web.plant.id/)
2. Sign up for an account
3. Choose a plan (they offer free tier with limited requests)
4. Get your API key from the dashboard
5. Add it to your `.env` file as `PLANT_ID_API_KEY=your_key_here`
6. Restart your server

### Supported Image Formats and Requirements

- **Formats**: JPG, PNG, WebP
- **Size limit**: 5MB maximum
- **Resolution**: Minimum 256x256 pixels recommended
- **Content**: Image should clearly show the plant or affected plant parts
- **Quality**: Clear, well-lit images work best
