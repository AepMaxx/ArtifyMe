# ArtifyMe Web Frontend

This is the React web version of ArtifyMe, converted from the original React Native mobile app.

## Features

- **Interactive Canvas**: Draw sketches with multiple brush sizes and colors
- **AI Image Generation**: Convert sketches to AI-generated images using Stable Diffusion
- **User Authentication**: Login/signup with JWT tokens
- **Artwork Management**: Save, view, edit, and delete artworks
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes
- **Modern UI**: Clean, intuitive interface

## Technology Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Formik & Yup** for form handling and validation
- **Axios** for API calls
- **CSS Modules** for styling
- **JWT Decode** for token management

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your API URLs:
   ```
   REACT_APP_DOTNET_API_URL=http://localhost:5000
   REACT_APP_FAST_API_URL=http://localhost:8000
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── shared/          # Common components (Header, TabBar, etc.)
│   ├── home/            # Home page components
│   └── forms/           # Form components
├── pages/               # Page components
├── lib/                 # Utilities and context
└── App.tsx              # Main app component
```

## Key Differences from React Native Version

1. **Navigation**: Uses React Router instead of Expo Router
2. **Styling**: CSS instead of StyleSheet
3. **Canvas**: HTML5 Canvas instead of SVG
4. **Storage**: localStorage instead of AsyncStorage
5. **Responsive**: CSS Grid/Flexbox for responsive design

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Notes

- The canvas drawing functionality uses HTML5 Canvas API
- Images are handled as base64 data URLs
- Theme switching persists in localStorage
- All API calls are made to the same backend as the mobile app
