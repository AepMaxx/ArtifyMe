import React from 'react';
import { useAppContext } from '../lib/AppContext';
import './Contact.css';

const Contact: React.FC = () => {
  const { theme } = useAppContext();

  return (
    <div className={`contact-page ${theme}`}>
      <div className="contact-container">
        <h2 className="contact-title">Contact Us</h2>
        
        <div className="contact-content">
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <p>
              Have questions about ArtifyMe? Want to provide feedback or report an issue? 
              We'd love to hear from you!
            </p>
            
            <div className="contact-details">
              <div className="contact-item">
                <strong>Email:</strong> tomyfletcher99@hotmail.com
              </div>
              <div className="contact-item">
                <strong>LinkedIn:</strong> 
                <a href="https://www.linkedin.com/in/tomy-romero-902476145/" target="_blank" rel="noopener noreferrer">
                  Tomy Romero
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <h3>Send us a Message</h3>
            <form>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" placeholder="Your name" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="Your email" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input form-textarea" placeholder="Your message" rows={5}></textarea>
              </div>
              
              <button type="submit" className="btn btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
