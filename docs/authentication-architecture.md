# WornVault Authentication Architecture

## Overview

WornVault uses a **dual authentication system** to separate social interactions from business operations.

## Authentication Strategy

### Phase 1: Supabase Authentication (Current)

- **All users** (fans + creators) sign up with Supabase
- **Social features**: Likes, comments, shares, follows, activity feeds
- **User profiles**: Bio, social links, verification status
- **Real-time features**: Live updates, notifications

### Phase 2: Shopify Integration (Future)

- **Creator upgrade**: Fans can become creators by linking Shopify accounts
- **Business features**: Payments, orders, tax reporting, analytics
- **Creator dashboard**: Combined social + sales metrics
- **Separate notifications**: Social vs business notifications

## User Types

### Fans (Default Role)

- Sign up with Supabase
- Browse, like, comment, share posts
- Follow creators
- View activity feeds
- Can upgrade to creator status

### Creators

- Start as fans, then upgrade to creator
- All fan features + ability to post items
- Unified public profile (social + business)
- Private dashboard with sales analytics
- Separate business notifications

## Technical Implementation

### Database Schema

- `creators` table: Stores both fan and creator profiles
- `supabase_user_id`: Links to Supabase auth users
- `role`: 'fan' or 'creator'
- `is_creator`: Boolean flag for creator status
- RLS policies: Secure data access based on user roles

### API Layer

- Supabase auth for user management
- Custom API functions for creator operations
- Role-based permissions and access control
- Future: Shopify integration for business operations

### UI/UX Flow

1. **Fan signup**: Simple email/password registration
2. **Creator upgrade**: In-app process (no redirects)
3. **Unified profiles**: Public social + business info on same page
4. **Separate dashboards**: Private creator analytics

## Benefits of This Approach

### ✅ Advantages

- **Clear separation**: Social vs business concerns
- **Lower barrier**: Fans can engage without committing to selling
- **Scalable**: Handle millions of fans with thousands of creators
- **Flexible**: Easy to add features to either system
- **User-friendly**: Smooth upgrade path from fan to creator

### 🔄 Complexity Management

- **Medium complexity**: Well-defined boundaries make it manageable
- **Clean architecture**: Each system handles what it does best
- **Future-proof**: Can evolve each system independently

## Implementation Status

### ✅ Completed (Phase 1)

- Supabase authentication system
- User role management (fan/creator)
- Login/signup UI components
- Database schema updates
- API integration
- Homepage integration

### 🔄 Next Steps

- Test authentication flow
- Build creator profile pages
- Add social interaction features
- Create activity feed system

### 🚀 Future (Phase 2)

- Shopify customer integration
- Creator upgrade flow
- Unified dashboard
- Payment processing
- Business analytics

## Key Decisions Made

1. **No redirects**: All auth flows happen in-app
2. **Unified profiles**: Public social + business info together
3. **Separate notifications**: Social vs business notifications
4. **Role-based UI**: Different experiences for fans vs creators
5. **Supabase-first**: Start with social features, add business later

## Files Created/Modified

### Authentication System

- `app/lib/supabase.js` - Enhanced Supabase client with auth helpers
- `app/lib/auth-context.jsx` - React context for auth state
- `app/components/AuthModal.jsx` - Login/signup modal
- `app/components/UserProfile.jsx` - User profile display
- `app/components/AuthButton.jsx` - Auth button component

### Database

- `docs/database-updates.sql` - Schema updates for user roles
- `docs/database-schema.md` - Complete database documentation

### Styling

- `app/styles/app.css` - Authentication component styles
- Homepage header styling

### Integration

- `app/root.jsx` - Added AuthProvider
- `app/routes/_index.jsx` - Added auth button to homepage
- `app/lib/api/creators.js` - Updated for user roles
- `app/lib/api/index.js` - Exported new functions
