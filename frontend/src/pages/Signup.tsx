import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../lib/AppContext';
import { storeToken } from '../lib/utils';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import './Signup.css';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthenticated, theme } = useAppContext();
  const [loading, setLoading] = useState(false);

  const validationSchema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_DOTNET_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/Users/register`, {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      if (response.status === 201) {
        const { token } = response.data;
        storeToken(token);
        setAuthenticated(true);
        navigate('/');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`signup-page ${theme}`}>
      <div className="signup-container">
        <div className="signup-card">
          <h2 className="signup-title">Create Account</h2>
          <p className="signup-subtitle">Join ArtifyMe and start creating amazing art</p>

          <Formik
            initialValues={{ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <Form className="signup-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <Field
                    name="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    className="form-input"
                  />
                  <ErrorMessage name="firstName" component="div" className="error-text" />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <Field
                    name="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    className="form-input"
                  />
                  <ErrorMessage name="lastName" component="div" className="error-text" />
                </div>
              </div>

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

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <Field
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="form-input"
                />
                <ErrorMessage name="confirmPassword" component="div" className="error-text" />
              </div>

              <button type="submit" className="btn btn-primary signup-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </Form>
          </Formik>

          <div className="signup-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
