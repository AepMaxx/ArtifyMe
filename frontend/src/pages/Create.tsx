import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../lib/AppContext';
import { getToken, getTokenSubject, isTokenExpired } from '../lib/utils';
import { MutationStyle } from '../lib/types';
import PromptMutationPanel from '../components/shared/PromptMutationPanel';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage, useField } from 'formik';
import * as yup from 'yup';
import './Create.css';

// Custom DescriptionField component to handle both Formik and custom state
const DescriptionField: React.FC<{ onDescriptionChange: (value: string) => void; theme: string }> = ({ onDescriptionChange, theme }) => {
  const [field, meta, helpers] = useField('description');
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    helpers.setValue(value); // Update Formik state
    onDescriptionChange(value); // Update our custom state
  };

  const isDark = theme === 'dark';

  return (
    <>
      <textarea
        {...field}
        placeholder="Provide a description of your drawing!"
        className="form-input form-textarea"
        style={{
          color: isDark ? '#fff' : '#333',
          backgroundColor: isDark ? '#2a2a2a' : '#fff',
          border: `1px solid ${isDark ? '#555' : '#ddd'}`,
          borderRadius: '8px',
          padding: '12px',
          fontSize: '16px',
          width: '100%',
          minHeight: '100px',
          resize: 'vertical'
        }}
        onChange={handleChange}
      />
      {meta.touched && meta.error && (
        <div className="error-text">{meta.error}</div>
      )}
    </>
  );
};

