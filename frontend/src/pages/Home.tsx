import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../lib/AppContext';
import { getToken, getTokenSubject, isTokenExpired } from '../lib/utils';
import { Artwork } from '../lib/types';
import axios from 'axios';
import Gallery from '../components/home/Gallery';
import EmptyGallery from '../components/home/EmptyGallery';
import Pagination from '../components/shared/Pagination';
import './Home.css';

const Home: React.FC = () => {
  const { authenticated, newArtwork, deleted, updateArtwork, theme, authLoading } = useAppContext();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isNext, setIsNext] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const hasLoadedRef = useRef(false);

  const fetchArtworks = async (pageNumber: number = 1) => {
    const apiUrl = process.env.REACT_APP_DOTNET_API_URL || 'http://localhost:5000';
    const token = getToken();

    if (!token || isTokenExpired(token)) {
      console.log("No valid token found, skipping artwork fetch");
      setArtworks([]);
      return;
    }

    const userEmail = getTokenSubject(token);

    if (!userEmail) {
      setArtworks([]);
      return;
    }

    try {
      const response = await axios.get(
        `${apiUrl}/api/v1/Artwork/artworks?pageNumber=${pageNumber}&pageSize=${pageSize}&useremail=${userEmail}`
      );

      const data = response.data;
      if (response.status === 200) {
        setArtworks(data.content);
        setIsNext(data.isNext);
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error: any) {
      console.error("Error fetching artworks:", error);
      if (error.response?.status === 400) {
        console.error("Bad Request:", error.response?.data?.message || 'Invalid request parameters');
      }
      setArtworks([]);
    }
  };

  useEffect(() => {
    console.log('Home useEffect triggered - authenticated:', authenticated, 'authLoading:', authLoading, 'currentPage:', currentPage, 'hasLoaded:', hasLoadedRef.current);
    
    // Don't do anything while authentication is still loading
    if (authLoading) {
      console.log('Authentication still loading, skipping fetch');
      return;
    }
    
    if (authenticated) {
      // Only fetch if we haven't loaded yet or if it's a page change or data update
      if (!hasLoadedRef.current || currentPage !== 1 || newArtwork || deleted || updateArtwork) {
        console.log('Fetching artworks...');
        fetchArtworks(currentPage);
        hasLoadedRef.current = true;
      }
    } else {
      setArtworks([]);
      hasLoadedRef.current = false;
    }
  }, [authenticated, authLoading, currentPage, newArtwork, deleted, updateArtwork]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Show loading while authentication is in progress
  if (authLoading) {
    return (
      <div className={`home ${theme}`}>
        <div className="home-container">
          <h2 className="home-title">Gallery</h2>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`home ${theme}`}>
      <div className="home-container">
        <h2 className="home-title">Gallery</h2>
        {artworks.length === 0 ? (
          <EmptyGallery auth={authenticated} />
        ) : (
          <Gallery artworks={artworks} />
        )}
        {artworks.length > 0 && (
          <Pagination
            currentPage={currentPage}
            isNext={isNext}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
