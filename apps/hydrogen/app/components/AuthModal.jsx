import { useState } from 'react';
import { useAuth } from '~/lib/auth-context';

export function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    username: ''
  });
  const [formError, setFormError] = useState('');
  
  const { signUp, signIn, loading, error } = useAuth();

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.email || !formData.password) {
      setFormError('Email and password are required');
      return;
    }

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return;
      }

      if (!formData.displayName || !formData.username) {
        setFormError('Display name and username are required');
        return;
      }

      // Sign up
      const result = await signUp(formData.email, formData.password, {
        display_name: formData.displayName,
        username: formData.username,
        role: 'fan' // Default role
      });

      if (result.success) {
        // Show verification message instead of closing modal
        setVerificationEmail(formData.email);
        setShowVerificationMessage(true);
        setFormData({ email: '', password: '', confirmPassword: '', displayName: '', username: '' });
      }
    } else {
      // Sign in
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        onClose();
        setFormData({ email: '', password: '', confirmPassword: '', displayName: '', username: '' });
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormError('');
    setShowVerificationMessage(false);
    setFormData({ email: '', password: '', confirmPassword: '', displayName: '', username: '' });
  };

  const handleCloseModal = () => {
    setShowVerificationMessage(false);
    onClose();
  };

  return (
    <div className="auth-modal-overlay" onClick={handleCloseModal}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>
            {showVerificationMessage 
              ? 'Check Your Email' 
              : (isSignUp ? 'Join WornVault' : 'Welcome Back')
            }
          </h2>
          <button className="auth-modal-close" onClick={handleCloseModal}>×</button>
        </div>

        {showVerificationMessage ? (
          <div className="verification-message">
            <div className="verification-icon">📧</div>
            <h3>We've sent you a verification email!</h3>
            <p>
              Please check your email at <strong>{verificationEmail}</strong> and click the verification link to activate your account.
            </p>
            <p className="verification-note">
              Once verified, you can sign in with your credentials below.
            </p>
            
            <div className="verification-actions">
              <button 
                type="button" 
                className="auth-submit-btn"
                onClick={() => {
                  setShowVerificationMessage(false);
                  setIsSignUp(false); // Switch to sign in mode
                }}
              >
                I've verified my email - Sign In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {isSignUp && (
              <>
                <div className="form-group">
                  <label htmlFor="displayName">Display Name</label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Your display name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            {(formError || error) && (
              <div className="error-message">
                {formError || error}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>
        )}

        {!showVerificationMessage && (
          <div className="auth-modal-footer">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button 
                type="button" 
                className="auth-toggle-btn"
                onClick={toggleMode}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
