# ArtifyMe - AI Sketch to Image Generator

A modern, full-stack web application that transforms sketches into stunning AI-generated images using Stable Diffusion. Built with React, .NET Core, and Python FastAPI.

## Overview

ArtifyMe revolutionizes digital art creation by combining intuitive drawing tools with cutting-edge AI technology. Simply draw your sketch, describe your vision, and watch as our AI transforms it into beautiful, detailed artwork.

##  Architecture

The application consists of three seamlessly integrated components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Service    │
│   (React)       │◄──►│   (.NET Core)  │◄──►│   (FastAPI)     │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

##  Technology Stack

### Frontend
- **React 18** with TypeScript for modern, type-safe development
- **HTML5 Canvas** for interactive drawing experience
- **Formik + Yup** for robust form validation
- **Styled Components** for dynamic theming
- **React Router** for seamless navigation

### Backend
- **ASP.NET Core 8** with clean architecture patterns
- **JWT Authentication** for secure user sessions
- **Entity Framework Core** for data management
- **Swagger/OpenAPI** for comprehensive API documentation
- **CORS** configuration for cross-origin requests

### AI Service
- **FastAPI** for high-performance Python API
- **Stable Diffusion 2.1** for state-of-the-art image generation
- **PyTorch** with automatic GPU/CPU detection
- **PIL (Pillow)** for advanced image processing
- **Memory optimization** for efficient model loading

### Infrastructure
- **Microsoft SQL Server** for reliable data persistence
- **AWS S3** for scalable cloud storage
- **Docker-ready** for easy deployment


## Key Features

### **Interactive Drawing Canvas**
- **Multi-brush Support**: Choose from various brush sizes (2px to 10px)
- **Rich Color Palette**: 18 carefully selected colors for artistic expression
- **Advanced Tools**: Undo, clear, and precision drawing controls
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### **AI-Powered Image Generation**
- **Stable Diffusion 2.1**: Latest state-of-the-art model for superior results
- **Smart Processing**: Automatic device detection (GPU/CPU/MPS)
- **Memory Optimized**: Efficient resource usage with attention slicing
- **Fast Generation**: 10-60 seconds depending on hardware

### **User Management**
- **Secure Authentication**: JWT-based login system
- **Profile Management**: Complete user account functionality
- **Artwork Gallery**: Save, organize, and manage your creations
- **CRUD Operations**: Full create, read, update, delete functionality

### **User Experience**
- **Dark/Light Themes**: Automatic system detection with manual override
- **Form Validation**: Real-time input validation with helpful error messages
- **Loading States**: Clear feedback during AI processing
- **Error Handling**: Graceful error management with user-friendly messages
- **Responsive Design**: Optimized for all screen sizes

### **Modern Interface**
- **Intuitive Navigation**: Clean, user-friendly interface
- **Real-time Updates**: Dynamic state management across components
- **Accessibility**: WCAG-compliant design patterns
- **Performance**: Optimized for fast loading and smooth interactions 

## Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **.NET 8 SDK**
- **Python** (v3.8 or higher)
- **Git**

### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/tomyRomero/artifyme
cd artifyme

# Start all services with one command
start-all.bat  # Windows
# or
./start-all.sh  # Linux/macOS
```

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
cd backend
dotnet restore
dotnet build
dotnet run
```

#### 2. AI Service Setup
```bash
cd fastapi
python -m venv venv
venv\Scripts\activate  # Windows
# or source venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

## How to Use

1. **Open the Application**: Navigate to `http://localhost:3000`
2. **Create Artwork**: Click "Create" in the navigation
3. **Draw Your Sketch**: Use the interactive canvas to draw your vision
4. **Describe Your Art**: Fill in the title and description
5. **Generate**: Click "Generate" and wait for AI processing
6. **Enjoy**: View your AI-generated masterpiece!

## Configuration

### Environment Variables
Create `.env` file in the frontend directory:
```
REACT_APP_DOTNET_API_URL=http://localhost:5000
REACT_APP_FAST_API_URL=http://localhost:8000
```

### Backend Configuration
Update `backend/appsettings.json`:
```json
{
  "JwtSettings": {
    "Secret": "YourSuperSecretKeyThatIsAtLeast32CharactersLongForJWT!",
    "ExpiryInMinutes": 60
  },
  "ConnectionStrings": {
    "DefaultConnection": "Your SQL Server connection string"
  },
  "AWS": {
    "AccessKeyId": "Your AWS Access Key",
    "SecretKey": "Your AWS Secret Key",
    "Region": "us-east-2",
    "BucketName": "your-s3-bucket-name"
  }
}
```

## Performance Optimization

### GPU Acceleration
For faster AI generation, ensure you have:
- **NVIDIA GPU** with CUDA support
- **Apple Silicon Mac** with MPS support
- **Sufficient VRAM** (6GB+ recommended)

### System Requirements
- **Minimum**: 8GB RAM, CPU-only processing
- **Recommended**: 16GB RAM, NVIDIA GPU with 6GB+ VRAM
- **Optimal**: 32GB RAM, RTX 3080/4080 or better

## Screenshots

<div align="center">
  <img src="./images/home.png" alt="Home Screen" width="200" height="400">
  <img src="./images/canvas.png" alt="Canvas Screen" width="200" height="400">
  <img src="./images/create.png" alt="Create Screen" width="200" height="400">
  <img src="./images/results.png" alt="Results Screen" width="200" height="400">
</div>

##  Development

### Project Structure
```
artifyme/
├──  backend/          # .NET Core API
├──  fastapi/          # AI Service
├──  frontend/         # React App
├──  start-all.bat     # Startup scripts
└──  docs/             # Documentation
```

### API Endpoints

#### Backend (.NET Core)
- `GET /swagger` - API documentation
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/v1/Artwork/artworks` - Get user artworks
- `POST /api/v1/Artwork` - Save artwork

#### AI Service (FastAPI)
- `GET /health` - Service health check
- `GET /generate/text2img` - Generate from text prompt
- `POST /generate/img2img` - Generate from sketch (main feature)
