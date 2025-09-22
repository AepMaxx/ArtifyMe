import React, { useState, useEffect } from 'react';
import { Artwork } from '../../lib/types';
import { getImageData, calculateTimeAgo } from '../../lib/utils';
import './ArtworkRow.css';

interface ArtworkRowProps {
  artwork: Artwork;
}

const ArtworkRow: React.FC<ArtworkRowProps> = ({ artwork }) => {
  const [sketchImage, setSketchImage] = useState<string>('');
  const [aiImage, setAiImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        
        // Only load images if they exist
        if (artwork.sketchedImage) {
          const sketch = await getImageData(artwork.sketchedImage);
          if (sketch) setSketchImage(sketch);
        }
        
        if (artwork.aiImage) {
          const ai = await getImageData(artwork.aiImage);
          if (ai) setAiImage(ai);
        }
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [artwork.sketchedImage, artwork.aiImage]);

  if (loading) {
    return (
      <div className="artwork-row loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="artwork-row">
      <div className="artwork-images">
        {sketchImage && (
          <div className="image-container">
            <img src={sketchImage} alt="Sketch" className="artwork-image sketch" />
            <div className="image-label">Sketch</div>
          </div>
        )}
        {aiImage && (
          <div className="image-container">
            <img src={aiImage} alt="AI Generated" className="artwork-image ai" />
            <div className="image-label">AI Generated</div>
          </div>
        )}
      </div>
      <div className="artwork-info">
        <h3 className="artwork-title">{artwork.title}</h3>
        <p className="artwork-description">{artwork.description}</p>
        {artwork.mutatedPrompt && (
          <div className="mutated-prompt">
            <strong>Enhanced Prompt:</strong> {artwork.mutatedPrompt}
          </div>
        )}
        {artwork.appliedStyle && (
          <div className="applied-style">
            <strong>Style:</strong> {artwork.appliedStyle}
          </div>
        )}
        <div className="artwork-meta">
          <span className="artwork-time">{calculateTimeAgo(artwork.creationDateTime)}</span>
        </div>
      </div>
    </div>
  );
};

export default ArtworkRow;
