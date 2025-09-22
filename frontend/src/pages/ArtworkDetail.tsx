import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../lib/AppContext';
import { getImageData, calculateTimeAgo } from '../lib/utils';
import axios from 'axios';
import './ArtworkDetail.css';

const ArtworkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useAppContext();
  const [artwork, setArtwork] = useState<any>(null);
  const [sketchImage, setSketchImage] = useState<string>('');
  const [aiImage, setAiImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtwork = async () => {
      if (!id) return;
      
      try {
        const apiUrl = process.env.REACT_APP_DOTNET_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/v1/Artwork/artwork?id=${id}`);
        
        if (response.status === 200) {
          setArtwork(response.data.artwork);
          
          // Load images
          if (response.data.artwork.sketchedImage) {
            const sketch = await getImageData(response.data.artwork.sketchedImage);
            if (sketch) setSketchImage(sketch);
          }
          
          if (response.data.artwork.aiImage) {
            const ai = await getImageData(response.data.artwork.aiImage);
            if (ai) setAiImage(ai);
          }
        }
      } catch (error) {
        console.error('Error fetching artwork:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  if (loading) {
    return (
      <div className={`artwork-detail-page ${theme}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading artwork...</p>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className={`artwork-detail-page ${theme}`}>
        <div className="error-container">
          <h2>Artwork Not Found</h2>
          <Link to="/" className="btn btn-primary">Back to Gallery</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`artwork-detail-page ${theme}`}>
      <div className="artwork-detail-container">
        <div className="artwork-header">
          <h2 className="artwork-title">{artwork.title}</h2>
          <Link to="/" className="back-btn">← Back to Gallery</Link>
        </div>

        <div className="artwork-content">
          <div className="artwork-images">
            <div className="image-section">
              <h3>Original Sketch</h3>
              <img src={sketchImage} alt="Sketch" className="artwork-image" />
            </div>
            
            <div className="image-section">
              <h3>AI Generated</h3>
              <img src={aiImage} alt="AI Generated" className="artwork-image" />
            </div>
          </div>

          <div className="artwork-info">
            <div className="artwork-description">
              <h3>Description</h3>
              <p>{artwork.description}</p>
            </div>

            <div className="artwork-meta">
              <div className="meta-item">
                <strong>Created:</strong> {calculateTimeAgo(artwork.creationDateTime)}
              </div>
              <div className="meta-item">
                <strong>Artist:</strong> {artwork.userEmail}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;
