import { useAuth } from '~/lib/auth-context';

export function UserProfile() {
  const { user, signOut, isCreator } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-avatar">
          {user.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt={user.user_metadata.display_name || 'User'} 
            />
          ) : (
            <div className="avatar-placeholder">
              {(user.user_metadata?.display_name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="user-details">
          <h3>{user.user_metadata?.display_name || 'User'}</h3>
          <p className="user-email">{user.email}</p>
          {isCreator && (
            <span className="creator-badge">Creator</span>
          )}
        </div>
      </div>

      <div className="user-actions">
        <button className="profile-btn">Profile</button>
        {isCreator && (
          <button className="dashboard-btn">Dashboard</button>
        )}
        <button className="signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
