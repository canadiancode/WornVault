/**
 * Main API exports
 * Centralized access to all API functions
 */

// Creator API
export {
  getCreators,
  getCreatorById,
  getCreatorByUsername,
  createCreator,
  updateCreator,
  deleteCreator,
  searchCreators
} from './creators.js';

// Posts API
export {
  getPosts,
  getPostsByCreator,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  getTrendingPosts
} from './posts.js';

// Social API
export {
  // Likes
  likePost,
  unlikePost,
  isPostLiked,
  
  // Follows
  followCreator,
  unfollowCreator,
  isFollowing,
  getFollowers,
  getFollowing,
  
  // Comments
  addComment,
  getComments,
  
  // Shares
  sharePost
} from './social.js';

// Storage API
export {
  uploadFile,
  getPublicUrl,
  uploadCreatorAvatar,
  uploadPostImages,
  deleteFile,
  listFiles,
  resizeImage,
  getOptimizedImageUrl
} from './storage.js';

/**
 * API Response Helper
 * Standardizes API responses across all functions
 */
export class ApiResponse {
  constructor(success, data = null, error = null, hasMore = false) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.hasMore = hasMore;
    this.timestamp = new Date().toISOString();
  }

  static success(data, hasMore = false) {
    return new ApiResponse(true, data, null, hasMore);
  }

  static error(error, data = null) {
    return new ApiResponse(false, data, error, false);
  }
}

/**
 * Error handling utility
 */
export function handleApiError(error, context = 'API call') {
  console.error(`${context} error:`, error);
  
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Validation utilities
 */
export const validators = {
  isUuid: (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  },

  isUsername: (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    return usernameRegex.test(username);
  },

  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPrice: (price) => {
    return typeof price === 'number' && price > 0 && price < 1000000;
  }
};
