import React from 'react';
import { Link } from 'react-router-dom';
import { Artwork } from '../../lib/types';
import ArtworkRow from './ArtworkRow';
import './Gallery.css';

interface GalleryProps {
  artworks: Artwork[];
}

const Gallery: React.FC<GalleryProps> = ({ artworks }) => {
  return (
    <div className="gallery">
      <div className="gallery-grid">
        {artworks.map((artwork) => (
          <Link key={artwork.id} to={`/artwork/${artwork.id}`} className="artwork-link">
            <ArtworkRow artwork={artwork} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
