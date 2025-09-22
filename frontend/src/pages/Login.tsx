import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../lib/AppContext';
import { storeToken } from '../lib/utils';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthenticated, theme } = useAppContext();
  const [loading, setLoading] = useState(false);

  const validationSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required'),
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_DOTNET_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/Auth/login`, values);

      if (response.status === 200) {
        const { token } = response.data;
        storeToken(token);
        setAuthenticated(true);
        navigate('/');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-page ${theme}`}>
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your ArtifyMe account</p>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <Form className="login-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <Field
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="form-input"
                />
                <ErrorMessage name="email" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <Field
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="form-input"
                />
                <ErrorMessage name="password" component="div" className="error-text" />
              </div>

              <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </Form>
          </Formik>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="link">
                Sign up
              </Link>
            </p>
            <Link to="/password" className="link">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
