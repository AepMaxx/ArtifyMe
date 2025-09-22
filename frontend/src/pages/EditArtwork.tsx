import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../lib/AppContext';
import { getImageData } from '../lib/utils';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import './EditArtwork.css';

const EditArtwork: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, paths, setPaths } = useAppContext();
  const [artwork, setArtwork] = useState<any>(null);
  const [sketchImage, setSketchImage] = useState<string>('');
  const [aiImage, setAiImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const validationSchema = yup.object().shape({
    title: yup.string().required("Title is required").min(3, 'Title must be at least 3 characters long'),
    description: yup.string().required('Description is required').min(5, 'Description must be at least 5 characters long'),
  });

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
          
          // Set paths for editing
          if (response.data.artwork.paths) {
            setPaths(response.data.artwork.paths);
          }
        }
      } catch (error) {
        console.error('Error fetching artwork:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id, setPaths]);

  const handleSubmit = async (values: { title: string; description: string }) => {
    if (!artwork) return;
    
    setSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_DOTNET_API_URL || 'http://localhost:5000';
      
      const updateData: any = {
        title: values.title,
        description: values.description,
        sketchedImage: artwork.sketchedImage,
        aiImage: artwork.aiImage,
        paths: paths
      };

      const response = await axios.patch(`${apiUrl}/api/v1/Artwork/artwork?id=${id}`, updateData);
      
      if (response.status === 200) {
        alert('Artwork updated successfully!');
        navigate(`/artwork/${id}`);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update artwork');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`edit-artwork-page ${theme}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading artwork...</p>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className={`edit-artwork-page ${theme}`}>
        <div className="error-container">
          <h2>Artwork Not Found</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary">Back to Gallery</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`edit-artwork-page ${theme}`}>
      <div className="edit-artwork-container">
        <div className="edit-artwork-header">
          <h2 className="edit-artwork-title">Edit Artwork</h2>
          <button onClick={() => navigate(`/artwork/${id}`)} className="back-btn">← Back to Artwork</button>
        </div>

        <div className="edit-artwork-content">
          <div className="artwork-preview">
            <div className="preview-images">
              <div className="image-section">
                <h3>Original Sketch</h3>
                <img src={sketchImage} alt="Sketch" className="preview-image" />
              </div>
              
              <div className="image-section">
                <h3>AI Generated</h3>
                <img src={aiImage} alt="AI Generated" className="preview-image" />
              </div>
            </div>
          </div>

          <Formik
            initialValues={{
              title: artwork.title,
              description: artwork.description
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <Form className="edit-form">
              <div className="form-group">
                <label className="form-label">Title</label>
                <Field
                  name="title"
                  type="text"
                  className="form-input"
                />
                <ErrorMessage name="title" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <Field
                  name="description"
                  as="textarea"
                  className="form-input form-textarea"
                  rows={4}
                />
                <ErrorMessage name="description" component="div" className="error-text" />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => navigate(`/artwork/${id}`)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="loading-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default EditArtwork;