const Create: React.FC = () => {
  const navigate = useNavigate();
  const { paths, authenticated, theme } = useAppContext();
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [mutatedPrompt, setMutatedPrompt] = useState<string>('');
  const [appliedStyle, setAppliedStyle] = useState<MutationStyle | null>(null);
  const [hasAppliedMutation, setHasAppliedMutation] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<{ description: string; title: string } | null>(null);
  const mutatedPromptRef = useRef<string>('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authenticated) {
      navigate('/login');
    }
  }, [authenticated, navigate]);

  // Monitor mutatedPrompt changes
  useEffect(() => {
    console.log('=== MUTATED PROMPT STATE CHANGED ===');
    console.log('New mutatedPrompt:', mutatedPrompt);
    console.log('hasAppliedMutation:', hasAppliedMutation);
    console.log('====================================');
  }, [mutatedPrompt, hasAppliedMutation]);

  const validationSchema = yup.object().shape({
    title: yup.string().required("Title is required").min(3, 'Title must be at least 3 characters long'),
    description: yup.string().required('Description is required').min(5, 'Description must be at least 5 characters long'),
  });

  const saveAsPNG = async (): Promise<string> => {
    // Create a canvas element to render the SVG paths
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');

    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    paths.forEach((path: any) => {
      if (path.points && path.points.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
      }
    });

    return canvas.toDataURL('image/png');
  };

  const saveArtwork = async ({ token, sketchedImage, aiImage, description, title, mutatedPrompt, appliedStyle }: {
    token: string;
    sketchedImage: string;
    aiImage: string;
    description: string;
    title: string;
    mutatedPrompt?: string;
    appliedStyle?: MutationStyle | null;
  }) => {
    try {
      if (isTokenExpired(token)) {
        alert("Login Credentials invalid/expired, login again");
        return;
      }

      const apiUrl = process.env.REACT_APP_DOTNET_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/api/v1/Artwork`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: getTokenSubject(token),
          sketchedImage: sketchedImage,
          aiImage: aiImage,
          description: description,
          title: title,
          mutatedPrompt: mutatedPrompt,
          appliedStyle: appliedStyle,
          paths: paths
        })
      });

      if (response.ok) {
        console.log('Artwork saved successfully');
        const responseData = await response.json();
        console.log(responseData.message);
      } else {
        const responseData = await response.json();
        console.error('save artwork error:', responseData.message);
        alert(`Failed to save artwork to database: ${responseData.message}`);
      }
    } catch (error) {
      console.error('save artwork error:', error);
      alert('Failed to save artwork to database');
    }
  };

  const generateImage = async (formValues: { description: string; title: string }) => {
    try {
      setLoading(true);
      const { description, title } = formValues;

      // Check if paths is empty
      if (paths.length === 0) {
        alert('Please draw something to continue.');
        setLoading(false);
        return;
      }

      const sketchbase64 = await saveAsPNG();

      // Generate AI Image using mutated prompt
      const apiUrl = process.env.REACT_APP_FAST_API_URL || 'http://localhost:8000';
      const finalPrompt = mutatedPromptRef.current || description;
      // Use mutated prompt if available, otherwise use original description
      
      const response = await axios.post(`${apiUrl}/generate/img2img`, {
        base64_image: sketchbase64,
        prompt: finalPrompt,
      });

      if (response.status === 200) {
        console.log("AI Image success");
        const { base64_image } = response.data;
        
        // Set the generated image (works for both authenticated and non-authenticated users)
        setGeneratedImage(base64_image);
        
        // If user is authenticated, offer to save the artwork
        if (authenticated) {
          const token = getToken();
          if (token) {
            // For now, we'll save the base64 images directly since S3 is disabled
            // In a production environment, you'd want to upload to S3 or another storage service
            try {
              await saveArtwork({
                token,
                sketchedImage: sketchbase64, // Using base64 directly since S3 is disabled
                aiImage: base64_image,
                description: description,
                title: title,
                mutatedPrompt: mutatedPrompt,
                appliedStyle: appliedStyle
              });
              // Show success message
              setTimeout(() => {
                alert('🎉 Artwork saved to your gallery!');
              }, 1000);
            } catch (error) {
              console.error('Failed to save artwork:', error);
            }
          }
        }
      } else {
        alert("Was not able to generate AI Image, Please Try Again");
        console.error('Error:', response.status);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error:', error);
      alert("Failed to generate image. Please try again.");
    }
    setLoading(false);
  };

  const submitForm = async (formValues: { description: string; title: string }) => {
    setPendingFormValues(formValues);
    // Don't generate image immediately - wait for prompt mutation
  };

  const handlePromptMutated = async (prompt: string, style: MutationStyle) => {
    setMutatedPrompt(prompt);
    mutatedPromptRef.current = prompt; // Update ref immediately
    setAppliedStyle(style);
    setHasAppliedMutation(true);
    
    // If we have pending form values, generate the image now
    if (pendingFormValues) {
      await generateImage(pendingFormValues);
      setPendingFormValues(null); // Clear pending values
    }
  };

  const handleDescriptionChange = (value: string) => {
    setCurrentPrompt(value);
    
    // Only update mutatedPrompt if no mutation has been applied yet
    if (!hasAppliedMutation) {
      setMutatedPrompt(value);
      mutatedPromptRef.current = value; // Update ref
    }
  };

  return (
    <div className={`create-page ${theme}`}>
      <div className="create-container">
        <h2 className="create-title">Create Artwork</h2>
        
        <Formik
          initialValues={{
            description: '',
            title: ''
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) => {
            console.log('Form submitted with values:', values);
            console.log('Current mutatedPrompt state:', mutatedPrompt);
            submitForm(values);
            // Don't reset form immediately - let the success handler do it
          }}
        >
          {({ values, errors, touched }) => (
            <Form className="create-form">
              {!generatedImage && (
                <>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <Field
                      name="title"
                      type="text"
                      placeholder="Provide a title for your artwork!"
                      className="form-input"
                    />
                    <ErrorMessage name="title" component="div" className="error-text" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <DescriptionField onDescriptionChange={handleDescriptionChange} theme={theme} />
                  </div>

                  {currentPrompt && (
                    <PromptMutationPanel
                      originalPrompt={currentPrompt}
                      onPromptMutated={handlePromptMutated}
                      theme={theme}
                    />
                  )}
                </>
              )}

              {!generatedImage && (
                <Link to="/canvas" className="canvas-link">
                  <div className="canvas-preview">
                    <div className="preview-text">
                      <h3>Draw me</h3>
                      <p>Any sketches you create will be transformed into images using artificial intelligence (AI), Happy sketching! 🎨✨</p>
                    </div>
                  </div>
                </Link>
              )}

              {generatedImage && (
                <div className="result-container">
                  <h3>Generated Image</h3>
                  <img src={generatedImage} alt="Generated" className="generated-image" />
                  <div className="result-actions">
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => {
                        setGeneratedImage(null);
                        setHasAppliedMutation(false);
                        setMutatedPrompt('');
                        mutatedPromptRef.current = '';
                        setAppliedStyle(null);
                      }}
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              )}

              {!generatedImage && !loading && !pendingFormValues && (
                <button type="submit" className="btn btn-primary submit-btn">
                  Generate AI Artwork
                </button>
              )}

              {pendingFormValues && !hasAppliedMutation && (
                <div className="pending-generation">
                  <p>Form submitted! You can now enhance your prompt or generate the image directly.</p>
                  <div className="pending-actions">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => generateImage(pendingFormValues)}
                    >
                      Generate Image Now
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => setPendingFormValues(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}


              {loading && (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Generating your artwork...</p>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Create;
