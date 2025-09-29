import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '~/lib/auth-context';
import { AuthModal } from './AuthModal';
import { UserProfile } from './UserProfile';

export function AuthButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // Check for URL parameters to auto-open modal
  useEffect(() => {
    const action = searchParams.get('auth');
    if (action === 'signin' && !isAuthenticated) {
      setIsModalOpen(true);
      // Clean up URL parameter
      setSearchParams({});
    }
  }, [searchParams, isAuthenticated, setSearchParams]);

  const handleAuthClick = () => {
    if (!isAuthenticated) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (isAuthenticated) {
    return <UserProfile />;
  }

  return (
    <>
      <button className="auth-button" onClick={handleAuthClick}>
        Sign In / Sign Up
      </button>
      
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
}
