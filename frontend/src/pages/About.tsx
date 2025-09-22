import React from 'react';
import { useAppContext } from '../lib/AppContext';
import './About.css';

const About: React.FC = () => {
  const { theme } = useAppContext();

  return (
    <div className={`about-page ${theme}`}>
      <div className="about-container">
        <h2 className="about-title">About ArtifyMe</h2>
        
        <div className="about-content">
          <div className="about-section">
            <h3>What is ArtifyMe?</h3>
            <p>
              ArtifyMe is a revolutionary web application that transforms your sketches into stunning AI-generated images. 
              Using advanced Stable Diffusion technology, we convert your drawings into beautiful, detailed artwork.
            </p>
          </div>

          <div className="about-section">
            <h3>How it Works</h3>
            <ol>
              <li>Draw your sketch on our interactive canvas</li>
              <li>Provide a description of what you want to create</li>
              <li>Our AI processes your sketch and generates a beautiful image</li>
              <li>Save and share your creations</li>
            </ol>
          </div>

          <div className="about-section">
            <h3>Features</h3>
            <ul>
              <li>Interactive drawing canvas with multiple brush sizes and colors</li>
              <li>AI-powered image generation using Stable Diffusion</li>
              <li>User authentication and artwork management</li>
              <li>Dark/Light theme support</li>
              <li>Responsive design for all devices</li>
            </ul>
          </div>

          <div className="about-section">
            <h3>Technology Stack</h3>
            <p>
              Built with React, TypeScript, .NET Core, Python FastAPI, and AWS S3 for a modern, 
              scalable experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
