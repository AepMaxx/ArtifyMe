import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../lib/AppContext';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import './Password.css';

const Password: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useAppContext();
  const [loading, setLoading] = useState(false);

  const validationSchema = yup.object().shape({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords must match').required('Confirm password is required'),
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_DOTNET_API_URL || 'http://localhost:5000';
      const response = await axios.patch(`${apiUrl}/api/Auth/change-password`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (response.status === 200) {
        alert('Password changed successfully!');
        navigate('/profile');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`password-page ${theme}`}>
      <div className="password-container">
        <div className="password-card">
          <h2 className="password-title">Change Password</h2>
          <p className="password-subtitle">Update your account password</p>

          <Formik
            initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <Form className="password-form">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <Field
                  name="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  className="form-input"
                />
                <ErrorMessage name="currentPassword" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <Field
                  name="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  className="form-input"
                />
                <ErrorMessage name="newPassword" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <Field
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  className="form-input"
                />
                <ErrorMessage name="confirmPassword" component="div" className="error-text" />
              </div>

              <button type="submit" className="btn btn-primary password-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </Form>
          </Formik>

          <div className="password-footer">
            <Link to="/profile" className="link">
              ← Back to Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Password;
