import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '~/lib/auth-context';

/**
 * Handle email verification redirects
 * This route processes the verification link from Supabase emails
 */
export default function AuthVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Check if user is already authenticated
    if (user && !loading) {
      // User is already logged in, redirect to home
      navigate('/?auth=signin', { replace: true });
      return;
    }

    // If not authenticated, redirect to home with signin parameter
    // This will trigger the AuthButton to open the signin modal
    if (!loading) {
      navigate('/?auth=signin', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth state
  return (
    <div className="auth-verify-loading">
      <div className="loading-spinner"></div>
      <p>Verifying your email...</p>
    </div>
  );
}
