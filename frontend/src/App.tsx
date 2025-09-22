import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './lib/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Create from './pages/Create';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Password from './pages/Password';
import About from './pages/About';
import Contact from './pages/Contact';
import Canvas from './pages/Canvas';
import ArtworkDetail from './pages/ArtworkDetail';
import EditArtwork from './pages/EditArtwork';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="create" element={<Create />} />
              <Route path="profile" element={<Profile />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="artwork/:id" element={<ArtworkDetail />} />
              <Route path="editartwork/:id" element={<EditArtwork />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/password" element={<Password />} />
            <Route path="/canvas" element={<Canvas />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
