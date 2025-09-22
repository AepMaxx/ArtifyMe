import React from 'react';
import { Link } from 'react-router-dom';
import './EmptyGallery.css';

interface EmptyGalleryProps {
  auth: boolean;
}

const EmptyGallery: React.FC<EmptyGalleryProps> = ({ auth }) => {
  return (
    <div className="empty-gallery">
      <div className="empty-content">
        <div className="empty-icon">🎨</div>
        <h3 className="empty-title">No Artworks Yet</h3>
        <p className="empty-description">
          {auth 
            ? "Start creating amazing AI-generated art from your sketches!"
            : "Sign up to start creating and saving your AI-generated artworks!"
          }
        </p>
        {auth ? (
          <Link to="/create" className="btn btn-primary">
            Create Your First Artwork
          </Link>
        ) : (
          <Link to="/signup" className="btn btn-primary">
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmptyGallery;
